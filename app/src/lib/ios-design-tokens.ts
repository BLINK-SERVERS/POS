/**
 * Tokens de diseño de iOS 27 — extraídos del UI Kit oficial de Apple
 * ("Apple iOS 27 UI Kit.sketch").
 *
 * NO EDITAR A MANO: lo produce `npm run tokens:ios`.
 *
 * Contiene solo valores de diseño (hex, tamaños, pesos, radios de
 * desenfoque), que son datos objetivos: ningún asset con licencia restringida.
 */

export type IosMode = "light" | "dark";

/** Colores del sistema (acento por tonalidad), en sus variantes clara y oscura. */
export const IOS_SYSTEM_COLORS = {
  blue: {
    light: "#0088ff",
    dark: "#0091ff",
  },
  brown: {
    light: "#ac7f5e",
    dark: "#b78a66",
  },
  cyan: {
    light: "#00c0e8",
    dark: "#3cd3fe",
  },
  green: {
    light: "#34c759",
    dark: "#30d158",
  },
  indigo: {
    light: "#6155f5",
    dark: "#6d7cff",
  },
  mint: {
    light: "#00c8b3",
    dark: "#00dac3",
  },
  orange: {
    light: "#ff8d28",
    dark: "#ff9230",
  },
  pink: {
    light: "#ff2d55",
    dark: "#ff375f",
  },
  purple: {
    light: "#cb30e0",
    dark: "#db34f2",
  },
  red: {
    light: "#ff383c",
    dark: "#ff4245",
  },
  teal: {
    light: "#00c3d0",
    dark: "#00d2e0",
  },
  yellow: {
    light: "#ffcc00",
    dark: "#ffd600",
  },
} as const;

/** Etiquetas: 5 niveles de jerarquia de texto. */
export const IOS_LABELS = {
  light: {
    "tertiary": "#3c3c43",
    "secondary": "#3c3c43",
    "quaternary": "#3c3c43",
    "primary": "#000000",
    "quinary": "#3c3c43"
  },
  dark: {
    "quaternary": "#ebebf5",
    "tertiary": "#ebebf5",
    "secondary": "#ebebf5",
    "primary": "#ffffff",
    "quinary": "#ebebf5"
  },
} as const;

/** Rellenos: 5 niveles de superficies. */
export const IOS_FILLS = {
  light: {
    "tertiary": "#767680",
    "quaternary": "#747480",
    "secondary": "#787880",
    "primary": "#787878",
    "quinary": "#000000"
  },
  dark: {
    "primary": "#787880",
    "tertiary": "#767680",
    "secondary": "#787880",
    "quaternary": "#767680",
    "quinary": "#767680"
  },
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
  footnote: {
    name: "Footnote",
    size: 13,
    leading: {"default":null,"loose":null,"tight":null},
    variants: {"default":{"weight":400,"italic":false,"postScriptName":"SFPro-Regular","lineHeight":null},"bolditalicItalic":{"weight":700,"italic":true,"postScriptName":"SFPro-SemiboldItalic","lineHeight":null},"bold":{"weight":700,"italic":false,"postScriptName":"SFPro-Semibold","lineHeight":null},"italicItalic":{"weight":400,"italic":true,"postScriptName":"SFPro-RegularItalic","lineHeight":null}},
  },
  title3: {
    name: "Title3",
    size: 20,
    leading: {"default":null,"loose":null,"tight":null},
    variants: {"default":{"weight":400,"italic":false,"postScriptName":"SFPro-Regular","lineHeight":null},"bold":{"weight":700,"italic":false,"postScriptName":"SFPro-Semibold","lineHeight":null}},
  },
  headline: {
    name: "Headline",
    size: 17,
    leading: {"default":null,"loose":null,"tight":null},
    variants: {"default":{"weight":400,"italic":false,"postScriptName":"SFPro-Semibold","lineHeight":null},"bolditalicItalic":{"weight":700,"italic":true,"postScriptName":"SFPro-SemiboldItalic","lineHeight":null}},
  },
  caption2: {
    name: "Caption2",
    size: 11,
    leading: {"default":null,"loose":null,"tight":null},
    variants: {"bold":{"weight":700,"italic":false,"postScriptName":"SFPro-Semibold","lineHeight":null},"italicItalic":{"weight":400,"italic":true,"postScriptName":"SFPro-RegularItalic","lineHeight":null},"bolditalicItalic":{"weight":700,"italic":true,"postScriptName":"SFPro-SemiboldItalic","lineHeight":null},"default":{"weight":400,"italic":false,"postScriptName":"SFPro-Regular","lineHeight":null}},
  },
  body: {
    name: "Body",
    size: 17,
    leading: {"default":null,"loose":null,"tight":null},
    variants: {"bold":{"weight":700,"italic":false,"postScriptName":"SFPro-Semibold","lineHeight":null},"default":{"weight":400,"italic":false,"postScriptName":"SFPro-Regular","lineHeight":null},"bolditalicItalic":{"weight":700,"italic":true,"postScriptName":"SFPro-SemiboldItalic","lineHeight":null},"italicItalic":{"weight":400,"italic":true,"postScriptName":"SFPro-RegularItalic","lineHeight":null}},
  },
  caption1: {
    name: "Caption1",
    size: 12,
    leading: {"default":null,"loose":null,"tight":null},
    variants: {"bold":{"weight":700,"italic":false,"postScriptName":"SFPro-Medium","lineHeight":null},"bolditalicItalic":{"weight":700,"italic":true,"postScriptName":"SFPro-MediumItalic","lineHeight":null},"italicItalic":{"weight":400,"italic":true,"postScriptName":"SFPro-RegularItalic","lineHeight":null},"default":{"weight":400,"italic":false,"postScriptName":"SFPro-Regular","lineHeight":null}},
  },
  subheadline: {
    name: "Subheadline",
    size: 15,
    leading: {"default":null,"loose":null,"tight":null},
    variants: {"bolditalicItalic":{"weight":700,"italic":true,"postScriptName":"SFPro-SemiboldItalic","lineHeight":null},"default":{"weight":400,"italic":false,"postScriptName":"SFPro-Regular","lineHeight":null},"bold":{"weight":700,"italic":false,"postScriptName":"SFPro-Semibold","lineHeight":null},"italicItalic":{"weight":400,"italic":true,"postScriptName":"SFPro-RegularItalic","lineHeight":null}},
  },
  largetitle: {
    name: "LargeTitle",
    size: 34,
    leading: {"default":null,"tight":null,"loose":null},
    variants: {"bold":{"weight":700,"italic":false,"postScriptName":"SFPro-Bold","lineHeight":null},"default":{"weight":400,"italic":false,"postScriptName":"SFPro-Regular","lineHeight":null}},
  },
  title1: {
    name: "Title1",
    size: 28,
    leading: {"default":null,"loose":null,"tight":null},
    variants: {"default":{"weight":400,"italic":false,"postScriptName":"SFPro-Regular","lineHeight":null},"bold":{"weight":700,"italic":false,"postScriptName":"SFPro-Bold","lineHeight":null}},
  },
  title2: {
    name: "Title2",
    size: 22,
    leading: {"default":null,"loose":null,"tight":null},
    variants: {"bold":{"weight":700,"italic":false,"postScriptName":"SFPro-Bold","lineHeight":null},"default":{"weight":400,"italic":false,"postScriptName":"SFPro-Regular","lineHeight":null}},
  },
  callout: {
    name: "Callout",
    size: 16,
    leading: {"default":null,"loose":null,"tight":null},
    variants: {"bolditalicItalic":{"weight":700,"italic":true,"postScriptName":"SFPro-SemiboldItalic","lineHeight":null},"default":{"weight":400,"italic":false,"postScriptName":"SFPro-Regular","lineHeight":null},"bold":{"weight":700,"italic":false,"postScriptName":"SFPro-Semibold","lineHeight":null},"italicItalic":{"weight":400,"italic":true,"postScriptName":"SFPro-RegularItalic","lineHeight":null}},
  },
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
  "light/regular - small": {
    name: "Light/Regular - Small",
    background: "#f8f8f8",
    blur: 6,
  },
  "dark/regular - small": {
    name: "Dark/Regular - Small",
    background: "#000000",
    blur: 6,
  },
  "light/regular - medium": {
    name: "Light/Regular - Medium",
    background: "#cccccc",
    blur: 15,
  },
  "dark/regular - medium": {
    name: "Dark/Regular - Medium",
    background: "#1a1a1a",
    blur: 30,
  },
  "lock screen time": {
    name: "Lock Screen Time",
    background: "#f8f8f8",
    blur: 3,
  },
  "light/dock": {
    name: "Light/Dock",
    background: "#999999",
    blur: 3,
  },
  "dark/dock": {
    name: "Dark/Dock",
    background: "#333333",
    blur: 3,
  },
  "dark/regular - large": {
    name: "Dark/Regular - Large",
    background: "#1a1a1a",
    blur: 30,
  },
  "light/regular - large": {
    name: "Light/Regular - Large",
    background: "#ffffff",
    blur: 30,
  },
  "light/regular - small - tinted": {
    name: "Light/Regular - Small - Tinted",
    background: "#ffffff",
    blur: 6,
  },
  "dark/regular - small - tinted": {
    name: "Dark/Regular - Small - Tinted",
    background: "#000000",
    blur: 6,
  },
  "clear": {
    name: "Clear",
    background: "#f8f8f8",
    blur: 3,
  },
  "light/keyboard background": {
    name: "Light/Keyboard Background",
    background: "#d4d4d4",
    blur: 4,
  },
  "dark/keyboard background": {
    name: "Dark/Keyboard Background",
    background: "#000000",
    blur: 8,
  },
  "dark/app library": {
    name: "Dark/App Library",
    background: "#f8f8f8",
    blur: 5,
  },
  "light/app library": {
    name: "Light/App Library",
    background: "#f8f8f8",
    blur: 5,
  },
  "widget glass": {
    name: "Widget Glass",
    background: "#d8d8d8",
    blur: 3,
  },
  "light/regular - small - inactive": {
    name: "Light/Regular - Small - Inactive",
    background: "#000000",
    blur: null,
  },
  "dark/regular - small - inactive": {
    name: "Dark/Regular - Small - Inactive",
    background: "#767680",
    blur: null,
  },
};
