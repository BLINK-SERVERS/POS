// Pruebas de integridad del libro: existencias y reversión de abonos.
import { describe, expect, it } from "vitest";
import { findStockShortage, reversePendingAbonos } from "../ledger";
import type { Account, Movement, Pending, Product, SaleLine } from "../types";

function product(over: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "Harina",
    stock: 3,
    trackStock: true,
    ...over,
  } as Product;
}

function line(over: Partial<SaleLine> = {}): SaleLine {
  return { productId: "p1", name: "Harina", qty: 1, price: 2, cost: 1, taxRate: 0, ...over };
}

function account(over: Partial<Account> = {}): Account {
  return {
    id: "acc1",
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

function abono(over: Partial<Movement> = {}): Movement {
  return {
    id: "m1",
    at: "2026-10-01T10:00:00Z",
    accountId: "acc1",
    direction: "entrada",
    amountUsd: 30,
    amountInput: 30,
    currency: "USD",
    origin: "Abono",
    note: "Venta 0001",
    userId: "u",
    ...over,
  };
}

function pending(over: Partial<Pending> = {}): Pending {
  return {
    id: "pend1",
    at: "2026-10-01T09:00:00Z",
    direction: "cobrar",
    contactName: "Cliente",
    subject: "Venta 0001",
    amountUsd: 100,
    paidUsd: 30,
    note: "",
    status: "parcial",
    ...over,
  } as Pending;
}

describe("findStockShortage", () => {
  it("detecta la primera línea que pide más de lo disponible", () => {
    const result = findStockShortage(
      [product()],
      [line({ qty: 2 }), line({ productId: "p2", qty: 9 }), line({ qty: 5 })]
    );
    expect(result?.product.id).toBe("p1");
    expect(result?.line.qty).toBe(5);
  });

  it("permite vender exactamente lo disponible", () => {
    expect(findStockShortage([product()], [line({ qty: 3 })])).toBeNull();
  });

  it("ignora productos sin control de stock o inexistentes", () => {
    expect(
      findStockShortage([product({ trackStock: false })], [line({ qty: 99 })])
    ).toBeNull();
    expect(findStockShortage([], [line({ qty: 99 })])).toBeNull();
  });
});

describe("reversePendingAbonos", () => {
  const at = "2026-10-28T12:00:00Z";

  it("devuelve el abono a la cuenta y deja el asiento inverso", () => {
    const result = reversePendingAbonos({
      accounts: [account({ balance: 30 })],
      movements: [abono()],
      pending: pending(),
      at,
      origin: "Anulación pendiente",
      note: "Anulación Venta 0001",
      userId: "u",
    });

    expect(result.reversed).toBe(1);
    expect(result.accounts[0].balance).toBe(0);
    expect(result.movements[0]).toMatchObject({
      id: "rev_m1",
      direction: "salida",
      amountInput: 30,
      reversalOf: "m1",
      origin: "Anulación pendiente",
    });
    expect(result.movements[1]).toMatchObject({ id: "m1", reversedAt: at });
  });

  it("no revierte dos veces el mismo abono", () => {
    const first = reversePendingAbonos({
      accounts: [account({ balance: 30 })],
      movements: [abono()],
      pending: pending(),
      at,
      origin: "Anulación pendiente",
      note: "Anulación",
      userId: "u",
    });
    const second = reversePendingAbonos({
      accounts: first.accounts,
      movements: first.movements,
      pending: pending(),
      at: "2026-10-28T13:00:00Z",
      origin: "Anulación venta",
      note: "Anulación",
      userId: "u",
    });

    expect(second.reversed).toBe(0);
    expect(second.accounts[0].balance).toBe(0);
    expect(second.movements).toHaveLength(first.movements.length);
  });

  it("reconoce abonos antiguos por origen y nota del pendiente", () => {
    const result = reversePendingAbonos({
      accounts: [account({ id: "acc-ves", currency: "VES", balance: 500 })],
      movements: [
        abono({
          accountId: "acc-ves",
          currency: "VES",
          amountUsd: 5,
          amountInput: 500,
        }),
      ],
      pending: pending(),
      at,
      origin: "Anulación venta",
      note: "Anulación",
      userId: "u",
    });

    expect(result.reversed).toBe(1);
    expect(result.accounts[0].balance).toBe(0);
  });

  it("ignora abonos de otro pendiente", () => {
    const result = reversePendingAbonos({
      accounts: [account({ balance: 30 })],
      movements: [abono({ pendingId: "otro" })],
      pending: pending(),
      at,
      origin: "Anulación pendiente",
      note: "Anulación",
      userId: "u",
    });

    expect(result.reversed).toBe(0);
    expect(result.accounts[0].balance).toBe(30);
    expect(result.movements).toHaveLength(1);
  });
});
