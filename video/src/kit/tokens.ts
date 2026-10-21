// ============================================================
// Tokens del comercial: la paleta oficial de BLINK y las medidas
// reales del UI Kit de iOS 27.
//
// Fuentes de verdad:
//   · app/src/styles/tokens.css   -> la paleta (light-dark)
//   · docs/ios27-geometry.json    -> las medidas del UI Kit
//   · docs/DESIGN_IOS27_KIT.md     -> los estilos de texto
//
// `npm run verificar` (scripts/verificar-tokens.mjs) comprueba que la
// paleta de aqui no se desincroniza de la de la app.
// ============================================================

/** Los diez grupos de la paleta oficial BLINK, con su par claro/oscuro. */
export const PALETA = {
  rojo: { claro: "#ff383c", oscuro: "#ff4245" },
  crimson: { claro: "#ff2d55", oscuro: "#ff375f" },
  naranja: { claro: "#ff8d28", oscuro: "#ff9230" },
  amarillo: { claro: "#ffcc00", oscuro: "#ffd600" },
  verde: { claro: "#34c759", oscuro: "#30d158" },
  teal1: { claro: "#00c8b3", oscuro: "#00dac3" },
  teal2: { claro: "#00c3d0", oscuro: "#0fd5e2" },
  cian: { claro: "#00c0e8", oscuro: "#3cd3fe" },
  azul: { claro: "#0088ff", oscuro: "#0091ff" },
  indigo: { claro: "#6a5ff6", oscuro: "#7684ff" },
  magenta: { claro: "#ce3ce2", oscuro: "#dd40f3" },
  marron: { claro: "#b18767", oscuro: "#bb916f" },
} as const;

/** Acento principal: el Azul Principal de BLINK. */
export const ACENTO = PALETA.azul.claro;
export const ACENTO_OSCURO = PALETA.azul.oscuro;
export const EXITO = PALETA.verde.claro;
export const PELIGRO = PALETA.rojo.claro;

/** Superficies y texto (UI Kit · iOS 27). */
export const PAPEL = "#FFFEFB";
export const TINTA = "#1D1D1F";
export const TINTA_2 = "#424242";
export const MARCO = "#1d1d1f";
export const HALO = "#ffffff";

/**
 * Medidas reales del UI Kit (`docs/ios27-geometry.json`).
 * Los nombres son los de los simbolos del propio kit.
 */
export const METRICAS = {
  /** Boton Large: 50 de alto. Boton Medium: 34. Boton Small: 28. */
  botonGrande: 50,
  botonMedio: 34,
  botonPequeno: 28,
  /** Boton con texto: 72 x 50. Con simbolo y texto: 91 x 50. */
  botonConTexto: { w: 72, h: 50 },
  /** Item de tab bar: 54 x 54; con etiqueta, 72 x 54. */
  tabBarItem: { w: 54, h: 54 },
  tabBarItemConEtiqueta: { w: 72, h: 54 },
  /** Campo de texto: 288 x 52. */
  campo: { w: 288, h: 52 },
  /** Fila de lista: 402 x 52. */
  fila: { w: 402, h: 52 },
  /** Area tactil minima: 44 pt. */
  toque: 44,
  /** Radios de iOS. */
  radio: { sm: 8, md: 12, lg: 18, panel: 22, pildora: 999 },
} as const;

/**
 * Escala tipografica de iOS 27 (UI Kit · "Text Styles and Dynamic Type").
 * `opsz` es el eje optico: el mismo corte de SF Pro se adapta al cuerpo.
 */
export const TIPOGRAFIA = {
  largeTitle: { size: 34, line: 41, weight: 700 },
  title1: { size: 28, line: 34, weight: 700 },
  title2: { size: 22, line: 28, weight: 700 },
  title3: { size: 20, line: 25, weight: 600 },
  headline: { size: 17, line: 22, weight: 600 },
  body: { size: 17, line: 22, weight: 400 },
  callout: { size: 16, line: 21, weight: 400 },
  subheadline: { size: 15, line: 20, weight: 400 },
  footnote: { size: 13, line: 18, weight: 400 },
  caption1: { size: 12, line: 16, weight: 400 },
  caption2: { size: 11, line: 13, weight: 400 },
} as const;

/**
 * Movimiento. Remotion no tiene "spring" de iOS: se emula con un
 * `spring()` de Remotion afinado a cada caso.
 *
 * · `entrada`: la Luka de un bloque que aparece.
 * · `desplazamiento`: elacompanamiento de un elemento al cambiar.
 * · `pulse`: el latido de una cifra o un icono que llama la atencion.
 */
export const MOVIMIENTO = {
  entrada: { damping: 200, mass: 0.7, stiffness: 120 },
  desplazamiento: { damping: 26, mass: 0.9, stiffness: 180 },
  suave: { damping: 30, mass: 1, stiffness: 120 },
  pulse: { damping: 12, mass: 0.6, stiffness: 200 },
} as const;

/** Duraciones de referencia (a 30 fps, el comercial usa 30 fps). */
export const DURACION = {
  cuadro: 1 / 30,
  rapido: 0.25,
  medio: 0.5,
  lento: 0.9,
} as const;

/** Estilo del material "Liquid Glass" del UI Kit. */
export const CRISTAL = {
  blur: 20,
  saturate: 180,
  radio: 22,
  borde: "rgba(66, 66, 66, 0.12)",
  sombra: "0 1px 2px rgba(29,29,31,0.04), 0 12px 32px rgba(29,29,31,0.07)",
  especular: "inset 0 1px 0 rgba(255,255,255,0.55)",
} as const;
