// Emparejamiento del escáner remoto (celular ↔ caja).
//
// Es un "token de capacidad": el código QR que se muestra en la caja
// entrega un identificador público (`p`) y un secreto (`t`). El internet
// solo transporta el código escaneado; la CAJA es la autoridad: al recibir
// el primer mensaje del celular comprueba el secreto y, si no coincide, lo
// ignora. "Regenerar código" cambia el secreto y deja fuera a los teléfonos
// anteriores (revocación desde Ajustes › Dispositivos).
//
// El emparejamiento es LOCAL (por equipo) y por eso no necesita la base de
// datos: al no haber cuenta en el teléfono, la caja es la única que decide
// qué teléfonos acepta. Así el escáner móvil funciona sin exponer el negocio
// en la nube.

export interface Pairing {
  /** Identificador público (viaja en la URL del QR). */
  id: string;
  /** Secreto compartido (solo lo conocen caja y teléfono). */
  token: string;
  /** Etiqueta legible del equipo emparejado. */
  label: string;
  createdAt: string;
  /** ISO de caducidad. Vacío = sin caducidad (caso del teléfono). */
  expiresAt: string;
}

/** Días que dura un emparejamiento antes de pedir un QR nuevo. */
export const PAIRING_DAYS = 30;

const hostKey = (owner: string) => `blink:scanner:host:${owner}`;
const REMOTE_KEY = "blink:scanner:remote";

/** Hex aleatorio criptográficamente seguro (con reserva si no hay crypto). */
function randomHex(bytes: number): string {
  const a = new Uint8Array(bytes);
  const c = globalThis.crypto;
  if (c && typeof c.getRandomValues === "function") c.getRandomValues(a);
  else for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Crea un emparejamiento nuevo (id público + secreto). */
export function newPairing(label = ""): Pairing {
  return {
    id: `p_${randomHex(8)}`,
    token: randomHex(16),
    label: label.trim() || "Caja principal",
    createdAt: new Date().toISOString(),
    expiresAt: addDays(PAIRING_DAYS),
  };
}

/** ¿Caducó el emparejamiento? (sin fecha = no caduca). */
export function isExpired(p: Pairing, at: number = Date.now()): boolean {
  const t = Date.parse(p.expiresAt);
  return Number.isFinite(t) && t <= at;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible: el emparejamiento dura solo la sesión */
  }
}

/** Id del comercio/usuario dueño (para no mezclar equipos). */
export function loadHostPairing(owner: string): Pairing | null {
  if (!owner) return null;
  const p = readJson<Pairing>(hostKey(owner));
  return p && p.id && p.token ? p : null;
}

export function saveHostPairing(owner: string, p: Pairing): void {
  if (owner) writeJson(hostKey(owner), p);
}

export function clearHostPairing(owner: string): void {
  try {
    localStorage.removeItem(hostKey(owner));
  } catch {
    /* noop */
  }
}

/** Emparejamiento guardado en el teléfono (el que llegó por el QR). */
export function loadRemotePairing(): Pairing | null {
  const p = readJson<Pairing>(REMOTE_KEY);
  return p && p.id && p.token ? p : null;
}

export function saveRemotePairing(p: Pairing): void {
  writeJson(REMOTE_KEY, p);
}

export function clearRemotePairing(): void {
  try {
    localStorage.removeItem(REMOTE_KEY);
  } catch {
    /* noop */
  }
}

/** Arma la URL que va dentro del QR (respeta la base del despliegue). */
export function pairUrl(p: Pairing, base?: string): string {
  const b = base ?? `${window.location.origin}${import.meta.env.BASE_URL}`;
  return `${b}escaner?p=${encodeURIComponent(p.id)}&t=${encodeURIComponent(p.token)}`;
}

/** Etiqueta aproximada del teléfono/navegador (para mostrar en el host). */
export function deviceLabel(): string {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  return "Dispositivo móvil";
}
