// Claves locales del comercio, aisladas por usuario.
//
// El mismo navegador puede ser compartido por dos comercios. El estado y los
// borradores del POS se guardan bajo una clave que incluye el id del usuario
// autenticado para que nadie vea los datos del anterior.

export const STATE_KEY = "blink-pos-state-v3";
export const DRAFTS_KEY = "blink-pos-drafts-v1";
export const ACTIVE_TAB_KEY = "blink-pos-active-tab-v1";
/** Marca de la última escritura local que la nube aún no ha confirmado. */
export const PENDING_KEY = "blink-pos-pending-v1";

/** Claves de versiones anteriores, sin usuario: se descartan al arrancar. */
export const LEGACY_KEYS = [
  "blink-pos-state-v1",
  "blink-pos-state-v2",
  "blink-pos-auth-v1",
];

export function stateKeyFor(userId: string): string {
  return `${STATE_KEY}:${userId}`;
}

export function draftsKeyFor(userId: string): string {
  return `${DRAFTS_KEY}:${userId}`;
}

export function activeTabKeyFor(userId: string): string {
  return `${ACTIVE_TAB_KEY}:${userId}`;
}

/** Cuándo fue la última escritura local que la nube aún no confirma. */
export function pendingKeyFor(userId: string): string {
  return `${PENDING_KEY}:${userId}`;
}

/** Aviso de que al cerrar sesión el último guardado en la nube no confirmó
 *  (BLINK-073): la copia local quedó como única y se rescata al re-entrar. */
export const LOGOUT_AVISO_KEY = "blink-logout-aviso-v1";

// ---------------------------------------------------------------------
// Correo del registro en curso (BLINK-079): antes era una clave GLOBAL sin
// caducidad y el correo de quien se registró quedaba precargado para el
// siguiente usuario del mismo equipo. Ahora viaja con marca de tiempo y
// expira a los 30 min (ventana típica de verificación del enlace).
// ---------------------------------------------------------------------
const CORREO_KEY = "blink-pos-ultimo-correo";
const CORREO_TTL_MS = 30 * 60 * 1000;

export function guardarCorreoRegistro(email: string, storage: Storage | null = safeStorage()): void {
  try {
    if (!storage) return;
    // Borra el formato viejo (texto plano, sin caducidad) si quedó.
    storage.setItem(CORREO_KEY, JSON.stringify({ email, at: Date.now() }));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function leerCorreoRegistro(storage: Storage | null = safeStorage()): string {
  try {
    if (!storage) return "";
    const raw = storage.getItem(CORREO_KEY);
    if (!raw) return "";
    const v = JSON.parse(raw) as { email?: string; at?: number };
    if (
      !v ||
      typeof v.email !== "string" ||
      typeof v.at !== "number" ||
      Date.now() - v.at > CORREO_TTL_MS
    ) {
      storage.removeItem(CORREO_KEY);
      return "";
    }
    return v.email;
  } catch {
    // Valor viejo (texto plano) o corrupto: no se devuelve a nadie más.
    return "";
  }
}

export function borrarCorreoRegistro(storage: Storage | null = safeStorage()): void {
  try {
    if (storage) storage.removeItem(CORREO_KEY);
  } catch {
    /* almacenamiento no disponible */
  }
}

export function setLogoutAviso(mensaje: string, storage: Storage | null = safeStorage()): void {
  try {
    if (storage) storage.setItem(LOGOUT_AVISO_KEY, mensaje);
  } catch {
    /* almacenamiento no disponible */
  }
}

export function takeLogoutAviso(storage: Storage | null = safeStorage()): string | null {
  try {
    if (!storage) return null;
    const v = storage.getItem(LOGOUT_AVISO_KEY);
    if (v) storage.removeItem(LOGOUT_AVISO_KEY);
    return v;
  } catch {
    return null;
  }
}

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Borra todo lo que este usuario guardó en este navegador. */
export function clearUserStorage(userId: string, storage: Storage | null = safeStorage()): void {
  if (!storage || !userId) return;
  for (const key of [
    stateKeyFor(userId),
    draftsKeyFor(userId),
    activeTabKeyFor(userId),
    pendingKeyFor(userId),
  ]) {
    try {
      storage.removeItem(key);
    } catch {
      /* almacenamiento no disponible */
    }
  }
}

/** Descarta el estado sin usuario de versiones previas (una sola vez). */
export function clearLegacyStorage(storage: Storage | null = safeStorage()): void {
  if (!storage) return;
  // BLINK-083: las claves viejas se RESPALDAN antes de borrarse; quien
  // salte de v2 a v3 no pierde su caché en silencio.
  respaldarYBorrarLegacy(storage);
  for (const key of [STATE_KEY, DRAFTS_KEY, ACTIVE_TAB_KEY, PENDING_KEY]) {
    try {
      storage.removeItem(key);
    } catch {
      /* almacenamiento no disponible */
    }
  }
}

/** Prefijo del respaldo de datos viejos o corruptos (BLINK-083). */
export const LEGACY_BACKUP_PREFIX = "blink-pos-legacy-respaldo-v1";

/** Copia el valor de una clave bajo el prefijo de respaldo (si existe). */
export function respaldarClave(
  key: string,
  storage: Storage | null = safeStorage()
): void {
  try {
    if (!storage) return;
    const raw = storage.getItem(key);
    if (raw !== null) storage.setItem(`${LEGACY_BACKUP_PREFIX}:${key}`, raw);
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Respaldar y borrar las claves de versiones anteriores (v1/v2). */
export function respaldarYBorrarLegacy(storage: Storage | null = safeStorage()): void {
  if (!storage) return;
  for (const key of LEGACY_KEYS) {
    respaldarClave(key, storage);
    try {
      storage.removeItem(key);
    } catch {
      /* almacenamiento no disponible */
    }
  }
}

/** Guarda la copia cruda de un JSON corrupto antes de descartarlo. */
export function respaldarCorrupto(
  userId: string,
  raw: string,
  storage: Storage | null = safeStorage()
): void {
  try {
    if (storage && raw) {
      storage.setItem(`${LEGACY_BACKUP_PREFIX}:corrupto:${userId}`, raw);
    }
  } catch {
    /* almacenamiento no disponible */
  }
}
