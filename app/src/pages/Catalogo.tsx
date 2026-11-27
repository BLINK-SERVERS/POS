// Catálogo · Productos, descuentos, recargos y categorías.
import { memo, useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useStoreActions, useStoreSelector } from "../lib/store";
import {
  Badge,
  Card,
  CheckField,
  EmptyState,
  Field,
  FieldRow,
  FormSection,
  Modal,
  MoneyField,
  PageHead,
  Tabs,
  useConfirm,
} from "../components/ui";
import { Icon } from "../components/Icon";
import { CameraScannerModal } from "../components/ScannerModals";
import { useScanHandler } from "../lib/scanner/ScannerProvider";
import { formatBs, formatUsd, precioProducto } from "../lib/money";
import { normalizePriceBs } from "../lib/migrate";
import { catalogoLookup, catalogoUpsert } from "../lib/cloud";
import { UNIT_OPTIONS, type Category, type Discount, type Product, type Surcharge } from "../lib/types";

const TABS = ["Productos", "Precios", "Descuentos", "Recargos", "Categorías"] as const;

/** Código interno para productos sin código de barras (prefijo INT-). */
function internalCode(): string {
  return `INT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const calcularMargen = (p: number, c: number) => (p > 0 ? Math.round(((p - c) / p) * 100) : 0);



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
        <button className="row-action" onClick={() => onEdit(discount)} title="Editar" aria-label="Editar"><Icon name="pencil" /></button>
        <button className="row-action row-action--danger" onClick={() => onRemove(discount.id)} title="Eliminar" aria-label="Eliminar"><Icon name="trash" /></button>
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
        <button className="row-action" onClick={() => onEdit(surcharge)} title="Editar" aria-label="Editar"><Icon name="pencil" /></button>
        <button className="row-action row-action--danger" onClick={() => onRemove(surcharge.id)} title="Eliminar" aria-label="Eliminar"><Icon name="trash" /></button>
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
        <button className="row-action row-action--danger" onClick={() => onRemove(category.id)} title="Eliminar" aria-label="Eliminar"><Icon name="trash" /></button>
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

/** Mapa de mensajes de validación de un formulario. */
type Campos = Record<string, string>;

const EMPTY_PRODUCT = {
  name: "",
  brand: "",
  sku: "",
  cost: "0",
  price: "0",
  priceBs: "",
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

/**
 * Miniatura de producto.
 *
 * El catalogo no tiene fotos: la ficha es un dibujo. Cada producto
 * recibe un tinte estable (el mismo siempre, segun su nombre) y sus
 * iniciales, para que la rejilla se lea de un vistazo.
 */
const TONOS = ["azul", "verde", "naranja", "violeta", "rosa", "teal"] as const;

function tonoDe(clave: string): (typeof TONOS)[number] {
  let h = 0;
  for (let i = 0; i < clave.length; i++) h = (h * 31 + clave.charCodeAt(i)) >>> 0;
  return TONOS[h % TONOS.length];
}

function inicialesDe(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (!palabras.length) return "?";
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[1][0]).toUpperCase();
}

/**
 * Tarjeta de producto (HIG · Cards).
 *
 * · Miniatura con las iniciales sobre un tinte estable.
 * · Nombre arriba, en titulo; marca y categoria debajo, en secundario.
 * · Precio alineado a la derecha, con su equivalente en bolivares.
 * · Margen y estado en una fila, y las acciones al pie.
 */
function ProductCard({
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
  const tono = tonoDe(product.name || product.id);
  return (
    <article className={"prodcard" + (product.archived ? " is-archived" : "")}>
      <div className="prodcard__head">
        <span className={"prodthumb prodthumb--" + tono} aria-hidden>
          {inicialesDe(product.name)}
        </span>
        <div className="prodcard__id">
          <h3 className="prodcard__name" title={product.name}>
            {product.name}
          </h3>
          <span className="prodcard__meta">
            {[product.brand, product.category].filter(Boolean).join(" · ") || product.sku}
          </span>
        </div>
      </div>

      <div className="prodcard__precio">
        <strong
          className="tabular"
          title={
            product.priceBs
              ? "Precio fijo en bolívares: este producto no sigue la tasa"
              : undefined
          }
        >
          {precioProducto(product.price, product.priceBs)}
        </strong>
        {!product.priceBs && rate > 0 && (
          <span className="dim tabular">{formatBs(product.price, rate)}</span>
        )}
      </div>

      <div className="prodcard__fila">
        <span className="prodcard__margen">
          Margen <b className="tabular">{calcularMargen(product.price, product.cost)} %</b>
        </span>
        {product.archived ? (
          <Badge>Archivado</Badge>
        ) : product.active ? (
          <Badge tone="success" icon="check">Activo</Badge>
        ) : (
          <Badge>Inactivo</Badge>
        )}
      </div>

      <div className="prodcard__pie">
        <span className="dim mono prodcard__sku">{product.sku}</span>
        <div className="row-actions">
          <button
            className="row-action"
            onClick={() => onEdit(product)}
            title="Editar"
            aria-label={`Editar ${product.name}`}
          >
            <Icon name="pencil" />
          </button>
          <button
            className="row-action"
            onClick={() => onArchive(product.id, !product.archived)}
            title={product.archived ? "Reactivar" : "Archivar"}
            aria-label={`${product.archived ? "Reactivar" : "Archivar"} ${product.name}`}
          >
            <Icon name={product.archived ? "arrowLeft" : "archive"} />
          </button>
          <button
            className="row-action row-action--danger"
            onClick={() => onRemove(product.id)}
            title="Eliminar"
            aria-label={`Eliminar ${product.name}`}
          >
            <Icon name="trash" />
          </button>
        </div>
      </div>
    </article>
  );
}

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
  const confirm = useConfirm();
  const removeCategoryConfirmado = useCallback(
    async (id: string) => {
      const ok = await confirm({
        title: "¿Eliminar la categoria?",
        message: "Los productos que la usan no se borran.",
        confirmText: "Eliminar",
        destructive: true,
      });
      if (ok) removeCategory(id);
    },
    [confirm, removeCategory]
  );
  const removeSurchargeConfirmado = useCallback(
    async (id: string) => {
      const ok = await confirm({
        title: "¿Eliminar el recargo?",
        message: "Dejara de aplicarse a las ventas nuevas.",
        confirmText: "Eliminar",
        destructive: true,
      });
      if (ok) removeSurcharge(id);
    },
    [confirm, removeSurcharge]
  );
  const removeDiscountConfirmado = useCallback(
    async (id: string) => {
      const ok = await confirm({
        title: "¿Eliminar el descuento?",
        message: "Dejara de aplicarse a las ventas nuevas.",
        confirmText: "Eliminar",
        destructive: true,
      });
      if (ok) removeDiscount(id);
    },
    [confirm, removeDiscount]
  );
  const removeProductConfirmado = useCallback(
    async (id: string) => {
      const ok = await confirm({
        title: "¿Eliminar el producto?",
        message: "Se borrara del catalogo y de tu inventario. Esta accion no se puede deshacer.",
        confirmText: "Eliminar",
        destructive: true,
      });
      if (ok) removeProduct(id);
    },
    [confirm, removeProduct]
  );

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

  /* Errores de validación por formulario. Nacen aquí porque el guardado
     anterior era un `return` a secas: faltaba el nombre, el botón no hacía
     nada y el cajero no tenía forma de saber por qué (medido en el lote de
     formularios). Un mapa por formulario para que "Nombre" del descuento no
     arrastre el error del producto. */
  const [errores, setErrores] = useState<{
    producto: Campos;
    descuento: Campos;
    recargo: Campos;
    categoria: Campos;
  }>({ producto: {}, descuento: {}, recargo: {}, categoria: {} });
  const limpiaError = (formulario: keyof typeof errores, campo: string) =>
    setErrores((e) => {
      if (!e[formulario][campo]) return e;
      return { ...e, [formulario]: { ...e[formulario], [campo]: "" } };
    });

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_PRODUCT });
    setErrores((e) => ({ ...e, producto: {} }));
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
      priceBs: p.priceBs ? String(p.priceBs) : "",
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
    setErrores((e) => ({ ...e, producto: {} }));
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
    const nuevos: Record<string, string> = {};
    if (!form.name.trim()) nuevos.name = "Escribe el nombre del producto.";
    const precio = Number(form.price);
    if (form.price.trim() !== "" && (!Number.isFinite(precio) || precio < 0)) {
      nuevos.price = "El precio no puede ser negativo.";
    }
    const costo = Number(form.cost);
    if (form.cost.trim() !== "" && (!Number.isFinite(costo) || costo < 0)) {
      nuevos.cost = "El costo no puede ser negativo.";
    }
    // Un precio en Bs que no equivale a nada con la tasa del día es dinero
    // mal anotado: mejor decirlo antes de guardar que vender a pérdida.
    const fijoBs = Number(form.priceBs);
    if (form.priceBs.trim() !== "" && (!Number.isFinite(fijoBs) || fijoBs < 0)) {
      nuevos.priceBs = "El precio fijo en Bs no puede ser negativo.";
    }
    if (Object.keys(nuevos).length > 0) {
      setErrores((e) => ({ ...e, producto: nuevos }));
      return;
    }
    setErrores((e) => ({ ...e, producto: {} }));
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
      // BLINK-104: precio fijo en Bs. Vacío o 0 = sin precio fijo (el producto
      // sigue anclado a la tasa); nunca se guarda un "Bs 0" que valdría gratis.
      priceBs: normalizePriceBs(form.priceBs),
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
    setErrores((e) => ({ ...e, categoria: {} }));
    setCatOpen(true);
  }

  function saveCategory() {
    if (!catForm.name.trim()) {
      setErrores((e) => ({ ...e, categoria: { name: "Escribe el nombre de la categoría." } }));
      return;
    }
    setErrores((e) => ({ ...e, categoria: {} }));
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
    setErrores((e) => ({ ...e, descuento: {} }));
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
    setErrores((e) => ({ ...e, descuento: {} }));
    setDiscOpen(true);
  };

  function saveDiscount() {
    const nuevos: Campos = {};
    if (!discForm.name.trim()) nuevos.name = "Escribe el nombre del descuento.";
    if (!discForm.code.trim()) nuevos.code = "Escribe el código que se aplica en el POS.";
    if (Object.keys(nuevos).length > 0) {
      setErrores((e) => ({ ...e, descuento: nuevos }));
      return;
    }
    setErrores((e) => ({ ...e, descuento: {} }));
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
    setErrores((e) => ({ ...e, recargo: {} }));
    setSurOpen(true);
  };

  const openEditSur = (s: Surcharge) => {
    setSurEditId(s.id);
    setSurForm({ name: s.name, type: s.type, value: String(s.value), active: s.active });
    setErrores((e) => ({ ...e, recargo: {} }));
    setSurOpen(true);
  };

  function saveSurcharge() {
    if (!surForm.name.trim()) {
      setErrores((e) => ({ ...e, recargo: { name: "Escribe el nombre del recargo." } }));
      return;
    }
    setErrores((e) => ({ ...e, recargo: {} }));
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
      <button className="btn btn--primary" onClick={openCreate}><Icon name="plus" /> 
        Nuevo producto
      </button>
    ) : tab === "Descuentos" ? (
      <button className="btn btn--primary" onClick={openCreateDisc}><Icon name="percent" /> 
        Nuevo descuento
      </button>
    ) : tab === "Recargos" ? (
      <button className="btn btn--primary" onClick={openCreateSur}><Icon name="percent" /> 
        Nuevo recargo
      </button>
    ) : tab === "Categorías" ? (
      <button className="btn btn--primary" onClick={openCreateCat}><Icon name="folder" /> 
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
              <button className="btn btn--soft btn--sm" onClick={openCreate}><Icon name="plus" /> 
                Nuevo producto
              </button>
            }
          />
        ) : (
          <div className="prodgrid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                rate={rate}
                onEdit={openEdit}
                onArchive={(id, archived) => updateProduct(id, { archived })}
                onRemove={removeProductConfirmado}
              />
            ))}
          </div>
        ))}

      {/* ---------------- Precios por canal ---------------- */}
      {tab === "Precios" && (
        <div className="stack gap-16">
          <Card
            title="Precios por canal"
            hint="Cambia el precio de un producto por canal. El canal predeterminado (*) también ajusta el precio base del producto."
          >
            <div className="form-group">
              <Field label="Canal">
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
              </Field>
              <Field
                label="Ajuste (%)"
                hint="Positivo sube el precio, negativo lo baja. Se aplica a todos los productos del canal."
              >
                <input
                  className="input"
                  type="number"
                  value={bulkPct}
                  onChange={(e) => setBulkPct(e.target.value)}
                />
              </Field>
            </div>
            <button
              className="btn btn--soft btn--sm"
              disabled={!bulkChannel || !(Number(bulkPct) || 0)}
              onClick={() => bulkPrice(Number(bulkPct) || 0, bulkChannel)}
            ><Icon name="percent" /> 
              Aplicar % al canal
            </button>
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
              <button className="btn btn--soft btn--sm" onClick={openCreateDisc}><Icon name="percent" /> 
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
                    onRemove={removeDiscountConfirmado}
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
              <button className="btn btn--soft btn--sm" onClick={openCreateSur}><Icon name="percent" /> 
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
                    onRemove={removeSurchargeConfirmado}
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
              <button className="btn btn--soft btn--sm" onClick={openCreateCat}><Icon name="folder" /> 
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
                    onRemove={removeCategoryConfirmado}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ))}

      {/* ================= Modales ================= */}

      {open && (
        <Modal
          title={editId ? "Editar producto" : "Nuevo producto"}
          onClose={() => setOpen(false)}
          footer={
            <button className="btn btn--primary btn--block" onClick={saveProduct}>
              <Icon name="check" />
              {editId ? "Guardar cambios" : "Guardar producto"}
            </button>
          }
        >
          {/* 1 · Qué es: identificación del producto */}
          <FormSection title="Producto">
            <div className="form-group">
              <Field label="Nombre" required hint="Se guarda en MAYÚSCULAS." error={errores.producto.name}>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    limpiaError("producto", "name");
                  }}
                />
              </Field>
              <Field label="Código de barras" hint="Escanea o genera un código interno.">
                <div className="row gap-8">
                  <input
                    className="input grow"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn--soft btn--sm btn--icono"
                    title="Escanear con la cámara"
                    aria-label="Escanear con la cámara"
                    onClick={() => setCamOpen(true)}
                  >
                    <Icon name="scan" />
                  </button>
                  <button
                    type="button"
                    className="btn btn--soft btn--sm btn--icono"
                    title="Generar código interno"
                    aria-label="Generar código interno"
                    onClick={() => setForm({ ...form, barcode: internalCode() })}
                  >
                    <Icon name="tag" />
                  </button>
                </div>
              </Field>
              {/* SKU y Categoría van DENTRO de la sección: eran parte de la
                  ficha del producto y colgaban fuera como dos campos huérfanos. */}
              <Field label="SKU" hint="Opcional.">
                <input
                  className="input"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
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
                  {form.category && !activeCategories.some((c) => c.name === form.category) && (
                    <option value={form.category}>{form.category}</option>
                  )}
                </select>
              </Field>
            </div>
          </FormSection>

          {/* 2 · Cuánto mide: cantidad + unidad (lista cerrada) */}
          <FormSection title="Presentación">
            <FieldRow>
              <Field label="Cantidad" hint="Va en mililitros, gramos o unidades.">
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
            </FieldRow>
            <Field label="Fabricante / marca" hint="Uso interno. No sale en el recibo.">
              <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </Field>
          </FormSection>

          {/* 3 · Cuánto cuesta: precios e impuesto */}
          <FormSection title="Precios e impuesto">
            <MoneyField
              label="Costo"
              value={form.cost}
              onChange={(v) => {
                setForm({ ...form, cost: v });
                limpiaError("producto", "cost");
              }}
              rate={rate}
              error={errores.producto.cost}
            />
            <MoneyField
              label="Precio"
              value={form.price}
              onChange={(v) => {
                setForm({ ...form, price: v });
                limpiaError("producto", "price");
              }}
              rate={rate}
              error={errores.producto.price}
            />
            <Field
              label="Precio fijo (Bs)"
              hint="Ancla el producto a estos Bs aunque cambie la tasa. Vacío = el precio se deriva de la tasa."
              error={errores.producto.priceBs}
            >
              <input
                className="input tabular"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.priceBs}
                onChange={(e) => {
                  setForm({ ...form, priceBs: e.target.value });
                  limpiaError("producto", "priceBs");
                }}
              />
            </Field>
            <FieldRow>
              <Field label="IVA">
                <select
                  className="select"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                >
                  <option value="0.16">16%</option>
                  <option value="0.08">8%</option>
                  <option value="0">Exento</option>
                </select>
              </Field>
              <Field label="Margen" hint={Number(form.price) > 0 ? undefined : "Necesita costo y precio."}>
                <span className="field__static">
                  {Number(form.price) > 0
                    ? `${calcularMargen(Number(form.price), Number(form.cost) || 0)}%`
                    : "—"}
                </span>
              </Field>
            </FieldRow>
            {channels.length > 0 && (
              <div className="field">
                <span className="field__label">Precios por canal (USD)</span>
                <FieldRow>
                  {channels.map((ch) => (
                    <Field
                      key={ch.id}
                      label={`${ch.name}${ch.isDefault ? " (predeterminado)" : ""}`}
                    >
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.channelPrices[ch.id] ?? ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            channelPrices: { ...form.channelPrices, [ch.id]: e.target.value },
                          })
                        }
                      />
                    </Field>
                  ))}
                </FieldRow>
              </div>
            )}
          </FormSection>

          {/* 4 · Inventario y estado */}
          <FormSection title="Inventario">
            <CheckField
              label="Control de inventario"
              checked={form.trackStock}
              onChange={(v) => setForm({ ...form, trackStock: v })}
            />
            {form.trackStock && (
              <FieldRow>
                <Field label="Stock">
                  <input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </Field>
                <Field label="Stock mínimo">
                  <input className="input" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
                </Field>
              </FieldRow>
            )}
            <CheckField
              label="Activo (disponible para vender)"
              checked={form.active}
              onChange={(v) => setForm({ ...form, active: v })}
            />
          </FormSection>
        </Modal>
      )}

      {camOpen && (
        <CameraScannerModal
          onScan={(code) => setForm((f) => ({ ...f, barcode: code }))}
          onClose={() => setCamOpen(false)}
        />
      )}

      {discOpen && (
        <Modal
          title={discEditId ? "Editar descuento" : "Nuevo descuento"}
          onClose={() => setDiscOpen(false)}
          footer={
            <button className="btn btn--primary btn--block" onClick={saveDiscount}>
              <Icon name="check" />
              {discEditId ? "Guardar cambios" : "Guardar descuento"}
            </button>
          }
        >
          <FormSection title="Descuento">
            <div className="form-group">
              <Field label="Nombre" required error={errores.descuento.name}>
                <input
                  className="input"
                  value={discForm.name}
                  onChange={(e) => {
                    setDiscForm({ ...discForm, name: e.target.value });
                    limpiaError("descuento", "name");
                  }}
                />
              </Field>
              <Field label="Código" required hint="Se guarda en MAYÚSCULAS." error={errores.descuento.code}>
                <input
                  className="input mono"
                  value={discForm.code}
                  onChange={(e) => {
                    setDiscForm({ ...discForm, code: e.target.value });
                    limpiaError("descuento", "code");
                  }}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Cómo se aplica">
            <FieldRow>
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
              <MoneyField
                label={discForm.type === "porcentaje" ? "Porcentaje" : "Monto"}
                usdLabel={discForm.type === "porcentaje" ? "%" : "USD"}
                value={discForm.value}
                onChange={(v) => setDiscForm({ ...discForm, value: v })}
                rate={rate}
                min={0}
                step={discForm.type === "porcentaje" ? 1 : 0.01}

              />
            </FieldRow>
            <Field label="Usos máximos" hint="Vacío = ilimitado.">
              <input
                className="input"
                type="number"
                min={0}
                step={1}
                value={discForm.maxUses}
                onChange={(e) => setDiscForm({ ...discForm, maxUses: e.target.value })}
              />
            </Field>
            <FieldRow>
              <Field label="Vigente desde" hint="Vacío = desde hoy.">
                <input className="input" type="date" value={discForm.from} onChange={(e) => setDiscForm({ ...discForm, from: e.target.value })} />
              </Field>
              <Field label="Vigente hasta" hint="Vacío = sin fecha final.">
                <input className="input" type="date" value={discForm.to} onChange={(e) => setDiscForm({ ...discForm, to: e.target.value })} />
              </Field>
            </FieldRow>
            <CheckField
              label="Activo"
              checked={discForm.active}
              onChange={(v) => setDiscForm({ ...discForm, active: v })}
            />
          </FormSection>
        </Modal>
      )}

      {surOpen && (
        <Modal
          title={surEditId ? "Editar recargo" : "Nuevo recargo"}
          onClose={() => setSurOpen(false)}
          footer={
            <button className="btn btn--primary btn--block" onClick={saveSurcharge}>
              <Icon name="check" />
              {surEditId ? "Guardar cambios" : "Guardar recargo"}
            </button>
          }
        >
          <FormSection title="Recargo">
            <div className="form-group">
              <Field label="Nombre" required hint="Nombre corto del recargo, tal como lo verás al cobrar." error={errores.recargo.name}>
                <input
                  className="input"
                  value={surForm.name}
                  onChange={(e) => {
                    setSurForm({ ...surForm, name: e.target.value });
                    limpiaError("recargo", "name");
                  }}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Cómo se aplica">
            <FieldRow>
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
              <MoneyField
                label={surForm.type === "porcentaje" ? "Porcentaje" : "Monto"}
                usdLabel={surForm.type === "porcentaje" ? "%" : "USD"}
                value={surForm.value}
                onChange={(v) => setSurForm({ ...surForm, value: v })}
                rate={rate}
                min={0}
                step={surForm.type === "porcentaje" ? 1 : 0.01}

              />
            </FieldRow>
            <CheckField
              label="Activo"
              checked={surForm.active}
              onChange={(v) => setSurForm({ ...surForm, active: v })}
            />
          </FormSection>
        </Modal>
      )}

      {catOpen && (
        <Modal
          title="Nueva categoría"
          onClose={() => setCatOpen(false)}
          footer={
            <button className="btn btn--primary btn--block" onClick={saveCategory}>
              <Icon name="check" />
              Guardar categoría
            </button>
          }
        >
          <FormSection title="Categoría">
            <div className="form-group">
              <Field label="Nombre" required hint="Nombre corto del grupo de productos." error={errores.categoria.name}>
                <input
                  className="input"
                  value={catForm.name}
                  onChange={(e) => {
                    setCatForm({ ...catForm, name: e.target.value });
                    limpiaError("categoria", "name");
                  }}
                />
              </Field>
              <Field label="Orden" hint="Menor número primero.">
                <input
                  className="input"
                  type="number"
                  min={0}
                  step={1}
                  value={catForm.order}
                  onChange={(e) => setCatForm({ ...catForm, order: e.target.value })}
                />
              </Field>
            </div>
            <CheckField
              label="Activa (disponible en el formulario de producto)"
              checked={catForm.active}
              onChange={(v) => setCatForm({ ...catForm, active: v })}
            />
          </FormSection>
        </Modal>
      )}
    </div>
  );
}
