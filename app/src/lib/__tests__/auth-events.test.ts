// Filtro de eventos de auth (BLINK-070): solo las entradas reales re-hidratan.
import { describe, expect, it } from "vitest";
import { rehidrataComercio } from "../auth-events";

describe("rehidrataComercio (BLINK-070)", () => {
  it("las entradas reales re-hidratan el comercio", () => {
    expect(rehidrataComercio("SIGNED_IN")).toBe(true);
    expect(rehidrataComercio("SIGNED_UP")).toBe(true);
    expect(rehidrataComercio("PASSWORD_RECOVERY")).toBe(true);
  });

  it("el refresco de token NO re-hidrata (era el loader intermitente horario)", () => {
    expect(rehidrataComercio("TOKEN_REFRESHED")).toBe(false);
  });

  it("la actualización de usuario NO re-hidrata (perfil/clave cambiados)", () => {
    expect(rehidrataComercio("USER_UPDATED")).toBe(false);
  });

  it("el arranque inicial tampoco (ya lo resolvió getSession)", () => {
    expect(rehidrataComercio("INITIAL_SESSION")).toBe(false);
  });
});
