// Créditos · Cuentas por cobrar (CXC) y deudores.
//
// Vista dedicada: saldo por deudor, vencimiento y atraso, el historial de
// cada cuenta con sus abonos, y dos impresos (estado de cuenta y reporte
// general) por el mismo motor del resto de los reportes.
//
// El abono se captura con la misma entrada multidivisa que tiene la venta:
// se elige la cuenta, se teclea en su moneda y el sistema hace la
// equivalencia. Todo el dinero lo mueve `abonoPendingPagos`, que es la única
// regla de abonos del almacén.
//
// Regla de vocabulario: «Créditos», «Cuentas por cobrar», «Deudores».
import { useCallback, useMemo, useState } from "react";
import { useStoreActions, useStoreState, type CobroAbono } from "../lib/store";
import { Icon } from "../components/Icon";
import { Badge, EmptyState, Field, Modal, Money, PageHead } from "../components/ui";
import { formatBsDirect, formatUsd, round2 } from "../lib/money";
import { printablePairs, printableTable, printReport } from "../lib/export";
import {
  abonosDe,
  cuentasDe,
  deudores as calcularDeudores,
  estadoDeCuenta,
  morosos,
  saldo,
  saldoAlCierre,
  totalPorCobrar,
  type Deudor,
  type LineaEstado,
} from "../lib/creditos";
import type { Account, Movement, Pending } from "../lib/types";

function fecha(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
}

function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleString("es", { dateStyle: "long", timeStyle: "short" });
}

/** Importe en la moneda de la cuenta (nunca se rotula Bs como USD). */
function moneyIn(currency: "USD" | "VES", value: number): string {
  return currency === "VES" ? formatBsDirect(value) : formatUsd(value);
}

/** Uno o muchos, según la cifra. */
const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/* --- Impresos ---------------------------------------------------- */

function imprimirEstado(
  deudor: Ficha,
  lineas: LineaEstado[],
  cuentas: number,
  business: string
) {
  const filas = lineas.map((l) => [
    fecha(l.at),
    l.concepto,
    l.referencia,
    l.debe ? formatUsd(l.debe) : "",
    l.haber ? formatUsd(l.haber) : "",
    formatUsd(l.saldo),
  ]);
  printReport({
    title: `Estado de cuenta · ${deudor.name}`,
    subtitle: deudor.document ? `${deudor.document}${deudor.phone ? ` · ${deudor.phone}` : ""}` : undefined,
    business,
    bodyHtml:
      printablePairs([
        ["Cuentas", String(cuentas)],
        ["Movimientos", String(lineas.length)],
        ["Total cargado", formatUsd(round2(lineas.reduce((a, l) => a + l.debe, 0)))],
        ["Total abonado", formatUsd(round2(lineas.reduce((a, l) => a + l.haber, 0)))],
        ["Saldo al cierre", formatUsd(saldoAlCierre(lineas))],
      ]) +
      printableTable(["Fecha", "Concepto", "Referencia", "Debe", "Haber", "Saldo"], filas),
  });
}

function imprimirReporte(listado: Deudor[], total: number, business: string) {
  const vencidas = listado.reduce((a, d) => a + d.vencidas, 0);
  printReport({
    title: "Cuentas por cobrar",
    subtitle: `${plural(listado.length, "deudor", "deudores")} · ${plural(vencidas, "cuenta vencida", "cuentas vencidas")}`,
    business,
    bodyHtml:
      printablePairs([
        ["Total por cobrar", formatUsd(total)],
        ["Deudores", String(listado.length)],
        ["Cuentas abiertas", String(listado.reduce((a, d) => a + d.cuentas, 0))],
        ["En mora", String(morosos(listado).length)],
      ]) +
      printableTable(
        ["Deudor", "Documento", "Teléfono", "Cuentas", "Saldo", "Vence", "Atraso"],
        listado.map((d) => [
          d.name,
          d.document,
          d.phone,
          String(d.cuentas),
          formatUsd(d.total),
          d.vence ? fecha(d.vence) : "sin vencimiento",
          d.diasAtraso > 0 ? `${d.diasAtraso} días` : "",
        ])
      ),
  });
}

function imprimirComprobante(
  p: Pending,
  m: Movement,
  cuenta: Account | undefined,
  nombre: string,
  business: string
) {
  printReport({
    title: `Comprobante de abono · ${p.subject}`,
    business,
    bodyHtml: printablePairs([
      ["Recibido de", nombre],
      ["Cuenta por cobrar", p.subject],
      ["Fecha del abono", fechaLarga(m.at)],
      ["Recibido en", cuenta ? `${cuenta.name} (${cuenta.currency})` : "—"],
      ["Acreditado", formatUsd(m.amountUsd)],
      ["Monto recibido", m.amountInput != null && cuenta ? moneyIn(cuenta.currency, m.amountInput) : formatUsd(m.amountUsd)],
      ["Detalle", m.note],
      ["Saldo pendiente", formatUsd(saldo(p))],
    ]),
  });
}

/* --- Abono con la entrada multidivisa de la venta ----------------- */

/** Un cobro ya agregado a la fila de abonos. */
interface Cobro {
  accountId: string;
  currency: "USD" | "VES";
  /** Lo que entra a la cuenta, en su propia moneda. */
  amountInput: number;
  /** Lo que se le descuenta a la deuda. */
  amountUsd: number;
  reference: string;
}

function ModalAbono({
  pending,
  nombre,
  accounts,
  rate,
  onCerrar,
  onAplicar,
}: {
  pending: Pending;
  nombre: string;
  accounts: Account[];
  rate: number;
  onCerrar: () => void;
  onAplicar: (cobros: CobroAbono[], nota: string) => void;
}) {
  const activas = accounts.filter((a) => a.active);
  const [accId, setAccId] = useState(activas[0]?.id ?? "");
  const [monto, setMonto] = useState("");
  const [ref, setRef] = useState("");
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");

  const cuenta = activas.find((a) => a.id === accId);
  const enUsd = cuenta?.currency === "USD";
  const abonado = round2(cobros.reduce((a, c) => a + c.amountUsd, 0));
  const resto = round2(saldo(pending) - abonado);
  // Cuánto hay que teclear en la moneda de la cuenta para cubrir lo que falta.
  const exacto = cuenta ? (enUsd ? resto : round2(resto * rate)) : 0;
  const escrito = Number(monto) || 0;
  const usdEscrito = cuenta && (enUsd || rate > 0) ? round2(enUsd ? escrito : escrito / rate) : 0;

  const agregar = useCallback(() => {
    if (!cuenta) return;
    // Sin tasa oficial no hay equivalencia posible en bolívares (BLINK-066).
    if (!enUsd && !(rate > 0)) {
      setError("Configura la tasa de cambio antes de abonar en bolívares.");
      return;
    }
    if (escrito <= 0) return;
    if (resto <= 0) {
      setError("El abono no puede superar el saldo de la cuenta.");
      return;
    }
    // Un abono no devuelve vuelto: lo que pasa de la deuda se recorta a la deuda.
    const aplicado = round2(Math.min(usdEscrito, resto));
    setCobros((cs) => [
      ...cs,
      {
        accountId: cuenta.id,
        currency: cuenta.currency,
        amountInput: enUsd ? aplicado : round2(aplicado * rate),
        amountUsd: aplicado,
        reference: ref.trim(),
      },
    ]);
    setMonto("");
    setRef("");
    setError("");
  }, [cuenta, enUsd, rate, escrito, resto, usdEscrito, ref]);

  const aplicar = useCallback(() => {
    if (!cobros.length) return;
    onAplicar(
      cobros.map((c) => ({
        accountId: c.accountId,
        amountUsd: c.amountUsd,
        reference: c.reference || undefined,
      })),
      nota.trim()
    );
  }, [cobros, nota, onAplicar]);

  return (
    <Modal title={`Abonar · ${pending.subject}`} onClose={onCerrar}>
      <div className="breakdown" style={{ margin: "0 0 0.75rem" }}>
        <div className="breakdown__row">
          <span>Deudor</span>
          <span>{nombre}</span>
        </div>
        <div className="breakdown__row">
          <span>Saldo de la cuenta</span>
          <span className="tabular">{formatUsd(saldo(pending))}</span>
        </div>
        <div className="breakdown__row">
          <span>Abonado ahora</span>
          <span className="tabular">{formatUsd(abonado)}</span>
        </div>
        <div className="breakdown__row breakdown__row--strong">
          <span>Falta por abonar</span>
          <span className="tabular">{formatUsd(resto)}</span>
        </div>
      </div>

      {cobros.length > 0 && (
        <div className="row" style={{ flexDirection: "column", gap: 6, marginBottom: "0.75rem" }}>
          {cobros.map((c, i) => {
            const acc = accounts.find((a) => a.id === c.accountId);
            return (
              <div key={i} className="between" style={{ fontSize: "0.85rem" }}>
                <span>
                  {acc?.name}
                  {c.reference ? ` · ref ${c.reference}` : ""}
                </span>
                <span className="row gap-4">
                  <span className="tabular">
                    {moneyIn(c.currency, c.amountInput)}
                    <span className="dim"> · {formatUsd(c.amountUsd)}</span>
                  </span>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Quitar cobro ${i + 1}`}
                    onClick={() => setCobros((cs) => cs.filter((_, j) => j !== i))}
                  >
                    <Icon name="close" size="sm" />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!activas.length ? (
        <p className="form-error" role="alert">
          No hay cuentas activas donde recibir el abono. Créala en Finanzas → Cuentas.
        </p>
      ) : (
        <>
          {cuenta && cuenta.commissionIn > 0 && (
            <p className="dim" style={{ fontSize: "0.78rem", margin: "0 0 0.5rem" }}>
              {cuenta.name} descuenta {cuenta.commissionIn}% de comisión al recibir.
            </p>
          )}
          {!enUsd && !(rate > 0) && (
            <p className="form-error" role="alert">
              No hay tasa oficial configurada: sin ella no se puede abonar en bolívares.
            </p>
          )}

          <Field label="Cuenta que recibe" as="group">
            <div className="row gap-8" style={{ flexWrap: "wrap" }}>
              {activas.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`btn ${a.id === accId ? "btn--primary" : "btn--soft"} btn--sm`}
                  onClick={() => {
                    setAccId(a.id);
                    setError("");
                  }}
                >
                  {a.name}
                  <span className="dim"> · {a.currency}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label={`Monto (${cuenta?.currency ?? "USD"})`}>
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                if (round2(Number(monto) || 0) > 0) agregar();
                else aplicar();
              }}
              placeholder={enUsd ? "0.00" : "0"}
            />
          </Field>

          <div className="between" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            <span className="dim tabular">
              ≈ {cuenta ? (enUsd ? formatBsDirect(usdEscrito * rate) : formatUsd(usdEscrito)) : "—"}
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setMonto(String(exacto))}
              disabled={!(enUsd || rate > 0) || resto <= 0}
            >
              <Icon name="cash" />
              Monto exacto
            </button>
          </div>

          <Field label="Referencia (opcional)">
            <input
              className="input"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="N° de referencia o comprobante"
            />
          </Field>

          <button
            type="button"
            className="btn btn--soft btn--block"
            onClick={agregar}
            disabled={!cuenta || escrito <= 0 || resto <= 0 || (!enUsd && !(rate > 0))}
          >
            <Icon name="plus" />
            Agregar este cobro
          </button>

          <Field label="Nota del abono (opcional)" hint="Se imprime en el comprobante.">
            <input className="input" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="p. ej. abono en efectivo" />
          </Field>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={aplicar}
            disabled={!cobros.length}
          >
            <Icon name="check" />
            Registrar abono de {formatUsd(abonado)}
          </button>
        </>
      )}
    </Modal>
  );
}

/* --- Ficha del deudor -------------------------------------------- */

/** Cabecera de la ficha: lo único que el estado de cuenta impreso necesita. */
interface Ficha {
  contactId: string;
  name: string;
  document: string;
  phone: string;
}

function FilaCuenta({
  p,
  movements,
  accounts,
  onAbonar,
  onComprobante,
}: {
  p: Pending;
  movements: Movement[];
  accounts: Account[];
  onAbonar: (p: Pending) => void;
  onComprobante: (p: Pending, m: Movement) => void;
}) {
  const abonos = abonosDe(movements, p);
  const resta = saldo(p);
  return (
    <div className="card" style={{ padding: "0.75rem", marginBottom: "0.6rem" }}>
      <div className="between" style={{ alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 600 }}>{p.subject}</div>
          <div className="dim" style={{ fontSize: "0.78rem" }}>
            {fecha(p.at)} · {formatUsd(p.amountUsd)} · saldo {formatUsd(resta)}
          </div>
        </div>
        <span className="row gap-8">
          <Badge tone={p.status === "saldado" ? "success" : p.status === "parcial" ? "warning" : "neutral"}>
            {p.status}
          </Badge>
          {resta > 0 && (
            <button type="button" className="btn btn--soft btn--sm" onClick={() => onAbonar(p)}>
              <Icon name="cash" />
              Abonar
            </button>
          )}
        </span>
      </div>
      {abonos.length > 0 && (
        <div style={{ marginTop: "0.5rem", borderTop: "1px solid var(--color-border)", paddingTop: "0.5rem" }}>
          {abonos.map((m) => {
            const acc = accounts.find((a) => a.id === m.accountId);
            return (
              <div key={m.id} className="between" style={{ fontSize: "0.8rem", padding: "2px 0" }}>
                <span className="dim">
                  {fecha(m.at)} · {acc?.name ?? "cuenta"} · {m.note}
                </span>
                <span className="row gap-4">
                  <span className="tabular">{formatUsd(m.amountUsd)}</span>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Imprimir comprobante del abono del ${fecha(m.at)}`}
                    title="Imprimir comprobante"
                    onClick={() => onComprobante(p, m)}
                  >
                    <Icon name="printer" size="sm" />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* --- Página ------------------------------------------------------- */

export function Creditos() {
  const { state } = useStoreState();
  const actions = useStoreActions();
  const [busqueda, setBusqueda] = useState("");
  const [ficha, setFicha] = useState<string | null>(null);
  const [abono, setAbono] = useState<Pending | null>(null);

  // El reloj se fija al montar: si cambiara en cada render, la memoización del
  // listado se cairía y los días de atraso saltarían a cada tecla.
  const [ahora] = useState(() => Date.now());
  const listado = useMemo(
    () => calcularDeudores(state.pendings, state.contacts, ahora),
    [state.pendings, state.contacts, ahora]
  );
  const total = useMemo(() => totalPorCobrar(state.pendings), [state.pendings]);
  const morososLista = useMemo(() => morosos(listado), [listado]);
  const vencidas = useMemo(() => listado.reduce((a, d) => a + d.vencidas, 0), [listado]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return listado;
    return listado.filter((d) =>
      [d.name, d.document, d.phone].some((v) => v.toLowerCase().includes(q))
    );
  }, [listado, busqueda]);

  const nombreDe = (contactId: string) =>
    state.contacts.find((c) => c.id === contactId)?.name ||
    state.pendings.find((p) => (p.contactId ?? "") === contactId)?.contactName ||
    "Sin cliente asignado";

  // La ficha se arma con los datos crudos del cliente, no con la fila del
  // listado: al quedar saldada, la cuenta desaparece de «deudores» y la ficha
  // se cerraría de golpe justo después de registrar el abono.
  const fichaDe = useMemo(() => {
    if (ficha === null) return null;
    const c = state.contacts.find((x) => x.id === ficha);
    return {
      contactId: ficha,
      name: nombreDe(ficha),
      document: c?.document ?? "",
      phone: c?.phone ?? "",
    };
  }, [ficha, state.contacts, state.pendings]);

  const aplicarAbono = useCallback(
    (pendingId: string, cobros: CobroAbono[], nota: string) => {
      actions.abonoPendingPagos(pendingId, cobros, nota);
      setAbono(null);
    },
    [actions]
  );

  const imprimirEstadoDe = (d: Ficha) =>
    imprimirEstado(
      d,
      estadoDeCuenta(state.pendings, state.movements, d.contactId),
      cuentasDe(state.pendings, d.contactId).length,
      state.business.name
    );

  // Abono rápido de la fila: se abre la cuenta más antigua con saldo, que es
  // la que primero hay que cerrar.
  const abonarFila = (contactId: string) => {
    const abiertas = cuentasDe(state.pendings, contactId).filter((p) => saldo(p) > 0);
    if (abiertas.length) setAbono(abiertas[abiertas.length - 1]);
  };

  const totalDe = (contactId: string) =>
    round2(cuentasDe(state.pendings, contactId).reduce((a, p) => a + saldo(p), 0));

  return (
    <>
      <PageHead
        title="Créditos"
        subtitle="Cuentas por cobrar del comercio, con su vencimiento y sus abonos."
        actions={
          <button
            type="button"
            className="btn btn--soft btn--sm"
            data-tour="creditos-reporte"
            disabled={!listado.length}
            onClick={() => imprimirReporte(listado, total, state.business.name)}
          >
            <Icon name="printer" />
            Reporte CXC
          </button>
        }
      />

      <div className="kpis kpis--group" data-tour="creditos-resumen">
        <div className="kpi">
          <div className="kpi__label">Por cobrar</div>
          <Money usd={total} rate={state.rate} />
        </div>
        <div className="kpi">
          <div className="kpi__label">Deudores</div>
          <div className="kpi__value">{String(listado.length)}</div>
          <div className="kpi__hint">{plural(vencidas, "cuenta vencida", "cuentas vencidas")}</div>
        </div>
        <div className="kpi">
          <div className="kpi__label">En mora</div>
          <div className="kpi__value">{String(morososLista.length)}</div>
          <div className="kpi__hint">con 30 días o más de atraso</div>
        </div>
      </div>

      {listado.length === 0 ? (
        <EmptyState
          icon="creditcard"
          title="Sin cuentas por cobrar"
          hint="Las ventas cobradas a crédito en la pantalla de venta aparecen aquí solas, con el cliente como deudor."
        />
      ) : (
        <>
          <div className="row" style={{ margin: "0.5rem 0" }}>
            <input
              className="input"
              style={{ flex: 1 }}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar deudor, cédula o teléfono"
              aria-label="Buscar deudor"
            />
          </div>

          <div className="table-wrap" data-tour="creditos-lista">
            <table className="data">
              <thead>
                <tr>
                  <th>Deudor</th>
                  <th>Contacto</th>
                  <th style={{ textAlign: "right" }}>Cuentas</th>
                  <th style={{ textAlign: "right" }}>Saldo</th>
                  <th>Vence</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((d) => (
                  <tr key={d.contactId || "sin-cliente"}>
                    <td style={{ fontWeight: 600 }}>
                      {d.name}
                      {d.document && (
                        <div className="dim" style={{ fontSize: "0.72rem", fontWeight: 400 }}>
                          {d.document}
                        </div>
                      )}
                    </td>
                    <td className="dim">{d.phone || "—"}</td>
                    <td className="tabular" style={{ textAlign: "right" }}>
                      {d.cuentas}
                    </td>
                    <td className="tabular" style={{ textAlign: "right", fontWeight: 600 }}>
                      {formatUsd(d.total)}
                    </td>
                    <td>{d.vence ? fecha(d.vence) : "sin vencimiento"}</td>
                    <td>
                      {d.diasAtraso > 0 ? (
                        <Badge tone={d.diasAtraso >= 30 ? "danger" : "warning"}>
                          {d.diasAtraso} días de atraso
                        </Badge>
                      ) : d.vence ? (
                        <Badge tone="success">al día</Badge>
                      ) : (
                        <Badge tone="neutral">{d.dias} días</Badge>
                      )}
                    </td>
                    <td>
                      <div className="row gap-4" style={{ justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          data-tour="creditos-ficha"
                          onClick={() => setFicha(d.contactId)}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className="btn btn--soft btn--sm"
                          data-tour="creditos-abonar"
                          disabled={!d.total}
                          onClick={() => abonarFila(d.contactId)}
                        >
                          <Icon name="cash" />
                          Abonar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Ficha del deudor: historial completo + estado de cuenta impreso. */}
      {fichaDe && (
        <Modal title={fichaDe.name} onClose={() => setFicha(null)}>
          <div className="row gap-8" style={{ flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <Badge tone="accent">
              {formatUsd(totalDe(fichaDe.contactId))} por cobrar
            </Badge>
            {fichaDe.document && <Badge tone="neutral">{fichaDe.document}</Badge>}
            {fichaDe.phone && <Badge tone="neutral">{fichaDe.phone}</Badge>}
          </div>
          <div className="row gap-8" style={{ marginBottom: "0.75rem" }}>
            <button
              type="button"
              className="btn btn--soft btn--sm"
              onClick={() => imprimirEstadoDe(fichaDe)}
            >
              <Icon name="printer" />
              Estado de cuenta
            </button>
          </div>
          {cuentasDe(state.pendings, fichaDe.contactId).map((p) => (
            <FilaCuenta
              key={p.id}
              p={p}
              movements={state.movements}
              accounts={state.accounts}
              onAbonar={setAbono}
              onComprobante={(pend, m) =>
                imprimirComprobante(
                  pend,
                  m,
                  state.accounts.find((a) => a.id === m.accountId),
                  fichaDe.name,
                  state.business.name
                )
              }
            />
          ))}
        </Modal>
      )}

      {abono && (
        <ModalAbono
          pending={abono}
          nombre={nombreDe(abono.contactId ?? "")}
          accounts={state.accounts}
          rate={state.rate}
          onCerrar={() => setAbono(null)}
          onAplicar={(cobros, nota) => aplicarAbono(abono.id, cobros, nota)}
        />
      )}
    </>
  );
}

export default Creditos;
