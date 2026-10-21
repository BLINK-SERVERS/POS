// ============================================================
// BLINK POS · Medición de la carga real (red del navegador)
// ------------------------------------------------------------
// Navega a una ruta y mide lo que el navegador descarga de
// verdad: peticiones, bytes transferidos (con la codificación
// que negocia el servidor) y los tiempos clave.
//
// Uso:  node scripts/qa-carga.mjs [ruta]
// ============================================================
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");
const HERE = path.dirname(fileURLToPath(import.meta.url));

const BASE = process.env.VERIFY_BASE || "http://localhost:5173";
const RUTA = process.argv[2] || "/";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
const page = await ctx.newPage();

const peticiones = [];
page.on("response", async (r) => {
  const req = r.request();
  let bytes = 0;
  try {
    const len = r.headers()["content-length"];
    if (len) bytes = Number(len);
    else bytes = (await r.body().catch(() => Buffer.alloc(0))).length;
  } catch {}
  peticiones.push({
    url: r.url().replace(BASE, ""),
    status: r.status(),
    type: req.resourceType(),
    bytes,
    recurso: r.headers()["content-encoding"] || "sin comprimir",
  });
});

const t0 = Date.now();
await page.goto(BASE + RUTA, { waitUntil: "load", timeout: 45000 }).catch(() => {});
const carga = Date.now() - t0;

// Se espera a que se calme la red: la aplicacion carga sus chunks bajo
// demanda despues del primer pintado.
const peticionesIniciales = peticiones.length;
const bytesIniciales = peticiones.reduce((s, p) => s + p.bytes, 0);
await page.waitForTimeout(3500);
await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

const metricas = await page.evaluate(() => {
  const nav = performance.getEntriesByType("navigation")[0];
  const paints = performance.getEntriesByType("paint");
  const lcp = performance.getEntriesByType("largest-contentful-paint").pop();
  return {
    domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
    load: nav ? Math.round(nav.loadEventEnd) : null,
    fcp: paints.find((p) => p.name === "first-contentful-paint")?.startTime ?? null,
    lcp: lcp ? Math.round(lcp.startTime) : null,
    transferSize: nav ? nav.transferSize : null,
  };
});

const porTipo = {};
for (const p of peticiones) {
  porTipo[p.type] = (porTipo[p.tipo] || 0) + p.bytes;
}
const total = peticiones.reduce((s, p) => s + p.bytes, 0);

console.log(`== Carga de ${RUTA} (${BASE}) ==\n`);
console.log(`  Primer pintado: ${peticionesIniciales} peticiones · ${Math.round(bytesIniciales / 1024)} KB`);
console.log(`  Total (con los chunks bajo demanda): ${peticiones.length} peticiones · ${Math.round(total / 1024)} KB`);
console.log(`  FCP: ${Math.round(metricas.fcp ?? 0)} ms · LCP: ${Math.round(metricas.lcp ?? 0)} ms · load: ${metricas.load ?? carga} ms\n`);
console.log("  Por tipo de recurso:");
for (const [t, b] of Object.entries(porTipo).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${t.padEnd(10)} ${String(Math.round(b / 1024)).padStart(5)} KB`);
}
console.log("\n  Peticiones:");
for (const p of peticiones.sort((a, b) => b.bytes - a.bytes)) {
  console.log(`    ${String(Math.round(p.bytes / 1024)).padStart(4)} KB  ${p.recurso.padEnd(12)} ${p.status}  ${p.url.slice(0, 62)}`);
}

await browser.close();
