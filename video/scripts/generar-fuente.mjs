// ============================================================
// Genera `src/kit/fuente-inter.ts` con la tipografia del render
// incrustada (data URL).
//
// Se incrusta en vez de descargarse porque:
//   · el render no depende de la red ni del servidor de ficheros;
//   · no hay carrera entre la carga de la fuente y el primer fotograma
//     (con `fetch` + `delayRender` la fuente se quedaba a medias cuando
//     la maquina iba saturada y el render se caia por timeout);
//   · el resultado es identico en cualquier equipo.
//
// Uso: node scripts/generar-fuente.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(HERE, "..");
const ORIGEN = path.join(BASE, "public", "fonts", "inter-latin.woff2");
const DESTINO = path.join(BASE, "src", "kit", "fuente-inter.ts");

if (!fs.existsSync(ORIGEN)) {
  console.error("No encuentro la fuente:", ORIGEN);
  process.exit(1);
}

const b64 = fs.readFileSync(ORIGEN).toString("base64");

const ts = `/**
 * Tipografia del render, incrustada.
 *
 * NO EDITAR A MANO: lo produce \`node scripts/generar-fuente.mjs\` a partir
 * de \`public/fonts/inter-latin.woff2\`.
 *
 * Inter (SIL OFL 1.1) es la alternativa libre a SF Pro que ya sirve la
 * web. Se incrusta como data URL para que el render no dependa de la
 * red y el primer fotograma salga con la tipografia final.
 */
export const INTER_DATA_URL =
  "data:font/woff2;base64,${b64}";
`;

fs.writeFileSync(DESTINO, ts, "utf8");
console.log(
  `fuente-inter.ts generado: ${Math.round(Buffer.byteLength(b64) / 1024)} KB en base64`
);
