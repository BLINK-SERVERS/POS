/**
 * Extrae los tokens de diseño del UI Kit oficial de Apple
 * ("Apple iOS 27 UI Kit.sketch") y escribe
 * `app/src/lib/ios-design-tokens.ts`.
 *
 * El .sketch es un bundle: se leen `document.json` (estilos compartidos) y
 * `meta.json` (paginas y artboards) con 7-Zip.
 *
 * Uso:  npm run tokens:ios
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..");
const WORK = path.join(os.tmpdir(), "blink-ios-tokens");

// Permite indicar otra ruta del kit
const KIT =
  process.argv[2] ||
  "C:/Users/prodz/OneDrive/Documentos/Apple iOS 27 UI Kit.sketch";

const SEVEN = "C:/Program Files/7-Zip/7z.exe";
if (!fs.existsSync(KIT)) {
  console.error("No se encuentra el kit:", KIT);
  process.exit(1);
}

fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(WORK, { recursive: true });
for (const name of ["meta.json", "document.json"]) {
  execFileSync(SEVEN, ["e", KIT, "-o" + WORK, name, "-y"], { stdio: "ignore" });
}

const doc = JSON.parse(fs.readFileSync(path.join(WORK, "document.json"), "utf8"));
const meta = JSON.parse(fs.readFileSync(path.join(WORK, "meta.json"), "utf8"));

const hex = (v) =>
  v && v.red !== undefined
    ? "#" + [v.red, v.green, v.blue].map((n) => Math.round(n * 255).toString(16).padStart(2, "0")).join("")
    : "";
const clean = (n) => String(n || "").replace(/[^\x20-\x7E]/g, "").replace(/\s+/g, " ").trim();

// --- Colores ---
const system = { light: {}, dark: {} };
const labels = { light: {}, dark: {} };
const fills = { light: {}, dark: {} };
for (const s of doc.sharedSwatches?.objects || []) {
  const m = clean(s.name).match(/^(System Colors|Labels|Fills)\/(Light|Dark)\/\d+ (.+)$/);
  if (!m) continue;
  const g = m[1] === "System Colors" ? system : m[1] === "Labels" ? labels : fills;
  g[m[2].toLowerCase()][m[3].toLowerCase()] = hex(s.value);
}

// --- Tipografia ---
const PESO = { 1: 400, 2: 700, 3: 400, 4: 700 };
const ITALICA = { 1: false, 2: false, 3: true, 4: true };
const textStyles = {};
for (const s of doc.layerTextStyles?.objects || []) {
  const m = clean(s.name).match(/^(?:(Tight|Loose) Leading\/)?\d\d ([A-Za-z0-9]+)\/(\d) (.+)$/);
  if (!m) continue;
  const [, leading, styleName, variant, variantName] = m;
  const enc = s.value?.textStyle?.encodedAttributes || {};
  const f = enc.MSAttributedStringFontAttribute?.attributes || {};
  const p = enc.paragraphStyle?.attributes || {};
  const italic = ITALICA[+variant] ?? false;
  const key = styleName.toLowerCase();
  const st = (textStyles[key] = textStyles[key] || {
    name: styleName,
    size: f.size,
    leading: { default: p.minimumLineHeight ?? null },
    variants: {},
  });
  if (leading) st.leading[leading.toLowerCase()] = p.minimumLineHeight ?? null;
  const vKey = variantName.toLowerCase().replace(/\s+/g, "") + (italic ? "Italic" : "");
  st.variants[vKey] = {
    weight: PESO[+variant] ?? 400,
    italic,
    postScriptName: f.name || null,
    lineHeight: p.minimumLineHeight ?? null,
  };
}

// --- Materiales Liquid Glass ---
const materials = {};
for (const s of doc.layerStyles?.objects || []) {
  const name = clean(s.name);
  if (!/^Liquid Glass\//.test(name)) continue;
  const v = s.value || {};
  const fs_ = (v.fills || []).filter((f) => f.isEnabled !== false);
  const bg = fs_.find((f) => f.fillType === "Color") || fs_[0];
  const blur = (v.blurs || []).find((b) => b.isEnabled !== false);
  const key = name.replace(/^Liquid Glass\//, "").toLowerCase();
  materials[key] = {
    name: name.replace(/^Liquid Glass\//, ""),
    background: bg ? hex(bg.color) : null,
    blur: blur?.radius ?? null,
  };
}

// --- Modulo TS ---
const ts = `/**
 * Tokens de diseño de iOS 27 — extraídos del UI Kit oficial de Apple
 * ("Apple iOS 27 UI Kit.sketch").
 *
 * NO EDITAR A MANO: lo produce \`npm run tokens:ios\`.
 *
 * Contiene solo valores de diseño (hex, tamaños, pesos, radios de
 * desenfoque), que son datos objetivos: ningún asset con licencia restringida.
 */

export type IosMode = "light" | "dark";

/** Colores del sistema (acento por tonalidad), en sus variantes clara y oscura. */
export const IOS_SYSTEM_COLORS = {
${Object.keys(system.light)
  .sort()
  .map((k) => `  ${k}: {\n    light: ${JSON.stringify(system.light[k])},\n    dark: ${JSON.stringify(system.dark[k])},\n  },`)
  .join("\n")}
} as const;

/** Etiquetas: 5 niveles de jerarquia de texto. */
export const IOS_LABELS = {
  light: ${JSON.stringify(labels.light, null, 2).replace(/\n/g, "\n  ")},
  dark: ${JSON.stringify(labels.dark, null, 2).replace(/\n/g, "\n  ")},
} as const;

/** Rellenos: 5 niveles de superficies. */
export const IOS_FILLS = {
  light: ${JSON.stringify(fills.light, null, 2).replace(/\n/g, "\n  ")},
  dark: ${JSON.stringify(fills.dark, null, 2).replace(/\n/g, "\n  ")},
} as const;

/** Estilo tipografico de iOS 27. */
export interface IosTypeStyle {
  /** Nombre del estilo en el HIG. */
  name: string;
  /** Tamano en puntos. */
  size: number;
  /** Interlineado: por defecto y, cuando existe, apretado y holgado. */
  leading: { default: number | null; tight?: number | null; loose?: number | null };
  /** Variantes (default / bold / italic / boldItalic). */
  variants: Record<string, { weight: number; italic: boolean; postScriptName: string | null; lineHeight: number | null }>;
}

export const IOS_TEXT_STYLES: Record<string, IosTypeStyle> = {
${Object.entries(textStyles)
  .map(
    ([k, v]) =>
      `  ${k}: {\n    name: ${JSON.stringify(v.name)},\n    size: ${v.size},\n    leading: ${JSON.stringify(v.leading)},\n    variants: ${JSON.stringify(v.variants)},\n  },`
  )
  .join("\n")}
};

/** Material (Liquid Glass). */
export interface IosMaterial {
  name: string;
  /** Color de fondo del material. */
  background: string | null;
  /** Radio del desenfoque de fondo, en puntos. */
  blur: number | null;
}

export const IOS_MATERIALS: Record<string, IosMaterial> = {
${Object.entries(materials)
  .map(
    ([k, v]) =>
      `  ${JSON.stringify(k)}: {\n    name: ${JSON.stringify(v.name)},\n    background: ${JSON.stringify(v.background)},\n    blur: ${JSON.stringify(v.blur)},\n  },`
  )
  .join("\n")}
};
`;

fs.writeFileSync(path.join(APP, "src", "lib", "ios-design-tokens.ts"), ts);

console.log("colores del sistema:", Object.keys(system.light).length);
console.log("etiquetas light/dark:", Object.keys(labels.light).length, "/", Object.keys(labels.dark).length);
console.log("rellenos light/dark:", Object.keys(fills.light).length, "/", Object.keys(fills.dark).length);
console.log("estilos de texto:", Object.keys(textStyles).length);
console.log("materiales liquid glass:", Object.keys(materials).length);
console.log("-> app/src/lib/ios-design-tokens.ts");
