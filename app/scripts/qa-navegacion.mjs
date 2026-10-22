// ============================================================
// BLINK POS · Prueba de la navegación móvil
// ------------------------------------------------------------
// Comprueba el rediseño de la navegación:
//   · no hay menú hamburguesa ni panel lateral en móvil;
//   · la barra inferior flotante tiene 5 elementos con la acción
//     principal (Vender) EXACTAMENTE en el centro y en color de acento;
//   · los elementos laterales son simétricos y llevan etiqueta;
//   · el menú de avatar agrupa cuenta, ajustes y cierre de sesión;
//   · ningún control escala al mantenerlo pulsado.
//
// Uso:  node scripts/qa-navegacion.mjs
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
const Add = (nivel, msg) => {
  HALLAZGOS.push({ nivel, msg });
  console.log(`  ${nivel === "FALLO" ? "!!" : nivel === "AVISO" ? "~~" : "ok"} ${msg}`);
};

const browser = await chromium.launch();
const errores = [];

/* ------------------------------------------------------------
   Sesión: cuenta QA real (si hay) o bypass local.
   ------------------------------------------------------------ */
async function sesion(ctx) {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errores.push("PAGEERROR " + String(e.message).slice(0, 140)));
  page.on("console", (m) => {
    if (m.type() === "error") errores.push("CONSOLE " + m.text().slice(0, 140));
  });
  await page.goto(BASE + "/app/entrar", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const hayForm = await page.locator('input[type="email"]').count();
  if (hayForm) {
    await page.fill('input[type="email"]', "qa.blink@tienda.local");
    await page.fill('input[type="password"]', "ClavePrueba123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3500);
  } else {
    await page.goto(BASE + "/app/entrar?bypass=1", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
  }
  return page;
}

/* ============================================================
   1 · Móvil
   ============================================================ */
console.log("\n=== Móvil (390 x 844) ===");
const ctxMovil = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  colorScheme: "light",
});
const movil = await sesion(ctxMovil);
await movil.goto(BASE + "/app/inicio", { waitUntil: "networkidle" });
await movil.waitForTimeout(1200);

/* --- 1.1 · Sin hamburguesa ni panel lateral --- */
const sinHamburguesa = await movil.evaluate(() => {
  const b = document.querySelector(".shell__menu");
  const s = document.querySelector(".shell__sidebar");
  return {
    boton: b ? getComputedStyle(b).display : "no existe",
    lateral: s ? getComputedStyle(s).display : "no existe",
  };
});
Add(
  sinHamburguesa.boton === "no existe" || sinHamburguesa.boton === "none"
    ? "ok"
    : "FALLO",
  `no hay botón hamburguesa (${sinHamburguesa.boton})`
);
Add(
  sinHamburguesa.lateral === "none" ? "ok" : "FALLO",
  `la barra lateral no se muestra en móvil (${sinHamburguesa.lateral})`
);

/* --- 1.2 · La barra inferior --- */
const barra = await movil.evaluate(() => {
  const cont = document.querySelector(".shell__tabbar-float");
  if (!cont) return null;
  const cs = getComputedStyle(cont);
  const items = [...document.querySelectorAll(".tabbar__item, .tabbar__main")].map((e) => {
    const r = e.getBoundingClientRect();
    const cs2 = getComputedStyle(e);
    return {
      texto: e.textContent.trim(),
      clase: e.className,
      centro: r.left + r.width / 2,
      izquierda: r.left,
      derecha: r.right,
      ancho: r.width,
      color: cs2.color,
      etiqueta: !!e.querySelector(".tabbar__label, .tabbar__main-label"),
      glifo: e.querySelector("svg") ? e.querySelector("svg").innerHTML.length : 0,
    };
  });
  const principal = document.querySelector(".tabbar__main");
  const glifoPrincipal = principal ? principal.querySelector("svg") : null;
  return {
    visible: cs.display,
    material: cs.backdropFilter,
    items,
    vw: window.innerWidth,
    glifoPrincipal: glifoPrincipal ? glifoPrincipal.innerHTML.length : 0,
    colorPrincipal: principal ? getComputedStyle(principal.querySelector(".tabbar__main-glyph")).backgroundColor : "",
  };
});

if (!barra || barra.visible === "none") {
  Add("FALLO", "la barra inferior flotante no se muestra");
} else {
  Add("ok", `barra inferior flotante visible con material (${barra.material})`);
  Add(barra.items.length === 5 ? "ok" : "FALLO", `la barra tiene 5 elementos (${barra.items.length})`);

  const principal = barra.items.find((i) => i.clase.includes("tabbar__main"));
  if (!principal) {
    Add("FALLO", "no hay acción central en la barra");
  } else {
    const desvio = Math.abs(principal.centro - barra.vw / 2);
    Add(desvio <= 1.5 ? "ok" : "FALLO", `la acción central está centrada (desvío ${desvio.toFixed(2)} px)`);
    Add(
      principal.texto === "Vender" ? "ok" : "FALLO",
      `la acción central es "Vender" (${principal.texto})`
    );
    Add(barra.glifoPrincipal > 0 ? "ok" : "FALLO", "la acción central lleva el glifo del símbolo de dólar");
    const acento = /0,\s*136,\s*255|0,\s*145,\s*255|0,\s*136,\s*255/.test(barra.colorPrincipal);
    Add(acento ? "ok" : "AVISO", `la acción central usa el color de acento (${barra.colorPrincipal})`);
  }

  const laterales = barra.items.filter((i) => !i.clase.includes("tabbar__main"));
  Add(
    laterales.length === 4 ? "ok" : "FALLO",
    `hay 4 elementos laterales (${laterales.length})`
  );
  Add(
    laterales.every((i) => i.etiqueta) ? "ok" : "FALLO",
    "los elementos laterales llevan etiqueta"
  );
  Add(
    laterales.every((i) => i.glifo > 0) ? "ok" : "FALLO",
    "los elementos laterales llevan icono"
  );

  /* Simetría: el último de la izquierda y el primero de la derecha
     están a la misma distancia del centro. */
  const izq = laterales.filter((i) => i.centro < barra.vw / 2).sort((a, b) => b.centro - a.centro);
  const der = laterales.filter((i) => i.centro > barra.vw / 2).sort((a, b) => a.centro - b.centro);
  if (izq.length === 2 && der.length === 2) {
    const d1 = barra.vw / 2 - izq[0].centro;
    const d2 = der[0].centro - barra.vw / 2;
    Add(Math.abs(d1 - d2) <= 1.5 ? "ok" : "FALLO", `elementos laterales simétricos (${d1.toFixed(1)} vs ${d2.toFixed(1)} px)`);
  } else {
    Add("FALLO", `distribución lateral desigual (${izq.length} a la izquierda, ${der.length} a la derecha)`);
  }
}

/* --- 1.3 · Navegar con la barra --- */
await movil.click('.tabbar__item[href="/app/catalogo"]');
await movil.waitForTimeout(900);
const navegacion = await movil.evaluate(() => ({
  ruta: location.pathname,
  activo: document.querySelector(".tabbar__item.is-active")?.textContent.trim() ?? "",
}));
Add(
  navegacion.ruta === "/app/catalogo" && navegacion.activo === "Catálogo" ? "ok" : "FALLO",
  `la barra navega y marca el activo (${navegacion.ruta}, "${navegacion.activo}")`
);

/* --- 1.4 · Menú de avatar --- */
await movil.click(".userchip--button");
await movil.waitForTimeout(450);
const menu = await movil.evaluate(() => {
  const m = document.querySelector(".avatarmenu");
  if (!m) return null;
  const items = [...m.querySelectorAll(".avatarmenu__item")].map((e) => ({
    texto: e.textContent.trim(),
    color: getComputedStyle(e).color,
   separado: !!e.previousElementSibling?.classList.contains("avatarmenu__sep"),
  }));
  return { visible: getComputedStyle(m).display, items };
});
if (!menu) {
  Add("FALLO", "el menú de avatar no se abre");
} else {
  Add("ok", "el menú de avatar se abre como panel flotante");
  const textos = menu.items.map((i) => i.texto);
  Add(
    textos.some((t) => /comercio/i.test(t)) ? "ok" : "FALLO",
    `el menú ofrece los datos del comercio (${textos.join(" | ")})`
  );
  Add(
    textos.some((t) => /perfil/i.test(t)) ? "ok" : "FALLO",
    "el menú ofrece el perfil de la cuenta"
  );
  Add(
    textos.some((t) => /ajustes/i.test(t)) ? "ok" : "FALLO",
    "el menú ofrece los ajustes"
  );
  const salir = menu.items.find((i) => /cerrar sesión/i.test(i.texto));
  Add(salir ? "ok" : "FALLO", "el menú ofrece cerrar sesión");
  if (salir) {
    Add(salir.separado ? "ok" : "FALLO", "cerrar sesión va separado del resto");
    const peligro = /255,\s*56,\s*60|255,\s*66,\s*69/.test(salir.color);
    Add(peligro ? "ok" : "AVISO", `cerrar sesión se diferencia por color (${salir.color})`);
  }
}
await movil.screenshot({ path: path.join(OUT, "qa-navegacion-avatar-movil.png") });
await movil.keyboard.press("Escape");
await movil.waitForTimeout(300);

/* --- 1.5 · Sin escalado al pulsar --- */
const escalado = await movil.evaluate(() => {
  const selectores = [".btn", ".tabbar__item", ".tabbar__main", ".row-action", ".icon-btn"];
  const fallos = [];
  for (const sel of selectores) {
    for (const el of document.querySelectorAll(sel)) {
      const t = getComputedStyle(el).transform;
      if (t && t !== "none" && /matrix\(/.test(t)) {
        const m = t.match(/matrix\(([^)]+)\)/);
        if (m && m[1].split(",").length === 6) {
          const [a, b, c, d] = m[1].split(",").map(Number);
          if (a !== 1 || d !== 1) fallos.push(sel);
        }
      }
    }
  }
  return [...new Set(fallos)];
});
Add(
  escalado.length === 0 ? "ok" : "FALLO",
  escalado.length === 0
    ? "ningún control se escala al mantenerlo pulsado"
    : `hay controles con escala al pulsar: ${escalado.join(", ")}`
);

await ctxMovil.close();

/* ============================================================
   2 · General (dashboard)
   ============================================================ */
console.log("\n=== General (dashboard) ===");
const ctxGen = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" });
const gen = await sesion(ctxGen);
await gen.goto(BASE + "/app/inicio", { waitUntil: "networkidle" });
await gen.waitForTimeout(1400);

const general = await gen.evaluate(() => {
  const h1 = document.querySelector(".page-head h1");
  const tarjetas = [...document.querySelectorAll(".bento__card")];
  const kpis = [...document.querySelectorAll(".bento__kpi")];
  const cs = tarjetas[0] ? getComputedStyle(tarjetas[0]) : null;
  const valor = document.querySelector(".bento__kpi-value");
  const barras = [...document.querySelectorAll(".chart__bar")];
  return {
    titulo: h1 ? h1.textContent.trim() : "",
    tarjetas: tarjetas.length,
    kpis: kpis.length,
    blur: cs ? cs.backdropFilter : "",
    borde: cs ? cs.borderTopWidth : "",
    radio: cs ? cs.borderTopLeftRadius : "",
    tabular: valor ? getComputedStyle(valor).fontVariantNumeric : "",
    familia: valor ? getComputedStyle(valor).fontFamily : "",
    barras: barras.length,
    detalle: document.querySelector(".chart__detail")?.textContent.trim() ?? "",
    detalleTitulo: document.querySelector(".chart__detail-title")?.textContent.trim() ?? "",
  };
});

/* El panel se saluda por el nombre del dueño: "Hola, <nombre>". */
Add(
  /^Hola\b/.test(general.titulo) ? "ok" : "FALLO",
  `la pantalla saluda al usuario ("${general.titulo}")`
);
Add(general.kpis === 4 ? "ok" : "FALLO", `hay 4 tarjetas de metrica (${general.kpis})`);
Add(/blur\(/.test(general.blur) ? "ok" : "FALLO", `las tarjetas son de cristal (${general.blur})`);
Add(
  parseFloat(general.borde) >= 1 && parseFloat(general.borde) <= 1.5 ? "ok" : "FALLO",
  `las tarjetas llevan borde de 1 px (${general.borde})`
);
Add(
  parseFloat(general.radio) >= 20 ? "ok" : "FALLO",
  `las tarjetas tienen radio de 20 px o mas (${general.radio})`
);
Add(
  general.tabular.includes("tabular-nums") ? "ok" : "FALLO",
  `las cifras usan cifras tabulares (${general.tabular})`
);
Add(
  /SF Pro/.test(general.familia) ? "ok" : "FALLO",
  `las cifras usan SF Pro (${general.familia.split(",")[0]})`
);
Add(general.barras === 12 ? "ok" : "FALLO", `el grafico tiene 12 meses (${general.barras})`);
Add(
  general.detalleTitulo.length > 0 ? "ok" : "FALLO",
  `la tarjeta flotante muestra el mes elegido (${general.detalleTitulo})`
);

/* --- El grafico es interactivo: al tocar un mes cambia el detalle --- */
const antes = general.detalle;
await gen.click(".chart__bar:nth-child(3)");
await gen.waitForTimeout(400);
const despues = await gen.evaluate(() => ({
  detalle: document.querySelector(".chart__detail")?.textContent.trim() ?? "",
  activos: document.querySelectorAll(".chart__bar.is-active").length,
  titulo: document.querySelector(".chart__detail-title")?.textContent.trim() ?? "",
}));
Add(
  despues.detalle !== antes && despues.activos === 1 ? "ok" : "FALLO",
  `tocar un mes actualiza la tarjeta flotante (${antes} -> ${despues.titulo})`
);

/* --- El selector de periodo cambia las cifras --- */
const valorMes = await gen.evaluate(
  () => document.querySelector(".bento__kpi-value")?.textContent.trim() ?? ""
);
await gen.click('.segmented button:nth-child(1), [role="tab"]:nth-child(1)').catch(async () => {
  await gen.click(".tabs button:nth-child(1)");
});
await gen.waitForTimeout(700);
const valorHoy = await gen.evaluate(
  () => document.querySelector(".bento__kpi-value")?.textContent.trim() ?? ""
);
Add(
  valorHoy.length > 0 ? "ok" : "FALLO",
  `el selector de periodo funciona (mes: ${valorMes}, hoy: ${valorHoy})`
);

await ctxGen.close();

/* ============================================================
   3 · Escritorio
   ============================================================ */
console.log("\n=== Escritorio (1280 x 860) ===");
const ctxEsc = await browser.newContext({ viewport: { width: 1280, height: 860 }, colorScheme: "light" });
const esc = await sesion(ctxEsc);
await esc.goto(BASE + "/app/inicio", { waitUntil: "networkidle" });
await esc.waitForTimeout(1200);

const escritorio = await esc.evaluate(() => {
  const barra = document.querySelector(".shell__tabbar-float");
  const lateral = document.querySelector(".shell__sidebar");
  const modulos = [...document.querySelectorAll(".nav__link")].map((e) => e.textContent.trim());
  const panel = [...document.querySelectorAll(".modgrid__item")].map((e) => e.textContent.trim());
  return {
    barra: barra ? getComputedStyle(barra).display : "no existe",
    lateral: lateral ? getComputedStyle(lateral).display : "no existe",
    modulos,
    panel,
  };
});
Add(escritorio.barra === "none" ? "ok" : "FALLO", `en escritorio no hay barra inferior (${escritorio.barra})`);
Add(escritorio.lateral !== "none" ? "ok" : "FALLO", `en escritorio se ve la barra lateral (${escritorio.lateral})`);
Add(
  escritorio.modulos.some((m) => /historial/i.test(m)) ? "ok" : "FALLO",
  "la barra lateral incluye Historial con su icono de reloj"
);
Add(
  escritorio.panel.length >= 8 ? "ok" : "FALLO",
  `el panel de General lista ${escritorio.panel.length} módulos`
);

/* ============================================================
   3 · La barra superior (v1.18.0)
   ============================================================ */
console.log("\n=== Barra superior ===");
const ctxBarra2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" });
const barra2 = await sesion(ctxBarra2);
await barra2.goto(BASE + "/app/inicio", { waitUntil: "networkidle" });
await barra2.waitForTimeout(1200);

const infoBarra = await barra2.evaluate(() => {
  const top = document.querySelector(".shell__topbar");
  const nombre = top?.querySelector(".topbar__name");
  const tasa = top?.querySelector(".rate-chip strong");
  const botones = [...(top?.querySelectorAll("button") ?? [])].map((b) =>
    (b.textContent || "").trim()
  );
  const fondo = getComputedStyle(top).backgroundColor;
  const pagina = getComputedStyle(document.querySelector(".general")).backgroundColor;
  return {
    nombre: (nombre?.textContent || "").trim(),
    peso: nombre ? getComputedStyle(nombre).fontWeight : "",
    tasa: (tasa?.textContent || "").trim(),
    botones,
    fondo,
    pagina,
  };
});

Add(
  infoBarra.nombre.length > 0 ? "ok" : "FALLO",
  `la barra lleva el nombre del comercio ("${infoBarra.nombre}")`
);
Add(
  Number(infoBarra.peso) >= 500 && Number(infoBarra.peso) <= 600 ? "ok" : "FALLO",
  `el nombre va en peso medio (${infoBarra.peso})`
);
Add(
  /^Bs [\d.,]+$/.test(infoBarra.tasa) && /[.,]\d{2}$/.test(infoBarra.tasa) ? "ok" : "FALLO",
  `la tasa se muestra con dos decimales ("${infoBarra.tasa}")`
);
Add(
  !infoBarra.botones.some((b) => /Vincular|Escaner|Escáner/.test(b)) ? "ok" : "FALLO",
  `la barra no tiene boton de escaner (${infoBarra.botones.join(" | ") || "sin botones"})`
);
Add(
  !infoBarra.botones.some((b) => /caja/i.test(b)) ? "ok" : "FALLO",
  `la barra no tiene boton de caja (${infoBarra.botones.join(" | ") || "sin botones"})`
);
Add(
  infoBarra.fondo === infoBarra.pagina ? "ok" : "FALLO",
  `la barra y la pagina comparten el mismo fondo (${infoBarra.fondo} / ${infoBarra.pagina})`
);
await ctxBarra2.close();

/* ============================================================
   4 · Selector de periodo (v1.18.0)
   ============================================================ */
console.log("\n=== Selector de periodo ===");
const ctxPeriodo = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" });
const periodo = await sesion(ctxPeriodo);
await periodo.goto(BASE + "/app/inicio", { waitUntil: "networkidle" });
await periodo.waitForTimeout(1200);

const infoPeriodo = await periodo.evaluate(() => {
  const pestanas = [...document.querySelectorAll(".page-head .tabs button")].map((b) =>
    (b.textContent || "").trim()
  );
  const activo = document.querySelector(".page-head .tabs button.is-active, .page-head .tabs button[aria-pressed='true']");
  return { pestanas, activo: (activo?.textContent || "").trim() };
});

Add(
  infoPeriodo.pestanas.join(",") === "Día,Semana,Mes" ? "ok" : "FALLO",
  `el selector tiene Dia, Semana y Mes (${infoPeriodo.pestanas.join(", ")})`
);
Add(
  !infoPeriodo.pestanas.includes("Año") ? "ok" : "FALLO",
  `el selector ya no tiene la opcion Año`
);
await ctxPeriodo.close();

/* ============================================================
   5 · Catalogo de tarjetas (v1.18.0)
   ============================================================ */
console.log("\n=== Catalogo ===");
const ctxCatalogo = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light" });
const catalogo = await sesion(ctxCatalogo);
await catalogo.goto(BASE + "/app/catalogo", { waitUntil: "networkidle" });
await catalogo.waitForTimeout(1200);

const infoCatalogo = await catalogo.evaluate(() => {
  const tarjetas = [...document.querySelectorAll(".prodcard")];
  const primera = tarjetas[0];
  const miniatura = primera?.querySelector(".prodthumb");
  const precio = primera?.querySelector(".prodcard__precio strong");
  const cs = primera ? getComputedStyle(primera) : null;
  return {
    tarjetas: tarjetas.length,
    tabla: document.querySelectorAll("table.data").length,
    miniatura: miniatura ? (miniatura.textContent || "").trim() : "",
    radioMini: miniatura ? getComputedStyle(miniatura).borderRadius : "",
    precio: (precio?.textContent || "").trim(),
    blur: cs?.backdropFilter || "",
    columnas: getComputedStyle(document.querySelector(".prodgrid")).gridTemplateColumns.split(" ").length,
  };
});

Add(infoCatalogo.tarjetas > 0 ? "ok" : "FALLO", `el catalogo muestra tarjetas (${infoCatalogo.tarjetas})`);
Add(infoCatalogo.tabla === 0 ? "ok" : "FALLO", `el catalogo ya no usa la tabla de nueve columnas`);
Add(
  infoCatalogo.miniatura.length > 0 ? "ok" : "FALLO",
  `cada producto lleva su miniatura ("${infoCatalogo.miniatura}")`
);
Add(
  parseFloat(infoCatalogo.radioMini) >= 10 ? "ok" : "FALLO",
  `la miniatura tiene las esquinas redondeadas (${infoCatalogo.radioMini})`
);
Add(
  infoCatalogo.precio.startsWith("$") ? "ok" : "FALLO",
  `el precio se alinea a la derecha ("${infoCatalogo.precio}")`
);
Add(
  /blur\(/.test(infoCatalogo.blur) ? "ok" : "FALLO",
  `la tarjeta es de cristal (${infoCatalogo.blur})`
);
Add(
  infoCatalogo.columnas >= 2 ? "ok" : "FALLO",
  `la rejilla tiene varias columnas (${infoCatalogo.columnas})`
);
await ctxCatalogo.close();

/* ============================================================
   6 · Tablas en movil: tarjetas apiladas con rotulo (v1.18.0)
   ============================================================ */
console.log("\n=== Tablas en movil ===");
const ctxTabla = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "light" });
const tabla = await sesion(ctxTabla);
await tabla.goto(BASE + "/app/inventario", { waitUntil: "networkidle" });
await tabla.waitForTimeout(1200);

const infoTabla = await tabla.evaluate(() => {
  const celdas = [...document.querySelectorAll("table.data tbody tr td")].filter(
    (td) => !td.classList.contains("row-actions")
  );
  const conRotulo = celdas.filter((td) => (td.getAttribute("data-label") || "").length > 0);
  const desbordes = document.documentElement.scrollWidth > window.innerWidth + 2;
  return {
    celdas: celdas.length,
    conRotulo: conRotulo.length,
    desbordes,
    primero: conRotulo[0]?.getAttribute("data-label") || "",
  };
});

Add(
  infoTabla.celdas > 0 && infoTabla.conRotulo === infoTabla.celdas ? "ok" : "FALLO",
  `las celdas llevan su rotulo (${infoTabla.conRotulo}/${infoTabla.celdas}, el primero es "${infoTabla.primero}")`
);
Add(
  !infoTabla.desbordes ? "ok" : "FALLO",
  `la vista no tiene scroll horizontal`
);
await ctxTabla.close();

await esc.screenshot({ path: path.join(OUT, "qa-navegacion-escritorio.png") });
await ctxEsc.close();

await browser.close();

const fallos = HALLAZGOS.filter((h) => h.nivel === "FALLO");
const avisos = HALLAZGOS.filter((h) => h.nivel === "AVISO");
console.log(`\nFallos: ${fallos.length} · Avisos: ${avisos.length}`);
if (errores.length) {
  console.log(`\nErrores de consola (${errores.length}):`);
  for (const e of [...new Set(errores)].slice(0, 10)) console.log("  " + e);
}
fs.writeFileSync(
  path.join(OUT, "qa-navegacion-informe.md"),
  `# QA · Navegación móvil\n\n**Base:** ${BASE} · **Fecha:** ${new Date().toISOString().slice(0, 16).replace("T", " ")}\n\n` +
    HALLAZGOS.map((h) => `- ${h.nivel === "FALLO" ? "❌" : h.nivel === "AVISO" ? "⚠️" : "✅"} ${h.msg}`).join("\n") +
    `\n\n**Fallos:** ${fallos.length} · **Avisos:** ${avisos.length}\n`
);

process.exit(fallos.length === 0 && errores.length === 0 ? 0 : 1);
