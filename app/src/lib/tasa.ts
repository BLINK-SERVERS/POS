// Tasa de cambio real: Binance P2P (lectura) y equivalentes cripto.
//
// Regla de BLINK (la fijó el dueño el 2026-11-18): el monto en bolívares que
// paga un comercio es el del **primer anuncio de Binance P2P** —el promocionado,
// el que el cliente ve arriba de todo en p2p.binance.com—, con una guarda: si ese
// anuncio se desvía más de 3 % del primero que sí puede cobrar $25, manda el
// ejecutable. Hace falta porque el primer puesto es un espacio pago y su dueño
// elige el tope de la transacción: medido ese día ofrecía 1055,54 Bs… para 0,28
// USDT (Bs 301), mientras todo el mercado ejecutable estaba en 1070,7.
//
// Fuentes verificadas contra los servicios reales:
//   · Binance no tiene par spot USDT/VES (`-1121 Invalid symbol`).
//   · El listado P2P SÍ se puede leer desde el navegador, pero solo por la ruta
//     pública: `GET https://p2p.binance.com/bapi/c2c/v1/public/c2c/agent/ad-list`
//     responde `access-control-allow-origin: *` (comprobado en Chromium desde el
//     propio hostname de producción). El `POST .../friendly/c2c/adv/search` que
//     usa la web sigue sin CORS —de ahí el mito de que P2P no era legible— y sus
//     403 con cabeceras de navegador son del WAF contra orígenes ajenos, no contra
//     `pos.blink.com.ve`.
//   · CriptoYa queda como respaldo: publica la cotización Binance P2P con CORS
//     abierto (`GET /api/binancep2p/USDT/VES/1` → `{"ask":1035,"bid":1038.5}`).
//     Es solo un lector de la tasa: no recibe, intermedia ni retiene pagos.
//   · `api.binance.com/api/v3/ticker/price` sí tiene CORS `*` para los
//     equivalentes en BTC/ETH/USDC.
//
// Regla de oro: si no hay tasa, NO se inventa un monto. Se muestra el error
// y se ofrece reintentar (o la última tasa conocida, claramente marcada).
import { PRECIO_USD, type MetodoPago } from "./activacion";

/** Primeros anuncios de la pantalla de Binance P2P, en el orden que se muestran. */
const ADLIST =
  "https://p2p.binance.com/bapi/c2c/v1/public/c2c/agent/ad-list" +
  "?asset=USDT&fiat=VES&tradeType=BUY&page=1&rows=10";
const CRIPTOYA = "https://criptoya.com/api/binancep2p/USDT/VES/1";
const BINANCE = "https://api.binance.com/api/v3/ticker/price?symbol=";

/** La tasa se reutiliza 5 minutos: no cambia lo suficiente para el cobro. */
export const VIGENCIA_TASA_MS = 5 * 60 * 1000;
/** Cuánto puede separarse el promocionado del mercado antes de descartarlo. */
export const TOLERANCIA_PROMOCIONADO = 0.03;
const CACHE_KEY = "blink-pos-tasa-usdt-ves";
const TIMEOUT_MS = 8000;

export type FuenteTasa =
  | "Binance P2P · anuncio promocionado"
  | "Binance P2P · 1er anuncio ejecutable"
  | "Binance P2P · CriptoYa";

const FUENTES: FuenteTasa[] = [
  "Binance P2P · anuncio promocionado",
  "Binance P2P · 1er anuncio ejecutable",
  "Binance P2P · CriptoYa",
];

export interface TasaP2P {
  /** Bolívares por 1 USDT. */
  tasa: number;
  /** Momento de la cotización (ISO). */
  en: string;
  /** De cuál anuncio (o del respaldo) salió el número que se cobra. */
  fuente: FuenteTasa;
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

/** Precio en Bs y tope por transacción en USDT de cada anuncio de `ad-list`. */
interface AnuncioP2P {
  price: number;
  maxTransAmount: number;
}

function anunciosDesde(json: unknown): AnuncioP2P[] {
  if (!json || typeof json !== "object") return [];
  const items = (json as { data?: { items?: unknown } }).data?.items;
  if (!Array.isArray(items)) return [];
  const anuncios: AnuncioP2P[] = [];
  for (const item of items) {
    const a = item as Partial<AnuncioP2P>;
    const price = Number(a?.price);
    if (!Number.isFinite(price) || price <= 0) continue;
    const max = Number(a?.maxTransAmount);
    anuncios.push({ price, maxTransAmount: Number.isFinite(max) ? max : 0 });
  }
  return anuncios;
}

/**
 * Tasa según la regla de BLINK: el primer anuncio (el promocionado), salvo que se
 * desvíe más de `TOLERANCIA_PROMOCIONADO` del primero que sí puede cobrar
 * `montoUsd`. Si ningún anuncio llega a ese monto no hay con qué comparar y manda
 * el promocionado. `null` solo cuando la respuesta no trae anuncios.
 */
export function tasaDesdeAnuncios(
  json: unknown,
  montoUsd = PRECIO_USD
): { tasa: number; fuente: FuenteTasa } | null {
  const anuncios = anunciosDesde(json);
  if (!anuncios.length) return null;
  const promocionado = anuncios[0];
  const ejecutable = anuncios.find((a) => a.maxTransAmount >= montoUsd);
  if (!ejecutable) return { tasa: promocionado.price, fuente: "Binance P2P · anuncio promocionado" };
  const desviacion = Math.abs(promocionado.price - ejecutable.price) / ejecutable.price;
  return desviacion <= TOLERANCIA_PROMOCIONADO
    ? { tasa: promocionado.price, fuente: "Binance P2P · anuncio promocionado" }
    : { tasa: ejecutable.price, fuente: "Binance P2P · 1er anuncio ejecutable" };
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
    // El caché anterior no guardaba la fuente: ese número sí salió de CriptoYa.
    const fuente: FuenteTasa = FUENTES.includes(o.fuente as FuenteTasa)
      ? (o.fuente as FuenteTasa)
      : "Binance P2P · CriptoYa";
    return { tasa: o.tasa, en: o.en, fuente };
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
 * Tasa USDT→VES cobrada en BLINK: el primer anuncio de Binance P2P con la guarda
 * del 3 % (`tasaDesdeAnuncios`); si esa lectura falla, el `ask` de CriptoYa. Usa
 * la copia de 5 minutos si existe y, si nada responde, devuelve la última conocida
 * para que la pantalla decida qué mostrar.
 */
export async function fetchTasaP2P(opciones: {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  ahora?: number;
  forzar?: boolean;
  almacenaje?: Storage | null;
  /** De cuánto es el cobro al que hay que buscarle anuncio: $25 por defecto. */
  montoUsd?: number;
} = {}): Promise<ResultadoTasa> {
  const {
    fetchImpl = fetch,
    timeoutMs = TIMEOUT_MS,
    ahora = Date.now(),
    forzar = false,
    almacenaje = almacen(),
    montoUsd = PRECIO_USD,
  } = opciones;

  const guardada = tasaGuardada(almacenaje);
  if (!forzar && tasaFresca(guardada, ahora)) {
    return { ok: true, tasa: guardada, cacheada: true };
  }

  const leer = async (
    url: string,
    extraer: (json: unknown) => { tasa: number; fuente: FuenteTasa } | null
  ) => {
    try {
      const res = await conTimeout(url, timeoutMs, fetchImpl);
      if (!res.ok) return null;
      return extraer(await res.json());
    } catch {
      return null;
    }
  };

  const elegida =
    (await leer(ADLIST, (j) => tasaDesdeAnuncios(j, montoUsd))) ??
    (await leer(CRIPTOYA, (j) => {
      const tasa = tasaDesdeCriptoya(j);
      return tasa ? { tasa, fuente: "Binance P2P · CriptoYa" as const } : null;
    }));

  if (!elegida) {
    return {
      ok: false,
      error:
        "No pudimos leer la tasa Binance P2P. Revisa tu conexión y reintenta: no mostramos un monto inventado.",
      ultima: guardada,
    };
  }

  const valor: TasaP2P = { ...elegida, en: new Date(ahora).toISOString() };
  guardarTasa(valor, almacenaje);
  return { ok: true, tasa: valor, cacheada: false };
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
