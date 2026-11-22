// Cálculos fiscales del ticket (propios de BLINK).
import type { SaleLine, SalePayment, Surcharge } from "./types";
import { round2 } from "./money";

/** Base (subtotal antes de IVA) de una línea. La cortesía no se cobra: 0. */
export function lineBase(l: SaleLine): number {
  return l.cortesia ? 0 : round2(l.price * l.qty);
}

/** Subtotal = suma de líneas, antes de descuento e IVA. */
export function saleBase(lines: SaleLine[]): number {
  return round2(lines.reduce((a, l) => a + lineBase(l), 0));
}

/**
 * Base en bolívares de una línea (BLINK-104). Única regla del Bs en el ticket.
 *
 * Con precio fijo manda el Bs: `priceBs` es lo que vale el producto y el USD de
 * la línea ya se derivó con la tasa del momento. Sin precio fijo el Bs sí es
 * una conversión del USD. La cortesía pesa 0 en las dos monedas.
 */
export function lineBs(l: SaleLine, rate: number): number {
  if (l.cortesia) return 0;
  if (l.priceBs && l.priceBs > 0) return round2(l.priceBs * l.qty);
  return round2(lineBase(l) * rate);
}

/** Subtotal en Bs: suma de las líneas, antes de descuento e IVA. */
export function saleBsBase(lines: SaleLine[], rate: number): number {
  return round2(lines.reduce((a, l) => a + lineBs(l, rate), 0));
}

/**
 * Total del ticket en Bs. `restUsd` es lo que se suma o resta después de la
 * base (descuento, IVA, recargos): son cifras en dólares y se convierten.
 *
 * Con todo el ticket anclado a tasa esto coincide con `total × tasa`. Con una
 * línea de precio fijo no: conserva el Bs exacto de esa línea, que es justo lo
 * que el cliente paga. Derivar el Bs del total en USD redondearía Bs 4.500,00
 * como Bs 4.503,38 en una harinera de Bs 450 con tasa 884,75.
 */
export function saleBsTotal(lines: SaleLine[], rate: number, restUsd: number): number {
  return round2(saleBsBase(lines, rate) + (restUsd || 0) * rate);
}

/**
 * Total en Bs del ticket, a partir de SU PROPIO total en USD (BLINK-106).
 *
 * Sumar un recargo en Bs aparte, después de redondear el resto, redondea dos
 * veces y puede dar un céntimo distinto que el checkout: el ticket imprimiría
 * un Bs que el POS no cobró. Aquí todo lo que no es base entra dentro de
 * `restUsd`, una sola vez.
 */
export function saleBsFromTotal(lines: SaleLine[], rate: number, total: number): number {
  return saleBsTotal(lines, rate, round2(total - saleBase(lines)));
}

/** Bolívares realmente acreditados por unos cobros (lo que entró a la caja). */
export function paidBs(payments: SalePayment[], rate: number): number {
  return round2(
    payments.reduce((a, p) => {
      // En Bs se acredita lo tecleado (descontado el vuelto); en USD, su
      // equivalente a la tasa de la venta.
      const native =
        p.currency === "VES" && p.amountInput != null
          ? p.amountInput
          : round2(p.amountUsd * rate);
      return a + native;
    }, 0)
  );
}

/**
 * Saldo por cobrar de una venta, con la regla del precio fijo en Bs.
 *
 * Un ticket de precio fijo se cobra en bolívares: lo que manda es que el Bs
 * entregado cubra el `totalBs`. El equivalente en USD de ese Bs puede quedar un
 * centavo por debajo del total en dólares (a 884,75 Bs/USD, medio centavo de
 * dólar son 4,42 Bs, y el redondeo se acumula por línea). Ese centavo no es
 * dinero que falte en la caja: es el costo de expresar en dólares un precio que
 * vale bolívares, y no debe generar una cuenta por cobrar fantasma.
 */
export function saldoPendiente(
  total: number,
  payments: SalePayment[],
  totalBs: number,
  rate: number
): { paidUsd: number; remaining: number } {
  const paidUsd = round2(payments.reduce((a, p) => a + p.amountUsd, 0));
  const remaining = round2(Math.max(0, total - paidUsd));
  if (remaining === 0) return { paidUsd, remaining: 0 };
  if (!(totalBs > 0) || !(rate > 0)) return { paidUsd, remaining };
  return round2(totalBs - paidBs(payments, rate)) <= 0
    ? { paidUsd, remaining: 0 }
    : { paidUsd, remaining };
}

/** Valor de lo regalado: lo que las cortesías habrían costado al cliente. */
export function cortesiaValor(lines: SaleLine[]): number {
  return round2(lines.reduce((a, l) => a + (l.cortesia ? l.price * l.qty : 0), 0));
}

/** IVA total: se aplica la tasa de cada producto sobre el neto (base − descuento). */
export function saleTax(lines: SaleLine[], discount: number): number {
  const base = saleBase(lines);
  if (base <= 0) return 0;
  const taxable = Math.max(0, base - discount);
  let tax = 0;
  for (const l of lines) {
    // La línea regalada pesa 0 en el prorrateo: no se cobra, no se grava.
    const share = lineBase(l) / base;
    tax += taxable * share * (l.taxRate || 0);
  }
  return round2(tax);
}

/** Importe de un recargo dado el neto (porcentaje o monto fijo). */
export function surchargeAmount(s: Surcharge, net: number): number {
  return round2(s.type === "porcentaje" ? (net * s.value) / 100 : s.value);
}

/**
 * Total del ticket = neto + IVA + recargos (BLINK-106, BLINK-134).
 *
 * Es LA función de la pantalla de cobro y del `checkout`, en ese orden de
 * redondeo. Cada sitio que sume sus partes por su lado puede sacar un céntimo
 * distinto según dónde caiga el redondeo, y entonces el Bs impreso en el ticket
 * no cuadra con el Bs que el cajero cobró.
 *
 * El IGTF ya no se calcula ni se suma (dueño, 2026-11-21). Las ventas antiguas
 * conservan su `igtf` congelado y se siguen leyendo desde `Sale`, no desde aquí.
 */
export function ticketTotal(net: number, tax: number, surcharge: number): number {
  return round2(round2(net) + round2(tax) + round2(surcharge));
}

/**
 * Vuelto de un cobro (BLINK-138, dueño 2026-11-21: «agrega la lógica de vuelto»).
 *
 * El cliente entrega `recibido` y la venta se acredita con lo que falta: nunca
 * con el billete entero. Todo va en la MONEDA del cobro, así que el equivalente
 * en la otra se calcula después con la tasa de la venta.
 *
 * · `recibido <= 0` → no hay cobro.
 * · `falta <= 0` → no hay referencia de exacto: se acredita lo entregado.
 * · entregado por encima del falta → se acredita el falta y el resto vuelve.
 */
export function vuelto(
  recibido: number,
  falta: number
): { charged: number; change: number } {
  const entregado = round2(recibido);
  if (!(entregado > 0)) return { charged: 0, change: 0 };
  if (!(falta > 0) || entregado <= falta) return { charged: entregado, change: 0 };
  return { charged: round2(falta), change: round2(entregado - falta) };
}

/** Descuento efectivo (monto USD) según el tipo del descuento. */
export function discountAmount(
  d: { type: "porcentaje" | "monto"; value: number },
  base: number
): number {
  return round2(d.type === "porcentaje" ? (base * d.value) / 100 : d.value);
}
