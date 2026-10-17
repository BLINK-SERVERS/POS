// Ventas · Historial.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStoreActions, useStoreSelector } from "../lib/store";
import { DataTable } from "../components/DataTable";
import { Card, EmptyState, Field, Modal, Money, PageHead, Badge } from "../components/ui";
import { isCountable, saleNet, saleTotal } from "../lib/metrics";
import { formatUsd, round2 } from "../lib/money";
import type { Sale } from "../lib/types";

/** Etiqueta de estado de una venta, con su tono. */
function saleStatus(s: Sale): { label: string; tone: "success" | "warning" | "neutral"; icon?: "check" | "alert" } {
  if (s.status === "anulada") return { label: "Anulada", tone: "neutral" };
  if (s.status === "cotizacion") return { label: "Cotización", tone: "neutral" };
  if (s.status === "credito") return { label: "Crédito", tone: "warning", icon: "alert" };
  return { label: "Cobrada", tone: "success", icon: "check" };
}

export function Historial() {
  const rate = useStoreSelector((s) => s.rate);
  const sales = useStoreSelector((s) => s.sales);
  const { voidSale } = useStoreActions();

  const [voidId, setVoidId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");

  const voidTarget = useMemo(() => sales.find((s) => s.id === voidId), [sales, voidId]);

  const { totalUsd, credit, avg, count } = useMemo(() => {
    let total = 0;
    let credit = 0;
    let n = 0;
    for (const s of sales) {
      if (!isCountable(s)) continue;
      const net = saleNet(s);
      total += net;
      n += 1;
      if (s.status === "credito") credit += net;
    }
    return {
      totalUsd: round2(total),
      credit: round2(credit),
      avg: n ? round2(total / n) : 0,
      count: n,
    };
  }, [sales]);

  return (
    <div className="stack gap-16">
      <PageHead
        title="Historial de ventas"
        subtitle="Lo vendido, sus cobros y devoluciones."
        actions={
          <Link className="btn btn--primary" to="/ventas">
            Ir al POS
          </Link>
        }
      />

      <div className="kpis">
        <Card flat>
          <div className="kpi__label">Vendido</div>
          <Money usd={totalUsd} rate={rate} />
          <div className="kpi__hint">Sin contar cotizaciones ni anuladas</div>
        </Card>
        <Card flat>
          <div className="kpi__label">Ventas</div>
          <div className="kpi__value">{count}</div>
        </Card>
        <Card flat>
          <div className="kpi__label">Ticket promedio</div>
          <Money usd={avg} rate={rate} />
        </Card>
        <Card flat>
          <div className="kpi__label">Vendido a crédito</div>
          <Money usd={credit} rate={rate} />
          <div className="kpi__hint">{credit ? "Pendiente de cobro" : "Ninguna venta a crédito"}</div>
        </Card>
      </div>

      {sales.length === 0 ? (
        <EmptyState
          title="Aún no hay ventas"
          hint="Las ventas que cobres en el POS aparecerán aquí al instante."
          action={
            <Link className="btn btn--soft btn--sm" to="/ventas">
              Ir al POS
            </Link>
          }
        />
      ) : (
        <DataTable
          colCount={7}
          items={sales}
          rowKey={(s) => s.id}
          head={
            <tr>
              <th>Código</th>
              <th>Fecha</th>
              <th>Productos</th>
              <th>Pago</th>
              <th>Estado</th>
              <th style={{ textAlign: "right" }}>Total</th>
              <th />
            </tr>
          }
          renderRow={(s) => {
            const st = saleStatus(s);
            const anulada = s.status === "anulada";
            return (
              <tr style={anulada ? { opacity: 0.55 } : undefined}>
                <td className="mono">{s.code}</td>
                <td>{new Date(s.at).toLocaleString()}</td>
                <td>{s.lines.reduce((a, l) => a + l.qty, 0)}</td>
                <td>{s.paymentMethod ?? "—"}</td>
                <td>
                  <Badge tone={st.tone} icon={st.icon}>
                    {st.label}
                  </Badge>
                  {anulada && s.voidReason && (
                    <div className="dim" style={{ fontSize: "0.72rem" }}>
                      {s.voidReason}
                    </div>
                  )}
                </td>
                <td className="tabular" style={{ textAlign: "right" }}>
                  {formatUsd(saleTotal(s))}
                </td>
                <td>
                  {!anulada && s.status !== "cotizacion" && (
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => {
                        setVoidReason("");
                        setVoidId(s.id);
                      }}
                    >
                      Anular
                    </button>
                  )}
                </td>
              </tr>
            );
          }}
        />
      )}

      {voidTarget && (
        <Modal title={`Anular venta ${voidTarget.code}`} onClose={() => setVoidId(null)}>
          <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            Se revierte el inventario y el dinero realmente cobrado, se liberan los usos del
            descuento y la venta sale de los indicadores. La operación queda visible como
            <strong> Anulada</strong>.
          </p>

          <div className="breakdown">
            <div className="breakdown__row">
              <span>Total de la venta</span>
              <span className="tabular">{formatUsd(saleTotal(voidTarget))}</span>
            </div>
            <div className="breakdown__row">
              <span>Neto</span>
              <span className="tabular">{formatUsd(round2(saleNet(voidTarget)))}</span>
            </div>
            <div className="breakdown__row">
              <span>Cliente</span>
              <span>{voidTarget.customerName ?? "Consumidor final"}</span>
            </div>
          </div>

          <Field label="Motivo de la anulación" required hint="Obligatorio.">
            <input
              className="input"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Ej.: producto equivocado"
            />
          </Field>

          <button
            className="btn btn--primary btn--block"
            style={{ marginTop: "1rem" }}
            disabled={!voidReason.trim()}
            onClick={() => {
              voidSale(voidTarget.id, voidReason.trim());
              setVoidId(null);
              setVoidReason("");
            }}
          >
            Anular venta
          </button>
        </Modal>
      )}
    </div>
  );
}
