// Pruebas de los reportes CSV exportables (lote 26: las cortesías tienen su
// propia columna y la línea regalada sale marcada en el detalle).
import { describe, expect, it } from "vitest";
import { buildDatasets } from "../exportData";
import type { AppState, Sale, SaleLine } from "../types";

const linea = (price: number, cost: number, qty = 1, cortesia = false): SaleLine => ({
  productId: "p1",
  name: "Café",
  qty,
  price,
  cost,
  taxRate: 0,
  cortesia,
});

const venta = (lines: SaleLine[]): Sale => ({
  id: "s1",
  code: "000001",
  at: "2026-01-10T10:00:00Z",
  lines,
  status: "cobrada",
  discount: 0,
  surcharge: 0,
  tax: 0,
  igtf: 0,
  notes: "",
  payments: [],
  userId: "u",
});

const dataset = (kind: string) => {
  // `buildDatasets` recorre todos los conjuntos, así que el resto del estado
  // va vacío; `business` tiene que existir porque el reporte de configuración
  // lee sus campos.
  const state = {
    rate: 1,
    business: {},
    sales: [venta([linea(10, 4), linea(2, 1, 1, true)])],
    products: [],
    contacts: [],
    accounts: [],
    locations: [],
    movements: [],
    transfers: [],
    expenses: [],
    recurringExpenses: [],
    purchases: [],
    pendings: [],
    cashClosures: [],
    inventoryMoves: [],
    stockAdjustments: [],
    stockReturns: [],
    stockTransfers: [],
    channels: [],
    categories: [],
    discounts: [],
    taxes: [],
    surcharges: [],
  } as unknown as AppState;
  return buildDatasets(state).find((x) => x.kind === kind)!;
};

describe("CSV de ventas con cortesía", () => {
  it("el resumen reporta base cobrada y valor regalado en columnas distintas", () => {
    const ds = dataset("ventas");
    const fila = ds.rows[0];
    expect(ds.headers[ds.headers.indexOf("Cortesías USD")]).toBe("Cortesías USD");
    expect(fila[ds.headers.indexOf("Base USD")]).toBe(10);
    expect(fila[ds.headers.indexOf("Cortesías USD")]).toBe(2);
    expect(fila[ds.headers.indexOf("Total USD")]).toBe(10);
  });

  it("el detalle marca la línea regalada y le deja margen negativo", () => {
    const ds = dataset("ventas-detalle");
    const regalada = ds.rows[1];
    expect(regalada[ds.headers.indexOf("Cortesía")]).toBe("Sí");
    expect(regalada[ds.headers.indexOf("Precio USD")]).toBe(2);
    expect(regalada[ds.headers.indexOf("Subtotal USD")]).toBe(0);
    expect(regalada[ds.headers.indexOf("Margen USD")]).toBe(-1);
    expect(ds.rows[0][ds.headers.indexOf("Cortesía")]).toBe("No");
  });
});
