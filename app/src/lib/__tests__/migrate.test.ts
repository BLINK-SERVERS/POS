// Pruebas de migración de esquema (puras, sin React ni Supabase).
import { describe, expect, it } from "vitest";
import { migrateProduct } from "../migrate";
import type { Product } from "../types";

const BASE_PRODUCT = {
  id: "p1",
  businessId: "b1",
  name: "HARINA DE MAÍZ",
  sku: "",
  barcode: "7591234567890",
  brand: "",
  unit: "unidad",
  cost: 2,
  price: 3,
  channelPrices: { ch_principal: 3 },
  category: "Alimentos",
  taxRate: 0.16,
  active: true,
  archived: false,
  presentationQty: 1,
  trackStock: true,
  minStock: 0,
  stock: 10,
} as unknown as Product;

describe("migrateProduct", () => {
  it("heredado tipo servicio → trackStock false", () => {
    const legacy = { ...BASE_PRODUCT, type: "servicio" as any };
    const m = migrateProduct(legacy);
    expect(m.trackStock).toBe(false);
    expect(m.brand).toBe("");
    expect(m.archived).toBe(false);
    expect(m.channelPrices.ch_principal).toBe(3);
    expect(m.presentationQty).toBe(1);
    expect(m.unit).toBe("unidad");
  });

  it("tipo simple → trackStock se conserva", () => {
    const legacy = { ...BASE_PRODUCT, type: "simple" as any, trackStock: true };
    const m = migrateProduct(legacy);
    expect(m.trackStock).toBe(true);
  });

  it("trackStock undefined → se asume true (no servicio)", () => {
    const legacy = { ...BASE_PRODUCT } as any;
    delete legacy.trackStock;
    delete legacy.type;
    const m = migrateProduct(legacy);
    expect(m.trackStock).toBe(true);
  });

  it("unit inválida → pasa a 'unidad'", () => {
    const legacy = { ...BASE_PRODUCT, unit: "bolsa" as any };
    const m = migrateProduct(legacy);
    expect(m.unit).toBe("unidad");
  });

  it("unit válida se conserva", () => {
    const legacy = { ...BASE_PRODUCT, unit: "kg" as any };
    const m = migrateProduct(legacy);
    expect(m.unit).toBe("kg");
  });

  it("channelPrices ausentes → se llena desde price", () => {
    const legacy = { ...BASE_PRODUCT, channelPrices: undefined as any };
    const m = migrateProduct(legacy);
    expect(m.channelPrices.ch_principal).toBe(BASE_PRODUCT.price);
  });

  it("presentationQty ausente → 1", () => {
    const legacy = { ...BASE_PRODUCT } as any;
    delete legacy.presentationQty;
    const m = migrateProduct(legacy);
    expect(m.presentationQty).toBe(1);
  });
});
