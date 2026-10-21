/**
 * Verificación visual de todas las vistas: render, tipografía, iconos,
 * desbordamiento horizontal y errores de consola.
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
  ["/app/entrar", "login"],
  ["/app/registro", "registro"],
  ["/app/terminos", "terminos"],
  ["/app/privacidad", "privacidad"],
  ["/app/onboarding", "onboarding"],
  ["/app/inicio", "inicio"],
  ["/app/ventas", "ventas"],
  ["/app/ventas/historial", "historial"],
  ["/app/catalogo", "catalogo"],
  ["/app/inventario", "inventario"],
  ["/app/contactos", "contactos"],
  ["/app/finanzas", "finanzas"],
  ["/app/informes", "informes"],
  ["/app/ajustes", "ajustes"],
];

const PRODUCTOS = [
  { id: "p1", name: "AZUCAR KONFIT 1kg", sku: "SKU-001", barcode: "7801234567890", category: "Alimentos", brand: "ALIMENTOS POLAR", presentationQty: 1, unit: "kg", cost: 0.9, price: 2, stock: 24, minStock: 6, trackStock: true, active: true, archived: false },
  { id: "p2", name: "MALTA RETORNABLE 222ml", sku: "SKU-002", barcode: "7801234567891", category: "Bebidas", brand: "CERVECERIAS", presentationQty: 222, unit: "ml", cost: 0.6, price: 1.5, stock: 3, minStock: 12, trackStock: true, active: true, archived: false },
  { id: "p3", name: "PAPEL DE ALUMINIO TUC", sku: "SKU-003", barcode: "7801234567892", category: "Hogar", brand: "TUC", presentationQty: 1, unit: "unidad", cost: 3.1, price: 4.8, stock: 0, minStock: 4, trackStock: true, active: true, archived: false },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, colorScheme: "light" });
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

let problemas = 0;
for (const [ruta, nombre] of RUTAS) {
  const antes = errores.length;
  await page.goto(BASE + ruta, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1200);

  const info = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const svgs = [...document.querySelectorAll("svg.icon")];
    return {
      url: location.pathname,
      h1: h1 ? h1.textContent.trim().slice(0, 28) : null,
      h1Size: h1 ? getComputedStyle(h1).fontSize : null,
      iconos: svgs.length,
      iconosVacios: svgs.filter((s) => !s.querySelector("path")).length,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
    };
  });

  const nuevos = errores.length - antes;
  const ok = !info.overflowX && info.iconosVacios === 0 && nuevos === 0;
  if (!ok) problemas++;
  console.log(
    `${ok ? "OK " : "!! "} ${nombre.padEnd(12)} h1=${String(info.h1Size).padEnd(6)} iconos=${String(info.iconos).padStart(2)} (vacios ${info.iconosVacios}) overflowX=${info.overflowX} errores=${nuevos}`
  );
  await page.screenshot({ path: path.join(OUT, nombre + ".png") });
}

console.log("\nvistas con problemas:", problemas);
console.log("errores de consola totales:", errores.length);
for (const e of [...new Set(errores)].slice(0, 8)) console.log("  " + e);
console.log("capturas en", OUT);

await browser.close();
process.exit(problemas > 0 || errores.length > 0 ? 1 : 0);
