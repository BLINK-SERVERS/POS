// ============================================================
// BLINK POS · Capturas de la app real para la landing
// ------------------------------------------------------------
// Levanta la aplicación con el estado de `estado-demo.mjs` —sin
// cuenta, sin Supabase y sin red externa— y fotografía las nueve
// pantallas que consume `src/pages/Landing.tsx`, en el tamaño de
// píxel exacto que declaran sus `<img>`.
//
// Todo lo que sale de aquí es la app de verdad: la misma hoja de
// estilos, la misma SF Pro de desarrollo y el mismo componente de
// ticket. No se compone nada a mano.
//
// Uso:
//   node scripts/capturar-landing.mjs                  → .capturas-landing/ (borrador)
//   node scripts/capturar-landing.mjs --aplicar        → src/assets/landing/*.webp
//   node scripts/capturar-landing.mjs --solo pos-venta,pos-cuenta
//   node scripts/capturar-landing.mjs --build         → sobre el build de producción
//   VERIFY_BASE=http://localhost:5173 node scripts/capturar-landing.mjs
//
// Con VERIFY_BASE no se arranca nada: se captura sobre ese servidor
// (útil con `npm run dev` ya abierto). Sin `--build` se captura sobre
// el servidor de desarrollo, que es el único que sirve la SF Pro
// local de `app/.fonts-sf-local/`; en producción la app usa la fuente
// del sistema y las capturas saldrían en Inter.
//
// Las capturas se escriben primero en `.capturas-landing/` para
// revisarlas. `--aplicar` es lo único que toca `src/assets/landing/`.
// ============================================================
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { estadoDemo } from "./estado-demo.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");
const BORRADOR = path.join(APP, ".capturas-landing");
const DESTINO = path.join(APP, "src/assets/landing");

/* Las claves las fija la app; se repiten aquí a propósito —igual que en
   los qa-*.mjs— para no importar TypeScript desde Node. */
const CLAVE = {
  estado: "blink-pos-state-v3",
  drafts: "blink-pos-drafts-v1",
  tab: "blink-pos-active-tab-v1",
  tasa: "blink:rate-cache-v1",
  bypass: "blink-temp-bypass",
  tema: "blink-tema",
  instalacion: "blink.pos.instalacion",
};

/** La cuenta que se fotografía: cuatro fichas del catálogo de ejemplo. */
const CUENTA = ["COCA COLA 1.5 L", "ARROZ BLANCO 1 KG", "QUESO BLANCO 500 G", "HARINA DE TRIGO 1 KG"];

/**
 * Las nueve piezas de la landing. `final` son los píxeles que esperan
 * los `<img>` de `Landing.tsx`; el viewport sale de dividirlos por la
 * escala, así que la captura nace con ese tamaño y no se deforma.
 * `listo` es el selector que tiene que estar pintado **antes** de la
 * acción (`escribir`/`accion`): cada acción espera su propio resultado.
 */
const PLAN = [
  {
    nombre: "pos-venta",
    ruta: "/app/ventas",
    final: [2000, 1250],
    // 1600×1000 lógicos: por debajo de ~1100 px de ancho la grilla de
    // `.pos` apila el catálogo sobre la cuenta y el ticket se sale del
    // fotograma. 1600 mantiene las dos columnas y el Cobrar visible.
    escala: 1.25,
    escribir: "le",
    listo: ".ticket .ticket__line",
    etiqueta: "Vender (escritorio): búsqueda predictiva abierta y la cuenta de cuatro productos con su total",
  },
  {
    nombre: "pos-cuenta",
    ruta: "/app/ventas",
    final: [730, 1300],
    escala: 2,
    viewport: [1200, 900],
    elemento: ".ticket",
    listo: ".ticket .ticket__line",
    etiqueta: "Solo el panel de la cuenta: líneas, subtotal, IVA, total en Bs y el botón Cobrar",
  },
  {
    nombre: "pos-catalogo",
    ruta: "/app/catalogo",
    final: [1800, 1125],
    escala: 1.5,
    listo: "h1, h2",
    etiqueta: "Catálogo (escritorio): fichas con precio en USD y Bs, margen y stock",
  },
  {
    nombre: "pos-historial",
    ruta: "/app/ventas/historial",
    final: [1800, 1125],
    escala: 1.5,
    listo: ".kpi",
    etiqueta: "Historial de ventas (escritorio): vendido del día, ticket promedio y la lista de operaciones",
  },
  {
    nombre: "pos-movil-venta",
    ruta: "/app/ventas",
    final: [780, 1688],
    escala: 2,
    listo: ".ticket .ticket__line",
    desplazar: ".ticket .btn--primary",
    etiqueta: "Vender en el celular: cuenta abierta y botón Cobrar sobre la barra de pestañas",
  },
  {
    nombre: "pos-movil",
    ruta: "/app/ventas",
    final: [780, 1688],
    escala: 2,
    escribir: "le",
    listo: ".ticket .ticket__line",
    etiqueta: "Vender en el celular con la búsqueda predictiva abierta (consulta «le»)",
  },
  {
    nombre: "pos-movil-catalogo",
    ruta: "/app/catalogo",
    final: [780, 1688],
    escala: 2,
    listo: "h1, h2",
    etiqueta: "Catálogo en el celular: tarjetas de ficha con precio, margen y stock",
  },
  {
    nombre: "pos-movil-cobrar",
    ruta: "/app/ventas",
    final: [780, 1688],
    escala: 2,
    accion: "cobrar",
    listo: ".ticket .ticket__line",
    etiqueta: "Hoja de Cobrar en el celular: cliente, desglose, IGTF y métodos de pago",
  },
  {
    nombre: "pos-movil-historial",
    ruta: "/app/ventas/historial",
    final: [780, 1688],
    escala: 2,
    listo: ".kpi",
    etiqueta: "Historial en el celular: resumen del día y detalle de la última venta",
  },
];

/* ------------------------------------------------------------------ *
 * Argumentos
 * ------------------------------------------------------------------ */
const argv = process.argv.slice(2);
const bandera = (n) => argv.includes(`--${n}`);
const solo = (() => {
  const i = argv.indexOf("--solo");
  return i === -1 ? null : argv[i + 1].split(",").map((s) => s.trim().replace(/^pos-/, "pos-"));
})();
const plan = solo ? PLAN.filter((p) => solo.includes(p.nombre)) : PLAN;
if (!plan.length) {
  console.error(`Ninguna captura coincide con --solo ${solo.join(",")}.`);
  console.error(`Disponibles: ${PLAN.map((p) => p.nombre).join(", ")}`);
  process.exit(2);
}

/* ------------------------------------------------------------------ *
 * Semilla: el estado de ejemplo + la cuenta + la tasa fijada
 * ------------------------------------------------------------------ */
function semilla() {
  const estado = estadoDemo();
  const lineas = CUENTA.map((nombre) => {
    const p = estado.products.find((x) => x.name === nombre);
    if (!p) throw new Error(`El catálogo de ejemplo no tiene «${nombre}».`);
    return {
      productId: p.id,
      name: p.name,
      presentation: `${p.presentationQty} ${p.unit}`,
      qty: 1,
      price: p.price,
      cost: p.cost,
      taxRate: p.taxRate,
    };
  });
  return {
    estado,
    drafts: [{ id: "tab-captura", lines: lineas, notes: "", discountId: "", surchargeIds: [], customerId: "" }],
    tab: "tab-captura",
    // La caché se escribe "ahora mismo": así `isCacheFresh()` gana y la app
    // no consulta la API de dólar. Sin esto las capturas cambian de Bs a Bs
    // según el día y el total del ticket no cuadra con el catálogo.
    tasa: { rate: estado.rate, updatedAt: estado.rateUpdatedAt },
  };
}

const SEMILLA = semilla();

/* ------------------------------------------------------------------ *
 * Utilidades
 * ------------------------------------------------------------------ */
function medirWebp(b) {
  if (b.length < 30 || b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") return null;
  const cuatro = b.toString("ascii", 12, 16);
  if (cuatro === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (cuatro === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (cuatro === "VP8L") {
    const x = b.readUInt32LE(21);
    return { w: (x & 0x3fff) + 1, h: ((x >> 14) & 0x3fff) + 1 };
  }
  return null;
}

/** PNG → WebP con el propio Chromium (canvas), recortando por arriba y centrado en x. */
async function aWebp(browser, png, [w, h], calidad = 0.82) {
  const pagina = await browser.newPage();
  const salida = await pagina.evaluate(
    async ({ b64, w, h, q }) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      const k = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * k;
      const dh = img.naturalHeight * k;
      ctx.imageSmoothingEnabled = k < 1;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, (w - dw) / 2, Math.min(0, h - dh), dw, dh);
      const url = c.toDataURL("image/webp", q);
      return { url, mime: url.slice(5, url.indexOf(";")), natural: [img.naturalWidth, img.naturalHeight] };
    },
    { b64: png.toString("base64"), w, h, q: calidad },
  );
  await pagina.close();
  if (!salida.mime.startsWith("image/webp")) {
    throw new Error("Este Chromium no codifica WebP en canvas; no se puede generar la captura.");
  }
  return { buffer: Buffer.from(salida.url.split(",")[1], "base64"), natural: salida.natural };
}

/** Servidor de la app: reutiliza VERIFY_BASE, si no arranca vite (dev o build+preview). */
async function levantar() {
  if (process.env.VERIFY_BASE) {
    const base = process.env.VERIFY_BASE.replace(/\/$/, "");
    console.log(`Se usa el servidor de afuera: ${base}`);
    return { base, cerrar: async () => {} };
  }
  const vite = await import("vite");
  const opciones = { configFile: path.join(APP, "vite.config.ts"), root: APP, logLevel: "warn" };
  const puerto = Number(process.env.CAPTURAS_PUERTO || 5199);

  if (bandera("build")) {
    console.log("Construyendo para producción (la tipografía será la del sistema)…");
    await vite.build(opciones);
    const srv = await vite.preview({ ...opciones, preview: { port: puerto, strictPort: false } });
    return { base: srv.resolvedUrls.local[0].replace(/\/$/, ""), cerrar: () => srv.httpServer.close() };
  }

  const srv = await vite.createServer({ ...opciones, server: { port: puerto, strictPort: false } });
  await srv.listen();
  return { base: srv.resolvedUrls.local[0].replace(/\/$/, ""), cerrar: () => srv.close() };
}

/* ------------------------------------------------------------------ *
 * Una captura
 * ------------------------------------------------------------------ */
async function capturar(browser, base, p) {
  const [ancho, alto] = p.final;
  const escala = p.escala ?? 2;
  const [vw, vh] = p.viewport ?? [Math.round(ancho / escala), Math.round(alto / escala)];

  const ctx = await browser.newContext({
    viewport: { width: vw, height: vh },
    deviceScaleFactor: escala,
    colorScheme: "light",
    reducedMotion: "reduce",
    timezoneId: "America/Caracas",
    locale: "es-VE",
  });

  // Nada de red externa: la tasa, Supabase y cualquier otro host se cortan.
  // Las capturas tienen que salir idénticas hoy y dentro de un mes.
  await ctx.route("**/*", (ruta) => {
    const host = new URL(ruta.request().url()).hostname;
    return host === "localhost" || host === "127.0.0.1" ? ruta.continue() : ruta.abort();
  });

  await ctx.addInitScript(({ clave, semilla }) => {
    try {
      localStorage.setItem(clave.estado, JSON.stringify(semilla.estado));
      localStorage.setItem(clave.drafts, JSON.stringify(semilla.drafts));
      localStorage.setItem(clave.tab, semilla.tab);
      localStorage.setItem(clave.tasa, JSON.stringify({ ...semilla.tasa, fetchedAt: new Date().toISOString() }));
      localStorage.setItem(clave.bypass, "1");
      localStorage.setItem(clave.tema, "light");
      localStorage.setItem(clave.instalacion, String(Date.now()));
    } catch {
      /* sin localStorage: la app arrancaría vacía y el paso fallaría al esperar */
    }
  }, { clave: CLAVE, semilla: SEMILLA });

  const page = await ctx.newPage();
  const errores = [];
  page.on("pageerror", (e) => errores.push(String(e.message).slice(0, 120)));

  // El bypass se consume entrando a /entrar, igual que en las pruebas.
  await page.goto(base + "/app/entrar?bypass=1", { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.goto(base + p.ruta, { waitUntil: "domcontentloaded", timeout: 90_000 });
  // 60 s: con `--solo` la primera ruta puede caer en frío y Vite tarda en
  // transformar el chunk de la página; con 30 s la corrida se caía a medias.
  await page.waitForSelector(p.listo, { timeout: 60_000 });

  if (p.escribir) {
    // Konsta no deja la clase del Searchbar en el <input>: se busca por su
    // propio placeholder, que es lo único estable del buscador del POS.
    await page.locator('input[placeholder*="Buscar"]').first().fill(p.escribir);
    await page.waitForSelector(".search-results", { timeout: 10_000 });
  }
  if (p.accion === "cobrar") {
    await page.getByRole("button", { name: /Cobrar/ }).first().click();
    await page.waitForSelector(".sheet__title", { timeout: 10_000 });
  }
  if (p.desplazar) {
    // En el celular la cabecera de Vender (título, chips y buscador) empuja
    // la cuenta fuera del fotograma: se baja hasta el botón para que la
    // captura muestre el total y el Cobrar, que es lo que vende.
    await page.locator(p.desplazar).first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
  }

  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const png = p.elemento
    ? await page.locator(p.elemento).first().screenshot()
    : await page.screenshot({ clip: { x: 0, y: 0, width: vw, height: vh } });

  await ctx.close();
  return { png, errores };
}

/* ------------------------------------------------------------------ *
 * Ejecución
 * ------------------------------------------------------------------ */
const lanzador = { headless: true };
if (process.env.CHROMIUM_PATH) lanzador.executablePath = process.env.CHROMIUM_PATH;
else if (fs.existsSync("/usr/bin/chromium")) lanzador.executablePath = "/usr/bin/chromium";

const { base, cerrar } = await levantar();
const browser = await chromium.launch(lanzador);
fs.mkdirSync(BORRADOR, { recursive: true });

console.log(`\nBlink POS · ${plan.length} captura(s) para la landing`);
console.log(`Cuenta fotografiada: ${CUENTA.length} productos · tasa fijada ${SEMILLA.tasa.rate}\n`);

const resultados = [];
const fallidas = [];
for (const p of plan) {
  const t0 = Date.now();
  try {
    const { png, errores } = await capturar(browser, base, p);
    const { buffer, natural } = await aWebp(browser, png, p.final);
    const archivo = path.join(BORRADOR, `${p.nombre}.webp`);
    fs.writeFileSync(archivo, buffer);

    const vigente = path.join(DESTINO, `${p.nombre}.webp`);
    const antes = fs.existsSync(vigente) ? medirWebp(fs.readFileSync(vigente)) : null;
    const despues = medirWebp(buffer);
    const desvio = p.elemento ? Math.abs(natural[0] / natural[1] - p.final[0] / p.final[1]) : 0;

    resultados.push({ p, archivo, buffer, vigente, antes });
    console.log(
      `  ${p.nombre.padEnd(19)} ${String(despues.w).padStart(4)}×${despues.h}  ${(buffer.length / 1024)
        .toFixed(0)
        .padStart(4)} KB  ${antes ? `antes ${antes.w}×${antes.h}` : "nueva"}  ${((Date.now() - t0) / 1000).toFixed(1)}s`,
    );
    if (p.elemento) {
      console.log(
        `     ${desvio > 0.01 ? "!" : "·"}  ${p.elemento} mide ${natural[0]}×${natural[1]} en pantalla; se recorta a ${p.final.join("×")}`,
      );
    }
    if (errores.length) console.log(`     !  errores de página: ${errores.join(" · ")}`);
  } catch (e) {
    // Una captura mala no tira las otras ocho: se reporta al final.
    fallidas.push({ nombre: p.nombre, msg: String(e.message).split("\n")[0] });
    console.log(`  ${p.nombre.padEnd(19)} FALLO  ${fallidas.at(-1).msg}`);
  }
}

if (bandera("aplicar")) {
  if (!fallidas.length) {
    console.log("\nAplicando a src/assets/landing/…");
    for (const r of resultados) {
      fs.copyFileSync(r.archivo, r.vigente);
      console.log(`  ${path.relative(APP, r.vigente)}  (antes ${r.antes ? r.antes.w + "×" + r.antes.h : "—"})`);
    }
  } else {
    console.log("\nNo se aplica nada: hay capturas fallidas. Corrige y vuelve a correr.");
  }
} else {
  console.log(`\nBorrador en ${path.relative(APP, BORRADOR)}/ — revisa y corre con --aplicar.`);
}

await browser.close();
await cerrar();
if (fallidas.length) process.exit(1);
