// Genera la imagen de vista previa (Open Graph / Twitter Card) de BLINK POS.
//
// Salida:  app/public/og-image.png  — 1200 x 630 px (la proporción que
//          piden WhatsApp, Telegram, X, LinkedIn y Slack).
//
// Es una COMPOSICIÓN, no una captura: así el encuadre es exacto, nada
// queda recortado y la imagen no depende de que la landing esté en pie.
//
// Fuentes: usa la SF Pro real de `app/.fonts-sf-local/` (solo local,
// nunca se distribuye: va incrustada en el PNG, que es una imagen).
// Si esos ficheros no están, el script cae a la pila del sistema.
//
// Uso:  npm run og
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const APP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(APP, "public");
const LOCAL_FONTS = path.join(APP, ".fonts-sf-local");

/* ------------------------------------------------------------------
   Paleta oficial BLINK (el acento es el Azul Principal).
   ------------------------------------------------------------------ */
const AZUL = "#0088ff";
const AZUL_OSCURO = "#0091ff";
const PAPEL = "#FFFEFB";
const TINTA = "#1D1D1F";
const TINTA_2 = "#424242";
const MARCO = "#1d1d1f";

const b64 = (p) => fs.readFileSync(p).toString("base64");

/**
 * SF Pro real incrustada en la imagen. Los ficheros de
 * `.fonts-sf-local/` son instancias estaticas: se declara uno por peso.
 * Si no estan (clon limpio), la pila del sistema hace el trabajo.
 */
function fuentes() {
  const jobs = [
    { file: "sf-regular.woff2", peso: 400 },
    { file: "sf-semibold.woff2", peso: "500 600" },
    { file: "sf-bold.woff2", peso: "700 800" },
  ];
  let css = "";
  for (const j of jobs) {
    const p = path.join(LOCAL_FONTS, j.file);
    if (!fs.existsSync(p)) continue;
    css += `@font-face{font-family:"SFPD";src:url(data:font/woff2;base64,${b64(p)}) format("woff2");font-weight:${j.peso};font-style:normal}`;
  }
  return css;
}

/** Isotipo de BLINK: se extraen los trazados del favicon y se recolorean. */
function markSvg(color) {
  const raw = fs.readFileSync(path.join(PUB, "favicon.svg"), "utf8");
  return raw
    .replace(/role="img"[^>]*>/, ">")
    .replace(/<title>[^<]*<\/title>/, "")
    .replace(/#007AFF/gi, color);
}

const check = () =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4 10-11"/></svg>`;
const search = () =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/></svg>`;
const qr = () =>
  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h7v7H3V3Zm2 2v3h3V5H5Zm9-2h7v7h-7V3Zm2 2v3h3V5h-3ZM3 14h7v7H3v-7Zm2 2v3h3v-3H5Zm12-3h2v2h-2v-2Zm3 0h1v4h-2v-2h1Zm-4 3h2v1h-2v-1Zm3 0h2v1h-2v-1Zm-3 1h3v2h-2v-2Z"/></svg>`;

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<style>
${fuentes()}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{width:1200px;height:630px;overflow:hidden;background:${PAPEL};
  font-family:"SFPD",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  color:${TINTA};-webkit-font-smoothing:antialiased}
.card{position:relative;width:1200px;height:630px;display:flex;overflow:hidden}

/* Velo de acento: la "iluminacion Liquid Glass" de la landing. */
.veil{position:absolute;inset:0;background:
  radial-gradient(46% 74% at 84% 12%, rgba(0,136,255,.16), transparent 68%),
  radial-gradient(38% 58% at 62% 92%, rgba(0,136,255,.10), transparent 70%)}

/* --- Columna izquierda --- */
.left{position:relative;z-index:2;flex:1;min-width:0;padding:58px 0 52px 64px;
  display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:14px;margin-bottom:34px}
.brand svg{width:44px;height:44px;display:block}
.brand b{font-size:31px;font-weight:800;font-style:italic;letter-spacing:-.03em;
  text-transform:uppercase;color:${AZUL};line-height:1}
.brand i{font-size:31px;font-weight:300;font-style:normal;letter-spacing:-.01em;
  text-transform:uppercase;color:${TINTA};line-height:1}
h1{font-size:53px;line-height:1.08;letter-spacing:-.034em;font-weight:700;max-width:600px}
h1 em{font-style:normal;color:${AZUL}}
.sub{margin-top:20px;font-size:19px;line-height:1.5;color:${TINTA_2};max-width:540px}
.pills{margin-top:28px;display:flex;gap:8px;flex-wrap:wrap}
.pill{display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:999px;
  background:rgba(0,136,255,.09);color:${AZUL};font-size:14px;font-weight:600}
.pill svg{width:14px;height:14px;flex:none}
.foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;
  padding-right:30px}
.foot span{font-size:17px;color:${TINTA_2};font-weight:500}
.price{display:inline-flex;align-items:baseline;gap:5px}
.price b{font-size:33px;font-weight:700;letter-spacing:-.03em;color:${TINTA}}
.price i{font-size:17px;font-style:normal;color:${TINTA_2};font-weight:600}

/* --- Columna derecha: el mockup y las tarjetas de cristal --- */
.right{position:relative;z-index:2;width:470px;flex:none;display:flex;
  align-items:center;justify-content:center;gap:12px;padding-right:30px}

/* Tarjeta de cristal: el material de la landing. */
.glass{position:absolute;border-radius:22px;background:rgba(255,254,251,.72);
  border:1px solid rgba(66,66,66,.12);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 12px 32px rgba(29,29,31,.08);
  backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%)}
.g1{width:232px;padding:16px 18px 18px;top:46px;left:0}
.g1 .k{font-size:11px;font-weight:600;color:${TINTA_2};letter-spacing:.01em}
.g1 .v{font-size:29px;font-weight:700;letter-spacing:-.028em;margin-top:3px;
  font-variant-numeric:tabular-nums}
.g1 .m{display:inline-flex;align-items:center;gap:5px;margin-top:8px;padding:3px 9px;
  border-radius:999px;background:rgba(52,199,89,.15);color:#34c759;font-size:11px;
  font-weight:700;white-space:nowrap}
.g1 .m svg{width:12px;height:12px;flex:none}
.g2{width:206px;padding:14px 16px 16px;bottom:40px;left:0}
.g2 .k{font-size:11px;font-weight:600;color:${TINTA_2}}
.g2 .v{font-size:21px;font-weight:700;letter-spacing:-.02em;margin-top:2px;
  font-variant-numeric:tabular-nums}
.g2 .m{font-size:11px;color:${TINTA_2};margin-top:3px}

/* Maqueta del POS. */
.pos{position:relative;z-index:2;width:294px;flex:none;background:${MARCO};border-radius:17px;padding:9px;
  box-shadow:0 30px 62px rgba(29,29,31,.34)}
.pos__screen{background:${PAPEL};border-radius:10px;padding:13px 14px 15px;
  display:flex;flex-direction:column;gap:10px;min-height:244px}
.pos__search{height:27px;border-radius:999px;background:rgba(66,66,66,.07);
  display:flex;align-items:center;padding:0 10px;font-size:11px;color:${TINTA_2};gap:6px}
.pos__search svg{width:12px;height:12px;flex:none}
.pos__line{display:flex;justify-content:space-between;align-items:baseline;gap:10px;
  font-size:11.5px;color:${TINTA_2};padding:5px 0;border-bottom:1px dashed rgba(66,66,66,.14)}
.pos__line b{color:${TINTA};font-weight:600}
.pos__total{margin-top:auto;padding-top:11px;border-top:2px solid ${TINTA};
  display:flex;justify-content:space-between;align-items:baseline}
.pos__total span{font-size:10.5px;color:${TINTA_2}}
.pos__total strong{font-size:25px;font-weight:700;letter-spacing:-.025em;
  font-variant-numeric:tabular-nums}
.pos__bs{font-size:10px;color:${TINTA_2};margin-top:3px;font-variant-numeric:tabular-nums}

/* Celular escaneando, apoyado en el marco. */
.phone{position:relative;z-index:3;width:130px;flex:none;background:${MARCO};
  border-radius:22px;padding:7px;box-shadow:0 24px 46px rgba(29,29,31,.38)}
.phone__screen{position:relative;aspect-ratio:9/14;border-radius:16px;overflow:hidden;
  background:linear-gradient(180deg,#1c1c1e,#000);display:grid;place-items:center}
.phone__screen{position:relative;aspect-ratio:9/14;border-radius:16px;overflow:hidden;
  background:linear-gradient(180deg,#1c1c1e,#000);display:grid;place-items:center}
.phone__mark{position:absolute;inset:16% 14%;border:2px solid ${AZUL};border-radius:12px}
.phone__bars{width:60%;height:30%;opacity:.92;background:repeating-linear-gradient(90deg,
  #fff 0 2px,transparent 2px 4px,#fff 4px 6px,transparent 6px 9px)}
.phone__pill{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);
  white-space:nowrap;font-size:9px;font-weight:700;color:${AZUL};background:rgba(255,255,255,.94);
  padding:3px 8px;border-radius:999px;box-shadow:0 4px 10px rgba(0,0,0,.22)}
</style></head>
<body><div class="card">
  <div class="veil"></div>

  <div class="left">
    <div class="brand">${markSvg(AZUL)}<b>BLINK</b><i>POS</i></div>
    <h1>Vende en un parpadeo,<br>factura con <em>BLINK ;)</em></h1>
    <p class="sub">El punto de venta hecho para Venezuela. Multimoneda a tasa BCV,
      escáner desde el celular y 100 % en la nube.</p>
    <div class="pills">
      <span class="pill">${check()}Tasa BCV automática</span>
      <span class="pill">${check()}Escáner desde el celular</span>
      <span class="pill">${check()}100 % en la nube</span>
    </div>
    <div class="foot">
      <span>blink.com.ve</span>
      <span class="price"><b>$25</b><i>/ mes · todo incluido</i></span>
    </div>
  </div>

  <div class="right">
    <div class="glass g1">
      <div class="k">Ventas de hoy</div>
      <div class="v">$ 1.240,00</div>
      <div class="m">${check()}12,4 %</div>
    </div>

    <div class="pos">
      <div class="pos__screen">
        <div class="pos__search">${search()}Buscar o escanear…</div>
        <div class="pos__line"><b>AZUCAR KONFIT 1kg</b><span>2 × $2.00</span></div>
        <div class="pos__line"><b>MALTA RETORNABLE</b><span>3 × $1.50</span></div>
        <div class="pos__line"><b>PAPEL DE ALUMINIO TUC</b><span>1 × $0.90</span></div>
        <div class="pos__total"><span>Total a pagar</span><strong>$ 8.40</strong></div>
        <div class="pos__bs">Bs 7.408,80 · Tasa BCV 882.00</div>
      </div>
    </div>

    <div class="phone">
      <div class="phone__screen">
        <span class="phone__mark"></span>
        <div class="phone__bars"></div>
        <span class="phone__pill">Escaneado</span>
      </div>
    </div>

    <div class="glass g2">
      <div class="k">Tasa BCV</div>
      <div class="v">882,00 Bs/$</div>
      <div class="m">Actualizada al instante</div>
    </div>
  </div>

</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const dest = path.join(PUB, "og-image.png");
await page.screenshot({ path: dest });
await browser.close();
console.log("og-image.png generado:", Math.round(fs.statSync(dest).size / 1024), "KB · 1200x630");
