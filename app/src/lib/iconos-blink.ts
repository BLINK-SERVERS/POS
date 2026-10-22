// ============================================================
// BLINK POS · Iconos propios de la marca
// ------------------------------------------------------------
// Los SF Symbols de Apple tienen su licencia (docs/ICONOS_Y_PWA.md)
// y no se pueden modificar. Estos iconos son drawings de BLINK:
//
//   · grid2x2.solid — los cuatro cuadrados del icono de General,
//     RELLENOS (el de Apple viene con hueco: es un contorno).
//
// Se registran en el mismo diccionario que los SF Symbols
// (lib/iconos.ts), asi que el componente <Icon> los usa igual.
import type { SfSymbol } from "./sf-symbols";

/** Cuadrado de 16x16 con radio 4, en el origen. */
const CUADRADO =
  "<path d='M 4 0 H 12 A 4 4 0 0 1 16 4 V 12 A 4 4 0 0 1 12 16 H 4 A 4 4 0 0 1 0 12 V 4 A 4 4 0 0 1 4 0 Z' />";

/** Coloca un cuadrado en (x, y). */
const en = (x: number, y: number) =>
  `<g transform='translate(${x} ${y})'>${CUADRADO}</g>`;

export const ICONOS_BLINK: Record<string, SfSymbol> = {
  "grid2x2.solid": {
    viewBox: "0 0 38 38",
    body:
      "<g fill='currentColor'>" +
      en(1, 1) +
      en(21, 1) +
      en(1, 21) +
      en(21, 21) +
      "</g>",
  },
};
