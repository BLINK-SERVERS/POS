// Constructores de reportes para TODOS los conjuntos de datos exportables.
// Cada builder devuelve encabezados + filas (USD ya convertidos cuando aplica).
import type { AppState } from "./types";
import { round2 } from "./money";
import { isCountable, saleNet, saleTotal, accountUsd } from "./metrics";
import type { CsvCell } from "./export";

export interface Dataset {
  /** Clave corta para el nombre de archivo. */
  kind: string;
  /** Nombre visible en la interfaz. */
  label: string;
  headers: string[];
  rows: CsvCell[][];
}

const d = (iso: string) => (iso ? new Date(iso).toLocaleString("es") : "");

/** Convierte arrays de movimientos complejos a un solo nivel de filas. */
export function buildDatasets(state: AppState): Dataset[] {
  const rate = state.rate || 1;
  const accName = new Map(state.accounts.map((a) => [a.id, a.name]));
  const locName = new Map(state.locations.map((l) => [l.id, l.name]));
  const prodSku = new Map(state.products.map((p) => [p.id, p.sku || p.name]));

  const out: Dataset[] = [];

  // --- Productos / catálogo ---
  out.push({
    kind: "productos",
    label: "Productos (catálogo)",
    headers: [
      "Nombre", "Marca", "SKU", "Código", "Categoría", "Presentación", "Unidad",
      "Costo USD", "Precio USD", "Stock", "Mínimo", "Activo", "Archivado",
    ],
    rows: state.products.map((p) => [
      p.name, p.brand, p.sku, p.barcode, p.category || "—", p.presentationQty, p.unit,
      p.cost, p.price, p.stock, p.minStock, p.active, p.archived,
    ]),
  });

  // --- Contactos (clientes y proveedores) ---
  out.push({
    kind: "contactos",
    label: "Contactos (clientes/proveedores)",
    headers: ["Nombre", "Doc", "Tipo doc", "Teléfono", "Email", "Cliente", "Proveedor", "Crédito (días)", "Dirección", "Notas"],
    rows: state.contacts.map((c) => [
      c.name, c.document, c.docType || "—", c.phone, c.email, c.isClient, c.isProvider,
      c.creditDays, c.address, c.notes,
    ]),
  });

  // --- Ventas (resumen) ---
  out.push({
    kind: "ventas",
    label: "Ventas (resumen)",
    headers: ["Código", "Fecha", "Estado", "Cliente", "Método", "Base USD", "Descuento", "IVA", "Recargo", "IGTF", "Total USD", "Tasa", "Notas"],
    rows: state.sales.map((s) => [
      s.code, d(s.at), s.status, s.customerName || "—", s.paymentMethod || "—",
      round2(saleNet(s)), s.discount, s.tax, s.surcharge, s.igtf, round2(saleTotal(s)),
      s.rate || "—", s.notes,
    ]),
  });

  // --- Detalle de líneas de venta ---
  out.push({
    kind: "ventas-detalle",
    label: "Ventas (detalle por producto)",
    headers: ["Código venta", "Fecha", "Producto", "Cantidad", "Precio USD", "Costo USD", "Subtotal USD", "Margen USD"],
    rows: state.sales.flatMap((s) =>
      s.lines.map((l) => [
        s.code, d(s.at), l.name, l.qty, l.price, l.cost,
        round2(l.price * l.qty), round2((l.price - l.cost) * l.qty),
      ])
    ),
  });

  // --- Cuentas ---
  out.push({
    kind: "cuentas",
    label: "Cuentas (saldos)",
    headers: ["Cuenta", "Tipo", "Moneda", "Saldo", "Saldo USD", "Comisión entrada %", "Comisión salida %", "Activa"],
    rows: state.accounts.map((a) => [
      a.name, a.type, a.currency, a.balance, accountUsd(a.balance, a.currency, rate),
      a.commissionIn, a.commissionOut, a.active,
    ]),
  });

  // --- Libro de movimientos ---
  out.push({
    kind: "movimientos",
    label: "Movimientos (libro)",
    headers: ["Fecha", "Cuenta", "Dirección", "Monto USD", "Monto capturado", "Moneda", "Origen", "Nota"],
    rows: state.movements.map((m) => [
      d(m.at), accName.get(m.accountId) || m.accountId, m.direction, m.amountUsd,
      m.amountInput ?? "—", m.currency || "—", m.origin, m.note,
    ]),
  });

  // --- Transferencias ---
  out.push({
    kind: "transferencias",
    label: "Transferencias",
    headers: ["Fecha", "Desde", "Hacia", "Monto USD", "Comisión", "Nota"],
    rows: state.transfers.map((t) => [
      d(t.at), accName.get(t.fromId) || t.fromId, accName.get(t.toId) || t.toId,
      t.amountUsd, t.commission, t.note,
    ]),
  });

  // --- Pendientes (por cobrar / por pagar) ---
  out.push({
    kind: "pendientes",
    label: "Pendientes (cuenta corriente)",
    headers: ["Fecha", "Dirección", "Contacto", "Concepto", "Monto USD", "Abonado", "Saldo", "Vence", "Estado", "Nota"],
    rows: state.pendings.map((p) => [
      d(p.at), p.direction, p.contactName || "—", p.subject, p.amountUsd, p.paidUsd,
      round2(Math.max(0, p.amountUsd - p.paidUsd)), p.dueAt ? d(p.dueAt) : "—", p.status, p.note,
    ]),
  });

  // --- Gastos ---
  out.push({
    kind: "gastos",
    label: "Gastos",
    headers: ["Fecha", "Nombre", "Categoría", "Monto USD", "Recurrente", "Pagado", "Anulado", "Cuenta", "Nota"],
    rows: state.expenses.map((e) => [
      d(e.at), e.name, e.category || "—", e.amountUsd, e.recurring, e.paid, !!e.anulado,
      accName.get(e.accountId || "") || "—", e.note,
    ]),
  });

  // --- Gastos recurrentes ---
  out.push({
    kind: "gastos-recurrentes",
    label: "Gastos recurrentes",
    headers: ["Nombre", "Monto USD", "Frecuencia", "Próximo vencimiento", "Activo"],
    rows: state.recurringExpenses.map((r) => [
      r.name, r.amountUsd, r.frequency, d(r.firstDue), r.active,
    ]),
  });

  // --- Movimientos de inventario ---
  out.push({
    kind: "inventario-movimientos",
    label: "Inventario (kardex)",
    headers: ["Fecha", "Producto", "Tipo", "Cantidad", "Costo unit.", "Origen", "Ubicación", "Ref."],
    rows: state.inventoryMoves.map((m) => [
      d(m.at), m.productName || prodSku.get(m.productId) || m.productId, m.kind, m.qty,
      m.costUnit, m.origin, locName.get(m.locationId) || m.locationId, m.ref || "—",
    ]),
  });

  // --- Compras a proveedores ---
  out.push({
    kind: "compras",
    label: "Compras",
    headers: ["Fecha", "Proveedor", "Ubicación", "Método", "Cuenta", "Factura", "Total USD", "Ítems"],
    rows: state.purchases.map((p) => [
      d(p.at), p.supplierName || "—", locName.get(p.locationId) || p.locationId,
      p.paymentMethod, accName.get(p.accountId || "") || "—", p.invoiceNo || "—",
      p.totalUsd, p.lines.map((l) => `${l.name} ×${l.qty}`).join(" | "),
    ]),
  });

  // --- Devoluciones a proveedor ---
  out.push({
    kind: "devoluciones",
    label: "Devoluciones a proveedor",
    headers: ["Fecha", "Proveedor", "Total USD", "Motivo", "Ítems"],
    rows: state.stockReturns.map((r) => [
      d(r.at), r.supplierName || "—", r.totalUsd, r.reason,
      r.lines.map((l) => `${l.name} ×${l.qty}`).join(" | "),
    ]),
  });

  // --- Ajustes de inventario ---
  out.push({
    kind: "ajustes",
    label: "Ajustes de inventario",
    headers: ["Fecha", "Ubicación", "Motivo", "Nota", "Líneas"],
    rows: state.stockAdjustments.map((a) => [
      d(a.at), locName.get(a.locationId) || a.locationId, a.reason, a.note,
      a.lines.map((l) => `${l.name} (${l.qty > 0 ? "+" : ""}${l.qty})`).join(" | "),
    ]),
  });

  // --- Traslados ---
  out.push({
    kind: "traslados",
    label: "Traslados de mercancía",
    headers: ["Fecha", "Desde", "Hacia", "Nota", "Líneas"],
    rows: state.stockTransfers.map((t) => [
      d(t.at), locName.get(t.fromId) || t.fromId, locName.get(t.toId) || t.toId,
      t.note, t.lines.map((l) => `${l.name} ×${l.qty}`).join(" | "),
    ]),
  });

  // --- Cierres de caja ---
  out.push({
    kind: "cierres",
    label: "Cierres de caja",
    headers: ["Apertura", "Cierre", "Fondo USD", "Esperado USD", "Contado USD", "Diferencia USD", "Nota"],
    rows: state.cashClosures.map((c) => [
      d(c.openedAt), d(c.closedAt), c.openingUsd ?? "—", c.expectedUsd,
      c.countedUsd, c.differenceUsd, c.note,
    ]),
  });

  // --- Descuentos ---
  out.push({
    kind: "descuentos",
    label: "Descuentos",
    headers: ["Nombre", "Código", "Tipo", "Valor", "Usos máx.", "Usados", "Desde", "Hasta", "Activo"],
    rows: state.discounts.map((x) => [
      x.name, x.code, x.type, x.value, x.maxUses ?? "Ilimitado", x.used,
      x.from ? d(x.from) : "—", x.to ? d(x.to) : "—", x.active,
    ]),
  });

  // --- Recargos ---
  out.push({
    kind: "recargos",
    label: "Recargos",
    headers: ["Nombre", "Tipo", "Valor", "Activo"],
    rows: state.surcharges.map((s) => [s.name, s.type, s.value, s.active]),
  });

  // --- Impuestos ---
  out.push({
    kind: "impuestos",
    label: "Impuestos",
    headers: ["Nombre", "Tasa %", "Activo", "Predeterminado"],
    rows: state.taxes.map((t) => [t.name, round2(t.rate * 100), t.active, !!t.isDefault]),
  });

  // --- Configuración del negocio ---
  out.push({
    kind: "negocio",
    label: "Datos del negocio",
    headers: ["Campo", "Valor"],
    rows: [
      ["Nombre", state.business.name],
      ["Razón social", state.business.legalName],
      ["RIF", state.business.rif],
      ["Teléfono", state.business.phone],
      ["Dirección", state.business.address],
      ["Moneda", state.business.currency],
      ["Tasa BCV", rate],
      ["Título recibo", state.business.receiptTitle],
      ["Pie de recibo", state.business.receiptFooter],
      ["Formato impresión", state.business.printFormat],
    ],
  });

  // --- Categorías, canales y ubicaciones ---
  out.push({
    kind: "categorias",
    label: "Categorías",
    headers: ["Nombre", "Activa"],
    rows: state.categories.map((c) => [c.name, c.active]),
  });
  out.push({
    kind: "canales",
    label: "Canales de venta",
    headers: ["Nombre", "Descripción", "Predeterminado", "Activo"],
    rows: state.channels.map((c) => [c.name, c.description, c.isDefault, c.active]),
  });
  out.push({
    kind: "ubicaciones",
    label: "Ubicaciones",
    headers: ["Nombre", "Tipo", "Ventas por defecto", "Compras por defecto", "Activa"],
    rows: state.locations.map((l) => [l.name, l.type, l.defaultSales, l.defaultPurchases, l.active]),
  });

  return out;
}

/** Ventas netas del mes en curso (para el KPI de la pestaña). */
export function monthSalesCount(state: AppState): number {
  const m = new Date().getMonth();
  return state.sales.filter((s) => isCountable(s) && new Date(s.at).getMonth() === m).length;
}
