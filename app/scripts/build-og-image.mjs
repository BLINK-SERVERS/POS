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
/* Los marcos de los bezels se pintan con gradientes de titanio, no con un plano. */

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
.brand i{font-size:31px;font-weight:500;font-style:normal;letter-spacing:-.01em;
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

/* --- Columna derecha: el escenario de productos Apple --- */
.right{position:relative;z-index:2;width:520px;flex:none;padding-right:36px}
.stage{position:relative;width:100%;height:100%}

/* ============================================================
   Bezels de producto Apple. Cada dispositivo se dibuja con las
   proporciones reales del aparato: iPhone 393x852 pt con radio
   47 y Dynamic Island; iPad Pro 13" horizontal 1366x1024 pt;
   MacBook Pro 14" 1512x982 pt con muesca. Nada de marcos
   genéricos: el radio, el bisel y los botones laterales salen
   de la misma escala.
   ============================================================ */
.iphone,.ipad,.mac{position:absolute}
.iphone__btn,.ipad__camara,.mac__notch,.iphone__isla,.iphone__barra,.ipad__barra{position:absolute}

/* Tarjeta de cristal suelta: el material de la landing. */
.glass{position:absolute;z-index:5;border-radius:20px;background:rgba(255,254,251,.78);
  border:1px solid rgba(66,66,66,.12);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 14px 34px rgba(29,29,31,.10);
  backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%)}
.g2{width:132px;padding:13px 14px 15px;top:56px;left:0}
.g2 .k{font-size:10.5px;font-weight:600;color:${TINTA_2}}
.g2 .v{font-size:20px;font-weight:700;letter-spacing:-.024em;margin-top:2px;
  font-variant-numeric:tabular-nums}
.g2 .m{font-size:10px;color:${TINTA_2};margin-top:3px;line-height:1.35}

/* iPhone 15 Pro — el celular escaneando. */
.iphone{z-index:4;top:246px;left:356px;width:126px;aspect-ratio:393/852;
  padding:3px;border-radius:16px;
  background:linear-gradient(145deg,#3a3a3c 0%,#1c1c1e 40%,#18181a 100%);
  border:1px solid rgba(235,235,245,.18);
  box-shadow:0 26px 52px rgba(29,29,31,.34),inset 0 1px 0 rgba(255,255,255,.06)}
.iphone__btn{width:2px;border-radius:1px;background:#2a2a2c}
.iphone__btn--accion{left:-2px;top:50px;height:15px}
.iphone__btn--vu{left:-2px;top:75px;height:19px}
.iphone__btn--vd{left:-2px;top:100px;height:19px}
.iphone__btn--pw{right:-2px;top:84px;height:31px}
.iphone__pantalla{position:relative;width:100%;height:100%;border-radius:13px;
  overflow:hidden;background:linear-gradient(180deg,#1c1c1e,#000)}
.iphone__isla{z-index:2;left:50%;transform:translateX(-50%);top:6px;width:41px;height:12px;
  border-radius:6px;background:#000}
.iphone__barra{left:50%;transform:translateX(-50%);bottom:5px;width:44px;height:2px;
  border-radius:1px;background:rgba(255,254,251,.8)}
.lector{position:absolute;inset:22% 12% auto;height:46%;display:grid;place-items:center}
.lector__marco{position:absolute;inset:0;border:1.5px solid ${AZUL};border-radius:10px}
.lector__qr{width:62%;height:62%;opacity:.94;background:repeating-linear-gradient(90deg,
  #fff 0 2px,transparent 2px 4px,#fff 4px 6px,transparent 6px 9px)}
.lector__etiqueta{position:absolute;left:50%;bottom:16%;transform:translateX(-50%);
  white-space:nowrap;font-size:8px;font-weight:700;color:${AZUL};background:rgba(255,255,255,.94);
  padding:2px 7px;border-radius:999px;box-shadow:0 4px 10px rgba(0,0,0,.22)}

/* iPad Pro 13" horizontal — la caja. */
.ipad{z-index:3;top:268px;left:0;width:348px;padding:12px;border-radius:23px;
  background:linear-gradient(145deg,#2a2a2c 0%,#1c1c1e 50%,#242426 100%);
  border:1px solid rgba(235,235,245,.15);
  box-shadow:0 34px 68px rgba(29,29,31,.34),inset 0 1px 0 rgba(255,255,255,.06)}
.ipad__camara{z-index:2;top:5px;left:50%;transform:translateX(-50%);width:6px;height:6px;
  border-radius:50%;background:#0a0a0c}
.ipad__pantalla{position:relative;width:100%;aspect-ratio:1366/1024;border-radius:14px;
  overflow:hidden;background:${PAPEL};color:${TINTA};
  display:flex;flex-direction:column;gap:6px;padding:11px 13px 13px}
.ipad__barra{left:50%;transform:translateX(-50%);bottom:4px;width:74px;height:2.5px;
  border-radius:1.5px;background:rgba(29,29,31,.8)}

/* MacBook Pro 14" — los informes. */
.mac{z-index:2;top:36px;left:148px;width:296px}
.mac__tapa{position:relative;padding:8px 8px 0;border-radius:14px 14px 0 0;
  background:linear-gradient(180deg,#2a2a2c 0%,#1c1c1e 100%);
  border:1px solid rgba(235,235,245,.12);border-bottom:none;
  box-shadow:0 22px 48px rgba(29,29,31,.30)}
.mac__notch{z-index:2;top:0;left:50%;transform:translateX(-50%);width:56px;height:8px;
  border-radius:0 0 7px 7px;background:#1c1c1e}
.mac__pantalla{width:100%;aspect-ratio:1512/982;border-radius:5px 5px 0 0;overflow:hidden;
  background:${PAPEL};color:${TINTA};
  display:flex;flex-direction:column;gap:3px;padding:9px 11px 5px}
.mac__base{display:block;height:11px;margin-inline:-5%;border-radius:0 0 10px 10px;
  background:linear-gradient(180deg,#3a3a3c 0%,#242426 55%,#1c1c1e 100%);
  box-shadow:0 16px 30px rgba(29,29,31,.22)}
.mac__base::before{content:"";display:block;width:16%;height:4px;margin:0 auto;
  border-radius:0 0 5px 5px;background:#141416}

/* --- Mini interfaz común de las pantallas --- */
.ui__barra{display:flex;align-items:center;justify-content:space-between}
.ui__nombre{font-weight:700;letter-spacing:-.02em;color:${TINTA}}
.ipad .ui__nombre{font-size:13px}
.mac .ui__nombre{font-size:11.5px}
.ui__estado{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:999px;
  background:rgba(52,199,89,.14);color:#248a3d;font-weight:700;white-space:nowrap}
.ipad .ui__estado{font-size:9px}
.mac .ui__estado{font-size:8.5px}
.ui__estado i{width:5px;height:5px;border-radius:50%;background:#34c759;flex:none}
.ui__rotulo{color:${TINTA_2};font-weight:600}
.ipad .ui__rotulo{font-size:9.5px;margin-top:2px}
.mac .ui__rotulo{font-size:8.5px}
.ui__total{font-weight:700;letter-spacing:-.03em;font-variant-numeric:tabular-nums;line-height:1}
.ipad .ui__total{font-size:29px}
.mac .ui__total{font-size:24px}
.ui__tasa{color:${TINTA_2}}
.ipad .ui__tasa{font-size:9px;margin-top:-2px}
.mac .ui__tasa{font-size:8.5px}
.ui__lineas{list-style:none;display:flex;flex-direction:column;flex:none}
.ui__lineas li{display:flex;justify-content:space-between;gap:8px;color:${TINTA_2};
  border-bottom:1px dashed rgba(66,66,66,.16)}
.ipad .ui__lineas li{font-size:9.5px;padding:4px 0}
.mac .ui__lineas li{font-size:8.5px;padding:2.5px 0}
.ui__lineas b{color:${TINTA};font-weight:600}
.ipad .ui__boton{margin-top:auto;height:27px;border-radius:8px;background:${AZUL};color:${PAPEL};
  font-size:12px;font-weight:600;display:grid;place-items:center}
.mac__grafico{display:flex;align-items:flex-end;gap:3px;height:24px;margin-top:1px}
.mac__grafico span{flex:1;border-radius:2px 2px 0 0;background:rgba(0,136,255,.22)}
.mac__grafico span.on{background:${AZUL}}
.ui__tabs{display:flex;justify-content:space-between;color:${TINTA_2};font-weight:600;
  border-top:1px solid rgba(66,66,66,.12);padding-top:5px;margin-top:6px}
.ipad .ui__tabs{font-size:9px}
.mac .ui__tabs{font-size:8.5px;margin-top:auto}
.ui__tabs .activa{color:${AZUL}}
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

  <div class="right"><div class="stage">

    <div class="glass g2">
      <div class="k">Tasa BCV</div>
      <div class="v">882,00</div>
      <div class="m">Bs por dólar,<br>actualizada al instante</div>
    </div>

    <div class="mac">
      <div class="mac__tapa">
        <span class="mac__notch"></span>
        <div class="mac__pantalla">
          <div class="ui__barra">
            <span class="ui__nombre">Blink POS · Informes</span>
            <span class="ui__estado"><i></i>Hoy</span>
          </div>
          <p class="ui__rotulo">Ventas del día</p>
          <p class="ui__total">$ 1.240,00</p>
          <p class="ui__tasa">+12,4 % vs ayer · Tasa BCV 882,00</p>
          <div class="mac__grafico">
            <span style="height:38%"></span><span style="height:54%"></span>
            <span style="height:46%"></span><span style="height:70%"></span>
            <span style="height:62%"></span><span class="on" style="height:100%"></span>
            <span style="height:44%"></span>
          </div>
          <ul class="ui__lineas">
            <li><span>Blink Pay</span><b>$ 540,00</b></li>
            <li><span>Pago Móvil</span><b>$ 480,00</b></li>
            <li><span>Efectivo</span><b>$ 220,00</b></li>
          </ul>
          <div class="ui__tabs"><span>Vender</span><span>Caja</span><span>Productos</span><span class="activa">Informes</span></div>
        </div>
      </div>
      <span class="mac__base"></span>
    </div>

    <div class="ipad">
      <span class="ipad__camara"></span>
      <div class="ipad__pantalla">
        <div class="ui__barra">
          <span class="ui__nombre">Blink POS</span>
          <span class="ui__estado"><i></i>Caja abierta</span>
        </div>
        <p class="ui__rotulo">Total a cobrar</p>
        <p class="ui__total">$ 8.40</p>
        <p class="ui__tasa">Bs 7.408,80 · Tasa BCV 882,00</p>
        <ul class="ui__lineas">
          <li><b>AZUCAR KONFIT 1kg</b><span>2 × $2.00</span></li>
          <li><b>MALTA RETORNABLE</b><span>3 × $1.50</span></li>
          <li><b>PAPEL DE ALUMINIO TUC</b><span>1 × $0.90</span></li>
        </ul>
        <span class="ui__boton">Cobrar</span>
        <div class="ui__tabs"><span class="activa">Vender</span><span>Caja</span><span>Productos</span><span>Informes</span></div>
        <span class="ipad__barra"></span>
      </div>
    </div>

    <div class="iphone">
      <span class="iphone__btn iphone__btn--accion"></span>
      <span class="iphone__btn iphone__btn--vu"></span>
      <span class="iphone__btn iphone__btn--vd"></span>
      <span class="iphone__btn iphone__btn--pw"></span>
      <div class="iphone__pantalla">
        <span class="iphone__isla"></span>
        <div class="lector">
          <span class="lector__marco"></span>
          <div class="lector__qr"></div>
        </div>
        <span class="lector__etiqueta">Escaneado</span>
        <span class="iphone__barra"></span>
      </div>
    </div>

  </div></div>

</div></body></html>`;

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
// La SF Pro incrustada pesa ~10 MB en base64: el evento `load` puede tardar
// más de 30 s y cortar el build. Con `domcontentloaded` + `fonts.ready`
// esperamos exactamente lo que importa (las fuentes) y nada más.
await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 120000 });
await page.evaluate(() => document.fonts.ready);
const dest = path.join(PUB, "og-image.png");
await page.screenshot({ path: dest });
await browser.close();
console.log("og-image.png generado:", Math.round(fs.statSync(dest).size / 1024), "KB · 1200x630");
