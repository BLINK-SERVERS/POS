// Genera la imagen de preview Open Graph (1200x630) de BLINK POS.
//
// Entradas:  app/public/favicon.svg (isotipo) + fuentes SF Pro Display en app/public/fonts
// Salida:    app/public/og-image.png
//
// Uso:  npm run og
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const APP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(APP, "public");

const b64 = (p) => fs.readFileSync(p).toString("base64");
const font = (file) => `@font-face{font-family:"SFPD";src:url(data:font/otf;base64,${b64(path.join(PUB, "fonts", file))}) format("opentype");font-weight:${file.includes("Bold") ? 800 : file.includes("Semibold") ? 600 : file.includes("Light") ? 300 : 400};font-style:${file.includes("Italic") ? "italic" : "normal"}}`;

/** Isotipo: se extraen los trazados del favicon y se recolorean. */
function markSvg(color) {
  const raw = fs.readFileSync(path.join(PUB, "favicon.svg"), "utf8");
  return raw
    .replace(/role="img"[^>]*>/, ">")
    .replace(/<title>[^<]*<\/title>/, "")
    .replace(/#3347DD/gi, color);
}

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<style>
${font("SF-Pro-Display-Bold.otf")}
${font("SF-Pro-Display-Semibold.otf")}
${font("SF-Pro-Display-Regular.otf")}
${font("SF-Pro-Display-Light.otf")}
${font("SF-Pro-Display-RegularItalic.otf")}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{width:1200px;height:630px;overflow:hidden;background:#FFFEFB;
  font-family:"SFPD",system-ui,-apple-system,"Segoe UI",sans-serif;color:#1D1D1F;
  -webkit-font-smoothing:antialiased}
.card{position:relative;width:1200px;height:630px;display:flex;overflow:hidden}

/* --- Panel derecho con la maqueta del POS --- */
.right{position:relative;width:470px;flex:none;background:#1D1D1F;
  display:flex;align-items:center;justify-content:center}
.right::before{content:"";position:absolute;width:420px;height:420px;border-radius:50%;
  background:rgba(51,71,221,.30);top:-150px;right:-120px}
.right::after{content:"";position:absolute;width:260px;height:260px;border-radius:50%;
  background:rgba(51,71,221,.18);bottom:-90px;left:-70px}
.pos{position:relative;z-index:2;width:296px;background:#FFFEFB;border-radius:15px;padding:9px;
  box-shadow:0 26px 56px rgba(0,0,0,.42)}
.pos__screen{background:#FFFEFB;border-radius:9px;padding:14px 15px 16px;
  display:flex;flex-direction:column;gap:11px;min-height:250px}
.pos__search{height:28px;border-radius:999px;background:rgba(66,66,66,.07);
  display:flex;align-items:center;padding:0 11px;font-size:11px;color:#424242;gap:6px}
.pos__search svg{width:13px;height:13px;flex:none}
.pos__line{display:flex;justify-content:space-between;align-items:baseline;gap:10px;
  font-size:12px;color:#424242;padding:5px 0;border-bottom:1px dashed rgba(66,66,66,.14)}
.pos__line b{color:#1D1D1F;font-weight:600}
.pos__total{margin-top:auto;padding-top:12px;border-top:2px solid #1D1D1F;
  display:flex;justify-content:space-between;align-items:baseline}
.pos__total span{font-size:11px;color:#424242}
.pos__total strong{font-size:26px;font-weight:800;letter-spacing:-.02em}
.pos__bs{font-size:10.5px;color:#424242;margin-top:3px}

/* --- Columna izquierda --- */
.left{flex:1;min-width:0;padding:62px 0 56px 66px;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:15px;margin-bottom:38px}
.brand svg{width:46px;height:46px;display:block}
.brand b{font-size:32px;font-weight:800;font-style:italic;letter-spacing:-.03em;
  text-transform:uppercase;color:#3347DD;line-height:1}
.brand i{font-size:32px;font-weight:300;font-style:normal;letter-spacing:-.01em;
  text-transform:uppercase;color:#1D1D1F;line-height:1}
h1{font-size:50px;line-height:1.09;letter-spacing:-.032em;font-weight:800;max-width:620px}
h1 em{font-style:normal;color:#3347DD}
.sub{margin-top:20px;font-size:22px;line-height:1.45;color:#424242;max-width:560px}
.pills{margin-top:30px;display:flex;gap:9px;flex-wrap:wrap}
.pill{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:999px;
  background:rgba(51,71,221,.09);color:#3347DD;font-size:15px;font-weight:600}
.pill svg{width:15px;height:15px;flex:none}
.foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;
  padding-right:26px}
.foot span{font-size:17px;color:#424242;font-weight:500}
.price{display:inline-flex;align-items:baseline;gap:5px}
.price b{font-size:34px;font-weight:800;letter-spacing:-.03em;color:#1D1D1F}
.price i{font-size:17px;font-style:normal;color:#424242;font-weight:600}
</style></head>
<body><div class="card">

  <div class="left">
    <div class="brand">${markSvg("#3347DD")}<b>BLINK</b><i>POS</i></div>
    <h1>El punto de venta más <em>rápido</em>, inteligente y adaptado a Venezuela.</h1>
    <p class="sub">Calcula al instante en Dólares y Bolívares a tasa BCV y usa la cámara de tu
      teléfono como escáner. Sin equipos costosos.</p>
    <div class="pills">
      <span class="pill">${check()}Tasa BCV automática</span>
      <span class="pill">${check()}Escáner desde el celular</span>
      <span class="pill">${check()}100% en la nube</span>
    </div>
    <div class="foot">
      <span>blink.com.ve</span>
      <span class="price"><b>$25</b><i>/ mes · todo incluido</i></span>
    </div>
  </div>

  <div class="right">
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
  </div>

</div></body></html>`;

// Iconos de check y lupa (SVG en línea, trazo 2).
function check() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4 10-11"/></svg>`;
}
function search() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.6-3.6"/></svg>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const dest = path.join(PUB, "og-image.png");
await page.screenshot({ path: dest });
await browser.close();
console.log("og-image.png generado:", fs.statSync(dest).size, "bytes");
