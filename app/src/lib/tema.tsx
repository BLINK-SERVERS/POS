// ============================================================
// BLINK POS · Apariencia (claro / oscuro)
// ------------------------------------------------------------
// HIG (Dark Mode): "people generally expect all apps to respect their
// preference" y "ensure that your app looks good in both appearance
// modes".
//
// El modo se decide con UNA sola variable: `color-scheme` en <html>.
//   · "light dark" → automático: sigue al sistema operativo.
//   · "light"      → forzado claro.
//   · "dark"       → forzado oscuro.
//
// De ese valor dependen:
//   · los tokens del proyecto (`light-dark()` en styles/tokens.css);
//   · las variantes oscuras de Konsta (usan la clase `dark`, ver
//     `konsta/styles/base.css`): por eso se alterna la clase en <html>.
//
// La preferencia se guarda en localStorage y se aplica ANTES del primer
// pintado (script en linea de index.html) para que no haya destello.
// ============================================================
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ModoTema = "auto" | "claro" | "oscuro";

/** Clave de la preferencia en localStorage. */
const KEY = "blink-tema";

/** Colores de la barra del navegador en cada apariencia (del kit). */
const COLOR_BARRA = { claro: "#FFFEFB", oscuro: "#000000" } as const;

/** Lee la preferencia guardada. "auto" si no hay o no es valida. */
export function modoGuardado(): ModoTema {
  try {
    const v = localStorage.getItem(KEY);
    return v === "claro" || v === "oscuro" || v === "auto" ? v : "auto";
  } catch {
    return "auto";
  }
}

/**
 * Aplica la apariencia al documento.
 * Debe poder llamarse antes de pintar (script en linea de index.html).
 */
export function aplicarModo(modo: ModoTema): void {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.style.colorScheme =
    modo === "auto" ? "light dark" : modo === "claro" ? "light" : "dark";
  html.dataset.tema = modo;
  try {
    localStorage.setItem(KEY, modo);
  } catch {
    /* sin almacenamiento: el modo dura lo que dure la pagina */
  }
  actualizarColorBarra(modo);
}

/** El color de la barra del navegador sigue a la apariencia. */
export function actualizarColorBarra(modo: ModoTema): void {
  if (typeof document === "undefined") return;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  const oscuro =
    modo === "oscuro" ||
    (modo === "auto" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  meta.setAttribute("content", oscuro ? COLOR_BARRA.oscuro : COLOR_BARRA.claro);
}

/* ---------------------------------------------------------------- */
/* Contexto                                                           */
/* ---------------------------------------------------------------- */
interface ContextoTema {
  /** Preferencia del usuario. */
  modo: ModoTema;
  /** ¿Esta en oscuro ahora mismo? (tambien con el modo "auto") */
  esOscuro: boolean;
  /** Cambia la preferencia. */
  setModo: (m: ModoTema) => void;
}

const TemaContext = createContext<ContextoTema | null>(null);

/** Indica si el sistema pide la apariencia oscura. */
function useSistemaOscuro(): boolean {
  const [oscuro, setOscuro] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const alCambiar = () => setOscuro(mq.matches);
    mq.addEventListener("change", alCambiar);
    return () => mq.removeEventListener("change", alCambiar);
  }, []);
  return oscuro;
}

export function TemaProvider({ children }: { children: ReactNode }) {
  const [modo, setModoEstado] = useState<ModoTema>(() => modoGuardado());
  const sistemaOscuro = useSistemaOscuro();

  const esOscuro = modo === "auto" ? sistemaOscuro : modo === "oscuro";

  // Aplica la apariencia y la clase `dark` de Konsta.
  useEffect(() => {
    aplicarModo(modo);
  }, [modo]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", esOscuro);
    actualizarColorBarra(modo);
  }, [esOscuro, modo]);

  const setModo = useCallback((m: ModoTema) => setModoEstado(m), []);

  const valor = useMemo(
    () => ({ modo, esOscuro, setModo }),
    [modo, esOscuro, setModo]
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

/** Acceso al estado de la apariencia. */
export function useTema(): ContextoTema {
  const ctx = useContext(TemaContext);
  if (!ctx) {
    // Fuera del proveedor (p. ej. en pruebas): se comporta como "auto".
    return { modo: "auto", esOscuro: false, setModo: () => {} };
  }
  return ctx;
}
