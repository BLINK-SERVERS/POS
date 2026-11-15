// Forma del código que llega al correo (BLINK-097).
import { describe, expect, it } from "vitest";
import { CODIGO_LARGO, esCodigoValido } from "../otp";

describe("código del correo", () => {
  it("pide la cantidad de dígitos que emite el servidor", () => {
    // Medido el 2026-11-15 contra GET /v1/projects/{ref}/config/auth:
    // mailer_otp_length = 8. El componente de 6 casillas era huérfano.
    expect(CODIGO_LARGO).toBe(8);
  });

  it("acepta el código exacto, con o sin espacios", () => {
    expect(esCodigoValido("12345678")).toBe(true);
    expect(esCodigoValido(" 12345678 ")).toBe(true);
    expect(esCodigoValido("12345678 ")).toBe(true);
  });

  it("rechaza todo lo demás: ni de seis, ni de nueve, ni con letras", () => {
    for (const malo of ["", "1234567", "123456789", "1234-5678", "abc45678", "1234567o", "123456 78"]) {
      expect(esCodigoValido(malo)).toBe(false);
    }
  });
});
