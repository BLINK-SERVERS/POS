// Los simbolos de la interfaz: los mismos SF Symbols que usa la app.
//
// Se importan del modulo generado de la web (`app/src/lib/sf-symbols.ts`),
// de modo que el comercial y la app comparten exactamente el mismo
// glifo. El fichero es solo datos (sin dependencias), asi que no arrastra
// nada del bundle web.
import { SF_SYMBOLS } from "../../../app/src/lib/sf-symbols";

export type NombreSimbolo = string;

type Simbolo = { viewBox: string; body: string };

const CATALOGO = SF_SYMBOLS as unknown as Record<string, Simbolo>;

/** Glifos que usa el comercial. Si alguno no existiera, se avisa. */
export const SIMBOLOS_COMERCIAL = [
  "dollarsign",
  "cart",
  "clock",
  "tag",
  "box",
  "users",
  "wallet",
  "chart",
  "chartLine",
  "grid2x2",
  "scan",
  "check",
  "search",
  "arrowRight",
  "arrowUp",
  "arrowDown",
  "trendUp",
  "qr",
  "settings",
  "person",
  "store",
  "logout",
] as const;

/**
 * Un simbolo del set de la app, dibujado con `currentColor` para que
 * herede el color del texto (igual que en la web).
 */
export function Simbolo({
  nombre,
  tam = 24,
  color,
  opacidad,
}: {
  nombre: NombreSimbolo;
  tam?: number;
  color?: string;
  opacidad?: number;
}) {
  const s = CATALOGO[nombre];
  if (!s) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Simbolo desconocido: "${nombre}"`);
    }
    return null;
  }
  return (
    <svg
      viewBox={s.viewBox}
      width={tam}
      height={tam}
      fill={color ?? "currentColor"}
      opacity={opacidad}
      dangerouslySetInnerHTML={{ __html: s.body }}
    />
  );
}
