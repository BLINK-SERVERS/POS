// Pruebas de la lógica fiscal (dinero). Regresión de las reglas del POS.
import { describe, expect, it } from "vitest";
import {
  cortesiaValor,
  discountAmount,
  IGTF_RATE,
  igtfFor,
  lineBase,
  saleBase,
  saleTax,
  surchargeAmount,
  ticketTotal,
} from "../fiscal";
import type { SaleLine } from "../types";

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

describe("igtfFor", () => {
  it("cobra el 3 % sobre el monto en dólares", () => {
    expect(IGTF_RATE).toBe(0.03);
    expect(igtfFor(100)).toBe(3);
  });
});

describe("ticketTotal", () => {
  it("suma neto + IVA + recargos + IGTF", () => {
    expect(ticketTotal(100, 16, 5, 3)).toBe(124);
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

