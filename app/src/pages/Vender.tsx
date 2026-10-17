// Vender — punto de venta (POS).
import { memo, useCallback, useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { uid, useStoreActions, useStoreSelector } from "../lib/store";
import { Field, Modal, PageHead, Badge, EmptyState } from "../components/ui";
import { Icon } from "../components/Icon";
import { formatBs, formatBsDirect, formatUsd, round2 } from "../lib/money";
import {
  discountAmount,
  IGTF_RATE,
  igtfFor,
  saleBase,
  saleTax,
  surchargeAmount,
} from "../lib/fiscal";
import type { Discount, Product, SaleLine, SalePayment, Surcharge } from "../lib/types";

/** Cuenta abierta (borrador) del POS. */
interface Draft {
  id: string;
  lines: SaleLine[];
  notes: string;
  discountId: string;
  surchargeIds: string[];
  customerId: string;
}

const emptyDraft = (): Draft => ({
  id: uid("tab"),
  lines: [],
  notes: "",
  discountId: "",
  surchargeIds: [],
  customerId: "",
});

/** Inicio del día (00:00:00) para una fecha "YYYY-MM-DD" u otro ISO. */
const dayStart = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).getTime();
/** Final del día (23:59:59) para una fecha "YYYY-MM-DD" u otro ISO. */
const dayEnd = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T23:59:59` : iso).getTime();

/**
 * ¿Está vigente un descuento hoy? Activo, con usos restantes y dentro de su
 * ventana (fechas `from`/`to`, ambas inclusivas). Fuera de vigencia no aparece
 * en el diálogo ni se puede aplicar.
 */
function isDiscountValid(d: Discount, now = Date.now()): boolean {
  if (!d.active) return false;
  if (d.maxUses !== null && d.used >= d.maxUses) return false;
  if (d.from && now < dayStart(d.from)) return false;
  if (d.to && now > dayEnd(d.to)) return false;
  return true;
}

/** Tarjeta de producto memoizada: no se re-renderiza al cambiar el ticket. */
const ProductCard = memo(function ProductCard({
  product,
  rate,
  onAdd,
}: {
  product: Product;
  rate: number;
  onAdd: (id: string) => void;
}) {
  const low = product.trackStock && product.stock <= product.minStock;
  return (
    <button type="button" className="prod" onClick={() => onAdd(product.id)}>
      <div className="prod__name">{product.name}</div>
      <div className="prod__cat">{product.category}</div>
      <div className="prod__price">
        {formatUsd(product.price)}
        <span className="dim" style={{ fontWeight: 400, fontSize: "0.72rem" }}>
          {" "}
          · {formatBs(product.price, rate)}
        </span>
      </div>
      {low && (
        <div style={{ marginTop: "0.4rem" }}>
          <Badge tone="warning" icon="alert">Stock bajo</Badge>
        </div>
      )}
    </button>
  );
});

export function Vender() {
  const catalog = useStoreSelector((s) => s.products);
  const rate = useStoreSelector((s) => s.rate);
  const cashSession = useStoreSelector((s) => s.cashSession);
  const contacts = useStoreSelector((s) => s.contacts);
  const discounts = useStoreSelector((s) => s.discounts);
  const surcharges = useStoreSelector((s) => s.surcharges);
  const accounts = useStoreSelector((s) => s.accounts);
  const { checkout } = useStoreActions();

  const [drafts, setDrafts] = useState<Draft[]>([emptyDraft()]);
  const [activeId, setActiveId] = useState(() => drafts[0].id);
  const [query, setQuery] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [discOpen, setDiscOpen] = useState(false);
  const [surOpen, setSurOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const draft = useMemo(() => drafts.find((d) => d.id === activeId) ?? drafts[0], [drafts, activeId]);
  const lines = draft.lines;

  const patchDraft = useCallback(
    (patch: Partial<Draft>) => {
      setDrafts((ds) => ds.map((d) => (d.id === draft.id ? { ...d, ...patch } : d)));
    },
    [draft.id]
  );

  // Búsqueda diferida: la UI sigue fluida aunque el catálogo crezca.
  const deferredQuery = useDeferredValue(query);
  const products = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return catalog.filter(
      (p) => p.active && !p.archived && (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase() === q || p.barcode === q)
    );
  }, [catalog, deferredQuery]);

  const addLine = useCallback(
    (id: string) => {
      const p = catalog.find((x) => x.id === id);
      if (!p) return;
      setDrafts((ds) =>
        ds.map((d) => {
          if (d.id !== draft.id) return d;
          const found = d.lines.find((l) => l.productId === id);
          if (found) {
            return {
              ...d,
              lines: d.lines.map((l) => (l.productId === id ? { ...l, qty: l.qty + 1 } : l)),
            };
          }
          return {
            ...d,
            lines: [
              ...d.lines,
              { productId: p.id, name: p.name, qty: 1, price: p.price, cost: p.cost, taxRate: p.taxRate },
            ],
          };
        })
      );
    },
    [catalog, draft.id]
  );

  const setQty = useCallback(
    (id: string, qty: number) => {
      setDrafts((ds) =>
        ds.map((d) =>
          d.id === draft.id
            ? {
                ...d,
                lines:
                  qty <= 0
                    ? d.lines.filter((l) => l.productId !== id)
                    : d.lines.map((l) => (l.productId === id ? { ...l, qty } : l)),
              }
            : d
        )
      );
    },
    [draft.id]
  );

  const discount: Discount | undefined = useMemo(
    () => discounts.find((d) => d.id === draft.discountId && isDiscountValid(d)),
    [discounts, draft.discountId]
  );
  const appliedSurcharges = useMemo(
    () => surcharges.filter((s) => draft.surchargeIds.includes(s.id) && s.active),
    [surcharges, draft.surchargeIds]
  );

  const base = useMemo(() => saleBase(lines), [lines]);
  const discountValue = discount ? discountAmount(discount, base) : 0;
  const net = round2(Math.max(0, base - discountValue));
  const tax = useMemo(() => saleTax(lines, discountValue), [lines, discountValue]);
  const surchargeValue = useMemo(
    () => round2(appliedSurcharges.reduce((a, s) => a + surchargeAmount(s, net), 0)),
    [appliedSurcharges, net]
  );
  const totalPreIgtf = round2(net + tax + surchargeValue);

  const newTab = useCallback(() => {
    const d = emptyDraft();
    setDrafts((ds) => [...ds, d]);
    setActiveId(d.id);
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setDrafts((ds) => {
        const next = ds.filter((d) => d.id !== id);
        if (!next.length) {
          const fresh = emptyDraft();
          setActiveId(fresh.id);
          return [fresh];
        }
        if (id === activeId) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId]
  );

  // ---- Cobro ----
  const [payments, setPayments] = useState<SalePayment[]>([]);
  const [credit, setCredit] = useState(false);
  const [payAccId, setPayAccId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payRef, setPayRef] = useState("");

  const paid = useMemo(() => round2(payments.reduce((a, p) => a + p.amountUsd, 0)), [payments]);
  const paidIgtf = useMemo(() => round2(payments.reduce((a, p) => a + (p.igtf ?? 0), 0)), [payments]);
  const total = round2(totalPreIgtf + paidIgtf);
  const missing = round2(Math.max(0, total - paid));
  // El ticket está saldado cuando no queda nada por cobrar (el dinero se cuantiza
  // a 2 decimales, así que "missing" es 0 o ≥ 0,01).
  const settled = missing < 0.01;
  const needsCustomer = credit && !draft.customerId;

  const payAccount = accounts.find((a) => a.id === payAccId && a.active);
  const inUsd = payAccount?.currency === "USD";
  // "Monto exacto" en USD debe cubrir el IGTF: el cobro aporta V al pagado y
  // 0,03·V al total, así que V = missing − 0,97·V → V = missing / (1 − 0,03).
  const exactAmount = payAccount
    ? inUsd
      ? round2(missing / (1 - IGTF_RATE))
      : round2(missing * (rate || 1))
    : 0;
  const amountUsd = payAccount
    ? round2((Number(payAmount) || 0) / (inUsd ? 1 : rate || 1))
    : 0;

  const addPayment = useCallback(() => {
    if (!payAccount) return;
    const typed = round2(Number(payAmount) || 0);
    const value = round2(typed / (inUsd ? 1 : rate || 1));
    if (value <= 0) return;
    setPayments((ps) => [
      ...ps,
      {
        method: payAccount.name,
        accountId: payAccount.id,
        amountUsd: value,
        currency: payAccount.currency,
        amountInput: typed,
        reference: payRef.trim() || undefined,
        igtf: inUsd ? igtfFor(value) : 0,
      },
    ]);
    setPayAmount("");
    setPayRef("");
  }, [payAccount, payAmount, payRef, inUsd, rate]);

  const finish = useCallback(() => {
    if (!lines.length) return;
    // Sin cobro completo debe marcarse "A crédito": evita ventas a crédito fantasma.
    if (!credit && !settled) return;
    // Wink: una venta a crédito exige cliente.
    if (credit && !draft.customerId) return;
    checkout({
      lines,
      customerId: draft.customerId || undefined,
      discount: discountValue,
      discountId: discount?.id,
      surcharge: surchargeValue,
      surchargeIds: appliedSurcharges.map((s) => s.id),
      tax,
      notes: draft.notes,
      payments,
    });
    // Reinicia la cuenta activa.
    const fresh = emptyDraft();
    setDrafts((ds) => ds.map((d) => (d.id === draft.id ? fresh : d)));
    setActiveId(fresh.id);
    setPayments([]);
    setCredit(false);
    setPayOpen(false);
  }, [
    lines, draft, discountValue, discount, surchargeValue, appliedSurcharges, tax,
    payments, credit, checkout,
  ]);

  const saveQuote = useCallback(() => {
    if (!lines.length) return;
    checkout({
      lines,
      customerId: draft.customerId || undefined,
      discount: discountValue,
      discountId: discount?.id,
      surcharge: surchargeValue,
      surchargeIds: appliedSurcharges.map((s) => s.id),
      tax,
      notes: draft.notes,
      payments: [],
      quote: true,
    });
    const fresh = emptyDraft();
    setDrafts((ds) => ds.map((d) => (d.id === draft.id ? fresh : d)));
    setActiveId(fresh.id);
    setPayOpen(false);
  }, [lines, draft, discountValue, discount, surchargeValue, appliedSurcharges, tax, checkout]);

  const activeDiscounts = useMemo(
    () => discounts.filter((d) => isDiscountValid(d)),
    [discounts]
  );

  return (
    <>
      <PageHead
        title="Vender"
        subtitle="Toca un producto para empezar una cuenta."
        actions={
          <>
            {cashSession ? (
              <Badge tone="success" icon="check">Caja abierta</Badge>
            ) : (
              <Badge tone="warning" icon="alert">Caja cerrada</Badge>
            )}
            <button className="btn btn--ghost" onClick={newTab}>
              <Icon name="plus" />
              Nueva cuenta
            </button>
          </>
        }
      />

      {/* Cuentas abiertas */}
      <div className="row gap-6" style={{ flexWrap: "wrap", marginBottom: "0.75rem" }}>
        {drafts.map((d, i) => (
          <span
            key={d.id}
            className={`badge ${d.id === draft.id ? "badge--accent" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveId(d.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setActiveId(d.id)}
          >
            Venta {i + 1} · {d.lines.length} producto{d.lines.length === 1 ? "" : "s"}
            {drafts.length > 1 && (
              <button
                className="modal__close"
                style={{ marginLeft: 6 }}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(d.id);
                }}
                aria-label="Descartar cuenta"
              >
                <Icon name="close" />
              </button>
            )}
          </span>
        ))}
      </div>

      <div className="pos">
        <div className="pos__catalog">
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar o escanear…"
            aria-label="Buscar o escanear"
          />
          <div className="pos__grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} rate={rate} onAdd={addLine} />
            ))}
          </div>
          {!products.length && (
            <div style={{ paddingTop: "1rem" }}>
              <EmptyState
                title="Sin productos"
                hint="Añade productos en el Catálogo para empezar a vender."
                action={
                  <Link className="btn btn--soft btn--sm" to="/catalogo">
                    Ir al Catálogo
                  </Link>
                }
              />
            </div>
          )}
        </div>

        <div className="ticket">
          <div className="ticket__head between">
            <strong>Cuenta</strong>
            <span className="dim">{lines.length} producto(s)</span>
          </div>

          <div className="ticket__items">
            {lines.length === 0 ? (
              <p className="muted" style={{ fontSize: "0.85rem", padding: "1rem 0" }}>
                Empieza una cuenta: toca un producto.
              </p>
            ) : (
              lines.map((l) => (
                <div key={l.productId} className="ticket__line">
                  <div style={{ fontWeight: 600 }}>{l.name}</div>
                  <div className="tabular" style={{ textAlign: "right" }}>
                    {formatUsd(round2(l.price * l.qty))}
                  </div>
                  <div className="ticket__qty">
                    <span className="stepper row gap-4">
                      <button onClick={() => setQty(l.productId, l.qty - 1)} aria-label="Quitar una unidad">
                        <Icon name="minus" />
                      </button>
                      <span className="tabular" style={{ minWidth: 24, textAlign: "center" }}>
                        {l.qty}
                      </span>
                      <button onClick={() => setQty(l.productId, l.qty + 1)} aria-label="Añadir una unidad">
                        <Icon name="plus" />
                      </button>
                    </span>
                    <span className="dim" style={{ fontSize: "0.72rem" }}>
                      {formatUsd(l.price)} c/u
                    </span>
                  </div>
                  <div className="dim tabular" style={{ textAlign: "right", fontSize: "0.72rem" }}>
                    {formatBs(round2(l.price * l.qty), rate)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="ticket__foot">
            <div className="total-row">
              <span>Subtotal</span>
              <span className="tabular">{formatUsd(base)}</span>
            </div>
            <div className="total-row">
              <span>Descuento</span>
              <span className="tabular">− {formatUsd(discountValue)}</span>
            </div>
            <div className="total-row">
              <span>Recargos</span>
              <span className="tabular">+ {formatUsd(surchargeValue)}</span>
            </div>
            <div className="total-row">
              <span>IVA (16%)</span>
              <span className="tabular">+ {formatUsd(tax)}</span>
            </div>
            <div className="total-row total-row--grand">
              <span>Total</span>
              <span className="tabular">{formatUsd(totalPreIgtf)}</span>
            </div>
            <div className="dim tabular" style={{ textAlign: "right" }}>
              {formatBsDirect(totalPreIgtf * rate)}
            </div>

            <div className="row gap-6" style={{ marginTop: "0.6rem", flexWrap: "wrap" }}>
              <button className="btn btn--soft btn--sm" onClick={() => setDiscOpen(true)}>
                Descuento
              </button>
              <button className="btn btn--soft btn--sm" onClick={() => setSurOpen(true)}>
                Recargos
              </button>
              <button className="btn btn--soft btn--sm" onClick={() => setNoteOpen(true)}>
                Nota
              </button>
              <button className="btn btn--ghost btn--sm" onClick={saveQuote} disabled={!lines.length}>
                Generar cotización
              </button>
            </div>

            <button
              className="btn btn--primary btn--block"
              disabled={!lines.length}
              onClick={() => {
                setPayments([]);
                setCredit(false);
                setPayOpen(true);
              }}
              style={{ marginTop: "0.5rem" }}
            >
              Cobrar
            </button>
          </div>
        </div>
      </div>

      {/* --- Descuento por código --- */}
      {discOpen && (
        <Modal title="Descuento" onClose={() => setDiscOpen(false)}>
          <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            Uno por venta, sobre el subtotal antes de IVA. Créalos en Catálogo → Descuentos.
          </p>
          {activeDiscounts.length === 0 ? (
            <EmptyState
              title="Sin descuentos"
              hint="Aún no hay descuentos vigentes."
              action={
                <Link className="btn btn--soft btn--sm" to="/catalogo">
                  Ir a Catálogo
                </Link>
              }
            />
          ) : (
            <div className="row" style={{ flexDirection: "column", gap: 8 }}>
              {activeDiscounts.map((d) => (
                <button
                  key={d.id}
                  className="btn btn--soft"
                  onClick={() => patchDraft({ discountId: d.id === draft.discountId ? "" : d.id })}
                >
                  <Icon name="tag" />
                  <span style={{ flex: 1, textAlign: "left" }}>{d.name}</span>
                  <span className="tabular">
                    {d.type === "porcentaje" ? `${d.value}%` : formatUsd(d.value)}
                  </span>
                  {d.id === draft.discountId && <Icon name="check" />}
                </button>
              ))}
            </div>
          )}
          {draft.discountId && (
            <button
              className="btn btn--ghost btn--block"
              style={{ marginTop: "0.75rem" }}
              onClick={() => patchDraft({ discountId: "" })}
            >
              Quitar descuento
            </button>
          )}
          <div className="breakdown" style={{ marginTop: "0.75rem" }}>
            <div className="breakdown__row breakdown__row--strong">
              <span>Ahorro</span>
              <span className="tabular">− {formatUsd(discountValue)}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* --- Recargos --- */}
      {surOpen && (
        <Modal title="Recargos" onClose={() => setSurOpen(false)}>
          <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            Puedes sumar varios. El porcentaje va sobre el neto, sin IVA. Catálogo → Recargos.
          </p>
          <div className="row" style={{ flexDirection: "column", gap: 8 }}>
            {surcharges.filter((s) => s.active).map((s: Surcharge) => {
              const on = draft.surchargeIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  className="btn btn--soft"
                  onClick={() =>
                    patchDraft({
                      surchargeIds: on
                        ? draft.surchargeIds.filter((x) => x !== s.id)
                        : [...draft.surchargeIds, s.id],
                    })
                  }
                >
                  <span style={{ flex: 1, textAlign: "left" }}>{s.name}</span>
                  <span className="tabular">
                    {s.type === "porcentaje" ? `${s.value}%` : formatUsd(s.value)}
                  </span>
                  {on && <Icon name="check" />}
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      {/* --- Nota de la venta --- */}
      {noteOpen && (
        <Modal title="Nota de la venta" onClose={() => setNoteOpen(false)}>
          <Field label="Nota" hint="Se imprime en el comprobante.">
            <textarea
              className="input"
              rows={3}
              value={draft.notes}
              onChange={(e) => patchDraft({ notes: e.target.value })}
              placeholder="Ej.: entregar por la puerta trasera"
            />
          </Field>
        </Modal>
      )}

      {/* --- Cobrar --- */}
      {payOpen && (
        <Modal title="Cobrar" onClose={() => setPayOpen(false)}>
          <Field label="Cliente" hint="Opcional. Deja vacío para consumidor final.">
            <select
              className="select"
              value={draft.customerId}
              onChange={(e) => patchDraft({ customerId: e.target.value })}
            >
              <option value="">Consumidor final</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="breakdown" style={{ margin: "0.75rem 0" }}>
            <div className="breakdown__row">
              <span>Subtotal</span>
              <span className="tabular">{formatUsd(base)}</span>
            </div>
            <div className="breakdown__row">
              <span>Descuento</span>
              <span className="tabular">− {formatUsd(discountValue)}</span>
            </div>
            <div className="breakdown__row">
              <span>Recargos</span>
              <span className="tabular">+ {formatUsd(surchargeValue)}</span>
            </div>
            <div className="breakdown__row">
              <span>IVA</span>
              <span className="tabular">+ {formatUsd(tax)}</span>
            </div>
            <div className="breakdown__row">
              <span>IGTF (3%)</span>
              <span className="tabular">+ {formatUsd(paidIgtf)}</span>
            </div>
            <div className="breakdown__row breakdown__row--strong">
              <span>Total</span>
              <span className="tabular">{formatUsd(total)}</span>
            </div>
            <div className="breakdown__row">
              <span>Cobrado</span>
              <span className="tabular">{formatUsd(paid)}</span>
            </div>
            <div className="breakdown__row breakdown__row--strong">
              <span>Falta por cobrar</span>
              <span className="tabular">{formatUsd(missing)}</span>
            </div>
            <div className="breakdown__row">
              <span className="dim">En bolívares</span>
              <span className="tabular dim">{formatBsDirect(missing * rate)}</span>
            </div>
          </div>

          {/* Cobros ya agregados */}
          {payments.length > 0 && (
            <div className="row" style={{ flexDirection: "column", gap: 6, marginBottom: "0.75rem" }}>
              {payments.map((p, i) => (
                <div key={i} className="between" style={{ fontSize: "0.85rem" }}>
                  <span>
                    {p.method}
                    {p.reference ? ` · ref ${p.reference}` : ""}
                    {(p.igtf ?? 0) > 0 ? ` · IGTF ${formatUsd(p.igtf ?? 0)}` : ""}
                  </span>
                  <span className="tabular">{formatUsd(p.amountUsd)}</span>
                </div>
              ))}
            </div>
          )}

          <Field label="Método de pago">
            <div className="row gap-6" style={{ flexWrap: "wrap" }}>
              {accounts
                .filter((a) => a.active)
                .map((a) => (
                  <button
                    key={a.id}
                    className={`btn ${payAccId === a.id ? "btn--primary" : "btn--soft"} btn--sm`}
                    onClick={() => {
                      setPayAccId(a.id);
                      setCredit(false);
                    }}
                  >
                    {a.name}
                    <span className="dim"> · {a.currency}</span>
                  </button>
                ))}
              <button
                className={`btn ${credit ? "btn--primary" : "btn--soft"} btn--sm`}
                onClick={() => {
                  setCredit(true);
                  setPayAccId("");
                }}
              >
                A crédito
              </button>
            </div>
          </Field>

          {payAccount && !credit && (
            <>
              <Field
                label={`Monto (${payAccount.currency})`}
                hint={inUsd ? "Al cobrar en dólares se suma el IGTF (3%)." : undefined}
              >
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder={inUsd ? "0.00" : "0"}
                />
              </Field>
              <div className="between" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                <span className="dim tabular">
                  ≈ {inUsd ? formatBsDirect(amountUsd * rate) : formatUsd(amountUsd)}
                </span>
                <button className="btn btn--ghost btn--sm" onClick={() => setPayAmount(String(exactAmount))}>
                  Monto exacto
                </button>
              </div>
              <Field label="Referencia (opcional)">
                <input
                  className="input"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="N° de referencia o comprobante"
                />
              </Field>
              <button className="btn btn--soft btn--block" onClick={addPayment} style={{ marginBottom: "0.75rem" }}>
                <Icon name="plus" />
                Agregar cobro
              </button>
            </>
          )}

          {credit && (
            <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
              {draft.customerId
                ? `Se registrará la venta a crédito: genera una cuenta por cobrar por ${formatUsd(missing)}.`
                : "Una venta a crédito necesita un cliente: selecciónalo arriba."}
            </p>
          )}

          {!credit && !settled && payments.length > 0 && (
            <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
              Falta por cobrar {formatUsd(missing)}. Cobra el total o marca «A crédito» para dejar
              el saldo pendiente.
            </p>
          )}

          <button
            className="btn btn--primary btn--block"
            onClick={finish}
            disabled={!lines.length || (!credit && !settled) || needsCustomer}
          >
            Confirmar venta
          </button>
        </Modal>
      )}
    </>
  );
}
