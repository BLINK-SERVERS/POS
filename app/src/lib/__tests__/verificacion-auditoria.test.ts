// Verificación por ejecución de los hallazgos de la auditoría del 2026-11-10.
//
// Cada bloque reproduce, con datos mínimos, el escenario reportado por los
// agentes de auditoría y afirma el comportamiento ACTUAL del código (que es
// el bug), de modo que al corregirlo estas pruebas deben invertirse.
import { describe, expect, it } from "vitest";
import { toCsv } from "../export";
import { expectedCash, diaLocal } from "../metrics";
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
  it("neutraliza '=HYPERLINK(...)' prefijándolo con apóstrofo (BLINK-072 corregido)", () => {
    const csv = toCsv(["Nombre"], [['=HYPERLINK("http://mal","x")']]);
    // El contenido de la celda ya no empieza por '=': Excel lo lee como texto.
    // (La celda sigue entrecomillada por sus comas y comillas internas: el
    // entrecomillado CSV no es lo que neutraliza la fórmula; el apóstrofo sí.)
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain("\"'=HYPERLINK");
  });

  it("neutraliza '+1|cmd' prefijándolo con apóstrofo", () => {
    const csv = toCsv(["Nombre"], [["+1|cmd"]]);
    expect(csv).toContain("'+1|cmd");
  });

  it("neutraliza '@SUM(1+1)*2|0' prefijándolo con apóstrofo", () => {
    const csv = toCsv(["Nombre"], [["@SUM(1+1)*2|0"]]);
    expect(csv).toContain("'@SUM");
    expect(csv).not.toContain('"@SUM');
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

  it("valoriza un movimiento viejo con la tasa de APERTURA del turno (BLINK-071 corregido)", () => {
    // Gasto registrado cuando la tasa era 40: Bs 4.000 = 100 USD.
    const estatal = base({
      rate: 80, // la tasa subió a 80 al final del turno
      cashSession: {
        openedAt: "2026-11-10T08:00:00",
        openingUsd: 0,
        openingBs: 0,
        userId: "u",
        locationId: "",
        rate: 40, // tasa congelada al abrir el turno
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
    // CORREGIDO (BLINK-071): el esperado usa la tasa de apertura (40), no la
    // de hoy (80): el arqueo del turno ya no muta cuando cambia la tasa.
    expect(expectedCash(estatal).bs).toBe(-4000);
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

describe("Auditoría 2026-11-10 · gasto recurrente fechado un día antes (BLINK-075 corregido)", () => {
  it("diaLocal serializa la medianoche local sin desplazarla a UTC", () => {
    // 5 de noviembre de 2026, medianoche LOCAL: con toISOString() en UTC-4
    // salía "2026-11-05T04:00:00Z" (y "2026-11-04T20:00:00Z" si se parseaba
    // como fecha suelta). El día local no se mueve.
    expect(diaLocal(new Date(2026, 10, 5))).toBe("2026-11-05");
    expect(diaLocal(new Date(2026, 0, 31))).toBe("2026-01-31");
    expect(diaLocal(new Date(2026, 11, 1))).toBe("2026-12-01");
  });
});

describe("Auditoría 2026-11-10 · monthSalesCount ignora el año (exportData.ts)", () => {  it("cuenta una venta de noviembre del año pasado como 'del mes en curso'", () => {
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
