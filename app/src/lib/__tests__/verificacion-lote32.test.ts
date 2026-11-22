// Verificación del lote 32 (caza de bugs del 2026-11-17): los hallazgos que se
// pueden probar sin navegador. Cada bloque documenta el número tal como estaba
// medido y la regla que lo cierra.
import { describe, expect, it } from "vitest";
import {
  paidBs,
  saldoPendiente,
  saleBase,
  saleBsFromTotal,
  saleBsTotal,
  ticketTotal,
} from "../fiscal";
import { prevWeekRange, variacion, weekRange } from "../metrics";
import { round2 } from "../money";
import type { SaleLine, SalePayment } from "../types";

const TASA = 884.75;

/** Línea anclada a tasa. */
function anclada(price: number, qty = 1, taxRate = 0): SaleLine {
  return { productId: "p1", name: "Arroz", qty, price, cost: 0, taxRate };
}
/** Línea de precio fijo en Bs (BLINK-104): el USD es `Bs ÷ tasa`, sin redondear. */
function fija(bs: number, qty = 1): SaleLine {
  return { productId: "p2", name: "Harinera", qty, price: bs / TASA, priceBs: bs, cost: 0, taxRate: 0 };
}
/** Cobro cerrado en bolívares: el USD se deriva del Bs tecleado. */
function cobroBs(bs: number): SalePayment {
  return { method: "Pago móvil", currency: "VES", amountUsd: round2(bs / TASA), amountInput: bs };
}
/** Cobro en dólares. Desde BLINK-134 no arrastra IGTF. */
function cobroUsd(usd: number): SalePayment {
  return { method: "Divisas", currency: "USD", amountUsd: usd, amountInput: usd };
}

describe("BLINK-106/109 · un solo total en Bs para la pantalla y el checkout", () => {
  // El ticket que producía el descuadre: harinera de Bs 450 con precio fijo y
  // recargo de $ 0,01. Antes se sumaba además un IGTF de $ 0,02, y la pantalla
  // lo convertía a Bs redondeando una segunda vez. El IGTF se borró de los
  // cobros nuevos (BLINK-134); la garantía que queda es la fuente única del Bs.
  const lines = [fija(450)];
  const base = saleBase(lines);
  const net = round2(base - 0);
  const total = ticketTotal(net, 0, 0.01);

  it("la línea fija aporta su Bs exacto y el resto se convierte", () => {
    const totalBs = saleBsFromTotal(lines, TASA, total);
    // El recargo de $ 0,01 vale Bs 8,85 a esta tasa; la harinera de Bs 450 no
    // se mueve, que es justo lo que el cliente paga. El número se fija entero:
    // si alguien cambia la fórmula, las dos mitades no se mueven juntas.
    expect(totalBs).toBe(458.85);
    expect(saleBsTotal(lines, TASA, round2(total - base))).toBe(totalBs);
    expect(round2(totalBs - 450)).toBe(round2(0.01 * TASA));
  });

  it("cobrar el Bs de la única fuente cierra el ticket sin cuenta por cobrar", () => {
    const totalBs = saleBsFromTotal(lines, TASA, total);
    const pagos = [cobroUsd(0.67), cobroBs(round2(totalBs - paidBs([cobroUsd(0.67)], TASA)))];
    expect(round2(paidBs(pagos, TASA))).toBe(totalBs);
    expect(saldoPendiente(total, pagos, totalBs, TASA).remaining).toBe(0);
  });

  it("cobrar un céntimo de más que el Bs del ticket descuadra la caja", () => {
    const totalBs = saleBsFromTotal(lines, TASA, total);
    // El ticket y la caja se cuadran con el mismo número: si se cobra otro, el
    // diferencial aparece aunque el USD parezca cerrado.
    expect(round2(paidBs([cobroBs(round2(totalBs + 0.01))], TASA) - totalBs)).toBe(0.01);
    const pagos = [cobroBs(totalBs)];
    expect(round2(paidBs(pagos, TASA) - totalBs)).toBe(0);
    expect(saldoPendiente(total, pagos, totalBs, TASA).remaining).toBe(0);
  });

  it("ticket totalmente anclado a tasa: el Bs sigue siendo total × tasa", () => {
    const l = [anclada(12.5, 3), anclada(4.25, 2, 0.16)];
    const b = saleBase(l);
    const t = ticketTotal(round2(b - 1), 2.36, 0);
    const totalBs = saleBsFromTotal(l, TASA, t);
    // El Bs se redondea por línea porque cada línea vale lo que se cobra; por
    // eso puede caer a un céntimo de `total × tasa`, nunca más lejos.
    expect(t).toBe(47.36);
    expect(totalBs).toBe(41901.77);
    expect(round2(Math.abs(totalBs - round2(t * TASA)))).toBe(0.01);
  });

  it("sin tasa válida el Bs lo ponen las líneas fijas y nada se inventa", () => {
    const l = [fija(1000)];
    const t = ticketTotal(round2(saleBase(l)), 0, 0);
    // El Bs del producto fijo existe aunque no haya tasa: es el dato que manda.
    expect(saleBsFromTotal(l, 0, t)).toBe(1000);
  });
});

describe("BLINK-114 · comparación contra el período anterior", () => {
  it("salir de una pérdida se lee como mejora, no como −150 %", () => {
    expect(variacion(50, -100)).toBe("+$ 150.00");
    // Con base positiva el porcentaje sí tiene sentido, aunque el resultado
    // caiga en negativo: pasar de +50 a −100 es −300 %.
    expect(variacion(-100, 50)).toBe("-300%");
  });

  it("con base positiva conserva el porcentaje de siempre", () => {
    expect(variacion(150, 100)).toBe("+50%");
    expect(variacion(80, 100)).toBe("-20%");
    expect(variacion(100, 100)).toBe("+0%");
  });

  it("base cero: «nuevo» si hay cifra, «—» si no pasó nada", () => {
    expect(variacion(20, 0)).toBe("nuevo");
    expect(variacion(0, 0)).toBe("—");
  });

  it("la semana anterior cubre siete días y no llega hasta hoy", () => {
    // El bug devolvía `[pf, t]`: desde el lunes pasado hasta AHORA, o sea una
    // ventana que contenía la propia semana y comparaba 9 días contra 2.
    const ref = new Date(2026, 10, 17); // martes
    const [f, t] = weekRange(ref);
    const [pf, pt] = prevWeekRange(ref);
    expect(pt.getTime()).toBeLessThan(f.getTime());
    // Las dos ventanas miden lo mismo y son contiguas: el domingo anterior
    // termina un milisegundo antes del lunes de la semana en curso.
    expect(Math.round((pt.getTime() - pf.getTime()) / 86_400_000)).toBe(
      Math.round((t.getTime() - f.getTime()) / 86_400_000)
    );
    expect(f.getTime() - pt.getTime()).toBe(1);
  });
});
