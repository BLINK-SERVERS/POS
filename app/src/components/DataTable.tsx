// Tabla de datos con virtualización por ventana (windowing).
//
// Estrategia: mientras la lista es pequeña (< `threshold`) se renderiza igual
// que siempre (sin cambios de UX). Al superar el umbral, las filas se recortan
// a la ventana visible y se rellenan con "filas espaciadoras" que conservan la
// altura real de scroll. Evita montar miles de nodos DOM de golpe.
//
// Modelo híbrido: tabla en PC / tarjetas apiladas en móvil. Para que la
// version de móvil se entienda, cada celda lleva el rótulo de su columna
// (`data-label`), que el CSS pinta a la izquierda. Los rótulos se sacan de la
// propia cabecera, de modo que ninguna pagina tiene que repetirlos.
import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useCallback,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
  type UIEvent,
} from "react";

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

/** El texto de un nodo, si es texto plano. */
function textoDe(nodo: ReactNode): string {
  if (typeof nodo === "string" || typeof nodo === "number") return String(nodo);
  if (Array.isArray(nodo)) return nodo.map(textoDe).join("");
  if (isValidElement(nodo)) {
    const hijos = (nodo.props as { children?: ReactNode }).children;
    return textoDe(hijos);
  }
  return "";
}

/** Los rótulos de las columnas, leidos de la cabecera. */
function rotulosDe(head: ReactNode): string[] {
  const tr = Children.toArray(head)[0];
  if (!isValidElement(tr)) return [];
  const hijos = Children.toArray((tr.props as { children?: ReactNode }).children);
  return hijos.filter(isValidElement).map((th) => textoDe((th.props as { children?: ReactNode }).children).trim());
}

/**
 * Añade el rótulo de su columna a cada celda de la fila.
 *
 * En escritorio el atributo no se ve; en móvil el CSS lo pinta a la
 * izquierda de la celda, que es lo que convierte la tabla en tarjetas.
 */
function conRotulos(fila: ReactNode, rotulos: string[]): ReactNode {
  if (!isValidElement(fila) || !rotulos.length) return fila;
  const props = fila.props as { children?: ReactNode };
  const hijos = Children.toArray(props.children);
  if (!hijos.length) return fila;

  const marcados = hijos.map((hijo, i) => {
    if (!isValidElement(hijo)) return hijo;
    const rotulo = rotulos[i];
    if (!rotulo) return hijo;
    return cloneElement(hijo as ReactElement<{ "data-label"?: string }>, {
      "data-label": rotulo,
    });
  });

  return cloneElement(fila as ReactElement<{ children?: ReactNode }>, { children: marcados });
}

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

  const rotulos = useMemo(() => rotulosDe(head), [head]);

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
            <Fragment key={rowKey(item, start + i)}>
              {conRotulos(renderRow(item, start + i), rotulos)}
            </Fragment>
          ))}
          {spacer(bottomHeight, "__spacer_bottom")}
          {footer}
        </tbody>
      </table>
    </div>
  );
}
