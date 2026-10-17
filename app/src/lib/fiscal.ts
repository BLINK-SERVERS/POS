// Cálculos fiscales del ticket (propios de BLINK).
import type { SaleLine, Surcharge } from "./types";
import { round2 } from "./money";

/** Base (subtotal antes de IVA) de una línea. */
export function lineBase(l: SaleLine): number {
  return round2(l.price * l.qty);
}

/** Subtotal = suma de líneas, antes de descuento e IVA. */
export function saleBase(lines: SaleLine[]): number {
  return round2(lines.reduce((a, l) => a + l.price * l.qty, 0));
}

/** IVA total: se aplica la tasa de cada producto sobre el neto (base − descuento). */
export function saleTax(lines: SaleLine[], discount: number): number {
  const base = saleBase(lines);
  if (base <= 0) return 0;
  const taxable = Math.max(0, base - discount);
  let tax = 0;
  for (const l of lines) {
    const share = (l.price * l.qty) / base;
    tax += taxable * share * (l.taxRate || 0);
  }
  return round2(tax);
}

/** Importe de un recargo dado el neto (porcentaje o monto fijo). */
export function surchargeAmount(s: Surcharge, net: number): number {
  return round2(s.type === "porcentaje" ? (net * s.value) / 100 : s.value);
}

/** IGTF (3 %) aplicable a los cobros en dólares. */
export function igtfFor(amountUsd: number): number {
  return round2(amountUsd * 0.03);
}

export const IGTF_RATE = 0.03;

/** Total del ticket = neto + IVA + recargos + IGTF. */
export function ticketTotal(
  net: number,
  tax: number,
  surcharge: number,
  igtf: number
): number {
  return round2(net + tax + surcharge + igtf);
}

/** Descuento efectivo (monto USD) según el tipo del descuento. */
export function discountAmount(
  d: { type: "porcentaje" | "monto"; value: number },
  base: number
): number {
  return round2(d.type === "porcentaje" ? (base * d.value) / 100 : d.value);
}
