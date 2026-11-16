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
// Degradacion deliberada: cada paso puede declarar `target` (un selector
// CSS opcional). Si el elemento no existe o mide cero —los anclas
// `data-tour="..."` las van añadiendo los dueños de cada pantalla—, el paso
// se pinta como tarjeta centrada, sin foco ni velo de recorte. La guia se
// ve bien hoy y se ve mejor cuando lleguen las anclas.
// ============================================================
import { Component, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { Icon } from "./Icon";
import { guiaParaRuta, type Guia, type PasoGuia } from "../lib/wizard";

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
/* Medición del objetivo del paso                                       */
/* ------------------------------------------------------------------ */

/** Rectángulo del elemento a iluminar, en coordenadas de viewport. */
interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Margen del recorte alrededor del elemento. */
const PAD_FOCO = 8;
/** Separación entre el foco y la tarjeta. */
const SEPARACION = 14;
/** Ancho de la tarjeta (coincide con el CSS). */
const ANCHO_TARJETA = 360;

/**
 * Busca el objetivo y devuelve su caja. `null` en cualquier fallo:
 * selector vacío, elemento ausente, oculto, de tamaño cero o
 * `querySelector` que lance (un selector inválido escrito a mano).
 */
function medirObjetivo(target?: string): Rect | null {
  if (!target) return null;
  try {
    const el = document.querySelector(target);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r || r.width <= 0 || r.height <= 0) return null;
    // Fuera del viewport (pestaña no montada, display:none): sin foco.
    if (r.bottom <= 0 || r.right <= 0) return null;
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  } catch {
    return null;
  }
}

/** Lleva el objetivo a la vista antes de medirlo. Silencioso si falla. */
function traerObjetivo(target?: string): void {
  if (!target) return;
  try {
    const el = document.querySelector(target);
    if (el && "scrollIntoView" in el) {
      (el as HTMLElement).scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  } catch {
    /* no se puede scrollear: el paso sale centrado y ya */
  }
}

interface Medida {
  rect: Rect | null;
  /** Ancho y alto del viewport al medir: la tarjeta se repite con ellos. */
  vw: number;
  vh: number;
}

function medir(paso: PasoGuia | undefined): Medida {
  const vw = typeof window === "undefined" ? 1024 : window.innerWidth;
  const vh = typeof window === "undefined" ? 768 : window.innerHeight;
  return { rect: medirObjetivo(paso?.target), vw, vh };
}

/* ------------------------------------------------------------------ */
/* El asistente                                                         */
/* ------------------------------------------------------------------ */

interface AsistenteProps {
  guia: Guia;
  indice: number;
  onIr: (i: number) => void;
  onCerrar: () => void;
}

/**
 * Superposición del paso. Se pinta en `document.body` (createPortal) para
 * escapar del apilamiento de la barra superior. Solo recibe datos: si el
 * registro está mal, lo único que puede explotar es la lectura de `pasos`,
 * y eso lo cubre el límite de abajo.
 */
function Asistente({ guia, indice, onIr, onCerrar }: AsistenteProps) {
  const pasos = Array.isArray(guia.pasos) ? guia.pasos : [];
  const total = pasos.length;
  const seguro = total > 0;
  const i = seguro ? Math.min(Math.max(indice, 0), total - 1) : 0;
  const paso = pasos[i];
  const ultimo = seguro && i === total - 1;

  const [medida, setMedida] = useState<Medida>(() => medir(paso));
  const [alto, setAlto] = useState(240);
  const tarjeta = useRef<HTMLDivElement>(null);

  // Paso nuevo: primero se trae el elemento a la vista y se mide de una vez
  // (así el recorte nunca se pinta un frame con la caja del paso anterior)
  // y se vuelve a medir en el frame siguiente, con el scroll ya asentado.
  useLayoutEffect(() => {
    let vivo = true;
    let raf = 0;
    try {
      traerObjetivo(paso?.target);
      setMedida(medir(paso));
      raf = requestAnimationFrame(() => {
        if (vivo) setMedida(medir(paso));
      });
    } catch {
      setMedida(medir(paso));
    }
    return () => {
      vivo = false;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [paso]);

  // La caja se mueve con el scroll de la página o con un cambio de tamaño.
  useEffect(() => {
    const redibujar = () => setMedida(medir(paso));
    window.addEventListener("resize", redibujar);
    // `capture`: el scroll vive en `.shell__main`, no en la ventana.
    window.addEventListener("scroll", redibujar, true);
    return () => {
      window.removeEventListener("resize", redibujar);
      window.removeEventListener("scroll", redibujar, true);
    };
  }, [paso]);

  // Alto real de la tarjeta: sin él no se puede saber si cabe debajo.
  useLayoutEffect(() => {
    const el = tarjeta.current;
    if (!el) return;
    const h = el.offsetHeight;
    if (h > 0 && Math.abs(h - alto) > 1) setAlto(h);
  }, [medida, i, alto]);

  // Escape cierra desde cualquier paso; las flechas navegan.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCerrar();
      } else if (e.key === "ArrowRight" && !ultimo) {
        onIr(i + 1);
      } else if (e.key === "ArrowLeft" && i > 0) {
        onIr(i - 1);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [i, ultimo, onIr, onCerrar]);

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

  if (!seguro || !paso) {
    // Registro vacío o corrupto: tarjeta mínima, sin botones raros.
    return (
      <div className="ayuda__capa" role="dialog" aria-modal="true" aria-label={guia.pantalla}>
        <div className="ayuda__velo ayuda__velo--solo" />
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

  const { rect, vw, vh } = medida;
  const ladoLibre = ANCHO_TARJETA + 2 * 12;
  const ancho = Math.min(ANCHO_TARJETA, Math.max(240, vw - 24));
  // En una pantalla muy angosta la tarjeta taparia justo lo que se esta
  // iluminando: mejor no recortar y explicar desde el centro.
  const foco = rect && vw >= ladoLibre ? rect : null;

  let izquierda = Math.round((vw - ancho) / 2);
  let arriba = Math.max(12, Math.round((vh - alto) / 2));
  if (rect && vw >= ladoLibre) {
    // Horizontal: centrado sobre el objetivo, dentro del viewport.
    const centro = rect.left + rect.width / 2;
    izquierda = Math.round(Math.min(Math.max(centro - ancho / 2, 12), vw - ancho - 12));
    // Vertical: debajo si cabe; si no, encima; si tampoco, a un lado; si
    // tampoco, centrado (y sin recorte, para no tapar lo que se explica).
    const debajo = rect.top + rect.height + SEPARACION + PAD_FOCO;
    const encima = rect.top - SEPARACION - PAD_FOCO - alto;
    const margen = 8;
    if (debajo + alto <= vh - margen) arriba = debajo;
    else if (encima >= margen) arriba = encima;
    else if (izquierda + ancho < rect.left - margen) {
      izquierda = Math.round(rect.left + rect.width + SEPARACION);
      arriba = Math.round(Math.min(Math.max(rect.top - 40, 12), Math.max(12, vh - alto - 12)));
    } else {
      izquierda = Math.round(Math.max(12, rect.left - SEPARACION - ancho));
      arriba = Math.round(Math.min(Math.max(rect.top - 40, 12), Math.max(12, vh - alto - 12)));
    }
    arriba = Math.round(Math.min(Math.max(arriba, 12), Math.max(12, vh - alto - 12)));
  }

  // Cuatro franjas oscurecidas dejan Libre el elemento iluminado: el paso
  // se puede practicar sin cerrar la guia. Sin foco, un solo velo parejo.
  const velos: ReactNode[] = [];
  if (foco) {
    const { top, left, width, height } = foco;
    velos.push(
      <div
        key="arriba"
        className="ayuda__velo"
        style={{ top: 0, left: 0, right: 0, height: Math.max(0, top - PAD_FOCO) }}
      />,
      <div
        key="abajo"
        className="ayuda__velo"
        style={{ top: top + height + PAD_FOCO, left: 0, right: 0, bottom: 0 }}
      />,
      <div
        key="izquierda"
        className="ayuda__velo"
        style={{
          top: Math.max(0, top - PAD_FOCO),
          left: 0,
          width: Math.max(0, left - PAD_FOCO),
          height: height + PAD_FOCO * 2,
        }}
      />,
      <div
        key="derecha"
        className="ayuda__velo"
        style={{
          top: Math.max(0, top - PAD_FOCO),
          left: left + width + PAD_FOCO,
          right: 0,
          height: height + PAD_FOCO * 2,
        }}
      />
    );
  } else {
    velos.push(<div key="solo" className="ayuda__velo ayuda__velo--solo" />);
  }

  return (
    <div className="ayuda__capa" role="dialog" aria-modal="true" aria-label={`${guia.pantalla}: guía rápida`}>
      {velos}
      {foco && (
        <div
          className="ayuda__foco"
          style={{
            top: foco.top - PAD_FOCO,
            left: foco.left - PAD_FOCO,
            width: foco.width + PAD_FOCO * 2,
            height: foco.height + PAD_FOCO * 2,
          }}
          aria-hidden="true"
        />
      )}
      <div
        className="ayuda__tarjeta"
        ref={tarjeta}
        tabIndex={-1}
        style={{ left: izquierda, top: arriba, width: ancho }}
      >
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

        <h3 className="ayuda__titulo" title={paso.atajo || undefined}>
          {paso.titulo}
        </h3>
        <p className="ayuda__texto">{paso.texto}</p>

        <div className="ayuda__puntos" aria-hidden="true">
          {pasos.map((p, idx) => (
            <button
              key={`${p.titulo}-${idx}`}
              type="button"
              className={
                "ayuda__punto" +
                (idx === i ? " ayuda__punto--actual" : idx < i ? " ayuda__punto--hecho" : "")
              }
              onClick={() => onIr(idx)}
              title={p.titulo}
              aria-label={`Paso ${idx + 1}: ${p.titulo}`}
              tabIndex={-1}
            />
          ))}
        </div>

        <div className="ayuda__pie">
          <span className="ayuda__contador">
            Paso {i + 1} de {total}
          </span>
          <span className="grow" />
          {i > 0 && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onIr(i - 1)}>
              <Icon name="chevronLeft" size="sm" /> Anterior
            </button>
          )}
          <button type="button" className="btn btn--soft btn--sm" onClick={onCerrar}>
            Omitir
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => (ultimo ? onCerrar() : onIr(i + 1))}
          >
            {ultimo ? (
              <>
                <Icon name="check" size="sm" /> Entendido
              </>
            ) : (
              <>
                Siguiente <Icon name="chevronRight" size="sm" />
              </>
            )}
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
  const [indice, setIndice] = useState(0);

  // Cambiar de pantalla cierra el asistente: la guía que se estaba leyendo
  // habla de otra vista y su foco apuntaría a elementos que ya no existen.
  useEffect(() => {
    setAbierto(false);
    setIndice(0);
  }, [pathname]);

  if (!visible) return null;

  const guia = guiaParaRuta(pathname);

  return (
    <LimiteAsistencia>
      <button
        type="button"
        className="ayuda__boton"
        onClick={() => {
          setIndice(0);
          setAbierto(true);
        }}
        title={`Guía rápida de ${guia.pantalla}`}
        aria-haspopup="dialog"
        aria-expanded={abierto}
      >
        <Icon name="questionmark" size="sm" />
        ¿Cómo funciona?
      </button>
      {abierto &&
        createPortal(
          <Asistente
            guia={guia}
            indice={indice}
            onIr={(i) => setIndice(i)}
            onCerrar={() => setAbierto(false)}
          />,
          document.body
        )}
    </LimiteAsistencia>
  );
}

export default Asistencia;
