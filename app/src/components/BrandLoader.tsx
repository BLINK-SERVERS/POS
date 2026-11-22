import { BrandMark } from "./BrandLogo";
import { Skeleton } from "./Skeleton";

/**
 * Pantalla de carga · BLINK-128 (dueño, 2026-11-21).
 *
 * La marca va quieta: lo único que se mueve es el spinner y el barrido de
 * los esqueletos, que anticipan la forma de lo que está por llegar.
 */
export function BrandLoader() {
  return (
    <div className="brand-loader" role="status" aria-live="polite" aria-atomic="true">
      <BrandMark />
      <div className="brand-loader__estado">
        <span className="brand-loader__spinner" aria-hidden="true" />
        <span>Cargando Blink POS…</span>
      </div>
      <div className="brand-loader__esqueleto" aria-hidden="true">
        <Skeleton variante="fila" />
        <Skeleton variante="fila" />
        <Skeleton variante="fila" />
      </div>
    </div>
  );
}
