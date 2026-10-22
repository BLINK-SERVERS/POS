// General — el centro de control del comercio (Command Center).
//
// Estructura tipo bento: cuatro tarjetas de métrica con su variación
// respecto al periodo anterior y un grafico de barras mensual con el
// detalle del mes seleccionado.
//
// Convenciones: interfaz en español, paleta oficial Blink, iconos SVG
// propios (sin emoji) y SF Pro (Display para cifras, Text para etiquetas).
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStoreState } from "../lib/store";
import { EmptyState, PageHead, Tabs } from "../components/ui";
import { Icon, type IconName } from "../components/Icon";
import {
  capital,
  dayRange,
  growth,
  lowStock,
  metrics,
  monthRange,
  monthlySeries,
  prevMonthRange,
  prevWeekRange,
  weekRange,
  type MonthPoint,
} from "../lib/metrics";
import { formatUsd } from "../lib/money";
import { modulosVisibles } from "../lib/modulos";

/** Periodos del panel: el comparativo es el equivalente anterior. */
const PERIODOS = ["Día", "Semana", "Mes"] as const;
type Periodo = (typeof PERIODOS)[number];

/** Rangos del periodo actual y del equivalente anterior. */
function rangos(periodo: Periodo): [Date, Date, Date, Date] {
  if (periodo === "Día") {
    const [f, t] = dayRange();
    const [pf, pt] = dayRange(new Date(Date.now() - 86_400_000));
    return [f, t, pf, pt];
  }
  if (periodo === "Semana") {
    const [f, t] = weekRange();
    const [pf] = prevWeekRange();
    return [f, t, pf, t];
  }
  const [f, t] = monthRange();
  const [pf, pt] = prevMonthRange();
  return [f, t, pf, pt];
}

/** Tarjeta de metrica: valor grande, variacion y pie. */
function Kpi({
  etiqueta,
  valor,
  pie,
  icono,
  variacion,
  tendencia,
}: {
  etiqueta: string;
  valor: string;
  pie?: string;
  icono: IconName;
  /** Variacion respecto al periodo anterior; `null` si no hay base. */
  variacion: number | null;
  /** Muestra el icono de tendencia en vez de la flecha. */
  tendencia?: boolean;
}) {
  const sube = (variacion ?? 0) >= 0;
  return (
    <article className="bento__card bento__kpi">
      <header className="bento__kpi-head">
        <span className="bento__kpi-icon" aria-hidden>
          <Icon name={icono} />
        </span>
        {variacion !== null && (
          <span className={"pill " + (sube ? "pill--up" : "pill--down")}>
            <Icon name={tendencia ? "trendUp" : sube ? "arrowUp" : "arrowDown"} size="sm" />
            {sube ? "+" : ""}
            {variacion.toFixed(1)} %
          </span>
        )}
      </header>
      <div className="bento__kpi-label">{etiqueta}</div>
      <div className="bento__kpi-value">{valor}</div>
      {pie && <div className="bento__kpi-foot">{pie}</div>}
    </article>
  );
}

/**
 * Grafico de barras mensual.
 *
 * Cada barra es un boton: se puede tocar o recorrer con el teclado. La
 * tarjeta flotante muestra el detalle exacto del mes elegido.
 */
function GraficoMensual({ puntos }: { puntos: MonthPoint[] }) {
  const [sel, setSel] = useState(puntos.length - 1);
  const max = Math.max(...puntos.map((p) => p.net), 1);
  const p = puntos[sel] ?? { titulo: "—", net: 0, count: 0, avgTicket: 0 };
  const pct = puntos.length > 1 ? ((sel + 0.5) / puntos.length) * 100 : 50;

  /* Un grafico con los doce meses a cero no es un grafico: es un hueco
     vacio con los nombres de los meses abajo. Si no hay nada que
     representar, se dice. */
  const hayDatos = puntos.some((p) => p.net > 0);

  if (!puntos.length || !hayDatos) {
    return (
      <EmptyState
        title="Sin ventas todavia"
        hint="En cuanto cobres tu primera venta, el grafico se llenara."
        icon="chart"
      />
    );
  }

  return (
    <div className="chart" style={{ ["--cols" as string]: puntos.length }}>
      <div className="chart__area">
        {/* Tarjeta flotante con el detalle del mes. */}
        <div className="chart__detail" style={{ left: `clamp(78px, ${pct.toFixed(2)}%, calc(100% - 78px))` }}>
          <span className="chart__detail-title">{p.titulo}</span>
          <strong className="chart__detail-value">{formatUsd(p.net)}</strong>
          <span className="chart__detail-meta">
            {p.count} {p.count === 1 ? "orden" : "órdenes"} · ticket {formatUsd(p.avgTicket)}
          </span>
        </div>

        <div className="chart__bars">
          {puntos.map((m, i) => (
            <button
              key={m.key}
              type="button"
              className={"chart__bar" + (i === sel ? " is-active" : "")}
              style={{ height: `${m.net > 0 ? Math.max((m.net / max) * 100, 4) : 1}%` }}
              onClick={() => setSel(i)}
              aria-pressed={i === sel}
              aria-label={`${m.titulo}: ${formatUsd(m.net)}, ${m.count} órdenes, ticket ${formatUsd(m.avgTicket)}`}
              title={`${m.titulo} · ${formatUsd(m.net)}`}
            >
              <span className="chart__bar-fill" />
            </button>
          ))}
        </div>
      </div>

      <div className="chart__labels">
        {puntos.map((m, i) => (
          <button
            key={m.key}
            type="button"
            className={"chart__label" + (i === sel ? " is-active" : "")}
            onClick={() => setSel(i)}
            aria-pressed={i === sel}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function General() {
  const { state, user } = useStoreState();
  const [periodo, setPeriodo] = useState<Periodo>("Mes");

  /** El nombre del dueño, para el saludo. */
  const nombreUsuario = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
    : "";

  const { actual, varVentas, varOrdenes, varTicket, varMargen } = useMemo(() => {
    const [f, t, pf, pt] = rangos(periodo);
    const a = metrics(state.sales, state.expenses, f, t);
    const p = metrics(state.sales, state.expenses, pf, pt);
    return {
      actual: a,
      varVentas: growth(p.net, a.net),
      varOrdenes: growth(p.count, a.count),
      varTicket: growth(p.avgTicket, a.avgTicket),
      varMargen: growth(p.gross, a.gross),
    };
  }, [state.sales, state.expenses, periodo]);

  const cap = useMemo(() => capital(state), [state]);
  const low = useMemo(() => lowStock(state), [state]);
  const puntos = useMemo(() => monthlySeries(state.sales, 12), [state.sales]);

  const margenPct = actual.net > 0 ? Math.round((actual.gross / actual.net) * 100) : 0;
  const comparativo =
    periodo === "Día" ? "ayer" : periodo === "Semana" ? "la semana anterior" : "el mes anterior";

  const steps = [
    { done: Boolean(state.business.name.trim()), label: "Completa los datos de tu comercio" },
    { done: state.products.length > 0, label: "Crea tu primer producto" },
    { done: state.contacts.length > 0, label: "Registra un contacto" },
    { done: state.accounts.length > 0, label: "Crea una cuenta de dinero" },
    { done: Boolean(state.cashSession), label: "Abre la caja del día" },
    { done: state.sales.length > 0, label: "Haz tu primera venta" },
  ];
  const done = steps.filter((s) => s.done).length;

  return (
    <div className="general">
      <PageHead
        title={nombreUsuario ? `Hola, ${nombreUsuario}` : "Hola"}
        subtitle="Así va tu negocio."
        actions={
          <Tabs
            tabs={PERIODOS}
            value={periodo}
            onChange={(t) => setPeriodo(t as Periodo)}
          />
        }
      />

      <div className="bento">
        {/* --- Fila 1: metricas clave --- */}
        <Kpi
          etiqueta="Ventas totales"
          valor={formatUsd(actual.net)}
          pie={`vs ${comparativo}`}
          icono="dollarsign"
          variacion={varVentas}
        />
        <Kpi
          etiqueta="Órdenes pagadas"
          valor={String(actual.count)}
          pie={`${actual.count === 1 ? "transacción cobrada" : "transacciones cobradas"}`}
          icono="cart"
          variacion={varOrdenes}
        />
        <Kpi
          etiqueta="Ticket promedio"
          valor={formatUsd(actual.avgTicket)}
          pie="por orden"
          icono="receipt"
          variacion={varTicket}
        />
        <Kpi
          etiqueta="Margen bruto"
          valor={formatUsd(actual.gross)}
          pie={`${margenPct} % sobre las ventas`}
          icono="trendUp"
          variacion={varMargen}
          tendencia
        />

        {/* --- Fila 2: grafico + capital --- */}
        <section className="bento__card bento__wide">
          <div className="bento__head">
            <div>
              <div className="bento__title">Ventas por mes</div>
              <div className="bento__hint">Últimos 12 meses. Toca un mes para ver su detalle.</div>
            </div>
            <span className="pill pill--up">
              <Icon name="chartLine" size="sm" />
              {formatUsd(puntos.reduce((a, p) => a + p.net, 0))}
            </span>
          </div>
          <GraficoMensual puntos={puntos} />
        </section>

        <section className="bento__card">
          <div className="bento__head">
            <div>
              <div className="bento__title">Capital</div>
              <div className="bento__hint">Foto de dinero, inventario y por cobrar.</div>
            </div>
          </div>
          <div className="breakdown">
            <div className="breakdown__row">
              <span>En cuentas</span>
              <span className="tabular">{formatUsd(cap.accounts)}</span>
            </div>
            <div className="breakdown__row">
              <span>Inventario a costo</span>
              <span className="tabular">{formatUsd(cap.inventory)}</span>
            </div>
            <div className="breakdown__row">
              <span>Por cobrar</span>
              <span className="tabular">{formatUsd(cap.receivable)}</span>
            </div>
            <div className="breakdown__row breakdown__row--strong">
              <span>Patrimonio neto</span>
              <span className="tabular">{formatUsd(cap.net)}</span>
            </div>
          </div>
        </section>

        {/* --- Fila 3: cierre, por atender y modulos --- */}
        <section className="bento__card">
          <div className="bento__head">
            <div>
              <div className="bento__title">Cierre del periodo</div>
              <div className="bento__hint">Resumen de lo que entra y lo que sale.</div>
            </div>
          </div>
          <div className="breakdown">
            <div className="breakdown__row">
              <span>Ventas netas</span>
              <span className="tabular">{formatUsd(actual.net)}</span>
            </div>
            <div className="breakdown__row">
              <span>Costo de lo vendido</span>
              <span className="tabular">− {formatUsd(actual.cogs)}</span>
            </div>
            <div className="breakdown__row">
              <span>Gastos</span>
              <span className="tabular">− {formatUsd(actual.expenses)}</span>
            </div>
            <div className="breakdown__row breakdown__row--strong">
              <span>Utilidad</span>
              <span className="tabular">{formatUsd(actual.profit)}</span>
            </div>
          </div>
        </section>

        <section className="bento__card">
          <div className="bento__head">
            <div>
              <div className="bento__title">Por atender</div>
              <div className="bento__hint">Productos en o por debajo de su mínimo.</div>
            </div>
          </div>
          {low.length ? (
            <div className="stack gap-12">
              <div className="row-list">
                {low.map((p) => (
                  <div key={p.id} className="row-list__row">
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                    <span className="dim" style={{ fontSize: "var(--fs-sm)" }}>
                      Quedan {p.stock} · mínimo {p.minStock}
                    </span>
                  </div>
                ))}
              </div>
              <Link className="btn btn--soft btn--sm" to="/app/inventario" style={{ alignSelf: "flex-start" }}>
                Ver inventario
              </Link>
            </div>
          ) : (
            <EmptyState
              title="Todo en orden"
              hint="Ningun producto esta por debajo de su minimo."
              icon="checkmarkCircle"
            />
          )}
        </section>

        <section className="bento__card">
          <div className="bento__head">
            <div>
              <div className="bento__title">Para arrancar</div>
              <div className="bento__hint">{done} de {steps.length} completados</div>
            </div>
          </div>
          <div className="stack gap-8">
            {steps.map((s) => (
              <div key={s.label} className={`check ${s.done ? "check--done" : ""}`}>
                <span className="check__mark">{s.done && <Icon name="check" />}</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* --- Accesos a todas las secciones --- */}
        <section className="bento__card bento__wide">
          <div className="bento__head">
            <div>
              <div className="bento__title">Módulos</div>
              <div className="bento__hint">Todas las secciones del sistema.</div>
            </div>
          </div>
          <div className="modgrid">
            {modulosVisibles(state.business.features).map((m) => (
              <Link key={m.to} to={m.to} className="modgrid__item">
                <span className="modgrid__icon" aria-hidden>
                  <Icon name={m.icon} />
                </span>
                <span className="modgrid__label">{m.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
