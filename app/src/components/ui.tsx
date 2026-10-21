// Primitivas de UI de BLINK POS.
import type { ReactNode } from "react";
import { formatBs, formatUsd } from "../lib/money";
import { Icon } from "./Icon";
import { Segmented, SegmentedButton } from "konsta/react";

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

/* --- Empty state --- */
export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
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

/* --- Modal --- */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3 style={{ fontSize: "1.1rem" }}>{title}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
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
