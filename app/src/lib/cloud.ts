// Capa de nube (Supabase): autenticación real y persistencia del comercio.
//
// Solo se usa la clave pública (publishable/anon). La seguridad la impone
// Row Level Security en la base de datos: cada fila de `businesses` está
// atada a `auth.uid()`, así que nadie puede leer ni escribir datos ajenos.
import { supabase } from "./supabase";
import type { AppState } from "./types";

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

/** Traduce los errores frecuentes de Supabase Auth al español. */
export function authError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed"))
    return "Tu correo aún no está verificado. Revisa el código que te enviamos.";
  if (m.includes("user already registered")) return "Ese correo ya tiene una cuenta. Inicia sesión.";
  if (m.includes("password should be at least"))
    return "La contraseña es muy corta (mínimo 6 caracteres).";
  if (m.includes("unable to validate email")) return "El correo no es válido.";
  if (m.includes("token has expired") || m.includes("invalid token") || m.includes("otp expired"))
    return "El código no es válido o ya venció. Pide uno nuevo.";
  if (m.includes("signups not allowed") || m.includes("user not found"))
    return "Ese correo no tiene una cuenta. Regístrate primero.";
  if (m.includes("for security purposes") || m.includes("rate limit"))
    return "Demasiados intentos. Espera unos segundos y vuelve a intentar.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Sin conexión con el servidor. Revisa tu internet.";
  return message;
}

/** URL base de la app (para los enlaces que llegan por correo).
 *  En producción es la URL publicada; en local, el servidor de desarrollo. */
function appRedirectUrl(path = ""): string | undefined {
  try {
    return `${window.location.origin}${import.meta.env.BASE_URL}${path}`;
  } catch {
    return undefined;
  }
}

function nameFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
} | null): SessionUser | null {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return {
    id: String((user as { id?: string }).id ?? ""),
    email: user.email ?? "",
    firstName: typeof meta.first_name === "string" ? meta.first_name : "",
    lastName: typeof meta.last_name === "string" ? meta.last_name : "",
    phone: typeof meta.phone === "string" ? meta.phone : "",
  };
}

export function userFromSession(session: {
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> };
} | null): SessionUser | null {
  return nameFromUser(session?.user ?? null);
}

/** Registro con datos personales (nombre, apellido, teléfono, correo, clave). */
export async function authSignUp(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<{ error: string | null }> {
  // Usamos enlace mágico (link) en lugar de código de 6 dígitos.
  const { error } = await supabase.auth.signInWithOtp({
    email: input.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: appRedirectUrl(),
      data: {
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
      },
    },
  });
  return { error: error ? authError(error.message) : null };
}

/** Verificación por enlace: ya no usamos código OTP de 6 dígitos. */
export async function authVerifyCode(
  _email: string,
  _token: string
): Promise<{ error: string | null; userId?: string }> {
  return {
    error:
      "La verificación por enlace ya no usa código. Abre el enlace que recibiste en tu correo.",
  };
}

/** Reenvía el enlace mágico para alta de cuenta. */
export async function authResendCode(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: appRedirectUrl() },
  });
  return { error: error ? authError(error.message) : null };
}

/** Envía un enlace mágico (magic link) para verificar el equipo al entrar. */
export async function authSendDeviceCode(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: appRedirectUrl() },
  });
  return { error: error ? authError(error.message) : null };
}

/** No aplica: dejamos la verificación por enlace. */
export async function authVerifyLoginCode(
  _email: string,
  _token: string
): Promise<{ error: string | null; userId?: string }> {
  return {
    error:
      "Abre el enlace que recibiste en tu correo para verificar este equipo.",
  };
}

export async function authSignIn(
  email: string,
  password: string
): Promise<{ error: string | null; userId?: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error ? authError(error.message) : null, userId: data.user?.id };
}

export async function authSignOut(): Promise<void> {
  await supabase.auth.signOut();
}

/** Envía el enlace de recuperación de contraseña al correo. */
export async function authResetPassword(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    // El enlace lleva a la pantalla de nueva contraseña.
    redirectTo: appRedirectUrl("recuperar"),
  });
  return { error: error ? authError(error.message) : null };
}

/** Establece una nueva contraseña para la sesión de recuperación activa. */
export async function authUpdatePassword(newPassword: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error ? authError(error.message) : null };
}

/** Actualiza el perfil (nombre, apellido, teléfono) en los metadatos del usuario. */
export async function authUpdateProfile(input: {
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({
    data: { first_name: input.firstName, last_name: input.lastName, phone: input.phone },
  });
  return { error: error ? authError(error.message) : null };
}

/** Carga el comercio del usuario autenticado (o null si aún no existe). */
export async function cloudLoadBusiness(): Promise<{ name: string; data: Partial<AppState> } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("businesses")
    .select("name,data")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { name: data.name ?? "", data: (data.data ?? {}) as Partial<AppState> };
}

/** Guarda (crea o actualiza) el comercio del usuario autenticado. */
export async function cloudSaveBusiness(state: AppState): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from("businesses").upsert(
    {
      owner_id: user.id,
      name: state.business.name ?? "",
      data: state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "owner_id" }
  );
  if (error) throw new Error(error.message);
}

// ------------------------------------------------------------------
// Catálogo global colaborativo (migración 0004).
// Nivel 1 compartido: ficha descriptiva universal, clave = código de barras.
// Nivel 2 privado: `products` (precios, costo, IVA, stock) vive en el AppState.
//
// Seguridad: la tabla `catalogo_global` tiene RLS. Cualquier usuario
// autenticado LEE; solo owner/manager INSERTA. Nadie actualiza ni borra
// una ficha ajena (evita sabotear el catálogo de otras tiendas).
// ------------------------------------------------------------------

/** Ficha descriptiva universal de un producto del catálogo global. */
export interface CatalogEntry {
  barcode: string;
  /** Nombre normalizado (MAYÚSCULAS). */
  name: string;
  /** Cantidad de medida de la presentación (ej.: 500 en "500 g"). */
  presentationQty: number;
  /** Unidad de medida de la lista cerrada. */
  unit: string;
  category: string;
  /** Fabricante/marca: uso interno, nunca sale en el recibo. */
  brand: string;
}

/**
 * Busca una ficha por código de barras. Devuelve `null` si no existe,
 * si el navegador está sin sesión o si no hay conexión. Nunca lanza:
 * el alta de producto debe funcionar aunque el catálogo global falle.
 */
export async function catalogoLookup(barcode: string): Promise<CatalogEntry | null> {
  const code = barcode.trim();
  if (!code) return null;
  try {
    const { data, error } = await supabase
      .from("catalogo_global")
      .select("barcode,name,presentation_qty,unit,category,brand")
      .eq("barcode", code)
      .maybeSingle();
    if (error || !data) return null;
    return {
      barcode: String(data.barcode ?? ""),
      name: String(data.name ?? ""),
      presentationQty: Number(data.presentation_qty ?? 1),
      unit: String(data.unit ?? "unidad"),
      category: String(data.category ?? ""),
      brand: String(data.brand ?? ""),
    };
  } catch {
    return null;
  }
}

/**
 * Aporta (o refresca) una ficha al catálogo global. Solo se crea si no
 * existe: no pisa la ficha que ya pudieran estar usando otras tiendas.
 * Nunca lanza: el producto ya se guardó localmente; esto es red de apoyo.
 * Devuelve `true` si la ficha quedó registrada.
 */
export async function catalogoUpsert(entry: CatalogEntry): Promise<boolean> {
  const code = entry.barcode.trim();
  if (!code) return false;
  try {
    const { error } = await supabase.from("catalogo_global").insert({
      barcode: code,
      name: entry.name.trim().toUpperCase(),
      presentation_qty: Math.max(0, Number(entry.presentationQty) || 0),
      unit: entry.unit || "unidad",
      category: entry.category.trim(),
      brand: entry.brand.trim(),
    });
    // 23505 = violación de clave única: la ficha ya existe (otra tienda
    // la creó). No es un error: el catálogo global ya la tiene.
    if (error && error.code !== "23505") return false;
    return true;
  } catch {
    return false;
  }
}
