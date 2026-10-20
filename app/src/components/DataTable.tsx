// Tabla de datos con virtualización por ventana (windowing).
//
// Estrategia: mientras la lista es pequeña (< `threshold`) se renderiza igual
// que siempre (sin cambios de UX). Al superar el umbral, las filas se recortan
// a la ventana visible y se rellenan con "filas espaciadoras" que conservan la
// altura real de scroll. Evita montar miles de nodos DOM de golpe.
// Soporta modelo híbrido: tabla en PC / tarjetas en móvil
import { Fragment, useCallback, useState, type ReactNode, type UIEvent } from "react";

export type DataTableProps<T> = {
  /** Fila de encabezados: el contenido de un `<tr>` de `<th>`. */
  head: ReactNode;
  items: readonly T[];
  /** Renderiza una fila (`<tr>`) para el elemento dado. */
  renderRow: (item: T, index: number) => ReactNode;
  /** Clave estable por elemento. */
  rowKey: (item: T, index: number) => string;
  /** Número de columnas (para las filas espaciadoras). */
  colCount: number;
  /** Contenido opcional al pie del `<tbody>` (p. ej. fila de totales). */
  footer?: ReactNode;
  /** Alto estimado de cada fila, en px. */
  rowHeight?: number;
  /** Alto del área visible cuando la virtualización está activa, en px. */
  height?: number;
  /** Nº de filas a partir del cual se activa la virtualización. */
  threshold?: number;
  /** Filas extra renderizadas fuera de la ventana visible. */
  overscan?: number;
};

const DEFAULT_THRESHOLD = 150;

export function DataTable<T>({
  head,
  items,
  renderRow,
  rowKey,
  colCount,
  footer,
  rowHeight = 45,
  height = 560,
  threshold = DEFAULT_THRESHOLD,
  overscan = 6,
}: DataTableProps<T>) {
  const count = items.length;
  const active = count > threshold;
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  let start = 0;
  let end = count;
  if (active) {
    start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleCount = Math.ceil(height / rowHeight) + overscan * 2;
    end = Math.min(count, start + visibleCount);
  }

  const visible = active ? items.slice(start, end) : items;
  const topHeight = start * rowHeight;
  const bottomHeight = (count - end) * rowHeight;

  const spacer = (h: number, key: string) =>
    h > 0 ? (
      <tr key={key} aria-hidden="true" style={{ height: h }}>
        <td colSpan={colCount} style={{ padding: 0, border: 0 }} />
      </tr>
    ) : null;

  return (
    <div
      className={active ? "table-wrap table-wrap--scroll" : "table-wrap"}
      style={active ? { maxHeight: height, overflowY: "auto" } : undefined}
      onScroll={active ? onScroll : undefined}
    >
      <table className="data">
        <thead>{head}</thead>
        <tbody>
          {spacer(topHeight, "__spacer_top")}
          {visible.map((item, i) => (
            <Fragment key={rowKey(item, start + i)}>{renderRow(item, start + i)}</Fragment>
          ))}
          {spacer(bottomHeight, "__spacer_bottom")}
          {footer}
        </tbody>
      </table>
    </div>
  );
}
