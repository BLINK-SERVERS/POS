// Vender — punto de venta (POS).
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { uid, useStoreActions, useStoreSelector } from "../lib/store";
import { Field, Modal, PageHead, Badge, EmptyState } from "../components/ui";
import { Icon } from "../components/Icon";
import { CameraScannerModal } from "../components/ScannerModals";
import { Receipt } from "../components/Receipt";
import { Searchbar } from "konsta/react";
import { useScanHandler, useScanner } from "../lib/scanner/ScannerProvider";
import { formatBs, formatBsDirect, formatUsd, round2 } from "../lib/money";
import {
  discountAmount,
  IGTF_RATE,
  igtfFor,
  saleBase,
  saleTax,
  surchargeAmount,
} from "../lib/fiscal";
import type { Discount, Product, Sale, SaleLine, SalePayment, Surcharge } from "../lib/types";
import { presentationLabel } from "../lib/types";

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

const DRAFTS_KEY = "blink-pos-drafts-v1";
const ACTIVE_TAB_KEY = "blink-pos-active-tab-v1";

function loadInitialDrafts(): { drafts: Draft[]; activeId: string } {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Draft[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const active = localStorage.getItem(ACTIVE_TAB_KEY) || parsed[0].id;
        return { drafts: parsed, activeId: active };
      }
    }
  } catch {
    /* fallback a nuevo draft */
  }
  const fresh = emptyDraft();
  return { drafts: [fresh], activeId: fresh.id };
}

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



export function Vender() {
  const catalog = useStoreSelector((s) => s.products);
  const rate = useStoreSelector((s) => s.rate);
  const cashSession = useStoreSelector((s) => s.cashSession);
  const contacts = useStoreSelector((s) => s.contacts);
  const discounts = useStoreSelector((s) => s.discounts);
  const surcharges = useStoreSelector((s) => s.surcharges);
  const accounts = useStoreSelector((s) => s.accounts);
  const business = useStoreSelector((s) => s.business);
  const { checkout, openCash, syncRate } = useStoreActions();

  const [initial] = useState(loadInitialDrafts);
  const [drafts, setDrafts] = useState<Draft[]>(initial.drafts);
  const [activeId, setActiveId] = useState<string>(initial.activeId);
  const [query, setQuery] = useState("");
  const [camOpen, setCamOpen] = useState(false);
  const [scanCode, setScanCode] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [discOpen, setDiscOpen] = useState(false);
  const [surOpen, setSurOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [openCashModal, setOpenCashModal] = useState(false);
  const [openUsd, setOpenUsd] = useState("0");
  const [openBs, setOpenBs] = useState("0");
  const [successSale, setSuccessSale] = useState<Sale | null>(null);

  // Persistir cuentas abiertas en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
      localStorage.setItem(ACTIVE_TAB_KEY, activeId);
    } catch {
      /* ignore */
    }
  }, [drafts, activeId]);

  // Auto-sync de la tasa oficial al abrir el POS (respeta la caché de 1 h).
  useEffect(() => {
    syncRate();
  }, [syncRate]);

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
  const matches = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return [];
    return catalog.filter((p) => {
      if (!p.active || p.archived) return false;
      const byName = p.name.toLowerCase().includes(q);
      const byBarcode = (p.barcode || "").toLowerCase().includes(q);
      const bySku = (p.sku || "").toLowerCase().includes(q);
      const byMeasure = String(p.presentationQty || "").toLowerCase().includes(q);
      const byUnit = (p.unit || "").toLowerCase().includes(q);
      const byBrand = (p.brand || "").toLowerCase().includes(q);
      return byName || byBarcode || bySku || byMeasure || byUnit || byBrand;
    });
  }, [catalog, deferredQuery]);

  const addLine = useCallback(
    (id: string) => {
      const p = catalog.find((x) => x.id === id);
      if (!p) return;
      // No deja vender más de lo disponible en productos con control de stock.
      const max = p.trackStock ? p.stock : Infinity;
      if (max < 1) return;
      setDrafts((ds) =>
        ds.map((d) => {
          if (d.id !== draft.id) return d;
          const found = d.lines.find((l) => l.productId === id);
          if (found) {
            const nextQty = Math.min(found.qty + 1, max);
            if (nextQty === found.qty) return d;
            return {
              ...d,
              lines: d.lines.map((l) => (l.productId === id ? { ...l, qty: nextQty } : l)),
            };
          }
          return {
            ...d,
            lines: [
              ...d.lines,
              { productId: p.id, name: p.name, presentation: presentationLabel(p), qty: 1, price: p.price, cost: p.cost, taxRate: p.taxRate },
            ],
          };
        })
      );
    },
    [catalog, draft.id]
  );

  // Escáner (USB · cámara · celular): agrega el producto a la cuenta activa.
  // Si el código no está en el catálogo, se ofrece darlo de alta.
  const handleScan = (code: string) => {
    const q = code.trim().toLowerCase();
    const p = catalog.find(
      (x) =>
        x.active &&
        !x.archived &&
        (x.barcode === code || x.sku.toLowerCase() === q || x.name.toLowerCase() === q)
    );
    if (p) {
      addLine(p.id);
      setScanCode("");
      return;
    }
    setScanCode(code);
  };
  useScanHandler(handleScan);

  // El teléfono remoto pide el nombre/precio de lo que va leyendo para mostrar
  // su propia lista. La caja es la que tiene el catálogo, así que responde.
  const { pairing: scanPairing, sendToRemote, subscribeRemote } = useScanner();
  useEffect(() => {
    if (!scanPairing) return;
    return subscribeRemote("names", (payload: { token?: string; codes?: string[] }) => {
      if (payload.token !== scanPairing.token || !Array.isArray(payload.codes)) return;
      const items = payload.codes
        .map((code: string) => {
          const q = code.trim().toLowerCase();
          const p = catalog.find(
            (x) =>
              x.active &&
              !x.archived &&
              (x.barcode === code || x.sku.toLowerCase() === q || x.name.toLowerCase() === q)
          );
          return p ? { code, name: p.name, price: p.price } : null;
        })
        .filter(
          (x: { code: string; name: string; price: number } | null): x is {
            code: string;
            name: string;
            price: number;
          } => x !== null
        );
      if (items.length) sendToRemote("names", { token: scanPairing.token, items });
    });
  }, [scanPairing, catalog, sendToRemote, subscribeRemote]);

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

  // Incrementa una línea respetando el stock disponible del producto.
  const incLine = useCallback(
    (id: string) => {
      const p = catalog.find((x) => x.id === id);
      const line = draft.lines.find((l) => l.productId === id);
      if (!p || !line) return;
      const max = p.trackStock ? p.stock : Infinity;
      setQty(id, Math.min(line.qty + 1, max));
    },
    [catalog, draft.lines, setQty]
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

  // Cálculo en vivo del vuelto según lo tecleado
  const typedAmount = Number(payAmount) || 0;
  const isOverpaying = payAccount && typedAmount > exactAmount && exactAmount > 0;

  const liveChangeUsd = useMemo(() => {
    if (!payAccount || !isOverpaying) return 0;
    if (inUsd) {
      return round2(typedAmount - exactAmount);
    }
    const changeBs = typedAmount - exactAmount;
    return round2(changeBs / (rate || 1));
  }, [payAccount, isOverpaying, typedAmount, exactAmount, inUsd, rate]);

  const liveChangeBs = useMemo(() => {
    if (!payAccount || !isOverpaying) return 0;
    if (!inUsd) {
      return round2(typedAmount - exactAmount);
    }
    return round2(liveChangeUsd * (rate || 1));
  }, [payAccount, isOverpaying, typedAmount, exactAmount, inUsd, liveChangeUsd, rate]);

  const amountUsd = payAccount
    ? round2(
        (isOverpaying ? exactAmount : typedAmount) / (inUsd ? 1 : rate || 1)
      )
    : 0;

  const addPayment = useCallback(() => {
    if (!payAccount) return;
    const typed = round2(Number(payAmount) || 0);
    if (typed <= 0) return;

    // Si el cliente paga de más, el monto que acredita a la venta se acota a exactAmount
    const chargedInput = typed > exactAmount && exactAmount > 0 ? exactAmount : typed;
    const value = round2(chargedInput / (inUsd ? 1 : rate || 1));
    if (value <= 0) return;

    const changeVal = typed > exactAmount && exactAmount > 0 ? round2(typed - exactAmount) : 0;

    setPayments((ps) => [
      ...ps,
      {
        method: payAccount.name,
        accountId: payAccount.id,
        amountUsd: value,
        currency: payAccount.currency,
        amountInput: chargedInput,
        amountReceived: typed,
        change: changeVal,
        reference: payRef.trim() || undefined,
        igtf: inUsd ? igtfFor(value) : 0,
      },
    ]);
    setPayAmount("");
    setPayRef("");
  }, [payAccount, payAmount, payRef, inUsd, rate, exactAmount]);

  const finish = useCallback(() => {
    if (!lines.length) return;
    // Sin cobro completo debe marcarse "A crédito": evita ventas a crédito fantasma.
    if (!credit && !settled) return;
    // Wink: una venta a crédito exige cliente.
    if (credit && !draft.customerId) return;

    const totalReceivedUsd = round2(
      payments.reduce((a, p) => {
        const rec = p.amountReceived ?? p.amountInput ?? p.amountUsd;
        return a + (p.currency === "USD" ? rec : rec / (rate || 1));
      }, 0)
    );
    const totalChangeUsd = round2(
      payments.reduce((a, p) => {
        if (!p.change) return a;
        return a + (p.currency === "USD" ? p.change : p.change / (rate || 1));
      }, 0)
    );
    const totalChangeBs = round2(totalChangeUsd * (rate || 1));

    const sale = checkout({
      lines,
      customerId: draft.customerId || undefined,
      discount: discountValue,
      discountId: discount?.id,
      surcharge: surchargeValue,
      surchargeIds: appliedSurcharges.map((s) => s.id),
      tax,
      notes: draft.notes,
      payments,
      amountReceived: totalReceivedUsd > 0 ? totalReceivedUsd : undefined,
      changeUsd: totalChangeUsd > 0 ? totalChangeUsd : undefined,
      changeBs: totalChangeBs > 0 ? totalChangeBs : undefined,
    });

    // Reinicia la cuenta activa.
    const fresh = emptyDraft();
    setDrafts((ds) => ds.map((d) => (d.id === draft.id ? fresh : d)));
    setActiveId(fresh.id);
    setPayments([]);
    setCredit(false);
    setPayOpen(false);
    setSuccessSale(sale);
  }, [
    lines, draft, discountValue, discount, surchargeValue, appliedSurcharges, tax,
    payments, credit, checkout, settled, rate,
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
            <button className="btn btn--primary" onClick={newTab}>
              <Icon name="plus" />
              Nueva cuenta
            </button>
          </>
        }
      />

      {/* Cuentas abiertas */}
      <div className="row gap-8" style={{ flexWrap: "wrap", marginBottom: "0.75rem" }}>
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
          <div className="row gap-8" style={{ alignItems: "center" }}>
            {/* HIG (Search fields): un solo campo, placeholder explicito
                y foco automatico. Konsta aporta el estilo iOS nativo. */}
            <Searchbar
              className="pos__search"
              value={query}
              onInput={(e: any) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, código, medida, unidad o marca"
              aria-label="Buscar o escanear"
              inputId="pos-search"
              clearButton
            />
            <button
              type="button"
              className="icon-btn icon-btn--accent"
              title="Escanear con la cámara"
              onClick={() => setCamOpen(true)}
            ><Icon name="plus" /> 
              <Icon name="scan" />
            </button>
          </div>
          {scanCode && (
            <div className="scan-hint">
              <span>
                “{scanCode}” no está en tu catálogo. Puedes registrarlo con su precio.
              </span>
              <Link
                className="btn btn--soft btn--sm"
                to={`/catalogo?barcode=${encodeURIComponent(scanCode)}`}
                onClick={() => setScanCode("")}
              >
                Crear producto
              </Link>
            </div>
          )}
          {deferredQuery && matches.length > 0 && (
            <div className="search-results" style={{ marginTop: "0.5rem" }}>
              {matches.slice(0, 20).map((p: Product) => (
                <button
                  key={p.id}
                  className="btn btn--soft btn--sm"
                  style={{ justifyContent: "flex-start" }}
                  onClick={() => addLine(p.id)}
                >
                  <span style={{ flex: 1, textAlign: "left" }}>
                    {p.name}
                    {p.presentationQty > 0 && p.unit ? ` ${p.presentationQty} ${p.unit}` : ""}
                    {p.brand ? ` · ${p.brand}` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
          {!deferredQuery && (
            <div style={{ paddingTop: "1rem" }}>
              <EmptyState
                icon="scan"
            title="Escanea o busca"
                hint="Escanea con el lector USB, celular vinculado o usa la búsqueda predictiva."
                action={
                  <Link className="btn btn--soft btn--sm" to="/app/catalogo">
                    Ir al Catálogo
                  </Link>
                }
              />
            </div>
          )}
          {deferredQuery && matches.length === 0 && (
            <div style={{ paddingTop: "1rem" }}>
              <EmptyState
                icon="search"
            title="Sin coincidencias"
                hint="Prueba con otra combinación: 'MAVESA 500g' o el código de barras."
                action={
                  <Link className="btn btn--soft btn--sm" to={`/catalogo?barcode=${encodeURIComponent(query.trim())}`}>
                    Crear producto
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
                  <div style={{ fontWeight: 600 }}>
                    {l.name}
                    {l.presentation && l.qty === 1 ? <> {l.presentation}</> : ""}
                  </div>
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
                      <button onClick={() => incLine(l.productId)} aria-label="Añadir una unidad">
                        <Icon name="plus" />
                      </button>
                    </span>
                    <span className="dim" style={{ fontSize: "0.72rem" }}>
                      {formatUsd(l.price)} c/u
                    </span>
                  </div>
                  <div className="dim tabular" style={{ textAlign: "right", fontSize: "0.72rem" }}>
                    {rate > 0 && formatBs(round2(l.price * l.qty), rate)}
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
              {rate > 0 ? formatBsDirect(totalPreIgtf * rate) : "—"} Bs
              {business.baseCurrency ? ` · Base: ${business.baseCurrency}` : ""}
            </div>

            <div className="row gap-8" style={{ marginTop: "0.75rem", flexWrap: "wrap" }}>
              <button className="btn btn--soft btn--sm" onClick={() => setDiscOpen(true)}><Icon name="percent" /> 
                Descuento
              </button>
              <button className="btn btn--soft btn--sm" onClick={() => setSurOpen(true)}><Icon name="percent" /> 
                Recargos
              </button>
              <button className="btn btn--soft btn--sm" onClick={() => setNoteOpen(true)}><Icon name="note" /> 
                Nota
              </button>
              <button className="btn btn--ghost btn--sm" onClick={saveQuote} disabled={!lines.length}><Icon name="receipt" /> 
                Generar cotización
              </button>
            </div>

            <button
              className="btn btn--primary btn--block"
              disabled={!lines.length}
              onClick={() => {
                if (!cashSession) {
                  setOpenCashModal(true);
                  return;
                }
                setPayments([]);
                setCredit(false);
                setPayOpen(true);
              }}
              style={{ marginTop: "0.5rem" }}
            ><Icon name="cash" /> 
              {cashSession ? "Cobrar" : "Abrir caja y cobrar"}
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
              icon="percent"
            title="Sin descuentos"
              hint="Aún no hay descuentos vigentes."
              action={
                <Link className="btn btn--soft btn--sm" to="/app/catalogo">
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
                ><Icon name="check" /> 
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
            ><Icon name="close" /> 
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
                ><Icon name="check" /> 
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
                    {p.change != null && p.change > 0 && (
                      <span className="dim"> (Vuelto: {p.currency === "VES" ? formatBsDirect(p.change) : formatUsd(p.change)})</span>
                    )}
                  </span>
                  <span className="tabular">{formatUsd(p.amountUsd)}</span>
                </div>
              ))}
            </div>
          )}

          <Field label="Método de pago" as="group">
            <div className="row gap-8" style={{ flexWrap: "wrap" }}>
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

              <div className="between" style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                <span className="dim tabular">
                  ≈ {inUsd ? formatBsDirect(amountUsd * rate) : formatUsd(amountUsd)}
                </span>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setPayAmount(String(exactAmount))}
                ><Icon name="cash" /> 
                  Monto exacto
                </button>
              </div>

              {inUsd && exactAmount > 0 && (
                <div className="row gap-4" style={{ marginBottom: "0.6rem", flexWrap: "wrap" }}>
                  {[5, 10, 20, 50, 100].map((denom) => (
                    <button
                      key={denom}
                      type="button"
                      className="btn btn--soft btn--sm"
                      onClick={() => setPayAmount(String(denom))}
                    >
                      ${denom}
                    </button>
                  ))}
                </div>
              )}

              {isOverpaying && (
                <div
                  style={{
                    padding: "0.6rem 0.75rem",
                    marginBottom: "0.75rem",
                    background: "rgba(0, 122, 255, 0.08)",
                    border: "1px solid var(--color-accent)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div className="between" style={{ fontWeight: 600 }}>
                    <span>Vuelto a entregar:</span>
                    <span className="mono" style={{ fontSize: "1.05rem", color: "var(--color-accent)" }}>
                      {formatUsd(liveChangeUsd)}
                    </span>
                  </div>
                  <div className="between dim" style={{ fontSize: "0.75rem", marginTop: 2 }}>
                    <span>Equivalente en bolívares:</span>
                    <span className="mono">{formatBsDirect(liveChangeBs)}</span>
                  </div>
                </div>
              )}

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
          ><Icon name="check" /> 
            Confirmar venta
          </button>
        </Modal>
      )}

      {/* --- Modal para abrir caja cuando está cerrada --- */}
      {openCashModal && (
        <Modal title="Abrir caja para cobrar" onClose={() => setOpenCashModal(false)}>
          <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            Debes registrar el fondo inicial con el que abre la caja para garantizar que el arqueo de tu
            turno sea exacto.
          </p>
          
            
              
                <div className="form-group">
                  <Field label="Fondo inicial (USD)" hint="Efectivo en dólares con el que inicia la caja.">
                                                                                <input
                                                                                  className="input"
                                                                                  type="number"
                                                                                  min={0}
                                                                                  step="0.01"
                                                                                  value={openUsd}
                                                                                  onChange={(e) => setOpenUsd(e.target.value)}
                                                                                />
                                                                              </Field>
                                                                              <Field label="Fondo inicial (Bs)" hint="Efectivo en bolívares.">
                                                                                <input
                                                                                  className="input"
                                                                                  type="number"
                                                                                  min={0}
                                                                                  step="0.01"
                                                                                  value={openBs}
                                                                                  onChange={(e) => setOpenBs(e.target.value)}
                                                                                />
                                                                              </Field>
                </div>
              
            
          
          <button
            className="btn btn--primary btn--block"
            onClick={() => {
              openCash(Number(openUsd) || 0, Number(openBs) || 0);
              setOpenCashModal(false);
              setPayments([]);
              setCredit(false);
              setPayOpen(true);
            }}
          ><Icon name="plus" /> <Icon name="check" /> 
            Confirmar apertura y continuar
          </button>
        </Modal>
      )}

      {/* --- Modal de comprobante / venta exitosa --- */}
      {successSale && (
        <Modal
          title={`Venta #${successSale.code} realizada`}
          onClose={() => setSuccessSale(null)}
        >
          <div style={{ marginBottom: "0.75rem" }}>
            <Badge tone="success" icon="check">
              Venta procesada con éxito
            </Badge>
          </div>
          <Receipt
            sale={successSale}
            business={business}
            rate={rate}
            onClose={() => setSuccessSale(null)}
          />
        </Modal>
      )}

      {camOpen && (
        <CameraScannerModal
          onScan={(code) => handleScan(code)}
          onClose={() => setCamOpen(false)}
          continuous
          hint="Cada producto leído se suma a la cuenta. Toca “Continuar” para seguir escaneando."
          footer={
            scanCode ? (
              <div className="scan-hint" style={{ marginTop: "0.75rem" }}>
                <span>“{scanCode}” no está en tu catálogo.</span>
                <Link
                  className="btn btn--soft btn--sm"
                  to={`/catalogo?barcode=${encodeURIComponent(scanCode)}`}
                  onClick={() => setCamOpen(false)}
                >
                  Crear producto
                </Link>
              </div>
            ) : undefined
          }
        />
      )}
    </>
  );
}
