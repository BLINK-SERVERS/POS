/**
 * Captura la pestaña de Apariencia (el deslizante sol/luna) en las dos
 * apariencias, para revisarlo a mano.
 *
 * Uso: node scripts/captura-apariencia.mjs
 */
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");

const BASE = process.env.VERIFY_BASE || "http://localhost:5180";
const OUT = path.join("..", "verify-shots");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

for (const scheme of ["light", "dark"]) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 860 },
    colorScheme: scheme,
  });
  await ctx.addInitScript(() => {
    const KEY = "blink-pos-state-v3";
    const patch = () => {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return;
        const st = JSON.parse(raw);
        st.onboarding = { ...(st.onboarding || {}), completed: true };
        st.business = { ...(st.business || {}), name: "Abastos La Esquina" };
        localStorage.setItem(KEY, JSON.stringify(st));
      } catch {}
    };
    patch();
    window.addEventListener("DOMContentLoaded", patch);
  });

  const page = await ctx.newPage();
  await page.goto(BASE + "/app/entrar?bypass=1", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.goto(BASE + "/app/ajustes?tab=Apariencia", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, `apariencia-${scheme}.png`) });
  console.log("captura:", `apariencia-${scheme}.png`);
  await ctx.close();
}

await browser.close();
