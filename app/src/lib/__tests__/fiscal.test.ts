// Pruebas de la lógica fiscal (dinero). Regresión de las reglas del POS.
import { describe, expect, it } from "vitest";
import {
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

function line(price: number, qty: number, taxRate = 0): SaleLine {
  return { productId: "p", name: "x", qty, price, cost: 0, taxRate };
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
