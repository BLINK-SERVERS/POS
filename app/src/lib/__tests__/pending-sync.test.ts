// Regla de reconciliación local ↔ nube al volver a entrar (BLINK: datos que
// desaparecían al recargar justo después de guardar).
import { describe, expect, it } from "vitest";
import { cacheAdelantada } from "../sync";

const T = Date.parse("2026-11-05T10:00:00.000Z");

describe("cacheAdelantada", () => {
  it("manda la caché cuando hay marca pendiente y la nube está más atrás", () => {
    expect(cacheAdelantada({ pendiente: T + 5000, updatedAt: T, tieneContenido: true })).toBe(true);
  });

  it("sin marca pendiente manda la nube (guardado confirmado)", () => {
    expect(cacheAdelantada({ pendiente: null, updatedAt: T, tieneContenido: true })).toBe(false);
  });

  it("la caché vacía de una cuenta nueva nunca pisa la nube", () => {
    expect(cacheAdelantada({ pendiente: T + 5000, updatedAt: T, tieneContenido: false })).toBe(false);
  });

  it("sin fila en la nube, la caché con contenido es la autoridad", () => {
    expect(cacheAdelantada({ pendiente: T, updatedAt: null, tieneContenido: true })).toBe(true);
  });

  it("una escritura anterior a la fila no resurrecta datos viejos", () => {
    expect(cacheAdelantada({ pendiente: T - 1000, updatedAt: T, tieneContenido: true })).toBe(false);
  });
});
