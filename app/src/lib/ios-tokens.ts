/**
 * Tokens de color del sistema iOS 27 (extraidos del paquete oficial SF Symbols 27).
 *
 * Fuente: `SF Symbols 27.dmg` -> `SFSymbolsShared.framework/Resources/colors-26.csv`.
 * Cada color trae su variante estandar y "vibrant" para los modos claro y oscuro,
 * mas las variantes de contraste alto.
 *
 * Estos valores son datos objetivos de la plataforma (no assets con licencia de
 * uso restringido), por lo que se pueden replicar en cualquier producto.
 */

export type IosColorName =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "mint"
  | "teal"
  | "cyan"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "brown"
  | "white"
  | "gray"
  | "black"
  | "primary"
  | "secondary"
  | "tertiary"
  | "quatenary"
  | "quinary";

export interface IosColorToken {
  /** Nombre corto (red, blue, label...). */
  name: string;
  /** Nombre oficial en macOS/iOS (systemBlueColor, labelColor...). */
  macos: string;
  /** Modo claro, variante estandar. */
  light: string;
  /** Modo claro, variante vibrant. */
  lightVibrant: string;
  /** Modo oscuro, variante estandar. */
  dark: string;
  /** Modo oscuro, variante vibrant. */
  darkVibrant: string;
  /** Contraste alto, modo claro. */
  lightContrast: string;
  /** Contraste alto, modo oscuro. */
  darkContrast: string;
  /** Contraste alto + vibrant, modo claro. */
  lightVibrantContrast: string;
  /** Contraste alto + vibrant, modo oscuro. */
  darkVibrantContrast: string;
  /** Opacidad (en %) de las capas primary/secondary/tertiary. */
  layers: { lightPrimary: string; lightSecondary: string; lightTertiary: string; darkPrimary: string; darkSecondary: string; darkTertiary: string };
}

export const IOS_COLORS: Record<IosColorName, IosColorToken> = {
  red: {
    name: "red",
    macos: "systemRedColor",
    light: "#ff383c",
    lightVibrant: "#f52f32",
    dark: "#ff4245",
    darkVibrant: "#ff4747",
    lightContrast: "#e9152d",
    darkContrast: "#ff6165",
    lightVibrantContrast: "#d40d23",
    darkVibrantContrast: "#ff6165",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "20" },
  },
  orange: {
    name: "orange",
    macos: "systemOrangeColor",
    light: "#ff8d28",
    lightVibrant: "#f58625",
    dark: "#ff9230",
    darkVibrant: "#ff9e33",
    lightContrast: "#c55300",
    darkContrast: "#ffa056",
    lightVibrantContrast: "#a84600",
    darkVibrantContrast: "#ffa056",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  yellow: {
    name: "yellow",
    macos: "systemYellowColor",
    light: "#ffcc00",
    lightVibrant: "#f5c200",
    dark: "#ffd600",
    darkVibrant: "#ffe014",
    lightContrast: "#a16a00",
    darkContrast: "#fedf43",
    lightVibrantContrast: "#915c00",
    darkVibrantContrast: "#fedf43",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "20", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  green: {
    name: "green",
    macos: "systemGreenColor",
    light: "#34c759",
    lightVibrant: "#26bf4d",
    dark: "#30d158",
    darkVibrant: "#3bdb63",
    lightContrast: "#008932",
    darkContrast: "#4ad968",
    lightVibrantContrast: "#00732a",
    darkVibrantContrast: "#4ad968",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  mint: {
    name: "mint",
    macos: "systemMintColor",
    light: "#00c8b3",
    lightVibrant: "#00bda9",
    dark: "#00dac3",
    darkVibrant: "#2de0cd",
    lightContrast: "#008575",
    darkContrast: "#54dfcb",
    lightVibrantContrast: "#007869",
    darkVibrantContrast: "#54dfcb",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  teal: {
    name: "teal",
    macos: "systemTealColor",
    light: "#00c3d0",
    lightVibrant: "#00b3bf",
    dark: "#00d2e0",
    darkVibrant: "#2dd7e0",
    lightContrast: "#008198",
    darkContrast: "#3bddec",
    lightVibrantContrast: "#00778c",
    darkVibrantContrast: "#3bddec",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  cyan: {
    name: "cyan",
    macos: "systemCyanColor",
    light: "#00c0e8",
    lightVibrant: "#00abcf",
    dark: "#3cd3fe",
    darkVibrant: "#47d8fc",
    lightContrast: "#007eae",
    darkContrast: "#6dd9ff",
    lightVibrantContrast: "#0074a1",
    darkVibrantContrast: "#6dd9ff",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  blue: {
    name: "blue",
    macos: "systemBlueColor",
    light: "#0088ff",
    lightVibrant: "#0078f0",
    dark: "#0091ff",
    darkVibrant: "#0a99ff",
    lightContrast: "#1e6ef4",
    darkContrast: "#5cb8ff",
    lightVibrantContrast: "#0459e0",
    darkVibrantContrast: "#5cb8ff",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  indigo: {
    name: "indigo",
    macos: "systemIndigoColor",
    light: "#6155f5",
    lightVibrant: "#5c50e6",
    dark: "#6b5dff",
    darkVibrant: "#7163ff",
    lightContrast: "#564ade",
    darkContrast: "#a7aaff",
    lightVibrantContrast: "#483dbf",
    darkVibrantContrast: "#a7aaff",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  purple: {
    name: "purple",
    macos: "systemPurpleColor",
    light: "#cb30e0",
    lightVibrant: "#b72bc9",
    dark: "#db34f2",
    darkVibrant: "#e647fc",
    lightContrast: "#b02fc2",
    darkContrast: "#ea8dff",
    lightVibrantContrast: "#9827a8",
    darkVibrantContrast: "#ea8dff",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  pink: {
    name: "pink",
    macos: "systemPinkColor",
    light: "#ff2d55",
    lightVibrant: "#f5234b",
    dark: "#ff375f",
    darkVibrant: "#ff4169",
    lightContrast: "#e7124d",
    darkContrast: "#ff8ac4",
    lightVibrantContrast: "#d4113e",
    darkVibrantContrast: "#ff8ac4",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "20" },
  },
  brown: {
    name: "brown",
    macos: "systemBrownColor",
    light: "#ac7f5e",
    lightVibrant: "#9e7354",
    dark: "#b78a66",
    darkVibrant: "#c29672",
    lightContrast: "#956d51",
    darkContrast: "#dba679",
    lightVibrantContrast: "#876144",
    darkVibrantContrast: "#dba679",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  white: {
    name: "white",
    macos: "white",
    light: "#ffffff",
    lightVibrant: "#ffffff",
    dark: "#ffffff",
    darkVibrant: "#ffffff",
    lightContrast: "#ffffff",
    darkContrast: "#ffffff",
    lightVibrantContrast: "#ffffff",
    darkVibrantContrast: "#ffffff",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  gray: {
    name: "gray",
    macos: "systemGrayColor",
    light: "#8e8e93",
    lightVibrant: "#848489",
    dark: "#98989d",
    darkVibrant: "#a2a2a7",
    lightContrast: "#69696e",
    darkContrast: "#98989d",
    lightVibrantContrast: "",
    darkVibrantContrast: "#98989d",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  black: {
    name: "black",
    macos: "black",
    light: "#000000",
    lightVibrant: "#000000",
    dark: "#000000",
    darkVibrant: "#000000",
    lightContrast: "#000000",
    darkContrast: "#000000",
    lightVibrantContrast: "#000000",
    darkVibrantContrast: "#000000",
    layers: { lightPrimary: "100", lightSecondary: "50", lightTertiary: "18", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  primary: {
    name: "primary",
    macos: "labelColor",
    light: "#000000",
    lightVibrant: "#4c4c4c",
    dark: "#ffffff",
    darkVibrant: "#e5e5e5",
    lightContrast: "#000000",
    darkContrast: "#ffffff",
    lightVibrantContrast: "#000000",
    darkVibrantContrast: "#ffffff",
    layers: { lightPrimary: "", lightSecondary: "", lightTertiary: "", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  secondary: {
    name: "secondary",
    macos: "secondaryLabelColor",
    light: "#000000",
    lightVibrant: "#808080",
    dark: "#ffffff",
    darkVibrant: "#7c7c7c",
    lightContrast: "#000000",
    darkContrast: "#ffffff",
    lightVibrantContrast: "#000000",
    darkVibrantContrast: "#ffffff",
    layers: { lightPrimary: "", lightSecondary: "", lightTertiary: "", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  tertiary: {
    name: "tertiary",
    macos: "tertiaryLabelColor",
    light: "#000000",
    lightVibrant: "#bfbfbf",
    dark: "#ffffff",
    darkVibrant: "#414141",
    lightContrast: "#000000",
    darkContrast: "#ffffff",
    lightVibrantContrast: "#000000",
    darkVibrantContrast: "#ffffff",
    layers: { lightPrimary: "", lightSecondary: "", lightTertiary: "", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  quatenary: {
    name: "quatenary",
    macos: "quaternaryLabelColor",
    light: "#000000",
    lightVibrant: "#e6e6e6",
    dark: "#ffffff",
    darkVibrant: "#232323",
    lightContrast: "#000000",
    darkContrast: "#ffffff",
    lightVibrantContrast: "#000000",
    darkVibrantContrast: "#ffffff",
    layers: { lightPrimary: "", lightSecondary: "", lightTertiary: "", darkPrimary: "100", darkSecondary: "50", darkTertiary: "25" },
  },
  quinary: {
    name: "quinary",
    macos: "quinaryLabelColor",
    light: "#000000",
    lightVibrant: "#f2f2f2",
    dark: "#000000",
    darkVibrant: "#111111",
    lightContrast: "#000000",
    darkContrast: "#ffffff",
    lightVibrantContrast: "",
    darkVibrantContrast: "",
    layers: { lightPrimary: "", lightSecondary: "", lightTertiary: "", darkPrimary: "", darkSecondary: "", darkTertiary: "" },
  },
};

/** Resuelve un token de color segun el tema y la variante vibrant. */
export function iosColor(
  name: IosColorName,
  opts: { dark?: boolean; vibrant?: boolean; highContrast?: boolean } = {},
): string {
  const t = IOS_COLORS[name];
  if (!t) return "";
  if (opts.highContrast) {
    if (opts.dark) return opts.vibrant ? t.darkVibrantContrast : t.darkContrast;
    return opts.vibrant ? t.lightVibrantContrast : t.lightContrast;
  }
  if (opts.dark) return opts.vibrant ? t.darkVibrant : t.dark;
  return opts.vibrant ? t.lightVibrant : t.light;
}


/* ==========================================================================
   Escala tipografica (Apple HIG, iOS / iPadOS 27)
   Fuente: developer.apple.com/design/human-interface-guidelines/typography
   ========================================================================== */

export interface IosTextStyle {
  /** Nombre del estilo en el HIG. */
  name: string;
  /** Tamano en puntos. */
  size: number;
  /** Interlineado en puntos. */
  leading: number;
  /** Peso del estilo regular. */
  weight: 400 | 500 | 600 | 700;
  /** Peso del estilo enfatizado (Bold / Semibold). */
  emphasized: 600 | 700;
}

export const IOS_TEXT_STYLES: Record<string, IosTextStyle> = {
  largeTitle: { name: "Large Title", size: 31, leading: 38, weight: 400, emphasized: 700 },
  title1: { name: "Title 1", size: 25, leading: 31, weight: 400, emphasized: 700 },
  title2: { name: "Title 2", size: 19, leading: 24, weight: 400, emphasized: 700 },
  title3: { name: "Title 3", size: 17, leading: 22, weight: 400, emphasized: 600 },
  headline: { name: "Headline", size: 14, leading: 19, weight: 600, emphasized: 600 },
  body: { name: "Body", size: 14, leading: 19, weight: 400, emphasized: 600 },
  callout: { name: "Callout", size: 13, leading: 18, weight: 400, emphasized: 600 },
  subhead: { name: "Subhead", size: 12, leading: 16, weight: 400, emphasized: 600 },
  footnote: { name: "Footnote", size: 12, leading: 16, weight: 400, emphasized: 600 },
  caption1: { name: "Caption 1", size: 11, leading: 13, weight: 400, emphasized: 600 },
  caption2: { name: "Caption 2", size: 11, leading: 13, weight: 400, emphasized: 600 },
};

/** Variantes de accesibilidad (Dynamic Type AX1..AX5). */
export const IOS_TEXT_STYLES_AX = {
  ax1: { largeTitle: { size: 44, leading: 52 }, title1: { size: 38, leading: 46 }, title2: { size: 34, leading: 41 }, title3: { size: 31, leading: 38 }, headline: { size: 28, leading: 34 }, body: { size: 28, leading: 34 }, callout: { size: 26, leading: 32 }, subhead: { size: 25, leading: 31 }, footnote: { size: 23, leading: 29 }, caption1: { size: 22, leading: 28 }, caption2: { size: 20, leading: 25 } },
  ax2: { largeTitle: { size: 40, leading: 48 }, title1: { size: 35, leading: 41 }, title2: { size: 31, leading: 38 }, title3: { size: 28, leading: 34 }, headline: { size: 25, leading: 31 }, body: { size: 25, leading: 31 }, callout: { size: 23, leading: 29 }, subhead: { size: 22, leading: 28 }, footnote: { size: 20, leading: 25 }, caption1: { size: 19, leading: 24 }, caption2: { size: 17, leading: 22 } },
  ax3: { largeTitle: { size: 37, leading: 44 }, title1: { size: 32, leading: 38 }, title2: { size: 28, leading: 34 }, title3: { size: 25, leading: 31 }, headline: { size: 23, leading: 29 }, body: { size: 23, leading: 29 }, callout: { size: 21, leading: 26 }, subhead: { size: 20, leading: 25 }, footnote: { size: 18, leading: 22 }, caption1: { size: 17, leading: 22 }, caption2: { size: 15, leading: 20 } },
  ax4: { largeTitle: { size: 34, leading: 41 }, title1: { size: 29, leading: 35 }, title2: { size: 26, leading: 31 }, title3: { size: 23, leading: 29 }, headline: { size: 21, leading: 26 }, body: { size: 21, leading: 26 }, callout: { size: 19, leading: 24 }, subhead: { size: 18, leading: 23 }, footnote: { size: 16, leading: 21 }, caption1: { size: 15, leading: 20 }, caption2: { size: 14, leading: 19 } },
  ax5: { largeTitle: { size: 31, leading: 38 }, title1: { size: 27, leading: 32 }, title2: { size: 23, leading: 29 }, title3: { size: 21, leading: 26 }, headline: { size: 19, leading: 24 }, body: { size: 19, leading: 24 }, callout: { size: 17, leading: 22 }, subhead: { size: 16, leading: 21 }, footnote: { size: 15, leading: 19 }, caption1: { size: 14, leading: 18 }, caption2: { size: 13, leading: 18 } },
} as const;

/** Escala de macOS 26 (para el escritorio). */
export const MACOS_TEXT_STYLES: Record<string, IosTextStyle> = {
  largeTitle: { name: "Large Title", size: 26, leading: 32, weight: 400, emphasized: 700 },
  title1: { name: "Title 1", size: 22, leading: 26, weight: 400, emphasized: 700 },
  title2: { name: "Title 2", size: 17, leading: 22, weight: 400, emphasized: 700 },
  title3: { name: "Title 3", size: 15, leading: 20, weight: 400, emphasized: 600 },
  headline: { name: "Headline", size: 13, leading: 16, weight: 700, emphasized: 700 },
  body: { name: "Body", size: 13, leading: 16, weight: 400, emphasized: 600 },
  callout: { name: "Callout", size: 12, leading: 15, weight: 400, emphasized: 600 },
  subheadline: { name: "Subheadline", size: 11, leading: 14, weight: 400, emphasized: 600 },
  footnote: { name: "Footnote", size: 10, leading: 13, weight: 400, emphasized: 600 },
  caption1: { name: "Caption 1", size: 10, leading: 13, weight: 500, emphasized: 600 },
  caption2: { name: "Caption 2", size: 10, leading: 13, weight: 500, emphasized: 600 },
};

/* ==========================================================================
   Materiales (Apple HIG)
   ========================================================================== */

/** Materiales estandar de iOS/iPadOS para la capa de contenido. */
export const IOS_STANDARD_MATERIALS = {
  ultraThin: { blur: 10, opacity: 0.04, tint: "rgba(255,255,255,0.04)" },
  thin: { blur: 18, opacity: 0.08, tint: "rgba(255,255,255,0.08)" },
  regular: { blur: 30, opacity: 0.12, tint: "rgba(255,255,255,0.12)" },
  thick: { blur: 48, opacity: 0.18, tint: "rgba(255,255,255,0.18)" },
} as const;

/**
 * Liquid Glass: dos variantes.
 * - regular: difumina y ajusta la luminosidad del fondo (la usan los componentes del sistema).
 * - clear: muy translucido, solo para fondos visualmente ricos.
 *
 * Apple: "Don't use Liquid Glass in the content layer" y
 * "Use Liquid Glass effects sparingly" (solo en la capa funcional).
 */
export const LIQUID_GLASS = {
  regular: {
    blur: 20,
    saturate: 180,
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.18)",
    specular: "inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(255,255,255,0.12)",
    shadow: "0 10px 30px rgba(0,0,0,0.14)",
  },
  clear: {
    blur: 8,
    saturate: 160,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    specular: "inset 0 1px 0 rgba(255,255,255,0.40)",
    shadow: "0 6px 20px rgba(0,0,0,0.10)",
    dimLayer: "rgba(0,0,0,0.35)",
  },
} as const;

/** Area tactil minima: 44x44 pt. */
export const IOS_MIN_TOUCH_TARGET = 44;

/** Radio de esquina de los componentes de iOS 27 (continuo, escala por tamano). */
export const IOS_CORNER_RADIUS = {
  small: 8,
  medium: 12,
  large: 16,
  xLarge: 20,
  continuous: 22,
  capsule: 999,
} as const;
