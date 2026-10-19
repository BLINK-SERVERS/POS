// Estado global de la aplicación + persistencia (local y en Supabase).
//
// Optimizaciones de rendimiento y escalabilidad:
//  · STORE EXTERNO observable expuesto con `useSyncExternalStore`. Permite
//    suscripciones POR SELECTOR (`useStoreSelector`): un componente que solo
//    usa `state.products` no se re-renderiza cuando cambia `cashSession`, etc.
//  · Contexto de ACCIONES separado → despachar no provoca re-render.
//  · Persistencia en localStorage con *debounce* (evita escrituras síncronas
//    en cada tecla/clic) y volcado garantizado al cerrar/ocultar la pestaña.
//  · Sincronización entre pestañas (estado y sesión) vía el evento `storage`.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type {
  Account,
  AppState,
  Business,
  BusinessFeatures,
  CashClosure,
  CashSession,
  Category,
  Channel,
  Contact,
  Discount,
  Expense,
  ExpenseCategory,
  InventoryMove,
  Location,
  Movement,
  Pending,
  Product,
  Purchase,
  RecurringExpense,
  Sale,
  SaleLine,
  SalePayment,
  StockAdjustment,
  StockReturn,
  StockTransfer,
  Surcharge,
  Tax,
  Transfer,
} from "./types";
import { UNIT_OPTIONS } from "./types";
import { round2 } from "./money";
import { cachedRate, fetchOfficialRate, isCacheFresh } from "./exchange";
import { expectedCash } from "./metrics";
import {
  authResendCode,
  authResetPassword,
  authSendDeviceCode,
  authSignIn,
  authSignOut,
  authSignUp,
  authUpdatePassword,
  authUpdateProfile,
  authVerifyCode,
  authVerifyLoginCode,
  cloudLoadBusiness,
  cloudSaveBusiness,
  userFromSession,
  type SessionUser,
} from "./cloud";
import { supabase, consumeLinkAuthType } from "./supabase";
// TEMP-BYPASS (pruebas manuales sin cuenta) — se retira con el archivo bypass.ts.
import { isBypassActive, bypassUser, clearBypass } from "./bypass";

const STORAGE_KEY = "blink-pos-state-v3";
const LEGACY_KEYS = ["blink-pos-state-v1", "blink-pos-state-v2", "blink-pos-auth-v1"];
const WRITE_DELAY = 250;

/**
 * Nombre del usuario de la sesión para firmar movimientos.
 * Se rellena desde el perfil autenticado; "Dueño" es el respaldo neutro.
 */
export let USER = "Dueño";

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

// ------------------------------------------------------------------
// Estado inicial vacío. No hay datos ficticios: el comercio lo llena
// el usuario durante el alta guiada (onboarding).
// ------------------------------------------------------------------
export const DEFAULT_FEATURES: BusinessFeatures = {
  inventory: true,
  providers: true,
  credit: true,
  expenses: true,
  reports: true,
};

function emptyState(): AppState {
  const canalPrincipal: Channel = {
    id: "ch_principal",
    name: "Principal",
    description: "",
    active: true,
    isDefault: true,
  };
  const locPrincipal: Location = {
    id: "loc_principal",
    name: "Principal",
    type: "tienda",
    active: true,
    defaultSales: true,
    defaultPurchases: true,
  };
  const iva: Tax = { id: "tax_iva", name: "IVA 16%", rate: 0.16, active: true, isDefault: true };
  const exento: Tax = { id: "tax_0", name: "Exento", rate: 0, active: true };
  // Categorías de gasto estándar (estructura del sistema, no datos del usuario).
  const cats: ExpenseCategory[] = [
    "Alquiler",
    "Compra de productos e insumos",
    "Gastos administrativos",
    "Mantenimiento y reparaciones",
    "Mercadeo y publicidad",
    "Muebles, equipos y maquinaria",
    "Nómina",
    "Otros",
    "Servicios públicos",
    "Transporte y logística",
  ].map((name, i) => ({ id: `ecat_${i}`, name, active: true }));
  cats.push({
    id: "ecat_sys",
    name: "Pago de impuestos (IVA/IGTF)",
    active: true,
    system: true,
  });

  return {
    business: {
      name: "",
      legalName: "",
      rif: "",
      phone: "",
      address: "",
      currency: "USD",
      type: "",
      features: { ...DEFAULT_FEATURES },
      receiptTitle: "",
      receiptFooter: "",
      printFormat: "80mm",
      receiptFields: {
        legalName: false,
        rif: false,
        address: false,
        phone: false,
        customer: true,
        sku: false,
        totalBs: true,
        rate: true,
        notes: true,
      },
    },
    rate: 0,
    rateUpdatedAt: "",
    taxes: [iva, exento],
    categories: [],
    channels: [canalPrincipal],
    locations: [locPrincipal],
    products: [],
    contacts: [],
    sales: [],
    accounts: [],
    movements: [],
    transfers: [],
    pendings: [],
    expenses: [],
    recurringExpenses: [],
    expenseCategories: cats,
    discounts: [],
    surcharges: [],
    inventoryMoves: [],
    purchases: [],
    stockReturns: [],
    stockAdjustments: [],
    stockTransfers: [],
    cashSession: null,
    cashClosures: [],
    openTabs: [],
    onboarding: { completed: false },
  };
}

/** Rellena arrays y campos nuevos para datos guardados con una versión previa. */
function normalize(base: AppState, raw: Partial<AppState>): AppState {
  const merged: AppState = { ...base, ...raw, business: { ...base.business, ...raw.business } };
  // Campos añadidos después de la v1.
  merged.categories ??= base.categories;
  merged.channels ??= base.channels;
  merged.locations ??= base.locations;
  merged.inventoryMoves ??= [];
  merged.purchases ??= [];
  merged.stockReturns ??= [];
  merged.stockAdjustments ??= [];
  merged.stockTransfers ??= [];
  merged.sales ??= [];
  merged.movements ??= [];
  merged.transfers ??= [];
  merged.pendings ??= [];
  merged.expenses ??= [];
  merged.recurringExpenses ??= [];
  merged.expenseCategories ??= base.expenseCategories;
  merged.discounts ??= base.discounts;
  merged.surcharges ??= base.surcharges;
  merged.cashClosures ??= [];
  merged.business.receiptFields ??= base.business.receiptFields;
  merged.business.features = { ...DEFAULT_FEATURES, ...(raw.business?.features ?? {}) };
  merged.business.type ??= "";
  merged.onboarding ??= base.onboarding;
  merged.accounts = (merged.accounts ?? []).map((a) => ({
    ...a,
    inCashClose: a.inCashClose ?? true,
  }));
  merged.products = (merged.products ?? []).map((p) => {
    // Migración de esquema (Fase B): se elimina `type` y se normaliza la
    // presentación a cantidad + unidad de la lista cerrada.
    const legacy = p as typeof p & { type?: "simple" | "servicio" };
    const unit = UNIT_OPTIONS.includes(legacy.unit as (typeof UNIT_OPTIONS)[number])
      ? legacy.unit
      : "unidad";
    return {
      ...p,
      brand: p.brand ?? "",
      archived: p.archived ?? false,
      channelPrices: p.channelPrices ?? { ch_principal: p.price },
      presentationQty: p.presentationQty ?? 1,
      unit,
      trackStock: legacy.type === "servicio" ? false : (p.trackStock ?? true),
    };
  });
  merged.contacts = (merged.contacts ?? []).map((c) => {
    const legacy = c as Contact & { kind?: "cliente" | "proveedor" | "ambos" };
    return {
      ...c,
      isClient: c.isClient ?? (legacy.kind ? legacy.kind !== "proveedor" : true),
      isProvider: c.isProvider ?? (legacy.kind ? legacy.kind !== "cliente" : false),
    };
  });
  merged.expenses = (merged.expenses ?? []).map((e) => ({
    ...e,
    name: e.name ?? e.category,
    anulado: e.anulado ?? false,
  }));
  merged.sales = (merged.sales ?? []).map((s) => ({
    ...s,
    userId: s.userId ?? USER,
    lines: Array.isArray(s.lines) ? s.lines : [],
    payments: Array.isArray(s.payments) ? s.payments : [],
    status: s.status ?? "cobrada",
    discount: s.discount ?? 0,
    surcharge: s.surcharge ?? 0,
    tax: s.tax ?? 0,
    igtf: s.igtf ?? 0,
  }));
  merged.pendings = (merged.pendings ?? []).map((p) => ({
    ...p,
    contactName: p.contactName ?? merged.contacts.find((c) => c.id === p.contactId)?.name,
  }));
  merged.taxes = (merged.taxes ?? []).map((t, i) => ({
    ...t,
    isDefault: t.isDefault ?? (i === 0),
  }));
  if (!merged.taxes.some((t) => t.isDefault) && merged.taxes.length) {
    merged.taxes[0] = { ...merged.taxes[0], isDefault: true };
  }
  return merged;
}

function load(): AppState {
  const base = emptyState();
  try {
    // Limpia claves antiguas (versiones con datos ficticios).
    for (const k of LEGACY_KEYS) localStorage.removeItem(k);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(base, JSON.parse(raw) as Partial<AppState>);
  } catch {
    /* datos corruptos: se regenera */
  }
  return base;
}

/** Descarga una copia del estado actual como JSON (rescate si falla el guardado). */
function downloadStateBackup(): void {
  try {
    const blob = new Blob([JSON.stringify(currentState, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blink-pos-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    /* sin soporte de descarga */
  }
}

// ------------------------------------------------------------------
// Store externo (fuente única de verdad, independiente de React)
// ------------------------------------------------------------------
let currentState: AppState = load();
let currentAuthed = false;
let currentUser: SessionUser | null = null;
/** true hasta que se resuelve la sesión y se carga el comercio remoto. */
let booting = true;
/** true cuando ya se cargó (o creó) el comercio remoto; evita pisarlo. */
let hydrated = false;
/** true cuando el equipo ya está verificado por código (o es de confianza). */
let currentDeviceVerified = false;

// --- Equipos de confianza -----------------------------------------
// El usuario puede marcar «Confiar en este dispositivo» para no volver a
// pedir el código al entrar. Los equipos de confianza se guardan de forma
// permanente (localStorage); la verificación de un solo uso (tras escribir
// el código) dura lo que dure la pestaña (sessionStorage).
const TRUSTED_KEY = "blink-pos-trusted-devices";
const VERIFIED_KEY = "blink-pos-device-verified";

function safeStorage(kind: "local" | "session"): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}
const localStore = safeStorage("local");
const sessionStore = safeStorage("session");

function readIds(store: Storage | null, key: string): Set<string> {
  try {
    const raw = store?.getItem(key);
    if (!raw) return new Set();
    const arr: unknown = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}
function writeIds(store: Storage | null, key: string, ids: Set<string>): void {
  try {
    store?.setItem(key, JSON.stringify([...ids]));
  } catch {
    /* almacenamiento no disponible */
  }
}

const trustedIds = readIds(localStore, TRUSTED_KEY);
const verifiedIds = readIds(sessionStore, VERIFIED_KEY);

export function isVerifiedDevice(userId: string | null | undefined): boolean {
  return !!userId && (trustedIds.has(userId) || verifiedIds.has(userId));
}
function trustDevice(userId: string): void {
  trustedIds.add(userId);
  writeIds(localStore, TRUSTED_KEY, trustedIds);
}
function markVerified(userId: string): void {
  if (!verifiedIds.has(userId)) {
    verifiedIds.add(userId);
    writeIds(sessionStore, VERIFIED_KEY, verifiedIds);
  }
  setDeviceVerified(true);
}
function clearSessionVerified(): void {
  if (verifiedIds.size) {
    verifiedIds.clear();
    writeIds(sessionStore, VERIFIED_KEY, verifiedIds);
  }
  setDeviceVerified(false);
}

/** Si el usuario llegó abriendo un enlace de verificación del correo, marcamos
 *  el equipo como verificado (así el enlace también sirve como verificación). */
function applyEmailLinkVerification(userId: string | null | undefined): boolean {
  if (!userId) return false;
  const type = consumeLinkAuthType();
  if (!type) return false;
  markVerified(userId);
  return true;
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(): void {
  for (const listener of listeners) listener();
}

function getState(): AppState {
  return currentState;
}

function getAuthed(): boolean {
  return currentAuthed;
}

function getUser(): SessionUser | null {
  return currentUser;
}

function getBooting(): boolean {
  return booting;
}

function getDeviceVerified(): boolean {
  return currentDeviceVerified;
}

function setDeviceVerified(value: boolean): void {
  if (value === currentDeviceVerified) return;
  currentDeviceVerified = value;
  emit();
}

function setAppState(next: AppState | ((s: AppState) => AppState)): void {
  const value =
    typeof next === "function" ? (next as (s: AppState) => AppState)(currentState) : next;
  if (Object.is(value, currentState)) return;
  currentState = value;
  emit();
}

function setAuthed(value: boolean): void {
  if (value === currentAuthed) return;
  currentAuthed = value;
  emit();
}

function setUser(value: SessionUser | null): void {
  currentUser = value;
  USER = value
    ? [value.firstName, value.lastName].filter(Boolean).join(" ").trim() || value.email
    : "";
  emit();
}

function setBooting(value: boolean): void {
  if (value === booting) return;
  booting = value;
  emit();
}

/**
 * Suscripción a una porción del estado con comparación configurable.
 * El componente solo se re-renderiza si el valor seleccionado cambia.
 */
export function useStoreSelector<T>(
  selector: (state: AppState) => T,
  isEqual: (a: T, b: T) => boolean = Object.is
): T {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  const isEqualRef = useRef(isEqual);
  isEqualRef.current = isEqual;
  const cache = useRef<{ state: AppState; value: T } | null>(null);

  const getSnapshot = useCallback((): T => {
    const state = currentState;
    const cached = cache.current;
    if (cached && cached.state === state) return cached.value;
    const next = selectorRef.current(state);
    if (cached && isEqualRef.current(cached.value, next)) {
      cache.current = { state, value: cached.value };
      return cached.value;
    }
    cache.current = { state, value: next };
    return next;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// ------------------------------------------------------------------
// Helpers internos de negocio
// ------------------------------------------------------------------
function inventoryMove(
  p: { id: string; name: string },
  kind: InventoryMove["kind"],
  qty: number,
  costUnit: number,
  origin: string,
  locationId: string,
  at: string,
  ref?: string
): InventoryMove {
  return {
    id: uid("imv"),
    at,
    productId: p.id,
    productName: p.name,
    kind,
    qty: round2(qty),
    costUnit: round2(costUnit),
    origin,
    locationId,
    ref,
    userId: USER,
  };
}

/** Aplica una comisión porcentual y devuelve el neto. */
function commission(base: number, pct: number): number {
  return round2((base * (pct || 0)) / 100);
}

/** Convierte un monto en USD a la moneda nativa de la cuenta. */
function toNative(usd: number, currency: "USD" | "VES", rate: number): number {
  return currency === "USD" ? round2(usd) : round2(usd * (rate || 1));
}

/** Convierte un monto en la moneda nativa de la cuenta a USD. */
function toUsd(native: number, currency: "USD" | "VES", rate: number): number {
  return currency === "USD" ? round2(native) : round2(native / (rate || 1));
}

// ------------------------------------------------------------------
// Contextos y provider
// ------------------------------------------------------------------
type StoreState = {
  state: AppState;
  authed: boolean;
  user: SessionUser | null;
  booting: boolean;
  /** true cuando el equipo está verificado (de confianza o con código). */
  deviceVerified: boolean;
};

export interface CheckoutInput {
  lines: SaleLine[];
  customerId?: string;
  discount: number;
  discountId?: string;
  surcharge: number;
  surchargeIds?: string[];
  tax: number;
  notes: string;
  payments: SalePayment[];
  quote?: boolean;
  channelId?: string;
  locationId?: string;
  amountReceived?: number;
  changeUsd?: number;
  changeBs?: number;
}

export interface PurchaseInput {
  supplierId?: string;
  supplierName: string;
  locationId: string;
  paymentMethod: "efectivo" | "cuenta" | "credito";
  accountId?: string;
  invoiceNo?: string;
  at?: string;
  lines: { productId: string; qty: number; costUnit: number }[];
}

type StoreActions = {
  // Autenticación (Supabase). Devuelven un mensaje de error o null si fue bien.
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) => Promise<string | null>;
  verifyEmail: (email: string, code: string, trust?: boolean) => Promise<string | null>;
  resendCode: (email: string) => Promise<string | null>;
  /** Envía un código de acceso al correo (verificación del equipo al entrar). */
  sendDeviceCode: (email: string) => Promise<string | null>;
  /** Verifica el código de acceso del equipo. */
  verifyDevice: (email: string, code: string, trust?: boolean) => Promise<string | null>;
  /** Envía el enlace de recuperación de contraseña al correo. */
  resetPassword: (email: string) => Promise<string | null>;
  /** Establece la nueva contraseña (con sesión de recuperación activa). */
  updatePassword: (newPassword: string) => Promise<string | null>;
  updateProfile: (input: {
    firstName: string;
    lastName: string;
    phone: string;
  }) => Promise<string | null>;
  // Catálogo
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  setStock: (id: string, stock: number) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  addChannel: (c: Omit<Channel, "id">) => void;
  updateChannel: (id: string, patch: Partial<Channel>) => void;
  removeChannel: (id: string) => void;
  addLocation: (l: Omit<Location, "id">) => void;
  updateLocation: (id: string, patch: Partial<Location>) => void;
  removeLocation: (id: string) => void;
  setChannelPrice: (productId: string, channelId: string, price: number) => void;
  bulkPrice: (pct: number, channelId: string) => void;
  // Contactos
  addContact: (c: Omit<Contact, "id">) => void;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  removeContact: (id: string) => void;
  // Ventas
  checkout: (input: CheckoutInput) => Sale;
  voidSale: (id: string, reason: string) => void;
  // Caja
  openCash: (openingUsd: number, openingBs: number) => void;
  closeCash: (countedUsd: number, countedBs: number, note: string) => void;
  // Finanzas
  addAccount: (a: Omit<Account, "id">) => void;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  moveAccount: (accountId: string, delta: number, note: string) => void;
  adjustAccount: (accountId: string, newBalance: number, motive: string, note: string) => void;
  transfer: (fromId: string, toId: string, amountUsd: number, commission: number, note: string) => void;
  transferBetween: (fromId: string, toId: string, amountUsd: number, commission: number) => void;
  // Gastos
  addExpense: (e: Omit<Expense, "id" | "at"> & { at?: string }) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  payExpense: (id: string, accountId: string, note: string) => void;
  voidExpense: (id: string) => void;
  addRecurringExpense: (r: Omit<RecurringExpense, "id">) => void;
  removeRecurringExpense: (id: string) => void;
  runRecurring: () => void;
  addExpenseCategory: (name: string) => void;
  updateExpenseCategory: (id: string, patch: Partial<ExpenseCategory>) => void;
  // Pendientes
  addPending: (p: Omit<Pending, "id" | "at" | "paidUsd" | "status">) => void;
  abonoPending: (id: string, accountId: string, amountUsd: number, note: string) => void;
  voidPending: (id: string) => void;
  // Impuestos / descuentos / recargos
  addTax: (t: Omit<Tax, "id">) => void;
  updateTax: (id: string, patch: Partial<Tax>) => void;
  setDefaultTax: (id: string) => void;
  addDiscount: (d: Omit<Discount, "id" | "used">) => void;
  updateDiscount: (id: string, patch: Partial<Discount>) => void;
  removeDiscount: (id: string) => void;
  addSurcharge: (s: Omit<Surcharge, "id">) => void;
  updateSurcharge: (id: string, patch: Partial<Surcharge>) => void;
  removeSurcharge: (id: string) => void;
  // Inventario
  addPurchase: (p: PurchaseInput) => void;
  addStockReturn: (input: {
    supplierId?: string;
    supplierName: string;
    locationId: string;
    reason: string;
    lines: { productId: string; qty: number; costUnit: number }[];
  }) => void;
  addStockAdjustment: (input: {
    locationId: string;
    reason: string;
    note: string;
    lines: { productId: string; qty: number }[];
  }) => void;
  addStockTransfer: (input: {
    fromId: string;
    toId: string;
    note: string;
    lines: { productId: string; qty: number }[];
  }) => void;
  // Ajustes
  updateBusiness: (patch: Partial<Business>) => void;
  setRate: (rate: number) => void;
  /**
   * Sincroniza la tasa oficial desde la API pública y la aplica si es válida.
   * Nunca lanza: devuelve el resultado para que la UI informe sin romper nada.
   */
  syncRate: () => Promise<"ok" | "cached" | "error">;
  /** Marca el alta guiada como terminada. */
  completeOnboarding: () => void;
  /** Borra todos los datos del comercio y vuelve al alta. */
  clearAll: () => void;
  /** Reintenta cargar el comercio desde la nube. */
  reloadCloud: () => Promise<void>;
};

export type StoreValue = StoreState & StoreActions;

const ActionsCtx = createContext<StoreActions | null>(null);
const MountedCtx = createContext(false);

export function StoreProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getState, getState);
  const [storageError, setStorageError] = useState(false);
  const [cloudError, setCloudError] = useState(false);

  const persistLocal = useCallback(() => {
    if (!currentAuthed) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
      setStorageError(false);
    } catch {
      // Cuota superada o almacenamiento no disponible: avisar en lugar de
      // perder datos en silencio (el cajero cree que quedó guardado).
      setStorageError(true);
    }
  }, []);

  const persistCloud = useCallback(() => {
    // No pisar la nube antes de terminar de cargarla ni tras cerrar sesión.
    if (!currentAuthed || !hydrated) return;
    if (isBypassActive()) return; // TEMP-BYPASS: sin sesión real en la nube
    cloudSaveBusiness(currentState)
      .then(() => setCloudError(false))
      .catch(() => {
        setCloudError(true);
      });
  }, []);

  // Guardado con *debounce*: copia local + sincronización con Supabase.
  useEffect(() => {
    const id = window.setTimeout(() => {
      persistLocal();
      persistCloud();
    }, WRITE_DELAY);
    return () => window.clearTimeout(id);
  }, [state, persistLocal, persistCloud]);

  useEffect(() => {
    const flush = () => {
      persistLocal();
      persistCloud();
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [persistLocal, persistCloud]);

  // Sincronización entre pestañas del mismo navegador.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      if (e.newValue === JSON.stringify(currentState)) return;
      try {
        setAppState(normalize(emptyState(), JSON.parse(e.newValue) as Partial<AppState>));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Carga el comercio del usuario autenticado desde Supabase.
  const hydrate = useCallback(async (user: SessionUser | null) => {
    hydrated = false;
    if (!user) {
      setAppState(emptyState());
      hydrated = true;
      return;
    }
    try {
      const remote = await cloudLoadBusiness();
      setAppState(remote ? normalize(emptyState(), remote.data) : emptyState());
      setCloudError(false);
    } catch {
      setCloudError(true);
    } finally {
      hydrated = true;
    }
  }, []);

  // Observa la sesión de Supabase (alta, verificación, login, logout).
  useEffect(() => {
    let cancelled = false;
    // TEMP-BYPASS: sesión local falsa; ni getSession ni nube.
    if (isBypassActive()) {
      const fake = bypassUser();
      setUser(fake);
      setAuthed(true);
      markVerified(fake.id);
      trustDevice(fake.id);
      setDeviceVerified(true);
      hydrated = true;
      setBooting(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const user = userFromSession(data.session);
      setUser(user);
      setAuthed(!!user);
      if (user) {
        applyEmailLinkVerification(user.id);
        trustDevice(user.id);
        markVerified(user.id);
        setDeviceVerified(true);
      } else {
        setDeviceVerified(false);
      }
      if (!user) {
        setBooting(false);
        hydrated = true;
        setAppState(emptyState());
        return;
      }
      setBooting(true);
      void hydrate(user).finally(() => {
        if (!cancelled) setBooting(false);
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (isBypassActive()) return; // TEMP-BYPASS: eventos reales no aplican
      if (event === "INITIAL_SESSION") return; // ya lo resolvió getSession()
      const user = userFromSession(session);
      setUser(user);
      setAuthed(!!user);
      if (user) {
        applyEmailLinkVerification(user.id);
        trustDevice(user.id);
        markVerified(user.id);
        setDeviceVerified(true);
      } else {
        setDeviceVerified(false);
      }
      if (!user) {
        setBooting(false);
        hydrated = true;
        setAppState(emptyState());
        return;
      }
      setBooting(true);
      void hydrate(user).finally(() => setBooting(false));
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [hydrate]);

  const login = useCallback(async (email: string, password: string) => {
    const { error, userId } = await authSignIn(email.trim(), password);
    if (error) return error;
    if (userId) {
      trustDevice(userId);
      markVerified(userId);
    }
    setDeviceVerified(true);
    return null;
  }, []);

  const logout = useCallback(async () => {
    if (isBypassActive()) clearBypass(); // TEMP-BYPASS: salir vuelve al Login real
    await authSignOut();
    setUser(null);
    setAuthed(false);
    clearSessionVerified();
    hydrated = true;
    setAppState(emptyState());
  }, []);

  const signUp = useCallback(
    async (input: { email: string; password: string; firstName: string; lastName: string; phone: string }) => {
      const { error } = await authSignUp(input);
      return error;
    },
    []
  );

  const verifyEmail = useCallback(async (email: string, code: string, trust = false) => {
    const { error, userId } = await authVerifyCode(email.trim(), code.trim());
    if (error) return error;
    if (userId) {
      markVerified(userId);
      if (trust) trustDevice(userId);
    }
    return null;
  }, []);

  /** Reenvía el código del alta. */
  const resendCode = useCallback(async (email: string) => {
    const { error } = await authResendCode(email.trim());
    return error;
  }, []);

  /** Envía (o reenvía) el código de acceso del dispositivo al entrar. */
  const sendDeviceCode = useCallback(async (email: string) => {
    const { error } = await authSendDeviceCode(email.trim());
    return error;
  }, []);

  /** Verifica el código de acceso del equipo y, si se pide, lo marca de confianza. */
  const verifyDevice = useCallback(async (email: string, code: string, trust = false) => {
    const { error, userId } = await authVerifyLoginCode(email.trim(), code.trim());
    if (error) return error;
    if (userId) {
      markVerified(userId);
      if (trust) trustDevice(userId);
    }
    return null;
  }, []);

  const updateProfile = useCallback(
    async (input: { firstName: string; lastName: string; phone: string }) => {
      const { error } = await authUpdateProfile(input);
      if (!error) setUser(currentUser ? { ...currentUser, ...input } : currentUser);
      return error;
    },
    []
  );

  /** Envía el enlace de recuperación de contraseña al correo. */
  const resetPassword = useCallback(async (email: string) => {
    const { error } = await authResetPassword(email.trim());
    return error;
  }, []);

  /** Establece la nueva contraseña tras abrir el enlace de recuperación. */
  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await authUpdatePassword(newPassword);
    return error;
  }, []);

  const completeOnboarding = useCallback(() => {
    setAppState((s) => ({ ...s, onboarding: { completed: true } }));
  }, []);

  const clearAll = useCallback(() => {
    setAppState(emptyState());
  }, []);

  const reloadCloud = useCallback(async () => {
    setBooting(true);
    try {
      await hydrate(currentUser);
    } finally {
      setBooting(false);
    }
  }, [hydrate]);

  // ---- Catálogo -------------------------------------------------
  const addProduct = useCallback((p: Omit<Product, "id">) => {
    setAppState((s) => ({ ...s, products: [...s.products, { ...p, id: uid("prod") }] }));
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    setAppState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const removeProduct = useCallback((id: string) => {
    setAppState((s) => ({ ...s, products: s.products.filter((x) => x.id !== id) }));
  }, []);

  const setStock = useCallback((id: string, stock: number) => {
    setAppState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === id ? { ...p, stock: round2(stock) } : p)),
    }));
  }, []);

  const addCategory = useCallback((c: Omit<Category, "id">) => {
    setAppState((s) => ({ ...s, categories: [...s.categories, { ...c, id: uid("cat") }] }));
  }, []);

  const updateCategory = useCallback((id: string, patch: Partial<Category>) => {
    setAppState((s) => ({
      ...s,
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const removeCategory = useCallback((id: string) => {
    setAppState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
  }, []);

  const addChannel = useCallback((c: Omit<Channel, "id">) => {
    setAppState((s) => ({ ...s, channels: [...s.channels, { ...c, id: uid("ch") }] }));
  }, []);

  const updateChannel = useCallback((id: string, patch: Partial<Channel>) => {
    setAppState((s) => ({
      ...s,
      channels: s.channels.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const removeChannel = useCallback((id: string) => {
    setAppState((s) =>
      s.channels.find((c) => c.id === id)?.isDefault
        ? s
        : { ...s, channels: s.channels.filter((c) => c.id !== id) }
    );
  }, []);

  const addLocation = useCallback((l: Omit<Location, "id">) => {
    setAppState((s) => ({ ...s, locations: [...s.locations, { ...l, id: uid("loc") }] }));
  }, []);

  const updateLocation = useCallback((id: string, patch: Partial<Location>) => {
    setAppState((s) => {
      let locations = s.locations.map((l) => (l.id === id ? { ...l, ...patch } : l));
      if (patch.defaultSales) locations = locations.map((l) => ({ ...l, defaultSales: l.id === id }));
      if (patch.defaultPurchases)
        locations = locations.map((l) => ({ ...l, defaultPurchases: l.id === id }));
      return { ...s, locations };
    });
  }, []);

  const removeLocation = useCallback((id: string) => {
    setAppState((s) =>
      s.locations.length <= 1
        ? s
        : { ...s, locations: s.locations.filter((l) => l.id !== id) }
    );
  }, []);

  const setChannelPrice = useCallback((productId: string, channelId: string, price: number) => {
    setAppState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              channelPrices: { ...p.channelPrices, [channelId]: round2(price) },
              price:
                s.channels.find((c) => c.id === channelId)?.isDefault ? round2(price) : p.price,
            }
          : p
      ),
    }));
  }, []);

  const bulkPrice = useCallback((pct: number, channelId: string) => {
    setAppState((s) => ({
      ...s,
      products: s.products.map((p) => {
        const current = p.channelPrices[channelId] ?? p.price;
        const next = round2(current * (1 + pct / 100));
        return {
          ...p,
          channelPrices: { ...p.channelPrices, [channelId]: next },
          price: s.channels.find((c) => c.id === channelId)?.isDefault ? next : p.price,
        };
      }),
    }));
  }, []);

  // ---- Contactos ------------------------------------------------
  const addContact = useCallback((c: Omit<Contact, "id">) => {
    setAppState((s) => ({ ...s, contacts: [...s.contacts, { ...c, id: uid("cont") }] }));
  }, []);

  const updateContact = useCallback((id: string, patch: Partial<Contact>) => {
    setAppState((s) => ({
      ...s,
      contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const removeContact = useCallback((id: string) => {
    setAppState((s) => ({ ...s, contacts: s.contacts.filter((x) => x.id !== id) }));
  }, []);

  // ---- Vender (POS) ---------------------------------------------
  const checkout = useCallback<StoreActions["checkout"]>((input) => {
    let createdSale: Sale | null = null;
    setAppState((s) => {
      const base = input.lines.reduce((a, l) => a + l.price * l.qty, 0);
      const net = Math.max(0, base - input.discount);
      const igtf = input.payments.reduce((a, p) => a + (p.igtf ?? 0), 0);
      const total = round2(net + input.tax + input.surcharge + igtf);
      const paid = round2(input.payments.reduce((a, p) => a + p.amountUsd, 0));
      const remaining = round2(Math.max(0, total - paid));
      const nextNumber = s.sales.filter((x) => x.status !== "cotizacion").length + 1;
      const seq = String(nextNumber).padStart(6, "0");
      const status: Sale["status"] = input.quote
        ? "cotizacion"
        : remaining > 0
          ? "credito"
          : "cobrada";
      const code = input.quote ? `C-${seq}` : seq;
      const at = new Date().toISOString();
      const methodLabel =
        input.payments.length === 0
          ? "—"
          : remaining > 0
            ? `${input.payments.map((p) => p.method).join(" + ")} + crédito`
            : input.payments.map((p) => p.method).join(" + ");
      const customer = s.contacts.find((c) => c.id === input.customerId);
      const locationId = input.locationId ?? s.locations.find((l) => l.defaultSales)?.id ?? s.locations[0]?.id ?? "";

      // Acredita cada cobro a su cuenta (en su moneda nativa, neto de comisión)
      // y registra su movimiento en el libro. Se calcula antes de construir la
      // venta para guardar en el pago los montos realmente acreditados.
      let accounts = s.accounts;
      const movements: Movement[] = [];
      const enrichedPayments: SalePayment[] = input.payments.map((p) => {
        const acc = p.accountId ? s.accounts.find((a) => a.id === p.accountId) : undefined;
        if (!acc) return p;
        const comm = commission(p.amountUsd, acc.commissionIn);
        const nativeInput = p.amountInput ?? toNative(p.amountUsd, acc.currency, s.rate);
        const creditedNative = round2(
          toNative(p.amountUsd, acc.currency, s.rate) - toNative(comm, acc.currency, s.rate)
        );
        accounts = accounts.map((a) =>
          a.id === acc.id ? { ...a, balance: round2(a.balance + creditedNative) } : a
        );
        movements.push({
          id: uid("mov"),
          at,
          accountId: acc.id,
          direction: "entrada",
          amountUsd: round2(p.amountUsd - comm),
          currency: acc.currency,
          amountInput: creditedNative,
          origin: "Venta",
          note: `Cobro de venta ${code}${comm ? ` · comisión ${acc.commissionIn}% (${comm.toFixed(2)})` : ""}`,
          userId: USER,
        });
        return { ...p, amountInput: nativeInput, commission: comm, creditedNative };
      });

      const sale: Sale = {
        id: uid("sale"),
        code,
        at,
        lines: input.lines,
        status,
        discount: round2(input.discount),
        discountId: input.discountId,
        discountCode: s.discounts.find((d) => d.id === input.discountId)?.code,
        surcharge: round2(input.surcharge),
        surchargeIds: input.surchargeIds,
        tax: round2(input.tax),
        igtf: round2(igtf),
        notes: input.notes,
        payments: enrichedPayments,
        customerId: input.customerId,
        customerName: customer?.name,
        paymentMethod: methodLabel,
        channelId: input.channelId ?? s.channels.find((c) => c.isDefault)?.id,
        locationId,
        userId: USER,
        rate: s.rate,
        amountReceived: input.amountReceived ? round2(input.amountReceived) : undefined,
        changeUsd: input.changeUsd ? round2(input.changeUsd) : undefined,
        changeBs: input.changeBs ? round2(input.changeBs) : undefined,
      };

      createdSale = sale;

      if (input.quote) {
        return { ...s, sales: [sale, ...s.sales] };
      }

      // Existencias + libro de inventario.
      const moves: InventoryMove[] = [];
      const products = s.products.map((p) => {
        const line = input.lines.find((l) => l.productId === p.id);
        if (!line || !p.trackStock) return p;
        moves.push(
          inventoryMove(p, "salida", line.qty, p.cost, `Venta #${code}`, locationId, at)
        );
        return { ...p, stock: Math.max(0, round2(p.stock - line.qty)) };
      });

      // Si queda saldo, genera una cuenta por cobrar del cliente.
      const pendings: Pending[] =
        remaining > 0
          ? [
              {
                id: uid("pend"),
                at,
                direction: "cobrar" as const,
                contactId: input.customerId,
                contactName: customer?.name,
                subject: `Venta ${code}`,
                amountUsd: remaining,
                paidUsd: 0,
                note: "Generado por venta a crédito",
                status: "abierto" as const,
              },
              ...s.pendings,
            ]
          : s.pendings;

      const discounts = input.discountId
        ? s.discounts.map((d) => (d.id === input.discountId ? { ...d, used: d.used + 1 } : d))
        : s.discounts;

      return {
        ...s,
        products,
        accounts,
        movements: [...movements, ...s.movements],
        inventoryMoves: [...moves, ...s.inventoryMoves],
        pendings,
        discounts,
        sales: [sale, ...s.sales],
      };
    });
    return createdSale!;
  }, []);

  const voidSale = useCallback((id: string, reason: string) => {
    setAppState((s) => {
      const sale = s.sales.find((x) => x.id === id);
      if (!sale || sale.status === "anulada" || sale.status === "cotizacion") return s;
      const at = new Date().toISOString();
      // Devuelve existencias.
      const moves: InventoryMove[] = [];
      const products = s.products.map((p) => {
        const line = sale.lines.find((l) => l.productId === p.id);
        if (!line || !p.trackStock) return p;
        moves.push(
          inventoryMove(p, "entrada", line.qty, p.cost, `Anulación venta #${sale.code}`, sale.locationId ?? "", at)
        );
        return { ...p, stock: round2(p.stock + line.qty) };
      });
      // Revierte a cada cuenta el monto NETO realmente acreditado (no el bruto)
      // y registra el asiento inverso para que el libro cuadre con el saldo.
      const reverseMovements: Movement[] = [];
      const accounts = s.accounts.map((a) => {
        const paymentsToAccount = sale.payments.filter((p) => p.accountId === a.id);
        if (!paymentsToAccount.length) return a;
        let reversed = 0;
        for (const p of paymentsToAccount) {
          const netUsd = round2(p.amountUsd - (p.commission ?? 0));
          const native = p.creditedNative ?? toNative(netUsd, a.currency, s.rate);
          reversed += native;
          reverseMovements.push({
            id: uid("mov"),
            at,
            accountId: a.id,
            direction: "salida",
            amountUsd: netUsd,
            currency: a.currency,
            amountInput: round2(native),
            origin: "Anulación venta",
            note: `Anulación venta ${sale.code}${reason ? ` · ${reason}` : ""}`,
            userId: USER,
          });
        }
        return { ...a, balance: round2(a.balance - reversed) };
      });
      // Anula la cuenta por cobrar asociada.
      const pendings = s.pendings.map((p) =>
        p.subject === `Venta ${sale.code}` && p.status !== "saldado"
          ? { ...p, status: "anulado" as const }
          : p
      );
      // Libera el uso del descuento aplicado.
      const discounts = sale.discountId
        ? s.discounts.map((d) =>
            d.id === sale.discountId ? { ...d, used: Math.max(0, d.used - 1) } : d
          )
        : s.discounts;
      return {
        ...s,
        products,
        accounts,
        pendings,
        discounts,
        movements: [...reverseMovements, ...s.movements],
        inventoryMoves: [...moves, ...s.inventoryMoves],
        sales: s.sales.map((x) =>
          x.id === id ? { ...x, status: "anulada" as const, voidedAt: at, voidReason: reason } : x
        ),
      };
    });
  }, []);

  // ---- Caja -----------------------------------------------------
  const openCash = useCallback((openingUsd: number, openingBs: number) => {
    const session: CashSession = {
      openedAt: new Date().toISOString(),
      openingUsd,
      openingBs,
      userId: USER,
      locationId: currentState.locations.find((l) => l.defaultSales)?.id ?? "",
    };
    setAppState((s) => ({ ...s, cashSession: session }));
  }, []);

  const closeCash = useCallback((countedUsd: number, countedBs: number, note: string) => {
    setAppState((s) => {
      if (!s.cashSession) return s;
      const session = s.cashSession;
      const at = new Date().toISOString();
      // Esperado = fondo + entradas − salidas de efectivo del turno (libro de
      // movimientos): incluye cobros, gastos, retiros, transferencias, abonos y
      // compras, no solo las ventas. Ver metrics.expectedCash.
      const { usd: expectedUsd, bs: expectedBs } = expectedCash(s);
      const closure: CashClosure = {
        id: uid("cierre"),
        openedAt: session.openedAt,
        closedAt: at,
        userId: session.userId,
        locationId: session.locationId,
        openingUsd: session.openingUsd,
        openingBs: session.openingBs,
        countedUsd: round2(countedUsd),
        countedBs: round2(countedBs),
        expectedUsd,
        expectedBs,
        differenceUsd: round2(countedUsd - expectedUsd),
        differenceBs: round2(countedBs - expectedBs),
        note,
      };
      return { ...s, cashSession: null, cashClosures: [closure, ...s.cashClosures] };
    });
  }, []);

  // ---- Finanzas -------------------------------------------------
  const addAccount = useCallback((a: Omit<Account, "id">) => {
    setAppState((s) => {
      const account = { ...a, id: uid("acc") };
      const movements =
        account.balance > 0
          ? [
              {
                id: uid("mov"),
                at: new Date().toISOString(),
                accountId: account.id,
                direction: "entrada" as const,
                amountUsd: toUsd(account.balance, account.currency, s.rate),
                currency: account.currency,
                amountInput: round2(account.balance),
                origin: "Apertura",
                note: `Saldo inicial · ${account.name}`,
                userId: USER,
              },
              ...s.movements,
            ]
          : s.movements;
      return { ...s, accounts: [...s.accounts, account], movements };
    });
  }, []);

  const updateAccount = useCallback((id: string, patch: Partial<Account>) => {
    setAppState((s) => ({
      ...s,
      accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const removeAccount = useCallback((id: string) => {
    setAppState((s) => ({ ...s, accounts: s.accounts.filter((a) => a.id !== id) }));
  }, []);

  const moveAccount = useCallback((accountId: string, delta: number, note: string) => {
    setAppState((s) => {
      const acc = s.accounts.find((a) => a.id === accountId);
      if (!acc || !delta) return s;
      const usd = toUsd(delta, acc.currency, s.rate);
      return {
        ...s,
        accounts: s.accounts.map((a) =>
          a.id === accountId ? { ...a, balance: round2(a.balance + delta) } : a
        ),
        movements: [
          {
            id: uid("mov"),
            at: new Date().toISOString(),
            accountId,
            direction: delta > 0 ? "entrada" : "salida",
            amountUsd: round2(Math.abs(usd)),
            currency: acc.currency,
            amountInput: round2(Math.abs(delta)),
            origin: delta > 0 ? "Ingreso" : "Retiro",
            note: note || (delta > 0 ? "Ingreso de dinero" : "Retiro de dinero"),
            userId: USER,
          },
          ...s.movements,
        ],
      };
    });
  }, []);

  const adjustAccount = useCallback<StoreActions["adjustAccount"]>(
    (accountId, newBalance, motive, note) => {
      setAppState((s) => {
        const acc = s.accounts.find((a) => a.id === accountId);
        if (!acc) return s;
        const delta = round2(newBalance - acc.balance);
        const at = new Date().toISOString();
        return {
          ...s,
          accounts: s.accounts.map((a) =>
            a.id === accountId ? { ...a, balance: round2(newBalance) } : a
          ),
          movements: [
            {
              id: uid("mov"),
              at,
              accountId,
              direction: delta >= 0 ? "entrada" : "salida",
              amountUsd: Math.abs(toUsd(delta, acc.currency, s.rate)),
              currency: acc.currency,
              amountInput: Math.abs(delta),
              origin: "Ajuste de saldo",
              note: `${motive}${note ? ` · ${note}` : ""}`,
              userId: USER,
            },
            ...s.movements,
          ],
        };
      });
    },
    []
  );

  const transfer = useCallback<StoreActions["transfer"]>(
    (fromId, toId, amountUsd, commissionValue, note) => {
      setAppState((s) => {
        if (fromId === toId) return s;
        const from = s.accounts.find((a) => a.id === fromId);
        const to = s.accounts.find((a) => a.id === toId);
        if (!from || !to) return s;
        const amount = round2(amountUsd);
        const comm = round2(commissionValue);
        const totalOut = round2(amount + comm);
        const t: Transfer = {
          id: uid("trf"),
          at: new Date().toISOString(),
          fromId,
          toId,
          amountUsd: amount,
          commission: comm,
          note,
          userId: USER,
        };
        const at = t.at;
        const fromOutNative = toNative(totalOut, from.currency, s.rate);
        const toInNative = toNative(amount, to.currency, s.rate);
        return {
          ...s,
          transfers: [t, ...s.transfers],
          accounts: s.accounts.map((a) => {
            if (a.id === fromId) return { ...a, balance: round2(a.balance - fromOutNative) };
            if (a.id === toId) return { ...a, balance: round2(a.balance + toInNative) };
            return a;
          }),
          movements: [
            {
              id: uid("mov"),
              at,
              accountId: toId,
              direction: "entrada",
              amountUsd: amount,
              currency: to.currency,
              amountInput: toInNative,
              origin: "Transferencia",
              note: note || `Desde ${from.name}`,
              userId: USER,
            },
            {
              id: uid("mov"),
              at,
              accountId: fromId,
              direction: "salida",
              amountUsd: totalOut,
              currency: from.currency,
              amountInput: fromOutNative,
              origin: "Transferencia",
              note: `${note || `Hacia ${to.name}`}${comm ? ` · comisión ${comm.toFixed(2)}` : ""}`,
              userId: USER,
            },
            ...s.movements,
          ],
        };
      });
    },
    []
  );

  const transferBetween = useCallback<StoreActions["transferBetween"]>(
    (fromId, toId, amountUsd, commissionValue) =>
      transfer(fromId, toId, amountUsd, commissionValue, ""),
    [transfer]
  );

  // ---- Gastos ---------------------------------------------------
  const addExpense = useCallback<StoreActions["addExpense"]>((e) => {
    setAppState((s) => {
      const at = e.at ?? new Date().toISOString();
      const expense: Expense = { ...e, at, id: uid("exp") };
      const accountId = e.accountId;
      if (!expense.paid || !accountId) {
        return { ...s, expenses: [expense, ...s.expenses] };
      }
      const acc = s.accounts.find((a) => a.id === accountId);
      const cost = acc ? round2(expense.amountUsd * (1 + (acc.commissionOut || 0) / 100)) : expense.amountUsd;
      return {
        ...s,
        expenses: [{ ...expense, paidAt: at }, ...s.expenses],
        accounts: s.accounts.map((a) =>
          a.id === accountId ? { ...a, balance: round2(a.balance - toNative(cost, a.currency, s.rate)) } : a
        ),
        movements: [
          {
            id: uid("mov"),
            at,
            accountId,
            direction: "salida",
            amountUsd: cost,
            currency: acc?.currency,
            amountInput: acc ? toNative(cost, acc.currency, s.rate) : cost,
            origin: "Gasto",
            note: `${expense.name} · ${expense.category}`,
            userId: USER,
          },
          ...s.movements,
        ],
      };
    });
  }, []);

  const updateExpense = useCallback((id: string, patch: Partial<Expense>) => {
    setAppState((s) => ({
      ...s,
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const payExpense = useCallback<StoreActions["payExpense"]>((id, accountId, note) => {
    setAppState((s) => {
      const exp = s.expenses.find((e) => e.id === id);
      const acc = s.accounts.find((a) => a.id === accountId);
      if (!exp || exp.paid || exp.anulado || !acc) return s;
      const at = new Date().toISOString();
      const cost = round2(exp.amountUsd * (1 + (acc.commissionOut || 0) / 100));
      return {
        ...s,
        expenses: s.expenses.map((e) => (e.id === id ? { ...e, paid: true, paidAt: at, accountId } : e)),
        accounts: s.accounts.map((a) =>
          a.id === accountId ? { ...a, balance: round2(a.balance - toNative(cost, a.currency, s.rate)) } : a
        ),
        movements: [
          {
            id: uid("mov"),
            at,
            accountId,
            direction: "salida",
            amountUsd: cost,
            currency: acc.currency,
            amountInput: toNative(cost, acc.currency, s.rate),
            origin: "Gasto",
            note: note || `${exp.name} · ${exp.category}`,
            userId: USER,
          },
          ...s.movements,
        ],
      };
    });
  }, []);

  const voidExpense = useCallback<StoreActions["voidExpense"]>((id) => {
    setAppState((s) => {
      const exp = s.expenses.find((e) => e.id === id);
      if (!exp || exp.anulado) return s;
      const acc = exp.paid && exp.accountId ? s.accounts.find((a) => a.id === exp.accountId) : undefined;
      // Un gasto ya pagado devuelve el dinero a su cuenta con el asiento inverso.
      if (acc) {
        const cost = round2(exp.amountUsd * (1 + (acc.commissionOut || 0) / 100));
        const native = toNative(cost, acc.currency, s.rate);
        return {
          ...s,
          expenses: s.expenses.map((e) => (e.id === id ? { ...e, anulado: true } : e)),
          accounts: s.accounts.map((a) =>
            a.id === acc.id ? { ...a, balance: round2(a.balance + native) } : a
          ),
          movements: [
            {
              id: uid("mov"),
              at: new Date().toISOString(),
              accountId: acc.id,
              direction: "entrada",
              amountUsd: cost,
              currency: acc.currency,
              amountInput: native,
              origin: "Gasto",
              note: `Anulación de gasto · ${exp.name}`,
              userId: USER,
            },
            ...s.movements,
          ],
        };
      }
      return {
        ...s,
        expenses: s.expenses.map((e) => (e.id === id ? { ...e, anulado: true } : e)),
      };
    });
  }, []);

  const addRecurringExpense = useCallback((r: Omit<RecurringExpense, "id">) => {
    setAppState((s) => ({
      ...s,
      recurringExpenses: [...s.recurringExpenses, { ...r, id: uid("recur") }],
    }));
  }, []);

  const removeRecurringExpense = useCallback((id: string) => {
    setAppState((s) => ({
      ...s,
      recurringExpenses: s.recurringExpenses.filter((r) => r.id !== id),
    }));
  }, []);

  /**
   * Regla Wink: al vencer un gasto recurrente se crea UN gasto pendiente
   * (solo el vencimiento más reciente); no mueve dinero.
   */
  const runRecurring = useCallback(() => {
    setAppState((s) => {
      const now = new Date();
      let changed = false;
      let expenses = s.expenses;
      const recurringExpenses = s.recurringExpenses.map((r) => {
        if (!r.active) return r;
        const first = new Date(r.firstDue);
        const dueDay = first.getDate();
        // Último vencimiento <= hoy.
        const candidate = new Date(now.getFullYear(), now.getMonth(), dueDay);
        if (candidate.getTime() > now.getTime()) candidate.setMonth(candidate.getMonth() - 1);
        if (candidate.getTime() < first.getTime()) return r;
        const dueIso = candidate.toISOString();
        if (r.lastGenerated && r.lastGenerated >= dueIso.slice(0, 10)) return r;
        changed = true;
        const cat = s.expenseCategories.find((c) => c.id === r.categoryId);
        const already = expenses.some(
          (e) => e.category === (cat?.name ?? "") && e.name === r.name && e.at.slice(0, 10) === dueIso.slice(0, 10)
        );
        if (!already) {
          expenses = [
            {
              id: uid("exp"),
              at: dueIso,
              name: r.name,
              category: cat?.name ?? "Otros",
              note: "Generado por gasto recurrente",
              amountUsd: r.amountUsd,
              recurring: true,
              paid: false,
              anulado: false,
            },
            ...expenses,
          ];
        }
        return { ...r, lastGenerated: dueIso.slice(0, 10) };
      });
      return changed ? { ...s, expenses, recurringExpenses } : s;
    });
  }, []);

  const addExpenseCategory = useCallback((name: string) => {
    setAppState((s) => ({
      ...s,
      expenseCategories: [...s.expenseCategories, { id: uid("ecat"), name, active: true }],
    }));
  }, []);

  const updateExpenseCategory = useCallback((id: string, patch: Partial<ExpenseCategory>) => {
    setAppState((s) => ({
      ...s,
      expenseCategories: s.expenseCategories.map((c) =>
        c.id === id ? { ...c, ...patch, system: c.system } : c
      ),
    }));
  }, []);

  // ---- Pendientes -----------------------------------------------
  const addPending = useCallback<StoreActions["addPending"]>((p) => {
    setAppState((s) => ({
      ...s,
      pendings: [
        { ...p, id: uid("pend"), at: new Date().toISOString(), paidUsd: 0, status: "abierto" },
        ...s.pendings,
      ],
    }));
  }, []);

  const abonoPending = useCallback<StoreActions["abonoPending"]>(
    (id, accountId, amountUsd, note) => {
      setAppState((s) => {
        const p = s.pendings.find((x) => x.id === id);
        const acc = s.accounts.find((a) => a.id === accountId);
        if (!p || !acc || amountUsd <= 0) return s;
        if (p.status === "saldado" || p.status === "anulado") return s;
        // No se puede abonar más de lo que queda por cobrar/pagar: acota el
        // monto al saldo restante para no acreditar dinero de más en la cuenta.
        const remaining = round2(Math.max(0, p.amountUsd - p.paidUsd));
        const applied = round2(Math.min(amountUsd, remaining));
        if (applied <= 0) return s;
        const paid = round2(p.paidUsd + applied);
        const status: Pending["status"] = paid >= p.amountUsd ? "saldado" : "parcial";
        const at = new Date().toISOString();
        const isCollect = p.direction === "cobrar";
        // Al recibir se descuenta la comisión; al pagar se suma la comisión.
        const net = isCollect
          ? round2(applied - commission(applied, acc.commissionIn))
          : round2(applied + commission(applied, acc.commissionOut));
        const native = toNative(net, acc.currency, s.rate);
        return {
          ...s,
          pendings: s.pendings.map((x) => (x.id === id ? { ...x, paidUsd: paid, status } : x)),
          accounts: s.accounts.map((a) =>
            a.id === accountId
              ? { ...a, balance: round2(a.balance + (isCollect ? native : -native)) }
              : a
          ),
          movements: [
            {
              id: uid("mov"),
              at,
              accountId,
              direction: isCollect ? "entrada" : "salida",
              amountUsd: net,
              currency: acc.currency,
              amountInput: native,
              origin: "Abono",
              note: note || p.subject,
              userId: USER,
            },
            ...s.movements,
          ],
        };
      });
    },
    []
  );

  const voidPending = useCallback((id: string) => {
    setAppState((s) => ({
      ...s,
      pendings: s.pendings.map((p) => (p.id === id ? { ...p, status: "anulado" } : p)),
    }));
  }, []);

  // ---- Impuestos / descuentos / recargos ------------------------
  const addTax = useCallback((t: Omit<Tax, "id">) => {
    setAppState((s) => ({ ...s, taxes: [...s.taxes, { ...t, id: uid("tax") }] }));
  }, []);

  const updateTax = useCallback((id: string, patch: Partial<Tax>) => {
    setAppState((s) => ({
      ...s,
      taxes: s.taxes.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const setDefaultTax = useCallback((id: string) => {
    setAppState((s) => ({
      ...s,
      taxes: s.taxes.map((t) => ({ ...t, isDefault: t.id === id })),
    }));
  }, []);

  const addDiscount = useCallback((d: Omit<Discount, "id" | "used">) => {
    setAppState((s) => ({
      ...s,
      discounts: [...s.discounts, { ...d, id: uid("disc"), used: 0 }],
    }));
  }, []);

  const updateDiscount = useCallback((id: string, patch: Partial<Discount>) => {
    setAppState((s) => ({
      ...s,
      discounts: s.discounts.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  }, []);

  const removeDiscount = useCallback((id: string) => {
    setAppState((s) => ({ ...s, discounts: s.discounts.filter((d) => d.id !== id) }));
  }, []);

  const addSurcharge = useCallback((x: Omit<Surcharge, "id">) => {
    setAppState((s) => ({ ...s, surcharges: [...s.surcharges, { ...x, id: uid("sur") }] }));
  }, []);

  const updateSurcharge = useCallback((id: string, patch: Partial<Surcharge>) => {
    setAppState((s) => ({
      ...s,
      surcharges: s.surcharges.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }, []);

  const removeSurcharge = useCallback((id: string) => {
    setAppState((s) => ({ ...s, surcharges: s.surcharges.filter((x) => x.id !== id) }));
  }, []);

  // ---- Inventario -----------------------------------------------
  const addPurchase = useCallback<StoreActions["addPurchase"]>((input) => {
    setAppState((s) => {
      const at = input.at ? new Date(input.at).toISOString() : new Date().toISOString();
      const raw = input.lines.filter((l) => l.qty > 0);
      if (!raw.length) return s;
      const supplier = s.contacts.find((c) => c.id === input.supplierId);
      // Normaliza el costo una sola vez: total, líneas y costo promedio usan el
      // mismo valor (antes el total usaba el costo del producto y las líneas 0).
      const lines = raw.map((l) => {
        const p = s.products.find((x) => x.id === l.productId);
        return {
          productId: l.productId,
          name: p?.name ?? "",
          qty: round2(l.qty),
          costUnit: round2(l.costUnit || p?.cost || 0),
        };
      });
      const total = round2(lines.reduce((a, l) => a + l.qty * l.costUnit, 0));
      const purchase: Purchase = {
        id: uid("compra"),
        at,
        supplierId: input.supplierId,
        supplierName: supplier?.name ?? input.supplierName,
        locationId: input.locationId,
        paymentMethod: input.paymentMethod,
        accountId: input.accountId,
        invoiceNo: input.invoiceNo,
        lines,
        totalUsd: total,
        userId: USER,
      };
      // Entra mercancía + costo promedio ponderado.
      const moves: InventoryMove[] = [];
      const products = s.products.map((p) => {
        const line = purchase.lines.find((l) => l.productId === p.id);
        if (!line) return p;
        moves.push(
          inventoryMove(p, "entrada", line.qty, line.costUnit, `Compra ${purchase.id.slice(-4).toUpperCase()}`, input.locationId, at, input.invoiceNo)
        );
        if (!p.trackStock) return p;
        const newStock = round2(p.stock + line.qty);
        const avgCost =
          newStock > 0 ? round2((p.stock * p.cost + line.qty * line.costUnit) / newStock) : p.cost;
        return { ...p, stock: newStock, cost: avgCost };
      });

      // Salida de dinero o cuenta por pagar.
      let accounts = s.accounts;
      const movements: Movement[] = [];
      const pendings: Pending[] = [];
      if ((input.paymentMethod === "cuenta" || input.paymentMethod === "efectivo") && input.accountId) {
        const acc = s.accounts.find((a) => a.id === input.accountId);
        const cost = acc ? round2(total * (1 + (acc.commissionOut || 0) / 100)) : total;
        accounts = accounts.map((a) =>
          a.id === input.accountId ? { ...a, balance: round2(a.balance - toNative(cost, a.currency, s.rate)) } : a
        );
        movements.push({
          id: uid("mov"),
          at,
          accountId: input.accountId,
          direction: "salida",
          amountUsd: cost,
          currency: acc?.currency,
          amountInput: acc ? toNative(cost, acc.currency, s.rate) : cost,
          origin: "Compra",
          note: `Compra a ${purchase.supplierName}`,
          userId: USER,
        });
      } else if (input.paymentMethod === "credito") {
        pendings.push({
          id: uid("pend"),
          at,
          direction: "pagar",
          contactId: input.supplierId,
          contactName: supplier?.name,
          subject: `Compra ${purchase.id.slice(-4).toUpperCase()}`,
          amountUsd: total,
          paidUsd: 0,
          note: "Generado por compra a crédito",
          status: "abierto",
        });
      }

      return {
        ...s,
        products,
        accounts,
        movements: [...movements, ...s.movements],
        inventoryMoves: [...moves, ...s.inventoryMoves],
        purchases: [purchase, ...s.purchases],
        pendings: [...pendings, ...s.pendings],
      };
    });
  }, []);

  const addStockReturn = useCallback<StoreActions["addStockReturn"]>((input) => {
    setAppState((s) => {
      const at = new Date().toISOString();
      const lines = input.lines
        .filter((l) => l.qty > 0)
        .map((l) => ({
          productId: l.productId,
          name: s.products.find((p) => p.id === l.productId)?.name ?? "",
          qty: round2(l.qty),
          costUnit: round2(l.costUnit),
        }));
      if (!lines.length) return s;
      const supplier = s.contacts.find((c) => c.id === input.supplierId);
      const ret: StockReturn = {
        id: uid("dev"),
        at,
        supplierId: input.supplierId,
        supplierName: supplier?.name ?? input.supplierName,
        locationId: input.locationId,
        lines,
        totalUsd: round2(lines.reduce((a, l) => a + l.qty * l.costUnit, 0)),
        reason: input.reason,
        userId: USER,
      };
      const moves: InventoryMove[] = [];
      const products = s.products.map((p) => {
        const line = lines.find((l) => l.productId === p.id);
        if (!line) return p;
        moves.push(
          inventoryMove(p, "salida", line.qty, line.costUnit, "Devolución", input.locationId, at)
        );
        return p.trackStock ? { ...p, stock: Math.max(0, round2(p.stock - line.qty)) } : p;
      });
      return {
        ...s,
        products,
        inventoryMoves: [...moves, ...s.inventoryMoves],
        stockReturns: [ret, ...s.stockReturns],
      };
    });
  }, []);

  const addStockAdjustment = useCallback<StoreActions["addStockAdjustment"]>((input) => {
    setAppState((s) => {
      const at = new Date().toISOString();
      const lines = input.lines
        .filter((l) => l.qty !== 0)
        .map((l) => ({
          productId: l.productId,
          name: s.products.find((p) => p.id === l.productId)?.name ?? "",
          qty: round2(l.qty),
          costUnit: round2(s.products.find((p) => p.id === l.productId)?.cost ?? 0),
        }));
      if (!lines.length) return s;
      const adj: StockAdjustment = {
        id: uid("ajuste"),
        at,
        locationId: input.locationId,
        reason: input.reason,
        note: input.note,
        lines,
        userId: USER,
      };
      const moves: InventoryMove[] = [];
      const products = s.products.map((p) => {
        const line = lines.find((l) => l.productId === p.id);
        if (!line) return p;
        moves.push(
          inventoryMove(
            p,
            line.qty > 0 ? "entrada" : "salida",
            Math.abs(line.qty),
            p.cost,
            `Ajuste · ${input.reason}`,
            input.locationId,
            at
          )
        );
        return { ...p, stock: round2(Math.max(0, p.stock + line.qty)) };
      });
      return {
        ...s,
        products,
        inventoryMoves: [...moves, ...s.inventoryMoves],
        stockAdjustments: [adj, ...s.stockAdjustments],
      };
    });
  }, []);

  const addStockTransfer = useCallback<StoreActions["addStockTransfer"]>((input) => {
    setAppState((s) => {
      if (input.fromId === input.toId) return s;
      const at = new Date().toISOString();
      const lines = input.lines
        .filter((l) => l.qty > 0)
        .map((l) => ({
          productId: l.productId,
          name: s.products.find((p) => p.id === l.productId)?.name ?? "",
          qty: round2(l.qty),
        }));
      if (!lines.length) return s;
      const tr: StockTransfer = {
        id: uid("traslado"),
        at,
        fromId: input.fromId,
        toId: input.toId,
        lines,
        note: input.note,
        userId: USER,
      };
      // El stock global no cambia (una sola bodega de existencias por producto);
      // se registran los asientos de salida y entrada por ubicación.
      const moves: InventoryMove[] = [];
      for (const l of lines) {
        const p = s.products.find((x) => x.id === l.productId);
        if (!p) continue;
        moves.push(inventoryMove(p, "salida", l.qty, p.cost, "Traslado", input.fromId, at));
        moves.push(inventoryMove(p, "entrada", l.qty, p.cost, "Traslado", input.toId, at));
      }
      return {
        ...s,
        inventoryMoves: [...moves, ...s.inventoryMoves],
        stockTransfers: [tr, ...s.stockTransfers],
      };
    });
  }, []);

  // ---- Ajustes --------------------------------------------------
  const updateBusiness = useCallback((patch: Partial<Business>) => {
    setAppState((s) => ({ ...s, business: { ...s.business, ...patch } }));
  }, []);

  const setRate = useCallback((rate: number) => {
    // Una tasa no válida (0, negativa o NaN) rompería las conversiones Bs/USD.
    if (!Number.isFinite(rate) || rate <= 0) return;
    setAppState((s) => ({ ...s, rate, rateUpdatedAt: new Date().toISOString() }));
  }, []);

  const syncRate = useCallback(async (): Promise<"ok" | "cached" | "error"> => {
    // Dentro de la ventana de caché no se golpea la API.
    if (isCacheFresh()) {
      const c = cachedRate();
      if (c) {
        setRate(c.rate);
        return "cached";
      }
    }
    const fresh = await fetchOfficialRate();
    if (fresh) {
      setRate(fresh.rate);
      return "ok";
    }
    // Sin red o API caída: si hay caché previa, se usa; si no, se respeta la
    // tasa que el comercio ya tenía y se reporta el fallo.
    const c = cachedRate();
    if (c) {
      setRate(c.rate);
      return "cached";
    }
    return "error";
  }, [setRate]);

  const actions = useMemo<StoreActions>(
    () => ({
      login,
      logout,
      addProduct,
      updateProduct,
      removeProduct,
      setStock,
      addCategory,
      updateCategory,
      removeCategory,
      addChannel,
      updateChannel,
      removeChannel,
      addLocation,
      updateLocation,
      removeLocation,
      setChannelPrice,
      bulkPrice,
      addContact,
      updateContact,
      removeContact,
      checkout,
      voidSale,
      openCash,
      closeCash,
      addAccount,
      updateAccount,
      removeAccount,
      moveAccount,
      adjustAccount,
      transfer,
      transferBetween,
      addExpense,
      updateExpense,
      payExpense,
      voidExpense,
      addRecurringExpense,
      removeRecurringExpense,
      runRecurring,
      addExpenseCategory,
      updateExpenseCategory,
      addPending,
      abonoPending,
      voidPending,
      addTax,
      updateTax,
      setDefaultTax,
      addDiscount,
      updateDiscount,
      removeDiscount,
      addSurcharge,
      updateSurcharge,
      removeSurcharge,
      addPurchase,
      addStockReturn,
      addStockAdjustment,
      addStockTransfer,
      updateBusiness,
      setRate,
      syncRate,
      signUp,
      verifyEmail,
      resendCode,
      sendDeviceCode,
      verifyDevice,
      updateProfile,
      resetPassword,
      updatePassword,
      completeOnboarding,
      clearAll,
      reloadCloud,
    }),
    [
      login, logout, addProduct, updateProduct, removeProduct, setStock,
      addCategory, updateCategory, removeCategory,
      addChannel, updateChannel, removeChannel,
      addLocation, updateLocation, removeLocation,
      setChannelPrice, bulkPrice,
      addContact, updateContact, removeContact,
      checkout, voidSale, openCash, closeCash,
      addAccount, updateAccount, removeAccount, moveAccount, adjustAccount,
      transfer, transferBetween,
      addExpense, updateExpense, payExpense, voidExpense,
      addRecurringExpense, removeRecurringExpense, runRecurring,
      addExpenseCategory, updateExpenseCategory,
      addPending, abonoPending, voidPending,
      addTax, updateTax, setDefaultTax,
      addDiscount, updateDiscount, removeDiscount,
      addSurcharge, updateSurcharge, removeSurcharge,
      addPurchase, addStockReturn, addStockAdjustment, addStockTransfer,
      updateBusiness, setRate, syncRate,
      signUp, verifyEmail, resendCode, sendDeviceCode, verifyDevice, updateProfile,
      resetPassword, updatePassword,
      completeOnboarding, clearAll, reloadCloud,
    ]
  );

  return (
    <MountedCtx.Provider value={true}>
      <ActionsCtx.Provider value={actions}>
        {children}
        {storageError && (
          <div className="storage-alert" role="alert">
            <span>
              No se pudo guardar en este dispositivo (almacenamiento lleno o no disponible).
              Tus últimos cambios pueden perderse si cierras.
            </span>
            <button className="btn btn--soft btn--sm" type="button" onClick={downloadStateBackup}>
              Descargar respaldo
            </button>
          </div>
        )}
        {cloudError && (
          <div className="storage-alert" role="alert">
            <span>
              No se pudo sincronizar con el servidor. Revisa tu conexión; seguiremos intentando.
            </span>
          </div>
        )}
      </ActionsCtx.Provider>
    </MountedCtx.Provider>
  );
}

function useMounted(): void {
  const mounted = useContext(MountedCtx);
  if (!mounted) throw new Error("El store debe usarse dentro de <StoreProvider>");
}

/** Suscripción solo al estado de autenticación (cambia rara vez). */
export function useAuth(): boolean {
  useMounted();
  return useSyncExternalStore(subscribe, getAuthed, getAuthed);
}

/** Suscripción solo al usuario de la sesión. */
export function useSessionUser(): SessionUser | null {
  useMounted();
  return useSyncExternalStore(subscribe, getUser, getUser);
}

/** true mientras se resuelve la sesión y se carga el comercio remoto. */
export function useBooting(): boolean {
  useMounted();
  return useSyncExternalStore(subscribe, getBooting, getBooting);
}

/** true cuando el equipo está verificado (de confianza o con código). */
export function useDeviceVerified(): boolean {
  useMounted();
  return useSyncExternalStore(subscribe, getDeviceVerified, getDeviceVerified);
}

/** Suscripción solo al estado (cambia cuando cambia el estado). */
export function useStoreState(): StoreState {
  useMounted();
  const state = useSyncExternalStore(subscribe, getState, getState);
  const authed = useSyncExternalStore(subscribe, getAuthed, getAuthed);
  const user = useSyncExternalStore(subscribe, getUser, getUser);
  const booting = useSyncExternalStore(subscribe, getBooting, getBooting);
  const deviceVerified = useSyncExternalStore(subscribe, getDeviceVerified, getDeviceVerified);
  return useMemo(
    () => ({ state, authed, user, booting, deviceVerified }),
    [state, authed, user, booting, deviceVerified]
  );
}

/** Suscripción solo a las acciones (identidad estable, no re-renderiza). */
export function useStoreActions(): StoreActions {
  const ctx = useContext(ActionsCtx);
  if (!ctx) throw new Error("useStoreActions debe usarse dentro de <StoreProvider>");
  return ctx;
}

/** API combinada (compatibilidad). */
export function useStore(): StoreValue {
  const { state, authed, user, booting, deviceVerified } = useStoreState();
  const actions = useStoreActions();
  return useMemo(
    () => ({ state, authed, user, booting, deviceVerified, ...actions }),
    [state, authed, user, booting, deviceVerified, actions]
  );
}
