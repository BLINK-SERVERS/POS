// ============================================================
// BLINK POS · Ayuda guiada «¿Cómo funciona?»
// ------------------------------------------------------------
// MODULO AISLADO Y A PRUEBA DE FALLOS. Todo lo que vive aquí es
// presentación pura: no lee ni escribe `AppState`, no toca la nube y no
// participa en el cobro. Si este archivo explota, se borra o le quitan el
// mount, el punto de venta sigue funcionando igual.
//
// Piezas:
//   1. `Asistencia`    · el boton de la barra superior + el asistente.
//   2. `LimiteAsistencia` · ErrorBoundary local: un error propio se
//      traga en silencio (renderiza nada), nunca la pantalla de rescate
//      global ni el POS desmontado. NO usa el canal global de errores:
//      sería un desastre que la ayuda capturara un fallo del cobro.
//   3. Preferencia local (localStorage) · enciende/apaga boton y guias.
//
// La preferencia es por DISPOSICION del equipo, no del comercio: viaja en
// localStorage como `blink-tema`, no en `AppState`, que se sincroniza con
// Supabase y se comparte entre dispositivos. Apagar la ayuda en la caja no
// la apaga en la oficina.
//
// Degradacion deliberada: si el registro de la pantalla sale vacío o
// corrupto, la tarjeta mínima sigue apareciendo con un botón de cierre.
// La guía nunca se cae y nunca tapa un cobro.
// ============================================================
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { Icon } from "./Icon";
import { guiaParaRuta, type Guia } from "../lib/wizard";

/* ------------------------------------------------------------------ */
/* Preferencia local: ¿se muestra el boton y las guias?                 */
/* ------------------------------------------------------------------ */

/** Clave del interruptor. Valor "0" = oculto; todo lo demas, visible. */
export const AYUDA_KEY = "blink-pos-ayuda-v1";

function storageSeguro(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Cache del modulo: `null` = todavia no se leyo el almacenamiento. */
let cache: boolean | null = null;
const oyentes = new Set<() => void>();

function notificar() {
  for (const cb of Array.from(oyentes)) {
    try {
      cb();
    } catch {
      /* un oyente roto no deja de avisar a los demas */
    }
  }
}

/** Lee la preferencia. Sin almacenamiento o con valor basura: visible. */
export function leerAyudaVisible(): boolean {
  if (cache !== null) return cache;
  const s = storageSeguro();
  let valor = true;
  try {
    valor = s ? s.getItem(AYUDA_KEY) !== "0" : true;
  } catch {
    valor = true;
  }
  cache = valor;
  return valor;
}

/** Escribe la preferencia y avisa a los componentes suscritos. */
export function escribirAyudaVisible(visible: boolean): void {
  cache = visible;
  const s = storageSeguro();
  try {
    s?.setItem(AYUDA_KEY, visible ? "1" : "0");
  } catch {
    /* sin almacenamiento: dura lo que dure la pagina */
  }
  notificar();
}

/** Suscripcion estilo `useSyncExternalStore`. */
export function suscribirAyudaVisible(cb: () => void): () => void {
  oyentes.add(cb);
  return () => {
    oyentes.delete(cb);
  };
}

// Otra pestaña del mismo navegador cambió el interruptor: se descarta el
// cache y se vuelve a leer (mismo criterio que `lib/tab-sync`).
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key && e.key !== AYUDA_KEY) return;
    cache = null;
    notificar();
  });
}

function snapshotAyudaVisible(): boolean {
  return leerAyudaVisible();
}

/** Estado reactivo de la preferencia, para el boton y para Ajustes. */
export function useAyudaVisible(): [boolean, (v: boolean) => void] {
  const [visible, setVisible] = useState(snapshotAyudaVisible);
  useEffect(() => {
    setVisible(snapshotAyudaVisible);
    return suscribirAyudaVisible(() => setVisible(snapshotAyudaVisible()));
  }, []);
  return [visible, escribirAyudaVisible];
}

/* ------------------------------------------------------------------ */
/* La tarjeta                                                           */
/* ------------------------------------------------------------------ */

interface AsistenteProps {
  guia: Guia;
  onCerrar: () => void;
}

/**
 * Superposición con la guía completa de la pantalla. Se pinta en
 * `document.body` (createPortal) para escapar del apilamiento de la barra
 * superior. Solo recibe datos: si el registro está mal, lo único que puede
 * explotar es la lectura de `pasos`, y eso lo cubre el límite de abajo.
 */
function Asistente({ guia, onCerrar }: AsistenteProps) {
  const pasos = Array.isArray(guia.pasos) ? guia.pasos : [];
  const seguro = pasos.length > 0;
  const tarjeta = useRef<HTMLDivElement>(null);

  // Escape cierra la guía.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onCerrar();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onCerrar]);

  // El foco entra en el diálogo y sale de la aplicación.
  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    tarjeta.current?.focus();
    return () => {
      try {
        previo?.focus?.();
      } catch {
        /* el control que abrió la ayuda ya no existe: nada que devolver */
      }
    };
  }, []);

  if (!seguro) {
    // Registro vacío o corrupto: tarjeta mínima, sin botones raros.
    return (
      <div className="ayuda__capa" role="dialog" aria-modal="true" aria-label={guia.pantalla}>
        <button type="button" className="ayuda__velo" onClick={onCerrar} aria-label="Cerrar la guía" />
        <div className="ayuda__tarjeta ayuda__tarjeta--centro" tabIndex={-1} ref={tarjeta}>
          <div className="ayuda__cabecera">
            <span className="ayuda__pantalla">{guia.pantalla}</span>
          </div>
          <p className="ayuda__texto">
            Esta pantalla todavía no tiene guía. El botón «¿Cómo funciona?» se puede apagar en
            Ajustes → Apariencia.
          </p>
          <div className="ayuda__pie">
            <button type="button" className="btn btn--primary btn--sm" onClick={onCerrar}>
              <Icon name="check" size="sm" /> Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="ayuda__capa"
      role="dialog"
      aria-modal="true"
      aria-label={`${guia.pantalla}: guía rápida`}
    >
      <button type="button" className="ayuda__velo" onClick={onCerrar} aria-label="Cerrar la guía" />
      <div className="ayuda__tarjeta" ref={tarjeta} tabIndex={-1}>
        <div className="ayuda__cabecera">
          <span className="ayuda__pantalla">{guia.pantalla}</span>
          <button
            type="button"
            className="ayuda__cerrar"
            onClick={onCerrar}
            aria-label="Cerrar la guía"
            title="Cerrar la guía"
          >
            <Icon name="close" size="sm" />
          </button>
        </div>

        <ol className="ayuda__lista">
          {pasos.map((p, idx) => (
            <li className="ayuda__paso" key={`${p.titulo}-${idx}`}>
              <h3 className="ayuda__titulo" title={p.atajo || undefined}>
                {p.titulo}
              </h3>
              <p className="ayuda__texto">{p.texto}</p>
            </li>
          ))}
        </ol>

        <div className="ayuda__pie">
          <span className="grow" />
          <button type="button" className="btn btn--primary btn--sm" onClick={onCerrar}>
            <Icon name="check" size="sm" /> Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Límite local de errores                                              */
/* ------------------------------------------------------------------ */

interface LimiteProps {
  children: ReactNode;
}
interface LimiteEstado {
  roto: boolean;
}

/**
 * Si la ayuda revienta, desaparece: el POS no se entera. A propósito no se
 * pinta un "algo salió mal" — una guía no puede tapar una caja abierta.
 */
class LimiteAsistencia extends Component<LimiteProps, LimiteEstado> {
  state: LimiteEstado = { roto: false };

  static getDerivedStateFromError(): LimiteEstado {
    return { roto: true };
  }

  componentDidCatch(error: unknown) {
    // Rastro en consola para el diagnóstico; el usuario no ve nada.
    console.error("Ayuda de BLINK POS desactivada por un error:", error);
  }

  render() {
    if (this.state.roto) return null;
    return this.props.children as ReactNode;
  }
}

/* ------------------------------------------------------------------ */
/* Componente público                                                   */
/* ------------------------------------------------------------------ */

/**
 * Boton «¿Cómo funciona?» + asistente de la pantalla actual.
 *
 * Se monta UNA vez en la barra superior del `Shell`, así aparece en todas
 * las vistas sin tocarlas. El asistente se portal a `document.body`.
 */
export function Asistencia() {
  const { pathname } = useLocation();
  const [visible] = useAyudaVisible();
  const [abierto, setAbierto] = useState(false);

  // Cambiar de pantalla cierra el asistente: la guía que se estaba leyendo
  // habla de otra vista.
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  if (!visible) return null;

  const guia = guiaParaRuta(pathname);

  return (
    <LimiteAsistencia>
      <button
        type="button"
        className="ayuda__boton"
        onClick={() => setAbierto(true)}
        title={`Guía rápida de ${guia.pantalla}`}
        aria-haspopup="dialog"
        aria-expanded={abierto}
      >
        <Icon name="questionmark" size="sm" />
        ¿Cómo funciona?
      </button>
      {abierto &&
        createPortal(
          <Asistente guia={guia} onCerrar={() => setAbierto(false)} />,
          document.body
        )}
    </LimiteAsistencia>
  );
}

export default Asistencia;
