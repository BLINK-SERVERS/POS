// TEMP-BYPASS — sesión falsa local para pruebas manuales SIN cuenta real.
//
// ⚠️ SOLO DESARROLLO (BLINK-001/057): Vite fija `import.meta.env.DEV` a false en
// el build de producción, así que las llamadas se podan y este módulo nunca debe
// llegar a `dist`. Antes de esta guarda el bundle publicado leía `?bypass=1` en
// pos.blink.com.ve y entraba al POS sin credenciales.
//
// Uso:
//   · Activar:  abrir /entrar?bypass=1  (quita el parámetro de la URL)
//   · Desactivar: abrir /entrar?bypass=0  o  cerrar sesión en Ajustes
//
// Con el bypass activo: no se toca Supabase (sin carga ni guardado en nube),
// el estado vive en localStorage igual que en producción y las rutas
// protegidas se comportan normalmente.

const DEV = import.meta.env.DEV;
const KEY = "blink-temp-bypass";

let cached: boolean | null = null;

function readFlag(): boolean {
  if (cached !== null) return cached;
  try {
    cached = window.localStorage.getItem(KEY) === "1";
  } catch {
    cached = false;
  }
  return cached;
}

/** Consume `?bypass=1|0` de la URL al arrancar y lo limpia del address bar. */
function consumeParam(): void {
  try {
    const q = new URLSearchParams(window.location.search);
    const v = q.get("bypass");
    if (v !== "1" && v !== "0") return;
    if (v === "1") window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
    cached = v === "1";
    q.delete("bypass");
    const search = q.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (search ? `?${search}` : "") + window.location.hash
    );
  } catch {
    /* sin window (tests): se ignora */
  }
}

if (DEV) consumeParam();

export function isBypassActive(): boolean {
  // En producción `DEV` es false literal: la función se podan y el flag no se lee.
  return DEV && readFlag();
}

export function clearBypass(): void {
  if (!DEV) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  cached = false;
}

/** Usuario falso (no existe en Supabase; solo alimenta los guardias de ruta). */
export function bypassUser(): {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
} {
  return {
    id: "temp-bypass-user",
    email: "temporal@blink.local",
    firstName: "Tienda",
    lastName: "Temporal",
    phone: "",
  };
}
