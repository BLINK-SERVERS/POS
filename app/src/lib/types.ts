// Tipos del dominio de BLINK POS (definiciones propias).

/** Módulos que BLINK habilita según el giro del comercio. */
export interface BusinessFeatures {
  inventory: boolean;
  providers: boolean;
  credit: boolean;
  expenses: boolean;
  reports: boolean;
}

export interface Business {
  name: string;
  legalName: string;
  rif: string;
  phone: string;
  address: string;
  currency: "USD" | "VES";
  /** Giro del comercio: define qué módulos se muestran. */
  type: string;
  features: BusinessFeatures;
  receiptTitle: string;
  receiptFooter: string;
  printFormat: "58mm" | "80mm" | "carta";
  /** Datos que se muestran en el recibo. */
  receiptFields: {
    legalName: boolean;
    rif: boolean;
    address: boolean;
    phone: boolean;
    customer: boolean;
    sku: boolean;
    totalBs: boolean;
    rate: boolean;
    notes: boolean;
  };
}

/** Impuesto configurable (tasa como fracción: 0.16 = 16 %). */
export interface Tax {
  id: string;
  name: string;
  rate: number;
  active: boolean;
  system?: boolean; // p. ej. IVA/IGTF del sistema: no desactivable
  isDefault?: boolean; // impuesto predeterminado del comercio
}

/** Categoría de producto (agrupa el catálogo). */
export interface Category {
  id: string;
  name: string;
  active: boolean;
  order: number;
}

/** Canal de venta (los precios por canal se configuran en Catálogo). */
export interface Channel {
  id: string;
  name: string;
  description: string;
  active: boolean;
  isDefault: boolean;
}

/** Ubicación física; cada una lleva su propio inventario. */
export interface Location {
  id: string;
  name: string;
  type: "deposito" | "nevera" | "tienda";
  active: boolean;
  defaultSales: boolean;
  defaultPurchases: boolean;
}

export interface Product {
  id: string;
  name: string;
  /** Fabricante/marca: uso interno, nunca sale en el recibo. */
  brand: string;
  sku: string;
  barcode: string;
  /** Cantidad de medida de la presentación (ej.: 500 en "500 g"). */
  presentationQty: number;
  /** Unidad de medida, de la lista cerrada `UNIT_OPTIONS`. */
  unit: string;
  cost: number; // en USD (costo promedio)
  price: number; // en USD (canal predeterminado)
  /** Precio por canal (id de canal → USD). El canal predeterminado usa `price`. */
  channelPrices: Record<string, number>;
  category: string; // nombre de la categoría ("" = sin categoría)
  taxRate: number; // fracción de IVA (por producto)
  active: boolean;
  archived: boolean;
  trackStock: boolean;
  stock: number;
  minStock: number;
}

/** Unidades de medida normalizadas (lista cerrada, sin texto libre). */
export const UNIT_OPTIONS = [
  "unidad",
  "kg",
  "g",
  "mg",
  "L",
  "ml",
  "pack",
] as const;

export type UnitOption = (typeof UNIT_OPTIONS)[number];

export interface Contact {
  id: string;
  name: string;
  document: string;
  docType: string; // "" | "V" | "E" | "J" | "RIF"
  phone: string;
  email: string;
  isClient: boolean;
  isProvider: boolean;
  creditDays: number;
  address: string;
  notes: string;
}

export interface SaleLine {
  productId: string;
  name: string;
  /** Presentación para imprimir (ej.: "500 g"). Solo etiqueta. */
  presentation?: string;
  qty: number;
  price: number; // USD
  cost: number; // USD
  taxRate: number; // fracción
  note?: string;
}

/**
 * Etiqueta de presentación de un producto (ej.: "500 g", "1 unidad").
 * Se deriva de `presentationQty` + `unit` y solo se usa para imprimir.
 */
export function presentationLabel(p: Pick<Product, "presentationQty" | "unit">): string {
  const qty = Number(p.presentationQty) || 0;
  const unit = p.unit || "";
  if (qty > 0 && unit) return `${qty} ${unit}`;
  return unit || "";
}

export type SaleStatus = "cobrada" | "credito" | "anulada" | "cotizacion";

/** Cobro parcial o total de una venta (permite combinar métodos). */
export interface SalePayment {
  method: string; // nombre de cuenta o "A crédito"
  accountId?: string;
  amountUsd: number;
  currency: "USD" | "VES";
  amountInput?: number; // lo que se tecleó, en la moneda del cobro
  amountReceived?: number; // lo que entregó el cliente si pagó con exceso
  change?: number; // vuelto en la moneda del cobro
  reference?: string;
  commission?: number; // USD (comisión de la cuenta)
  /** Monto realmente acreditado a la cuenta, en su moneda nativa. */
  creditedNative?: number;
  igtf?: number; // IGTF 3 % cuando se cobra en dólares
}

export interface Sale {
  id: string;
  code: string;
  at: string; // ISO
  lines: SaleLine[];
  status: SaleStatus;
  discount: number; // USD (monto, sobre base antes de IVA)
  discountId?: string;
  discountCode?: string;
  surcharge: number; // USD (recargos sumados)
  surchargeIds?: string[];
  tax: number; // USD (IVA total)
  igtf: number; // USD (total IGTF de cobros en USD)
  notes: string;
  payments: SalePayment[];
  customerId?: string;
  customerName?: string;
  paymentMethod?: string; // resumen del/los métodos
  channelId?: string;
  locationId?: string;
  userId: string;
  rate?: number; // Tasa BCV aplicada al momento de la venta
  amountReceived?: number; // Total entregado por el cliente en USD
  changeUsd?: number; // Vuelto entregado en USD
  changeBs?: number; // Vuelto entregado en Bs
  voidedAt?: string;
  voidReason?: string;
}

export interface Account {
  id: string;
  name: string;
  type: "efectivo" | "banco" | "pago_movil";
  currency: "USD" | "VES";
  balance: number;
  commissionIn: number; // % al recibir
  commissionOut: number; // % al enviar
  /** Participa en el arqueo/cierre de caja. Por defecto sí. */
  inCashClose?: boolean;
  active: boolean;
}

/** Estado del asistente de configuración inicial. */
export interface Onboarding {
  completed: boolean;
  /** Último paso alcanzado (por si se recarga a mitad del asistente). */
  step?: number;
}

/** Asiento del libro de movimientos de cuentas. */
export interface Movement {
  id: string;
  at: string;
  accountId: string;
  direction: "entrada" | "salida";
  amountUsd: number; // equivalente en USD (libro consolidado)
  /** Moneda de la cuenta al momento del asiento (para arqueo multimoneda). */
  currency?: "USD" | "VES";
  /** Monto en la moneda nativa de la cuenta (la que realmente entró/salió). */
  amountInput?: number;
  origin: string; // Venta / Ajuste / Gasto / Compra / Transferencia / Abono
  note: string;
  userId: string;
}

/** Transferencia entre cuentas. */
export interface Transfer {
  id: string;
  at: string;
  fromId: string;
  toId: string;
  amountUsd: number;
  commission: number;
  note: string;
  userId: string;
  correctionOf?: string; // id de la transferencia corregida
}

/** Pendiente por cobrar o por pagar (cuenta corriente). */
export interface Pending {
  id: string;
  at: string;
  direction: "cobrar" | "pagar";
  contactId?: string;
  contactName?: string;
  subject: string;
  amountUsd: number;
  paidUsd: number;
  dueAt?: string;
  note: string;
  status: "abierto" | "parcial" | "saldado" | "anulado";
}

/** Descuento por código, aplicable al cobrar. */
export interface Discount {
  id: string;
  name: string;
  code: string; // se guarda en MAYÚSCULAS
  type: "porcentaje" | "monto";
  value: number; // % (0-100) o monto USD
  maxUses: number | null; // null = ilimitado
  used: number;
  from?: string;
  to?: string;
  active: boolean;
}

/** Recargo (delivery, servicio de mesero, otros). */
export interface Surcharge {
  id: string;
  name: string;
  type: "porcentaje" | "monto";
  value: number;
  active: boolean;
}

/** Categoría de gasto. */
export interface ExpenseCategory {
  id: string;
  name: string;
  active: boolean;
  system?: boolean; // p. ej. "Pago de impuestos (IVA/IGTF)"
}

export interface Expense {
  id: string;
  at: string;
  name: string;
  category: string; // nombre de la categoría
  note: string;
  amountUsd: number;
  recurring: boolean;
  paid: boolean;
  anulado?: boolean;
  accountId?: string;
  paidAt?: string;
}

/** Gasto recurrente: al vencer genera un gasto pendiente (no mueve dinero). */
export interface RecurringExpense {
  id: string;
  name: string;
  categoryId: string;
  amountUsd: number;
  frequency: "mensual";
  firstDue: string; // ISO (día del mes)
  active: boolean;
  lastGenerated?: string; // ISO del último pendiente creado
}

/** Asiento del libro de inventario (entradas y salidas). */
export interface InventoryMove {
  id: string;
  at: string;
  productId: string;
  productName: string;
  kind: "entrada" | "salida";
  qty: number;
  costUnit: number;
  origin: string; // Venta #000001 / Compra / Ajuste / Traslado / Devolución / Apertura
  locationId: string;
  ref?: string;
  userId: string;
}

export interface PurchaseLine {
  productId: string;
  name: string;
  qty: number;
  costUnit: number;
}

/** Compra a proveedor: entra mercancía y sale dinero (o queda por pagar). */
export interface Purchase {
  id: string;
  at: string;
  supplierId?: string;
  supplierName: string;
  locationId: string;
  paymentMethod: "efectivo" | "cuenta" | "credito";
  accountId?: string;
  invoiceNo?: string;
  lines: PurchaseLine[];
  totalUsd: number;
  userId: string;
}

/** Devolución a proveedor. */
export interface StockReturn {
  id: string;
  at: string;
  supplierId?: string;
  supplierName: string;
  locationId: string;
  lines: PurchaseLine[];
  totalUsd: number;
  reason: string;
  userId: string;
}

/** Ajuste de inventario (documento de corrección). */
export interface StockAdjustment {
  id: string;
  at: string;
  locationId: string;
  reason: string;
  note: string;
  lines: { productId: string; name: string; qty: number; costUnit: number }[];
  userId: string;
}

/** Traslado de mercancía entre ubicaciones. */
export interface StockTransfer {
  id: string;
  at: string;
  fromId: string;
  toId: string;
  lines: { productId: string; name: string; qty: number }[];
  note: string;
  userId: string;
}

export interface CashSession {
  openedAt: string;
  openingUsd: number;
  openingBs: number;
  userId: string;
  locationId: string;
}

/** Registro de cierre de caja (arqueo). */
export interface CashClosure {
  id: string;
  openedAt: string;
  closedAt: string;
  userId: string;
  locationId: string;
  /** Fondo inicial del turno (opcional: cierres previos a su registro no lo tienen). */
  openingUsd?: number;
  openingBs?: number;
  countedUsd: number;
  countedBs: number;
  expectedUsd: number;
  expectedBs: number;
  differenceUsd: number;
  differenceBs: number;
  note: string;
}

export interface AppState {
  business: Business;
  rate: number; // Bs por USD (tasa de referencia)
  rateUpdatedAt: string;
  taxes: Tax[];
  categories: Category[];
  channels: Channel[];
  locations: Location[];
  products: Product[];
  contacts: Contact[];
  sales: Sale[];
  accounts: Account[];
  movements: Movement[];
  transfers: Transfer[];
  pendings: Pending[];
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  expenseCategories: ExpenseCategory[];
  discounts: Discount[];
  surcharges: Surcharge[];
  inventoryMoves: InventoryMove[];
  purchases: Purchase[];
  stockReturns: StockReturn[];
  stockAdjustments: StockAdjustment[];
  stockTransfers: StockTransfer[];
  cashSession: CashSession | null;
  cashClosures: CashClosure[];
  openTabs: Sale[]; // cuentas abiertas del POS
  onboarding: Onboarding;
}
