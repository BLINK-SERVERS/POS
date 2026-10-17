// Cálculos de negocio (ventas, utilidad, capital).
import type { AppState, Sale } from "./types";
import { round2 } from "./money";

export interface Metrics {
  net: number;
  count: number;
  avgTicket: number;
  cogs: number;
  gross: number;
  expenses: number;
  profit: number;
}

/** Venta neta (base − descuento), nunca negativa. Sin IVA ni recargos. */
export function saleNet(s: Sale): number {
  const gross = s.lines.reduce((a, l) => a + l.price * l.qty, 0);
  return Math.max(0, gross - s.discount);
}

/** Costo de lo vendido de una venta. */
export function saleCost(s: Sale): number {
  return s.lines.reduce((a, l) => a + l.cost * l.qty, 0);
}

/** Total de la venta (con IVA, recargos e IGTF). */
export function saleTotal(s: Sale): number {
  return round2(saleNet(s) + s.tax + s.surcharge + s.igtf);
}

/** Una venta cuenta en los KPIs si no es cotización ni está anulada. */
export function isCountable(s: Sale): boolean {
  return s.status !== "anulada" && s.status !== "cotizacion";
}

function inRange(iso: string, from: Date, to: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= from.getTime() && t <= to.getTime();
}

export function metrics(sales: Sale[], expenses: AppState["expenses"], from: Date, to: Date): Metrics {
  let net = 0;
  let cogs = 0;
  let count = 0;
  for (const s of sales) {
    if (!isCountable(s) || !inRange(s.at, from, to)) continue;
    net += saleNet(s);
    cogs += saleCost(s);
    count += 1;
  }
  const exp = expenses
    .filter((e) => !e.anulado && inRange(e.at, from, to))
    .reduce((a, e) => a + e.amountUsd, 0);
  const grossProfit = net - cogs;
  return {
    net: round2(net),
    count,
    avgTicket: count ? round2(net / count) : 0,
    cogs: round2(cogs),
    gross: round2(grossProfit),
    expenses: round2(exp),
    profit: round2(grossProfit - exp),
  };
}

export function dayRange(day = new Date()): [Date, Date] {
  const from = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
  const to = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
  return [from, to];
}

export function monthRange(): [Date, Date] {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return [from, to];
}

export function prevMonthRange(): [Date, Date] {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  return [from, to];
}

export interface MonthPoint {
  key: string;
  label: string;
  net: number;
}

/**
 * Ventas netas de los últimos `months` meses.
 * Un solo recorrido sobre las ventas (O(n)), en lugar de recalcular cada mes.
 */
export function monthlySeries(sales: Sale[], months = 12): MonthPoint[] {
  const now = new Date();
  const out: MonthPoint[] = [];
  const index = new Map<string, number>();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    index.set(key, out.length);
    out.push({ key, label: d.toLocaleDateString("es", { month: "short" }), net: 0 });
  }
  for (const s of sales) {
    if (!isCountable(s)) continue;
    const d = new Date(s.at);
    const i = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) out[i].net += saleNet(s);
  }
  for (const p of out) p.net = round2(p.net);
  return out;
}

/** Convierte a USD el saldo de una cuenta según su moneda. */
export function accountUsd(balance: number, currency: "USD" | "VES", rate: number): number {
  return currency === "USD" ? balance : round2(balance / (rate || 1));
}

/** Saldo pendiente (monto − abonado) de un pendiente. */
export function pendingOutstanding(p: { amountUsd: number; paidUsd: number }): number {
  return round2(Math.max(0, p.amountUsd - p.paidUsd));
}

/**
 * Capital (a hoy): En cuentas + Inventario a costo + Por cobrar − Por pagar.
 * Los impuestos por pagar se exponen aparte (no restan aquí).
 */
export function capital(state: AppState) {
  const rate = state.rate || 1;
  const accounts = state.accounts.reduce((a, x) => a + accountUsd(x.balance, x.currency, rate), 0);
  const inventory = state.products.reduce((a, p) => a + p.cost * Math.max(0, p.stock), 0);
  const receivable = state.pendings
    .filter((p) => p.direction === "cobrar" && p.status !== "anulado")
    .reduce((a, p) => a + pendingOutstanding(p), 0);
  const payable =
    state.pendings
      .filter((p) => p.direction === "pagar" && p.status !== "anulado")
      .reduce((a, p) => a + pendingOutstanding(p), 0) +
    state.expenses.filter((e) => !e.anulado && !e.paid).reduce((a, e) => a + e.amountUsd, 0);
  return {
    accounts: round2(accounts),
    inventory: round2(inventory),
    receivable: round2(receivable),
    payable: round2(payable),
    net: round2(accounts + inventory + receivable - payable),
  };
}

/** IVA e IGTF cobrados pendientes de enterar (informativo). */
export function taxesCollected(state: AppState) {
  const rate = state.rate || 1;
  let iva = 0;
  let igtf = 0;
  for (const s of state.sales) {
    if (!isCountable(s)) continue;
    iva += s.tax;
    igtf += s.igtf;
  }
  const paid = state.expenses
    .filter((e) => !e.anulado && e.paid && e.category === "Pago de impuestos (IVA/IGTF)")
    .reduce((a, e) => a + e.amountUsd, 0);
  return { iva: round2(Math.max(0, iva - paid)), igtf: round2(igtf), rate };
}

/** Productos activos (no servicios) por debajo o en su mínimo. */
export function lowStock(state: AppState) {
  return state.products.filter(
    (p) => p.active && !p.archived && p.trackStock && p.type !== "servicio" && p.stock <= p.minStock
  );
}

/** Pendientes abiertos o parciales, ordenados por vencimiento. */
export function openPendings(state: AppState) {
  return state.pendings
    .filter((p) => p.status === "abierto" || p.status === "parcial")
    .sort((a, b) => (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999"));
}

/**
 * Efectivo esperado en el turno abierto (arqueo).
 * Se calcula sobre el LIBRO de movimientos de las cuentas de tipo "efectivo"
 * dentro del turno: fondo inicial + entradas − salidas. Así se incluyen cobros,
 * gastos pagados en efectivo, retiros, transferencias, abonos y compras; no solo
 * las ventas.
 */
export function expectedCash(state: AppState): { usd: number; bs: number } {
  const session = state.cashSession;
  if (!session) return { usd: 0, bs: 0 };
  const rate = state.rate || 1;
  const cash = new Map(
    state.accounts.filter((a) => a.type === "efectivo").map((a) => [a.id, a])
  );
  const openedAt = new Date(session.openedAt).getTime();
  let usd = session.openingUsd;
  let bs = session.openingBs;
  for (const m of state.movements) {
    const acc = cash.get(m.accountId);
    if (!acc) continue;
    if (new Date(m.at).getTime() < openedAt) continue;
    const native =
      m.amountInput ?? (acc.currency === "USD" ? m.amountUsd : round2(m.amountUsd * rate));
    const sign = m.direction === "entrada" ? 1 : -1;
    if (acc.currency === "USD") usd += sign * native;
    else bs += sign * native;
  }
  return { usd: round2(usd), bs: round2(bs) };
}
