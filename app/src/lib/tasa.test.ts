// Pruebas de la tasa Binance P2P: parseo, caché, equivalente y fallos.
// Sin red: se inyecta un `fetch` falso.
import { describe, expect, it, vi } from "vitest";
import {
  decimalesDe,
  equivalente,
  fetchCripto,
  fetchTasaP2P,
  formatearBs,
  hace,
  precioDesdeBinance,
  tasaDesdeCriptoya,
  tasaFresca,
  tasaGuardada,
  VIGENCIA_TASA_MS,
} from "./tasa";

const AHORA = new Date("2026-11-08T12:00:00Z").getTime();

function almacenFalso(inicial: Record<string, string> = {}) {
  const datos = new Map(Object.entries(inicial));
  const storage = {
    getItem: (k: string) => datos.get(k) ?? null,
    setItem: (k: string, v: string) => void datos.set(k, v),
    removeItem: (k: string) => void datos.delete(k),
    clear: () => datos.clear(),
    key: () => null,
    get length() {
      return datos.size;
    },
  } as unknown as Storage;
  return { storage, datos };
}

function respuesta(json: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => json,
    headers: new Headers({ "content-type": "application/json" }),
  } as unknown as Response;
}

describe("tasaDesdeCriptoya", () => {
  it("lee el ask de la respuesta real", () => {
    expect(tasaDesdeCriptoya({ ask: 1035, bid: 1038.5 })).toBe(1035);
  });

  it("acepta números como texto", () => {
    expect(tasaDesdeCriptoya({ ask: "1114.13" })).toBe(1114.13);
  });

  it("rechaza respuestas sin tasa válida", () => {
    expect(tasaDesdeCriptoya({})).toBeNull();
    expect(tasaDesdeCriptoya({ ask: 0 })).toBeNull();
    expect(tasaDesdeCriptoya({ ask: "abc" })).toBeNull();
    expect(tasaDesdeCriptoya(null)).toBeNull();
  });
});

describe("precioDesdeBinance", () => {
  it("lee el precio spot", () => {
    expect(precioDesdeBinance({ symbol: "BTCUSDT", price: "75776.35" })).toBe(75776.35);
    expect(precioDesdeBinance({ price: 2226.95 })).toBe(2226.95);
  });

  it("descarta respuestas inválidas", () => {
    expect(precioDesdeBinance({ price: "-1" })).toBeNull();
    expect(precioDesdeBinance("nada")).toBeNull();
  });
});

describe("equivalente", () => {
  it("convierte dólares a unidades de la moneda", () => {
    expect(equivalente(25, 100)).toBe(0.25);
    expect(equivalente(25, 75776.35)!.toFixed(8)).toBe("0.00032992");
  });

  it("no inventa si el precio no sirve", () => {
    expect(equivalente(25, 0)).toBeNull();
    expect(equivalente(25, NaN)).toBeNull();
  });
});

describe("formato", () => {
  it("muestra bolívares con dos decimales y separador de miles", () => {
    // Intl puede usar NBSP como separador; se normaliza para comparar.
    expect(formatearBs(1035).replace(/\u00a0/g, " ")).toBe("1.035,00");
  });

  it("elige decimales razonables por moneda", () => {
    expect(decimalesDe("btc")).toBe(8);
    expect(decimalesDe("eth")).toBe(6);
    expect(decimalesDe("usdt")).toBe(2);
    // La interfaz nombra la moneda en mayúsculas («BTC»).
    expect(decimalesDe("BTC")).toBe(8);
    expect(decimalesDe("ETH")).toBe(6);
    expect(decimalesDe("USDC")).toBe(2);
  });

  it("describe la antigüedad de la tasa", () => {
    const en = new Date(AHORA - 2 * 60_000).toISOString();
    expect(hace(en, AHORA)).toBe("hace 2 min");
    expect(hace(new Date(AHORA - 10_000).toISOString(), AHORA)).toBe("ahora");
    expect(hace("nada", AHORA)).toBe("");
  });
});

describe("caché de 5 minutos", () => {
  it("guarda y recupera la tasa", () => {
    const { storage } = almacenFalso();
    expect(tasaGuardada(storage)).toBeNull();
    // Se guarda a través de una lectura exitosa.
    const fetchFalso = vi.fn(async () => respuesta({ ask: 1035 })) as unknown as typeof fetch;
    return fetchTasaP2P({ fetchImpl: fetchFalso, almacenaje: storage, ahora: AHORA }).then(() => {
      const guardada = tasaGuardada(storage)!;
      expect(guardada.tasa).toBe(1035);
      expect(tasaFresca(guardada, AHORA + 60_000)).toBe(true);
      expect(tasaFresca(guardada, AHORA + VIGENCIA_TASA_MS + 1000)).toBe(false);
    });
  });

  it("usa la copia reciente sin tocar la red", async () => {
    const { storage, datos } = almacenFalso({
      "blink-pos-tasa-usdt-ves": JSON.stringify({
        tasa: 999,
        en: new Date(AHORA - 60_000).toISOString(),
        fuente: "Binance P2P · CriptoYa",
      }),
    });
    const fetchFalso = vi.fn() as unknown as typeof fetch;
    const r = await fetchTasaP2P({ fetchImpl: fetchFalso, almacenaje: storage, ahora: AHORA });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.tasa.tasa).toBe(999);
      expect(r.cacheada).toBe(true);
    }
    expect(datos.size).toBe(1);
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("refresca si la copia venció", async () => {
    const { storage } = almacenFalso({
      "blink-pos-tasa-usdt-ves": JSON.stringify({
        tasa: 999,
        en: new Date(AHORA - VIGENCIA_TASA_MS - 1000).toISOString(),
        fuente: "Binance P2P · CriptoYa",
      }),
    });
    const fetchFalso = vi.fn(async () =>
      respuesta({ ask: 1040, bid: 1041 })
    ) as unknown as typeof fetch;
    const r = await fetchTasaP2P({ fetchImpl: fetchFalso, almacenaje: storage, ahora: AHORA });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.tasa.tasa).toBe(1040);
      expect(r.cacheada).toBe(false);
    }
  });
});

describe("sin tasa no se inventa un monto", () => {
  it("devuelve error y la última conocida cuando la red falla", async () => {
    const { storage } = almacenFalso({
      "blink-pos-tasa-usdt-ves": JSON.stringify({
        tasa: 1020,
        en: new Date(AHORA - 2 * VIGENCIA_TASA_MS).toISOString(),
        fuente: "Binance P2P · CriptoYa",
      }),
    });
    const fetchFalso = vi.fn(async () => respuesta({}, false, 500)) as unknown as typeof fetch;
    const r = await fetchTasaP2P({ fetchImpl: fetchFalso, almacenaje: storage, ahora: AHORA });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toContain("No pudimos leer la tasa");
      expect(r.ultima?.tasa).toBe(1020);
    }
  });

  it("devuelve error sin última cuando nunca hubo tasa", async () => {
    const { storage } = almacenFalso();
    const fetchFalso = vi.fn(async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;
    const r = await fetchTasaP2P({ fetchImpl: fetchFalso, almacenaje: storage, ahora: AHORA });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.ultima).toBeNull();
  });
});

describe("fetchCripto", () => {
  it("consulta BTC, ETH y USDC en paralelo", async () => {
    const llamadas: string[] = [];
    const fetchFalso = vi.fn(async (url: string | URL | Request) => {
      const u = String(url);
      llamadas.push(u);
      if (u.includes("BTCUSDT")) return respuesta({ price: "75776.35" });
      if (u.includes("ETHUSDT")) return respuesta({ price: "2226.95" });
      return respuesta({ price: "1.0001" });
    }) as unknown as typeof fetch;
    const c = await fetchCripto({ fetchImpl: fetchFalso });
    expect(c.btc).toBe(75776.35);
    expect(c.eth).toBe(2226.95);
    expect(c.usdc).toBeCloseTo(1.0001);
    expect(llamadas).toHaveLength(3);
  });

  it("tolera que una moneda falle", async () => {
    const fetchFalso = vi.fn(async (url: string | URL | Request) => {
      if (String(url).includes("ETHUSDT")) throw new Error("boom");
      return respuesta({ price: "1" });
    }) as unknown as typeof fetch;
    const c = await fetchCripto({ fetchImpl: fetchFalso });
    expect(c.eth).toBeNull();
    expect(c.btc).toBe(1);
  });
});
