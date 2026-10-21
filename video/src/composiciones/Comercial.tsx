// ============================================================
// Comercial de BLINK POS · 01:29 (2670 fotogramas a 30 fps)
//
// El guion va escena a escena, con su marca de tiempo. Los cortes
// coinciden con la pista (89,3 s) y con los momentos de la musica.
//
// Direccion de arte: fondo limpio, tarjetas de cristal, tipografia
// grande y una sola familia. La mascota (el isotipo) aparece en las
// esquinas y acompaña los momentos de la locucion.
// ============================================================
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cristal, Fondo, Logotipo, MaquetaPOS, Movil, Pastilla, TarjetaKpi, Titular, Subtitulo, BarraInferior } from "../kit/ui";
import { Simbolo } from "../kit/simbolo";
import { Mascota, gestosMascota, type EstadoMascota } from "../kit/mascota";
import { FUENTE } from "../kit/fuentes";
import { ACENTO, EXITO, MOVIMIENTO, PALETA, PELIGRO, TINTA, TINTA_2 } from "../kit/tokens";

/* ------------------------------------------------------------
   Marcas de tiempo del guion (30 fps).
   ------------------------------------------------------------ */
const T = {
  apertura: [0, 90] as const,
  problema: [90, 390] as const,
  solucion: [390, 720] as const,
  multimoneda: [720, 960] as const,
  bcv: [960, 1200] as const,
  reportes: [1200, 1440] as const,
  escaner: [1440, 1680] as const,
  resumen: [1680, 1800] as const,
  cierre: [1800, 2670] as const,
};

/** Un numero que cuenta solo, entre dos fotogramas. */
const Contador = ({
  valor,
  desde,
  hasta,
  decimales = 0,
  prefijo = "",
  sufijo = "",
  estilo,
}: {
  valor: number;
  desde: number;
  hasta: number;
  decimales?: number;
  prefijo?: string;
  sufijo?: string;
  estilo?: React.CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const n = interpolate(frame, [desde, hasta], [0, valor], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...estilo }}>
      {prefijo}
      {n.toFixed(decimales)}
      {sufijo}
    </span>
  );
};

/** Entrada con resorte. */
const entra = (frame: number, fps: number, retraso = 0) =>
  spring({ frame: frame - retraso, fps, config: MOVIMIENTO.entrada, durationInFrames: 32 });

/** Desvanecido de salida en los ultimos N fotogramas de la escena. */
const sale = (frame: number, hasta: number, n = 16) =>
  interpolate(frame, [hasta - n, hasta], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Tarjeta de cristal con la sombra y el borde del material. */
const Panel = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <Cristal style={{ padding: "30px 34px", ...style }}>{children}</Cristal>
);

export const Comercial = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ---------------- 1 · Apertura institucional ---------------- */
  const f0 = frame;
  const destello = interpolate(f0, [0, 4, 10], [1, 0.9, 0], { extrapolateRight: "clamp" });
  const logo = entra(f0, fps, 6);
  const masc1 = gestosMascota(f0 - 10, fps);

  /* ---------------- 2 · El problema ---------------- */
  const f1 = frame - T.problema[0];
  const q1 = entra(f1, fps, 6);
  const q2 = entra(f1, fps, 150);
  // La primera se desvanece cuando entra la segunda (no se solapan).
  const q1Visible = 1 - q2;
  const emocion1 = f1 < 150 ? "empatico" : "neutral";

  /* ---------------- 3 · La solucion ---------------- */
  const f2 = frame - T.solucion[0];
  const zoom = spring({ frame: f2, fps, config: MOVIMIENTO.desplazamiento, durationInFrames: 46 });
  const blicon = entra(f2, fps, 22);
  const kpis = [0, 12, 24, 36].map((r) => entra(f2, fps, 46 + r));

  /* ---------------- 4 · Multimoneda ---------------- */
  const f3 = frame - T.multimoneda[0];
  const zoom3 = spring({ frame: f3, fps, config: MOVIMIENTO.desplazamiento, durationInFrames: 40 });
  const pagos = [0, 14, 28].map((r) => entra(f3, fps, 30 + r));
  const vuelto = entra(f3, fps, 78);
  // El "ding": el total da un bote en el fotograma 96.
  const ding = 1 + 0.12 * Math.max(0, 1 - Math.abs(f3 - 96) / 9);

  /* ---------------- 5 · BCV ---------------- */
  const f4 = frame - T.bcv[0];
  const tarjeta = entra(f4, fps, 10);
  const punto = (Math.sin((f4 / fps) * 3) + 1) / 2;

  /* ---------------- 6 · Reportes ---------------- */
  const f5 = frame - T.reportes[0];
  const grafico = entra(f5, fps, 8);
  const barras = Array.from({ length: 12 }, (_, i) => entra(f5, fps, 30 + i * 5));

  /* ---------------- 7 · Escaner ---------------- */
  const f6 = frame - T.escaner[0];
  const telefono = entra(f6, fps, 8);
  const leido = f6 > 92;
  const articulo = entra(f6, fps, 104);

  /* ---------------- 8 · Resumen ---------------- */
  const f7 = frame - T.resumen[0];
  const frase = entra(f7, fps, 6);
  const masc8 = gestosMascota(f7, fps);

  /* ---------------- 9 · Cierre ---------------- */
  const f8 = frame - T.cierre[0];
  const pregunta = entra(f8, fps, 10);
  const lema = entra(f8, fps, 260);
  const boton = entra(f8, fps, 300);
  const saludo = entra(f8, fps, 520);
  const masc9 = gestosMascota(f8, fps);
  // Parpadeo final, sincronizado con el corte de la musica.
  const parpadeoFinal = f8 > 800 && f8 < 830 ? Math.sin(((f8 - 800) / 30) * Math.PI) : 0;

  return (
    <AbsoluteFill style={{ fontFamily: FUENTE, background: "#FFFEFB" }}>
      <Audio src={staticFile("audio/blink-comercial.mp3")} />

      <Fondo>
        {/* ==========================================================
            1 · APERTURA INSTITUCIONAL (0:00 - 0:03)
            ========================================================== */}
        {f0 < T.apertura[1] && (
          <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 44 }}>
            <div
              style={{
                opacity: logo,
                transform: `scale(${interpolate(logo, [0, 1], [0.86, 1])})`,
                filter: `blur(${interpolate(logo, [0, 1], [14, 0])}px)`,
              }}
            >
              <Logotipo escala={1.7} />
            </div>
            <div
              style={{
                opacity: logo,
                transform: `scale(${interpolate(logo, [0, 1], [0.7, 1])})`,
              }}
            >
              <Mascota
                tam={132}
                estado="sonriente"
                parpadeo={masc1.parpadeo}
                asintido={masc1.asintido}
                sonrisa={0.2}
              />
            </div>
            {/* Destello digital rapido */}
            <AbsoluteFill style={{ background: "#FFFFFF", opacity: destello, pointerEvents: "none" }} />
          </AbsoluteFill>
        )}

        {/* ==========================================================
            2 · EL PROBLEMA (0:03 - 0:13)
            ========================================================== */}
        {f1 >= 0 && f1 < T.problema[1] - T.problema[0] && (
          <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 160px" }}>
            <div
              style={{
                opacity: q1Visible,
                transform: `translateY(${interpolate(q1, [0, 1], [40, 0])}px)`,
                position: "absolute",
              }}
            >
              <Titular size={84} style={{ textAlign: "center" }}>
                ¿Cansado de registrar ventas en un{" "}
                <span style={{ color: PELIGRO }}>cuaderno viejo</span>?
              </Titular>
            </div>

            <div
              style={{
                opacity: q2,
                transform: `translateY(${interpolate(q2, [0, 1], [40, 0])}px)`,
                position: "absolute",
              }}
            >
              <Titular size={72} style={{ textAlign: "center" }}>
                ¿Cansado de{" "}
                <span style={{ color: PELIGRO }}>quemarte la cabeza</span> calculando precios y
                tasas todos los días?
              </Titular>
            </div>

            {/* La mascota, empatica, en la esquina */}
            <div style={{ position: "absolute", left: 120, bottom: 90, opacity: q2 * 0.95 }}>
              <Mascota tam={118} estado={emocion1 as EstadoMascota} parpadeo={masc1.parpadeo * 0.4} />
            </div>
          </AbsoluteFill>
        )}

        {/* ==========================================================
            3 · LA SOLUCION (0:13 - 0:24)
            ========================================================== */}
        {f2 >= 0 && f2 < T.solucion[1] - T.solucion[0] && (
          <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 46 }}>
            <div
              style={{
                fontSize: 190,
                fontWeight: 800,
                letterSpacing: "-0.05em",
                color: TINTA,
                lineHeight: 0.95,
                opacity: blicon,
                transform: `translateY(${interpolate(blicon, [0, 1], [50, 0])}px)`,
              }}
            >
              BLINK
            </div>

            {/* Zoom-out de cristal: el panel se abre y revela el panel real */}
            <div
              style={{
                opacity: zoom,
                transform: `scale(${interpolate(zoom, [0, 1], [0.82, 1])})`,
                filter: `blur(${interpolate(zoom, [0, 1], [18, 0])}px)`,
                display: "flex",
                gap: 20,
                marginTop: 10,
              }}
            >
              <TarjetaKpi etiqueta="Ventas totales" valor="$ 1.240,00" icono="dollarsign" variacion={12.4} pie="vs el mes anterior" style={{ opacity: kpis[0], transform: `translateY(${interpolate(kpis[0], [0, 1], [26, 0])}px)` }} />
              <TarjetaKpi etiqueta="Órdenes pagadas" valor="38" icono="cart" variacion={8.1} pie="transacciones cobradas" style={{ opacity: kpis[1], transform: `translateY(${interpolate(kpis[1], [0, 1], [26, 0])}px)` }} />
              <TarjetaKpi etiqueta="Ticket promedio" valor="$ 32.63" icono="receipt" variacion={3.2} pie="por orden" style={{ opacity: kpis[2], transform: `translateY(${interpolate(kpis[2], [0, 1], [26, 0])}px)` }} />
              <TarjetaKpi etiqueta="Margen bruto" valor="$ 412,80" icono="trendUp" variacion={5.7} pie="12,7 % sobre las ventas" style={{ opacity: kpis[3], transform: `translateY(${interpolate(kpis[3], [0, 1], [26, 0])}px)` }} />
            </div>

            <div style={{ position: "absolute", right: 120, bottom: 80, opacity: zoom }}>
              <Mascota tam={120} estado="orgulloso" asintido={masc1.asintido} />
            </div>
          </AbsoluteFill>
        )}

        {/* ==========================================================
            4 · MULTIMONEDA Y VUELTO (0:24 - 0:32)
            ========================================================== */}
        {f3 >= 0 && f3 < T.multimoneda[1] - T.multimoneda[0] && (
          <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 64 }}>
            <div style={{ transform: `scale(${interpolate(zoom3, [0, 1], [0.78, 1])})`, transformOrigin: "center" }}>
              <MaquetaPOS
                total="Bs 21.168,00"
                bs="Tasa BCV 882,00 · 3 pagos combinados"
                lineas={[
                  ["AZUCAR KONFIT 1kg", "2 × $2.00"],
                  ["MALTA RETORNABLE", "3 × $1.50"],
                  ["PAPEL DE ALUMINIO TUC", "1 × $0.90"],
                ]}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 520 }}>
              {[
                ["Dólares", "$ 12,00", "cash"],
                ["Bolívares", "Bs 4.224,00", "wallet"],
                ["Punto de venta", "$ 8,00", "creditcard"],
              ].map(([nombre, importe, icono], i) => (
                <div
                  key={nombre}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    opacity: pagos[i],
                    transform: `translateX(${interpolate(pagos[i], [0, 1], [50, 0])}px)`,
                    background: "rgba(255,254,251,0.7)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    border: "1px solid rgba(66,66,66,0.12)",
                    borderRadius: 18,
                    padding: "18px 22px",
                  }}
                >
                  <span style={{ color: ACENTO, display: "grid", placeItems: "center" }}>
                    <Simbolo nombre={icono} tam={26} />
                  </span>
                  <span style={{ fontSize: 22, color: TINTA_2, flex: 1 }}>{nombre}</span>
                  <b style={{ fontSize: 26, fontVariantNumeric: "tabular-nums", color: TINTA }}>{importe}</b>
                </div>
              ))}

              <div
                style={{
                  marginTop: 8,
                  opacity: vuelto,
                  transform: `translateY(${interpolate(vuelto, [0, 1], [24, 0])}px) scale(${vuelto * ding})`,
                  background: `linear-gradient(180deg, rgba(0,136,255,0.16), rgba(0,136,255,0.08))`,
                  border: "1px solid rgba(0,136,255,0.3)",
                  borderRadius: 20,
                  padding: "22px 26px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 24, fontWeight: 600, color: TINTA }}>Vuelto</span>
                <b style={{ fontSize: 38, color: ACENTO, fontVariantNumeric: "tabular-nums" }}>
                  Bs 5.280,00
                </b>
              </div>
            </div>
          </AbsoluteFill>
        )}

        {/* ==========================================================
            5 · CONEXION AUTOMATICA BCV (0:32 - 0:40)
            ========================================================== */}
        {f4 >= 0 && f4 < T.bcv[1] - T.bcv[0] && (
          <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 44 }}>
            <Titular size={78} style={{ textAlign: "center" }}>
              La tasa del día, <span style={{ color: ACENTO }}>sin buscar en ningún lado</span>
            </Titular>

            <Panel
              style={{
                width: 720,
                opacity: tarjeta,
                transform: `translateY(${interpolate(tarjeta, [0, 1], [40, 0])}px) scale(${interpolate(tarjeta, [0, 1], [0.94, 1])})`,
                display: "flex",
                alignItems: "center",
                gap: 34,
              }}
            >
              <span
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 22,
                  background: "rgba(0,136,255,0.13)",
                  color: ACENTO,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Simbolo nombre="wallet" tam={38} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 19, color: TINTA_2, fontWeight: 600 }}>Tasa oficial BCV</div>
                <div style={{ fontSize: 62, fontWeight: 700, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
                  <Contador valor={882} desde={tarjeta * 30} hasta={tarjeta * 30 + 44} decimales={2} sufijo=" Bs/$" />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    borderRadius: 999,
                    background: "rgba(52,199,89,0.15)",
                    color: EXITO,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: EXITO,
                      opacity: 0.45 + punto * 0.55,
                      boxShadow: `0 0 0 ${4 + punto * 6}px rgba(52,199,89,${0.12 + punto * 0.16})`,
                    }}
                  />
                  Actualización automática
                </span>
                <span style={{ fontSize: 17, color: TINTA_2 }}>Cero errores humanos</span>
              </div>
            </Panel>
          </AbsoluteFill>
        )}

        {/* ==========================================================
            6 · REPORTES CON UN SOLO TOQUE (0:40 - 0:48)
            ========================================================== */}
        {f5 >= 0 && f5 < T.reportes[1] - T.reportes[0] && (
          <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
            <Titular size={78} style={{ textAlign: "center" }}>
              Los números, <span style={{ color: ACENTO }}>en un solo toque</span>
            </Titular>

            <Panel
              style={{
                width: 1180,
                opacity: grafico,
                transform: `translateY(${interpolate(grafico, [0, 1], [40, 0])}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ fontSize: 30, fontWeight: 600, color: TINTA }}>Ventas por mes</div>
                <Pastilla tono="exito">
                  <Simbolo nombre="trendUp" tam={18} /> 12,4 % este mes
                </Pastilla>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 300 }}>
                {[38, 52, 44, 61, 58, 72, 66, 81, 74, 92, 86, 100].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}%`,
                      borderRadius: "10px 10px 4px 4px",
                      background:
                        i === 11
                          ? `linear-gradient(180deg, ${PALETA.azul.claro}, ${PALETA.azul.oscuro})`
                          : "rgba(0,136,255,0.24)",
                      opacity: barras[i],
                      transform: `scaleY(${interpolate(barras[i], [0, 1], [0.2, 1])})`,
                      transformOrigin: "bottom",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
                {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map(
                  (m, i) => (
                    <div
                      key={m}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: 17,
                        color: i === 11 ? ACENTO : TINTA_2,
                        fontWeight: i === 11 ? 700 : 400,
                        opacity: barras[i],
                      }}
                    >
                      {m}
                    </div>
                  )
                )}
              </div>
            </Panel>
          </AbsoluteFill>
        )}

        {/* ==========================================================
            7 · ESCANER INALAMBRICO (0:48 - 0:56)
            ========================================================== */}
        {f6 >= 0 && f6 < T.escaner[1] - T.escaner[0] && (
          <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 90 }}>
            <div style={{ transform: `scale(${interpolate(telefono, [0, 1], [0.8, 1])})` }}>
              <Movil escaneado={leido} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 640 }}>
              <Titular size={62} style={{ lineHeight: 1.12 }}>
                Escanea la factura.
                <br />
                <span style={{ color: ACENTO }}>Al inventario, al instante.</span>
              </Titular>

              <Panel
                style={{
                  opacity: articulo,
                  transform: `translateY(${interpolate(articulo, [0, 1], [30, 0])}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <span
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    background: "rgba(52,199,89,0.14)",
                    color: EXITO,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Simbolo nombre={leido ? "check" : "scan"} tam={30} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 23, fontWeight: 600, color: TINTA }}>
                    {leido ? "Factura añadida al inventario" : "Buscando código de barras…"}
                  </div>
                  <div style={{ fontSize: 18, color: TINTA_2, marginTop: 4 }}>
                    {leido ? "Azúcar Konfit 1kg · 24 unidades" : "Alinea el código dentro del marco"}
                  </div>
                </div>
                {leido && (
                  <span style={{ fontSize: 26, fontWeight: 700, color: EXITO, fontVariantNumeric: "tabular-nums" }}>
                    +24
                  </span>
                )}
              </Panel>
            </div>
          </AbsoluteFill>
        )}

        {/* ==========================================================
            8 · RESUMEN (0:56 - 1:00)
            ========================================================== */}
        {f7 >= 0 && f7 < T.resumen[1] - T.resumen[0] && (
          <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 220px" }}>
            <Titular
              size={76}
              style={{
                textAlign: "center",
                opacity: frase,
                transform: `translateY(${interpolate(frase, [0, 1], [30, 0])}px)`,
              }}
            >
              Gestionar tu negocio nunca había sido tan{" "}
              <span style={{ color: ACENTO }}>fácil, rápido y seguro</span>.
            </Titular>

            {/* La mascota guiña y asiente */}
            <div
              style={{
                position: "absolute",
                right: 150,
                bottom: 80,
                display: "flex",
                alignItems: "center",
                gap: 26,
                opacity: frase,
              }}
            >
              <span style={{ fontSize: 30, color: TINTA, fontWeight: 600 }}>¿Verdad que sí, Blink?</span>
              <Mascota
                tam={128}
                estado="guinante"
                parpadeo={masc8.parpadeo}
                guiño={masc8.guiño}
                asintido={masc8.asintido}
              />
            </div>
          </AbsoluteFill>
        )}

        {/* ==========================================================
            9 · CIERRE Y LLAMADA A LA ACCION (1:00 - 1:29)
            ========================================================== */}
        {f8 >= 0 && (
          <AbsoluteFill style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 44 }}>
            <Titular
              size={84}
              style={{
                textAlign: "center",
                opacity: pregunta,
                transform: `translateY(${interpolate(pregunta, [0, 1], [34, 0])}px)`,
                maxWidth: 1300,
              }}
            >
              ¿Qué esperas para{" "}
              <span style={{ color: ACENTO }}>dominar el mercado</span> y modernizar tu negocio?
            </Titular>

            {/* El boton final: cristal con degradado y reflejo superior */}
            <div
              style={{
                opacity: lema,
                transform: `translateY(${interpolate(lema, [0, 1], [40, 0])}px)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 26,
              }}
            >
              <div
                style={{
                  padding: "30px 54px",
                  borderRadius: 26,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.16))",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.85), 0 18px 46px rgba(0,136,255,0.24)",
                  fontSize: 40,
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  color: TINTA,
                  transform: `scale(${interpolate(boton, [0, 1], [0.92, 1])})`,
                }}
              >
                Vende en un parpadeo, factura con <span style={{ color: ACENTO }}>BLINK ;)</span>
              </div>

              <div style={{ display: "flex", gap: 16, alignItems: "center", opacity: boton }}>
                <Pastilla>
                  <Simbolo nombre="check" tam={18} /> Sin instalación
                </Pastilla>
                <Pastilla>
                  <Simbolo nombre="check" tam={18} /> $25 al mes
                </Pastilla>
                <Pastilla>
                  <Simbolo nombre="check" tam={18} /> 100 % en la nube
                </Pastilla>
              </div>
            </div>

            {/* La mascota se despide */}
            <div
              style={{
                position: "absolute",
                right: 150,
                bottom: 80,
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: saludo,
                transform: `translateY(${interpolate(saludo, [0, 1], [30, 0])}px)`,
              }}
            >
              <span style={{ fontSize: 28, color: TINTA_2, fontWeight: 500 }}>Hasta pronto</span>
              <Mascota
                tam={120}
                estado="sonriente"
                parpadeo={Math.max(masc9.parpadeo, parpadeoFinal)}
                asintido={masc9.asintido}
                sonrisa={0.4}
              />
            </div>
          </AbsoluteFill>
        )}
      </Fondo>
    </AbsoluteFill>
  );
};
