// Primitivas de UI de BLINK POS.
import type { ReactNode } from "react";
import { formatBs, formatUsd } from "../lib/money";
import { Icon } from "./Icon";

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
      {size !== "sm" && (
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
      {formatUsd(usd)}{" "}
      <span className="dim">· {formatBs(usd, rate)}</span>
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

/* --- Tabs (estado interno) --- */
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
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t}
          role="tab"
          className="tab"
          aria-selected={value === t}
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/* --- Field --- */
export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span className="field__label">
        {label}
        {required && " *"}
      </span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
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
