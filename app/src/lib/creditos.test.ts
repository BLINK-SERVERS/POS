// Pruebas del módulo de cuentas por cobrar: saldos, agrupación por deudor,
// vencimientos, morosos, abonos reconocidos y estado de cuenta impreso.
import { describe, expect, it } from "vitest";
import {
  abonosDe,
  cuentasDe,
  deudores,
  diasDeAtraso,
  estadoDeCuenta,
  morosos,
  saldo,
  saldoAlCierre,
  totalPorCobrar,
  vencimiento,
} from "./creditos";
import type { Contact, Movement, Pending } from "./types";

const AHORA = Date.parse("2026-11-15T12:00:00Z");
const ISO = (d: string) => new Date(d).toISOString();

const cliente = (over: Partial<Contact> = {}): Contact => ({
  id: "c1",
  name: "ANA RIOS",
  document: "12345678",
  docType: "V",
  phone: "0414-0000000",
  email: "",
  isClient: true,
  isProvider: false,
  creditDays: 30,
  address: "",
  notes: "",
  ...over,
});

const cuenta = (over: Partial<Pending> = {}): Pending => ({
  id: "p1",
  at: ISO("2026-10-01T10:00:00Z"),
  direction: "cobrar",
  contactId: "c1",
  contactName: "ANA RIOS",
  subject: "Venta 000007",
  amountUsd: 100,
  paidUsd: 0,
  note: "",
  status: "abierto",
  ...over,
});

const abono = (over: Partial<Movement> = {}): Movement => ({
  id: "m1",
  at: ISO("2026-10-20T09:00:00Z"),
  accountId: "acc1",
  direction: "entrada",
  amountUsd: 40,
  currency: "USD",
  amountInput: 40,
  pendingId: "p1",
  origin: "Abono",
  note: "Venta 000007",
  userId: "T",
  ...over,
});

describe("saldo y total por cobrar", () => {
  it("nunca devuelve un saldo negativo", () => {
    expect(saldo(cuenta({ amountUsd: 10, paidUsd: 25 }))).toBe(0);
  });

  it("suma solo las cuentas de cobrar vivas, ignorando anuladas, saldadas y de pagar", () => {
    const pendings = [
      cuenta({ id: "p1", amountUsd: 100, paidUsd: 30 }),
      cuenta({ id: "p2", amountUsd: 50, paidUsd: 0, status: "anulado" }),
      cuenta({ id: "p3", amountUsd: 20, paidUsd: 20, status: "saldado" }),
      cuenta({ id: "p4", amountUsd: 70, direction: "pagar" }),
      cuenta({ id: "p5", amountUsd: 15.555 }),
    ];
    expect(totalPorCobrar(pendings)).toBe(85.56);
  });
});

describe("vencimientos", () => {
  it("respeta el dueAt de la cuenta por encima de los días del cliente", () => {
    const p = cuenta({ dueAt: ISO("2026-12-31T00:00:00Z") });
    expect(vencimiento(p, cliente({ creditDays: 5 }))).toBe(p.dueAt);
  });

  it("calcula con los días de crédito cuando la cuenta no trae vencimiento", () => {
    const p = cuenta({ at: ISO("2026-10-01T00:00:00Z") });
    expect(vencimiento(p, cliente({ creditDays: 30 }))).toBe(ISO("2026-10-31T00:00:00Z"));
  });

  it("una cuenta sin días de crédito no vence", () => {
    expect(vencimiento(cuenta(), cliente({ creditDays: 0 }))).toBe("");
    expect(diasDeAtraso("", AHORA)).toBe(0);
  });

  it("mide el atraso en días y nunca en negativo", () => {
    const vence = ISO("2026-11-05T00:00:00Z");
    expect(diasDeAtraso(vence, AHORA)).toBe(10);
    expect(diasDeAtraso(ISO("2026-12-01T00:00:00Z"), AHORA)).toBe(0);
  });
});

describe("deudores", () => {
  it("agrupa por cliente, suma saldos y ordena por monto", () => {
    const pendings = [
      cuenta({ id: "p1", contactId: "c1", amountUsd: 100, paidUsd: 25 }),
      cuenta({ id: "p2", contactId: "c1", amountUsd: 40, at: ISO("2026-10-10T00:00:00Z") }),
      cuenta({ id: "p3", contactId: "c2", contactName: "BETTY LOZA", amountUsd: 200 }),
    ];
    const contactos = [cliente(), cliente({ id: "c2", name: "BETTY LOZA", document: "87654321" })];
    const filas = deudores(pendings, contactos, AHORA);
    expect(filas.map((f) => f.name)).toEqual(["BETTY LOZA", "ANA RIOS"]);
    expect(filas[1].total).toBe(115);
    expect(filas[1].cuentas).toBe(2);
    expect(filas[1].document).toBe("12345678");
    expect(filas[1].dias).toBe(45);
  });

  it("no pierde las cuentas cuyo cliente ya no está en la libreta", () => {
    const filas = deudores([cuenta({ contactId: "borrado", contactName: "LUIS PONDAL" })], [], AHORA);
    expect(filas).toHaveLength(1);
    // El nombre que quedó en la cuenta por cobrar salva el impreso.
    expect(filas[0].name).toBe("LUIS PONDAL");
    expect(filas[0].total).toBe(100);
  });

  it("las cuentas sin cliente forman su propio grupo", () => {
    const filas = deudores([cuenta({ contactId: "", contactName: "" })], [], AHORA);
    expect(filas[0].name).toBe("Sin cliente asignado");
    expect(filas[0].contactId).toBe("");
  });

  it("cuenta las vencidas y marca la más antigua como la que primero vence", () => {
    const filas = deudores(
      [
        cuenta({ id: "p1", at: ISO("2026-09-01T00:00:00Z") }),
        cuenta({ id: "p2", at: ISO("2026-11-10T00:00:00Z") }),
      ],
      [cliente({ creditDays: 30 })],
      AHORA
    );
    expect(filas[0].cuentas).toBe(2);
    expect(filas[0].vence).toBe(ISO("2026-10-01T00:00:00Z"));
    expect(filas[0].diasAtraso).toBe(45);
  });

  it("los morosos son los de 30 días o más de atraso", () => {
    const filas = deudores([cuenta({ at: ISO("2026-09-01T00:00:00Z") })], [cliente({ creditDays: 30 })], AHORA);
    expect(morosos(filas)).toHaveLength(1);
    expect(morosos(filas, 60)).toHaveLength(0);
  });
});

describe("cuentas y abonos de un deudor", () => {
  it("deja fuera anuladas y cuentas por pagar", () => {
    const pendings = [
      cuenta({ id: "p1" }),
      cuenta({ id: "p2", status: "anulado" }),
      cuenta({ id: "p3", direction: "pagar" }),
      cuenta({ id: "p4", contactId: "otro" }),
    ];
    expect(cuentasDe(pendings, "c1").map((p) => p.id)).toEqual(["p1"]);
  });

  it("el grupo sin cliente reúne también las cuentas que nunca trajeron contactId", () => {
    const pendings = [
      cuenta({ id: "p1", contactId: undefined }),
      cuenta({ id: "p2", contactId: "" }),
      cuenta({ id: "p3", contactId: "c1" }),
    ];
    expect(cuentasDe(pendings, "").map((p) => p.id)).toEqual(["p1", "p2"]);
  });

  it("reconoce el abono por pendingId y también por concepto en los viejos", () => {
    const p = cuenta();
    const movimientos = [
      abono({ id: "m1", pendingId: "p1" }),
      abono({ id: "m2", pendingId: undefined, note: "Venta 000007" }),
      abono({ id: "m3", pendingId: "p1", reversedAt: ISO("2026-11-01T00:00:00Z") }),
      abono({ id: "m4", pendingId: "p1", direction: "salida" }),
      abono({ id: "m5", pendingId: "p9", note: "Venta 000099" }),
    ];
    expect(abonosDe(movimientos, p).map((m) => m.id)).toEqual(["m1", "m2"]);
  });
});

describe("estado de cuenta", () => {
  const pendings = [
    cuenta({ id: "p1", amountUsd: 100 }),
    cuenta({ id: "p2", at: ISO("2026-11-01T00:00:00Z"), subject: "Venta 000021", amountUsd: 60 }),
  ];
  const movimientos = [
    abono({ id: "m1", pendingId: "p1", amountUsd: 40, at: ISO("2026-10-10T00:00:00Z") }),
    abono({ id: "m2", pendingId: "p1", amountUsd: 10, at: ISO("2026-10-15T00:00:00Z"), note: "transferencia" }),
  ];

  it("arranca con las ventas, cruza los abonos y lleva el saldo corrido", () => {
    const filas = estadoDeCuenta(pendings, movimientos, "c1");
    expect(filas.map((f) => f.concepto)).toEqual([
      "Venta 000007",
      "Abono",
      "Abono",
      "Venta 000021",
    ]);
    expect(filas.map((f) => f.saldo)).toEqual([100, 60, 50, 110]);
    expect(saldoAlCierre(filas)).toBe(110);
  });

  it("no imprime dos veces el concepto cuando el cajero no escribió nota", () => {
    const filas = estadoDeCuenta(pendings, movimientos, "c1");
    expect(filas[1].referencia).toBe("");
    expect(filas[2].referencia).toBe("transferencia");
  });

  it("filtra por periodo y arrastra el saldo anterior en vez de partir de cero", () => {
    const filas = estadoDeCuenta(pendings, movimientos, "c1", {
      desde: ISO("2026-10-12T00:00:00Z"),
      hasta: ISO("2026-10-31T00:00:00Z"),
    });
    expect(filas.map((f) => f.concepto)).toEqual(["Saldo anterior", "Abono"]);
    expect(filas.map((f) => f.saldo)).toEqual([60, 50]);
    expect(saldoAlCierre(filas)).toBe(50);
  });

  it("un deudor sin cuentas no produce filas ni saldo", () => {
    expect(estadoDeCuenta(pendings, movimientos, "c999")).toEqual([]);
    expect(saldoAlCierre([])).toBe(0);
  });
});
