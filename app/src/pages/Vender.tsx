// Vender — punto de venta (POS).
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { uid, useStoreActions, useStoreSelector, useSessionUser } from "../lib/store";
import {
  ACTIVE_TAB_KEY,
  DRAFTS_KEY,
  activeTabKeyFor,
  draftsKeyFor,
} from "../lib/session-storage";
import { Field, FormSection, Modal, PageHead, Badge, EmptyState } from "../components/ui";
import { Icon, type IconName } from "../components/Icon";
import { CameraScannerModal } from "../components/ScannerModals";
import { Receipt } from "../components/Receipt";
import { Searchbar } from "konsta/react";
import { useScanHandler, useScanner } from "../lib/scanner/ScannerProvider";
import { formatBsDirect, formatUsd, precioProducto, round2 } from "../lib/money";
import { saleTotal } from "../lib/metrics";
import {
  discountAmount,
  lineBase,
  lineBs,
  paidBs,
  saldoPendiente,
  saleBase,
  saleBsFromTotal,
  saleTax,
  surchargeAmount,
  ticketTotal,
  vuelto,
} from "../lib/fiscal";
import type {
  Account,
  Discount,
  Product,
  Sale,
  SaleLine,
  SalePayment,
  Surcharge,
} from "../lib/types";
import { presentationLabel } from "../lib/types";
import { buscarProductos, detalleProducto } from "../lib/orden";
import { Rapidos } from "../components/Rapidos";
import { SelectorCliente } from "../components/SelectorCliente";
import { DIAS_ROTACION, favoritos, mejorVendidos, rotacion } from "../lib/ventaRapida";

/**
 * Icono del método de pago (BLINK-135, dueño, 2026-11-21): celular para el Pago Móvil,
 * tarjeta para el punto de venta, fajo de billetes para lo cobrado en dólares y
 * cartera para el resto de la caja. Se decide con la ficha de la cuenta y con su
 * nombre, porque las cuentas las crea cada comercio.
 */
export function iconoMetodo(a: Account): IconName {
  const n = a.name.toLowerCase();
  if (a.type === "pago_movil" || /pago\s*m[oó]vil|m[oó]vil|phone|cell/.test(n)) return "phone";
  if (/punto|tarjeta|d[eé]bito|cr[eé]dito\s*card|\bpos\b|card/.test(n)) return "creditcard";
  if (a.currency === "USD") return "cash";
  return "wallet";
}

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

// Las claves viven en `session-storage.ts` y tienen variante por usuario
// (`draftsKeyFor` / `activeTabKeyFor`); las globales son la forma vieja, que
// solo se usa para heredar los datos la primera vez (BLINK-107).
/** Cuántos resultados se listan (y el tope que navegan las flechas). */
const RESULTADOS_MAX = 20;

/** Teclado físico a la vista: en el móvil no hay F4 ni F8 que pulsar. */
const HAY_TECLADO =
  typeof window !== "undefined" &&
  window.matchMedia?.("(pointer: fine)").matches === true;

/** Insignia discreta de tecla, solo en escritorio y solo en los dos botones
 *  grandes de la caja. El texto accesible sigue siendo el `title` del botón. */
function Kbd({ k }: { k: string }) {
  if (!HAY_TECLADO) return null;
  return (
    <kbd
      aria-hidden="true"
      className="mono"
      style={{
        marginLeft: "0.5rem",
        padding: "0 4px",
        border: "1px solid currentColor",
        borderRadius: 4,
        opacity: 0.6,
        fontSize: "0.68rem",
        lineHeight: "1.4",
      }}
    >
      {k}
    </kbd>
  );
}

function loadInitialDrafts(userId: string): { drafts: Draft[]; activeId: string } {
  // BLINK-107: las cuentas abiertas son del comercio, no del navegador. Igual
  // que el estado local (BLINK-083), se guardan bajo la clave del usuario; antes
  // eran una clave global y dos comercios en el mismo PC se pisaban las cuentas
  // entre sí, y `clearUserStorage` no las borraba al cerrar sesión.
  const keyDrafts = userId ? draftsKeyFor(userId) : DRAFTS_KEY;
  const keyActiva = userId ? activeTabKeyFor(userId) : ACTIVE_TAB_KEY;
  try {
    let raw = localStorage.getItem(keyDrafts);
    let active = localStorage.getItem(keyActiva) || "";
    // Primer ingreso del usuario: hereda lo que quedó bajo la clave global y la
    // elimina, para que el siguiente usuario del equipo no la lea.
    if (userId && !raw) {
      const vieja = localStorage.getItem(DRAFTS_KEY);
      if (vieja) {
        const viejaActiva = localStorage.getItem(ACTIVE_TAB_KEY) || "";
        localStorage.setItem(keyDrafts, vieja);
        if (viejaActiva) localStorage.setItem(keyActiva, viejaActiva);
        localStorage.removeItem(DRAFTS_KEY);
        localStorage.removeItem(ACTIVE_TAB_KEY);
        raw = vieja;
        active = viejaActiva;
      }
    }
    if (raw) {
      const parsed = JSON.parse(raw) as Draft[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { drafts: parsed, activeId: active || parsed[0].id };
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
  const taxes = useStoreSelector((s) => s.taxes);
  const sales = useStoreSelector((s) => s.sales);
  const pendings = useStoreSelector((s) => s.pendings);
  const { checkout, openCash, syncRate, addContact, updateProduct } = useStoreActions();

  // El POS es <Protected>, así que aquí la sesión ya existe; el `?? ""` cubre
  // el bypass de pruebas, que no tiene id real.
  const userId = useSessionUser()?.id ?? "";
  const [initial] = useState(() => loadInitialDrafts(userId));
  const [drafts, setDrafts] = useState<Draft[]>(initial.drafts);
  const [activeId, setActiveId] = useState<string>(initial.activeId);
  const [query, setQuery] = useState("");
  const [camOpen, setCamOpen] = useState(false);
  const [scanCode, setScanCode] = useState("");
  // Aviso de la regla BLINK-104: un precio fijo en Bs no se puede pasar a
  // dólares sin tasa, así que la línea no se agrega y se dice por qué.
  const [sinTasa, setSinTasa] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [discOpen, setDiscOpen] = useState(false);
  const [surOpen, setSurOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [openCashModal, setOpenCashModal] = useState(false);
  const [openUsd, setOpenUsd] = useState("0");
  const [openBs, setOpenBs] = useState("0");
  const [successSale, setSuccessSale] = useState<Sale | null>(null);
  // BLINK-139: al confirmar, un sello a pantalla completa dice «ya está» antes de
  // que se vea el comprobante. Se apaga solo; el recibo queda debajo.
  const [flash, setFlash] = useState(false);
  // Fila resaltada de los resultados (se mueve con ↑ ↓ y la selecciona Enter).
  const [sel, setSel] = useState(0);
  // Ventana de cliente que exige la venta a crédito.
  const [cliOpen, setCliOpen] = useState(false);
  // Línea del ticket en la que está el teclado cuando se opera sin ratón (F6).
  // Se guarda el id, no la posición: al quitar una línea las siguientes suben
  // de índice y el resaltado se perdería.
  const [lineaActiva, setLineaActiva] = useState<string | null>(null);

  // Persistir cuentas abiertas en localStorage (bajo la clave del usuario).
  useEffect(() => {
    try {
      localStorage.setItem(
        userId ? draftsKeyFor(userId) : DRAFTS_KEY,
        JSON.stringify(drafts)
      );
      localStorage.setItem(userId ? activeTabKeyFor(userId) : ACTIVE_TAB_KEY, activeId);
    } catch {
      /* ignore */
    }
  }, [drafts, activeId, userId]);

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
  // El orden (relevancia y luego alfabético) vive en `lib/orden.ts`; antes
  // salía en orden de alta, que es lo que se veía como "burbujas".
  const deferredQuery = useDeferredValue(query);
  const matches = useMemo(() => buscarProductos(catalog, deferredQuery), [catalog, deferredQuery]);

  // El resaltado vuelve a la primera fila cada vez que cambia la lista.
  useEffect(() => setSel(0), [deferredQuery]);

  // --- Venta rápida ---
  // Lo que fija la gente a mano (favoritos) y lo que fija la historia del caja
  // (rotación de los últimos 30 días). Un cálculo puro de `lib/ventaRapida.ts`.
  const unidades = useMemo(() => rotacion(sales, DIAS_ROTACION), [sales]);
  const favs = useMemo(() => favoritos(catalog), [catalog]);
  const top = useMemo(() => mejorVendidos(sales, catalog, { dias: DIAS_ROTACION }), [sales, catalog]);
  const fijarFavorito = useCallback(
    (id: string, valor: boolean) => updateProduct(id, { favorite: valor }),
    [updateProduct]
  );
  const hayRapidos = favs.length > 0 || top.length > 0;

  // --- Crédito ---
  // Cuánto debe cada cliente hoy. Solo informativo: el modelo operativo no
  // impone topes, así que la ventana nunca bloquea una venta por saldo.
  const saldos = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of pendings) {
      if (!p.contactId) continue;
      if (p.direction !== "cobrar" || p.status === "anulado" || p.status === "saldado") continue;
      m[p.contactId] = round2((m[p.contactId] ?? 0) + (p.amountUsd - p.paidUsd));
    }
    return m;
  }, [pendings]);

  // Alta rápida desde la propia venta: nombre y apellido obligatorios, el
  // resto opcional. Devuelve el id para seleccionarlo al instante.
  const registrarCliente = useCallback(
    (d: { nombre: string; apellido: string; cedula: string; telefono: string }) =>
      addContact({
        name: `${d.nombre} ${d.apellido}`.replace(/\s+/g, " ").trim(),
        document: d.cedula,
        docType: d.cedula ? "V" : "",
        phone: d.telefono,
        email: "",
        isClient: true,
        isProvider: false,
        creditDays: 30,
        address: "",
        notes: "",
      }),
    [addContact]
  );

  // Cantidad tecleada para el próximo producto (BLINK-132). Se guarda como texto
  // para poder vaciar el campo sin pelear con el cursor.
  const [cantidadTxt, setCantidadTxt] = useState("1");
  const cantidad = Math.max(1, Math.floor(Number(cantidadTxt) || 1));

  const addLine = useCallback(
    (id: string, unidades = 1) => {
      const p = catalog.find((x) => x.id === id);
      if (!p) return;
      // No deja vender más de lo disponible en productos con control de stock.
      const max = p.trackStock ? p.stock : Infinity;
      if (max < 1) return;
      const q = Math.min(Math.max(1, Math.floor(unidades) || 1), max);
      // BLINK-104: precio fijo en Bs. El Bs manda y el USD de la línea se
      // deriva con la tasa de este momento; por eso se guarda SIN redondear,
      // para que el redondeo a centavos ocurra una sola vez, al sumar la línea
      // (`lineBase`). Redondear aquí habría hecho que Bs 4.500,00 se cobraran
      // como Bs 4.503,38.
      const fijo = p.priceBs && p.priceBs > 0 ? p.priceBs : undefined;
      if (fijo && !(rate > 0)) {
        setSinTasa(
          `«${p.name}» tiene precio fijo en bolívares: sin tasa no se puede saber ` +
            "su equivalente en dólares. Configúrala en Ajustes → Moneda e impuestos."
        );
        return;
      }
      setSinTasa("");
      setDrafts((ds) =>
        ds.map((d) => {
          if (d.id !== draft.id) return d;
          const found = d.lines.find((l) => l.productId === id);
          if (found) {
            const nextQty = Math.min(found.qty + q, max);
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
              {
                productId: p.id,
                name: p.name,
                presentation: presentationLabel(p),
                qty: q,
                price: fijo ? fijo / rate : p.price,
                cost: p.cost,
                taxRate: p.taxRate,
                ...(fijo ? { priceBs: fijo } : {}),
              },
            ],
          };
        })
      );
      // Vale para el próximo toque, no para toda la caja.
      setCantidadTxt("1");
    },
    [catalog, draft.id, rate]
  );

  /** Suma con la cantidad tecleada; luego el campo vuelve a 1. */
  const agregar = useCallback(
    (id: string) => addLine(id, cantidad),
    [addLine, cantidad]
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

  // Tipear la cantidad de una línea ya puesta. Un campo vacío o un 0 no borra la
  // línea: para eso están el botón − y la tecla Supr.
  const setQtyExacta = useCallback(
    (id: string, texto: string) => {
      const v = Math.floor(Number(texto));
      if (!Number.isFinite(v) || v < 1) return;
      const p = catalog.find((x) => x.id === id);
      const max = p && p.trackStock ? p.stock : Infinity;
      if (max < 1) return;
      setQty(id, Math.min(v, max));
    },
    [catalog, setQty]
  );

  // Cortesía: el cliente no paga esa línea. Se conserva `price` en la fila
  // porque ese valor es lo que se imprime y lo que se reporta como regalado;
  // quien quita la cortesía devuelve el precio a la venta sin tocar la cantidad.
  const toggleCortesia = useCallback(
    (id: string) => {
      setDrafts((ds) =>
        ds.map((d) =>
          d.id === draft.id
            ? {
                ...d,
                lines: d.lines.map((l) =>
                  l.productId === id ? { ...l, cortesia: !l.cortesia } : l
                ),
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
  // La etiqueta del IVA depende de las tasas reales del ticket: no se afirma
  // 16 % cuando hay líneas al 8 %, exentas o mixtas (BLINK-016). `null` = sin
  // impuestos, la fila no se muestra.
  const ivaLabel = useMemo(() => {
    const rates = [...new Set(lines.map((l) => l.taxRate ?? 0))].filter((r) => r > 0);
    if (rates.length === 0) return null;
    if (rates.length > 1) return "IVA";
    const r = rates[0];
    const def = taxes.find((t) => Math.abs(t.rate - r) < 1e-9);
    return def?.name ?? `IVA (${round2(r * 100)}%)`;
  }, [lines, taxes]);
  const surchargeValue = useMemo(
    () => round2(appliedSurcharges.reduce((a, s) => a + surchargeAmount(s, net), 0)),
    [appliedSurcharges, net]
  );

  const newTab = useCallback(() => {
    const d = emptyDraft();
    setDrafts((ds) => [...ds, d]);
    setActiveId(d.id);
  }, []);

  /** Lo mismo que el botón grande: abrir caja si falta, si no, la ventana de cobro. */
  // Cada ronda de cobro empieza limpia: sin cobros y con el monto por escribir,
  // que la pantalla rellena con lo que falte. Se comparte con la apertura de
  // caja para que un monto viejo nunca arranque la ronda siguiente.
  const reiniciarCobro = useCallback(() => {
    setPayments([]);
    setCredit(false);
    setPayAmount("");
    setPayRef("");
    setPayError("");
  }, []);

  const abrirCobro = useCallback(() => {
    if (!lines.length) return;
    if (!cashSession) {
      setOpenCashModal(true);
      return;
    }
    reiniciarCobro();
    setPayOpen(true);
  }, [lines.length, cashSession, reiniciarCobro]);

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
  // BLINK-066: mensajería de los rechazos del checkout en el modal de cobro.
  const [payError, setPayError] = useState("");
  const [quoteError, setQuoteError] = useState("");

  // BLINK-106: el total del ticket y su equivalente en Bs salen de las mismas
  // funciones que usa el `checkout`. Si cada sitio suma sus partes por su lado,
  // el redondeo se aplica dos veces y el ticket puede imprimir un Bs distinto
  // del que la pantalla cobró.
  // BLINK-134: el IGTF ya no se calcula (dueño, 2026-11-21).
  const total = useMemo(
    () => ticketTotal(net, tax, surchargeValue),
    [net, tax, surchargeValue]
  );
  // BLINK-104: con precio fijo en Bs el total en bolívares no es `total × tasa`:
  // las líneas fijas aportan su Bs exacto y solo el resto se convierte.
  const hasFijos = lines.some((l) => Boolean(l.priceBs));
  const totalBs = useMemo(() => saleBsFromTotal(lines, rate, total), [lines, rate, total]);

  const payAccount = accounts.find((a) => a.id === payAccId && a.active);
  const cliente = contacts.find((c) => c.id === draft.customerId);
  const inUsd = payAccount?.currency === "USD";
  // BLINK-066: cobrar en bolívares sin tasa no puede asumir 1 Bs = 1 USD.
  const tasaValida = inUsd || rate > 0;

  // Lo que falta sobre los cobros YA registrados. Lo tecleado se cuenta aparte,
  // como cobro pendiente, para poder calcular el exacto y el vuelto sin dar la
  // vuelta sobre sí mismo.
  const faltaUsd = useMemo(
    () => saldoPendiente(total, payments, totalBs, rate).remaining,
    [total, payments, totalBs, rate]
  );
  const faltaBs = round2(Math.max(0, totalBs - paidBs(payments, rate)));
  // «Monto exacto» en la moneda del método elegido: lo que queda por cubrir.
  const exactAmount = !payAccount ? 0 : inUsd ? faltaUsd : tasaValida ? faltaBs : 0;

  // El cobro tecleado, todavía sin registrar. Es el mismo objeto que guarda
  // «Sumar otra cuenta», así que el cuadre y el vuelto se ven igual antes y
  // después de partir la cuenta.
  const cobroNuevo = useMemo<SalePayment | null>(() => {
    if (!payAccount || credit || !tasaValida) return null;
    const typed = round2(Number(payAmount) || 0);
    if (typed <= 0) return null;
    // La regla del vuelto vive en `fiscal.ts`: la pantalla y el `checkout`
    // coinciden porque los dos la consultan.
    const { charged, change } = vuelto(typed, exactAmount);
    const value = round2(charged / (inUsd ? 1 : rate));
    if (value <= 0) return null;
    return {
      method: payAccount.name,
      accountId: payAccount.id,
      amountUsd: value,
      currency: payAccount.currency,
      amountInput: charged,
      amountReceived: typed,
      change,
      reference: payRef.trim() || undefined,
    };
  }, [payAccount, credit, tasaValida, payAmount, payRef, inUsd, rate, exactAmount]);

  // Cobrar es UN paso (BLINK-137, dueño, 2026-11-21): lo tecleado ya cuenta como cobro, así
  // que «Confirmar venta» se habilita sin trámites intermedios. «Sumar otra
  // cuenta» sigue existiendo, pero para partir, no para poder confirmar.
  const cobros = useMemo(
    () => (cobroNuevo ? [...payments, cobroNuevo] : payments),
    [payments, cobroNuevo]
  );
  const paid = round2(cobros.reduce((a, p) => a + p.amountUsd, 0));
  const missing = useMemo(
    () => saldoPendiente(total, cobros, totalBs, rate).remaining,
    [total, cobros, totalBs, rate]
  );
  const missingBs = round2(Math.max(0, totalBs - paidBs(cobros, rate)));
  // El ticket está saldado cuando no queda nada por cobrar (el dinero se
  // cuantiza a 2 decimales, así que "missing" es 0 o ≥ 0,01).
  const settled = missing < 0.01;
  const needsCustomer = credit && !draft.customerId;

  // Vuelto en vivo, en las dos monedas, salido del propio cobro pendiente.
  const isOverpaying = Boolean(cobroNuevo?.change);
  const vueltoNativo = cobroNuevo?.change ?? 0;
  const liveChangeBs = round2(cobroNuevo?.currency === "VES" ? vueltoNativo : vueltoNativo * rate);
  const liveChangeUsd = round2(cobroNuevo?.currency === "VES" ? vueltoNativo / rate : vueltoNativo);
  // Equivalente en la otra moneda del cobro en curso.
  const amountUsd = cobroNuevo?.amountUsd ?? 0;

  // Al elegir el método —y después de partir la cuenta— el monto se escribe solo:
  // lo que falta, en la moneda del método. El cajero confirma sin teclear.
  useEffect(() => {
    if (!payOpen || !payAccount || credit) return;
    if (payAmount.trim() !== "" || !tasaValida || !(exactAmount > 0)) return;
    setPayAmount(String(exactAmount));
  }, [payOpen, payAccount, credit, tasaValida, exactAmount, payAmount]);

  const addPayment = useCallback(() => {
    if (!payAccount) return;
    if (!tasaValida) {
      setPayError("Configura la tasa de cambio antes de cobrar en bolívares.");
      return;
    }
    if (!cobroNuevo) return;
    setPayError("");
    setPayments((ps) => [...ps, cobroNuevo]);
    setPayAmount("");
    setPayRef("");
  }, [payAccount, tasaValida, cobroNuevo]);

  const finish = useCallback(() => {
    if (!lines.length) return;
    // Sin cobro completo debe marcarse "A crédito": evita ventas a crédito fantasma.
    if (!credit && !settled) return;
    // Wink: una venta a crédito exige cliente.
    if (credit && !draft.customerId) return;
    // BLINK-066: un cobro en bolívares exige tasa; sin ella no hay equivalencia en USD.
    if (cobros.some((p) => p.currency === "VES") && !(rate > 0)) {
      setPayError("Configura la tasa de cambio antes de cobrar en bolívares.");
      return;
    }

    const totalReceivedUsd = round2(
      cobros.reduce((a, p) => {
        const rec = p.amountReceived ?? p.amountInput ?? p.amountUsd;
        return a + (p.currency === "USD" ? rec : rec / rate);
      }, 0)
    );
    const totalChangeUsd = round2(
      cobros.reduce((a, p) => {
        if (!p.change) return a;
        return a + (p.currency === "USD" ? p.change : p.change / rate);
      }, 0)
    );
    // El Bs se suma en su propia moneda: pasar cada vuelto por USD y volver a
    // multiplicar por la tasa redondea dos veces y el sello/impreso diffiere
    // decenas de céntimos del número que el cajero acaba de entregar.
    const totalChangeBs = round2(
      cobros.reduce((a, p) => {
        if (!p.change) return a;
        return a + (p.currency === "USD" ? p.change * rate : p.change);
      }, 0)
    );

    const { sale, error } = checkout({
      lines,
      customerId: draft.customerId || undefined,
      discount: discountValue,
      discountId: discount?.id,
      surcharge: surchargeValue,
      surchargeIds: appliedSurcharges.map((s) => s.id),
      tax,
      notes: draft.notes,
      payments: cobros,
      amountReceived: totalReceivedUsd > 0 ? totalReceivedUsd : undefined,
      changeUsd: totalChangeUsd > 0 ? totalChangeUsd : undefined,
      changeBs: totalChangeBs > 0 ? totalChangeBs : undefined,
    });
    // BLINK-066/076: si el checkout rechazó (tasa o existencias), el modal
    // sigue abierto con el mensaje para corregir y volver a intentar.
    if (!sale) {
      setPayError(error ?? "No se pudo registrar la venta.");
      return;
    }

    // Reinicia la cuenta activa.
    const fresh = emptyDraft();
    setDrafts((ds) => ds.map((d) => (d.id === draft.id ? fresh : d)));
    setActiveId(fresh.id);
    setPayments([]);
    setPayAmount("");
    setPayRef("");
    setCredit(false);
    setPayError("");
    setPayOpen(false);
    setSuccessSale(sale);
  }, [
    lines, draft, discountValue, discount, surchargeValue, appliedSurcharges, tax,
    cobros, credit, checkout, settled, rate,
  ]);

  const saveQuote = useCallback(() => {
    if (!lines.length) return;
    setQuoteError("");
    const { sale, error } = checkout({
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
    if (!sale) {
      setQuoteError(error ?? "No se pudo generar la cotización.");
      return;
    }
    const fresh = emptyDraft();
    setDrafts((ds) => ds.map((d) => (d.id === draft.id ? fresh : d)));
    setActiveId(fresh.id);
    setPayOpen(false);
  }, [lines, draft, discountValue, discount, surchargeValue, appliedSurcharges, tax, checkout]);

  // --- Teclado de caja (PC) ---
  // F2 busca · F3 venta rápida · F4 cuenta nueva · F6 recorre la cuenta · F8
  // cobra · ↑ ↓ recorren los resultados (o la cuenta si hay una línea activa),
  // + y − cambian la cantidad, Supr quita la línea, Enter añade el resaltado y
  // 1-9 eligen la fila numerada · Esc cierra (o limpia la búsqueda). El Enter
  // del teclado numérico llega con la misma `e.key`, así que recorre estos
  // mismos caminos. Los atajos no se escriben en la pantalla: van en el `title`
  // de los botones y de la lista, salvo la insignia de tecla en los dos botones
  // grandes, que solo aparece cuando hay teclado físico.
  const selRef = useRef(sel);
  selRef.current = sel;

  useEffect(() => {
    if (!successSale) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1400);
    return () => clearTimeout(t);
  }, [successSale]);

  useEffect(() => {
    const visible = Math.min(matches.length, RESULTADOS_MAX);
    const modalAbierto =
      camOpen || payOpen || openCashModal || discOpen || surOpen || noteOpen || cliOpen || Boolean(successSale);
    const enCampo = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
    const enfocarBusqueda = () => {
      const campo = document.getElementById("pos-search") as HTMLInputElement | null;
      campo?.focus();
      campo?.select();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // Con una ventana abierta, el teclado es de la ventana. Esta guarda es la
      // que impide la colisión dentro de la propia app: F2/F4/F6/F8 se
      // disparaban también con el cobro, el descuento o el selector de cliente
      // montados, y F4 vaciaba la cuenta mientras se estaba cobrando. Esc sigue
      // pasando: es la tecla que cierra esas ventanas.
      if (modalAbierto && e.key !== "Escape") return;

      if (e.key === "F2") {
        e.preventDefault();
        enfocarBusqueda();
        return;
      }
      if (e.key === "F4") {
        e.preventDefault();
        newTab();
        return;
      }
      if (e.key === "F8") {
        e.preventDefault();
        abrirCobro();
        return;
      }
      if (e.key === "Escape") {
        if (camOpen) setCamOpen(false);
        else if (payOpen) setPayOpen(false);
        else if (openCashModal) setOpenCashModal(false);
        else if (discOpen) setDiscOpen(false);
        else if (surOpen) setSurOpen(false);
        else if (noteOpen) setNoteOpen(false);
        else if (successSale) setSuccessSale(null);
        else if (query) setQuery("");
        else return;
        e.preventDefault();
        return;
      }

      // --- Cuenta sin ratón ---
      // F6 recorre las líneas de la cuenta. Con una activa, ↑ ↓ cambian de
      // línea, + y − ajustan la cantidad y Supr la quita: así la cuenta se
      // arma, se corrige y se cobra sin levantar las manos del teclado.
      const moverLinea = (delta: number) => {
        if (!lines.length) {
          setLineaActiva(null);
          return;
        }
        const i = lines.findIndex((l) => l.productId === lineaActiva);
        const n = (i < 0 ? (delta > 0 ? -1 : 0) : i) + delta;
        setLineaActiva(lines[((n % lines.length) + lines.length) % lines.length].productId);
      };

      if (e.key === "F6") {
        e.preventDefault();
        if (lines.length) moverLinea(1);
        return;
      }

      const enCuenta = lineaActiva !== null && lines.some((l) => l.productId === lineaActiva);
      if (!enCuenta && lineaActiva !== null) setLineaActiva(null);

      if (enCuenta && !enCampo(e.target)) {
        const l = lines.find((x) => x.productId === lineaActiva);
        if (!l) return;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          moverLinea(e.key === "ArrowDown" ? 1 : -1);
          return;
        }
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          incLine(l.productId);
          return;
        }
        if (e.key === "-" || e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          setQty(l.productId, l.qty - 1);
          if (l.qty <= 1) setLineaActiva(null);
          return;
        }
      }

      if (visible === 0) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        // Las flechas viven en la lista de resultados: con el buscador abierto
        // son navegación, no desplazamiento de página. Dentro de cualquier otro
        // campo (un <select> de cobro, el buscador del selector de cliente)
        // mandan ellos: aquí no se interviene.
        const enBuscador = e.target === document.getElementById("pos-search");
        if (!enBuscador && enCampo(e.target)) return;
        e.preventDefault();
        setSel((s) => {
          const n = e.key === "ArrowDown" ? s + 1 : s - 1;
          return (n + visible) % visible;
        });
        return;
      }

      if (/^[1-9]$/.test(e.key)) {
        // La tecla coincide con el número que ya se ve en la fila. Se escribe
        // con la lista abierta y el foco fuera del campo: dentro del buscador
        // un «1» es el primer dígito de un SKU, no una orden.
        if (enCampo(e.target)) return;
        const i = Number(e.key) - 1;
        if (i >= visible) return;
        e.preventDefault();
        setSel(i);
        const p = matches[i];
        if (p) agregar(p.id);
        return;
      }

      if (e.key === "Enter") {
        // Enter —incluido el del teclado numérico— añade el resaltado. Con
        // cualquier ventana abierta ya no se llega aquí: la guarda del principio
        // deja el teclado en manos de la ventana, donde Enter es pagar.
        const enBusqueda = e.target === document.getElementById("pos-search");
        if (enCampo(e.target) && !enBusqueda) return;
        e.preventDefault();
        const p = matches[Math.min(selRef.current, visible - 1)];
        if (p) agregar(p.id);
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [
    matches, query, camOpen, payOpen, openCashModal, discOpen, surOpen, noteOpen, cliOpen,
    successSale, newTab, abrirCobro, agregar, lines, lineaActiva, incLine, setQty,
  ]);

  const activeDiscounts = useMemo(
    () => discounts.filter((d) => isDiscountValid(d)),
    [discounts]
  );

  return (
    <>
      <PageHead
        title="Vender"
        actions={
          <>
            {cashSession ? (
              <Badge tone="success" icon="check">Caja abierta</Badge>
            ) : (
              <Badge tone="warning" icon="alert">Caja cerrada</Badge>
            )}
            <button className="btn btn--primary" onClick={newTab} title="Cuenta nueva (F4)" data-tour="ventas-nueva-cuenta">
              <Icon name="plus" />
              Nueva cuenta
              <Kbd k="F4" />
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

      {/* BLINK-136 (dueño, 2026-11-21): la pantalla va directa al mostrador,
          sin subtítulos ni frases de tutorial; las pistas van en title/kbd. */}
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
            {/* La cantidad se escribe antes de tocar el producto: una caja de
                24 no son 24 toques (BLINK-132). */}
            <input
              className="pos__cantidad"
              type="number"
              min={1}
              step="1"
              inputMode="numeric"
              value={cantidadTxt}
              onChange={(e) => setCantidadTxt(e.target.value)}
              aria-label="Cantidad del próximo producto"
              title="Cantidad del próximo producto"
            />
            <button
              type="button"
              className="icon-btn icon-btn--accent"
              title="Escanear con la cámara"
              onClick={() => setCamOpen(true)}
            >
              <Icon name="scan" />
            </button>
          </div>
          <Rapidos
            favoritos={favs}
            masVendidos={top}
            unidades={unidades}
            onAdd={agregar}
            onUnfix={(id) => fijarFavorito(id, false)}
          />
          {sinTasa && !(rate > 0) && (
            <div className="scan-hint" role="alert">
              <span>{sinTasa}</span>
              <Link
                className="btn btn--soft btn--sm"
                to="/app/ajustes"
                onClick={() => setSinTasa("")}
              >
                Configurar tasa
              </Link>
            </div>
          )}
          {scanCode && (
            <div className="scan-hint">
              <span>
                “{scanCode}” no está en tu catálogo. Puedes registrarlo con su precio.
              </span>
              <Link
                className="btn btn--soft btn--sm"
                to={`/app/catalogo?barcode=${encodeURIComponent(scanCode)}`}
                onClick={() => setScanCode("")}
              >
                Crear producto
              </Link>
            </div>
          )}
          {deferredQuery && matches.length > 0 && (
            <ol className="search-results" role="listbox" aria-label="Resultados" data-tour="ventas-resultados" title="↑ ↓ recorrer · Enter o 1-9 añadir" onMouseLeave={() => setSel(0)}>
              {matches.slice(0, RESULTADOS_MAX).map((p: Product, i: number) => {
                const detalle = detalleProducto(p);
                return (
                  <li key={p.id} style={{ display: "flex", alignItems: "stretch" }}>
                    <button
                      type="button"
                      className={`search-results__item${i === sel ? " search-results__item--sel" : ""}`}
                      role="option"
                      aria-selected={i === sel}
                      style={{ flex: 1, width: "auto" }}
                      onMouseEnter={() => setSel(i)}
                      onClick={() => agregar(p.id)}
                    >
                      <span className="search-results__key">{i + 1}</span>
                      <span className="search-results__cell">
                        <span className="search-results__name">{p.name}</span>
                        {detalle && <span className="search-results__extra">{detalle}</span>}
                      </span>
                      <span
                        className="search-results__price tabular"
                        title={
                          p.priceBs
                            ? "Precio fijo en bolívares: este producto no sigue la tasa"
                            : undefined
                        }
                      >
                        {precioProducto(p.price, p.priceBs)}
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`icon-btn${p.favorite ? " icon-btn--accent" : ""}`}
                      style={{ minWidth: 36, minHeight: 36, alignSelf: "center", margin: "0 2px" }}
                      aria-pressed={Boolean(p.favorite)}
                      aria-label={p.favorite ? `Quitar ${p.name} de la venta rápida` : `Fijar ${p.name} en la venta rápida`}
                      title={p.favorite ? "Quitar de favoritos" : "Fijar en favoritos (F3)"}
                      onClick={() => fijarFavorito(p.id, !p.favorite)}
                    >
                      <Icon name="star" size="sm" />
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
          {!deferredQuery && !hayRapidos && (
            <div style={{ paddingTop: "1rem" }}>
              <EmptyState
                icon="scan"
            title="Escanea o busca"
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
                hint="Prueba con otro término o con el código de barras."
                action={
                  <Link className="btn btn--soft btn--sm" to={`/app/catalogo?barcode=${encodeURIComponent(query.trim())}`}>
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
                Cuenta vacía.
              </p>
            ) : (
              lines.map((l) => (
                <div
                  key={l.productId}
                  className="ticket__line"
                  data-tour="linea-cuenta"
                  style={
                    l.productId === lineaActiva
                      ? {
                          outline: "2px solid var(--color-accent)",
                          outlineOffset: 2,
                          borderRadius: "var(--radius-sm)",
                        }
                      : undefined
                  }
                >
                  <div style={{ fontWeight: 600 }}>
                    {l.name}
                    {l.presentation && l.qty === 1 ? <> {l.presentation}</> : ""}
                  </div>
                  <div className="tabular" style={{ textAlign: "right" }}>
                    {formatUsd(lineBase(l))}
                  </div>
                  <div className="ticket__qty">
                    <span className="stepper row gap-4">
                      <button onClick={() => setQty(l.productId, l.qty - 1)} aria-label="Quitar una unidad">
                        <Icon name="minus" />
                      </button>
                      <input
                        className="ticket__qty-input"
                        type="number"
                        min={1}
                        step="1"
                        inputMode="numeric"
                        value={l.qty}
                        onChange={(e) => setQtyExacta(l.productId, e.target.value)}
                        aria-label={`Cantidad de ${l.name}`}
                        title="Cantidad"
                      />
                      <button onClick={() => incLine(l.productId)} aria-label="Añadir una unidad">
                        <Icon name="plus" />
                      </button>
                    </span>
                    {/* BLINK-133 (dueño, 2026-11-21): la línea regalada se
                        marca con el icono de etiqueta, sin rótulo visible; la
                        palabra «cortesía» queda solo en el title. */}
                    <button
                      className={`btn btn--sm ${l.cortesia ? "btn--soft" : "btn--ghost"}`}
                      title={l.cortesia ? "Quitar la cortesía y cobrar esta línea" : "Regalar esta línea (no se cobra)"}
                      aria-pressed={Boolean(l.cortesia)}
                      onClick={() => toggleCortesia(l.productId)}
                    >
                      <Icon name="tag" size="sm" />
                    </button>
                    <span className="dim" style={{ fontSize: "0.72rem" }}>
                      {formatUsd(l.price)} c/u
                    </span>
                  </div>
                  <div className="dim tabular" style={{ textAlign: "right", fontSize: "0.72rem" }}>
                    {(l.priceBs || rate > 0) && (
                      <>
                        {formatBsDirect(lineBs(l, rate))}
                        {l.priceBs ? (
                          <span title="Precio fijo en bolívares: este producto no sigue la tasa">
                            {" "}
                            · fijo
                          </span>
                        ) : null}
                      </>
                    )}
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
            {ivaLabel && (
              <div className="total-row">
                <span>{ivaLabel}</span>
                <span className="tabular">+ {formatUsd(tax)}</span>
              </div>
            )}
            <div className="total-row total-row--grand">
              <span>Total</span>
              <span className="tabular">{formatUsd(total)}</span>
            </div>
            <div className="dim tabular" style={{ textAlign: "right" }}>
              {rate > 0 || hasFijos ? formatBsDirect(totalBs) : "— Bs"}
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
            {quoteError && (
              <p className="form-error" role="alert">{quoteError}</p>
            )}

            <button
              className="btn btn--primary btn--block"
              disabled={!lines.length}
              onClick={abrirCobro}
              title="Cobrar (F8)"
              style={{ marginTop: "0.5rem" }}
            ><Icon name="cash" /> 
              {cashSession ? "Cobrar" : "Abrir caja y cobrar"}
              <Kbd k="F8" />
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
            />
          </Field>
        </Modal>
      )}

      {/* --- Cobrar --- */}
      {payOpen && (
        <Modal title="Cobrar" onClose={() => setPayOpen(false)}>
          <FormSection title="Pago">
          <Field
            label="Cliente"
            hint={
              credit
                ? "Obligatorio: una venta a crédito se apunta al saldo de un cliente."
                : "Opcional. Deja vacío para consumidor final."
            }
          >
            <div className="row gap-8">
              <button
                type="button"
                className="btn btn--soft"
                data-tour="cobro-cliente"
                style={{ flex: 1, justifyContent: "space-between" }}
                onClick={() => setCliOpen(true)}
              >
                <span>
                  {cliente ? cliente.name : "Consumidor final"}
                  {cliente && saldos[cliente.id] ? (
                    <span className="dim"> · debe {formatUsd(saldos[cliente.id])}</span>
                  ) : null}
                </span>
                <Icon name="chevronRight" size="sm" />
              </button>
              {draft.customerId && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => patchDraft({ customerId: "" })}
                >
                  <Icon name="close" />
                  Quitar
                </button>
              )}
            </div>
          </Field>

          <Field label="Método de pago" as="group">
            <div className="row gap-8" style={{ flexWrap: "wrap" }}>
              {accounts
                .filter((a) => a.active)
                .map((a) => (
                  <button
                    key={a.id}
                    className={`btn ${payAccId === a.id ? "btn--primary" : "btn--soft"} btn--sm`}
                    onClick={() => {
                      // Cambiar de cuenta cambia también la moneda del campo:
                      // el monto auto-escrito para la cuenta anterior no sirve,
                      // y conservarlo dejaba cobrando en Bs un número escrito
                      // en dólares. Se limpia y el efecto lo reescribe exacto.
                      setPayAmount("");
                      setPayAccId(a.id);
                      setCredit(false);
                      setPayError("");
                    }}
                  >
                    <Icon name={iconoMetodo(a)} size="sm" />
                    {a.name}
                    <span className="dim"> · {a.currency}</span>
                  </button>
                ))}
              <button
                className={`btn ${credit ? "btn--primary" : "btn--soft"} btn--sm`}
                data-tour="cobro-credito"
                onClick={() => {
                  setCredit(true);
                  setPayAccId("");
                  setPayAmount("");
                  setPayError("");
                  // La venta a crédito exige deudor: se abre la ventana en el
                  // mismo instante, sin dejar al cajero buscando el campo.
                  if (!draft.customerId) setCliOpen(true);
                }}
              >
                <Icon name="wallet" size="sm" />
                A crédito
              </button>
            </div>
          </Field>
          </FormSection>

          <FormSection title="Monto">
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
              <span className="tabular dim">
                {rate > 0 || hasFijos ? formatBsDirect(missingBs) : "Configura la tasa"}
              </span>
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
                    {p.change != null && p.change > 0 && (
                      <span className="dim"> (Vuelto: {p.currency === "VES" ? formatBsDirect(p.change) : formatUsd(p.change)})</span>
                    )}
                  </span>
                  <span className="tabular">{formatUsd(p.amountUsd)}</span>
                </div>
              ))}
            </div>
          )}

          {payAccount && !credit && (
            <>
              {/* BLINK-066: sin tasa no se puede cobrar en bolívares. */}
              {!inUsd && !(rate > 0) && (
                <p className="form-error" role="alert">
                  No hay tasa oficial configurada: sin ella no se puede cobrar en
                  bolívares. Configúrala en Ajustes → Moneda e impuestos.
                </p>
              )}
              <Field
                label={`Monto (${payAccount.currency})`}
              >
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  onKeyDown={(e) => {
                    // Teclado numérico: Enter añade el cobro; si no hay monto
                    // escrito, Enter cierra la venta (lo que hace el botón).
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    if (round2(Number(payAmount) || 0) > 0) addPayment();
                    else finish();
                  }}
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
                  disabled={!(inUsd || rate > 0)}
                  title="Dejar escrito justo lo que falta"
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
                      {payAccount?.currency === "VES"
                        ? formatBsDirect(vueltoNativo)
                        : formatUsd(vueltoNativo)}
                    </span>
                  </div>
                  <div className="between dim" style={{ fontSize: "0.75rem", marginTop: 2 }}>
                    <span>Equivalente en {payAccount?.currency === "VES" ? "dólares" : "bolívares"}:</span>
                    <span className="mono">
                      {payAccount?.currency === "VES"
                        ? formatUsd(liveChangeUsd)
                        : formatBsDirect(liveChangeBs)}
                    </span>
                  </div>
                </div>
              )}

              <Field label="Referencia (opcional)">
                <input
                  className="input"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                />
              </Field>

              {/* Partir la cuenta sigue siendo opcional: se usa cuando se cobra
                  en dos cuentas, no para poder confirmar. */}
              <button
                className="btn btn--soft btn--block"
                onClick={addPayment}
                disabled={!cobroNuevo}
                style={{ marginBottom: "0.75rem" }}
              >
                <Icon name="plus" />
                Sumar otra cuenta
              </button>
            </>
          )}
          </FormSection>

          {credit && (
            <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
              {draft.customerId
                ? `Se registrará la venta a crédito: genera una cuenta por cobrar por ${formatUsd(missing)}.`
                : "Una venta a crédito necesita un cliente: selecciónalo arriba."}
            </p>
          )}

          {!credit && !settled && cobros.length > 0 && (
            <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
              Falta por cobrar {formatUsd(missing)}. Cobra el total o marca «A crédito» para dejar
              el saldo pendiente.
            </p>
          )}

          {payError && (
            <p className="form-error" role="alert" style={{ marginBottom: "0.5rem" }}>
              {payError}
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
              reiniciarCobro();
              setPayOpen(true);
            }}
          ><Icon name="plus" /> <Icon name="check" /> 
            Confirmar apertura y continuar
          </button>
        </Modal>
      )}

      {/* --- BLINK-139: confirmación visual de la venta --- */}
      {successSale && flash && (
        <div className="venta-ok" role="status" aria-live="polite">
          <Icon name="checkmarkCircle" size="xl" />
          <p className="venta-ok__total tabular">{formatUsd(saleTotal(successSale))}</p>
          <p className="venta-ok__meta">{successSale.paymentMethod}</p>
          {successSale.changeUsd != null && successSale.changeUsd > 0 && (
            <p className="venta-ok__vuelto tabular">
              Vuelto {formatUsd(successSale.changeUsd)}
              {successSale.changeBs != null && successSale.changeBs > 0
                ? ` · ${formatBsDirect(successSale.changeBs)}`
                : ""}
            </p>
          )}
        </div>
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
          hint="Se suma lo que leas; “Continuar” deja seguir escaneando."
          footer={
            scanCode ? (
              <div className="scan-hint" style={{ marginTop: "0.75rem" }}>
                <span>“{scanCode}” no está en tu catálogo.</span>
                <Link
                  className="btn btn--soft btn--sm"
                  to={`/app/catalogo?barcode=${encodeURIComponent(scanCode)}`}
                  onClick={() => setCamOpen(false)}
                >
                  Crear producto
                </Link>
              </div>
            ) : undefined
          }
        />
      )}
      {cliOpen && (
        <SelectorCliente
          contacts={contacts}
          saldos={saldos}
          value={draft.customerId}
          onPick={(id) => patchDraft({ customerId: id })}
          onClose={() => setCliOpen(false)}
          onCreate={registrarCliente}
        />
      )}
    </>
  );
}
