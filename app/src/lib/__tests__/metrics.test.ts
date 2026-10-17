// Pruebas de métricas de negocio (ventas, capital, arqueo).
// Regresión de bugs corregidos: descuento doble en `saleTotal` y arqueo
// que antes ignoraba salidas y cuentas fuera del cierre.
import { describe, expect, it } from "vitest";
import {
  accountUsd,
  expectedCash,
  isCountable,
  metrics,
  pendingOutstanding,
  saleCost,
  saleNet,
  saleTotal,
} from "../metrics";
import type { Account, AppState, CashSession, Expense, Movement, Sale, SaleLine } from "../types";

function line(price: number, cost: number, qty = 1, taxRate = 0): SaleLine {
  return { productId: "p", name: "x", qty, price, cost, taxRate };
}

function sale(over: Partial<Sale> = {}): Sale {
  return {
    id: "s1",
    code: "0001",
    at: "2026-01-10T10:00:00Z",
    lines: [],
    status: "cobrada",
    discount: 0,
    surcharge: 0,
    tax: 0,
    igtf: 0,
    notes: "",
    payments: [],
    userId: "u",
    ...over,
  };
}

function expense(over: Partial<Expense> = {}): Expense {
  return {
    id: "e1",
    at: "2026-01-10T12:00:00Z",
    name: "Gasto",
    category: "General",
    note: "",
    amountUsd: 0,
    recurring: false,
    paid: true,
    ...over,
  };
}

describe("saleNet / saleCost / saleTotal", () => {
  it("neto = bruto − descuento", () => {
    expect(saleNet(sale({ lines: [line(100, 0)], discount: 30 }))).toBe(70);
  });

  it("el neto nunca baja de 0", () => {
    expect(saleNet(sale({ lines: [line(100, 0)], discount: 150 }))).toBe(0);
  });

  it("costo = costo unitario × cantidad", () => {
    expect(saleCost(sale({ lines: [line(0, 20, 3)] }))).toBe(60);
  });

  it("saleTotal NO resta el descuento dos veces", () => {
    // bruto 100, descuento 30 → neto 70. + IVA 16 + recargo 5 + IGTF 3 = 94.
    const s = sale({
      lines: [line(100, 0)],
      discount: 30,
      tax: 16,
      surcharge: 5,
      igtf: 3,
    });
    expect(saleNet(s)).toBe(70);
    expect(saleTotal(s)).toBe(94);
  });
});

describe("isCountable", () => {
  it("cuenta cobrada y a crédito", () => {
    expect(isCountable(sale({ status: "cobrada" }))).toBe(true);
    expect(isCountable(sale({ status: "credito" }))).toBe(true);
  });

  it("NO cuenta anuladas ni cotizaciones", () => {
    expect(isCountable(sale({ status: "anulada" }))).toBe(false);
    expect(isCountable(sale({ status: "cotizacion" }))).toBe(false);
  });
});

describe("metrics", () => {
  const from = new Date("2026-01-01T00:00:00Z");
  const to = new Date("2026-01-31T23:59:59Z");

  it("suma solo ventas y gastos del rango y excluye anuladas", () => {
    const sales = [
      sale({ lines: [line(100, 40)] }), // neto 100, costo 40
      sale({ id: "s2", status: "anulada", lines: [line(999, 0)] }), // excluida
    ];
    const expenses = [expense({ amountUsd: 25 })];

    const m = metrics(sales, expenses, from, to);
    expect(m.count).toBe(1);
    expect(m.net).toBe(100);
    expect(m.cogs).toBe(40);
    expect(m.gross).toBe(60); // 100 − 40
    expect(m.expenses).toBe(25);
    expect(m.profit).toBe(35); // 60 − 25
    expect(m.avgTicket).toBe(100);
  });

  it("ignora gastos anulados", () => {
    const m = metrics([], [expense({ amountUsd: 40, anulado: true })], from, to);
    expect(m.expenses).toBe(0);
    expect(m.profit).toBe(0);
  });
});

describe("accountUsd", () => {
  it("USD pasa tal cual; VES divide entre la tasa", () => {
    expect(accountUsd(100, "USD", 50)).toBe(100);
    expect(accountUsd(250, "VES", 50)).toBe(5);
  });

  it("protege la división por tasa 0", () => {
    expect(accountUsd(100, "VES", 0)).toBe(100); // rate||1
  });
});

describe("pendingOutstanding", () => {
  it("saldo = monto − abonado, sin negativos", () => {
    expect(pendingOutstanding({ amountUsd: 100, paidUsd: 30 })).toBe(70);
    expect(pendingOutstanding({ amountUsd: 100, paidUsd: 120 })).toBe(0);
  });
});

describe("expectedCash (arqueo)", () => {
  const session: CashSession = {
    openedAt: "2026-01-10T08:00:00Z",
    openingUsd: 10,
    openingBs: 0,
    userId: "u",
    locationId: "l1",
  };

  function acc(over: Partial<Account>): Account {
    return {
      id: "acc-usd",
      name: "Caja",
      type: "efectivo",
      currency: "USD",
      balance: 0,
      commissionIn: 0,
      commissionOut: 0,
      active: true,
      ...over,
    };
  }

  function mov(over: Partial<Movement>): Movement {
    return {
      id: "m",
      at: "2026-01-10T10:00:00Z",
      accountId: "acc-usd",
      direction: "entrada",
      amountUsd: 0,
      origin: "Venta",
      note: "",
      userId: "u",
      ...over,
    };
  }

  function state(over: Partial<AppState> = {}): AppState {
    return {
      cashSession: session,
      rate: 25,
      accounts: [],
      movements: [],
      ...over,
    } as AppState;
  }

  it("fondo + entradas − salidas, solo de cuentas de efectivo en el cierre", () => {
    const st = state({
      accounts: [
        acc({ id: "acc-usd" }),
        acc({ id: "acc-ves", currency: "VES" }),
        acc({ id: "acc-banco", type: "banco" }), // fuera
        acc({ id: "acc-off", inCashClose: false }), // fuera
      ],
      movements: [
        mov({ amountInput: 100 }),
        mov({ direction: "salida", amountInput: 20 }),
        mov({ accountId: "acc-ves", currency: "VES", amountInput: 50 }),
        mov({ accountId: "acc-banco", amountInput: 999 }), // fuera
        mov({ accountId: "acc-off", amountInput: 999 }), // fuera
        mov({ at: "2026-01-09T23:00:00Z", amountInput: 500 }), // antes de abrir
      ],
    });

    const { usd, bs } = expectedCash(st);
    expect(usd).toBe(90); // 10 + 100 − 20
    expect(bs).toBe(50);
  });

  it("si el movimiento no trae monto nativo, lo deriva de la tasa", () => {
    const st = state({
      accounts: [acc({ id: "acc-ves", currency: "VES" })],
      movements: [mov({ accountId: "acc-ves", amountUsd: 2 })], // 2 × 25 = 50
    });
    expect(expectedCash(st).bs).toBe(50);
  });

  it("sin caja abierta da 0", () => {
    expect(expectedCash(state({ cashSession: null as unknown as CashSession }))).toEqual({
      usd: 0,
      bs: 0,
    });
  });
});
