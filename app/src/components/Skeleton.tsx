import type { CSSProperties } from "react";

/**
 * Esqueleto de carga: el hueco con la forma del dato que va a llegar.
 *
 * Presentación pura — no lee el store ni decide nada. `aria-hidden` en cada
 * bloque porque lo único que anuncia la carga es el contenedor.
 */
export function Skeleton({
  variante = "texto",
  ancho,
  className = "",
}: {
  variante?: "texto" | "fila" | "tarjeta";
  ancho?: string;
  className?: string;
}) {
  const estilo: CSSProperties | undefined = ancho ? { width: ancho } : undefined;
  return (
    <div
      className={`sk sk--${variante}${className ? " " + className : ""}`}
      style={estilo}
      aria-hidden="true"
    />
  );
}

/**
 * Esqueleto de una vista completa (título, tarjetas de índice y listado).
 * Es lo que se ve mientras llega el chunk del módulo, dentro del Shell.
 */
export function EsqueletoVista({ tarjetas = 3, filas = 5 }: { tarjetas?: number; filas?: number }) {
  return (
    <div className="esqueleto" role="status" aria-label="Cargando pantalla">
      <Skeleton variante="texto" ancho="32%" />
      <div className="esqueleto__rejilla">
        {Array.from({ length: tarjetas }, (_, i) => (
          <Skeleton key={i} variante="tarjeta" />
        ))}
      </div>
      <div className="esqueleto__lista">
        {Array.from({ length: filas }, (_, i) => (
          <Skeleton key={i} variante="fila" />
        ))}
      </div>
    </div>
  );
}
