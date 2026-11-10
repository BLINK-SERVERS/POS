// Verificación por ejecución de los hallazgos de la auditoría del 2026-11-10.
//
// Cada bloque reproduce, con datos mínimos, el escenario reportado por los
// agentes de auditoría y afirma el comportamiento ACTUAL del código (que es
// el bug), de modo que al corregirlo estas pruebas deben invertirse.
import { describe, expect, it } from "vitest";
import { toCsv } from "../export";
import { expectedCash } from "../metrics";
import { monthSalesCount } from "../exportData";
import type { AppState } from "../types";

function base(over: Partial<AppState> = {}): AppState {
  return {
    rate: 0,
    accounts: [],
    movements: [],
    sales: [],
    cashSession: null,
    ...over,
  } as unknown as AppState;
}

describe("Auditoría 2026-11-10 · inyección de fórmulas en CSV (export.ts)", () => {
  it("deja pasar '=HYPERLINK(...)' sin neutralizar el '=' inicial", () => {
    const csv = toCsv(["Nombre"], [['=HYPERLINK("http://mal","x")']]);
    // El entrecomillado CSV no evita que Excel ejecute la fórmula: la celda
    // sigue EMPEZANDO por '='. Un esc() correcto la prefijaría con "'" o espacio.
    expect(csv).toContain('"=HYPERLINK');
  });

  it("deja pasar '+1|cmd' completamente sin comillas (sin caracteres de escape)", () => {
    const csv = toCsv(["Nombre"], [["+1|cmd"]]);
    expect(csv).toContain("+1|cmd");
    expect(csv).not.toContain('"');
  });

  it("deja pasar '@SUM(1+1)*2|0' sin neutralizar la '@'", () => {
    const csv = toCsv(["Nombre"], [["@SUM(1+1)*2|0"]]);
    expect(csv).toContain("@SUM");
  });
});

describe("Auditoría 2026-11-10 · arqueo con tasa actual (metrics.expectedCash)", () => {
  const cuenta = {
    id: "a1",
    name: "Caja Bs",
    type: "efectivo" as const,
    currency: "VES" as const,
    balance: 0,
    commissionIn: 0,
    commissionOut: 0,
    active: true,
  };

  it("recalcula un movimiento viejo con la tasa de HOY (deriva del arqueo)", () => {
    // Gasto registrado cuando la tasa era 40: Bs 4.000 = 100 USD.
    const estatal = base({
      rate: 80, // la tasa subió a 80 al final del turno
      cashSession: {
        openedAt: "2026-11-10T08:00:00",
        openingUsd: 0,
        openingBs: 0,
        userId: "u",
        locationId: "",
      },
      accounts: [cuenta],
      movements: [
        {
          id: "m1",
          at: "2026-11-10T09:00:00",
          accountId: "a1",
          direction: "salida",
          amountUsd: 100, // sin amountInput: emisor legacy (adjustAccount)
          currency: "VES",
          origin: "Ajuste",
          note: "",
          userId: "u",
        },
      ],
    });
    // Con la tasa de HOY (80) el "esperado" pasa de Bs −4.000 a Bs −8.000.
    // El arqueo del turno muta aunque ningún movimiento cambió.
    expect(expectedCash(estatal).bs).toBe(-8000);
  });

  it("con rate=0 omite el movimiento viejo y marca rateMissing (BLINK-066 corregido)", () => {
    const estatal = base({
      rate: 0,
      cashSession: {
        openedAt: "2026-11-10T08:00:00",
        openingUsd: 0,
        openingBs: 0,
        userId: "u",
        locationId: "",
      },
      accounts: [cuenta],
      movements: [
        {
          id: "m1",
          at: "2026-11-10T09:00:00",
          accountId: "a1",
          direction: "entrada",
          amountUsd: 10,
          currency: "VES",
          origin: "Ajuste",
          note: "",
          userId: "u",
        },
      ],
    });
    // CORREGIDO (BLINK-066): el movimiento viejo sin monto nativo y sin tasa
    // NO se convierte 1:1: se omite del esperado y se marca rateMissing.
    expect(expectedCash(estatal).bs).toBe(0);
    expect(expectedCash(estatal).rateMissing).toBe(true);
  });
});

describe("Auditoría 2026-11-10 · monthSalesCount ignora el año (exportData.ts)", () => {
  it("cuenta una venta de noviembre del año pasado como 'del mes en curso'", () => {
    const estatal = base({
      sales: [
        { id: "v1", at: "2025-11-10T12:00:00", status: "pagada" },
        { id: "v2", at: "2026-11-10T12:00:00", status: "pagada" },
      ] as unknown as AppState["sales"],
    });
    // Hoy es noviembre de 2026: deberían contar 1 (solo la de este año).
    const total = monthSalesCount(estatal);
    expect(total).toBeGreaterThanOrEqual(2); // cuenta las dos: el bug
    expect(new Date().getMonth()).toBe(10); // guarda: la prueba solo aplica en noviembre
  });
});
