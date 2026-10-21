// Inicio.
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useStoreState } from "../lib/store";
import { Card, EmptyState, Money, PageHead } from "../components/ui";
import { Icon } from "../components/Icon";
import { capital, dayRange, lowStock, metrics, monthRange } from "../lib/metrics";
import { modulosVisibles } from "../lib/modulos";
import { formatUsd } from "../lib/money";

export function Inicio() {
  const { state } = useStoreState();
  const rate = state.rate;

  const { today, month, cap, low, steps } = useMemo(() => {
    return {
      today: metrics(state.sales, state.expenses, ...dayRange()),
      month: metrics(state.sales, state.expenses, ...monthRange()),
      cap: capital(state),
      low: lowStock(state),
      steps: [
        { done: Boolean(state.business.name.trim()), label: "Completa los datos de tu comercio" },
        { done: state.products.length > 0, label: "Crea tu primer producto" },
        { done: state.contacts.length > 0, label: "Registra un contacto" },
        { done: state.accounts.length > 0, label: "Crea una cuenta de dinero" },
        { done: Boolean(state.cashSession), label: "Abre la caja del día" },
        { done: state.sales.length > 0, label: "Haz tu primera venta" },
      ],
    };
  }, [state.sales, state.expenses, state.products, state.contacts, state.accounts, state.pendings, state.rate, state.business.name, state.cashSession]);

  const done = steps.filter((s) => s.done).length;
  const spendToday = today.net;

  return (
    <div className="stack gap-16">
      <PageHead
        title="Inicio"
        subtitle="El resumen de tu día y las cifras que importan."
      />

      {/* Panel de modulos: en movil es la via de acceso a las secciones
          que no caben en la barra inferior (la HIG limita la barra a 5
          elementos: 2 + accion central + 2). */}
      <Card title="Módulos" hint="Todas las secciones del sistema.">
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
      </Card>

      <div className="kpis kpis--group">
        <div className="kpi">
          <div className="kpi__label">Ventas de hoy</div>
          <Money usd={today.net} rate={rate} />
        </div>
        <div className="kpi">
          <div className="kpi__label">Ventas registradas (mes)</div>
          <div className="kpi__value">{month.count}</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">Utilidad estimada (mes)</div>
          <Money usd={month.profit} rate={rate} />
        </div>
      </div>

      <div className="kpis">
        <Card title="Para arrancar" hint={`${done} de ${steps.length} completados`}>
          <div className="stack gap-8">
            {steps.map((s) => (
              <div key={s.label} className={`check ${s.done ? "check--done" : ""}`}>
                <span className="check__mark">
                  {s.done && <Icon name="check" />}
                </span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Cierre de hoy">
          <div className="breakdown">
            <div className="breakdown__row">
              <span>Ventas netas</span>
              <span className="tabular">{formatUsd(spendToday)}</span>
            </div>
            <div className="breakdown__row">
              <span>Ticket promedio</span>
              <span className="tabular">{formatUsd(today.avgTicket)}</span>
            </div>
            <div className="breakdown__row">
              <span>Utilidad</span>
              <span className="tabular">{formatUsd(today.profit)}</span>
            </div>
          </div>
        </Card>

        <Card title="Capital (a hoy)" hint="Foto de dinero, inventario y por cobrar.">
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
        </Card>
      </div>

      <Card title="Por atender" hint="Productos en o por debajo de su mínimo.">
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
            icon="check"
            title="Todo en orden"
            hint="No hay productos por debajo de su mínimo."
          />
        )}
      </Card>
    </div>
  );
}
