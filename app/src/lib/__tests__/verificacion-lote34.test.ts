// Verificación del lote 34 (dueño, 2026-11-21): las reglas que se pueden probar
// sin navegador. IGTF fuera de los cobros nuevos, la lógica del vuelto en la
// pantalla de cobro —que ahora es un solo paso— y el cartel de instalación.
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  saldoPendiente,
  ticketTotal,
  vuelto,
} from "../fiscal";
import { round2 } from "../money";
import type { SalePayment } from "../types";
import type { EventoInstalacion } from "../instalacion";

describe("BLINK-134 · el IGTF ya no forma parte del ticket", () => {
  it("cobrar $ 100 en divisas cuesta $ 100, no $ 103", () => {
    // Antes la pantalla gross-up del cobro en USD: el monto exacto era
    // `missing / (1 − 0,03)` y el total sumaba un 3 % encima.
    expect(ticketTotal(100, 0, 0)).toBe(100);
  });

  it("neto + IVA + recargos, en ese orden y nada más", () => {
    expect(ticketTotal(100, 16, 5)).toBe(121);
    expect(ticketTotal(0, 0, 0)).toBe(0);
  });

  it("un ticket cerrado en divisas se cuadra con su propio total", () => {
    const total = ticketTotal(100, 16, 0);
    const pagos: SalePayment[] = [
      { method: "Divisas", currency: "USD", amountUsd: total, amountInput: total },
    ];
    expect(saldoPendiente(total, pagos, round2(total * 884.75), 884.75).remaining).toBe(0);
  });
});

describe("BLINK-138 · lógica del vuelto", () => {
  it("entregar de menos no genera vuelto y acredita lo entregado", () => {
    expect(vuelto(7, 10)).toEqual({ charged: 7, change: 0 });
  });

  it("entregar lo justo no genera vuelto", () => {
    expect(vuelto(10, 10)).toEqual({ charged: 10, change: 0 });
  });

  it("entregar de más acredita el falta y devuelve la diferencia", () => {
    // El billete completo no entra a la caja: la venta se cierra con lo que
    // valía y el resto se entrega.
    expect(vuelto(20, 12.5)).toEqual({ charged: 12.5, change: 7.5 });
    expect(vuelto(50, 12.5)).toEqual({ charged: 12.5, change: 37.5 });
  });

  it("en bolívares la regla es la misma, en Bs", () => {
    expect(vuelto(500, 458.85)).toEqual({ charged: 458.85, change: 41.15 });
  });

  it("sin falta conocida se acredita lo entregado, nunca se inventa un vuelto", () => {
    expect(vuelto(50, 0)).toEqual({ charged: 50, change: 0 });
    expect(vuelto(50, -3)).toEqual({ charged: 50, change: 0 });
  });

  it("un monto de 0 o negativo no es un cobro", () => {
    expect(vuelto(0, 10)).toEqual({ charged: 0, change: 0 });
    expect(vuelto(-5, 10)).toEqual({ charged: 0, change: 0 });
  });
});

describe("BLINK-130 · instalar la app cierra el cartel para siempre", () => {
  /** Android sin `standalone` todavía: el navegador ya instaló, pero la
   *  pestaña sigue viéndose como web. Así es como el cartel regresaba. */
  async function escenario() {
    const guardado = new Map<string, string>();
    const registrados = new Map<string, (e: unknown) => void>();
    vi.resetModules();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => guardado.get(k) ?? null,
      setItem: (k: string, v: string) => void guardado.set(k, v),
      removeItem: (k: string) => void guardado.delete(k),
    });
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
      platform: "Linux armv8l",
      maxTouchPoints: 5,
      standalone: false,
    });
    vi.stubGlobal("window", {
      addEventListener: (tipo: string, f: (e: unknown) => void) => void registrados.set(tipo, f),
      matchMedia: () => ({ matches: false }),
    });
    const m = await import("../instalacion");
    m.prepararInstalacion();
    const disparar = (tipo: string, evento: unknown) => registrados.get(tipo)?.(evento);
    const oferta = () => {
      const evento = {
        preventDefault: () => {},
        prompt: () => Promise.resolve(),
        userChoice: Promise.resolve({ outcome: "accepted" as const }),
      };
      disparar("beforeinstallprompt", evento);
      return evento as unknown as EventoInstalacion;
    };
    return { m, disparar, oferta };
  }

  afterEach(() => vi.unstubAllGlobals());

  it("con la oferta del navegador a la vista, el cartel se muestra", async () => {
    const { m, oferta } = await escenario();
    oferta();
    expect(m.modoInstalacion()).toBe("nativo");
  });

  it("aceptar el diálogo lo calla aunque el navegador aún no se vea instalado", async () => {
    const { m, oferta } = await escenario();
    oferta();
    expect(await m.instalar()).toBe(true);
    expect(m.modoInstalacion()).toBeNull();
  });

  it("un appinstalled suelto —instalar desde el menú— también lo calla", async () => {
    const { m, disparar } = await escenario();
    expect(m.modoInstalacion()).toBe("android");
    disparar("appinstalled", {});
    expect(m.modoInstalacion()).toBeNull();
  });

  it("si el navegador vuelve a ofrecerla, es que ya no está instalada: reaparece", async () => {
    const { m, disparar, oferta } = await escenario();
    disparar("appinstalled", {});
    expect(m.modoInstalacion()).toBeNull();
    oferta();
    expect(m.modoInstalacion()).toBe("nativo");
  });
});
