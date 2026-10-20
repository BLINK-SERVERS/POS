// Inventario · Existencias.
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStoreActions, useStoreSelector } from "../lib/store";
import { DataTable } from "../components/DataTable";
import { CameraScannerModal } from "../components/ScannerModals";
import { useScanHandler } from "../lib/scanner/ScannerProvider";
import { Icon } from "../components/Icon";
import { Card, EmptyState, Field, Modal, Money, PageHead, Tabs, Badge } from "../components/ui";
import { formatUsd, round2 } from "../lib/money";


const TABS = ["Existencias", "Movimientos", "Compras"] as const;



export function Inventario() {
  const products = useStoreSelector((s) => s.products);
  const rate = useStoreSelector((s) => s.rate);
  const contacts = useStoreSelector((s) => s.contacts);
  const accounts = useStoreSelector((s) => s.accounts);
  const locations = useStoreSelector((s) => s.locations);
  const purchases = useStoreSelector((s) => s.purchases);
  const inventoryMoves = useStoreSelector((s) => s.inventoryMoves);
  const { setStock, addPurchase } = useStoreActions();
  const providers = useMemo(() => contacts.filter((c) => c.isProvider), [contacts]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Existencias");
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("");
  const [qty, setQty] = useState("0");
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchase, setPurchase] = useState({
    productId: "",
    qty: "1",
    costUnit: "0",
    supplierId: "",
    paymentMethod: "efectivo" as "efectivo" | "cuenta" | "credito",
    accountId: "",
    invoiceNo: "",
  });

  const { valorCosto, valorVenta, low } = useMemo(
    () => ({
      valorCosto: round2(products.reduce((a, p) => a + p.cost * Math.max(0, p.stock), 0)),
      valorVenta: round2(products.reduce((a, p) => a + p.price * Math.max(0, p.stock), 0)),
      // Stock bajo: solo cuando el mínimo es > 0 y las existencias lo alcanzan/igualan.
      low: products.filter((p) => p.minStock > 0 && p.stock <= p.minStock),
    }),
    [products]
  );

  const openAdjust = useCallback((id: string, stock: number) => {
    setTarget(id);
    setQty(String(stock));
    setOpen(true);
  }, []);

  const [camOpen, setCamOpen] = useState(false);

  // Escáner: leer un código abre el ajuste de existencias de ese producto.
  useScanHandler((code) => {
    const q = code.trim().toLowerCase();
    const p = products.find((x) => (x.barcode && x.barcode === code) || (x.sku && x.sku.toLowerCase() === q));
    if (p) openAdjust(p.id, p.stock);
  });

  function applyAdjust() {
    if (!target) return;
    setStock(target, Number(qty) || 0);
    setOpen(false);
  }

  function registrarCompra() {
    setPurchaseError("");
    if (!purchase.productId) {
      setPurchaseError("Elige un producto.");
      return;
    }
    const qtyNum = Number(purchase.qty) || 0;
    if (qtyNum <= 0) {
      setPurchaseError("La cantidad debe ser mayor que cero.");
      return;
    }
    const supplier = providers.find((c) => c.id === purchase.supplierId);
    if (!purchase.supplierId) {
      setPurchaseError("Elige un proveedor (créalo en Contactos si no aparece).");
      return;
    }
    if (purchase.paymentMethod !== "credito" && !purchase.accountId) {
      setPurchaseError("Elige la cuenta de donde sale el dinero.");
      return;
    }
    addPurchase({
      supplierId: purchase.supplierId,
      supplierName: supplier?.name ?? "Proveedor",
      locationId: locations[0]?.id ?? "",
      paymentMethod: purchase.paymentMethod,
      accountId: purchase.paymentMethod === "credito" ? undefined : purchase.accountId,
      invoiceNo: purchase.invoiceNo.trim() || undefined,
      lines: [
        {
          productId: purchase.productId,
          qty: qtyNum,
          costUnit: Number(purchase.costUnit) || 0,
        },
      ],
    });
    setPurchase({
      productId: "",
      qty: "1",
      costUnit: "0",
      supplierId: "",
      paymentMethod: "efectivo",
      accountId: "",
      invoiceNo: "",
    });
    setPurchaseOpen(false);
  }

  return (
    <div className="stack gap-16">
      <PageHead
        title="Inventario"
        subtitle="Existencias, mínimos y valor de tu mercancía."
        actions={
          <div className="row gap-8">
            <button className="btn btn--soft" onClick={() => setCamOpen(true)}>
              <Icon name="scan" /> Escanear
            </button>
            <button className="btn btn--primary" onClick={() => setPurchaseOpen(true)}>
              Registrar compra
            </button>
          </div>
        }
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "Existencias" && (
        <div className="stack gap-16">
          <div className="kpis">
            <Card flat>
              <div className="kpi__label">Valor a costo</div>
              <Money usd={valorCosto} rate={rate} />
            </Card>
            <Card flat>
              <div className="kpi__label">Valor a venta</div>
              <Money usd={valorVenta} rate={rate} />
            </Card>
            <Card flat>
              <div className="kpi__label">Alertas de stock</div>
              <div className="kpi__value">{low.length}</div>
            </Card>
          </div>

          {products.length === 0 ? (
            <EmptyState
              title="Sin existencias"
              hint="Registra productos para controlar entradas y mínimos."
              action={
                <Link className="btn btn--soft btn--sm" to="/app/catalogo">
                  Ir a Catálogo
                </Link>
              }
            />
          ) : (
            <DataTable
              colCount={7}
              items={products}
              rowKey={(p) => p.id}
              head={
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th style={{ textAlign: "right" }}>Existencia</th>
                  <th style={{ textAlign: "right" }}>Mínimo</th>
                  <th style={{ textAlign: "right" }}>Valor (costo)</th>
                  <th>Estado</th>
                  <th />
                </tr>
              }
              renderRow={(p) => {
                const low = p.trackStock && p.minStock > 0 && p.stock <= p.minStock;
                const out = p.trackStock && p.stock <= 0;
                return (
                  <tr>
                    <td data-label="Producto">
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div className="dim" style={{ fontSize: "0.72rem" }}>
                        {p.category} · {p.presentationQty} {p.unit}
                      </div>
                    </td>
                    <td data-label="SKU">{p.sku || p.barcode || "—"}</td>
                    <td data-label="Existencia" className="tabular" style={{ textAlign: "right" }}>
                      {p.trackStock ? <span className={low || out ? "text-warning" : ""}>{p.stock}</span> : <span className="dim">—</span>}
                    </td>
                    <td data-label="Mínimo" className="tabular" style={{ textAlign: "right" }}>{p.trackStock ? p.minStock : "—"}</td>
                    <td data-label="Valor (costo)" className="tabular" style={{ textAlign: "right" }}>{formatUsd(p.cost * (p.stock||0))}</td>
                    <td data-label="Estado">
                      {out ? <Badge tone="warning">Agotado</Badge> : low ? <Badge tone="warning">Bajo</Badge> : <Badge tone="accent">OK</Badge>}
                    </td>
                    <td data-label="Acciones" style={{ textAlign: "right" }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => openAdjust(p.id, p.stock)}>Ajustar</button>
                    </td>
                  </tr>
                );
              }}
            />
          )}
        </div>
      )}

      {tab === "Movimientos" && (
        <div className="stack gap-16">
          {inventoryMoves.length === 0 ? (
            <EmptyState
              title="Sin movimientos"
              hint="Aquí verás entradas, salidas y ajustes de existencias."
            />
          ) : (
            <DataTable
              colCount={6}
              items={inventoryMoves}
              rowKey={(m) => m.id}
              head={
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: "right" }}>Cantidad</th>
                  <th style={{ textAlign: "right" }}>Costo unit.</th>
                  <th>Origen</th>
                </tr>
              }
              renderRow={(m) => (
                <tr key={m.id}>
                  <td data-label="Fecha" className="dim" style={{ whiteSpace: "nowrap" }}>
                    {new Date(m.at).toLocaleString()}
                  </td>
                  <td data-label="Producto" style={{ fontWeight: 600 }}>{m.productName}</td>
                  <td data-label="Tipo">
                    <Badge tone={m.kind === "entrada" ? "accent" : "neutral"}>
                      {((k) => k === "entrada" ? "Entrada" : k === "ajuste" ? "Ajuste" : k === "traslado" ? "Traslado" : "Salida")(m.kind as string)}
                    </Badge>
                  </td>
                  <td data-label="Cantidad" className="tabular" style={{ textAlign: "right" }}>
                    {m.qty}
                  </td>
                  <td data-label="Costo unit." className="tabular" style={{ textAlign: "right" }}>
                    {formatUsd(round2(m.costUnit))}
                  </td>
                  <td data-label="Origen">
                    {m.origin}
                    {m.ref ? <span className="dim"> · {m.ref}</span> : null}
                  </td>
                </tr>
              )}
            />
          )}
        </div>
      )}
      {tab === "Compras" && (
        <div className="stack gap-16">
          {purchases.length === 0 ? (
            <EmptyState
              title="Sin compras"
              hint="Registra una compra para aumentar tus existencias."
            />
          ) : (
            <DataTable
              colCount={6}
              items={purchases}
              rowKey={(c) => c.id}
              head={
                <tr>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Pago</th>
                  <th>Factura</th>
                  <th style={{ textAlign: "right" }}>Líneas</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              }
              renderRow={(c) => (
                <tr key={c.id}>
                  <td data-label="Fecha" className="dim" style={{ whiteSpace: "nowrap" }}>
                    {new Date(c.at).toLocaleString()}
                  </td>
                  <td data-label="Proveedor" style={{ fontWeight: 600 }}>{c.supplierName}</td>
                  <td data-label="Pago" className="dim">
                    {c.paymentMethod === "credito"
                      ? "Crédito (por pagar)"
                      : c.paymentMethod === "cuenta"
                        ? "Cuenta"
                        : "Efectivo"}
                  </td>
                  <td data-label="Factura" className="mono">{c.invoiceNo || "—"}</td>
                  <td data-label="Líneas" className="tabular" style={{ textAlign: "right" }}>
                    {c.lines.length}
                  </td>
                  <td data-label="Total" className="tabular" style={{ textAlign: "right" }}>
                    {formatUsd(round2(c.totalUsd))}
                  </td>
                </tr>
              )}
            />
          )}
        </div>
      )}

      {open && (
        <Modal title="Ajustar existencia" onClose={() => setOpen(false)}>
          <Field label="Producto">
            <select className="select" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">Selecciona…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nueva existencia">
            <input className="input" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
          </Field>
          <button className="btn btn--primary btn--block" onClick={applyAdjust}>
            Guardar ajuste
          </button>
        </Modal>
      )}

      {purchaseOpen && (
        <Modal title="Registrar compra" onClose={() => setPurchaseOpen(false)}>
          {providers.length === 0 && (
            <p className="muted" style={{ marginBottom: "0.75rem" }}>
              Aún no tienes proveedores. <Link to="/app/contactos">Crea uno en Contactos</Link> para
              registrar la compra con su nombre y su cuenta por pagar.
            </p>
          )}
          <Field label="Producto" required>
            <select
              className="select"
              value={purchase.productId}
              onChange={(e) => {
                const id = e.target.value;
                const p = products.find((x) => x.id === id);
                setPurchase((prev) => ({
                  ...prev,
                  productId: id,
                  costUnit: prev.costUnit === "0" && p ? String(p.cost) : prev.costUnit,
                }));
              }}
            >
              <option value="">Selecciona…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="row gap-12">
            <Field label="Cantidad" required>
              <input
                className="input"
                type="number"
                value={purchase.qty}
                onChange={(e) => setPurchase({ ...purchase, qty: e.target.value })}
              />
            </Field>
            <Field label="Costo unitario (USD)" required>
              <input
                className="input"
                type="number"
                value={purchase.costUnit}
                onChange={(e) => setPurchase({ ...purchase, costUnit: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Proveedor" required>
            <select
              className="select"
              value={purchase.supplierId}
              onChange={(e) => setPurchase({ ...purchase, supplierId: e.target.value })}
            >
              <option value="">Selecciona…</option>
              {providers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="row gap-12">
            <Field label="Forma de pago" required>
              <select
                className="select"
                value={purchase.paymentMethod}
                onChange={(e) =>
                  setPurchase({
                    ...purchase,
                    paymentMethod: e.target.value as "efectivo" | "cuenta" | "credito",
                  })
                }
              >
                <option value="efectivo">Efectivo</option>
                <option value="cuenta">Cuenta / banco</option>
                <option value="credito">Crédito (por pagar)</option>
              </select>
            </Field>
            {purchase.paymentMethod !== "credito" && (
              <Field label="Cuenta" required>
                <select
                  className="select"
                  value={purchase.accountId}
                  onChange={(e) => setPurchase({ ...purchase, accountId: e.target.value })}
                >
                  <option value="">Selecciona…</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>
          <Field label="N° de factura">
            <input
              className="input"
              value={purchase.invoiceNo}
              onChange={(e) => setPurchase({ ...purchase, invoiceNo: e.target.value })}
            />
          </Field>

          {purchaseError && <p className="field__error">{purchaseError}</p>}

          <button className="btn btn--primary btn--block" onClick={registrarCompra}>
            Registrar compra
          </button>
        </Modal>
      )}

      {camOpen && (
        <CameraScannerModal
          onScan={(code) => {
            const q = code.trim().toLowerCase();
            const p = products.find(
              (x) => (x.barcode && x.barcode === code) || (x.sku && x.sku.toLowerCase() === q)
            );
            if (p) openAdjust(p.id, p.stock);
          }}
          onClose={() => setCamOpen(false)}
        />
      )}
    </div>
  );
}
