// Venta rápida: qué productos merecen estar a un toque del cajero.
//
// Módulo puro y sin estado: recibe el historial y el catálogo, devuelve listas.
// Así la rotación se puede probar sin Renderizar nada y la pantalla de Vender
// solo consume. Si este módulo falla, la venta normal sigue funcionando: no
// toca el dinero ni el inventario, solo sugiere.
import type { Product, Sale } from "./types";

/** Ventana de rotación por defecto: lo más vendido en el último mes. */
export const DIAS_ROTACION = 30;
/** Cuántas teclas rápidas caben en el panel (los dígitos 1-9). */
export const RAPIDOS_MAX = 9;

/**
 * Unidades vendidas por producto dentro de la ventana.
 *
 * No cuentan las anuladas (la venta no existió) ni las cotizaciones (todavía
 * no se cobraron) ni las líneas en cortesía (salieron del estante pero no son
 * demanda: fijarlas como «más vendido» inflaría un regalo).
 */
export function rotacion(
  sales: Sale[],
  dias = DIAS_ROTACION,
  ahora = Date.now()
): Map<string, number> {
  const desde = ahora - dias * 86_400_000;
  const cuenta = new Map<string, number>();
  for (const s of sales) {
    if (s.status === "anulada" || s.status === "cotizacion") continue;
    if (new Date(s.at).getTime() < desde) continue;
    for (const l of s.lines) {
      if (l.cortesia) continue;
      cuenta.set(l.productId, (cuenta.get(l.productId) ?? 0) + l.qty);
    }
  }
  return cuenta;
}

/** Catálogo ordenable: activo, sin archivar y con precio. */
const vendible = (p: Product) => p.active && !p.archived;

/**
 * Los más vendidos de la ventana. Empata con el nombre para que el orden sea
 * estable entre renders (sin esto, dos productos con la misma rotación
 * saltaban de lugar en cada tecla que se pulsaba).
 */
export function mejorVendidos(
  sales: Sale[],
  products: Product[],
  opts: { dias?: number; max?: number; ahora?: number } = {}
): Product[] {
  const cuenta = rotacion(sales, opts.dias ?? DIAS_ROTACION, opts.ahora ?? Date.now());
  const max = opts.max ?? RAPIDOS_MAX;
  return products
    .filter((p) => vendible(p) && (cuenta.get(p.id) ?? 0) > 0)
    .sort(
      (a, b) =>
        (cuenta.get(b.id) ?? 0) - (cuenta.get(a.id) ?? 0) ||
        a.name.localeCompare(b.name, "es")
    )
    .slice(0, max);
}

/** Productos que el cajero fijó a mano, en orden alfabético. */
export function favoritos(products: Product[], max = RAPIDOS_MAX): Product[] {
  return products
    .filter((p) => p.favorite && vendible(p))
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
    .slice(0, max);
}
