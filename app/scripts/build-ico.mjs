/**
 * Empaqueta un PNG en un fichero .ico con varios tamanos (Vista+).
 * Uso: node scripts/build-ico.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const APP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(APP, "public");

/** Rasteriza un SVG a PNG en un tamano dado. */
async function raster(svg, size, browser) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent}
svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
    { waitUntil: "load" }
  );
  const buf = await page.screenshot({ omitBackground: true });
  await page.close();
  return buf;
}

/** Escribe un .ico con los PNG dados (16, 32, 48). */
function empaquetarIco(entradas) {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0); // reservado
  cabecera.writeUInt16LE(1, 2); // tipo 1 = icono
  cabecera.writeUInt16LE(entradas.length, 4);

  const entradasIco = [];
  let offset = 6 + 16 * entradas.length;
  for (const e of entradas) {
    const d = Buffer.alloc(16);
    d.writeUInt8(e.size >= 256 ? 0 : e.size, 0);
    d.writeUInt8(e.size >= 256 ? 0 : e.size, 1);
    d.writeUInt8(0, 2); // paleta
    d.writeUInt8(0, 3); // reservado
    d.writeUInt16LE(1, 4); // planos
    d.writeUInt16LE(32, 6); // bits por pixel
    d.writeUInt32LE(e.data.length, 8);
    d.writeUInt32LE(offset, 12);
    offset += e.data.length;
    entradasIco.push(d);
  }
  return Buffer.concat([cabecera, ...entradasIco, ...entradas.map((e) => e.data)]);
}

const svg = fs.readFileSync(path.join(PUB, "favicon.svg"), "utf8");
const browser = await chromium.launch();
const entradas = [];
for (const size of [16, 32, 48]) {
  entradas.push({ size, data: await raster(svg, size, browser) });
}
await browser.close();

const dest = path.join(PUB, "favicon.ico");
fs.writeFileSync(dest, empaquetarIco(entradas));
console.log("favicon.ico:", fs.statSync(dest).size, "bytes ·", entradas.map((e) => e.size).join("/"));
