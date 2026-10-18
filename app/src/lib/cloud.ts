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
function appRedirectUrl(): string | undefined {
  try {
    return `${window.location.origin}${import.meta.env.BASE_URL}`;
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
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
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

/** Verifica el código de 6 dígitos del alta de cuenta. */
export async function authVerifyCode(
  email: string,
  token: string
): Promise<{ error: string | null; userId?: string }> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
  return { error: error ? authError(error.message) : null, userId: data.user?.id };
}

/** Reenvía el código del alta de cuenta. */
export async function authResendCode(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: appRedirectUrl() },
  });
  return { error: error ? authError(error.message) : null };
}

/** Envía un código de acceso al correo (verificación al entrar desde un equipo nuevo). */
export async function authSendDeviceCode(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: appRedirectUrl() },
  });
  return { error: error ? authError(error.message) : null };
}

/** Verifica el código de acceso del dispositivo y abre la sesión. */
export async function authVerifyLoginCode(
  email: string,
  token: string
): Promise<{ error: string | null; userId?: string }> {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  return { error: error ? authError(error.message) : null, userId: data.user?.id };
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
