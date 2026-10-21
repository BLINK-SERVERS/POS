// ============================================================
// BLINK POS · Auditoría funcional de la interfaz (E2E)
// ------------------------------------------------------------
// Recorre TODAS las vistas y pulsa TODOS los botones, selectores
// y campos, comprobando en cada interacción:
//
//   · que no haya errores de consola ni excepciones;
//   · que el botón produzca una respuesta observable (cambia el DOM,
//     abre un diálogo, navega o cambia el estado);
//   · que un diálogo se pueda abrir y cerrar con transiciones limpias;
//   · que el foco no se pierda al cerrar un diálogo;
//   · que no haya doble ejecución (una acción que se dispara dos
//     veces al hacer doble clic).
//
// Escribe un informe en `verify-shots/qa-e2e-informe.md`.
//
// Uso:
//   node scripts/qa-e2e.mjs                 (servidor de desarrollo)
//   VERIFY_BASE=https://www.blink.com.ve node scripts/qa-e2e.mjs
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

const RUTAS = [
  ["/app/inicio", "inicio"],
  ["/app/ventas", "ventas"],
  ["/app/ventas/historial", "historial"],
  ["/app/catalogo", "catalogo"],
  ["/app/inventario", "inventario"],
  ["/app/contactos", "contactos"],
  ["/app/finanzas", "finanzas"],
  ["/app/informes", "informes"],
  ["/app/ajustes", "ajustes"],
  ["/app/onboarding", "onboarding"],
];

/** Botones que se dejan fuera del recorrido automatico (efecto irreversible). */
const EXCLUIDOS = [
  "Cerrar sesión",
  "Borrar todos los datos",
  "Eliminar",
  "Anular venta",
  "Anular",
  "Vaciar",
];

/* ---------------------------------------------------------------- */
const HALLAZGOS = [];
const Add = (nivel, vista, msg) => {
  HALLAZGOS.push({ nivel, vista, msg });
  const marca = nivel === "FALLO" ? "!!" : nivel === "AVISO" ? "~~" : "ok";
  console.log(`  ${marca} ${vista.padEnd(12)} ${msg}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
const page = await ctx.newPage();

let errores = [];
let descarga = false;
page.on("download", () => { descarga = true; });
page.on("pageerror", (e) => errores.push("PAGEERROR " + String(e.message).slice(0, 160)));
page.on("console", (m) => {
  if (m.type() === "error") errores.push("CONSOLE " + m.text().slice(0, 160));
});

/* --- Estado sembrado en el navegador (modo bypass local) --- */
await page.addInitScript(() => {
  const KEY = "blink-pos-state-v3";
  const patch = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const st = JSON.parse(raw);
      st.onboarding = { ...(st.onboarding || {}), completed: true };
      if (!st.products || st.products.length === 0) {
        st.products = [
          { id: "p1", name: "AZUCAR KONFIT 1kg", sku: "SKU-001", barcode: "7801234567890", category: "Alimentos", brand: "POLAR", presentationQty: 1, unit: "kg", cost: 0.9, price: 2, stock: 24, minStock: 6, trackStock: true, active: true, archived: false },
          { id: "p2", name: "MALTA RETORNABLE 222ml", sku: "SKU-002", barcode: "7801234567891", category: "Bebidas", brand: "CERVECERIAS", presentationQty: 222, unit: "ml", cost: 0.6, price: 1.5, stock: 3, minStock: 12, trackStock: true, active: true, archived: false },
        ];
      }
      localStorage.setItem(KEY, JSON.stringify(st));
    } catch {}
  };
  patch();
  window.addEventListener("DOMContentLoaded", patch);
});

await page.goto(BASE + "/app/entrar?bypass=1", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1600);

/* ---------------------------------------------------------------- */
/* Utilidades de analisis                                            */
/* ---------------------------------------------------------------- */
const estado = () =>
  page.evaluate(() => {
    const dialogo = document.querySelector(".k-dialog, .k-sheet, .modal-backdrop, .modal");
    const texto = (document.body.innerText || "").replace(/\s+/g, " ").trim();
    return {
      hash: texto.length + ":" + texto.slice(0, 160),
      url: location.pathname + location.search,
      dialogo: !!dialogo,
      dialogoClase: dialogo ? dialogo.className.split(" ")[0] : null,
      focus: document.activeElement ? document.activeElement.tagName + "." + String(document.activeElement.className || "").split(" ")[0] : "null",
     Inputs: document.querySelectorAll("input, select, textarea").length,
      botones: document.querySelectorAll("button").length,
      iconosVacios: [...document.querySelectorAll("svg.icon")].filter((s) => !s.querySelector("path")).length,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
    };
  });

/** Cierra el dialogo abierto (Escape, boton de cerrar o velo). */
async function cerrarDialogo() {
  const habia = await page.evaluate(() => !!document.querySelector(".k-dialog, .k-sheet, .modal-backdrop, .modal"));
  if (!habia) return null;
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(320);
  let sigue = await page.evaluate(() => !!document.querySelector(".k-dialog, .k-sheet, .modal-backdrop, .modal"));
  if (sigue) {
    // Boton de cerrar explicito
    const btn = await page.$(".sheet__close, .modal__close, .k-dialog button");
    if (btn) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(320);
    }
  }
  sigue = await page.evaluate(() => !!document.querySelector(".k-dialog, .k-sheet, .modal-backdrop, .modal"));
  if (sigue) {
    await page.mouse.click(6, 6).catch(() => {}); // el velo
    await page.waitForTimeout(320);
    sigue = await page.evaluate(() => !!document.querySelector(".k-dialog, .k-sheet, .modal-backdrop, .modal"));
  }
  return sigue === false;
}

let totalBotones = 0;
let probados = 0;

/* ---------------------------------------------------------------- */
/* Recorrido de todas las vistas                                     */
/* ---------------------------------------------------------------- */
for (const [ruta, vista] of RUTAS) {
  console.log(`\n=== ${vista} (${ruta}) ===`);
  errores = [];
  await page.goto(BASE + ruta, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(900);

  const antes = await estado();
  if (antes.iconosVacios) Add("FALLO", vista, `${antes.iconosVacios} iconos vacíos`);
  if (antes.overflowX) Add("FALLO", vista, "desbordamiento horizontal");
  if (errores.length) Add("FALLO", vista, `errores al cargar: ${errores.slice(0, 2).join(" | ")}`);

  // Botones de la vista
  const etiquetas = await page.evaluate(() =>
    [...document.querySelectorAll("button")].map((b, i) => ({
      i,
      texto: (b.textContent || "").replace(/\s+/g, " ").trim().slice(0, 42),
      disabled: b.disabled,
      off: b.getBoundingClientRect().width < 2 || b.getBoundingClientRect().height < 2,
      // La pestaña activa ya esta seleccionada: pulsarla no cambia nada.
      activa: b.getAttribute("aria-selected") === "true",
    }))
  );
  totalBotones += etiquetas.length;

  for (const b of etiquetas) {
    if (b.disabled) continue;
    if (EXCLUIDOS.some((x) => b.texto.includes(x))) continue;
    if (b.texto === "" && b.off) continue;
    if (b.activa) continue;

    // Recargar para partir siempre del mismo estado
    await page.goto(BASE + ruta, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(500);
    errores = [];

    const previo = await estado();
    descarga = false;
    const botones = await page.$$("button");
    const boton = botones[b.i];
    if (!boton) continue;

    let fallo = null;
    try {
      await boton.scrollIntoViewIfNeeded();
      await boton.click({ timeout: 4000, force: true });
      await page.waitForTimeout(420);
    } catch (e) {
      fallo = "no se pudo pulsar: " + String(e.message).slice(0, 80);
    }
    probados++;

    if (fallo) {
      Add("AVISO", vista, `"${b.texto}" ${fallo}`);
      continue;
    }
    if (errores.length) {
      Add("FALLO", vista, `"${b.texto}" provoked: ${errores.slice(0, 2).join(" | ")}`);
      errores = [];
      await cerrarDialogo();
      continue;
    }

    const post = await estado();
    if (descarga) {
      // El boton lanzo una descarga: la respuesta no es visible en el DOM.
      continue;
    }
    if (post.dialogo && !previo.dialogo) {
      // Se abrio un dialogo: hay que poder cerrarlo
      const cerrado = await cerrarDialogo();
      if (!cerrado) {
        Add("FALLO", vista, `"${b.texto}" abrio un dialogo que no se pudo cerrar`);
        continue;
      }
      const tras = await estado();
      if (tras.focus === "null" || tras.focus === "BODY.") {
        Add("AVISO", vista, `"${b.texto}" dejo el foco en el cuerpo al cerrar el dialogo`);
      }
      if (tras.overflowX) Add("FALLO", vista, `"${b.texto}" dejo scroll horizontal al cerrar`);
      continue;
    }

    // Sin dialogo: la accion debe producir alguna respuesta
    const cambio = post.hash !== previo.hash || post.url !== previo.url || post.Inputs !== previo.Inputs;
    if (!cambio) {
      Add("AVISO", vista, `"${b.texto}" no produjo ninguna respuesta visible`);
    }
    if (post.overflowX) Add("FALLO", vista, `"${b.texto}" produjo scroll horizontal`);
    if (post.iconosVacios) Add("FALLO", vista, `"${b.texto}" dejo iconos vacios`);
  }
}

/* ---------------------------------------------------------------- */
/* Doble ejecucion: crear un producto y contar los registros        */
/* ---------------------------------------------------------------- */
console.log("\n=== doble ejecucion (guardar dos veces) ===");
{
  await page.goto(BASE + "/app/catalogo", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const antes = await page.evaluate(() => {
    const st = JSON.parse(localStorage.getItem("blink-pos-state-v3") || "{}");
    return (st.products || []).length;
  });
  // Abrir "Nuevo producto" y guardar dos veces seguidas
  const abierto = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes("Nuevo producto"));
    if (!b) return false;
    b.click();
    return true;
  });
  if (abierto) {
    await page.waitForTimeout(700);
    await page.fill('input[placeholder*="Harina"]', "PRODUCTO DOBLE").catch(() => {});
    const guardar = await page.$(".modal .btn--primary, .k-sheet .btn--primary");
    if (guardar) {
      await guardar.dblclick({ delay: 40 }).catch(async () => {
        await guardar.click().catch(() => {});
        await guardar.click().catch(() => {});
      });
      await page.waitForTimeout(900);
      const despues = await page.evaluate(() => {
        const st = JSON.parse(localStorage.getItem("blink-pos-state-v3") || "{}");
        return (st.products || []).filter((p) => (p.name || "").includes("PRODUCTO DOBLE")).length;
      });
      if (despues > 1) Add("FALLO", "catalogo", `doble ejecucion: se guardaron ${despues} copias del producto`);
      else if (despues === 0) Add("AVISO", "catalogo", "el doble clic no guardo el producto (revisar)");
      else Add("ok", "catalogo", "doble clic guardado 1 sola vez (sin doble ejecucion)");
    }
  }
}

console.log(`\nBotones encontrados: ${totalBotones} · probados: ${probados}`);

/* ---------------------------------------------------------------- */
/* Informe                                                          */
/* ---------------------------------------------------------------- */
const fallos = HALLAZGOS.filter((h) => h.nivel === "FALLO");
const avisos = HALLAZGOS.filter((h) => h.nivel === "AVISO");
const lineas = [
  `# Informe de auditoría funcional (E2E) · BLINK POS`,
  ``,
  `**Fecha:** ${new Date().toISOString().slice(0, 16).replace("T", " ")} · **Base:** ${BASE}`,
  ``,
  `- Vistas recorridass: ${RUTAS.length}`,
  `- Botones encontrados: **${totalBotones}** · probados: **${probados}**`,
  `- **Fallos: ${fallos.length}** · Avisos: ${avisos.length}`,
  ``,
  `## Hallazgos`,
  ``,
];
if (!HALLAZGOS.length) {
  lineas.push("Sin incidencias: todos los botones responden, los diálogos abren y cierran, no hay errores de consola ni desbordamientos.");
} else {
  for (const h of HALLAZGOS) {
    lineas.push(`- **${h.nivel}** · \`${h.vista}\` · ${h.msg}`);
  }
}
fs.writeFileSync(path.join(OUT, "qa-e2e-informe.md"), lineas.join("\n") + "\n");
console.log("\ninforme en", path.join(OUT, "qa-e2e-informe.md"));

await browser.close();
process.exit(fallos.length ? 1 : 0);
