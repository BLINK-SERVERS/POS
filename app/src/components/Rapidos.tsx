// Venta rápida: los productos que el cajero alcanza sin escribir.
//
// Dos listas cortas, las dos de nueve como máximo porque nueve son las teclas
// que un cajero puede golpear de memoria: la que fija la gente a mano
// (Favoritos) y la que fija la historia del caja (Más vendidos, calculada con
// `lib/ventaRapida.ts` sobre las ventas del último mes).
//
// Se aísla a propósito: si no tiene nada que mostrar no se pinta, y si nadie
// pulsa F3 la pantalla de venta se comporta exactamente como antes.
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { formatUsd } from "../lib/money";
import { RAPIDOS_MAX } from "../lib/ventaRapida";
import { presentationLabel, type Product } from "../lib/types";

type Grupo = "favoritos" | "ventas";

export function Rapidos({
  favoritos,
  masVendidos,
  unidades,
  onAdd,
  onUnfix,
}: {
  favoritos: Product[];
  masVendidos: Product[];
  /** producto → unidades vendidas en la ventana, para el `title`. */
  unidades: Map<string, number>;
  onAdd: (id: string) => void;
  onUnfix: (id: string) => void;
}) {
  const [grupo, setGrupo] = useState<Grupo>(favoritos.length ? "favoritos" : "ventas");
  const [sel, setSel] = useState(0);
  const [armed, setArmed] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  // Se queda sin favoritos mientras estaban elegidos: salta a los más vendidos.
  useEffect(() => {
    if (grupo === "favoritos" && favoritos.length === 0 && masVendidos.length > 0) setGrupo("ventas");
  }, [grupo, favoritos.length, masVendidos.length]);

  const items = (grupo === "favoritos" ? favoritos : masVendidos).slice(0, RAPIDOS_MAX);

  // F3 arma el panel desde cualquier parte de la pantalla de venta. Se escucha
  // en la fase de captura para que el teclado global del POS no la vea, y Esc
  // la devuelve al buscador. Con una ventana montada encima (cobro, cliente,
  // descuento, el propio asistente) no arma nada: el teclado es de la ventana,
  // que es el contrato que cumple la guarda de `Vender`.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "F3") return;
      if (document.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      e.stopPropagation();
      setArmed(true);
      panel.current?.focus();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  if (!items.length) return null;

  const mover = (delta: number) =>
    setSel((s) => (s + delta + items.length) % items.length);

  return (
    <div
      ref={panel}
      role="group"
      aria-label="Venta rápida"
      tabIndex={-1}
      title="F3 activar · 1-9 añadir · ← → cambiar lista · Esc salir"
      className="row gap-8"
      style={{
        flexWrap: "wrap",
        borderRadius: 10,
        padding: 2,
        outline: armed ? "2px solid var(--color-accent)" : "none",
      }}
      onKeyDown={(e) => {
        // Consumir la tecla también la aparta del teclado global del POS: si no,
        // un «3» añadiría la píldora del panel y, además, la tercera fila de la
        // búsqueda que quedó detrás.
        const consumir = () => {
          e.preventDefault();
          e.stopPropagation();
        };
        if (e.key === "Escape") {
          e.stopPropagation();
          setArmed(false);
          panel.current?.blur();
          return;
        }
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          const cambio =
            e.key === "ArrowRight"
              ? grupo === "favoritos" && masVendidos.length
              : grupo === "ventas" && favoritos.length;
          if (!cambio) return;
          consumir();
          setGrupo((g) => (g === "favoritos" ? "ventas" : "favoritos"));
          setSel(0);
          return;
        }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          consumir();
          mover(e.key === "ArrowDown" ? 1 : -1);
          return;
        }
        if (/^[1-9]$/.test(e.key)) {
          const i = Number(e.key) - 1;
          if (i >= items.length) return;
          consumir();
          setSel(i);
          onAdd(items[i].id);
          return;
        }
        if (e.key === "Enter") {
          consumir();
          onAdd(items[Math.min(sel, items.length - 1)].id);
        }
      }}
    >
      <div className="row gap-8" style={{ alignItems: "center", width: "100%" }}>
        <button
          type="button"
          className={`btn btn--sm ${grupo === "favoritos" ? "btn--primary" : "btn--ghost"}`}
          disabled={!favoritos.length}
          onClick={() => {
            setGrupo("favoritos");
            setSel(0);
            panel.current?.focus();
          }}
        >
          <Icon name="star" size="sm" />
          Favoritos
        </button>
        <button
          type="button"
          className={`btn btn--sm ${grupo === "ventas" ? "btn--primary" : "btn--ghost"}`}
          disabled={!masVendidos.length}
          onClick={() => {
            setGrupo("ventas");
            setSel(0);
            panel.current?.focus();
          }}
        >
          <Icon name="trendUp" size="sm" />
          Más vendidos
        </button>
        <span className="dim" style={{ fontSize: "0.72rem" }}>
          {grupo === "favoritos" ? "fijados a mano" : "últimos 30 días"}
        </span>
      </div>

      {items.map((p, i) => {
        const detalle = presentationLabel(p);
        return (
          <span key={p.id} className="row gap-4" style={{ alignItems: "stretch" }}>
            <button
              type="button"
              className={`btn btn--sm ${i === sel && armed ? "btn--primary" : "btn--soft"}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => onAdd(p.id)}
              title={
                grupo === "ventas"
                  ? `${p.name} · ${unidades.get(p.id) ?? 0} vendidos en 30 días · tecla ${i + 1}`
                  : `${p.name} · tecla ${i + 1}`
              }
            >
              <span className="search-results__key">{i + 1}</span>
              {p.name}
              {detalle ? <span className="dim"> {detalle}</span> : null}
              <span className="tabular">{formatUsd(p.price)}</span>
            </button>
            {grupo === "favoritos" && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                aria-label={`Quitar ${p.name} de favoritos`}
                title="Desfijar"
                onClick={() => onUnfix(p.id)}
              >
                <Icon name="close" size="sm" />
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
