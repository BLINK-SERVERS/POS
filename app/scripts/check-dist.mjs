// Comprobación del `dist` antes de empujarlo a `gh-pages` (BLINK-065 y BLINK-061).
//
// Dos papeles:
//   1. Rechazar artefactos que contengan el bypass de autenticación o cualquier
//      credencial que no deba bajar al navegador. No imprime el contenido: solo
//      el fichero, la cadena buscada y cuántas veces casó.
//   2. Asegurar que `postbuild-pages.mjs` dejó el `dist` listo para GitHub Pages
//      (404.html, .nojekyll y CNAME), porque ese paso vive en `build:pages` y un
//      `vite build` suelto no lo ejecuta.
//
// Sale con código 1 si algo falla; `npm run deploy` se corta antes de `gh-pages`.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve, extname } from "node:path";

// Igual que la prechequeo: se examina el `dist` del árbol desde el que se lanza
// el comando, para poder comprobar también el de un checkout sospechoso.
const dist = join(resolve(process.cwd()), "dist");

// Cadenas que no pueden aparecer en el artefacto público.
//
// Por qué patrones y no prefijos sueltos: el bundle limpio contiene los literales
// `sb_publishable_` y `sb_secret_` del cliente de Supabase. Medido el 2026-11-09
// sobre `assets/supabase-DtuMx0jC.js`: la coincidencia va seguida de un backtick
// (corrida alfanumérica posterior de longitud 0) y 0 de los 60 valores reales del
// `.env` del Escritorio están en el artefacto. Buscar el prefijo a secas daba
// falso positivo; aquí se exige además la corrida con forma de clave.
const PATRONES = [
  { nombre: "bypass de autenticación", re: /blink-temp-bypass/g },
  { nombre: "usuario fantasma del bypass", re: /temp-bypass-user/g },
  { nombre: "clave secret de Supabase", re: /sb_secret_[A-Za-z0-9_-]{16,}/g },
  { nombre: "token de gestión de Supabase", re: /sbp_[A-Za-z0-9]{16,}/g },
  { nombre: "token de acceso de GitHub", re: /gh[pousr]_[A-Za-z0-9]{20,}/g },
  { nombre: "PAT fino de GitHub", re: /github_pat_[A-Za-z0-9_]{20,}/g },
  { nombre: "API token de Cloudflare", re: /cfat_[A-Za-z0-9]{16,}/g },
  { nombre: "clave de Resend", re: /re_[A-Za-z0-9_-]{24,}/g },
  { nombre: "clave de AWS", re: /AKIA[A-Z0-9]{12,}/g },
  { nombre: "JWT con cabecera típica", re: /eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g },
];

const EXAMINAR = new Set([".js", ".css", ".html", ".json", ".webmanifest", ".txt", ".xml"]);

function camina(dir) {
  const salida = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) salida.push(...camina(ruta));
    else if (EXAMINAR.has(extname(nombre))) salida.push(ruta);
  }
  return salida;
}

function informe(motivo, detalle) {
  console.error(`✗ Despliegue bloqueado — ${motivo}`);
  if (detalle) console.error(`  ${detalle}`);
  console.error("  Nada se ha publicado. Consulta BLINK-065 en 02_BUGS_P0_P1.md antes de continuar.");
  process.exit(1);
}

if (!existsSync(dist)) informe("no existe el dist", `Se buscó en ${dist}. Ejecuta primero el build.`);

const ficheros = camina(dist);
if (ficheros.length === 0) informe("el dist está vacío", dist);

let hallazgos = 0;
for (const ruta of ficheros) {
  let contenido;
  try {
    contenido = readFileSync(ruta, "utf8");
  } catch (e) {
    informe("no se pudo leer un fichero del dist", `${ruta}: ${e.code}`);
  }
  for (const patron of PATRONES) {
    const n = contenido.match(patron.re);
    if (n && n.length > 0) {
      hallazgos += n.length;
      console.error(`  ${ruta.slice(dist.length + 1)}: ${patron.nombre} ×${n.length}`);
    }
  }
}
if (hallazgos > 0) informe(`${hallazgos} coincidencias prohibidas en ${ficheros.length} ficheros`, "");

// El postbuild de Pages tiene que haber dejado sus tres artefactos.
for (const obligatorio of ["404.html", ".nojekyll", "CNAME"]) {
  if (!existsSync(join(dist, obligatorio)))
    informe(`falta ${obligatorio} en el dist`, "Se genera en `npm run build:pages`; no publiques un `vite build` suelto.");
}

// Y el index.html tiene que apuntar a una entrada que exista de verdad.
const index = readFileSync(join(dist, "index.html"), "utf8");
const entradas = [...index.matchAll(/assets\/index-[A-Za-z0-9_-]+\.js/g)].map((m) => m[0]);
if (entradas.length === 0) informe("index.html no declara ninguna entrada", "");
for (const e of new Set(entradas)) {
  if (!existsSync(join(dist, e))) informe("la entrada declarada no existe en el dist", e);
}

console.log(
  `✓ dist comprobado: ${ficheros.length} ficheros, 0 coincidencias prohibidas, ` +
    `entrada ${[...new Set(entradas)].join(", ")} · 404.html, .nojekyll y CNAME presentes`
);
