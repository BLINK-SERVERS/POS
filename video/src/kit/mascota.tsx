// ============================================================
// La mascota: el isotipo de BLINK (el cuadrado azul con la cara que
// guiña un ojo) animado.
//
// Es el mismo dibujo del favicon (medido sobre el original), con tres
// gestos que el guion pide:
//   · parpadeo  -> el ojo-pildora se aplasta en vertical
//   · guiño     -> el ojo circular se convierte en una linea
//   · asintido  -> cabeceo breve de toda la cabeza
//   · sonrisa   -> la boca crece un poco
//
// Los gestos se Expressions con `interpolate` sobre el fotograma, de
// modo que se pueden sincronizar con la pista (el ultimo parpadeo cae
// en el corte final de la musica).
// ============================================================
import type { CSSProperties } from "react";
import { interpolate } from "remotion";
import { ACENTO } from "./tokens";

/** Geometria del isotipo (medida sobre el original de 512 px). */
export const G = {
  radio: 80,
  ojoIzq: { x: 55, y: 182, w: 150, h: 75 },
  ojoDer: { cx: 381, cy: 181, r: 75 },
  boca: { x: 175, y: 324, r: 81 },
};

export type EstadoMascota = "sonriente" | "empatico" | "orgulloso" | "guinante" | "neutral";

/**
 * @param parpadeo 0..1 -> 0 = ojo abierto, 1 = ojo cerrado
 * @param guiño    0..1 -> 0 = ojo abierto, 1 = ojo en linea
 * @param asintido 0..1 -> inclinacion de la cabeza
 * @param sonrisa  0..1 -> amplitud de la boca
 */
export const Mascota = ({
  tam = 120,
  estado = "sonriente",
  parpadeo = 0,
  guiño = 0,
  asintido = 0,
  sonrisa = 0,
  style,
}: {
  tam?: number;
  estado?: EstadoMascota;
  parpadeo?: number;
  guiño?: number;
  asintido?: number;
  sonrisa?: number;
  style?: CSSProperties;
}) => {
  // La expresion cambia la forma de la boca y el color de fondo.
  const bocaBase = G.boca.r;
  const anchoBoca = estado === "empatico" ? 0.86 : estado === "orgulloso" ? 1.08 : 1;
  const altoBoca = estado === "empatico" ? 0.7 : estado === "orgulloso" ? 1.1 : 1;

  const escalaOjoIzq = 1 - parpadeo;
  const escalaOjoDer = 1 - guiño;

  return (
    <div
      style={{
        width: tam,
        height: tam,
        // El gesto va de 0 a 1; en reposo la cabeza esta derecha.
        transform: `rotate(${Math.sin(asintido * Math.PI) * 7}deg)`,
        ...style,
      }}
    >
      <svg viewBox="0 0 512 512" width={tam} height={tam}>
        <rect width="512" height="512" rx={G.radio} fill={ACENTO} />

        {/* Ojo izquierdo: la pildora (parpadea) */}
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            transform: `scaleY(${escalaOjoIzq})`,
          }}
        >
          <rect
            x={G.ojoIzq.x}
            y={G.ojoIzq.y}
            width={G.ojoIzq.w}
            height={G.ojoIzq.h}
            rx={G.ojoIzq.h / 2}
            fill="#FFFFFF"
          />
        </g>

        {/* Ojo derecho: el circulo (guina) */}
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            transform: `scaleY(${escalaOjoDer})`,
          }}
        >
          <circle cx={G.ojoDer.cx} cy={G.ojoDer.cy} r={G.ojoDer.r} fill="#FFFFFF" />
        </g>

        {/* Boca: semidisco (la sonrisa) */}
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "top center",
            transform: `scale(${anchoBoca}, ${altoBoca * (1 + sonrisa * 0.12)})`,
          }}
        >
          <path
            d={`M${G.boca.x} ${G.boca.y} H${G.boca.x + G.boca.r * 2} A${bocaBase} ${bocaBase} 0 0 1 ${G.boca.x} ${G.boca.y} Z`}
            fill="#FFFFFF"
          />
        </g>
      </svg>
    </div>
  );
};

/**
 * Gestos automaticos: un parpadeo y un guiño con su propio ritmo.
 * `fase` es el fotograma local de la escena.
 */
export function gestosMascota(fase: number, fps: number) {
  // Parpadeo en el segundo 2 y 4 (dos pestaneos cortos).
  const parpadeo = Math.max(
    pico(fase, fps, 2.0, 0.16),
    pico(fase, fps, 4.1, 0.14),
    pico(fase, fps, 7.3, 0.15)
  );
  // Guiño largo en el segundo 6.
  const guiño = pico(fase, fps, 6.0, 0.6);
  // Asintido: dos balanceos.
  const asintido = Math.max(pico(fase, fps, 2.4, 0.5), pico(fase, fps, 6.6, 0.5));
  return { parpadeo, guiño, asintido };
}

/** Un pico de 0 a 1 (y de vuelta) centrado en `centro`, de `duracion` s. */
function pico(fase: number, fps: number, centro: number, duracion: number) {
  const f = fase / fps;
  const mitad = duracion / 2;
  if (f < centro - mitad || f > centro + mitad) return 0;
  const t = (f - (centro - mitad)) / duracion;
  return Math.sin(t * Math.PI);
}
