// Pruebas de los estados de activación (puras, sin red).
import { describe, expect, it } from "vitest";
import {
  estadoReal,
  filaAActivacion,
  filaAPago,
  nombreMetodo,
  puedeOperar,
  restante,
  restanteTexto,
  fechaCorta,
  type Activacion,
} from "./activacion";

const AHORA = new Date("2026-11-08T12:00:00Z").getTime();
const HORA = 3_600_000;
const DIA = 86_400_000;

function act(parcial: Partial<Activacion>): Activacion {
  return {
    userId: "u1",
    email: "t@t.com",
    nombre: "Ana Pérez",
    estado: "pendiente",
    montoUsd: 25,
    metodo: null,
    tasaVes: null,
    vigenteDesde: null,
    vigenteHasta: null,
    purgeEn: null,
    creadoEn: "2026-11-08T11:00:00Z",
    actualizadoEn: "2026-11-08T11:00:00Z",
    ...parcial,
  };
}

describe("estadoReal", () => {
  it("sin activación no se bloquea (cuentas anteriores a 0005)", () => {
    expect(estadoReal(null, AHORA)).toBe("activo");
    expect(puedeOperar(null, AHORA)).toBe(true);
  });

  it("respeta los estados de la base", () => {
    expect(estadoReal(act({ estado: "pendiente" }), AHORA)).toBe("pendiente");
    expect(estadoReal(act({ estado: "en_revision" }), AHORA)).toBe("en_revision");
    expect(estadoReal(act({ estado: "rechazado" }), AHORA)).toBe("rechazado");
  });

  it("activo sin fecha de corte nunca vence (abuelos)", () => {
    expect(estadoReal(act({ estado: "activo", vigenteHasta: null }), AHORA)).toBe("activo");
  });

  it("activo con fecha pasada cuenta como vencido", () => {
    const vencida = act({
      estado: "activo",
      vigenteHasta: new Date(AHORA - HORA).toISOString(),
    });
    expect(estadoReal(vencida, AHORA)).toBe("vencido");
    expect(puedeOperar(vencida, AHORA)).toBe(false);
  });

  it("activo con fecha futura sí opera", () => {
    const aldia = act({
      estado: "activo",
      vigenteHasta: new Date(AHORA + 10 * DIA).toISOString(),
    });
    expect(puedeOperar(aldia, AHORA)).toBe(true);
  });
});

describe("restante", () => {
  it("descompone el tiempo restante", () => {
    const r = restante(new Date(AHORA + 2 * DIA + 3 * HORA).toISOString(), AHORA)!;
    expect(r.vencido).toBe(false);
    expect(r.dias).toBe(2);
    expect(r.horas).toBe(3);
  });

  it("marca como vencido lo que ya pasó y no da negativos", () => {
    const r = restante(new Date(AHORA - 1000).toISOString(), AHORA)!;
    expect(r.vencido).toBe(true);
    expect(r.dias).toBe(0);
    expect(r.horas).toBe(0);
  });

  it("sin fecha no hay cuenta atrás", () => {
    expect(restante(null)).toBeNull();
    expect(restante("no-es-fecha")).toBeNull();
  });
});

describe("restanteTexto", () => {
  it("usa días, horas y minutos de forma legible", () => {
    expect(restanteTexto(new Date(AHORA + 2 * DIA + 4 * HORA).toISOString(), AHORA)).toBe(
      "2 días 4 h"
    );
    expect(restanteTexto(new Date(AHORA + 41 * 60_000 + 8000).toISOString(), AHORA)).toBe(
      "41 min 8 s"
    );
    expect(restanteTexto(new Date(AHORA - DIA).toISOString(), AHORA)).toBe("vencido");
    expect(restanteTexto(null, AHORA)).toBe("");
  });
});

describe("mapeo de filas", () => {
  it("convierte la fila de activación a camelCase con números", () => {
    const a = filaAActivacion({
      user_id: "u9",
      email: "x@y.com",
      nombre: "Luis",
      estado: "en_revision",
      monto_usd: "25.00",
      metodo: "pago_movil",
      tasa_ves: "1035.00",
      vigente_desde: null,
      vigente_hasta: null,
      purge_en: "2026-11-09T12:00:00Z",
      creado_en: "2026-11-08T12:00:00Z",
      actualizado_en: "2026-11-08T12:10:00Z",
    });
    expect(a.userId).toBe("u9");
    expect(a.montoUsd).toBe(25);
    expect(a.tasaVes).toBe(1035);
    expect(a.estado).toBe("en_revision");
  });

  it("convierte la fila de pago y conserva el motivo", () => {
    const p = filaAPago({
      id: "p1",
      user_id: "u9",
      email: "x@y.com",
      metodo: "binance_pay",
      moneda: "USDT",
      monto: "25",
      monto_usd: "25",
      tasa_ves: null,
      referencia: "TX-1",
      nota: null,
      estado: "rechazado",
      creado_en: "2026-11-08T12:00:00Z",
      revisado_en: "2026-11-08T12:30:00Z",
      motivo: "Comprobante ilegible",
    });
    expect(p.metodo).toBe("binance_pay");
    expect(p.estado).toBe("rechazado");
    expect(p.motivo).toBe("Comprobante ilegible");
  });

  it("da nombre legible a cada método", () => {
    expect(nombreMetodo("pago_movil")).toBe("Pago Móvil");
    expect(nombreMetodo("binance_pay")).toBe("Binance Pay");
    expect(nombreMetodo("usdt")).toBe("USDT");
    expect(nombreMetodo(null)).toBe("Otro");
  });

  it("fechaCorta no rompe con valores vacíos", () => {
    expect(fechaCorta(null)).toBe("—");
    expect(fechaCorta("nada")).toBe("—");
  });
});
