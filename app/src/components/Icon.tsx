// Iconos del sistema: SF Symbols de Apple (MIT? NO: licencia de Apple,
// ver docs/ICONOS_Y_PWA.md). Generados por `npm run icons:sf`.
//
// Los glifos vienen normalizados a `currentColor` con su viewBox propio,
// de modo que heredan el color del texto y escalan a cualquier tamano.
import { memo, type SVGProps } from "react";
import { SF_SYMBOLS } from "../lib/sf-symbols";

export type IconName = keyof typeof SF_SYMBOLS;

export const Icon = memo(function Icon({
  name,
  size = "md",
  ...rest
}: { name: IconName; size?: "sm" | "md" | "lg" | "xl" } & SVGProps<SVGSVGElement>) {
  const s = SF_SYMBOLS[name];
  if (!s) return null;
  const cls = size === "md" ? "icon" : `icon icon--${size}`;
  return (
    <svg
      className={cls}
      viewBox={s.viewBox}
      fill="currentColor"
      stroke="none"
      aria-hidden="true"
      {...rest}
      dangerouslySetInnerHTML={{ __html: s.body }}
    />
  );
});
