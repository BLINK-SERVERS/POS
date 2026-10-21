// ============================================================
// BLINK POS · Verificador de enlaces de la documentación
// ------------------------------------------------------------
// Recorre todos los Markdown del repositorio, extrae los enlaces
// relativos y comprueba que el destino existe. Detecta también
// páginas del HIG que devolvieron "HTTP 404" al descargarse.
//
// Ejecutar:  npm run docs:check
// Sale con código != 0 si hay algún enlace roto.
// ============================================================
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");

/** Carpetas que no se recorren. */
const IGNORE = new Set(["node_modules", ".git", "dist", "verify-shots", "screenshots", ".fonts-sf-local"]);

/** Ficheros Markdown que se recorren. */
function markdownFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) markdownFiles(full, acc);
    else if (extname(entry.name) === ".md") acc.push(full);
  }
  return acc;
}

/** Enlaces markdown: [texto](destino) — se ignoran imágenes y anclas. */
function extractLinks(md) {
  const links = [];
  const re = /(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m;
  while ((m = re.exec(md))) {
    const raw = m[1];
    // `doc://` es el esquema de las referencias cruzadas del HIG de Apple.
    if (/^(https?:|mailto:|tel:|doc:|data:)/i.test(raw)) continue;
    if (raw.startsWith("#")) continue;
    links.push(raw);
  }
  return links;
}

const files = markdownFiles(ROOT);
let broken = 0;
let checked = 0;
const problems = [];

for (const file of files) {
  const md = readFileSync(file, "utf8");
  const rel = relative(ROOT, file).replace(/\\/g, "/");

  // Páginas del HIG que devolvieron 404 al descargarse.
  if (rel.startsWith("docs/HIG/") && /^\s*HTTP 404\s*$/m.test(md)) {
    problems.push(`${rel} · página del HIG con contenido "HTTP 404"`);
    broken++;
  }

  for (const link of extractLinks(md)) {
    // Quita el ancla final: "archivo.md#seccion"
    const target = decodeURIComponent(link.split("#")[0]);
    if (!target) continue;
    checked++;

    // Las rutas que empiezan por "/" son del sitio publicado, no del repo.
    if (target.startsWith("/")) continue;

    const base = dirname(file);
    const abs = resolve(base, target);
    const absRepo = resolve(ROOT, target.replace(/^\/+/, ""));

    const ok = existsSync(abs) || existsSync(absRepo);
    if (!ok) {
      problems.push(`${rel} → ${link}`);
      broken++;
    }
  }
}

console.log(`· ${files.length} archivos Markdown, ${checked} enlaces relativos revisados`);
if (broken === 0) {
  console.log("OK  sin enlaces rotos");
} else {
  console.log(`\n${broken} problema(s):`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exitCode = 1;
}
