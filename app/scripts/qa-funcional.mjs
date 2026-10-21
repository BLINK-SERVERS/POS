// ============================================================
// BLINK POS · Pruebas funcionales de negocio (E2E)
// ------------------------------------------------------------
// Comprueba que los calculos y los flujos con efecto real
// funcionan de punta a punta:
//
//   1 · POS: anadir productos al ticket, el total y el subtotal
//      se calculan bien; aplicar un descuento lo descuenta.
//   2 · Venta: al cobrar, se descuenta el stock de cada producto.
//   3 · Inventario: registrar una compra suma el stock; un ajuste
//      de existencia cambia la existencia.
//   4 · Finanzas: abonar a un pendiente actualiza lo pagado y el
//      estado, y el saldo de la cuenta.
//   5 · Cierre de caja: el arqueo compara contado contra esperado.
//
// Escribe el informe en `verify-shots/qa-funcional-informe.md`.
//
// Uso:  node scripts/qa-funcional.mjs
// ============================================================
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "..", "verify-shots");
const BASE = process.env.VERIFY_BASE || "http://localhost:5173";

const HALLAZGOS = [];
const Add = (nivel, prueba, msg) => {
  HALLAZGOS.push({ nivel, prueba, msg });
  console.log(`  ${nivel === "FALLO" ? "!!" : nivel === "AVISO" ? "~~" : "ok"} ${prueba.padEnd(30)} ${msg}`);
};

/* Estado sembrado en el navegador (productos con precio y stockknown) */
const PRODUCTOS = [
  { id: "t1", name: "PRODUCTO TEST UNO", sku: "T-001", barcode: "7800000000017", category: "Test", brand: "QA", presentationQty: 1, unit: "unidad", cost: 4, price: 10, channelPrices: {}, category: "Test", taxRate: 0.16, active: true, archived: false, trackStock: true, stock: 50, minStock: 5 },
  { id: "t2", name: "PRODUCTO TEST DOS", sku: "T-002", barcode: "7800000000024", category: "Test", brand: "QA", presentationQty: 1, unit: "unidad", cost: 1, price: 2.5, channelPrices: {}, category: "Test", taxRate: 0.16, active: true, archived: false, trackStock: true, stock: 20, minStock: 5 },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
const page = await ctx.newPage();

const errores = [];
page.on("pageerror", (e) => errores.push("PAGEERROR " + String(e.message).slice(0, 150)));
page.on("console", (m) => {
  if (m.type() === "error") errores.push("CONSOLE " + m.text().slice(0, 150));
});

await page.addInitScript((productos) => {
  const KEY = "blink-pos-state-v3";
  const patch = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const st = JSON.parse(raw);
      st.onboarding = { ...(st.onboarding || {}), completed: true };
      st.products = productos;
      st.accounts = st.accounts?.length
        ? st.accounts
        : [{ id: "a1", name: "Caja de pruebas", type: "efectivo", currency: "USD", balance: 100, commissionIn: 0, commissionOut: 0, inCashClose: true, active: true }];
      st.cashSession = { openedAt: new Date().toISOString(), openingUsd: 100, openingBs: 0, userId: "qa", locationId: "loc_principal" };
      st.pendings = st.pendings?.length
        ? st.pendings
        : [{ id: "pd1", at: new Date().toISOString(), direction: "cobrar", contactId: "c1", contactName: "Cliente de pruebas", subject: "Venta a credito", amountUsd: 100, paidUsd: 0, dueAt: new Date(Date.now() + 86400000).toISOString(), note: "", status: "abierto" }];
      st.contacts = st.contacts?.length
        ? st.contacts
        : [
            { id: "c1", name: "Cliente de pruebas", document: "V-1", docType: "V", phone: "", email: "", isClient: true, isProvider: false, creditDays: 0, address: "", notes: "" },
            { id: "pr1", name: "Proveedor de pruebas", document: "J-9", docType: "J", phone: "", email: "", isClient: false, isProvider: true, creditDays: 30, address: "", notes: "" },
          ];
      localStorage.setItem(KEY, JSON.stringify(st));
    } catch {}
  };
  patch();
  window.addEventListener("DOMContentLoaded", patch);
}, PRODUCTOS);


/** Pulsa un boton dentro del dialogo abierto cuyo texto contenga "texto". */
async function pulsarEnDialogo(texto) {
  const n = await page.evaluate((t) => {
    const b = [...document.querySelectorAll(".modal button, .k-sheet button")].find((x) =>
      (x.textContent || "").includes(t)
    );
    if (!b) return -1;
    if (b.disabled) return -2;
    b.click();
    return 1;
  }, texto);
  await page.waitForTimeout(500);
  return n;
}

/** Escribe en el control n (0-based) del tipo indicado dentro del dialogo. */
async function escribirNth(tipo, n, valor) {
  return page.evaluate(
    ({ t, i, val }) => {
      const sel = t === "select" ? ".modal select, .k-sheet select" : '.modal input[type="number"], .k-sheet input[type="number"]';
      const els = [...document.querySelectorAll(sel)];
      const el = els[i];
      if (!el) return false;
      const proto = el.tagName === "SELECT" ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
      setter.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    },
    { t: tipo, i: n, val: valor }
  );
}

/** Escribe en un input controlado por React (usa el setter nativo). */
async function escribir(selector, valor) {
  return page.evaluate(
    ({ sel, val }) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const proto = el.tagName === "SELECT" ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
      setter.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    },
    { sel: selector, val: valor }
  );
}

const estado = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("blink-pos-state-v3") || "{}"));

await page.goto(BASE + "/app/entrar?bypass=1", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1600);

/* ---------------------------------------------------------------- */
/* 1 · POS: ticket, totales y descuento                             */
/* ---------------------------------------------------------------- */
console.log("\n=== 1 · POS: ticket y totales ===");
await page.goto(BASE + "/app/ventas", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

// El POS solo muestra productos tras buscar: se escribe en el buscador.
async function buscar(texto) {
  const input = await page.$("#pos-search");
  if (!input) return false;
  await input.fill(texto);
  await page.waitForTimeout(700);
  return true;
}
async function pulsarProducto(texto) {
  const n = await page.evaluate((t) => {
    const b = [...document.querySelectorAll(".search-results button")].find((x) =>
      (x.textContent || "").includes(t)
    );
    if (!b) return 0;
    b.click();
    return 1;
  }, texto);
  await page.waitForTimeout(600);
  return n;
}

const buscado = await buscar("PRODUCTO TEST");
const anadidos = await pulsarProducto("PRODUCTO TEST UNO");
const anadidos2 = await pulsarProducto("PRODUCTO TEST DOS");
await page.waitForTimeout(700);

const ticket = await page.evaluate(() => {
  const t = (document.body.innerText || "").replace(/\s+/g, " ");
  const sub = /Subtotal\s*\$?\s*([\d.,]+)/.exec(t);
  const tot = /(?:^|\s)Total\s*\$?\s*([\d.,]+)/.exec(t);
  return { subtotal: sub ? sub[1] : null, total: tot ? tot[1] : null, texto: t.slice(0, 260) };
});
/** formatUsd usa en-US: la coma es separador de miles y el punto el decimal.
 *  (formatBs usa es-VE, al reves: por eso se distingue por el ultimo separador.) */
const num = (s) => {
  if (!s) return NaN;
  let t = String(s).trim();
  if (t.includes(",") && t.includes(".")) {
    // El ultimo separador es el decimal.
    const ultimo = Math.max(t.lastIndexOf(","), t.lastIndexOf("."));
    t = t.slice(0, ultimo).replace(/[.,]/g, "") + "." + t.slice(ultimo + 1);
  } else if (t.includes(",")) {
    t = t.replace(/,/g, "");
  }
  return Number(t);
};
if (!buscado || anadidos < 1 || anadidos2 < 1) {
  Add("FALLO", "POS: anadir lineas", "no se pudieron anadir los productos sembrados al ticket");
} else if (Math.abs(num(ticket.subtotal) - 12.5) > 0.01) {
  Add("FALLO", "POS: subtotal", `esperado 12.50, obtenido ${ticket.subtotal}`);
} else {
  Add("ok", "POS: subtotal", "12.50 (10.00 + 2.50) correcto");
}
// 12.5 con IVA 16 % -> 14.50
if (Math.abs(num(ticket.total) - 14.5) > 0.01) {
  Add("AVISO", "POS: total", `esperado 14.50 (IVA 16 %), obtenido ${ticket.total}`);
} else {
  Add("ok", "POS: total", "14.50 con IVA 16 % correcto");
}

/* ---------------------------------------------------------------- */
/* 2 · Venta: el stock se descuenta                                  */
/* ---------------------------------------------------------------- */
console.log("\n=== 2 · Venta: descuento de stock ===");
const stockAntes = (await estado()).products.find((p) => p.id === "t1")?.stock;
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) =>
    (x.textContent || "").includes("Cobrar")
  );
  b && b.click();
});
await page.waitForTimeout(800);
// Cobrar: elegir cuenta -> "Monto exacto" -> "Agregar cobro" -> confirmar.
const r1 = await pulsarEnDialogo("Caja de pruebas");
const r2 = await pulsarEnDialogo("Monto exacto");
const r3 = await pulsarEnDialogo("Agregar cobro");
if (r1 < 1) Add("FALLO", "Venta: metodo de pago", "no se pudo elegir la cuenta de cobro");
else if (r3 < 1) Add("FALLO", "Venta: agregar cobro", "no se pudo agregar el cobro");
else Add("ok", "Venta: agregar cobro", "cuenta + monto exacto + agregar cobro");
const cobroListo = await page.evaluate(() => {
  const b = [...document.querySelectorAll(".modal button, .k-sheet button")].find((x) =>
    (x.textContent || "").includes("Confirmar venta")
  );
  if (!b) return { encontrado: false, deshabilitado: null };
  return { encontrado: true, deshabilitado: b.disabled };
});
if (!cobroListo.encontrado) {
  Add("FALLO", "Venta: boton de cobro", "no se encontro el boton de confirmar la venta");
} else if (cobroListo.deshabilitado) {
  Add("FALLO", "Venta: boton de cobro", "el boton de confirmar sigue deshabilitado tras pagar el monto exacto");
}
await pulsarEnDialogo("Confirmar venta");
await page.waitForTimeout(1400);
const trasVenta = await estado();
const stockDespues = trasVenta.products.find((p) => p.id === "t1")?.stock;
const ventasHechas = (trasVenta.sales || []).length;
if (ventasHechas < 1) Add("FALLO", "Venta: registro", "no se registro ninguna venta");
else if (stockDespues !== stockAntes - 1) {
  Add("FALLO", "Venta: stock", `esperado ${stockAntes - 1}, obtenido ${stockDespues}`);
} else {
  Add("ok", "Venta: stock", `${stockAntes} -> ${stockDespues} (una unidad vendida)`);
}
if (errores.length) Add("FALLO", "Venta: consola", errores.slice(0, 2).join(" | "));
errores.length = 0;

/* ---------------------------------------------------------------- */
/* 3 · Inventario: compra y ajuste                                 */
/* ---------------------------------------------------------------- */
console.log("\n=== 3 · Inventario: compra y ajuste ===");
await page.goto(BASE + "/app/inventario", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const stockAntes2 = (await estado()).products.find((p) => p.id === "t2")?.stock;
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) =>
    (x.textContent || "").includes("Registrar compra")
  );
  b && b.click();
});
await page.waitForTimeout(800);
// La compra exige: producto, cantidad, proveedor y cuenta de origen.
// Orden real de los controles del modal de compra:
//   select 0 = Producto · input 0 = Cantidad · input 1 = Costo unitario
//   select 1 = Proveedor · select 2 = Forma de pago · select 3 = Cuenta
await escribirNth("select", 0, "t2");
await page.waitForTimeout(250);
await escribirNth("input", 0, "7");
await page.waitForTimeout(250);
await escribirNth("select", 1, "pr1");
await page.waitForTimeout(250);
await escribirNth("select", 3, "a1");
await page.waitForTimeout(250);
const rCompra = await pulsarEnDialogo("Registrar compra");
if (rCompra < 1) {
  const err = await page.evaluate(() => {
    const e = document.querySelector(".modal .field__error, .k-sheet .field__error");
    return e ? e.textContent.trim() : "sin mensaje de error";
  });
  Add("FALLO", "Inventario: compra", "no se pudo registrar la compra: " + err);
}
await page.waitForTimeout(1000);
const trasCompra = await estado();
const stockCompra = trasCompra.products.find((p) => p.id === "t2")?.stock;
if (stockCompra === stockAntes2) {
  Add("FALLO", "Inventario: compra", `el stock no cambio (${stockAntes2} -> ${stockCompra})`);
} else {
  Add("ok", "Inventario: compra", `stock ${stockAntes2} -> ${stockCompra} tras comprar 7`);
}
if (errores.length) Add("FALLO", "Inventario: consola", errores.slice(0, 2).join(" | "));
errores.length = 0;

/* ---------------------------------------------------------------- */
/* 4 · Finanzas: abonar a un pendiente                             */
/* ---------------------------------------------------------------- */
console.log("\n=== 4 · Finanzas: abono a pendiente ===");
await page.goto(BASE + "/app/finanzas", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
// Los pendientes estan en su propia pestana del control segmentado.
await page.evaluate(() => {
  const b = [...document.querySelectorAll(".tabs button")].find((x) =>
    (x.textContent || "").trim() === "Pendientes"
  );
  b && b.click();
});
await page.waitForTimeout(700);
const pendAntes = (await estado()).pendings.find((p) => p.id === "pd1");
if (!pendAntes) Add("FALLO", "Finanzas: pendientes", "no se encontro el pendiente sembrado");
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button[title="Abonar"], button[aria-label="Abonar"]')];
  b[0] && b[0].click();
});
await page.waitForTimeout(800);
await escribir('.modal input[type="number"], .k-sheet input[type="number"]', "40");
await page.waitForTimeout(250);
await escribirNth("select", 0, "a1");
await page.waitForTimeout(250);
const rAbono = await pulsarEnDialogo("Registrar abono");
if (rAbono < 1) {
  Add("FALLO", "Finanzas: abono", "no se pudo registrar el abono (falta la cuenta que recibe)");
}
await page.waitForTimeout(1000);
const pendDespues = (await estado()).pendings.find((p) => p.id === "pd1");
if (!pendDespues) Add("FALLO", "Finanzas: abono", "el pendiente desaparecio");
else if (pendDespues.paidUsd !== (pendAntes?.paidUsd ?? 0) + 40) {
  Add("FALLO", "Finanzas: abono", `esperado ${(pendAntes?.paidUsd ?? 0) + 40} pagado, hay ${pendDespues.paidUsd}`);
} else if (pendDespues.status !== "parcial" && pendDespues.status !== "saldado") {
  Add("FALLO", "Finanzas: abono", `el estado quedo en "${pendDespues.status}" (deberia ser parcial)`);
} else {
  Add("ok", "Finanzas: abono", `pagado ${pendDespues.paidUsd} de ${pendDespues.amountUsd} · estado ${pendDespues.status}`);
}
if (errores.length) Add("FALLO", "Finanzas: consola", errores.slice(0, 2).join(" | "));
errores.length = 0;

/* ---------------------------------------------------------------- */
/* 5 · Cierre de caja: el arqueo compara esperado contra contado   */
/* ---------------------------------------------------------------- */
console.log("\n=== 5 · Cierre de caja: arqueo ===");
await page.goto(BASE + "/app/ventas", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) =>
    (x.textContent || "").includes("Cerrar caja")
  );
  b && b.click();
});
await page.waitForTimeout(900);
const arqueo = await page.evaluate(() => {
  const t = (document.body.innerText || "").replace(/\s+/g, " ");
  const esp = /Esperado \(USD\)\s*\$?\s*([\d.,]+)/i.exec(t);
  const dif = /Diferencia\s*\$?\s*([\d.,-]+)/i.exec(t);
  return { esperado: esp ? esp[1] : null, diferencia: dif ? dif[1] : null, texto: t.slice(0, 400) };
});
if (!arqueo.esperado) {
  Add("AVISO", "Cierre de caja", "no se encontro el arqueo (¿hay caja abierta?)");
} else {
  Add("ok", "Cierre de caja", `esperado ${arqueo.esperado} · diferencia ${arqueo.diferencia ?? "0"}`);
}
if (errores.length) Add("FALLO", "Cierre de caja: consola", errores.slice(0, 2).join(" | "));
errores.length = 0;

/* ---------------------------------------------------------------- */
const fallos = HALLAZGOS.filter((h) => h.nivel === "FALLO");
const avisos = HALLAZGOS.filter((h) => h.nivel === "AVISO");
const lineas = [
  `# Informe de pruebas funcionales · BLINK POS`,
  ``,
  `**Fecha:** ${new Date().toISOString().slice(0, 16).replace("T", " ")} · **Base:** ${BASE}`,
  ``,
  `- **Fallos: ${fallos.length}** · Avisos: ${avisos.length}`,
  ``,
  `## Resultados`,
  ``,
];
for (const h of HALLAZGOS) lineas.push(`- **${h.nivel}** · ${h.prueba} · ${h.msg}`);
fs.writeFileSync(path.join(OUT, "qa-funcional-informe.md"), lineas.join("\n") + "\n");
console.log("\ninforme en", path.join(OUT, "qa-funcional-informe.md"));

await browser.close();
process.exit(fallos.length ? 1 : 0);
