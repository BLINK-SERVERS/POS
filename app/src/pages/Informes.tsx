// Informes · Resultados.
import { useMemo, useState } from "react";
import { useStoreState } from "../lib/store";
import { Card, Money, PageHead, Tabs, DualInline } from "../components/ui";
import { Icon } from "../components/Icon";
import { capital, metrics, monthRange, monthlySeries, prevMonthRange, isCountable, saleNet, saleTotal } from "../lib/metrics";
import { formatUsd, round2 } from "../lib/money";
import {
  downloadText,
  printReport,
  printablePairs,
  printableTable,
  reportName,
  toCsv,
  type CsvCell,
} from "../lib/export";

const TABS = ["Resultados", "Ventas", "Inventario", "Finanzas"] as const;

export function Informes() {
  const { state } = useStoreState();
  const rate = state.rate;
  const [tab, setTab] = useState<(typeof TABS)[number]>("Resultados");

  const { cur, prev, cap, months, maxNet } = useMemo(() => {
    const [mf, mt] = monthRange();
    const [pf, pt] = prevMonthRange();
    const months = monthlySeries(state.sales, 6);
    return {
      cur: metrics(state.sales, state.expenses, mf, mt),
      prev: metrics(state.sales, state.expenses, pf, pt),
      cap: capital(state),
      months,
      maxNet: Math.max(1, ...months.map((m) => m.net)),
    };
  }, [state.sales, state.expenses, state.products, state.accounts, state.pendings, state.rate]);

  const variation = (a: number, b: number) => {
    if (!b) return a ? "nuevo" : "—";
    const v = Math.round(((a - b) / b) * 100);
    return `${v >= 0 ? "+" : ""}${v}%`;
  };

  const dayCount = new Date().getDate();
  const monthLabel = new Date().toLocaleDateString("es", { month: "long", year: "numeric" });
  const businessName = state.business.legalName || state.business.name || "Mi negocio";

  // ---- Datos de exportación por pestaña (memorizados) ----
  const monthSales = useMemo(
    () => state.sales.filter((s) => isCountable(s) && new Date(s.at).getMonth() === new Date().getMonth()),
    [state.sales]
  );

  const buildResultados = () => {
    const headers: string[] = ["Concepto", "USD"];
    const rows: CsvCell[][] = [
      ["Ventas netas", cur.net],
      ["Costo de lo vendido", cur.cogs],
      ["Utilidad bruta", cur.gross],
      ["Gastos", cur.expenses],
      ["Utilidad neta", cur.profit],
      ["Nº de ventas", cur.count],
      ["Ticket promedio", cur.avgTicket],
      ["", ""],
      ["Capital: En cuentas", cap.accounts],
      ["Capital: Inventario a costo", cap.inventory],
      ["Capital: Por cobrar", cap.receivable],
      ["Capital: Por pagar", cap.payable],
      ["Patrimonio neto", cap.net],
      ["", ""],
      ...months.map((m): CsvCell[] => [`${m.label} (neto)`, m.net]),
    ];
    return { headers, rows };
  };

  const buildVentas = () => {
    const headers = ["Código", "Fecha", "Cliente", "Estado", "Método", "Neto USD", "IVA", "Total USD"];
    const rows: CsvCell[][] = monthSales.map((s) => [
      s.code,
      new Date(s.at).toLocaleString("es"),
      s.customerName || "—",
      s.status,
      s.paymentMethod || "—",
      round2(saleNet(s)),
      round2(s.tax),
      round2(saleTotal(s)),
    ]);
    return { headers, rows };
  };

  const buildInventario = () => {
    const headers = ["Producto", "SKU", "Categoría", "Stock", "Mínimo", "Costo USD", "Precio USD", "Valor costo", "Valor precio"];
    const rows: CsvCell[][] = state.products
      .filter((p) => !p.archived)
      .map((p) => [
        p.name,
        p.sku,
        p.category || "—",
        p.stock,
        p.minStock,
        p.cost,
        p.price,
        round2(p.cost * Math.max(0, p.stock)),
        round2(p.price * Math.max(0, p.stock)),
      ]);
    return { headers, rows };
  };

  const buildFinanzas = () => {
    const headers = ["Cuenta", "Tipo", "Moneda", "Saldo"];
    const rows: CsvCell[][] = state.accounts.map((a) => [a.name, a.type, a.currency, a.balance]);
    return { headers, rows };
  };

  const builders: Record<(typeof TABS)[number], () => { headers: string[]; rows: CsvCell[][] }> = {
    Resultados: buildResultados,
    Ventas: buildVentas,
    Inventario: buildInventario,
    Finanzas: buildFinanzas,
  };

  const exportCsv = () => {
    const { headers, rows } = builders[tab]();
    downloadText(`${reportName(`informe-${tab.toLowerCase()}`)}.csv`, toCsv(headers, rows));
  };

  const exportPdf = () => {
    const title = `Informe de ${tab}`;
    const subtitle = tab === "Resultados" || tab === "Ventas" ? `Mes en curso: ${monthLabel}` : undefined;

    let bodyHtml = "";
    if (tab === "Resultados") {
      bodyHtml =
        printablePairs([
          ["Ventas netas", formatUsd(cur.net)],
          ["Costo de lo vendido", `− ${formatUsd(cur.cogs)}`],
          ["Utilidad bruta", formatUsd(cur.gross)],
          ["Gastos", `− ${formatUsd(cur.expenses)}`],
          ["Utilidad neta", formatUsd(cur.profit)],
          ["Nº de ventas", String(cur.count)],
          ["Ticket promedio", formatUsd(cur.avgTicket)],
        ]) +
        `<h3>Capital (a hoy)</h3>` +
        printablePairs([
          ["En cuentas", formatUsd(cap.accounts)],
          ["Inventario a costo", formatUsd(cap.inventory)],
          ["Por cobrar", formatUsd(cap.receivable)],
          ["Por pagar", formatUsd(cap.payable)],
          ["Patrimonio neto", formatUsd(cap.net)],
        ]) +
        `<h3>Últimos 6 meses (neto)</h3>` +
        printableTable(
          ["Mes", "Neto USD"],
          months.map((m): CsvCell[] => [m.label, formatUsd(m.net)])
        );
    } else if (tab === "Ventas") {
      const { headers, rows } = buildVentas();
      bodyHtml = printableTable(headers, rows);
    } else if (tab === "Inventario") {
      const { headers, rows } = buildInventario();
      bodyHtml = printableTable(headers, rows);
    } else {
      const { headers, rows } = buildFinanzas();
      bodyHtml = printableTable(headers, rows);
    }

    printReport({ title, subtitle, business: businessName, bodyHtml });
  };

  return (
    <div className="stack gap-16">
      <PageHead title="Informes" subtitle="El resultado de tu negocio, mes a mes." />

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {/* Exportar el informe de la pestaña activa */}
      <div className="row gap-8 no-print" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn--ghost" onClick={exportCsv} title="Descargar reporte en CSV (Excel)">
          <Icon name="table" />
          CSV
        </button>
        <button className="btn btn--primary" onClick={exportPdf} title="Exportar reporte en PDF (Guardar como PDF)">
          <Icon name="download" />
          PDF
        </button>
      </div>

      {tab === "Resultados" && (
        <>
          <Card title="Resultados del mes" hint={`1 – ${dayCount} de ${new Date().toLocaleDateString("es", { month: "long" })}`}>
            <div className="kpis kpis--inline">
              <div className="kpi">
                <div className="kpi__label">Ventas netas</div>
                <Money usd={cur.net} rate={rate} />
                <div className="kpi__hint">vs. período anterior: {variation(cur.net, prev.net)}</div>
              </div>
              <div className="kpi">
                <div className="kpi__label">Gastos</div>
                <Money usd={cur.expenses} rate={rate} />
                <div className="kpi__hint">vs. período anterior: {variation(cur.expenses, prev.expenses)}</div>
              </div>
              <div className="kpi">
                <div className="kpi__label">Utilidad neta</div>
                <Money usd={cur.profit} rate={rate} />
                <div className="kpi__hint">vs. período anterior: {variation(cur.profit, prev.profit)}</div>
              </div>
            </div>
          </Card>

          <Card title="Resultados por mes" hint="Últimos 6 meses · valores en USD">
            <div className="stack gap-8">
              {months.map((m) => (
                <div key={m.key} className="row gap-12">
                  <span className="dim" style={{ width: 36, textTransform: "capitalize" }}>
                    {m.label}
                  </span>
                  <span className="bar grow">
                    <span style={{ width: `${(m.net / maxNet) * 100}%` }} />
                  </span>
                  <span className="tabular" style={{ width: 96, textAlign: "right", fontSize: "0.8rem" }}>
                    {formatUsd(m.net)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <div className="card-grid">
            <Card title="De las ventas a tu utilidad">
              <div className="breakdown">
                <div className="breakdown__row">
                  <span>Ventas netas</span>
                  <span className="tabular">{formatUsd(cur.net)}</span>
                </div>
                <div className="breakdown__row">
                  <span>Costo de lo vendido</span>
                  <span className="tabular">− {formatUsd(cur.cogs)}</span>
                </div>
                <div className="breakdown__row">
                  <span>Utilidad bruta</span>
                  <span className="tabular">{formatUsd(cur.gross)}</span>
                </div>
                <div className="breakdown__row">
                  <span>Gastos</span>
                  <span className="tabular">− {formatUsd(cur.expenses)}</span>
                </div>
                <div className="breakdown__row breakdown__row--strong">
                  <span>Utilidad neta</span>
                  <span className="tabular">{formatUsd(cur.profit)}</span>
                </div>
              </div>
            </Card>

            <Card title="Capital (a hoy)" hint="Dinero, inventario y por cobrar vigentes.">
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
        </>
      )}

      {tab === "Ventas" && (
        <Card title="Ventas del mes" hint="Totales y ticket promedio">
          <div className="kpis">
            <div>
              <div className="kpi__label">Vendido</div>
              <Money usd={cur.net} rate={rate} />
            </div>
            <div>
              <div className="kpi__label">Nº de ventas</div>
              <div className="kpi__value">{cur.count}</div>
            </div>
            <div>
              <div className="kpi__label">Ticket promedio</div>
              <Money usd={cur.avgTicket} rate={rate} />
            </div>
          </div>
        </Card>
      )}

      {tab === "Inventario" && (
        <Card title="Valor de inventario" hint="A costo y a precio de venta">
          <div className="stack gap-8">
            <div className="breakdown__row">
              <span>A costo</span>
              <DualInline usd={round2(state.products.reduce((a, p) => a + p.cost * Math.max(0, p.stock), 0))} rate={rate} />
            </div>
            <div className="breakdown__row">
              <span>A precio de venta</span>
              <DualInline usd={round2(state.products.reduce((a, p) => a + p.price * Math.max(0, p.stock), 0))} rate={rate} />
            </div>
          </div>
        </Card>
      )}

      {tab === "Finanzas" && (
        <Card title="Cuentas" hint="Saldos por cuenta">
          <div className="breakdown">
            {state.accounts.map((a) => (
              <div key={a.id} className="breakdown__row">
                <span>
                  {a.name} <span className="dim">· {a.currency}</span>
                </span>
                <span className="tabular">
                  {a.currency === "USD" ? formatUsd(a.balance) : `Bs ${a.balance.toFixed(2)}`}
                </span>
              </div>
            ))}
            {state.accounts.length === 0 && <p className="muted">Sin cuentas registradas.</p>}
          </div>
        </Card>
      )}
    </div>
  );
}
