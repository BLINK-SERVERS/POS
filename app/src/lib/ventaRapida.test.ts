// Pruebas de la venta rápida: qué entra en «más vendidos», en qué orden y qué
// se excluye. Son puras: no tocan React ni el almacén.
import { describe, expect, it } from "vitest";
import { favoritos, mejorVendidos, rotacion, DIAS_ROTACION } from "./ventaRapida";
import type { Product, Sale, SaleLine } from "./types";

const AHORA = new Date("2026-11-15T12:00:00Z").getTime();
const ISO = (diasAtras: number) => new Date(AHORA - diasAtras * 86_400_000).toISOString();

function producto(id: string, extra: Partial<Product> = {}): Product {
  return {
    id,
    name: id,
    brand: "",
    sku: id,
    barcode: "",
    presentationQty: 1,
    unit: "u",
    cost: 1,
    price: 2,
    channelPrices: {},
    category: "",
    taxRate: 0,
    active: true,
    archived: false,
    trackStock: false,
    stock: 0,
    minStock: 0,
    ...extra,
  };
}

function linea(productId: string, qty: number, extra: Partial<SaleLine> = {}): SaleLine {
  return { productId, name: productId, qty, price: 2, cost: 1, taxRate: 0, ...extra };
}

function venta(lines: SaleLine[], extra: Partial<Sale> = {}): Sale {
  return {
    id: `v${Math.random().toString(36).slice(2)}`,
    code: "000001",
    at: ISO(1),
    lines,
    status: "cobrada",
    discount: 0,
    surcharge: 0,
    tax: 0,
    igtf: 0,
    notes: "",
    payments: [],
    userId: "u",
    ...extra,
  };
}

describe("rotacion", () => {
  it("suma las unidades de las ventas de la ventana", () => {
    const r = rotacion([venta([linea("a", 2), linea("b", 1)]), venta([linea("a", 3)])], DIAS_ROTACION, AHORA);
    expect(r.get("a")).toBe(5);
    expect(r.get("b")).toBe(1);
  });

  it("ignora anuladas y cotizaciones", () => {
    const r = rotacion(
      [
        venta([linea("a", 5)], { status: "anulada" }),
        venta([linea("a", 5)], { status: "cotizacion" }),
        venta([linea("a", 2)]),
      ],
      DIAS_ROTACION,
      AHORA
    );
    expect(r.get("a")).toBe(2);
  });

  it("corta por fecha: lo viejo fuera de la ventana no pesa", () => {
    const r = rotacion([venta([linea("a", 9)], { at: ISO(60) }), venta([linea("a", 1)])], 30, AHORA);
    expect(r.get("a")).toBe(1);
  });

  it("no cuenta las cortesías: un regalo no es demanda", () => {
    const r = rotacion([venta([linea("a", 4, { cortesia: true }), linea("b", 2)])], DIAS_ROTACION, AHORA);
    expect(r.has("a")).toBe(false);
    expect(r.get("b")).toBe(2);
  });
});

describe("mejorVendidos", () => {
  const catalogo = [producto("a"), producto("b"), producto("c"), producto("d", { active: false })];

  it("ordena de más a menos unidades", () => {
    const top = mejorVendidos([venta([linea("b", 1), linea("a", 7), linea("c", 3)])], catalogo, { ahora: AHORA });
    expect(top.map((p) => p.id)).toEqual(["a", "c", "b"]);
  });

  it("excluye inactivos, archivados y los que nunca se vendieron", () => {
    const top = mejorVendidos([venta([linea("d", 9), linea("a", 1)])], catalogo, { ahora: AHORA });
    expect(top.map((p) => p.id)).toEqual(["a"]);
  });

  it("desempata por nombre para que el panel no salte entre renders", () => {
    const top = mejorVendidos([venta([linea("c", 2), linea("b", 2), linea("a", 2)])], catalogo, { ahora: AHORA });
    expect(top.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("respeta el tope de teclas rápidas", () => {
    const mucho = Array.from({ length: 12 }, (_, i) => producto(`p${i}`));
    const ventas = mucho.map((p) => venta([linea(p.id, 1)]));
    expect(mejorVendidos(ventas, mucho, { ahora: AHORA })).toHaveLength(9);
  });
});

describe("favoritos", () => {
  it("solo devuelve los fijados y vendibles, en orden alfabético", () => {
    const f = favoritos([
      producto("Café"),
      producto("Azúcar", { favorite: true }),
      producto("Harina", { favorite: true }),
      producto("Leche", { favorite: true, archived: true }),
    ]);
    expect(f.map((p) => p.id)).toEqual(["Azúcar", "Harina"]);
  });
});
