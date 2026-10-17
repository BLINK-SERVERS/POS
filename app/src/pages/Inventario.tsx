// Inventario · Existencias.
import { memo, useCallback, useMemo, useState } from "react";
import { useStoreActions, useStoreSelector } from "../lib/store";
import { DataTable } from "../components/DataTable";
import { Card, EmptyState, Field, Modal, Money, PageHead, Tabs, Badge } from "../components/ui";
import { formatUsd, round2 } from "../lib/money";
import type { Product } from "../lib/types";

const TABS = ["Existencias", "Movimientos", "Compras"] as const;

/** Fila memoizada: no se re-renderiza al escribir en los modales. */
const StockRow = memo(function StockRow({
  product,
  onAdjust,
}: {
  product: Product;
  onAdjust: (id: string, stock: number) => void;
}) {
  return (
    <tr>
      <td style={{ fontWeight: 600 }}>{product.name}</td>
      <td className="mono">{product.sku}</td>
      <td className="tabular" style={{ textAlign: "right" }}>
        {product.stock}
      </td>
      <td className="tabular" style={{ textAlign: "right" }}>
        {product.minStock}
      </td>
      <td className="tabular" style={{ textAlign: "right" }}>
        {formatUsd(round2(product.cost * Math.max(0, product.stock)))}
      </td>
      <td>
        {product.stock <= product.minStock ? (
          <Badge tone="warning" icon="alert">Stock bajo</Badge>
        ) : (
          <Badge tone="success" icon="check">Disponible</Badge>
        )}
      </td>
      <td>
        <button
          className="btn btn--soft btn--sm"
          onClick={() => onAdjust(product.id, product.stock)}
        >
          Ajustar
        </button>
      </td>
    </tr>
  );
});

export function Inventario() {
  const products = useStoreSelector((s) => s.products);
  const rate = useStoreSelector((s) => s.rate);
  const { setStock, addProduct } = useStoreActions();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Existencias");
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("");
  const [qty, setQty] = useState("0");
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchase, setPurchase] = useState({ productId: "", qty: "1", costUnit: "0" });

  const { valorCosto, valorVenta, low } = useMemo(
    () => ({
      valorCosto: round2(products.reduce((a, p) => a + p.cost * Math.max(0, p.stock), 0)),
      valorVenta: round2(products.reduce((a, p) => a + p.price * Math.max(0, p.stock), 0)),
      low: products.filter((p) => p.type !== "servicio" && p.stock <= p.minStock),
    }),
    [products]
  );

  const openAdjust = useCallback((id: string, stock: number) => {
    setTarget(id);
    setQty(String(stock));
    setOpen(true);
  }, []);

  function applyAdjust() {
    if (!target) return;
    setStock(target, Number(qty) || 0);
    setOpen(false);
  }

  function registrarCompra() {
    if (!purchase.productId) return;
    const p = products.find((x) => x.id === purchase.productId);
    if (!p) return;
    setStock(p.id, p.stock + (Number(purchase.qty) || 0));
    setPurchaseOpen(false);
  }

  return (
    <div className="stack gap-16">
      <PageHead
        title="Inventario"
        subtitle="Existencias, mínimos y valor de tu mercancía."
        actions={
          <button className="btn btn--primary" onClick={() => setPurchaseOpen(true)}>
            Registrar compra
          </button>
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
                <button
                  className="btn btn--soft btn--sm"
                  onClick={() =>
                    addProduct({
                      name: "Producto de ejemplo",
                      sku: "SKU-001",
                      barcode: "",
                      unit: "und",
                      cost: 1,
                      price: 2,
                      category: "General",
                      type: "simple",
                      taxRate: 0.16,
                      active: true,
                      archived: false,
                      channelPrices: {},
                      trackStock: true,
                      stock: 10,
                      minStock: 3,
                    })
                  }
                >
                  Añadir producto de ejemplo
                </button>
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
              renderRow={(p) => <StockRow product={p} onAdjust={openAdjust} />}
            />
          )}
        </div>
      )}

      {tab === "Movimientos" && (
        <EmptyState title="Sin movimientos" hint="Aquí verás entradas, salidas y ajustes de existencias." />
      )}
      {tab === "Compras" && (
        <EmptyState title="Sin compras" hint="Registra una compra para aumentar tus existencias." />
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
          <Field label="Producto">
            <select
              className="select"
              value={purchase.productId}
              onChange={(e) => setPurchase({ ...purchase, productId: e.target.value })}
            >
              <option value="">Selecciona…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cantidad">
            <input
              className="input"
              type="number"
              value={purchase.qty}
              onChange={(e) => setPurchase({ ...purchase, qty: e.target.value })}
            />
          </Field>
          <Field label="Costo unitario (USD)">
            <input
              className="input"
              type="number"
              value={purchase.costUnit}
              onChange={(e) => setPurchase({ ...purchase, costUnit: e.target.value })}
            />
          </Field>
          <button className="btn btn--primary btn--block" onClick={registrarCompra}>
            Registrar compra
          </button>
        </Modal>
      )}
    </div>
  );
}
