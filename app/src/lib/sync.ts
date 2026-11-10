// Regla de reconciliación entre la caché local y la fila de la nube.
//
// Al entrar, la app carga el comercio desde `businesses.data` y lo toma como
// autoridad. Pero el guardado remoto va con *debounce*: si la pestaña se
// recarga (o se cierra, o se trabaja sin red) entre la escritura local y la
// confirmación de la nube, la fila remota está más vieja que la caché. Sin
// esta regla, esa diferencia se convierte en datos perdidos: ventas y
// productos que el cajero ya veía guardados desaparecen al volver a entrar.
//
// La marca «pendiente» la escribe el store en cada caché local y la borra
// cuando la nube confirma, así que solo puede existir si queda algo por subir.

import type { AppState } from "./types";

/**
 * Devuelve `true` cuando la caché local debe ganar a la fila remota.
 *
 * @param pendiente  milisegundos de la última escritura local sin confirmar (o `null`)
 * @param updatedAt  milisegundos de `businesses.updated_at` (o `null` si no hay fila)
 * @param tieneContenido  la caché trae algo propio (no es un borrador vacío)
 */
export function cacheAdelantada({
  pendiente,
  updatedAt,
  tieneContenido,
}: {
  pendiente: number | null;
  updatedAt: number | null;
  tieneContenido: boolean;
}): boolean {
  if (pendiente === null || !tieneContenido) return false;
  // Sin fila todavía no hay nada que pisar: la caché es lo único que existe.
  return updatedAt === null || pendiente > updatedAt;
}

// ---------------------------------------------------------------------
// Sincronía entre pestañas del mismo navegador (BLINK-067).
//
// El oyente `storage` viejo REEMPLAZABA el estado completo con la copia de
// la otra pestaña: dos pestañas que cobraran casi a la vez se pisaban y la
// venta de una desaparecía sin aviso. Ahora se MEZCLA: sobre lo que llega se
// re-aplican los cambios locales hechos desde la última escritura propagada
// (upserts por id, gana el registro más reciente) y las eliminaciones
// locales se respetan. El resto de los campos (configuración, tasa, caja)
// llega como antes: la última escritura gana, salvo `nextSaleNumber`, que
// es monotónico y nunca baja.
// ---------------------------------------------------------------------

/** Colecciones del estado identificadas por `id` que se mezclan por unión. */
const KEYED = [
  "taxes",
  "categories",
  "channels",
  "locations",
  "products",
  "contacts",
  "sales",
  "openTabs",
  "accounts",
  "movements",
  "transfers",
  "pendings",
  "expenses",
  "recurringExpenses",
  "expenseCategories",
  "discounts",
  "surcharges",
  "inventoryMoves",
  "purchases",
  "stockReturns",
  "stockAdjustments",
  "stockTransfers",
  "cashClosures",
] as const;

type Keyed = (typeof KEYED)[number];
type WithId = { id: string; at?: string };

const json = (v: unknown) => JSON.stringify(v);

function keyedItems(s: AppState, key: Keyed): WithId[] {
  return (s[key] ?? []) as unknown as WithId[];
}

/**
 * Mezcla el estado escrito por la otra pestaña con los cambios locales aún
 * no propagados (diferencia entre `prev` — lo último que esta pestaña
 * escribió — y `local` — lo que tiene ahora). Sin `prev` (pestaña recién
 * abierta que aún no ha escrito) se adopta tal cual lo que llega.
 */
export function mergeTabState(
  incoming: AppState,
  local: AppState,
  prev: AppState | null
): AppState {
  if (!prev) return incoming;
  const out: AppState = { ...incoming };
  for (const key of KEYED) {
    const prevMap = new Map(keyedItems(prev, key).map((i) => [i.id, i]));
    const incomingMap = new Map(keyedItems(incoming, key).map((i) => [i.id, i]));
    const localItems = keyedItems(local, key);
    const kept: WithId[] = [];
    // 1) Eliminaciones locales desde la última escritura: siguen borradas.
    for (const item of keyedItems(incoming, key)) {
      const estaba = prevMap.get(item.id);
      const sigue = localItems.some((l) => l.id === item.id);
      if (estaba && !sigue) continue; // aquí se borró: no resucita
      kept.push(item);
    }
    // 2) Cambios y altas locales: se re-aplican sobre lo que llegó.
    for (const item of localItems) {
      const estaba = prevMap.get(item.id);
      const cambioLocal = !estaba || json(estaba) !== json(item);
      if (!cambioLocal) continue; // sin edición local, manda la otra pestaña
      const otro = incomingMap.get(item.id);
      if (!otro) {
        kept.push(item);
        continue;
      }
      // Conflicto: gana el registro con marca de tiempo más reciente.
      const tLocal = Date.parse(item.at ?? "") || 0;
      const tOtro = Date.parse(otro.at ?? "") || 0;
      kept.push(tLocal >= tOtro ? item : otro);
    }
    (out[key] as unknown as WithId[]) = dedupeById(kept);
  }
  // El correlativo es monotónico: nunca baja del máximo ya emitido.
  out.nextSaleNumber = Math.max(incoming.nextSaleNumber ?? 1, local.nextSaleNumber ?? 1);
  return desempataCodigosVentas(out);
}

/**
 * Dos pestañas que cobren dentro de la ventana del debounce pueden emitir el
 * MISMO código con ventas distintas (cada una partía del mismo correlativo).
 * La mezcla conserva ambas ventas; aquí se re-numera la MÁS RECIENTE al
 * siguiente código libre para que no queden duplicados (BLINK-067).
 */
function desempataCodigosVentas(out: AppState): AppState {
  const pad = (n: number) => String(Math.max(1, n)).padStart(6, "0");
  type Ventas = { id: string; code: string; at?: string }[];
  const todas = [
    ...((out.sales ?? []) as Ventas),
    ...((out.openTabs ?? []) as Ventas),
  ].sort((a, b) => (a.at ?? "").localeCompare(b.at ?? ""));
  const usados = new Set<string>();
  const cambiar = new Map<string, string>();
  let next = out.nextSaleNumber ?? 1;
  for (const s of todas) {
    if (usados.has(s.code)) {
      const esCotizacion = s.code.startsWith("C-");
      let n = Math.max(next, 1);
      let code = esCotizacion ? `C-${pad(n)}` : pad(n);
      while (usados.has(code)) {
        n += 1;
        code = esCotizacion ? `C-${pad(n)}` : pad(n);
      }
      cambiar.set(s.id, code);
      usados.add(code);
      next = n + 1;
    } else {
      usados.add(s.code);
    }
  }
  if (!cambiar.size) return out;
  const aplica = (arr: Ventas) =>
    (arr as { id: string; code: string; at?: string }[]).map((s) =>
      cambiar.has(s.id) ? { ...s, code: cambiar.get(s.id)! } : s
    ) as unknown as Ventas;
  return {
    ...out,
    sales: aplica(out.sales as unknown as Ventas) as unknown as AppState["sales"],
    openTabs: aplica(out.openTabs as unknown as Ventas) as unknown as AppState["openTabs"],
    nextSaleNumber: Math.max(out.nextSaleNumber ?? 1, next),
  };
}

function dedupeById(items: WithId[]): WithId[] {
  const seen = new Map<string, WithId>();
  for (const item of items) seen.set(item.id, item);
  return [...seen.values()];
}
