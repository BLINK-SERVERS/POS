// Tasa de cambio real: Binance P2P (lectura) y equivalentes cripto.
//
// Fuentes verificadas contra los servicios reales:
//   · Binance no tiene par spot USDT/VES (`-1121 Invalid symbol`).
//   · El endpoint P2P de Binance no se puede llamar desde el navegador
//     (su preflight no permite `content-type: application/json`).
//   · CriptoYa publica la cotización Binance P2P con CORS abierto:
//       GET https://criptoya.com/api/binancep2p/USDT/VES/1
//       → {"ask":1035,"bid":1038.5}
//     Es solo un lector de la tasa: no recibe, intermedia ni retiene pagos.
//   · `api.binance.com/api/v3/ticker/price` sí tiene CORS `*` para los
//     equivalentes en BTC/ETH/USDC.
//
// Regla de oro: si no hay tasa, NO se inventa un monto. Se muestra el error
// y se ofrece reintentar (o la última tasa conocida, claramente marcada).
import type { MetodoPago } from "./activacion";

const CRIPTOYA = "https://criptoya.com/api/binancep2p/USDT/VES/1";
const BINANCE = "https://api.binance.com/api/v3/ticker/price?symbol=";

/** La tasa se reutiliza 5 minutos: no cambia lo suficiente para el cobro. */
export const VIGENCIA_TASA_MS = 5 * 60 * 1000;
const CACHE_KEY = "blink-pos-tasa-usdt-ves";
const TIMEOUT_MS = 8000;

export interface TasaP2P {
  /** Bolívares por 1 USDT (precio de compra de USDT, `ask`). */
  tasa: number;
  /** Momento de la cotización (ISO). */
  en: string;
  fuente: "Binance P2P · CriptoYa";
}

export type ResultadoTasa =
  | { ok: true; tasa: TasaP2P; cacheada: boolean }
  | { ok: false; error: string; ultima: TasaP2P | null };

/* ------------------------------------------------------------------ */
/* Formato                                                             */
/* ------------------------------------------------------------------ */

const bsFmt = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdFmt = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** «1.035,00» */
export function formatearBs(n: number): string {
  return Number.isFinite(n) ? bsFmt.format(n) : "—";
}

/** «25,00» (sin símbolo: cada pantalla decide «$» o «Bs»). */
export function formatearNumero(n: number, decimales = 2): string {
  const fmt =
    decimales === 2
      ? usdFmt
      : new Intl.NumberFormat("es-VE", {
          minimumFractionDigits: decimales,
          maximumFractionDigits: decimales,
        });
  return Number.isFinite(n) ? fmt.format(n) : "—";
}

/** Decimales razonables por moneda cripto (acepta «BTC» y «btc»). */
export function decimalesDe(moneda: MetodoPago | string): number {
  const m = String(moneda).toLowerCase();
  if (m === "btc") return 8;
  if (m === "eth") return 6;
  return 2;
}

/** Cuántas unidades de una moneda equivalen a un monto en USD. */
export function equivalente(usd: number, precioUsd: number): number | null {
  if (!Number.isFinite(usd) || !Number.isFinite(precioUsd) || precioUsd <= 0) return null;
  return usd / precioUsd;
}

/** «hace 2 min», «hace 1 h», «ahora». */
export function hace(iso: string, ahora = Date.now()): string {
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "";
  const s = Math.max(0, Math.round((ahora - ms) / 1000));
  if (s < 45) return "ahora";
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} d`;
}

/* ------------------------------------------------------------------ */
/* Lectura de las fuentes                                              */
/* ------------------------------------------------------------------ */

/** Extrae el `ask` de la respuesta de CriptoYa (o null si no es válida). */
export function tasaDesdeCriptoya(json: unknown): number | null {
  if (!json || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;
  const candidatos = [o.ask, o.bid, o.totalAsk, o.totalBid];
  for (const c of candidatos) {
    const n = typeof c === "string" ? Number(c) : typeof c === "number" ? c : NaN;
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/** Extrae el precio de `/ticker/price`. */
export function precioDesdeBinance(json: unknown): number | null {
  if (!json || typeof json !== "object") return null;
  const p = (json as Record<string, unknown>).price;
  const n = typeof p === "string" ? Number(p) : typeof p === "number" ? p : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

function almacen(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Última tasa guardada, sin importar su antigüedad. */
export function tasaGuardada(almacenaje: Storage | null = almacen()): TasaP2P | null {
  try {
    const raw = almacenaje?.getItem(CACHE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<TasaP2P>;
    if (typeof o.tasa !== "number" || !Number.isFinite(o.tasa) || o.tasa <= 0) return null;
    if (typeof o.en !== "string") return null;
    return { tasa: o.tasa, en: o.en, fuente: "Binance P2P · CriptoYa" };
  } catch {
    return null;
  }
}

function guardarTasa(t: TasaP2P, almacenaje: Storage | null = almacen()): void {
  try {
    almacenaje?.setItem(CACHE_KEY, JSON.stringify(t));
  } catch {
    /* almacenamiento lleno o bloqueado */
  }
}

/** ¿La tasa guardada todavía sirve (menos de 5 minutos)? */
export function tasaFresca(t: TasaP2P | null, ahora = Date.now()): t is TasaP2P {
  if (!t) return false;
  const ms = new Date(t.en).getTime();
  return Number.isFinite(ms) && ahora - ms < VIGENCIA_TASA_MS && ahora - ms >= -60_000;
}

async function conTimeout(
  url: string,
  timeoutMs: number,
  fetchImpl: typeof fetch
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { signal: ctrl.signal, headers: { accept: "application/json" } });
  } finally {
    clearTimeout(t);
  }
}

/**
 * Tasa USDT→VES. Usa la copia de 5 minutos si existe y, si la red falla,
 * devuelve la última conocida para que la pantalla decida qué mostrar.
 */
export async function fetchTasaP2P(opciones: {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  ahora?: number;
  forzar?: boolean;
  almacenaje?: Storage | null;
} = {}): Promise<ResultadoTasa> {
  const {
    fetchImpl = fetch,
    timeoutMs = TIMEOUT_MS,
    ahora = Date.now(),
    forzar = false,
    almacenaje = almacen(),
  } = opciones;

  const guardada = tasaGuardada(almacenaje);
  if (!forzar && tasaFresca(guardada, ahora)) {
    return { ok: true, tasa: guardada, cacheada: true };
  }

  try {
    const res = await conTimeout(CRIPTOYA, timeoutMs, fetchImpl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const tasa = tasaDesdeCriptoya(await res.json());
    if (!tasa) throw new Error("Respuesta sin tasa");
    const valor: TasaP2P = {
      tasa,
      en: new Date(ahora).toISOString(),
      fuente: "Binance P2P · CriptoYa",
    };
    guardarTasa(valor, almacenaje);
    return { ok: true, tasa: valor, cacheada: false };
  } catch {
    return {
      ok: false,
      error:
        "No pudimos leer la tasa Binance P2P. Revisa tu conexión y reintenta: no mostramos un monto inventado.",
      ultima: guardada,
    };
  }
}

export interface Cripto {
  btc: number | null;
  eth: number | null;
  usdc: number | null;
}

/** Precio en USD de BTC, ETH y USDC (Binance spot, CORS abierto). */
export async function fetchCripto(opciones: {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
} = {}): Promise<Cripto> {
  const { fetchImpl = fetch, timeoutMs = TIMEOUT_MS } = opciones;

  const uno = async (simbolo: string): Promise<number | null> => {
    try {
      const res = await conTimeout(`${BINANCE}${simbolo}`, timeoutMs, fetchImpl);
      if (!res.ok) return null;
      return precioDesdeBinance(await res.json());
    } catch {
      return null;
    }
  };

  const [btc, eth, usdc] = await Promise.all([uno("BTCUSDT"), uno("ETHUSDT"), uno("USDCUSDT")]);
  return { btc, eth, usdc };
}
