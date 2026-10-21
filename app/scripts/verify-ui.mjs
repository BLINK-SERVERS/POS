/**
 * Verificación visual de todas las vistas: render, tipografía, iconos,
 * desbordamiento horizontal y errores de consola.
 *
 * Se recorre la app en DOS tamaños:
 *   · escritorio  1280 x 860  → capturas `<vista>.png`
 *   · móvil       390 x 844   → capturas `<vista>-movil.png`
 *
 * Uso:  npm run verify:ui
 * Requiere el servidor de desarrollo en :5173.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "..", "verify-shots");
const BASE = process.env.VERIFY_BASE || "http://localhost:5173";

const RUTAS = [
  ["/", "landing"],
  ["/app/terminos", "terminos"],
  ["/app/privacidad", "privacidad"],
  ["/app/inicio", "inicio"],
  ["/app/ventas", "ventas"],
  ["/app/ventas/historial", "historial"],
  ["/app/catalogo", "catalogo"],
  ["/app/inventario", "inventario"],
  ["/app/contactos", "contactos"],
  ["/app/finanzas", "finanzas"],
  ["/app/informes", "informes"],
  ["/app/ajustes", "ajustes"],
  ["/escaner", "escaner"],
];

/** Tamanos a verificar. `sufijo` se anade al nombre de la captura. */
const VISTAS = [
  { id: "escritorio", sufijo: "", width: 1280, height: 860 },
  { id: "movil", sufijo: "-movil", width: 390, height: 844 },
];

const PRODUCTOS = [
  { id: "p1", name: "AZUCAR KONFIT 1kg", sku: "SKU-001", barcode: "7801234567890", category: "Alimentos", brand: "ALIMENTOS POLAR", presentationQty: 1, unit: "kg", cost: 0.9, price: 2, stock: 24, minStock: 6, trackStock: true, active: true, archived: false },
  { id: "p2", name: "MALTA RETORNABLE 222ml", sku: "SKU-002", barcode: "7801234567891", category: "Bebidas", brand: "CERVECERIAS", presentationQty: 222, unit: "ml", cost: 0.6, price: 1.5, stock: 3, minStock: 12, trackStock: true, active: true, archived: false },
  { id: "p3", name: "PAPEL DE ALUMINIO TUC", sku: "SKU-003", barcode: "7801234567892", category: "Hogar", brand: "TUC", presentationQty: 1, unit: "unidad", cost: 3.1, price: 4.8, stock: 0, minStock: 4, trackStock: true, active: true, archived: false },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
let problemas = 0;
let erroresTotales = 0;

for (const vista of VISTAS) {
  console.log(`\n=== ${vista.id} (${vista.width}x${vista.height}) ===`);

  const ctx = await browser.newContext({
    viewport: { width: vista.width, height: vista.height },
    colorScheme: "light",
    isMobile: vista.id === "movil",
    hasTouch: vista.id === "movil",
  });
  const page = await ctx.newPage();

  const errores = [];
  page.on("pageerror", (e) => errores.push("PAGEERROR " + String(e.message).slice(0, 130)));
  page.on("console", (m) => { if (m.type() === "error") errores.push("CONSOLE " + m.text().slice(0, 130)); });

  await page.addInitScript((productos) => {
    const KEY = "blink-pos-state-v3";
    const patch = () => {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return;
        const st = JSON.parse(raw);
        if (st.onboarding) st.onboarding.completed = true;
        if (!st.products || st.products.length === 0) st.products = productos;
        localStorage.setItem(KEY, JSON.stringify(st));
      } catch {}
    };
    patch();
    window.addEventListener("DOMContentLoaded", patch);
  }, PRODUCTOS);

  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-reduced-transparency", value: "no-preference" },
      { name: "prefers-reduced-motion", value: "no-preference" },
    ],
  });

  await page.goto(BASE + "/app/entrar?bypass=1", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1400);

  for (const [ruta, nombre] of RUTAS) {
    const antes = errores.length;
    await page.goto(BASE + ruta, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(1200);

    const info = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      const svgs = [...document.querySelectorAll("svg.icon")];
      // Elementos que se salen por la derecha del documento.
      const ancho = document.documentElement.clientWidth;
      const desbordados = [...document.querySelectorAll("body *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.right > ancho + 2 && getComputedStyle(el).position !== "fixed";
        })
        .slice(0, 4)
        .map((el) => (el.tagName + "." + (el.className || "").toString().split(" ")[0]).slice(0, 44));
      // Elementos con poco texto pero mucha altura: casi siempre es un
      // choque de clases (un `height: 100vh` heredado por error).
      const gigantes = [...document.querySelectorAll("body *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.height < 220 || el.children.length > 0) return false;
          const t = (el.textContent || "").trim();
          return t.length > 0 && t.length < 14;
        })
        .slice(0, 4)
        .map(
          (el) =>
            (el.tagName + "." + String(el.className || "").split(" ")[0]).slice(0, 28) +
            " h=" + Math.round(el.getBoundingClientRect().height)
        );
      return {
        h1Size: h1 ? getComputedStyle(h1).fontSize : null,
        iconos: svgs.length,
        iconosVacios: svgs.filter((s) => !s.querySelector("path")).length,
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
        desbordados,
        gigantes,
      };
    });

    const nuevos = errores.length - antes;
    const ok = !info.overflowX && info.iconosVacios === 0 && nuevos === 0;
    if (!ok) problemas++;
    console.log(
      `${ok ? "OK " : "!! "} ${nombre.padEnd(12)} h1=${String(info.h1Size).padEnd(6)} iconos=${String(info.iconos).padStart(2)} (vacios ${info.iconosVacios}) overflowX=${info.overflowX} errores=${nuevos}` +
        (info.desbordados.length ? "  DESBORDA: " + info.desbordados.join(", ") : "") +
        (info.gigantes.length ? "  ALTO: " + info.gigantes.join(", ") : "")
    );
    await page.screenshot({ path: path.join(OUT, nombre + vista.sufijo + ".png") });
  }

  erroresTotales += errores.length;
  for (const e of [...new Set(errores)].slice(0, 6)) console.log("  " + e);
  await ctx.close();

  // --- Onboarding ---
  // El gate de onboarding redirige a Inicio si el alta ya esta hecha, asi
  // que hace falta un contexto aparte con `onboarding.completed = false`.
  const ctxOnb = await browser.newContext({
    viewport: { width: vista.width, height: vista.height },
    colorScheme: "light",
    isMobile: vista.id === "movil",
    hasTouch: vista.id === "movil",
  });
  const pageOnb = await ctxOnb.newPage();
  const erroresOnb = [];
  pageOnb.on("pageerror", (e) => erroresOnb.push("PAGEERROR " + String(e.message).slice(0, 130)));
  pageOnb.on("console", (m) => { if (m.type() === "error") erroresOnb.push("CONSOLE " + m.text().slice(0, 130)); });

  await pageOnb.addInitScript((productos) => {
    const KEY = "blink-pos-state-v3";
    const patch = () => {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return;
        const st = JSON.parse(raw);
        st.onboarding = { ...(st.onboarding || {}), completed: false };
        if (!st.products || st.products.length === 0) st.products = productos;
        localStorage.setItem(KEY, JSON.stringify(st));
      } catch {}
    };
    patch();
    window.addEventListener("DOMContentLoaded", patch);
  }, PRODUCTOS);

  await pageOnb.goto(BASE + "/app/entrar?bypass=1", { waitUntil: "domcontentloaded" });
  await pageOnb.waitForTimeout(1400);
  await pageOnb.goto(BASE + "/app/onboarding", { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await pageOnb.waitForTimeout(1200);

  const infoOnb = await pageOnb.evaluate(() => {
    const h1 = document.querySelector("h1");
    const svgs = [...document.querySelectorAll("svg.icon")];
    return {
      ruta: location.pathname,
      h1Size: h1 ? getComputedStyle(h1).fontSize : null,
      iconosVacios: svgs.filter((s) => !s.querySelector("path")).length,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
    };
  });
  const okOnb =
    infoOnb.ruta.includes("onboarding") && !infoOnb.overflowX && infoOnb.iconosVacios === 0 && erroresOnb.length === 0;
  if (!okOnb) problemas++;
  console.log(
    `${okOnb ? "OK " : "!! "} ${"onboarding".padEnd(12)} ruta=${infoOnb.ruta} h1=${String(infoOnb.h1Size).padEnd(6)} (vacios ${infoOnb.iconosVacios}) overflowX=${infoOnb.overflowX} errores=${erroresOnb.length}`
  );
  await pageOnb.screenshot({ path: path.join(OUT, "onboarding" + vista.sufijo + ".png") });
  erroresTotales += erroresOnb.length;
  await ctxOnb.close();

  // --- Pantallas publicas de acceso ---
  // Sin sesion (ni bypass) las pantallas de acceso se ven de verdad: con la
  // sesion falsa el gate de ruta te devuelve al Inicio.
  const ctxPub = await browser.newContext({
    viewport: { width: vista.width, height: vista.height },
    colorScheme: "light",
    isMobile: vista.id === "movil",
    hasTouch: vista.id === "movil",
  });
  const pagePub = await ctxPub.newPage();
  const erroresPub = [];
  pagePub.on("pageerror", (e) => erroresPub.push("PAGEERROR " + String(e.message).slice(0, 130)));
  pagePub.on("console", (m) => { if (m.type() === "error") erroresPub.push("CONSOLE " + m.text().slice(0, 130)); });

  for (const [ruta, nombre] of [["/app/entrar", "login"], ["/app/registro", "registro"]]) {
    await pagePub.goto(BASE + ruta, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
    await pagePub.waitForTimeout(1000);
    const infoPub = await pagePub.evaluate(() => {
      const h1 = document.querySelector("h1");
      const svgs = [...document.querySelectorAll("svg.icon")];
      const marca = document.querySelector(".blink-pos-title");
      return {
        ruta: location.pathname,
        h1Size: h1 ? getComputedStyle(h1).fontSize : null,
        iconosVacios: svgs.filter((s) => !s.querySelector("path")).length,
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
        // El wordmark debe medir lo que su texto: si crece, hay un choque
        // de clases (como el que hubo con `.pos`).
        marcaAlto: marca ? Math.round(marca.getBoundingClientRect().height) : null,
      };
    });
    const okPub =
      infoPub.ruta.includes(nombre === "login" ? "entrar" : "registro") &&
      !infoPub.overflowX &&
      infoPub.iconosVacios === 0 &&
      erroresPub.length === 0 &&
      (infoPub.marcaAlto === null || infoPub.marcaAlto < 120);
    if (!okPub) problemas++;
    console.log(
      `${okPub ? "OK " : "!! "} ${(nombre + " (sin sesion)").padEnd(12)} ruta=${infoPub.ruta} h1=${String(infoPub.h1Size).padEnd(6)} marca_h=${infoPub.marcaAlto} (vacios ${infoPub.iconosVacios}) overflowX=${infoPub.overflowX} errores=${erroresPub.length}`
    );
    await pagePub.screenshot({ path: path.join(OUT, nombre + vista.sufijo + ".png") });
  }
  erroresTotales += erroresPub.length;
  await ctxPub.close();
}

console.log("\nvistas con problemas:", problemas);
console.log("errores de consola totales:", erroresTotales);
console.log("capturas en", OUT);

await browser.close();
process.exit(problemas > 0 || erroresTotales > 0 ? 1 : 0);
