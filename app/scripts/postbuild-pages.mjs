// Ajustes para publicar en GitHub Pages.
//
// 1) `404.html`: GitHub Pages sirve ese archivo cuando la ruta no existe, y
//    lo hace con estatus 404. En vez de duplicar `index.html`, esta página
//    guarda la ruta pedida y vuelve a la raíz, donde el script de `index.html`
//    la restaura antes de montar React. Así la SPA resuelve la ruta profunda
//    y la visita termina en una URL 200.
// 2) `.nojekyll`: evita que Pages procese el sitio con Jekyll (que ignora
//    carpetas que empiezan por guion bajo).
import { writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const index = join(dist, "index.html");

if (!existsSync(index)) {
  throw new Error(`No existe ${index}. Ejecuta primero el build.`);
}

const redireccion = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>BLINK POS</title>
    <script>
      (function () {
        var ruta = location.pathname + location.search + location.hash;
        try {
          sessionStorage.setItem("blink-ruta-404", ruta);
        } catch (e) {
          /* sin almacenamiento: se entra a la portada */
        }
        location.replace("/");
      })();
    </script>
    <noscript><meta http-equiv="refresh" content="0; url=/" /></noscript>
  </head>
  <body>
    <p>Redirigiendo a <a href="/">BLINK POS</a>…</p>
  </body>
</html>
`;

writeFileSync(join(dist, "404.html"), redireccion);
writeFileSync(join(dist, ".nojekyll"), "");

console.log("[pages] 404.html de redirección y .nojekyll generados en dist/");
