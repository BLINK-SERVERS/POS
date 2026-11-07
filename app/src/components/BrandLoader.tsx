import { BrandMark } from "./BrandLogo";

export function BrandLoader() {
  return (
    <div className="brand-loader" role="status" aria-live="polite" aria-atomic="true">
      <BrandMark />
      <span>Cargando Blink POS…</span>
    </div>
  );
}
