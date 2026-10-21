// ============================================================
// Banco de pruebas de movimiento.
//
// Valida de un golpe: el eje optico de la tipografia, los springs, el
// material de cristal, los simbolos de la app y el escalonado de
// entradas. Sirve como referencia de lo que "se siente" bien.
// ============================================================
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FUENTE } from "../kit/fuentes";
import { Logotipo, Cristal, Pastilla, MaquetaPOS, Movil, TarjetaKpi, Fondo, Titular, Subtitulo } from "../kit/ui";
import { Simbolo } from "../kit/simbolo";
import { ACENTO, MOVIMIENTO, TINTA_2 } from "../kit/tokens";

export const Prueba = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const fontFamily = FUENTE;

  const s1 = spring({ frame, fps, config: MOVIMIENTO.entrada, durationInFrames: 30 });
  const s2 = spring({ frame: frame - 18, fps, config: MOVIMIENTO.entrada, durationInFrames: 30 });
  const s3 = spring({ frame: frame - 36, fps, config: MOVIMIENTO.entrada, durationInFrames: 30 });

  const aparece = (s: number) => ({
    opacity: s,
    transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px)`,
  });

  const bucle = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Fondo>
        <div style={{ padding: "90px 110px", display: "flex", flexDirection: "column", gap: 34 }}>
          <div style={aparece(s1)}>
            <Logotipo />
          </div>

          <div style={{ ...aparece(s2), display: "flex", alignItems: "flex-end", gap: 46 }}>
            <Titular size={92}>
              Vende en un parpadeo,
              <br />
              factura con <span style={{ color: ACENTO }}>BLINK ;)</span>
            </Titular>
            <Subtitulo style={{ maxWidth: 520, paddingBottom: 12 }}>
              El punto de venta hecho para Venezuela: multimoneda a tasa BCV, escáner desde el
              celular y 100 % en la nube.
            </Subtitulo>
          </div>

          <div style={{ ...aparece(s3), display: "flex", gap: 14 }}>
            <Pastilla>
              <Simbolo nombre="check" tam={16} /> Tasa BCV automática
            </Pastilla>
            <Pastilla>
              <Simbolo nombre="check" tam={16} /> Escáner desde el celular
            </Pastilla>
            <Pastilla>
              <Simbolo nombre="check" tam={16} /> 100 % en la nube
            </Pastilla>
          </div>

          <div style={{ display: "flex", gap: 26, alignItems: "flex-end", marginTop: 20 }}>
            <MaquetaPOS style={{ transform: `scale(${0.86})`, transformOrigin: "left bottom" }} />
            <Movil style={{ transform: `scale(${0.86}) translateY(${interpolate(bucle, [0, 1], [0, -14])}px)`, transformOrigin: "left bottom", marginLeft: -30 }} />
            <Cristal style={{ padding: 22, width: 330, opacity: s3 }}>
              <div style={{ fontSize: 16, color: TINTA_2, fontWeight: 600 }}>Tasa BCV</div>
              <div style={{ fontSize: 30, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>882,00 Bs/$</div>
            </Cristal>
          </div>
        </div>

        <div style={{ position: "absolute", right: 110, bottom: 90, opacity: 0.9 }}>
          <TarjetaKpi etiqueta="Ventas de hoy" valor="$ 1.240,00" icono="dollarsign" variacion={12.4} pie="vs el mes anterior" />
        </div>
      </Fondo>
    </AbsoluteFill>
  );
};
