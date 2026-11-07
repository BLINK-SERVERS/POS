import { useTema } from "../lib/tema";
import marcaOscura from "../assets/marca-blink-blanco.svg?raw";
import marcaClara from "../assets/marca-blink.svg?raw";

export function useBrandSource() {
  const { esOscuro } = useTema();
  return `${import.meta.env.BASE_URL}brand/${esOscuro ? "blink-blanco.svg" : "blink.svg"}`;
}

function useBrandMark() {
  const { esOscuro } = useTema();
  return esOscuro ? marcaOscura : marcaClara;
}

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src={useBrandSource()}
      width="876"
      height="190"
      alt="Blink POS"
      draggable={false}
    />
  );
}

export function BrandMark() {
  return (
    <div
      className="brand-mark"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: useBrandMark() }}
    />
  );
}
