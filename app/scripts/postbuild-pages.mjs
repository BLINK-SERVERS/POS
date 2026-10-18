// Ajustes para publicar en GitHub Pages.
//
// 1) `404.html`: GitHub Pages sirve ese archivo cuando la ruta no existe.
//    Al ser una copia de `index.html`, la SPA arranca y React Router resuelve
//    la ruta profunda (p. ej. /blink-pos/catalogo) en el navegador.
// 2) `.nojekyll`: evita que Pages procese el sitio con Jekyll (que ignora
//    carpetas que empiezan por guion bajo).
import { copyFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const index = join(dist, "index.html");

if (!existsSync(index)) {
  throw new Error(`No existe ${index}. Ejecuta primero el build.`);
}

copyFileSync(index, join(dist, "404.html"));
writeFileSync(join(dist, ".nojekyll"), "");

console.log("[pages] 404.html y .nojekyll generados en dist/");
