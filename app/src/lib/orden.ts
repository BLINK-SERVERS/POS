// Orden determinista del catálogo.
//
// Referencia de comportamiento (POS de mostrador: Stripe/Shopify command
// menus, Square, y el criterio ya usado en `Catalogo.tsx:426` para categorías):
// la lista se ordena por **relevancia y luego alfabéticamente**, nunca por el
// orden en que el comercio fue dando de alta los productos. Orden de alta es lo
// que hace que los resultados salgan "en burbujas": dos productos creados con
// semanas de diferencia aparecen intercalados sin criterio visible.
//
// El colador es `es` con `numeric: true`, así "Refresco 2 L" ordena antes de
// "Refresco 10 L" y se ignoran mayúsculas y tildes al comparar.
import type { Product } from "./types";

const COLADOR = new Intl.Collator("es", { numeric: true, sensitivity: "base" });

/** Comparador alfabético (es, sensible a números) por nombre de producto. */
export function porNombre(a: { name: string }, b: { name: string }): number {
  return COLADOR.compare(a.name, b.name);
}

/** Copia ordenada por nombre; no muta la entrada. */
export function ordenarPorNombre<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort(porNombre);
}

/** 0 exacto · 1 prefijo · 2 inicio de palabra · 3 contiene · 4 otros campos. */
function relevancia(p: Product, q: string): number {
  const nombre = p.name.toLowerCase();
  if (nombre === q) return 0;
  if (nombre.startsWith(q)) return 1;
  if (nombre.split(/\s+/).some((w) => w.startsWith(q))) return 2;
  if (nombre.includes(q)) return 3;
  return 4;
}

/**
 * Un escaneo o un SKU completos van por encima de todo: si el lector aporta
 * `7591234567890`, ese producto es la respuesta, aunque otro lo tenga escrito
 * dentro de su código o de su nombre.
 */
function esCoincidenciaExacta(p: Product, q: string): boolean {
  return (p.barcode || "").toLowerCase() === q || (p.sku || "").toLowerCase() === q;
}

function rango(p: Product, q: string): number {
  return esCoincidenciaExacta(p, q) ? -1 : relevancia(p, q);
}

const sinAcentos = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "");

/**
 * Presentación y marca para el segundo plano de una fila de resultados.
 * Devuelve "" cuando el nombre ya las dice: "Refresco 1 L" + "1 L" era el
 * tipo de texto repetido que hace una lista ilegible en el mostrador.
 */
export function detalleProducto(p: Product): string {
  const nombre = sinAcentos(p.name.toLowerCase());
  const partes: string[] = [];
  const presentacion = p.presentationQty > 0 && p.unit ? `${p.presentationQty} ${p.unit}` : "";
  if (presentacion && !nombre.includes(sinAcentos(presentacion.toLowerCase()))) {
    partes.push(presentacion);
  }
  const marca = (p.brand || "").trim();
  if (marca && !nombre.includes(sinAcentos(marca.toLowerCase()))) partes.push(marca);
  return partes.join(" · ");
}

/**
 * Resultados de búsqueda del POS, ya en el orden en que deben mostrarse.
 * Deja fuera inactivos y archivados (criterio de la pantalla de venta).
 */
export function buscarProductos(catalog: Product[], texto: string): Product[] {
  const q = texto.trim().toLowerCase();
  if (!q) return [];
  const coincide = (p: Product) => {
    const r = relevancia(p, q);
    if (r < 4) return true;
    return (
      (p.barcode || "").toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q) ||
      String(p.presentationQty || "").toLowerCase().includes(q) ||
      (p.unit || "").toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q)
    );
  };
  return catalog
    .filter((p) => p.active && !p.archived && coincide(p))
    .sort((a, b) => rango(a, q) - rango(b, q) || porNombre(a, b));
}
