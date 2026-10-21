// ============================================================
// BLINK POS · Comprobación de la cuenta real de pruebas
// ------------------------------------------------------------
// Entra en la app con el usuario de QA sembrado en Supabase
// (sin bypass) y comprueba que:
//
//   · el acceso funciona (correo confirmado, sin pasarela de pago);
//   · el comercio hidratado trae los datos sembrados;
//   · las fichas del catálogo global son visibles;
//   · no hay errores de consola.
//
// Es la prueba de extremo a extremo del flujo real:Supabase →
// `businesses.data` → store → interfaz.
//
// Uso:
//   npm run qa:seed            (siembra el comercio de pruebas)
//   node scripts/qa-cuenta.mjs
// ============================================================
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.VERIFY_BASE || "http://localhost:5173";
const EMAIL = process.env.QA_EMAIL || "qa.blink@tienda.local";
const PASSWORD = process.env.QA_PASSWORD || "ClavePrueba123";

const HALLAZGOS = [];
const Add = (nivel, msg) => {
  HALLAZGOS.push({ nivel, msg });
  console.log(`  ${nivel === "FALLO" ? "!!" : nivel === "AVISO" ? "~~" : "ok"} ${msg}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
const page = await ctx.newPage();

const errores = [];
page.on("pageerror", (e) => errores.push("PAGEERROR " + String(e.message).slice(0, 160)));
page.on("console", (m) => {
  if (m.type() === "error") errores.push("CONSOLE " + m.text().slice(0, 160));
});

console.log(`== Acceso con la cuenta QA real (${EMAIL}) ==\n`);

await page.goto(BASE + "/app/entrar", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);

const acceso = await page.evaluate(() => ({
  url: location.pathname,
  bypass: localStorage.getItem("blink-temp-bypass"),
  iconos: document.querySelectorAll("svg.icon").length,
  vacios: [...document.querySelectorAll("svg.icon")].filter((s) => !s.querySelector("path")).length,
}));

if (acceso.bypass) {
  Add("FALLO", "el acceso ha usado el bypass en vez de la cuenta real");
} else {
  Add("ok", "acceso con la cuenta real (sin bypass)");
}
if (!acceso.url.startsWith("/app")) {
  Add("FALLO", "no se entro en la aplicacion (url: " + acceso.url + ")");
} else {
  Add("ok", `la aplicacion se abrio en ${acceso.url}`);
}
if (acceso.vacios) Add("FALLO", `${acceso.vacios} iconos vacios`);
if (errores.length) Add("FALLO", "errores de consola: " + errores.slice(0, 2).join(" | "));
errores.length = 0;

/* Los datos sembrados tienen que verse en cada vista. */
const ESPERA = [
  ["/app/catalogo", "catalogo", /ARROZ BLANCO|JABON DE MANO|ARROZ/],
  ["/app/contactos", "contactos", /Maria Gomez|Pedro Ramirez|Distribuidora/],
  ["/app/finanzas", "finanzas", /Caja principal|Banco Banesco/],
  ["/app/ventas/historial", "historial", /QA-0001/],
];

for (const [ruta, etiqueta, patron] of ESPERA) {
  await page.goto(BASE + ruta, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(2500);
  const d = await page.evaluate(() => ({
    texto: (document.body.innerText || "").replace(/\s+/g, " "),
    filas: document.querySelectorAll("table.data tbody tr").length,
  }));
  if (patron.test(d.texto)) {
    Add("ok", `${etiqueta}: datos sembrados visibles (${d.filas} filas)`);
  } else {
    Add("FALLO", `${etiqueta}: no se ven los datos sembrados (${d.filas} filas)`);
  }
  if (errores.length) {
    Add("FALLO", `${etiqueta}: errores de consola: ` + errores.slice(0, 2).join(" | "));
    errores.length = 0;
  }
}

/* El catálogo global se lee de `catalogo_global`. */
await page.goto(BASE + "/app/catalogo", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const global = await page.evaluate(() => {
  const t = (document.body.innerText || "").replace(/\s+/g, " ");
  return {
    fichas: (t.match(/ARROZ BLANCO 1 KG|JABON DE MANO 400 ML|DETERGENTE 3 KG|COCA COLA 1\.5 L/g) || []).length,
  };
});
if (global.fichas > 0) Add("ok", `catálogo global: ${global.fichas} fichas visibles`);
else Add("AVISO", "catálogo global: no se ven fichas globales en la lista");

const fallos = HALLAZGOS.filter((h) => h.nivel === "FALLO");
const avisos = HALLAZGOS.filter((h) => h.nivel === "AVISO");
const correctos = HALLAZGOS.length - fallos.length - avisos.length;
console.log(`\nCorrectos: ${correctos} · Fallos: ${fallos.length} · Avisos: ${avisos.length}`);
await browser.close();
process.exit(fallos.length ? 1 : 0);
