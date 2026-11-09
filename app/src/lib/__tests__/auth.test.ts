// Pruebas del alta, la recuperación y la traducción de errores de Supabase Auth.
//
// Existen porque los textos que ve el comercio son la única señal de que algo
// falló del lado del servidor (BLINK-046, BLINK-059 y BLINK-063 del expediente
// de hallazgos). Se mockea `../supabase` para no tocar la red.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  resend: vi.fn(),
  signInWithOtp: vi.fn(),
  signInWithPassword: vi.fn(),
  resetPasswordForEmail: vi.fn(),
}));

vi.mock("../supabase", () => ({
  supabase: { auth: mocks },
  consumeLinkAuthType: () => null,
}));

import {
  authError,
  authResendCode,
  authResetPassword,
  authSendDeviceCode,
  authSignIn,
  authSignUp,
} from "../cloud";

const ORIGIN = "https://pos.ejemplo.com";
const BASE = import.meta.env.BASE_URL || "/";
const appUrl = (path: string) => `${ORIGIN}${BASE}${path}`;

/** Usuario tal como lo devuelve Supabase: con `identities` cuando el alta es nueva. */
const usuario = (nueva = true) => ({
  id: "u-1",
  email: "ana@ejemplo.com",
  identities: nueva ? [{ provider: "email" }] : [],
});

const registro = {
  email: "  ana@ejemplo.com ",
  password: "secreta123",
  firstName: "Ana",
  lastName: "Pérez",
  phone: "+58 412 000 0000",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.signUp.mockResolvedValue({ data: { session: null, user: usuario() }, error: null });
  mocks.resend.mockResolvedValue({ error: null });
  mocks.signInWithOtp.mockResolvedValue({ error: null });
  mocks.signInWithPassword.mockResolvedValue({
    data: { user: usuario(), session: { access_token: "t" } },
    error: null,
  });
  mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
  // `appRedirectUrl` lee `window.location`; en Node no existe, así que se simula.
  vi.stubGlobal("window", { location: { origin: ORIGIN } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("authSignUp", () => {
  it("da de alta con contraseña, recorta el correo y manda el enlace a /app/confirmar", async () => {
    const result = await authSignUp(registro);

    expect(result.error).toBeNull();
    expect(result.outcome).toBe("verificacion");
    expect(mocks.signUp).toHaveBeenCalledWith({
      email: "ana@ejemplo.com",
      password: "secreta123",
      options: {
        emailRedirectTo: appUrl("app/confirmar"),
        data: { first_name: "Ana", last_name: "Pérez", phone: "+58 412 000 0000" },
      },
    });
  });

  it("avisa cuando el alta ya quedó con sesión (confirmación de correo desactivada)", async () => {
    mocks.signUp.mockResolvedValue({
      data: { session: { access_token: "t" }, user: usuario() },
      error: null,
    });
    expect(await authSignUp(registro)).toEqual({ error: null, outcome: "sesion" });
  });

  it("detecta el alta duplicada: Supabase responde 200 sin sesión y sin identities", async () => {
    mocks.signUp.mockResolvedValue({ data: { session: null, user: usuario(false) }, error: null });
    expect(await authSignUp(registro)).toEqual({ error: null, outcome: "duplicado" });
  });

  it("no dice «te enviamos el enlace» si Supabase no devolvió usuario", async () => {
    mocks.signUp.mockResolvedValue({ data: { session: null, user: null }, error: null });
    const result = await authSignUp(registro);
    expect(result.outcome).toBeNull();
    expect(result.error).toMatch(/No pudimos crear la cuenta/);
  });

  it("traduce el tope de correos como saturación del servicio, no como culpa del usuario", async () => {
    mocks.signUp.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: "Email rate limit exceeded" },
    });
    const result = await authSignUp(registro);
    expect(result.error).toMatch(/servicio de correo está saturado/);
    expect(result.error).toMatch(/la cuenta no se creó/);
    expect(result.outcome).toBeNull();
  });
});

describe("destinos de los enlaces de correo", () => {
  it("reenvía la confirmación al mismo destino del alta", async () => {
    await authResendCode("ana@ejemplo.com");
    expect(mocks.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "ana@ejemplo.com",
      options: { emailRedirectTo: appUrl("app/confirmar") },
    });
  });

  it("envía el enlace del equipo a /app/confirmar", async () => {
    await authSendDeviceCode("ana@ejemplo.com");
    expect(mocks.signInWithOtp).toHaveBeenCalledWith({
      email: "ana@ejemplo.com",
      options: { shouldCreateUser: false, emailRedirectTo: appUrl("app/confirmar") },
    });
  });

  it("recupera la contraseña en /app/recuperar", async () => {
    await authResetPassword("  ana@ejemplo.com ");
    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith("ana@ejemplo.com", {
      redirectTo: appUrl("app/recuperar"),
    });
  });
});

describe("authError", () => {
  it("explica el caso de la cuenta sin verificar", () => {
    expect(authError("Invalid login credentials")).toMatch(/abre el enlace de verificación/);
    expect(authError("Email not confirmed")).toMatch(/correo aún no está verificado/i);
  });

  it("traduce el dominio inválido en vez de mostrar el inglés", () => {
    expect(authError('Email address "x@y.test" is invalid')).toMatch(/correo no es válido/i);
  });

  it("dice qué hacer cuando la redirección no está autorizada en Supabase", () => {
    expect(authError("Redirect URL of https://otro.site is not in allow list")).toMatch(
      /Redirect URLs/
    );
  });

  it("distingue el enlace ya usado del código vencido", () => {
    expect(authError("invalid code challenge")).toMatch(/ya se usó o perdió el código/i);
    expect(authError("Token has expired")).toMatch(/Pide uno nuevo/);
  });

  it("separa el registro desactivado del correo inexistente", () => {
    expect(authError("Signups not allowed for this project")).toMatch(/registro de cuentas está desactivado/i);
    expect(authError("User not found")).toMatch(/no tiene una cuenta/i);
  });
});

describe("authSignIn", () => {
  it("devuelve el id del usuario cuando entra", async () => {
    const r = await authSignIn("ana@ejemplo.com", "secreta123");
    expect(r.error).toBeNull();
    expect(r.userId).toBe("u-1");
  });

  it("traduce las credenciales incorrectas", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });
    const r = await authSignIn("ana@ejemplo.com", "mal");
    expect(r.error).toMatch(/Correo o contraseña incorrectos/);
  });
});
