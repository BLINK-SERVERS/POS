/**
 * Captura un fotograma de cada escena del comercial con un solo bundle.
 * Uso: node scripts/fotogramas.mjs [salida] [fps]
 */
import { bundle } from "@remotion/bundler";
import { renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(HERE, "..");
const OUT = path.join(BASE, "capturas");
fs.mkdirSync(OUT, { recursive: true });

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

/** Un fotograma por escena (segundo del guion -> fotograma). */
const MARCAS = [
  [1.5, "01-apertura"],
  [6.7, "02-problema-1"],
  [10.7, "02-problema-2"],
  [18.3, "03-solucion"],
  [28.3, "04-multimoneda"],
  [36.0, "05-bcv"],
  [44.0, "06-reportes"],
  [52.0, "07-escaner"],
  [58.0, "08-resumen"],
  [73.3, "09-cierre-lema"],
  [86.7, "10-despedida"],
];

console.log("Empaquetando...");
const serveUrl = await bundle({
  entryPoint: path.join(BASE, "src", "index.ts"),
  onProgress: () => {},
});

for (const [segundo, nombre] of MARCAS) {
  const frame = Math.round(segundo * 30);
  const salida = path.join(OUT, `${nombre}.png`);
  await renderStill({
    composition: {
      id: "Comercial",
      component: null,
      durationInFrames: 2670,
      fps: 30,
      width: 1920,
      height: 1080,
    },
    serveUrl,
    output: salida,
    frame,
    browserExecutable: fs.existsSync(CHROME) ? CHROME : undefined,
    imageFormat: "png",
    overwrite: true,
  });
  console.log(`${nombre}  (${segundo}s, fotograma ${frame})`);
}

console.log("capturas en", OUT);
