// ============================================================
// Verifica que la paleta del comercial no se desincronice de la de
// la web: `app/src/styles/tokens.css` es la fuente de verdad.
//
// Uso:  node scripts/verificar-tokens.mjs
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(HERE, "..", "..");
const TOKENS_WEB = path.join(RAIZ, "app", "src", "styles", "tokens.css");
const TOKENS_VIDEO = path.join(HERE, "..", "src", "kit", "tokens.ts");
const FUENTES_VIDEO = path.join(HERE, "..", "src", "kit", "fuentes.ts");

const web = fs.readFileSync(TOKENS_WEB, "utf8");
const video = fs.readFileSync(TOKENS_VIDEO, "utf8");
const fuentes = fs.readFileSync(FUENTES_VIDEO, "utf8");

/** Busca "--nombre: valor" en el CSS de la web. */
const enWeb = (nombre) => {
  const n = nombre.replace(/^--/, "");
  const m = web.match(new RegExp(`--${n}:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
};

/** Busca "clave: { claro: "#x", oscuro: "#y" }" en el TS del video. */
const enVideo = (grupo) => {
  const m = video.match(new RegExp(`${grupo}:\\s*\\{\\s*claro:\\s*"(#[0-9a-fA-F]{6})",\\s*oscuro:\\s*"(#[0-9a-fA-F]{6})"`));
  return m ? { claro: m[1].toLowerCase(), oscuro: m[2].toLowerCase() } : null;
};

/** Compara un color suelto de la web con el par del video. */
const compara = (etiqueta, valorWeb, parVideo) => {
  if (!valorWeb || !parVideo) {
    console.log(`  !! ${etiqueta}: no encontrado`);
    return 1;
  }
  const limpio = valorWeb.replace(/\s+/g, "").toLowerCase();
  const coincide =
    limpio === parVideo.claro ||
    limpio === parVideo.oscuro ||
    limpio.includes(parVideo.claro) ||
    limpio.includes(parVideo.oscuro) ||
    limpio.includes(parVideo.claro.replace("#", "")) ||
    limpio.includes(parVideo.oscuro.replace("#", ""));
  console.log(`  ${coincide ? "ok" : "!!"} ${etiqueta}: web=${limpio} video=${parVideo.claro}/${parVideo.oscuro}`);
  return coincide ? 0 : 1;
};

console.log("\n=== Paleta: web vs. comercial ===");

let fallos = 0;

/* Los grupos de la paleta oficial BLINK. */
const GRUPOS = [
  ["rojo", "--blink-red-light", "--blink-red-dark"],
  ["crimson", "--blink-crimson-light", "--blink-crimson-dark"],
  ["naranja", "--blink-orange-light", "--blink-orange-dark"],
  ["amarillo", "--blink-yellow-light", "--blink-yellow-dark"],
  ["verde", "--blink-green-light", "--blink-green-dark"],
  ["teal1", "--blink-teal1-light", "--blink-teal1-dark"],
  ["teal2", "--blink-teal2-light", "--blink-teal2-dark"],
  ["cian", "--blink-cyan-light", "--blink-cyan-dark"],
  ["azul", "--blink-blue-light", "--blink-blue-dark"],
  ["indigo", "--blink-indigo-light", "--blink-indigo-dark"],
  ["magenta", "--blink-magenta-light", "--blink-magenta-dark"],
  ["marron", "--blink-brown-light", "--blink-brown-dark"],
];

for (const [grupo, claro, oscuro] of GRUPOS) {
  const par = enVideo(grupo);
  const c = enWeb(claro);
  const o = enWeb(oscuro);
  if (!par) {
    console.log(`  !! ${grupo}: no esta en el video`);
    fallos++;
    continue;
  }
  const okClaro = c && c.toLowerCase() === par.claro;
  const okOscuro = o && o.toLowerCase() === par.oscuro;
  console.log(`  ${okClaro && okOscuro ? "ok" : "!!"} ${grupo}: ${par.claro} / ${par.oscuro}`);
  if (!okClaro || !okOscuro) fallos++;
}

/* Los colores de superficie y texto. */
const SUPERFICIES = [
  ["PAPEL", "--color-bg-primary", "#fffefb"],
  ["TINTA", "--color-text-primary", "#1d1d1f"],
  ["ACENTO", "--blink-blue-light", "#0088ff"],
  ["EXITO", "--blink-green-light", "#34c759"],
  ["PELIGRO", "--blink-red-light", "#ff383c"],
];
for (const [etiqueta, token, esperado] of SUPERFICIES) {
  const v = enWeb(token);
  const ok = v && v.toLowerCase().includes(esperado);
  console.log(`  ${ok ? "ok" : "!!"} ${etiqueta}: web=${v} (esperado ${esperado})`);
  if (!ok) fallos++;
}

/* La fuente del render: debe ser la que sirve la web (Inter, OFL). */
const fuenteVideo = fuentes.match(/family:\s*"([^"]+)"/);
const okFuente = fuenteVideo?.[1] === "Inter";
console.log(
  `  ${okFuente ? "ok" : "!!"} fuente del render: ${fuenteVideo ? fuenteVideo[1] : "?"} (la web sirve Inter, SIL OFL)`
);
if (!okFuente) fallos++;

console.log(`\nDesajustes: ${fallos}`);
process.exit(fallos === 0 ? 0 : 1);
