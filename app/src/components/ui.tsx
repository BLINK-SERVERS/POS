// Primitivas de UI de BLINK POS.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
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
   call sites. */
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
  children,
  required,
  as = "field",
}: {
  label: string;
  hint?: string;
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
  const labelNode = (
    <span className="field__label">
      {label}
      {required && " *"}
    </span>
  );
  const body = (
    <>
      {labelNode}
      {children}
      {hint && <span className="field__hint">{hint}</span>}
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

/* --- Modal (formularios) ---
   iOS 27 (HIG · Sheets / Modality):
   · En movil, **hoja inferior**: sube desde el borde, con esquineras
     redondeadas arriba y tirador. Es el componente <Sheet> de Konsta.
   · En escritorio, panel centrado: en iPadOS los formularios
     modales se presentan centrados.
   El contenido se desplaza solo si no cabe. */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const movil = useIsMobile();

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
   Paleta de 3 colores: acento (#007AFF) o neutro (#424242).
   success/accent → acento · neutral/warning/danger → neutro. */
export function Badge({
  children,
  tone = "neutral",
  icon,
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
  icon?: "check" | "alert";
}) {
  const accent = tone === "accent" || tone === "success";
  const cls = accent ? "badge badge--accent" : "badge";
  return (
    <span className={cls}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}
