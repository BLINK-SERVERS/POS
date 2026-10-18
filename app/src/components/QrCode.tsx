// Render de un QR a partir de un texto, como SVG (sin imágenes externas).
// La app usa este componente para el emparejamiento del celular.
import { useEffect, useState } from "react";
import { toString as qrToString } from "qrcode";

export function QrCode({
  value,
  size = 220,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let alive = true;
    qrToString(value, {
      type: "svg",
      margin: 1,
      width: size,
      errorCorrectionLevel: "M",
    })
      .then((s) => {
        if (alive) setSvg(s);
      })
      .catch(() => {
        if (alive) setSvg("");
      });
    return () => {
      alive = false;
    };
  }, [value, size]);

  if (!svg) {
    return (
      <div
        className="qr qr--loading"
        style={{ width: size, height: size, margin: "0 auto", justifyContent: "center", alignItems: "center" }}
        role="img"
        aria-label="Generando código QR"
      />
    );
  }
  return (
    <div
      className={"qr" + (className ? ` ${className}` : "")}
      style={{ width: size, height: size, margin: "0 auto", justifyContent: "center", alignItems: "center" }}
      // Solo insertamos el SVG que genera la librería `qrcode`; el texto
      // codificado no se inyecta como HTML, va dentro de rutas del dibujo.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
