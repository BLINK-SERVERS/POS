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
  for (const key of [...LEGACY_KEYS, STATE_KEY, DRAFTS_KEY, ACTIVE_TAB_KEY, PENDING_KEY]) {
    try {
      storage.removeItem(key);
    } catch {
      /* almacenamiento no disponible */
    }
  }
}
