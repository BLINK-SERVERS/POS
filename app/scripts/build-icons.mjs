// Rasteriza los SVG de marca a PNG (192/512 + maskable + apple-touch).
// Usa Chromium de Playwright para un render idéntico al del navegador.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const PUB = "C:/Users/prodz/Desktop/BLINK POS/app/public";

const JOBS = [
  { src: "icons/icon.svg", out: "icons/icon-192.png", size: 192 },
  { src: "icons/icon.svg", out: "icons/icon-512.png", size: 512 },
  { src: "icons/icon-maskable.svg", out: "icons/icon-maskable-192.png", size: 192 },
  { src: "icons/icon-maskable.svg", out: "icons/icon-maskable-512.png", size: 512 },
  { src: "icons/icon.svg", out: "icons/apple-touch-icon.png", size: 180 },
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const job of JOBS) {
  const svg = fs.readFileSync(path.join(PUB, job.src), "utf8");
  // El SVG no trae width/height: se dimensiona vía el viewBox.
  const html = `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:#fff}
svg{display:block;width:${job.size}px;height:${job.size}px}</style>${svg}`;
  await page.setViewportSize({ width: job.size, height: job.size });
  await page.setContent(html, { waitUntil: "load" });
  const dest = path.join(PUB, job.out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await page.screenshot({ path: dest, omitBackground: false });
  console.log(job.out, fs.statSync(dest).size, "bytes");
}

await browser.close();
