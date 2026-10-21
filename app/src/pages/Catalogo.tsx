// Catálogo · Productos, descuentos, recargos y categorías.
import { memo, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStoreActions, useStoreSelector } from "../lib/store";
import { DataTable } from "../components/DataTable";
import { Card, EmptyState, Field, Modal, PageHead, Tabs, Badge } from "../components/ui";
import { Icon } from "../components/Icon";
import { CameraScannerModal } from "../components/ScannerModals";
import { useScanHandler } from "../lib/scanner/ScannerProvider";
import { formatBs, formatUsd } from "../lib/money";
import { catalogoLookup, catalogoUpsert } from "../lib/cloud";
import { UNIT_OPTIONS, type Category, type Discount, type Product, type Surcharge } from "../lib/types";

const TABS = ["Productos", "Precios", "Descuentos", "Recargos", "Categorías"] as const;

/** Código interno para productos sin código de barras (prefijo INT-). */
function internalCode(): string {
  return `INT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const margin = (p: number, c: number) => (p > 0 ? Math.round(((p - c) / p) * 100) : 0);

/* --- Filas memoizadas ------------------------------------------- */

/** Fila de producto. */
const ProductRow = memo(function ProductRow({
  product,
  rate,
  onEdit,
  onArchive,
  onRemove,
}: {
  product: Product;
  rate: number;
  onEdit: (p: Product) => void;
  onArchive: (id: string, archived: boolean) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <tr style={product.archived ? { opacity: 0.55 } : undefined}>
      <td style={{ fontWeight: 600 }}>{product.name}</td>
      <td className="mono">{product.sku}</td>
      <td className="tabular">{formatUsd(product.cost)}</td>
      <td className="tabular">{margin(product.price, product.cost)}%</td>
      <td>{product.category}</td>
      <td className="dim" style={{ whiteSpace: "nowrap" }}>
        {product.presentationQty > 0 ? `${product.presentationQty} ${product.unit}` : product.unit}
      </td>
      <td className="tabular">
        {formatUsd(product.price)}
        {rate > 0 && (
          <span className="dim" style={{ fontSize: "0.72rem" }}>
            {" "}
            {formatBs(product.price, rate)}
          </span>
        )}
      </td>
      <td>
        {product.archived ? (
          <Badge>Archivado</Badge>
        ) : product.active ? (
          <Badge tone="success" icon="check">Activo</Badge>
        ) : (
          <Badge>Inactivo</Badge>
        )}
      </td>
      <td className="row-actions">
        <button className="btn btn--soft btn--sm" onClick={() => onEdit(product)}>
          Editar
        </button>
        <button className="btn btn--ghost btn--sm" onClick={() => onArchive(product.id, !product.archived)}>
          {product.archived ? "Reactivar" : "Archivar"}
        </button>
        <button className="btn btn--danger btn--sm" onClick={() => onRemove(product.id)}>
          Eliminar
        </button>
      </td>
    </tr>
  );
});

/** Fila de descuento. */
const DiscountRow = memo(function DiscountRow({
  discount,
  onEdit,
  onRemove,
  onToggle,
}: {
  discount: Discount;
  onEdit: (d: Discount) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
}) {
  const window =
    discount.from || discount.to
      ? `${discount.from || "…"} → ${discount.to || "…"}`
      : "Sin límite";
  return (
    <tr style={discount.active ? undefined : { opacity: 0.55 }}>
      <td style={{ fontWeight: 600 }}>{discount.name}</td>
      <td className="mono">{discount.code}</td>
      <td>{discount.type === "porcentaje" ? `${discount.value}%` : formatUsd(discount.value)}</td>
      <td>
        {discount.used}
        {discount.maxUses !== null ? ` / ${discount.maxUses}` : " / ∞"}
      </td>
      <td className="dim">{window}</td>
      <td>
        <label className="row gap-8">
          <input type="checkbox" checked={discount.active} onChange={(e) => onToggle(discount.id, e.target.checked)} />
          {discount.active ? "Activo" : "Inactivo"}
        </label>
      </td>
      <td className="row-actions">
        <button className="btn btn--soft btn--sm" onClick={() => onEdit(discount)}>
          Editar
        </button>
        <button className="btn btn--danger btn--sm" onClick={() => onRemove(discount.id)}>
          Eliminar
        </button>
      </td>
    </tr>
  );
});

/** Fila de recargo. */
const SurchargeRow = memo(function SurchargeRow({
  surcharge,
  onEdit,
  onRemove,
  onToggle,
}: {
  surcharge: Surcharge;
  onEdit: (s: Surcharge) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
}) {
  return (
    <tr style={surcharge.active ? undefined : { opacity: 0.55 }}>
      <td style={{ fontWeight: 600 }}>{surcharge.name}</td>
      <td>{surcharge.type === "porcentaje" ? `${surcharge.value}%` : formatUsd(surcharge.value)}</td>
      <td>
        <label className="row gap-8">
          <input type="checkbox" checked={surcharge.active} onChange={(e) => onToggle(surcharge.id, e.target.checked)} />
          {surcharge.active ? "Activo" : "Inactivo"}
        </label>
      </td>
      <td className="row-actions">
        <button className="btn btn--soft btn--sm" onClick={() => onEdit(surcharge)}>
          Editar
        </button>
        <button className="btn btn--danger btn--sm" onClick={() => onRemove(surcharge.id)}>
          Eliminar
        </button>
      </td>
    </tr>
  );
});

/** Fila de categoría. */
const CategoryRow = memo(function CategoryRow({
  category,
  count,
  onToggle,
  onOrder,
  onRename,
  onRemove,
}: {
  category: Category;
  count: number;
  onToggle: (id: string, active: boolean) => void;
  onOrder: (id: string, order: number) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}) {
  const [name, setName] = useState(category.name);
  useEffect(() => setName(category.name), [category.name]);
  return (
    <tr style={category.active ? undefined : { opacity: 0.55 }}>
      <td>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            const v = name.trim();
            if (v && v !== category.name) onRename(category.id, v);
            else setName(category.name);
          }}
        />
      </td>
      <td style={{ width: 90 }}>
        <input
          className="input"
          type="number"
          value={category.order}
          onChange={(e) => onOrder(category.id, Number(e.target.value) || 0)}
        />
      </td>
      <td>
        <label className="row gap-8">
          <input
            type="checkbox"
            checked={category.active}
            onChange={(e) => onToggle(category.id, e.target.checked)}
          />
          {category.active ? "Activa" : "Inactiva"}
        </label>
      </td>
      <td className="dim">{count} producto(s)</td>
      <td className="row-actions">
        <button className="btn btn--danger btn--sm" onClick={() => onRemove(category.id)}>
          Eliminar
        </button>
      </td>
    </tr>
  );
});

/** Celda de precio por canal (se confirma al salir del campo). */
const ChannelPriceCell = memo(function ChannelPriceCell({
  productId,
  channelId,
  value,
  onCommit,
}: {
  productId: string;
  channelId: string;
  value: number;
  onCommit: (productId: string, channelId: string, value: number) => void;
}) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  return (
    <input
      className="input"
      type="number"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => {
        const n = Number(v);
        if (Number.isFinite(n) && n >= 0) onCommit(productId, channelId, n);
        else setV(String(value));
      }}
    />
  );
});

const EMPTY_PRODUCT = {
  name: "",
  brand: "",
  sku: "",
  cost: "0",
  price: "0",
  category: "",
  stock: "0",
  minStock: "0",
  presentationQty: "1",
  unit: "unidad",
  taxRate: "0.16",
  barcode: "",
  trackStock: true,
  active: true,
  channelPrices: {} as Record<string, string>,
};

export function Catalogo() {
  const products = useStoreSelector((s) => s.products);
  const discounts = useStoreSelector((s) => s.discounts);
  const surcharges = useStoreSelector((s) => s.surcharges);
  const categories = useStoreSelector((s) => s.categories);
  const channels = useStoreSelector((s) => s.channels);
  const rate = useStoreSelector((s) => s.rate);
  const {
    addProduct,
    updateProduct,
    removeProduct,
    addDiscount,
    updateDiscount,
    removeDiscount,
    addSurcharge,
    updateSurcharge,
    removeSurcharge,
    addCategory,
    updateCategory,
    removeCategory,
    setChannelPrice,
    bulkPrice,
  } = useStoreActions();

  const [tab, setTab] = useState<(typeof TABS)[number]>("Productos");
  const [params, setParams] = useSearchParams();

  /* Producto */
  const [open, setOpen] = useState(false);
  const [camOpen, setCamOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });

  /* Descuento */
  const [discOpen, setDiscOpen] = useState(false);
  const [discEditId, setDiscEditId] = useState<string | null>(null);
  const [discForm, setDiscForm] = useState({
    name: "",
    code: "",
    type: "porcentaje" as "porcentaje" | "monto",
    value: "0",
    maxUses: "",
    active: true,
    from: "",
    to: "",
  });

  /* Recargo */
  const [surOpen, setSurOpen] = useState(false);
  const [surEditId, setSurEditId] = useState<string | null>(null);
  const [surForm, setSurForm] = useState({
    name: "",
    type: "porcentaje" as "porcentaje" | "monto",
    value: "0",
    active: true,
  });

  /* Categoría */
  const [catOpen, setCatOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", active: true, order: "0" });

  /* Precios por canal */
  const [bulkChannel, setBulkChannel] = useState("");
  const [bulkPct, setBulkPct] = useState("0");

  /** Categorías ordenadas por `order` (menor primero). */
  const orderedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [categories]
  );
  /** Solo activas, para el formulario de producto. */
  const activeCategories = useMemo(() => categories.filter((c) => c.active), [categories]);
  const productCount = (name: string) => products.filter((p) => p.category === name).length;
  /** Productos visibles en la tab de precios (no archivados). */
  const priceProducts = useMemo(() => products.filter((p) => !p.archived), [products]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_PRODUCT });
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      sku: p.sku,
      cost: String(p.cost),
      price: String(p.price),
      category: p.category,
      stock: String(p.stock),
      minStock: String(p.minStock),
      presentationQty: String(p.presentationQty ?? 1),
      unit: p.unit,
      taxRate: String(p.taxRate),
      barcode: p.barcode,
      trackStock: p.trackStock,
      active: p.active,
      channelPrices: Object.fromEntries(
        Object.entries(p.channelPrices ?? {}).map(([k, v]) => [k, String(v)]),
      ),
    });
    setOpen(true);
  };

  // --- Escáner (USB · cámara · celular) ---------------------------
  // Si el código ya existe en MI tienda, abre ese producto; si no, consulta
  // el catálogo global para autocompletar; si tampoco está, prepara el alta
  // con el código precargado. Vale para los tres métodos de lectura.
  const scanProduct = async (code: string) => {
    const found = products.find((p) => p.barcode && p.barcode === code);
    if (found) {
      openEdit(found);
      return;
    }
    setEditId(null);
    setForm({ ...EMPTY_PRODUCT, barcode: code });
    setOpen(true);
    // Autocompleta con la ficha colaborativa, si alguna tienda ya la aportó.
    const entry = await catalogoLookup(code);
    if (entry) {
      setForm((f) =>
        // No pisa lo que el usuario haya escrito mientras llegaba la respuesta.
        f.barcode === code && f.name.trim() === ""
          ? {
              ...f,
              name: entry.name,
              brand: entry.brand || f.brand,
              category: entry.category || f.category,
              presentationQty: String(entry.presentationQty ?? 1),
              unit: entry.unit || f.unit,
            }
          : f,
      );
    }
  };
  useScanHandler((code) => void scanProduct(code));

  // El POS puede mandar aquí con ?barcode=… al no encontrar un producto.
  useEffect(() => {
    const code = params.get("barcode");
    if (!code) return;
    void scanProduct(code);
    setParams({}, { replace: true });
    // Solo debe correr cuando cambia el parámetro de la URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function saveProduct() {
    if (!form.name.trim()) return;
    const channelPrices: Record<string, number> = {};
    for (const ch of channels) {
      const raw = form.channelPrices[ch.id];
      if (raw !== undefined && raw !== "") channelPrices[ch.id] = Math.max(0, Number(raw) || 0);
    }
    const barcode = form.barcode.trim();
    // Normalización del catálogo global: el nombre SIEMPRE se guarda en
    // MAYÚSCULAS para evitar duplicados por diferencias de escritura.
    const name = form.name.trim().toUpperCase();
    const presentationQty = Math.max(0, Number(form.presentationQty) || 0);
    const unit = form.unit || "unidad";
    const brand = form.brand.trim();
    const category = form.category.trim();
    const data = {
      name,
      brand,
      sku: form.sku.trim(),
      cost: Math.max(0, Number(form.cost) || 0),
      price: Math.max(0, Number(form.price) || 0),
      category,
      stock: Math.max(0, Number(form.stock) || 0),
      minStock: Math.max(0, Number(form.minStock) || 0),
      presentationQty,
      unit,
      taxRate: Number(form.taxRate) || 0,
      barcode,
      trackStock: form.trackStock,
      active: form.active,
    };
    if (editId) {
      updateProduct(editId, { ...data, channelPrices });
    } else {
      addProduct({ ...data, channelPrices, archived: false });
    }
    // Aporta la ficha descriptiva al catálogo global (solo si hay código
    // de barras). Es asíncrono y no bloquea el guardado local: si falla
    // la red o no hay sesión, el producto ya quedó guardado.
    if (barcode) {
      void catalogoUpsert({ barcode, name, presentationQty, unit, category, brand });
    }
    setOpen(false);
  }

  /* ---- Categorías ---- */
  function openCreateCat() {
    setCatForm({ name: "", active: true, order: "0" });
    setCatOpen(true);
  }

  function saveCategory() {
    if (!catForm.name.trim()) return;
    addCategory({
      name: catForm.name.trim(),
      active: catForm.active,
      order: Math.max(0, Number(catForm.order) || 0),
    });
    setCatOpen(false);
  }

  const openCreateDisc = () => {
    setDiscEditId(null);
    setDiscForm({ name: "", code: "", type: "porcentaje", value: "0", maxUses: "", active: true, from: "", to: "" });
    setDiscOpen(true);
  };

  const openEditDisc = (d: Discount) => {
    setDiscEditId(d.id);
    setDiscForm({
      name: d.name,
      code: d.code,
      type: d.type,
      value: String(d.value),
      maxUses: d.maxUses === null ? "" : String(d.maxUses),
      active: d.active,
      from: d.from ?? "",
      to: d.to ?? "",
    });
    setDiscOpen(true);
  };

  function saveDiscount() {
    if (!discForm.name.trim() || !discForm.code.trim()) return;
    // "Usos máximos": vacío, 0 o un valor no numérico = ilimitado (null). Un
    // descuento con tope 0 nunca se podría aplicar, así que no se permite.
    const rawUses = discForm.maxUses.trim();
    const parsedUses = rawUses === "" ? NaN : Number(rawUses);
    const maxUses =
      Number.isFinite(parsedUses) && parsedUses > 0 ? Math.floor(parsedUses) : null;
    const data = {
      name: discForm.name.trim(),
      code: discForm.code.trim().toUpperCase(),
      type: discForm.type,
      value: Math.max(0, Number(discForm.value) || 0),
      maxUses,
      active: discForm.active,
      from: discForm.from || undefined,
      to: discForm.to || undefined,
    };
    if (discEditId) updateDiscount(discEditId, data);
    else addDiscount(data);
    setDiscOpen(false);
  }

  const openCreateSur = () => {
    setSurEditId(null);
    setSurForm({ name: "", type: "porcentaje", value: "0", active: true });
    setSurOpen(true);
  };

  const openEditSur = (s: Surcharge) => {
    setSurEditId(s.id);
    setSurForm({ name: s.name, type: s.type, value: String(s.value), active: s.active });
    setSurOpen(true);
  };

  function saveSurcharge() {
    if (!surForm.name.trim()) return;
    const data = {
      name: surForm.name.trim(),
      type: surForm.type,
      value: Math.max(0, Number(surForm.value) || 0),
      active: surForm.active,
    };
    if (surEditId) updateSurcharge(surEditId, data);
    else addSurcharge(data);
    setSurOpen(false);
  }

  const headAction =
    tab === "Productos" ? (
      <button className="btn btn--primary" onClick={openCreate}>
        Nuevo producto
      </button>
    ) : tab === "Descuentos" ? (
      <button className="btn btn--primary" onClick={openCreateDisc}>
        Nuevo descuento
      </button>
    ) : tab === "Recargos" ? (
      <button className="btn btn--primary" onClick={openCreateSur}>
        Nuevo recargo
      </button>
    ) : tab === "Categorías" ? (
      <button className="btn btn--primary" onClick={openCreateCat}>
        Nueva categoría
      </button>
    ) : undefined;

  return (
    <div className="stack gap-16">
      <PageHead
        title="Catálogo"
        subtitle="Todo lo que vendes, en un solo listado."
        actions={headAction}
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {/* ---------------- Productos ---------------- */}
      {tab === "Productos" &&
        (products.length === 0 ? (
          <EmptyState
            icon="box"
            title="Sin productos"
            hint="Añade productos en el Catálogo para empezar a vender."
            action={
              <button className="btn btn--soft btn--sm" onClick={openCreate}>
                Nuevo producto
              </button>
            }
          />
        ) : (
          <DataTable
            colCount={9}
            items={products}
            rowKey={(p) => p.id}
            head={
              <tr>
                <th>Producto</th>
                <th>SKU</th>
                <th>Costo</th>
                <th>Margen</th>
                <th>Categoría</th>
                <th>Presentación</th>
                <th>Precio</th>
                <th>Estado</th>
                <th />
              </tr>
            }
            renderRow={(p) => (
              <ProductRow
                product={p}
                rate={rate}
                onEdit={openEdit}
                onArchive={(id, archived) => updateProduct(id, { archived })}
                onRemove={removeProduct}
              />
            )}
          />
        ))}

      {/* ---------------- Precios por canal ---------------- */}
      {tab === "Precios" && (
        <div className="stack gap-16">
          <Card
            title="Precios por canal"
            hint="Cambia el precio de un producto por canal. El canal predeterminado (*) también ajusta el precio base del producto."
          >
            <div className="row gap-12 wrap">
              <select
                className="select"
                value={bulkChannel}
                onChange={(e) => setBulkChannel(e.target.value)}
              >
                <option value="">Elige un canal…</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.isDefault ? " (predeterminado)" : ""}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="number"
                value={bulkPct}
                onChange={(e) => setBulkPct(e.target.value)}
                style={{ width: 130 }}
                placeholder="± %"
              />
              <button
                className="btn btn--soft btn--sm"
                disabled={!bulkChannel || !(Number(bulkPct) || 0)}
                onClick={() => bulkPrice(Number(bulkPct) || 0, bulkChannel)}
              >
                Aplicar % al canal
              </button>
            </div>
          </Card>

          {priceProducts.length === 0 ? (
            <EmptyState
              icon="box"
            title="Sin productos"
              hint="Añade productos para asignarles precios por canal."
            />
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Producto</th>
                    {channels.map((c) => (
                      <th key={c.id}>
                        {c.name}
                        {c.isDefault ? " *" : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {priceProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      {channels.map((c) => (
                        <td key={c.id} className="tabular">
                          <ChannelPriceCell
                            productId={p.id}
                            channelId={c.id}
                            value={p.channelPrices[c.id] ?? p.price}
                            onCommit={setChannelPrice}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------- Descuentos ---------------- */}
      {tab === "Descuentos" &&
        (discounts.length === 0 ? (
          <EmptyState
            icon="percent"
            title="Sin descuentos"
            hint="Crea códigos de descuento para aplicarlos en el POS."
            action={
              <button className="btn btn--soft btn--sm" onClick={openCreateDisc}>
                Nuevo descuento
              </button>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Descuento</th>
                  <th>Usos</th>
                  <th>Vigencia</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <DiscountRow
                    key={d.id}
                    discount={d}
                    onEdit={openEditDisc}
                    onRemove={removeDiscount}
                    onToggle={(id, active) => updateDiscount(id, { active })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {/* ---------------- Recargos ---------------- */}
      {tab === "Recargos" &&
        (surcharges.length === 0 ? (
          <EmptyState
            icon="percent"
            title="Sin recargos"
            hint="Crea recargos (delivery, servicio) para sumarlos en el POS."
            action={
              <button className="btn btn--soft btn--sm" onClick={openCreateSur}>
                Nuevo recargo
              </button>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Recargo</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {surcharges.map((s) => (
                  <SurchargeRow
                    key={s.id}
                    surcharge={s}
                    onEdit={openEditSur}
                    onRemove={removeSurcharge}
                    onToggle={(id, active) => updateSurcharge(id, { active })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {/* ---------------- Categorías ---------------- */}
      {tab === "Categorías" &&
        (categories.length === 0 ? (
          <EmptyState
            icon="tag"
            title="Sin categorías"
            hint="Crea categorías para organizar tu catálogo."
            action={
              <button className="btn btn--soft btn--sm" onClick={openCreateCat}>
                Nueva categoría
              </button>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th>Productos</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orderedCategories.map((c) => (
                  <CategoryRow
                    key={c.id}
                    category={c}
                    count={productCount(c.name)}
                    onToggle={(id, active) => updateCategory(id, { active })}
                    onOrder={(id, order) => updateCategory(id, { order })}
                    onRename={(id, name) => updateCategory(id, { name })}
                    onRemove={removeCategory}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {/* ================= Modales ================= */}

      {open && (
        <Modal title={editId ? "Editar producto" : "Nuevo producto"} onClose={() => setOpen(false)}>
          {/* 1 · Qué es: identificación del producto */}
          <div className="form-section">
            <span className="form-section__title">Producto</span>
            <Field label="Nombre" required hint="Se guarda en MAYÚSCULAS en el catálogo.">
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej.: Harina de maíz"
              />
            </Field>
            <Field label="Código de barras" hint="Escanea o genera un código interno.">
              <div className="row gap-8" style={{ alignItems: "center" }}>
                <input
                  className="input"
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  placeholder="Ej.: 7591234567890"
                />
                <button
                  type="button"
                  className="btn btn--soft btn--sm"
                  title="Escanear con la cámara"
                  onClick={() => setCamOpen(true)}
                >
                  <Icon name="scan" />
                </button>
                <button
                  type="button"
                  className="btn btn--soft btn--sm"
                  title="Generar código interno"
                  onClick={() => setForm({ ...form, barcode: internalCode() })}
                >
                  <Icon name="tag" />
                </button>
              </div>
            </Field>
            <div className="row gap-12">
              <Field label="SKU" hint="Opcional.">
                <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </Field>
              <Field label="Categoría">
                <select
                  className="select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Sin categoría</option>
                  {activeCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  {form.category &&
                    !activeCategories.some((c) => c.name === form.category) && (
                      <option value={form.category}>{form.category}</option>
                    )}
                </select>
              </Field>
            </div>
          </div>

          {/* 2 · Cuánto mide: cantidad + unidad (lista cerrada) */}
          <div className="form-section">
            <span className="form-section__title">Presentación</span>
            <div className="row gap-12">
              <Field label="Cantidad" hint="Ej.: 500, 750, 1.">
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={form.presentationQty}
                  onChange={(e) => setForm({ ...form, presentationQty: e.target.value })}
                />
              </Field>
              <Field label="Unidad">
                <select
                  className="select"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Fabricante / marca" hint="Uso interno. No aparece en el recibo.">
              <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </Field>
          </div>

          {/* 3 · Cuánto cuesta: precios e impuesto */}
          <div className="form-section">
            <span className="form-section__title">Precios e impuesto</span>
            <div className="row gap-12">
              <Field label="Costo (USD)">
                <input className="input" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
              </Field>
              <Field label="Precio (USD)">
                <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </Field>
              <Field label="IVA">
                <select className="select" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })}>
                  <option value="0.16">16%</option>
                  <option value="0.08">8%</option>
                  <option value="0">Exento</option>
                </select>
              </Field>
            </div>
            {channels.length > 0 && (
              <div className="field">
                <span className="field__label">Precios por canal (USD)</span>
                <div className="stack gap-8">
                  {channels.map((ch) => (
                    <div key={ch.id} className="row gap-8" style={{ alignItems: "center" }}>
                      <span className="dim" style={{ flex: 1 }}>
                        {ch.name}
                        {ch.isDefault ? " (predeterminado)" : ""}
                      </span>
                      <input
                        className="input"
                        type="number"
                        style={{ width: 130 }}
                        placeholder={form.price}
                        value={form.channelPrices[ch.id] ?? ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            channelPrices: { ...form.channelPrices, [ch.id]: e.target.value },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4 · Inventario y estado */}
          <div className="form-section">
            <span className="form-section__title">Inventario</span>
            <label className="row gap-8" style={{ marginBottom: "0.75rem" }}>
              <input
                type="checkbox"
                checked={form.trackStock}
                onChange={(e) => setForm({ ...form, trackStock: e.target.checked })}
              />
              Controlar inventario
            </label>
            {form.trackStock && (
              <div className="row gap-12">
                <Field label="Stock">
                  <input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </Field>
                <Field label="Stock mínimo">
                  <input className="input" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
                </Field>
              </div>
            )}
            <label className="row gap-8" style={{ marginBottom: "0.75rem" }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Activo (disponible para vender)
            </label>
          </div>

          <button className="btn btn--primary btn--block" onClick={saveProduct}>
            {editId ? "Guardar cambios" : "Guardar producto"}
          </button>
        </Modal>
      )}

      {camOpen && (
        <CameraScannerModal
          onScan={(code) => setForm((f) => ({ ...f, barcode: code }))}
          onClose={() => setCamOpen(false)}
        />
      )}

      {discOpen && (
        <Modal title={discEditId ? "Editar descuento" : "Nuevo descuento"} onClose={() => setDiscOpen(false)}>
          <Field label="Nombre" required>
            <input className="input" value={discForm.name} onChange={(e) => setDiscForm({ ...discForm, name: e.target.value })} />
          </Field>
          <Field label="Código" required hint="Se guarda en MAYÚSCULAS; se aplica en el POS.">
            <input
              className="input mono"
              value={discForm.code}
              onChange={(e) => setDiscForm({ ...discForm, code: e.target.value })}
            />
          </Field>
          <div className="row gap-12">
            <Field label="Tipo">
              <select
                className="select"
                value={discForm.type}
                onChange={(e) => setDiscForm({ ...discForm, type: e.target.value as typeof discForm.type })}
              >
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="monto">Monto (USD)</option>
              </select>
            </Field>
            <Field label={discForm.type === "porcentaje" ? "Porcentaje (%)" : "Monto (USD)"}>
              <input className="input" type="number" value={discForm.value} onChange={(e) => setDiscForm({ ...discForm, value: e.target.value })} />
            </Field>
          </div>
          <Field label="Usos máximos" hint="Vacío = ilimitado">
            <input
              className="input"
              type="number"
              value={discForm.maxUses}
              onChange={(e) => setDiscForm({ ...discForm, maxUses: e.target.value })}
            />
          </Field>
          <div className="row gap-12">
            <Field label="Vigente desde" hint="Opcional">
              <input className="input" type="date" value={discForm.from} onChange={(e) => setDiscForm({ ...discForm, from: e.target.value })} />
            </Field>
            <Field label="Vigente hasta" hint="Opcional">
              <input className="input" type="date" value={discForm.to} onChange={(e) => setDiscForm({ ...discForm, to: e.target.value })} />
            </Field>
          </div>
          <label className="row gap-8" style={{ marginBottom: "0.75rem" }}>
            <input type="checkbox" checked={discForm.active} onChange={(e) => setDiscForm({ ...discForm, active: e.target.checked })} />
            Activo
          </label>
          <button className="btn btn--primary btn--block" onClick={saveDiscount}>
            {discEditId ? "Guardar cambios" : "Guardar descuento"}
          </button>
        </Modal>
      )}

      {surOpen && (
        <Modal title={surEditId ? "Editar recargo" : "Nuevo recargo"} onClose={() => setSurOpen(false)}>
          <Field label="Nombre" required hint="Ej.: Delivery, Servicio en mesa">
            <input className="input" value={surForm.name} onChange={(e) => setSurForm({ ...surForm, name: e.target.value })} />
          </Field>
          <div className="row gap-12">
            <Field label="Tipo">
              <select
                className="select"
                value={surForm.type}
                onChange={(e) => setSurForm({ ...surForm, type: e.target.value as typeof surForm.type })}
              >
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="monto">Monto (USD)</option>
              </select>
            </Field>
            <Field label={surForm.type === "porcentaje" ? "Porcentaje (%)" : "Monto (USD)"}>
              <input className="input" type="number" value={surForm.value} onChange={(e) => setSurForm({ ...surForm, value: e.target.value })} />
            </Field>
          </div>
          <label className="row gap-8" style={{ marginBottom: "0.75rem" }}>
            <input type="checkbox" checked={surForm.active} onChange={(e) => setSurForm({ ...surForm, active: e.target.checked })} />
            Activo
          </label>
          <button className="btn btn--primary btn--block" onClick={saveSurcharge}>
            {surEditId ? "Guardar cambios" : "Guardar recargo"}
          </button>
        </Modal>
      )}

      {catOpen && (
        <Modal title="Nueva categoría" onClose={() => setCatOpen(false)}>
          <Field label="Nombre" required hint="Ej.: Alimentos, Bebidas, Servicios">
            <input
              className="input"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
            />
          </Field>
          <Field label="Orden" hint="Menor número primero.">
            <input
              className="input"
              type="number"
              value={catForm.order}
              onChange={(e) => setCatForm({ ...catForm, order: e.target.value })}
            />
          </Field>
          <label className="row gap-8" style={{ marginBottom: "0.75rem" }}>
            <input
              type="checkbox"
              checked={catForm.active}
              onChange={(e) => setCatForm({ ...catForm, active: e.target.checked })}
            />
            Activa (disponible en el formulario de producto)
          </label>
          <button className="btn btn--primary btn--block" onClick={saveCategory}>
            Guardar categoría
          </button>
        </Modal>
      )}
    </div>
  );
}
