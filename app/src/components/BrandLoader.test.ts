import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BrandLoader } from "./BrandLoader";
import { BrandLogo } from "./BrandLogo";

const theme = vi.hoisted(() => ({ esOscuro: false }));
vi.mock("../lib/tema", () => ({ useTema: () => theme }));

afterEach(() => {
  theme.esOscuro = false;
  vi.unstubAllEnvs();
});

describe("marca compartida", () => {
  it.each([false, true])("usa el SVG oficial en oscuro=%s y respeta BASE_URL", (dark) => {
    theme.esOscuro = dark;
    vi.stubEnv("BASE_URL", "/pos/");
    const source = `/pos/brand/${dark ? "blink-blanco.svg" : "blink.svg"}`;
    const logo = renderToStaticMarkup(createElement(BrandLogo));
    expect(logo).toContain(`src="${source}"`);
    expect(logo).toContain('alt="Blink POS"');
    expect(logo).toContain('width="869" height="194"');
  });

  it("incrusta el marcado en el cargador, sin `use` externo", () => {
    const html = renderToStaticMarkup(createElement(BrandLoader));
    expect(html).not.toContain("<use");
    expect(html).not.toContain("<?xml");
    for (const id of ["wordmark", "ojo-guino", "ojo-abierto", "boca"]) {
      expect(html).toContain(`id="${id}"`);
    }
  });

  it("elige la marca blanca en apariencia oscura", () => {
    theme.esOscuro = true;
    const html = renderToStaticMarkup(createElement(BrandLoader));
    expect(html).toContain('fill="#FFFFFF"');
  });

  it("anuncia la carga y oculta el dibujo a lectores de pantalla", () => {
    const html = renderToStaticMarkup(createElement(BrandLoader));
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-atomic="true"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Cargando Blink POS…");
  });
});
