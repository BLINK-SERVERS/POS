// ============================================================
// BLINK POS · Prueba de la vista previa y los iconos
// ------------------------------------------------------------
// Comprueba que lo que se ve al compartir el enlace y lo que
// aparece en la ficha del navegador y en la pantalla de inicio
// del movil estan al día:
//   · la imagen Open Graph existe y es de 1200 x 630 px;
//   · el lema oficial de la marca va en los metadatos;
//   · los ficheros de icono responden y pesan lo que deben;
//   · el manifiesto declara el color de tema oficial.
//
// Uso:  node scripts/qa-preview.mjs
// ============================================================
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.VERIFY_BASE || "http://localhost:5173";
const LEMA = "Vende en un parpadeo, factura con BLINK ;)";

const HALLAZGOS = [];
const Add = (nivel, msg) => {
  HALLAZGOS.push({ nivel, msg });
  console.log(`  ${nivel === "FALLO" ? "!!" : nivel === "AVISO" ? "~~" : "ok"} ${msg}`);
};

/* --- Tamano de una imagen descargada (PNG: cabecera IHDR) --- */
function tamanoPng(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const errores = [];
page.on("pageerror", (e) => errores.push("PAGEERROR " + String(e.message).slice(0, 140)));

console.log("\n=== Vista previa (Open Graph) ===");
await page.goto(BASE + "/", { waitUntil: "networkidle" });

const meta = await page.evaluate(() => {
  const g = (sel) => document.querySelector(sel)?.getAttribute("content") ?? null;
  return {
    ogTitle: g('meta[property="og:title"]'),
    ogDescription: g('meta[property="og:description"]'),
    ogImage: g('meta[property="og:image"]'),
    ogType: g('meta[property="og:image:type"]'),
    ogWidth: g('meta[property="og:image:width"]'),
    ogHeight: g('meta[property="og:image:height"]'),
    ogAlt: g('meta[property="og:image:alt"]'),
    twCard: g('meta[name="twitter:card"]'),
    twTitle: g('meta[name="twitter:title"]'),
    twImage: g('meta[name="twitter:image"]'),
    description: g('meta[name="description"]'),
  };
});

Add(
  (meta.ogTitle ?? "").includes(LEMA) ? "ok" : "FALLO",
  `el lema oficial va en og:title ("${meta.ogTitle}")`
);
Add(
  (meta.ogDescription ?? "").includes(LEMA) ? "ok" : "FALLO",
  "el lema oficial va en og:description"
);
Add(
  (meta.twTitle ?? "").includes(LEMA) ? "ok" : "FALLO",
  "el lema oficial va en twitter:title"
);
Add(
  (meta.description ?? "").includes(LEMA) ? "ok" : "FALLO",
  "el lema oficial va en la descripcion de la pagina"
);
Add(meta.ogType === "image/png" ? "ok" : "FALLO", `og:image:type = image/png (${meta.ogType})`);
Add(meta.ogWidth === "1200" && meta.ogHeight === "630" ? "ok" : "FALLO", `og:image es 1200x630 (${meta.ogWidth}x${meta.ogHeight})`);
Add(!!meta.ogAlt && meta.ogAlt.length > 10 ? "ok" : "FALLO", "og:image:alt describe la imagen");
Add(meta.twCard === "summary_large_image" ? "ok" : "FALLO", `twitter:card = summary_large_image (${meta.twCard})`);
Add(
  (meta.ogImage ?? "").endsWith("/og-image.png") && (meta.twImage ?? "").endsWith("/og-image.png")
    ? "ok"
    : "FALLO",
  "og:image y twitter:image apuntan a la imagen de 1200x630"
);

/* --- La imagen real: tamano y peso --- */
const res = await page.request.get(new URL(meta.ogImage ?? "/og-image.png", BASE).toString());
if (res.ok()) {
  const buf = Buffer.from(await res.body());
  const t = tamanoPng(buf);
  Add(t && t.w === 1200 && t.h === 630 ? "ok" : "FALLO", `la imagen mide ${t ? t.w + "x" + t.h : "?"} px`);
  Add(buf.length < 400 * 1024 ? "ok" : "AVISO", `la imagen pesa ${Math.round(buf.length / 1024)} KB`);
} else {
  Add("FALLO", `no se puede descargar la imagen de vista previa (${res.status()})`);
}

console.log("\n=== Iconos ===");
const ICONOS = [
  ["/favicon.png", "favicon raster"],
  ["/icon.png", "icono de la app"],
  ["/favicon.svg", "favicon vectorial"],
  ["/favicon.ico", "favicon para navegadores antiguos"],
  ["/icons/icon-192.png", "PWA 192"],
  ["/icons/icon-512.png", "PWA 512"],
  ["/icons/icon-maskable-192.png", "PWA maskable 192"],
  ["/icons/apple-touch-icon.png", "iOS pantalla de inicio"],
];

for (const [ruta, uso] of ICONOS) {
  const r = await page.request.get(BASE + ruta);
  const buf = r.ok() ? Buffer.from(await r.body()) : null;
  const t = buf ? tamanoPng(buf) : null;
  const ok = r.ok() && buf.length > 100 && (!t || (t.w >= 32 && t.h >= 32));
  Add(ok ? "ok" : "FALLO", `${ruta} (${uso}) → ${r.status()} ${buf ? Math.round(buf.length / 1024 * 10) / 10 + " KB" : ""}`);
}

/* --- Los enlaces del documento --- */
const enlaces = await page.evaluate(() =>
  [...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')].map((l) => ({
    rel: l.getAttribute("rel"),
    href: l.getAttribute("href"),
    type: l.getAttribute("type"),
  }))
);
Add(
  enlaces.some((e) => e.href === "/favicon.png") ? "ok" : "FALLO",
  "el documento enlaza el favicon.png institucional"
);
Add(
  enlaces.some((e) => e.href === "/icon.png") ? "ok" : "FALLO",
  "el documento enlaza el icon.png institucional"
);
Add(
  enlaces.some((e) => e.href === "/icons/apple-touch-icon.png") ? "ok" : "FALLO",
  "el documento enlaza el apple-touch-icon"
);

/* --- El manifiesto --- */
const man = await page.request.get(BASE + "/manifest.json");
if (man.ok()) {
  const m = JSON.parse(await man.text());
  Add(m.theme_color === "#0088ff" ? "ok" : "FALLO", `el manifiesto declara el azul oficial (${m.theme_color})`);
  Add(
    (m.description ?? "").includes(LEMA) ? "ok" : "FALLO",
    "el lema oficial va en la descripcion del manifiesto"
  );
  const iconos = (m.icons ?? []).length;
  Add(iconos >= 4 ? "ok" : "FALLO", `el manifiesto declara ${iconos} iconos`);
} else {
  Add("FALLO", "no se puede leer el manifiesto");
}

await browser.close();

const fallos = HALLAZGOS.filter((h) => h.nivel === "FALLO");
const avisos = HALLAZGOS.filter((h) => h.nivel === "AVISO");
console.log(`\nFallos: ${fallos.length} · Avisos: ${avisos.length}`);
process.exit(fallos.length === 0 && errores.length === 0 ? 0 : 1);
