// Activación y conciliación del pago (migración 0005).
//
// Blink POS cuesta 25 USD cada 30 días. La cuenta nace sin comercio; el
// comercio solo se crea cuando un administrador concilia el pago. Toda la
// lógica sensible vive en la base de datos (RLS + funciones `security
// definer`); aquí solo se consulta y se llaman esas funciones.
import { supabase } from "./supabase";

/** Precio de la suscripción. */
export const PRECIO_USD = 25;
/** Días que cubre cada pago. */
export const DIAS_VIGENCIA = 30;
/** Destino de los pagos. Única fuente: no repetir estos datos en pantallas. */
export const PAGO = {
  pagoMovil: {
    cedula: "34201580",
    telefono: "0424 6603660",
    banco: "BNC (0102)",
    titular: "Blink POS",
  },
  binancePayId: "1130279410",
} as const;

export type EstadoActivacion = "pendiente" | "en_revision" | "activo" | "rechazado";
/** Estado que ve el usuario: «activo» con fecha pasada cuenta como vencido. */
export type EstadoReal = EstadoActivacion | "vencido";
export type MetodoPago = "pago_movil" | "binance_pay" | "usdt" | "usdc" | "btc" | "eth" | "otro";

export interface Activacion {
  userId: string;
  email: string;
  nombre: string;
  estado: EstadoActivacion;
  montoUsd: number;
  metodo: MetodoPago | null;
  tasaVes: number | null;
  vigenteDesde: string | null;
  vigenteHasta: string | null;
  purgeEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface PagoActivacion {
  id: string;
  userId: string;
  email: string;
  metodo: MetodoPago;
  moneda: string;
  monto: number;
  montoUsd: number;
  tasaVes: number | null;
  referencia: string;
  nota: string | null;
  estado: "en_revision" | "aprobado" | "rechazado";
  creadoEn: string;
  revisadoEn: string | null;
  motivo: string | null;
}

/* ------------------------------------------------------------------ */
/* Ayudas puras (probadas en activacion.test.ts)                       */
/* ------------------------------------------------------------------ */

type Fila = Record<string, unknown>;

export function filaAActivacion(row: Fila): Activacion {
  return {
    userId: String(row.user_id ?? ""),
    email: String(row.email ?? ""),
    nombre: String(row.nombre ?? ""),
    estado: (row.estado as EstadoActivacion) ?? "pendiente",
    montoUsd: Number(row.monto_usd ?? PRECIO_USD),
    metodo: (row.metodo as MetodoPago | null) ?? null,
    tasaVes: row.tasa_ves == null ? null : Number(row.tasa_ves),
    vigenteDesde: (row.vigente_desde as string | null) ?? null,
    vigenteHasta: (row.vigente_hasta as string | null) ?? null,
    purgeEn: (row.purge_en as string | null) ?? null,
    creadoEn: String(row.creado_en ?? ""),
    actualizadoEn: String(row.actualizado_en ?? ""),
  };
}

export function filaAPago(row: Fila): PagoActivacion {
  return {
    id: String(row.id ?? ""),
    userId: String(row.user_id ?? ""),
    email: String(row.email ?? ""),
    metodo: (row.metodo as MetodoPago) ?? "otro",
    moneda: String(row.moneda ?? "VES"),
    monto: Number(row.monto ?? 0),
    montoUsd: Number(row.monto_usd ?? PRECIO_USD),
    tasaVes: row.tasa_ves == null ? null : Number(row.tasa_ves),
    referencia: String(row.referencia ?? ""),
    nota: (row.nota as string | null) ?? null,
    estado: (row.estado as PagoActivacion["estado"]) ?? "en_revision",
    creadoEn: String(row.creado_en ?? ""),
    revisadoEn: (row.revisado_en as string | null) ?? null,
    motivo: (row.motivo as string | null) ?? null,
  };
}

/** Estado efectivo. Sin activación no se bloquea (compatibilidad). */
export function estadoReal(a: Activacion | null | undefined, ahora = Date.now()): EstadoReal {
  if (!a) return "activo";
  if (a.estado === "activo" && a.vigenteHasta && new Date(a.vigenteHasta).getTime() <= ahora) {
    return "vencido";
  }
  return a.estado;
}

/** ¿Puede usar el POS ahora mismo? */
export function puedeOperar(a: Activacion | null | undefined, ahora = Date.now()): boolean {
  return estadoReal(a, ahora) === "activo";
}

export interface Restante {
  ms: number;
  vencido: boolean;
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
}

/** Tiempo que queda hasta una fecha (null si no hay fecha válida). */
export function restante(iso: string | null | undefined, ahora = Date.now()): Restante | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - ahora;
  if (!Number.isFinite(ms)) return null;
  const positivo = Math.max(0, ms);
  return {
    ms,
    vencido: ms <= 0,
    dias: Math.floor(positivo / 86_400_000),
    horas: Math.floor((positivo % 86_400_000) / 3_600_000),
    minutos: Math.floor((positivo % 3_600_000) / 60_000),
    segundos: Math.floor((positivo % 60_000) / 1000),
  };
}

/** «2 días 4 h», «41 min 8 s» o «vencido». */
export function restanteTexto(iso: string | null | undefined, ahora = Date.now()): string {
  const r = restante(iso, ahora);
  if (!r) return "";
  if (r.vencido) return "vencido";
  if (r.dias > 0) return `${r.dias} ${r.dias === 1 ? "día" : "días"} ${r.horas} h`;
  if (r.horas > 0) return `${r.horas} h ${r.minutos} min`;
  if (r.minutos > 0) return `${r.minutos} min ${r.segundos} s`;
  return `${r.segundos} s`;
}

/** Fecha corta legible en español (ej.: 7 nov 2026, 14:32). */
export function fechaCorta(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Nombre legible de un método de pago. */
export function nombreMetodo(m: MetodoPago | string | null | undefined): string {
  switch (m) {
    case "pago_movil":
      return "Pago Móvil";
    case "binance_pay":
      return "Binance Pay";
    case "usdt":
      return "USDT";
    case "usdc":
      return "USDC";
    case "btc":
      return "BTC";
    case "eth":
      return "ETH";
    default:
      return "Otro";
  }
}

/* ------------------------------------------------------------------ */
/* Acceso a la nube                                                    */
/* ------------------------------------------------------------------ */

export async function cloudLoadActivacion(): Promise<Activacion | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("activaciones")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? filaAActivacion(data as Fila) : null;
}

export async function cloudEsAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("es_admin_plataforma");
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
}

export async function cloudReportarPago(input: {
  metodo: MetodoPago;
  moneda: string;
  monto: number;
  tasa: number | null;
  referencia: string;
  nota?: string | null;
}): Promise<{ error: string | null; id?: string }> {
  const { data, error } = await supabase.rpc("reportar_pago", {
    p_metodo: input.metodo,
    p_moneda: input.moneda,
    p_monto: input.monto,
    p_tasa: input.tasa,
    p_referencia: input.referencia,
    p_nota: input.nota ?? null,
  });
  return { error: error ? error.message : null, id: (data as string) ?? undefined };
}

/** Pagos visibles por RLS: los propios o todos si es administrador. */
export async function cloudListarPagos(): Promise<PagoActivacion[]> {
  const { data, error } = await supabase
    .from("pagos_activacion")
    .select("*")
    .order("creado_en", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => filaAPago(r as Fila));
}

/** Activaciones visibles por RLS (todas si es administrador). */
export async function cloudListarActivaciones(): Promise<Activacion[]> {
  const { data, error } = await supabase
    .from("activaciones")
    .select("*")
    .order("creado_en", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => filaAActivacion(r as Fila));
}

export async function cloudDecidirPago(
  pagoId: string,
  aprobar: boolean,
  motivo?: string | null
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("decidir_pago", {
    p_pago: pagoId,
    p_aprobar: aprobar,
    p_motivo: motivo ?? null,
  });
  return { error: error ? error.message : null };
}

export async function cloudEliminarCuenta(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("eliminar_cuenta", { p_user: userId });
  return { error: error ? error.message : null };
}

/** Purga las cuentas vencidas. Devuelve cuántas se borraron. */
export async function cloudPurgar(): Promise<{ error: string | null; total: number }> {
  const { data, error } = await supabase.rpc("purgar_activaciones");
  return { error: error ? error.message : null, total: Number(data ?? 0) };
}
