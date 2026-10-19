// Tasa oficial de cambio (Bs por USD) desde una API pública venezolana.
//
// Fuente: `https://ve.dolarapi.com` (Dólar oficial). La consulta es de solo
// lectura y **no bloquea** la app: si falla (sin internet, API caída), se sigue
// usando la tasa que el comercio tenga guardada. La tasa solo se escribe al
// estado a través de `setRate` (el store valida > 0).
//
// Política de caché: se consulta al abrir el POS y, como mínimo, cada
// `CACHE_MS`; dentro de esa ventana se usa el valor cacheado en `localStorage`
// para no golpear la API en cada render.

const API_BASE = "https://ve.dolarapi.com/v1";
const CACHE_KEY = "blink:rate-cache-v1";
/** Vida de la caché: dentro de este tiempo no se vuelve a consultar la API. */
export const CACHE_MS = 60 * 60 * 1000; // 1 hora
/** Tope de espera de red: si tarda más, se cae al valor guardado. */
const TIMEOUT_MS = 8000;

export interface OfficialRate {
  /** Bs por USD (tasa oficial). */
  rate: number;
  /** ISO de actualización reportado por la API. */
  updatedAt: string;
  /** ISO de cuándo lo consultamos nosotros. */
  fetchedAt: string;
}

interface CacheShape {
  rate: number;
  updatedAt: string;
  fetchedAt: string;
}

interface DolarApiResponse {
  moneda?: string;
  fuente?: string;
  promedio?: number | null;
  fechaActualizacion?: string;
}

function readCache(): CacheShape | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as CacheShape;
    if (typeof c.rate !== "number" || c.rate <= 0 || !c.fetchedAt || !c.updatedAt) return null;
    return c;
  } catch {
    return null;
  }
}

function writeCache(value: OfficialRate): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible: se consultará de nuevo la próxima vez */
  }
}

/** Último valor cacheado (sin tocar la red). */
export function cachedRate(): OfficialRate | null {
  return readCache();
}

/** ¿La caché sigue vigente? (no hace falta consultar la API todavía). */
export function isCacheFresh(at: number = Date.now()): boolean {
  const c = readCache();
  return !!c && at - Date.parse(c.fetchedAt) < CACHE_MS;
}

/**
 * Consulta la tasa oficial. Devuelve `null` si falla o si el valor no es
 * válido (nunca lanza: la app debe seguir funcionando sin conexión).
 */
export async function fetchOfficialRate(signal?: AbortSignal): Promise<OfficialRate | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener("abort", onAbort);
  try {
    const res = await fetch(`${API_BASE}/dolares/oficial`, {
      method: "GET",
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as DolarApiResponse;
    const rate = Number(data.promedio);
    if (!Number.isFinite(rate) || rate <= 0) return null;
    const value: OfficialRate = {
      rate,
      updatedAt: data.fechaActualizacion || new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
    };
    writeCache(value);
    return value;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}
