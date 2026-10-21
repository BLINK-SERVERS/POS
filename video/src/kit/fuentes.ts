// ============================================================
// Tipografia del render.
//
// Se incrusta Inter (SIL OFL 1.1) —la alternativa libre a SF Pro que ya
// sirve la web— como data URL (ver `scripts/generar-fuente.mjs`).
// Motivos:
//   · el render no depende de la red ni del servidor de ficheros;
//   · la fuente nunca llega "tarde": al ir incrustada, el navegador la
//     tiene antes del primer pintado (no hay parpadeo);
//   · el resultado es identico en cualquier equipo.
//
// No se usa `delayRender` para esperarla: con la fuente incrustada no
// hay nada que esperar, y bloquear el fotograma mientras se carga
// hacia que el render se cayera por timeout en equipos saturados.
//
// Si en el futuro se quiere la SF Pro real, se copian los ficheros de
// `app/.fonts-sf-local/` a `video/public/fonts/`, se ejecuta
// `node scripts/generar-fuente.mjs` y se cambia la familia de aqui.
// Ojo: la licencia de SF Pro de Apple cubre mockups y prototipos en
// plataformas de Apple; para un comercial publicado, Inter (OFL) es la
// opcion segura.
// ============================================================
import { INTER_DATA_URL } from "./fuente-inter";

export const FUENTE = "Inter";

if (typeof document !== "undefined" && !document.getElementById("fuente-inter")) {
  const estilo = document.createElement("style");
  estilo.id = "fuente-inter";
  estilo.textContent = `@font-face{font-family:"Inter";src:url(${INTER_DATA_URL}) format("woff2");font-weight:100 900;font-style:normal;font-display:swap}`;
  document.head.appendChild(estilo);
}
