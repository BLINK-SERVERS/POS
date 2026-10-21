// Módulos del sistema y su iconografía.
//
// Una sola fuente de verdad: el mismo módulo lleva el mismo icono en la
// barra lateral de escritorio, en la barra inferior flotante de móvil y
// en el panel de módulos de General.
//
//   General   · panel / dashboard  · grid2x2
//   Ventas    · carrito             · cart
//   Historial · reloj               · clock
//   Catálogo  · etiqueta            · tag
//   Inventario· caja / stock        · box
//   Contactos · usuarios / libreta  · users
//   Finanzas  · billetera           · wallet
//   Informes  · gráficas            · chart
import type { IconName } from "../components/Icon";
import type { BusinessFeatures } from "./types";

export interface Modulo {
  to: string;
  label: string;
  icon: IconName;
  feature?: keyof BusinessFeatures;
}

/** Todos los módulos del sistema, en el orden de la barra lateral. */
export const MODULOS: Modulo[] = [
  { to: "/app/inicio", label: "Inicio", icon: "grid2x2" },
  { to: "/app/ventas", label: "Ventas", icon: "cart" },
  { to: "/app/ventas/historial", label: "Historial", icon: "clock" },
  { to: "/app/catalogo", label: "Catálogo", icon: "tag" },
  { to: "/app/inventario", label: "Inventario", icon: "box", feature: "inventory" },
  { to: "/app/contactos", label: "Contactos", icon: "users", feature: "providers" },
  { to: "/app/finanzas", label: "Finanzas", icon: "wallet", feature: "expenses" },
  { to: "/app/informes", label: "Informes", icon: "chart", feature: "reports" },
];

/** Filtra los módulos según las funciones activadas del comercio. */
export function modulosVisibles(features: BusinessFeatures): Modulo[] {
  return MODULOS.filter((m) => !m.feature || features[m.feature]);
}
