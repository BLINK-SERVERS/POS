// Reglas puras de integridad del libro: existencias y reversión de abonos.
//
// Se mantienen fuera del store para poder probarlas sin React ni Supabase.
import type { Account, Movement, Pending, Product, SaleLine } from "./types";
import { round2 } from "./money";

export interface StockShortage {
  product: Product;
  line: SaleLine;
}

/** Primera línea que pide más de lo disponible en un producto con stock. */
export function findStockShortage(products: Product[], lines: SaleLine[]): StockShortage | null {
  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product || !product.trackStock) continue;
    if (line.qty > product.stock) return { product, line };
  }
  return null;
}

interface ReversePendingInput {
  accounts: Account[];
  movements: Movement[];
  pending: Pending;
  at: string;
  origin: string;
  note: string;
  userId: string;
}

interface ReversePendingResult {
  accounts: Account[];
  movements: Movement[];
  /** Asientos de abono efectivamente revertidos. */
  reversed: number;
}

/**
 * Revierte los abonos de un pendiente: devuelve el importe nativo a cada
 * cuenta y deja el asiento inverso en el libro.
 *
 * Los abonos nuevos llevan `pendingId`; los antiguos no lo tienen, así que
 * como respaldo se aceptan los de origen "Abono" cuya nota sea el concepto
 * del pendiente. Un asiento ya revertido (`reversedAt`) no se toca: anular
 * primero la venta y después el pendiente no resta el dinero dos veces.
 */
export function reversePendingAbonos({
  accounts,
  movements,
  pending,
  at,
  origin,
  note,
  userId,
}: ReversePendingInput): ReversePendingResult {
  const matched = movements.filter(
    (m) =>
      !m.reversedAt &&
      (m.pendingId === pending.id ||
        (!m.pendingId && m.origin === "Abono" && m.note === pending.subject))
  );
  if (!matched.length) return { accounts, movements, reversed: 0 };

  let accountsNext = accounts;
  const inverses: Movement[] = [];
  const reversedIds = new Set<string>();

  for (const m of matched) {
    const account = accountsNext.find((a) => a.id === m.accountId);
    if (!account) continue;
    const native =
      m.amountInput ?? (account.currency === "USD" ? m.amountUsd : null);
    if (native === null) continue;

    const delta = m.direction === "entrada" ? -native : native;
    accountsNext = accountsNext.map((a) =>
      a.id === account.id ? { ...a, balance: round2(a.balance + delta) } : a
    );
    reversedIds.add(m.id);
    inverses.push({
      id: `rev_${m.id}`,
      at,
      accountId: m.accountId,
      direction: m.direction === "entrada" ? "salida" : "entrada",
      amountUsd: m.amountUsd,
      currency: m.currency ?? account.currency,
      amountInput: round2(native),
      origin,
      note: m.note ? `${note} · ${m.note}` : note,
      userId,
      reversalOf: m.id,
    });
  }

  if (!inverses.length) return { accounts, movements, reversed: 0 };

  return {
    accounts: accountsNext,
    movements: [
      ...inverses,
      ...movements.map((m) => (reversedIds.has(m.id) ? { ...m, reversedAt: at } : m)),
    ],
    reversed: inverses.length,
  };
}
