/**
 * Genera `app/src/lib/sf-symbols.ts` a partir de los SVG de SF Symbols.
 *
 * Fuente: https://github.com/brendanballon/sfsymbols-svg
 *   → 6.404 simbolos de Apple exportados a SVG individual.
 *
 * Que hace:
 *   1. Descarga el indice del repositorio.
 *   2. Descarga cada SVG del mapa de iconos de BLINK.
 *   3. Normaliza el SVG: quita width/height en px, anade viewBox,
 *      convierte `fill='black'` en `currentColor` y elimina el
 *      `stroke` (los trazados de la fuente ya son contornos).
 *   4. Escribe un unico modulo TS con el mapa (sin peticiones extra).
 *
 * Uso:  npm run icons:sf
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..");
const REPO = "brendanballon/sfsymbols-svg";
const BRANCH = "master";
const RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/symbols/`;
const API = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`;

/**
 * Mapa: nombre interno de BLINK -> fichero del simbolo en el repo.
 * Los primeros 32 son los que ya usa la app; el resto son los que
 * necesita el rediseño de iOS 27 (tab bar, split view, inspector...).
 */
export const ICON_MAP = {
  // --- Iconos actuales de BLINK ---
  home: "house.fill",
  cart: "cart.fill",
  tag: "tag.fill",
  box: "shippingbox.fill",
  users: "person.2.fill",
  wallet: "wallet.bifold.fill",
  chart: "chart.bar.xaxis",
  settings: "gearshape.fill",
  logout: "rectangle.portrait.and.arrow.right",
  plus: "plus",
  minus: "minus",
  check: "checkmark",
  close: "xmark",
  search: "magnifyingglass",
  store: "storefront.fill",
  cash: "banknote.fill",
  alert: "exclamationmark.triangle.fill",
  trash: "trash.fill",
  arrowRight: "arrow.right",
  receipt: "text.document.fill",
  printer: "printer.fill",
  menu: "line.3.horizontal",
  mail: "envelope.fill",
  lock: "lock.fill",
  scan: "barcode.viewfinder",
  phone: "iphone",
  download: "arrow.down.to.line",
  fileText: "document.fill",
  table: "tablecells",
  calendar: "calendar",
  filter: "line.3.horizontal.decrease.circle",
  share: "square.and.arrow.up",

  // --- Extras para el rediseño de iOS 27 ---
  tabHome: "house",
  tabVentas: "cart",
  tabCatalogo: "tag",
  tabInventario: "shippingbox",
  tabContactos: "person.2",
  tabFinanzas: "wallet.bifold",
  sidebar: "sidebar.left",
  inspector: "sidebar.right",
  splitView: "rectangle.split.3x1",
  camera: "camera.viewfinder",
  pencil: "pencil",
  archive: "archivebox.fill",
  clock: "clock",
  location: "location.fill",
  note: "note.text",
  layers: "square.3.layers.3d.down.right.fill",
  chevronRight: "chevron.right",
  chevronLeft: "chevron.left",
  creditcard: "creditcard.fill",
  qr: "qrcode.viewfinder",
  checkmarkCircle: "checkmark.circle.fill",
  xmarkCircle: "xmark.circle.fill",
  info: "info.circle.fill",
  bolt: "bolt.fill",
  wifi: "wifi",
  person: "person.fill",
  bell: "bell.fill",
  ellipsis: "ellipsis",
  plusCircle: "plus.circle.fill",
  minusCircle: "minus.circle.fill",
  arrowsUpDown: "arrow.up.arrow.down",
  cartBadge: "cart.badge.plus",
  boxBadge: "shippingbox.and.arrow.backward.fill",
  percent: "percent",
  dollar: "dollar",
  chartLine: "chart.xyaxis.line",
  listBullets: "list.bullet",
  checkmarkSquare: "checkmark.square.fill",
  squareGrid: "square.grid.2x2.fill",
  calendarBadge: "calendar.badge.clock",
  banknote: "banknote",
  creditcardFill: "creditcard",
};

/** Normaliza un SVG del repo a un fragmento con `currentColor`. */
function normalize(svg) {
  const w = (svg.match(/width='([\d.]+)px'/) || [])[1];
  const h = (svg.match(/height='([\d.]+)px'/) || [])[1];
  if (!w || !h) throw new Error("svg sin width/height");
  const body = svg
    .replace(/^[\s\S]*?<g/, "<g")
    .replace(/<\/svg>\s*$/, "")
    .replace(/fill='black'/g, "fill='currentColor'")
    .replace(/\s*stroke='black'/g, "")
    .replace(/\s*stroke-width='[\d.]+'/g, "")
    .replace(/\s*fill-opacity='1\.0'/g, "")
    .trim();
  return { viewBox: `0 0 ${round(w)} ${round(h)}`, body };
}

const round = (n) => Math.round(parseFloat(n) * 1000) / 1000;

// --- 1. Indice ---
const treeRes = await fetch(API, { headers: { "User-Agent": "blink-pos" } });
if (!treeRes.ok) throw new Error("no se pudo leer el indice: " + treeRes.status);
const tree = await treeRes.json();
const disponibles = new Set(
  tree.tree
    .filter((x) => x.path.startsWith("symbols/") && x.path.endsWith(".svg"))
    .map((x) => x.path.split("/").pop().replace(/\.svg$/, ""))
);

// --- 2. Descarga y normaliza ---
const simbolos = {};
const faltan = [];

for (const [nombre, fichero] of Object.entries(ICON_MAP)) {
  if (!disponibles.has(fichero)) {
    faltan.push(`${nombre} -> ${fichero}`);
    continue;
  }
  const r = await fetch(RAW + fichero + ".svg", { headers: { "User-Agent": "blink-pos" } });
  if (!r.ok) {
    faltan.push(`${nombre} -> ${fichero} (HTTP ${r.status})`);
    continue;
  }
  try {
    simbolos[nombre] = normalize(await r.text());
  } catch (e) {
    faltan.push(`${nombre} -> ${fichero} (${e.message})`);
  }
}

// --- 3. Modulo TS ---
const ts = `/**
 * Iconos SF Symbols (Apple) generados automaticamente.
 *
 * NO EDITAR A MANO: este archivo lo produce \`npm run icons:sf\`.
 *
 * Origen: https://github.com/${REPO}
 * Cada simbolo viene normalizado a \`currentColor\` y con viewBox propio,
 * de modo que escala a cualquier tamano y hereda el color del texto.
 *
 * Nota de licencia: los SF Symbols de Apple estan licenciados para su uso en
 * software de plataformas Apple (iOS, iPadOS, macOS, tvOS, watchOS).
 * Ver docs/ICONOS_Y_PWA.md.
 */

export interface SfSymbol {
  /** viewBox propio del glifo (el alto y ancho varian por simbolo). */
  viewBox: string;
  /** Contenido interno del SVG, con \`fill='currentColor'\`. */
  body: string;
}

export const SF_SYMBOLS: Record<string, SfSymbol> = {
${Object.entries(simbolos)
  .map(([k, v]) => `  ${JSON.stringify(k)}: {\n    viewBox: ${JSON.stringify(v.viewBox)},\n    body: ${JSON.stringify(v.body)},\n  },`)
  .join("\n")}
};

/** Nombres de simbolos disponibles. */
export type SfSymbolName = keyof typeof SF_SYMBOLS;
`;

fs.writeFileSync(path.join(APP, "src", "lib", "sf-symbols.ts"), ts);

console.log(`simbolos generados: ${Object.keys(simbolos).length}`);
if (faltan.length) {
  console.log("faltan (" + faltan.length + "):");
  for (const f of faltan) console.log("  " + f);
}
console.log("-> app/src/lib/sf-symbols.ts");
