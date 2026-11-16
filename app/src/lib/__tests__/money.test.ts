// Etiqueta de precio del catálogo con precio fijo en Bs (BLINK-104).
import { describe, expect, it } from "vitest";
import { precioProducto } from "../money";

describe("precioProducto", () => {
  it("muestra el dólar cuando el producto no tiene precio fijo", () => {
    expect(precioProducto(10)).toBe("$ 10.00");
    expect(precioProducto(10, 0)).toBe("$ 10.00");
  });

  it("pone el Bs al frente cuando hay precio fijo, y deja el dólar si existe", () => {
    expect(precioProducto(0.51, 450)).toBe("$ 0.51 · Bs 450,00 fijo");
  });

  it("no muestra un $ 0.00 al lado de un producto anotado solo en bolívares", () => {
    expect(precioProducto(0, 450)).toBe("Bs 450,00 fijo");
  });
});
