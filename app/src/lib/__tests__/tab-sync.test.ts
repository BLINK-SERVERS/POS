// Sincronía entre pestañas del mismo navegador (BLINK-067): dos cobros casi
// simultáneos ya no se pisan. La mezcla conserva las ventas de ambas pestañas,
// respeta las eliminaciones locales y desempata los códigos duplicados.
import { describe, expect, it } from "vitest";
import { mergeTabState } from "../sync";
import type { AppState } from "../types";

type Venta = { id: string; code: string; at: string; status: string };

function estado(over: Record<string, unknown> = {}): AppState {
  return {
    business: { name: "Comercio" },
    rate: 80,
    rateUpdatedAt: "",
    nextSaleNumber: 1,
    taxes: [],
    categories: [],
    channels: [],
    locations: [],
    products: [],
    contacts: [],
    sales: [],
    openTabs: [],
    accounts: [],
    movements: [],
    transfers: [],
    pendings: [],
    expenses: [],
    recurringExpenses: [],
    expenseCategories: [],
    discounts: [],
    surcharges: [],
    inventoryMoves: [],
    purchases: [],
    stockReturns: [],
    stockAdjustments: [],
    stockTransfers: [],
    cashSession: null,
    cashClosures: [],
    onboarding: { completed: true },
    ...over,
  } as unknown as AppState;
}

const venta = (id: string, code: string, at: string): Venta => ({
  id,
  code,
  at,
  status: "cobrada",
});

describe("mergeTabState (BLINK-067)", () => {
  it("conserva la venta de esta pestaña y la de la otra al cobrar casi a la vez", () => {
    // Esta pestaña ya había escrito {A}; luego cobró B; la otra pestaña (desde
    // la misma base) cobró C y escribió {A, C}. El reemplazo viejo perdía B.
    const prev = estado({ sales: [venta("a", "000001", "2026-11-10T10:00:00Z")], nextSaleNumber: 2 });
    const local = estado({ sales: [venta("a", "000001", "2026-11-10T10:00:00Z"), venta("b", "000002", "2026-11-10T10:00:02Z")], nextSaleNumber: 3 });
    const incoming = estado({ sales: [venta("a", "000001", "2026-11-10T10:00:00Z"), venta("c", "000002", "2026-11-10T10:00:01Z")], nextSaleNumber: 3 });
    const merged = mergeTabState(incoming, local, prev);
    const ids = merged.sales.map((s) => s.id).sort();
    expect(ids).toEqual(["a", "b", "c"]);
  });

  it("desempata los códigos duplicados renumerando la venta más reciente", () => {
    // Ambas pestañas emitieron «000002» partiendo del mismo correlativo.
    const prev = estado({ sales: [venta("a", "000001", "2026-11-10T10:00:00Z")], nextSaleNumber: 2 });
    const local = estado({ sales: [venta("a", "000001", "2026-11-10T10:00:00Z"), venta("b", "000002", "2026-11-10T10:00:05Z")], nextSaleNumber: 3 });
    const incoming = estado({ sales: [venta("a", "000001", "2026-11-10T10:00:00Z"), venta("c", "000002", "2026-11-10T10:00:01Z")], nextSaleNumber: 3 });
    const merged = mergeTabState(incoming, local, prev);
    const codigos = merged.sales.map((s) => (s as Venta).code).sort();
    expect(new Set(codigos).size).toBe(codigos.length); // sin duplicados
    // La más antigua conserva 000002 y la reciente pasa a 000003.
    const c = merged.sales.find((s) => s.id === "c") as Venta;
    const b = merged.sales.find((s) => s.id === "b") as Venta;
    expect(c.code).toBe("000002");
    expect(b.code).toBe("000003");
    expect(merged.nextSaleNumber).toBeGreaterThanOrEqual(4);
  });

  it("respeta la eliminación local: lo borrado aquí no resucita", () => {
    const prev = estado({
      products: [
        { id: "p1", name: "Café", stock: 1 },
        { id: "p2", name: "Té", stock: 1 },
      ],
    });
    const local = estado({ products: [{ id: "p1", name: "Café", stock: 1 }] });
    const incoming = estado({
      products: [
        { id: "p1", name: "Café", stock: 1 },
        { id: "p2", name: "Té", stock: 1 },
      ],
    });
    const merged = mergeTabState(incoming, local, prev);
    expect(merged.products.map((p) => p.id)).toEqual(["p1"]);
  });

  it("en un conflicto gana el registro con marca de tiempo más reciente", () => {
    const prev = estado({ products: [{ id: "p1", name: "Café", stock: 1 }] });
    const local = estado({ products: [{ id: "p1", name: "Café editado aquí", stock: 2 }] });
    const incoming = estado({ products: [{ id: "p1", name: "Café editado allá", stock: 9 }] });
    // Productos sin `at`: el edito LOCAL (deliberado en esta pestaña) prevalece.
    const merged = mergeTabState(incoming, local, prev);
    expect((merged.products[0] as { name: string }).name).toBe("Café editado aquí");
  });

  it("sin escritura previa propia (pestaña recién abierta) adopta lo que llega", () => {
    const incoming = estado({ rate: 90, sales: [venta("a", "000001", "2026-11-10T10:00:00Z")] });
    const merged = mergeTabState(incoming, estado(), null);
    expect(merged.rate).toBe(90);
    expect(merged.sales).toHaveLength(1);
  });

  it("el correlativo nunca baja del máximo emitido", () => {
    const prev = estado({ nextSaleNumber: 5 });
    const local = estado({ nextSaleNumber: 7 });
    const incoming = estado({ nextSaleNumber: 6 });
    expect(mergeTabState(incoming, local, prev).nextSaleNumber).toBe(7);
  });
});
