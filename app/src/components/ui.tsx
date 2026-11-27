// Primitivas de UI de BLINK POS.
import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { formatBs, formatUsd } from "../lib/money";
import { Icon, type IconName } from "./Icon";
import { Dialog, DialogButton, Segmented, SegmentedButton, Sheet } from "konsta/react";

/* --- Money (dual USD / Bs) --- */
export function Money({
  usd,
  rate,
  size = "md",
}: {
  usd: number;
  rate: number;
  size?: "sm" | "md" | "lg";
}) {
  const value = formatUsd(usd);
  return (
    <span className={size === "sm" ? "tabular" : "kpi__value"}>
      {value}
      {size !== "sm" && rate > 0 && (
        <span className="kpi__alt" style={{ display: "block" }}>
          {formatBs(usd, rate)}
        </span>
      )}
    </span>
  );
}

export function DualInline({ usd, rate }: { usd: number; rate: number }) {
  return (
    <span className="tabular">
      {formatUsd(usd)}
      {/* Sin tasa configurada no se muestra "Bs 0,00" engañoso. */}
      {rate > 0 && <span className="dim"> · {formatBs(usd, rate)}</span>}
    </span>
  );
}

/* --- Card --- */
export function Card({
  title,
  hint,
  action,
  children,
  flat,
}: {
  title?: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  flat?: boolean;
}) {
  return (
    <section className={flat ? "card card--flat" : "card"}>
      {(title || action) && (
        <div className="card__head">
          <div>
            {title && <div className="card__title">{title}</div>}
            {hint && <div className="card__hint">{hint}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/* --- Page header --- */
export function PageHead({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

/* --- Empty state ---
   iOS: icono en un circulo tintado + titulo + texto de ayuda.
   El icono es opcional para no recargar los estados triviales. */
export function EmptyState({
  title,
  hint,
  action,
  icon,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="empty">
      {icon && (
        <span className="empty__icon" aria-hidden>
          <Icon name={icon} />
        </span>
      )}
      <div className="empty__title">{title}</div>
      {hint && <p className="empty__hint">{hint}</p>}
      {action}
    </div>
  );
}

/* --- Tabs (estado interno) ---
   Control segmentado de iOS 26/27 (Konsta): segmento activo relleno en el azul
   de marca con texto blanco, inactivos en azul sobre pista translucida.
   Al reescribir el componente, todas las vistas con pestañas (Inventario,
   Finanzas, Catalogo, Contactos...) adoptan el patrón de iOS sin tocar sus
   call sites.
   Cada pestaña lleva su rótulo en `data-tab`: es el asa que usa el asistente
   «¿Cómo funciona?» para iluminar la pestaña que el paso manda abrir, que es
   lo único seleccionable de un control que se renderiza por mapa. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: readonly T[];
  value: T;
  onChange: (t: T) => void;
}) {
  return (
    <Segmented className="tabs" role="tablist">
      {tabs.map((t) => (
        <SegmentedButton
          key={t}
          role="tab"
          active={value === t}
          aria-selected={value === t}
          data-tab={t}
          onClick={() => onChange(t)}
        >
          {t}
        </SegmentedButton>
      ))}
    </Segmented>
  );
}

/* --- Field --- */
export function Field({
  label,
  hint,
  error,
  children,
  required,
  as = "field",
}: {
  label: string;
  hint?: string;
  /** Mensaje de validación del propio campo. Se asocia con `aria-describedby`. */
  error?: string;
  children: ReactNode;
  required?: boolean;
  /**
   * "field" (por defecto): envuelve un único control y usa <label> para asociarlo.
   * "group": cuando el contenido son varios controles (p. ej. botones), usa un
   * <div role="group"> con nombre accesible; un <label> aquí robaría el nombre
   * del primer control y produciría lecturas como "Método de pago Banco … · VES".
   */
  as?: "field" | "group";
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  /* El REQUIRED vive en el control, no solo en el rótulo: un asterisco que el
     lector no asocia a nada no avisa de nada. Clonamos al único hijo de tipo
     elemento para ponerle los atributos; si el contenido no es un control (un
     div con botones), se queda solo con el texto visible. */
  let descrito = children;
  if ((hint || error) && isValidElement(children)) {
    descrito = cloneElement(children as ReactElement<Record<string, unknown>>, {
      id,
      "aria-required": required || undefined,
      required: required || undefined,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
    });
  } else if (required && isValidElement(children)) {
    descrito = cloneElement(children as ReactElement<Record<string, unknown>>, {
      "aria-required": true,
    });
  }
  const labelNode = (
    <span className="field__label">
      {label}
      {required && " *"}
    </span>
  );
  const body = (
    <>
      {labelNode}
      {descrito}
      {hint && !error && (
        <span className="field__hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className="field__error-msg" id={errorId} role="alert">
          {error}
        </span>
      )}
    </>
  );
  if (as === "group") {
    return (
      <div className="field" role="group" aria-label={label}>
        {body}
      </div>
    );
  }
  return <label className="field">{body}</label>;
}

/* --- Error de formulario (una sola primitiva) ---
   Antes cada vista pintaba el suyo reutilizando `.field__hint` o soltando un
   `<p>` suelto: el mismo aviso con tres alturas de letra distintas y ninguno
   anunciado al lector de pantalla. Esto es el bloque de mensaje del diálogo,
   para fallos que no pertenecen a un campo concreto (un requisito global, por
   ejemplo). Para un campo específico usa `Field error="…"`, que ya lo asocia. */
export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div className="form-error" role="alert">
      {children}
    </div>
  );
}

/* --- Sección de un formulario largo ---
   Título real de jerarquía: el diálogo pone su h2/h3 arriba, la sección es h4.
   Sin esto, un formulario de 18 campos era una lista plana imposible de leer
   de un vistazo. */
export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="form-section">
      <h4 className="form-section__title">{title}</h4>
      {children}
    </section>
  );
}

/* --- Fila de campos ---
   Va dentro de `.form-group__row` (con caja propia, envuelve y reparte el
   ancho en partes iguales). NO es `.row`: esa primitiva es de botones sueltos
   y trae nowrap + align-items:center, que partida en dos líneas un label como
   «Costo (USD)» desalineaba al input de al lado. */
export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="form-group__row">{children}</div>;
}

/* --- Casilla compartida ---
   La casilla nativa de Chrome mide 13×13 px: el área táctil mínima aceptable
   son 44. Aquí el label ES el blanco de toque de 44 px, así que acertar deja
   de depender de darle a un cuadrito. */
export function CheckField({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="check-field">
      <input
        type="checkbox"
        className="check-field__box"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="check-field__text">
        {label}
        {hint && <span className="check-field__hint">{hint}</span>}
      </span>
    </label>
  );
}

/* --- Campo de dinero dual USD / Bs ---
   El patrón repetido en Catálogo, Finanzas y Crédito: monto en dólares con su
   equivalente en bolívares a la tasa del día. Un solo glosario de texto para
   las tres frases posibles (hay cifra, no hay cifra, no hay tasa): si cada
   vista redacta la suya, el cajero lee tres avisos distintos de lo mismo. */
export function equivalenciaBs(valor: string | number, rate: number): string {
  const n = typeof valor === "number" ? valor : Number(valor);
  const hayCifra = String(valor).trim() !== "" && Number.isFinite(n);
  if (!(rate > 0)) return "Sin tasa BCV configurada.";
  if (!hayCifra || n === 0) return "Bs — al escribir el monto.";
  return formatBs(n, rate);
}

export function MoneyField({
  label,
  usdLabel = "USD",
  value,
  onChange,
  rate,
  hint,
  required,
  error,
  min = 0,
  step = 0.01,
}: {
  label: string;
  /** Rótulo de la moneda del monto cuando no es USD (p. ej. "Bs"). */
  usdLabel?: string;
  value: string;
  onChange: (v: string) => void;
  rate: number;
  hint?: string;
  required?: boolean;
  error?: string;
  min?: number;
  step?: number | string;
}) {
  return (
    <Field
      label={`${label} (${usdLabel})`}
      hint={hint ?? equivalenciaBs(value, rate)}
      required={required}
      error={error}
    >
      <input
        className="input tabular"
        type="number"
        min={min}
        step={step}
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

/* --- Foco de un diálogo (entrada y devolución) ---
   Un diálogo de caja tiene que hacer dos cosas con el teclado, no una:
   · al abrirse, el foco entra en él —si no, el cajero pulsa F8, la ventana de
     cobro se monta y el foco se queda en el buscador, de modo que lo que
     escriba filtra productos detrás de la ventana. Con el foco dentro del
     panel, Tab recorre los controles del diálogo y el teclado ya es suyo;
   · al cerrarse, el foco vuelve al control que lo abrió (un usuario de teclado
     no puede quedarse sin contexto). El componente se desmonta al cerrarse, así
     que se restituye en la limpieza del efecto.
   El `ref` solo se monta donde existe un panel propio (el `.modal` de
   escritorio); Konsta pone su propio manejo de foco en <Sheet> y <Dialog>. */
export function useFocoDeDialogo<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    ref.current?.focus({ preventScroll: true });
    return () => {
      if (!previo) return;
      if (typeof previo.focus !== "function") return;
      if (!document.contains(previo)) return;
      previo.focus();
    };
  }, []);
  return ref;
}

/**
 * Esc cierra el diálogo (BLINK-110).
 *
 * El asistente lo enseña literalmente («Esc: cerrar la ventana»), así que el
 * teclado tiene que poder salir sin buscar el botón de cerrar. Se escucha en
 * `window` porque el foco puede estar dentro de un campo del formulario: un
 * listener en el panel no lo alcanzaría.
 */
export function useCerrarConEscape(onClose: () => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

/* --- Modal (formularios) ---
   iOS 27 (HIG · Sheets / Modality):
   · En movil, **hoja inferior**: sube desde el borde, con esquineras
     redondeadas arriba y tirador. Es el componente <Sheet> de Konsta.
   · En escritorio, panel centrado: en iPadOS los formularios
     modales se presentan centrados.
   Estructura de columna en los dos casos: cabecera y pie FUERA del scroll,
   solo `children` rueda. Sin esto el botón de guardar quedaba al final del
   cuerpo (medido: top 1397 con viewport de 900) y había que sacarlo del
   diálogo para encontrarlo. Pasa `footer` con ese botón y la hoja/modal lo
   ancla abajo; lo que no pasa footer se comporta como antes. */
export function Modal({
  title,
  onClose,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  /** Acciones ancladas al pie, visibles sin scrollear. */
  footer?: ReactNode;
  children: ReactNode;
}) {
  const movil = useIsMobile();
  const panel = useFocoDeDialogo<HTMLDivElement>();
  useCerrarConEscape(onClose);

  if (movil) {
    return (
      <Sheet opened onBackdropClick={onClose} className="sheet">
        {/* Tirador: la seña de una hoja de iOS. */}
        <div className="sheet__grabber" aria-hidden />
        <header className="sheet__head">
          <h2 className="sheet__title">{title}</h2>
          <button
            type="button"
            className="sheet__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <Icon name="close" />
          </button>
        </header>
        <div className="sheet__body">{children}</div>
        {footer && <footer className="sheet__foot">{footer}</footer>}
      </Sheet>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={panel}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <h3 className="modal__title">{title}</h3>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  );
}

/* --- Alerta de confirmacion ---
   HIG (Alerts): un titulo corto, un mensaje y hasta tres botones con
   rol (Primary / Secondary / Destructive). Medidas del UI Kit: 300 px
   de ancho, botones de 48 px de alto.
   Es el <Dialog> de Konsta, que ya lleva el material de Apple. */
export function Alert({
  title,
  message,
  onClose,
  primary,
  secondary,
  destructive,
}: {
  title: string;
  message?: string;
  onClose: () => void;
  /** Botón de rol Primary (el que se elige por defecto). */
  primary?: { text: string; onClick: () => void };
  /** Botón de rol Cancel. */
  secondary?: { text: string; onClick: () => void };
  /** Botón de rol Destructive (rojo). */
  destructive?: { text: string; onClick: () => void };
}) {
  // El ref del foco no se puede enganchar: el `<Dialog>` de Konsta no expone su
  // raíz. Lo que sí hace el gancho es devolver el foco al disparador al cerrar.
  // Queda pendiente que el Tab todavía puede escapar del diálogo.
  useFocoDeDialogo<HTMLDivElement>();
  useCerrarConEscape(onClose);
  const botones: ReactNode[] = [];
  if (secondary) {
    botones.push(
      <DialogButton key="sec" onClick={secondary.onClick}>
        {secondary.text}
      </DialogButton>
    );
  }
  if (destructive) {
    botones.push(
      <DialogButton
        key="des"
        strong
        className="dialog-btn--destructive"
        onClick={destructive.onClick}
      >
        {destructive.text}
      </DialogButton>
    );
  }
  if (primary) {
    botones.push(
      <DialogButton key="pri" strong onClick={primary.onClick}>
        {primary.text}
      </DialogButton>
    );
  }

  return (
    <Dialog
      opened
      onBackdropClick={onClose}
      title={title}
      content={message}
      buttons={botones}
    />
  );
}

/* --- Confirmacion asincrona ---
   Reemplaza a `window.confirm` (que es un dialogo del navegador, no de
   iOS) por una alerta nativa con los roles de la HIG. */
export interface ConfirmOptions {
  title: string;
  message?: string;
  /** Texto del boton de accion. Por defecto "Aceptar". */
  confirmText?: string;
  /** Texto del boton de cancelar. Por defecto "Cancelar". */
  cancelText?: string;
  /** Marca la accion como destructiva (boton rojo). */
  destructive?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(async () => false);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [peticion, setPeticion] = useState<{
    opts: ConfirmOptions;
    resolver: (v: boolean) => void;
  } | null>(null);

  const confirmar = useCallback<ConfirmFn>(
    (opts) => new Promise<boolean>((resolve) => setPeticion({ opts, resolver: resolve })),
    []
  );

  const cerrar = useCallback(
    (valor: boolean) => {
      peticion?.resolver(valor);
      setPeticion(null);
    },
    [peticion]
  );

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      {peticion && (
        <Alert
          title={peticion.opts.title}
          message={peticion.opts.message}
          onClose={() => cerrar(false)}
          secondary={{
            text: peticion.opts.cancelText ?? "Cancelar",
            onClick: () => cerrar(false),
          }}
          /* HIG (Buttons): el boton de rol Primary NUNCA es el que
             destruye datos. Si la accion es destructiva, ese boton
             lleva el rol Destructive (rojo) y no hay un Primary aparte. */
          {...(peticion.opts.destructive
            ? {
                destructive: {
                  text: peticion.opts.confirmText ?? "Eliminar",
                  onClick: () => cerrar(true),
                },
              }
            : {
                primary: {
                  text: peticion.opts.confirmText ?? "Aceptar",
                  onClick: () => cerrar(true),
                },
              })}
        />
      )}
    </ConfirmContext.Provider>
  );
}

/** Pide confirmacion al usuario con una alerta nativa de iOS. */
export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext);
}

/* --- ¿Pantalla compacta? ---
   Mismo corte que el CSS (860 px). Lo usan los componentes que cambian
   de presentacion segun el tamano (hoja inferior vs panel centrado). */
export function useIsMobile(): boolean {
  const [movil, setMovil] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 860px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const alCambiar = () => setMovil(mq.matches);
    alCambiar();
    mq.addEventListener("change", alCambiar);
    return () => mq.removeEventListener("change", alCambiar);
  }, []);
  return movil;
}

/* --- Badge ---
   Paleta de 4 colores: acento (azul de marca), advertencia (ámbar) y
   peligro (rojo) sobre velos semánticos con contraste AA; el resto, neutro
   (BLINK-038/069). */
export function Badge({
  children,
  tone = "neutral",
  icon,
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
  icon?: "check" | "alert";
}) {
  const cls =
    tone === "warning"
      ? "badge badge--warning"
      : tone === "danger"
        ? "badge badge--danger"
        : tone === "accent" || tone === "success"
          ? "badge badge--accent"
          : "badge";
  return (
    <span className={cls}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}
