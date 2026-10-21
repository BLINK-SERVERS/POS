// ============================================================
// BLINK POS · Registro de iconos
// ------------------------------------------------------------
// El set completo de SF Symbols pesa 182 KB. La landing (y la pantalla
// de error) solo usan 13, asi que los iconos estan repartidos:
//
//   · `sf-nucleo.ts` → los 13 que usan las paginas del chunk
//     principal. Van en el bundle inicial.
//   · `sf-symbols.ts` → los 100. Los carga la aplicacion.
//
// El componente <Icon> lee de este registro, y la aplicacion mete el
// set completo al entrar (`registrarIconos`).
// ============================================================
import { SF_NUCLEO } from "./sf-nucleo";
import type { SfSymbol } from "./sf-symbols";

/** Iconos conocidos: el nucleo mas los que registre la aplicacion. */
const REGISTRO: Record<string, SfSymbol> = { ...SF_NUCLEO };

/** Devuelve el glifo de un icono, o `undefined` si no existe. */
export function getIcon(name: string): SfSymbol | undefined {
  return REGISTRO[name];
}

/** Anade iconos al registro (lo llama la aplicacion al cargar). */
export function registrarIconos(iconos: Record<string, SfSymbol>): void {
  Object.assign(REGISTRO, iconos);
}
