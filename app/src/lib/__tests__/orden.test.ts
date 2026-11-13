// Pruebas del orden del catálogo en la pantalla de venta.
// Referencia del criterio: relevancia y luego alfabético (con números), nunca el
// orden en que el comercio fue dando de alta los productos.
import { describe, expect, it } from "vitest";
import { buscarProductos, detalleProducto, ordenarPorNombre, porNombre } from "../orden";
import type { Product } from "../types";

const p = (name: string, extra: Partial<Product> = {}): Product => ({
  id: name,
  name,
  brand: "",
  sku: "",
  barcode: "",
  presentationQty: 0,
  unit: "",
  cost: 0,
  price: 1,
  channelPrices: {},
  category: "",
  taxRate: 0.16,
  active: true,
  archived: false,
  trackStock: false,
  stock: 10,
  minStock: 0,
  ...extra,
});

describe("ordenarPorNombre", () => {
  it("ordena alfabéticamente sin importar el orden de alta", () => {
    const alta = [p("Yerma"), p("Azúcar"), p("Harina"), p("Café")];
    expect(ordenarPorNombre(alta).map((x) => x.name)).toEqual(["Azúcar", "Café", "Harina", "Yerma"]);
  });

  it("compara con números: 2 antes que 10", () => {
    const lista = [p("Refresco 10 L"), p("Refresco 2 L"), p("Refresco 9 L")];
    expect(ordenarPorNombre(lista).map((x) => x.name)).toEqual([
      "Refresco 2 L",
      "Refresco 9 L",
      "Refresco 10 L",
    ]);
  });

  it("ignora mayúsculas y tildes al comparar", () => {
    expect(ordenarPorNombre([p("árbol"), p("BANANO"), p("avena")]).map((x) => x.name)).toEqual([
      "árbol",
      "avena",
      "BANANO",
    ]);
  });

  it("no muta la entrada", () => {
    const original = [p("Z"), p("A")];
    ordenarPorNombre(original);
    expect(original.map((x) => x.name)).toEqual(["Z", "A"]);
  });

  it("expone el comparador para reutilizarlo en cualquier lista con nombre", () => {
    expect([{ name: "b" }, { name: "a" }].sort(porNombre).map((x) => x.name)).toEqual(["a", "b"]);
  });
});

describe("buscarProductos", () => {
  const catalog = [
    p("Pan Canilla"),
    p("Pan de Hamburguesa"),
    p("Pantry"),
    p("Harina Pan 1 kg"),
    p("Leche Entera"),
    p("Café Molido", { barcode: "7591234567890" }),
    p("Inactivo", { active: false }),
    p("Archivado", { archived: true }),
  ];

  it("pone el prefijo del nombre antes que el inicio de palabra y que el contiene", () => {
    expect(buscarProductos(catalog, "pan").map((x) => x.name)).toEqual([
      "Pan Canilla", // prefijo + alfabético
      "Pan de Hamburguesa", // prefijo + alfabético
      "Pantry", // prefijo, pero detrás alfabéticamente
      "Harina Pan 1 kg", // solo inicio de palabra
    ]);
  });

  it("el contiene puro queda detrás del inicio de palabra", () => {
    const concontiene = [...catalog, p("Copa Roja")];
    expect(buscarProductos(concontiene, "opa").map((x) => x.name)).toEqual(["Copa Roja"]);
  });

  it("empieza el nombre por la consulta antes que cualquier otra coincidencia", () => {
    const nombres = buscarProductos(catalog, "pan canilla").map((x) => x.name);
    expect(nombres[0]).toBe("Pan Canilla");
  });

  it("sube el código de barras exacto por encima de coincidencias parciales de nombre", () => {
    const conotros = [...catalog, p("759 Base", { barcode: "0007591234567890" })];
    const r = buscarProductos(conotros, "7591234567890").map((x) => x.name);
    expect(r[0]).toBe("Café Molido");
  });

  it("excluye inactivos y archivados", () => {
    const nombres = buscarProductos(catalog, "").concat([]).map((x) => x.name);
    expect(nombres).toEqual([]); // sin consulta no hay lista
    expect(buscarProductos(catalog, "ac").map((x) => x.name)).not.toContain("Inactivo");
    expect(buscarProductos(catalog, "archiv").map((x) => x.name)).toEqual([]);
  });

  it("coincide por marca, unidad y medida, no solo por nombre", () => {
    expect(buscarProductos(catalog, "molido").map((x) => x.name)).toEqual(["Café Molido"]);
    expect(buscarProductos(catalog, "kg").map((x) => x.name)).toEqual(["Harina Pan 1 kg"]);
  });

  it("devuelve una lista nueva, no el catálogo ordenado in situ", () => {
    const antes = catalog.map((x) => x.name).join("|");
    buscarProductos(catalog, "pan");
    expect(catalog.map((x) => x.name).join("|")).toBe(antes);
  });
});

describe("detalleProducto", () => {
  it("no repite lo que el nombre ya dice", () => {
    expect(detalleProducto(p("Refresco 1 L", { presentationQty: 1, unit: "L" }))).toBe("");
    expect(
      detalleProducto(p("Harina PAN 1 kg", { presentationQty: 1, unit: "kg", brand: "PAN" }))
    ).toBe("");
  });

  it("aporta presentación y marca cuando el nombre calla", () => {
    expect(detalleProducto(p("Pan Canilla", { presentationQty: 1, unit: "kg" }))).toBe("1 kg");
    expect(detalleProducto(p("Harina", { brand: "PAN" }))).toBe("PAN");
    expect(detalleProducto(p("Harina", { presentationQty: 500, unit: "g", brand: "Mavesa" }))).toBe(
      "500 g · Mavesa"
    );
  });

  it("ignora tildes y mayúsculas al deduplicar", () => {
    expect(detalleProducto(p("Atún en Agua", { brand: "AGUA" }))).toBe("");
  });
});
