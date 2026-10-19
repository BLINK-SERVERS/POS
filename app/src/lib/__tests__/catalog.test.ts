// Pruebas de la normalización del catálogo (Fase B).
// Cubre la etiqueta de presentación que se imprime en el ticket.
import { describe, expect, it } from "vitest";
import { presentationLabel, UNIT_OPTIONS } from "../types";

describe("presentationLabel", () => {
  it("combina cantidad y unidad", () => {
    expect(presentationLabel({ presentationQty: 500, unit: "g" })).toBe("500 g");
    expect(presentationLabel({ presentationQty: 1, unit: "unidad" })).toBe("1 unidad");
    expect(presentationLabel({ presentationQty: 750, unit: "ml" })).toBe("750 ml");
  });

  it("omite la cantidad si es 0 o inválida", () => {
    expect(presentationLabel({ presentationQty: 0, unit: "kg" })).toBe("kg");
    expect(presentationLabel({ presentationQty: NaN, unit: "L" })).toBe("L");
  });

  it("devuelve vacío si no hay unidad", () => {
    expect(presentationLabel({ presentationQty: 5, unit: "" })).toBe("");
  });
});

describe("UNIT_OPTIONS", () => {
  it("es una lista cerrada y sin duplicados", () => {
    expect(UNIT_OPTIONS.length).toBeGreaterThan(0);
    expect(new Set(UNIT_OPTIONS).size).toBe(UNIT_OPTIONS.length);
  });

  it("incluye las unidades base exigidas", () => {
    for (const u of ["unidad", "kg", "g", "mg", "L", "ml", "pack"]) {
      expect(UNIT_OPTIONS).toContain(u);
    }
  });
});
