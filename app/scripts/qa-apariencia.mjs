// ============================================================
// BLINK POS · Prueba del cambio de apariencia
// ------------------------------------------------------------
// Comprueba que el selector de Ajustes funciona:
//   · al elegir "Oscuro" la pagina se pone oscura al instante;
//   · la preferencia se recuerda al recargar;
//   · "Automático" vuelve a seguir al sistema.
//
// Uso:  node scripts/qa-apariencia.mjs
// ============================================================
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.VERIFY_BASE || "http://localhost:5173";

const HALLAZGOS = [];
const Add = (nivel, msg) => {
  HALLAZGOS.push({ nivel, msg });
  console.log(`  ${nivel === "FALLO" ? "!!" : nivel === "AVISO" ? "~~" : "ok"} ${msg}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
const page = await ctx.newPage();

const errores = [];
page.on("pageerror", (e) => errores.push("PAGEERROR " + String(e.message).slice(0, 140)));
page.on("console", (m) => {
  if (m.type() === "error") errores.push("CONSOLE " + m.text().slice(0, 140));
});

const fondo = () =>
  page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    const m = (cs.backgroundColor.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const lum = 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2];
    return { oscuro: lum < 60, colorScheme: document.documentElement.style.colorScheme, clase: document.documentElement.className };
  });

/* --- Sesion local (bypass) con el alta ya hecha --- */
// Se escribe el flag directamente: `?bypass=1` solo lo consume cuando el
// chunk de la app ya cargo, y aqui la navegacion siguiente partia antes
// de ese momento, asi que el bypass nunca se armaba y Ajustes desviaba
// al login. El estado vive por usuario (`blink-pos-state-v3:<id>`), y sin
// `onboarding.completed` la app manda al alta guiada en vez de Ajustes.
await page.addInitScript(() => {
  window.localStorage.setItem("blink-temp-bypass", "1");
  window.localStorage.setItem(
    "blink-pos-state-v3:temp-bypass-user",
    JSON.stringify({ onboarding: { completed: true } })
  );
});

/* --- Entrar con el bypass y abrir Ajustes > Apariencia --- */
await page.goto(BASE + "/app/ajustes", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".tabs button", { timeout: 60000 });

const abierta = await page.evaluate(() => {
  const b = [...document.querySelectorAll(".tabs button")].find((x) =>
    (x.textContent || "").trim() === "Apariencia"
  );
  if (!b) return false;
  b.click();
  return true;
});
await page.waitForTimeout(700);
if (!abierta) {
  Add("FALLO", "no se encuentra la pestana Apariencia");
} else {
  Add("ok", "pestana Apariencia encontrada");
}

const antes = await fondo();
if (antes.oscuro) Add("AVISO", "la app arranca en oscuro (el sistema lo pide)");

/* --- Elegir "Oscuro" --- */
await page.evaluate(() => {
  const b = [...document.querySelectorAll(".tabs button, .k-segmented button, .temaslider__label")].find(
    (x) => (x.textContent || "").trim() === "Oscuro"
  );
  b && b.click();
});
await page.waitForTimeout(700);
const oscuro = await fondo();
if (!oscuro.oscuro) Add("FALLO", "al elegir Oscuro la pagina no se pone oscura");
else Add("ok", `al elegir Oscuro la pagina se pone oscura (color-scheme: ${oscuro.colorScheme})`);
if (!oscuro.clase.includes("dark")) {
  Add("FALLO", "no se activo la clase 'dark' de Konsta");
} else {
  Add("ok", "clase 'dark' activada (variantes oscuras de Konsta)");
}

/* --- La preferencia se recuerda al recargar --- */
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector(".tabs button", { timeout: 45000 }).catch(() => {});
await page.waitForTimeout(400);
const trasRecarga = await fondo();
if (!trasRecarga.oscuro) Add("FALLO", "la preferencia no se recuerda al recargar");
else Add("ok", "la preferencia se recuerda al recargar");

/* --- Volver a "Automático" --- */
await page.goto(BASE + "/app/ajustes", { waitUntil: "networkidle" });
await page.waitForSelector(".tabs button", { timeout: 45000 }).catch(() => {});
await page.waitForTimeout(400);
await page.evaluate(() => {
  const t = [...document.querySelectorAll(".tabs button")].find((x) =>
    (x.textContent || "").trim() === "Apariencia"
  );
  t && t.click();
});
await page.waitForTimeout(600);
await page.evaluate(() => {
  const b = [...document.querySelectorAll(".tabs button, .k-segmented button, .temaslider__auto")].find(
    (x) => (x.textContent || "").trim() === "Automático"
  );
  b && b.click();
});
await page.waitForTimeout(700);
const auto = await fondo();
if (auto.colorScheme !== "light dark") {
  Add("FALLO", `Automatico no vuelve a seguir al sistema (color-scheme: ${auto.colorScheme})`);
} else {
  Add("ok", "Automatico vuelve a seguir al sistema");
}

if (errores.length) Add("FALLO", "errores de consola: " + errores.slice(0, 2).join(" | "));

const fallos = HALLAZGOS.filter((h) => h.nivel === "FALLO");
/* Los "ok" son comprobaciones, no avisos: contarlos como avisos hacia
   creer que hay cinco problemas donde no hay ninguno. */
const avisos = HALLAZGOS.filter((h) => h.nivel !== "ok" && h.nivel !== "FALLO");
console.log(`\nComprobaciones: ${HALLAZGOS.length} · Fallos: ${fallos.length} · Avisos: ${avisos.length}`);
await browser.close();
process.exit(fallos.length ? 1 : 0);
