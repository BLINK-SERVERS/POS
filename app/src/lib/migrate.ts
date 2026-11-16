// Migraciones de esquema de datos guardados (localStorage / JSONB de Supabase).
//
// Se aíslan aquí, fuera de `store.tsx`, para poder probarlas sin arrastrar
// React, Supabase ni el DOM. Son funciones PURAS: reciben datos de una versión
// anterior y devuelven el objeto con la forma actual.
import type { Product } from "./types";
import { UNIT_OPTIONS, type UnitOption } from "./types";

/**
 * Normaliza un producto guardado con una versión anterior del esquema.
 *
 * Cambios acumulados:
 *  · Fase B (v1.3.5): se elimina `type` ("simple" | "servicio"); los
 *    productos que eran `servicio` dejan de controlar stock.
 *  · Presentación: `qty`+`unit` se normaliza a `presentationQty` + `unit`
 *    de la lista cerrada `UNIT_OPTIONS`.
 *  · BLINK-104: `priceBs` (precio fijo en bolívares) se normaliza; un valor
 *    basura se quita en lugar de dejarlo como precio cero.
 */
export function migrateProduct(p: Product): Product {
  const legacy = p as Product & { type?: "simple" | "servicio" };
  const unit: string = UNIT_OPTIONS.includes(legacy.unit as UnitOption)
    ? legacy.unit
    : "unidad";
  return {
    ...p,
    brand: p.brand ?? "",
    archived: p.archived ?? false,
    channelPrices: p.channelPrices ?? { ch_principal: p.price },
    presentationQty: p.presentationQty ?? 1,
    unit,
    priceBs: normalizePriceBs(p.priceBs),
    trackStock: legacy.type === "servicio" ? false : (p.trackStock ?? true),
  };
}

/**
 * Precio fijo en Bs: se conserva solo si es un número finito y positivo.
 *
 * Un valor corrupto NO puede quedarse en 0: 0 Bs significaría "este producto
 * es gratis", que es justo lo contrario de "no tiene precio fijo". Sin precio
 * fijo el producto sigue anclado a la tasa.
 */
export function normalizePriceBs(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}
