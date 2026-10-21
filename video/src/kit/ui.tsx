// ============================================================
// Piezas de Motion UI: los elementos reales de la app, montados para
// el video (1920x1080) con las medidas del UI Kit de iOS 27.
//
// Cada pieza es un componente "tonto": recibe su estado (selected,
// activo, etc.) y el guion decide cuando animarlos con `spring()`.
// ============================================================
import type { CSSProperties, ReactNode } from "react";
import { Simbolo } from "./simbolo";
import { ACENTO, CRISTAL, EXITO, HALO, MARCO, METRICAS, PAPEL, PELIGRO, TINTA, TINTA_2 } from "./tokens";

/* ------------------------------------------------------------------ */
/* Cristal: el material translucido (HIG · Materials)                   */
/* ------------------------------------------------------------------ */
export const Cristal = ({
  children,
  style,
  radio = CRISTAL.radio,
  relleno = 0.66,
}: {
  children: ReactNode;
  style?: CSSProperties;
  radio?: number;
  relleno?: number;
}) => (
  <div
    style={{
      position: "relative",
      borderRadius: radio,
      background: `rgba(255, 254, 251, ${relleno})`,
      backdropFilter: `blur(${CRISTAL.blur}px) saturate(${CRISTAL.saturate}%)`,
      WebkitBackdropFilter: `blur(${CRISTAL.blur}px) saturate(${CRISTAL.saturate}%)`,
      border: `1px solid ${CRISTAL.borde}`,
      boxShadow: `${CRISTAL.especular}, ${CRISTAL.sombra}`,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Logotipo: el lockup BLINK POS de la web                              */
/* ------------------------------------------------------------------ */
export const Logotipo = ({ escala = 1 }: { escala?: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 * escala }}>
    <span
      style={{
        fontSize: 30 * escala,
        fontWeight: 800,
        fontStyle: "italic",
        letterSpacing: "-0.03em",
        textTransform: "uppercase",
        color: ACENTO,
        lineHeight: 1,
      }}
    >
      BLINK
    </span>
    <span
      style={{
        fontSize: 30 * escala,
        fontWeight: 300,
        letterSpacing: "-0.01em",
        textTransform: "uppercase",
        color: TINTA,
        lineHeight: 1,
      }}
    >
      POS
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/* Pastilla: el chip de la landing                                      */
/* ------------------------------------------------------------------ */
export const Pastilla = ({
  children,
  tono = "acento",
  style,
}: {
  children: ReactNode;
  tono?: "acento" | "exito" | "neutro";
  style?: CSSProperties;
}) => {
  const colores =
    tono === "exito"
      ? { fondo: "rgba(52,199,89,0.15)", texto: EXITO }
      : tono === "neutro"
        ? { fondo: "rgba(66,66,66,0.07)", texto: TINTA_2 }
        : { fondo: "rgba(0,136,255,0.10)", texto: ACENTO };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        borderRadius: 999,
        background: colores.fondo,
        color: colores.texto,
        fontSize: 18,
        fontWeight: 600,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Tarjeta de metrica (General)                                         */
/* ------------------------------------------------------------------ */
export const TarjetaKpi = ({
  etiqueta,
  valor,
  pie,
  icono,
  variacion,
  seleccionado = false,
  style,
}: {
  etiqueta: string;
  valor: string;
  pie?: string;
  icono: string;
  variacion?: number;
  seleccionado?: boolean;
  style?: CSSProperties;
}) => (
  <Cristal
    style={{
      width: 360,
      padding: "26px 28px 28px",
      ...style,
    }}
    relleno={seleccionado ? 0.86 : 0.66}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
      <span
        style={{
          width: 54,
          height: 54,
          borderRadius: 17,
          background: "rgba(0,136,255,0.13)",
          color: ACENTO,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Simbolo nombre={icono} tam={28} />
      </span>
      {variacion !== undefined && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            borderRadius: 999,
            background: variacion >= 0 ? "rgba(52,199,89,0.15)" : "rgba(255,56,60,0.13)",
            color: variacion >= 0 ? EXITO : PELIGRO,
            fontSize: 17,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <Simbolo nombre={variacion >= 0 ? "arrowUp" : "arrowDown"} tam={14} />
          {variacion >= 0 ? "+" : ""}
          {variacion.toFixed(1)} %
        </span>
      )}
    </div>
    <div style={{ fontSize: 17, fontWeight: 600, color: TINTA_2 }}>{etiqueta}</div>
    <div
      style={{
        fontSize: 46,
        fontWeight: 700,
        letterSpacing: "-0.028em",
        lineHeight: 1.08,
        fontVariantNumeric: "tabular-nums",
        color: TINTA,
        marginTop: 4,
      }}
    >
      {valor}
    </div>
    {pie && <div style={{ fontSize: 16, color: TINTA_2, marginTop: 6 }}>{pie}</div>}
  </Cristal>
);

/* ------------------------------------------------------------------ */
/* Maqueta del POS (la pantalla de venta)                                */
/* ------------------------------------------------------------------ */
export const MaquetaPOS = ({
  lineas = [
    ["AZUCAR KONFIT 1kg", "2 × $2.00"],
    ["MALTA RETORNABLE", "3 × $1.50"],
    ["PAPEL DE ALUMINIO TUC", "1 × $0.90"],
  ],
  total = "$ 8.40",
  bs = "Bs 7.408,80 · Tasa BCV 882.00",
  style,
}: {
  lineas?: [string, string][];
  total?: string;
  bs?: string;
  style?: CSSProperties;
}) => (
  <div
    style={{
      width: 460,
      background: MARCO,
      borderRadius: 22,
      padding: 12,
      boxShadow: "0 30px 60px rgba(29,29,31,0.34)",
      ...style,
    }}
  >
    <div
      style={{
        background: PAPEL,
        borderRadius: 14,
        padding: "20px 22px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        minHeight: 360,
      }}
    >
      <div
        style={{
          height: 36,
          borderRadius: 999,
          background: "rgba(66,66,66,0.07)",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          fontSize: 15,
          color: TINTA_2,
          gap: 8,
        }}
      >
        <Simbolo nombre="search" tam={16} />
        Buscar o escanear…
      </div>
      {lineas.map(([n, p]) => (
        <div
          key={n}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 14,
            fontSize: 16,
            color: TINTA_2,
            padding: "7px 0",
            borderBottom: "1px dashed rgba(66,66,66,0.14)",
          }}
        >
          <b style={{ color: TINTA, fontWeight: 600 }}>{n}</b>
          <span>{p}</span>
        </div>
      ))}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 14,
          borderTop: `2px solid ${TINTA}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <span style={{ fontSize: 15, color: TINTA_2 }}>Total a pagar</span>
        <strong style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }}>
          {total}
        </strong>
      </div>
      <div style={{ fontSize: 14, color: TINTA_2, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{bs}</div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Movil escaneando                                                     */
/* ------------------------------------------------------------------ */
export const Movil = ({
  escaneado = true,
  style,
}: {
  escaneado?: boolean;
  style?: CSSProperties;
}) => (
  <div
    style={{
      width: 200,
      background: MARCO,
      borderRadius: 30,
      padding: 9,
      boxShadow: "0 24px 48px rgba(29,29,31,0.38)",
      ...style,
    }}
  >
    <div
      style={{
        position: "relative",
        aspectRatio: "9 / 14",
        borderRadius: 22,
        overflow: "hidden",
        background: "linear-gradient(180deg,#1c1c1e,#000)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: "16% 14%",
          border: `3px solid ${ACENTO}`,
          borderRadius: 14,
        }}
      />
      <div
        style={{
          width: "60%",
          height: "30%",
          opacity: 0.92,
          background:
            "repeating-linear-gradient(90deg,#fff 0 2px,transparent 2px 4px,#fff 4px 6px,transparent 6px 9px)",
        }}
      />
      {escaneado && (
        <span
          style={{
            position: "absolute",
            left: "50%",
            bottom: 12,
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontSize: 13,
            fontWeight: 700,
            color: ACENTO,
            background: "rgba(255,255,255,0.94)",
            padding: "5px 12px",
            borderRadius: 999,
            boxShadow: "0 4px 10px rgba(0,0,0,0.22)",
          }}
        >
          Escaneado
        </span>
      )}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Barra de navegacion flotante (la del movil)                          */
/* ------------------------------------------------------------------ */
export const BarraInferior = ({
  activo = "General",
  style,
}: {
  activo?: string;
  style?: CSSProperties;
}) => {
  const izquierda = [
    { id: "General", icono: "grid2x2", etiqueta: "General" },
    { id: "Catálogo", icono: "tag", etiqueta: "Catálogo" },
  ];
  const derecha = [
    { id: "Inventario", icono: "box", etiqueta: "Inventario" },
    { id: "Finanzas", icono: "wallet", etiqueta: "Finanzas" },
  ];
  const item = (i: { id: string; icono: string; etiqueta: string }) => {
    const on = i.id === activo;
    return (
      <div
        key={i.id}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          width: 96,
          color: on ? ACENTO : TINTA_2,
        }}
      >
        <Simbolo nombre={i.icono} tam={30} />
        <span style={{ fontSize: 14, fontWeight: 600 }}>{i.etiqueta}</span>
      </div>
    );
  };
  return (
    <Cristal
      radio={34}
      relleno={0.72}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 22px",
        width: 620,
        ...style,
      }}
    >
      <div style={{ display: "flex" }}>{izquierda.map(item)}</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: 108 }}>
        <span
          style={{
            width: 58,
            height: 58,
            borderRadius: 999,
            background: ACENTO,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 4px 14px rgba(0,136,255,0.32)",
          }}
        >
          <Simbolo nombre="dollarsign" tam={32} />
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: ACENTO }}>Vender</span>
      </div>
      <div style={{ display: "flex" }}>{derecha.map(item)}</div>
    </Cristal>
  );
};

/* ------------------------------------------------------------------ */
/* Fondo del comercial: papel + velo de acento (el de la landing)       */
/* ------------------------------------------------------------------ */
export const Fondo = ({
  oscuro = false,
  children,
}: {
  oscuro?: boolean;
  children: ReactNode;
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: oscuro ? "#000000" : PAPEL,
      color: oscuro ? "#F5F5F7" : TINTA,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: -200,
        background: oscuro
          ? "radial-gradient(40% 50% at 70% 30%, rgba(0,145,255,0.20), transparent 70%)"
          : "radial-gradient(46% 60% at 78% 18%, rgba(0,136,255,0.16), transparent 70%), radial-gradient(38% 50% at 20% 90%, rgba(0,136,255,0.09), transparent 72%)",
      }}
    />
    <div style={{ position: "absolute", inset: 0 }}>{children}</div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Tipografia del comercial                                              */
/* ------------------------------------------------------------------ */
export const Titular = ({
  children,
  size = 96,
  color = TINTA,
  style,
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  style?: CSSProperties;
}) => (
  <div
    style={{
      fontSize: size,
      fontWeight: 700,
      letterSpacing: "-0.035em",
      lineHeight: 1.05,
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Subtitulo = ({
  children,
  size = 32,
  color = TINTA_2,
  style,
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  style?: CSSProperties;
}) => (
  <div style={{ fontSize: size, lineHeight: 1.45, color, ...style }}>{children}</div>
);

/** Area tactil minima del UI Kit: 44 pt. */
export const TOQUE = METRICAS.toque;
export { HALO };
