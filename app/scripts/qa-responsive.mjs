// ============================================================
// BLINK POS · Matriz de responsividad y comprobación de tipografía
// ------------------------------------------------------------
// Recorre la app en un abanico de resoluciones (móvil pequeno,
// móvil estándar, móvil grande, tablet, portátil y escritorio)
// comprobando en cada una:
//
//   · que NO haya scroll horizontal;
//   · que las tablas se conviertan en tarjetas verticales por
//     debajo de 768 px (HIG · Lists: lista agrupada);
//   · que ningun texto o imagen se corte (desbordes internos);
//   · que la familia SF Pro este REALMENTE en uso y no haya
//     caida a la fuente generica del sistema.
//
// Detecta la caida a la fuente generica midiendo el texto en un
// `<canvas>`: si el ancho con SF Pro coincide con el de la fuente
// de reserva, la fuente pedida no esta disponible.
//
// Uso:
//   node scripts/qa-responsive.mjs
//   VERIFY_BASE=https://www.blink.com.ve node scripts/qa-responsive.mjs
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

const RESOLUCIONES = [
  { id: "movil-s", w: 360, h: 640, etiqueta: "iPhone SE (360x640)" },
  { id: "movil", w: 390, h: 844, etiqueta: "iPhone 15 (390x844)" },
  { id: "movil-g", w: 430, h: 932, etiqueta: "iPhone Pro Max (430x932)" },
  { id: "tablet", w: 768, h: 1024, etiqueta: "iPad (768x1024)" },
  { id: "portatil", w: 1280, h: 860, etiqueta: "Portátil (1280x860)" },
  { id: "escritorio", w: 1920, h: 1080, etiqueta: "Escritorio (1920x1080)" },
];

const RUTAS = [
  ["/app/inicio", "inicio"],
  ["/app/ventas", "ventas"],
  ["/app/catalogo", "catalogo"],
  ["/app/inventario", "inventario"],
  ["/app/finanzas", "finanzas"],
  ["/app/ajustes", "ajustes"],
];

/* ---------------------------------------------------------------- */
const HALLAZGOS = [];
const Add = (nivel, donde, msg) => {
  HALLAZGOS.push({ nivel, donde, msg });
  console.log(`  ${nivel === "FALLO" ? "!!" : nivel === "AVISO" ? "~~" : "ok"} ${donde.padEnd(26)} ${msg}`);
};

const browser = await chromium.launch();

/* --- Preparacion: sesion y datos de la app --- */
const ctx0 = await browser.newContext({ viewport: { width: 1280, height: 860 } });
const page0 = await ctx0.newPage();
await page0.addInitScript(() => {
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
await page0.goto(BASE + "/app/entrar?bypass=1", { waitUntil: "domcontentloaded" });
await page0.waitForTimeout(1600);
const sesion = await ctx0.storageState();
await ctx0.close();

/* ---------------------------------------------------------------- */
for (const res of RESOLUCIONES) {
  console.log(`\n=== ${res.etiqueta} ===`);
  const ctx = await browser.newContext({ viewport: { width: res.w, height: res.h }, storageState: sesion, isMobile: res.w < 860, hasTouch: res.w < 860 });
  const page = await ctx.newPage();

  const errores = [];
  page.on("pageerror", (e) => errores.push("PAGEERROR " + String(e.message).slice(0, 140)));
  page.on("console", (m) => {
    if (m.type() === "error") errores.push("CONSOLE " + m.text().slice(0, 140));
  });

  for (const [ruta, vista] of RUTAS) {
    await page.goto(BASE + ruta, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(800);

    const info = await page.evaluate(() => {
      /* 1 · scroll horizontal */
      const doc = document.documentElement;
      const overflowX = doc.scrollWidth > window.innerWidth + 2;

      /* 2 · elementos que se salen por la derecha */
      const ancho = doc.clientWidth;
      const fuera = [...document.querySelectorAll("body *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.width < 2) return false;
          const cs = getComputedStyle(el);
          if (cs.position === "fixed") return false;
          // Se ignoran los contenedores con scroll propio.
          let p = el.parentElement;
          while (p) {
            const pcs = getComputedStyle(p);
            if (pcs.overflowX === "auto" || pcs.overflowX === "scroll") return false;
            p = p.parentElement;
          }
          return r.right > ancho + 2;
        })
        .slice(0, 3)
        .map((el) => el.tagName + "." + String(el.className || "").split(" ")[0]);

      /* 3 · texto o imagen cortado */
      const cortados = [...document.querySelectorAll("body *")]
        .filter((el) => {
          if (el.children.length) return false;
          const cs = getComputedStyle(el);
          if (cs.overflow === "hidden" && cs.textOverflow !== "ellipsis") {
            return el.scrollWidth > el.clientWidth + 2;
          }
          return false;
        })
        .slice(0, 3)
        .map((el) => el.tagName + "." + String(el.className || "").split(" ")[0]);

      /* 4 · la tabla se convierte en tarjetas */
      const tabla = document.querySelector("table.data");
      let tarjetas = null;
      if (tabla) {
        const thead = tabla.querySelector("thead");
        const fila = tabla.querySelector("tbody tr");
        tarjetas = {
          cabeceraOculta: thead ? getComputedStyle(thead).display === "none" : true,
          filaEnColumna: fila ? getComputedStyle(fila).display === "flex" && getComputedStyle(fila).flexDirection === "column" : null,
        };
      }

      /* 5 · tipografia real: SF Pro o caida a la generica */
      const c = document.createElement("canvas").getContext("2d");
      const texto = "BLINK POS Medible 0123456789 áéíóúñ";
      const medir = (fuente) => {
        c.font = `40px ${fuente}`;
        return c.measureText(texto).width;
      };
      const conSf = medir('"SF Pro", monospace');
      const conReserva = medir("monospace");
      const tipografia = {
        cuerpo: getComputedStyle(document.body).fontFamily,
        h1: document.querySelector("h1") ? getComputedStyle(document.querySelector("h1")).fontFamily : null,
        haySfPro: document.fonts ? document.fonts.check('16px "SF Pro"') : null,
        // Si los anchos coinciden, SF Pro NO se esta usando.
        caeEnGenerica: Math.abs(conSf - conReserva) < 0.5,
        opticalSizing: getComputedStyle(document.body).fontOpticalSizing,
      };

      return {
        overflowX,
        fuera,
        cortados,
        tarjetas,
        tipografia,
        iconosVacios: [...document.querySelectorAll("svg.icon")].filter((s) => !s.querySelector("path")).length,
      };
    });

    const donde = `${res.id}/${vista}`;
    if (info.overflowX) Add("FALLO", donde, "scroll horizontal");
    if (info.fuera.length) Add("FALLO", donde, "se sale por la derecha: " + info.fuera.join(", "));
    if (info.cortados.length) Add("AVISO", donde, "texto cortado: " + info.cortados.join(", "));
    if (info.iconosVacios) Add("FALLO", donde, `${info.iconosVacios} iconos vacíos`);
    if (errores.length) Add("FALLO", donde, "errores: " + errores.slice(0, 2).join(" | "));
    errores.length = 0;

    if (info.tarjetas) {
      const debeSerTarjeta = res.w < 768;
      if (debeSerTarjeta && !info.tarjetas.cabeceraOculta) {
        Add("FALLO", donde, "la tabla no se ha convertido en tarjetas (la cabecera sigue visible)");
      }
      if (debeSerTarjeta && info.tarjetas.filaEnColumna === false) {
        Add("FALLO", donde, "las filas de la tabla no se apilan en columna");
      }
      if (!debeSerTarjeta && !info.tarjetas.cabeceraOculta) {
        // En escritorio la cabecera debe verse.
      } else if (!debeSerTarjeta) {
        Add("AVISO", donde, "en escritorio la cabecera de la tabla esta oculta");
      }
    }

    // La tipografia se comprueba una vez por resolucion (no cambia por vista).
    if (vista === "inicio") {
      const t = info.tipografia;
      if (t.caeEnGenerica) {
        Add("AVISO", donde, "SF Pro no esta en uso: el texto cae en la fuente generica del sistema");
      } else {
        Add("ok", donde, `SF Pro en uso (optical-sizing: ${t.opticalSizing})`);
      }
      if (!String(t.cuerpo).includes("SF Pro")) {
        Add("FALLO", donde, "la familia tipografica del cuerpo no es SF Pro: " + t.cuerpo);
      }
    }
  }
  await ctx.close();
}

/* ---------------------------------------------------------------- */
const fallos = HALLAZGOS.filter((h) => h.nivel === "FALLO");
const avisos = HALLAZGOS.filter((h) => h.nivel === "AVISO");
const lineas = [
  `# Informe de responsividad y tipografía · BLINK POS`,
  ``,
  `**Fecha:** ${new Date().toISOString().slice(0, 16).replace("T", " ")} · **Base:** ${BASE}`,
  ``,
  `- Resoluciones: ${RESOLUCIONES.map((r) => r.etiqueta).join(", ")}`,
  `- Vistas por resolución: ${RUTAS.length}`,
  `- **Fallos: ${fallos.length}** · Avisos: ${avisos.length}`,
  ``,
  `## Hallazgos`,
  ``,
];
if (!HALLAZGOS.length) lineas.push("Sin incidencias.");
else for (const h of HALLAZGOS) lineas.push(`- **${h.nivel}** · \`${h.donde}\` · ${h.msg}`);
fs.writeFileSync(path.join(OUT, "qa-responsive-informe.md"), lineas.join("\n") + "\n");
console.log("\ninforme en", path.join(OUT, "qa-responsive-informe.md"));

await browser.close();
process.exit(fallos.length ? 1 : 0);
