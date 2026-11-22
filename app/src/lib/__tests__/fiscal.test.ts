// Pruebas de la lógica fiscal (dinero). Regresión de las reglas del POS.
import { describe, expect, it } from "vitest";
import {
  cortesiaValor,
  discountAmount,
  lineBase,
  lineBs,
  paidBs,
  saldoPendiente,
  saleBase,
  saleBsBase,
  saleBsTotal,
  saleTax,
  surchargeAmount,
  ticketTotal,
} from "../fiscal";
import { round2 } from "../money";
import type { SaleLine, SalePayment } from "../types";

function line(price: number, qty: number, taxRate = 0, cortesia = false): SaleLine {
  return { productId: "p", name: "x", qty, price, cost: 0, taxRate, cortesia };
}

describe("lineBase / saleBase", () => {
  it("base de una línea = precio × cantidad", () => {
    expect(lineBase(line(12.5, 3))).toBe(37.5);
  });

  it("base de la venta = suma de líneas", () => {
    expect(saleBase([line(50, 1), line(25, 2)])).toBe(100);
  });

  it("redondea a 2 decimales", () => {
    expect(saleBase([line(0.333, 3)])).toBe(1);
  });
});

describe("saleTax", () => {
  it("aplica la tasa de cada línea sobre la base", () => {
    // base 100 (50 con 16 %) → 8
    expect(saleTax([line(50, 1, 0.16), line(50, 1, 0)], 0)).toBe(8);
  });

  it("el descuento baja la base imponible de forma proporcional", () => {
    // base 100, descuento 10 → imponible 90 → 90×0.5×0.16 = 7.2
    expect(saleTax([line(50, 1, 0.16), line(50, 1)], 10)).toBe(7.2);
  });

  it("es 0 cuando no hay base", () => {
    expect(saleTax([], 0)).toBe(0);
  });
});

describe("Cortesía por línea", () => {
  it("la línea regalada no aporta base, pero conserva su precio como valor regalado", () => {
    const lines = [line(50, 2), line(15, 1, 0, true)];
    expect(lineBase(lines[1])).toBe(0);
    expect(saleBase(lines)).toBe(100);
    expect(cortesiaValor(lines)).toBe(15);
  });

  it("la cantidad multiplicada es lo que se regala", () => {
    expect(cortesiaValor([line(7.5, 4, 0, true)])).toBe(30);
  });

  it("la cortesía no se cobra IVA", () => {
    // sin cortesía: base 300 (200 al 16 %) → IVA 32.
    expect(saleTax([line(100, 1, 0.16), line(100, 1, 0), line(100, 1, 0.16)], 0)).toBe(32);
    // regalando la tercera: base 200, y esa línea pesa 0 en el prorrateo → 16.
    expect(saleTax([line(100, 1, 0.16), line(100, 1, 0), line(100, 1, 0.16, true)], 0)).toBe(16);
  });

  it("el descuento se prorratea solo entre lo cobrado", () => {
    // base cobrada 80 (la otra línea, de 20, es cortesía) → imponible 72 × 16 %.
    expect(saleTax([line(80, 1, 0.16), line(20, 1, 0.16, true)], 8)).toBe(11.52);
  });

  it("venta íntegramente de cortesía no divide entre cero", () => {
    const lines = [line(50, 1, 0.16, true), line(25, 2, 0.16, true)];
    expect(saleBase(lines)).toBe(0);
    expect(saleTax(lines, 0)).toBe(0);
    expect(cortesiaValor(lines)).toBe(100);
  });

  it("quitar la cortesía devuelve la línea a la venta", () => {
    const regalada = line(50, 1, 0.16, true);
    const cobrada = line(50, 1, 0.16, false);
    expect(saleBase([regalada])).toBe(0);
    expect(saleBase([cobrada])).toBe(50);
    expect(saleTax([cobrada], 0)).toBe(8);
  });
});

describe("surchargeAmount", () => {
  it("porcentaje sobre el neto", () => {
    expect(surchargeAmount({ id: "", name: "", type: "porcentaje", value: 5, active: true }, 200)).toBe(10);
  });

  it("monto fijo", () => {
    expect(surchargeAmount({ id: "", name: "", type: "monto", value: 3, active: true }, 200)).toBe(3);
  });
});

describe("ticketTotal", () => {
  // BLINK-134 (dueño, 2026-11-21): el IGTF se borró de los cobros nuevos, así
  // que la función de la pantalla de cobro y del `checkout` es neto + IVA +
  // recargos, en ese orden de redondeo.
  it("suma neto + IVA + recargos", () => {
    expect(ticketTotal(100, 16, 5)).toBe(121);
  });

  it("redondea cada parte antes de sumar", () => {
    expect(ticketTotal(10.005, 1.005, 0.004)).toBe(11.02);
  });
});

describe("discountAmount", () => {
  it("porcentaje sobre la base", () => {
    expect(discountAmount({ type: "porcentaje", value: 10 }, 200)).toBe(20);
  });

  it("monto fijo", () => {
    expect(discountAmount({ type: "monto", value: 15 }, 200)).toBe(15);
  });
});

describe("Cálculo de vuelto / change", () => {
  it("calcula el vuelto en USD cuando se paga en exceso", () => {
    const missing = 12.5;
    const received = 20;
    const changeUsd = Math.round((received - missing + Number.EPSILON) * 100) / 100;
    expect(changeUsd).toBe(7.5);
  });

  it("calcula el vuelto equivalente en Bs según la tasa", () => {
    const changeUsd = 7.5;
    const rate = 50.0;
    const changeBs = Math.round((changeUsd * rate + Number.EPSILON) * 100) / 100;
    expect(changeBs).toBe(375.0);
  });

  it("calcula el vuelto en Bs y su equivalente en USD cuando se paga en exceso en Bs", () => {
    const missingBs = 500; // a tasa 50 es 10 USD
    const receivedBs = 600;
    const changeBs = receivedBs - missingBs;
    const rate = 50.0;
    const changeUsd = Math.round((changeBs / rate + Number.EPSILON) * 100) / 100;
    expect(changeBs).toBe(100);
    expect(changeUsd).toBe(2.0);
  });
});

/**
 * Precio fijo en Bs (BLINK-104). La tasa realista importa: a 884,75 Bs por
 * dólar, UN centavo de dólar son Bs 8,85, así que cualquier Bs derivado de un
 * USD redondeado se le nota al cliente en el ticket.
 */
describe("Precio fijo en Bs", () => {
  const TASA = 884.75;

  /** Producto de precio fijo: el USD de la línea está derivado, no al revés. */
  function fija(priceBs: number, qty: number, taxRate = 0): SaleLine {
    return { productId: "p", name: "x", qty, price: priceBs / TASA, cost: 0, taxRate, priceBs };
  }

  function pagoBs(amountInput: number): SalePayment {
    return {
      method: "Caja",
      currency: "VES",
      amountInput,
      amountUsd: round2(amountInput / TASA),
    };
  }

  it("la línea fija manda su Bs, no la conversión del USD redondeado", () => {
    const l = fija(450, 10);
    expect(lineBase(l)).toBe(5.09); // el libro en dólares
    expect(lineBs(l, TASA)).toBe(4500); // lo que el cliente paga
    // Derivar el Bs del USD del libro habría impreso Bs 4.503,38 por una
    // harinera de Bs 450.
    expect(round2(lineBase(l) * TASA)).toBe(4503.38);
  });

  it("sin precio fijo el Bs sigue siendo la conversión del USD", () => {
    expect(lineBs(line(3, 2), TASA)).toBe(round2(6 * TASA));
  });

  it("la cortesía fija pesa 0 en las dos monedas", () => {
    expect(lineBs({ ...fija(450, 2), cortesia: true }, TASA)).toBe(0);
  });

  it("el total en Bs suma el Bs de las líneas y convierte el resto", () => {
    const lines = [fija(450, 1, 0.16), line(2, 1, 0.16)];
    const tax = saleTax(lines, 0);
    expect(saleBase(lines)).toBe(2.51);
    expect(tax).toBe(0.4);
    expect(saleBsBase(lines, TASA)).toBe(round2(450 + 2 * TASA));
    expect(saleBsTotal(lines, TASA, tax)).toBe(round2(450 + 2 * TASA + 0.4 * TASA));
  });

  it("un ticket sin líneas fijas da exactamente el Bs de siempre", () => {
    const lines = [line(12.5, 2), line(7.25, 3)];
    expect(saleBsTotal(lines, TASA, 0)).toBe(round2(saleBase(lines) * TASA));
  });

  it("cobrar el total en Bs salda el ticket aunque el USD redondee un centavo abajo", () => {
    // Dos productos de Bs 446,80: cada línea en USD sube a 0,51 (exactamente
    // 0,5050014). Las líneas suman $1,02 y los Bs cobrados equivalen a $1,01.
    const lines = [fija(446.8, 1), fija(446.8, 1)];
    const total = saleBase(lines);
    const totalBs = saleBsTotal(lines, TASA, 0);
    const pago = pagoBs(totalBs);
    expect(total).toBe(1.02);
    expect(totalBs).toBe(893.6);
    expect(pago.amountUsd).toBe(1.01);
    expect(round2(total - pago.amountUsd)).toBe(0.01);
    expect(saldoPendiente(total, [pago], totalBs, TASA).remaining).toBe(0);
  });

  it("un cobro en Bs insuficiente sí deja saldo", () => {
    const lines = [fija(446.8, 1), fija(446.8, 1)];
    const total = saleBase(lines);
    const totalBs = saleBsTotal(lines, TASA, 0);
    const saldo = saldoPendiente(total, [pagoBs(500)], totalBs, TASA);
    expect(saldo.remaining).toBeGreaterThan(0);
  });

  it("el Bs ya acreditado se descuenta del monto exacto", () => {
    const lines = [fija(450, 2)];
    const total = saleBase(lines);
    const totalBs = saleBsTotal(lines, TASA, 0);
    expect(totalBs).toBe(900);
    expect(saldoPendiente(total, [pagoBs(900)], totalBs, TASA).remaining).toBe(0);
    expect(saldoPendiente(total, [pagoBs(400)], totalBs, TASA).remaining).toBeGreaterThan(0);
  });

  it("una venta antigua sin totalBs se cuadra solo en dólares", () => {
    const pago = { method: "Caja", currency: "USD" as const, amountUsd: 6 };
    expect(saldoPendiente(10, [pago], 0, TASA).remaining).toBe(4);
    expect(saldoPendiente(10, [pago, { ...pago, amountUsd: 4 }], 0, TASA).remaining).toBe(0);
  });

  it("paidBs convierte los cobros en dólares y toma el Bs tecleado", () => {
    expect(paidBs([pagoBs(1000)], TASA)).toBe(1000);
    expect(paidBs([{ method: "Zelle", currency: "USD", amountUsd: 2 }], TASA)).toBe(
      round2(2 * TASA)
    );
  });
});


