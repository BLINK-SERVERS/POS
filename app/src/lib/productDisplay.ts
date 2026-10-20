/**
 * Formatea el nombre completo del producto incluyendo medida/unidad.
 * Aplica deduplicación inteligente para evitar "1kg 1 unidad".
 */
export function formatProductDisplayName(
  name: string,
  presentationQty: number,
  unit: string,
): string {
  if (!name) return "";
  let base = name.trim();
  const qty = Number(presentationQty) || 1;
  const s = (unit || "").trim().toLowerCase();
  const simple = s === "unidad" || s === "und" || s === "unidades" || s === "u";
  let m = "";
  if (qty > 0 && s) {
    if (simple && Math.abs(qty - 1) < 0.0001) {
      m = "";
    } else {
      let c = s;
      if (s === "kilogramo" || s === "kg") c = "kg";
      else if (s === "gramo" || s === "g" || s === "gr") c = "g";
      else if (s === "litro" || s === "l") c = "L";
      else if (s === "mililitro" || s === "ml") c = "ml";
      m = qty + c;
    }
  }
  if (m && base) {
    try {
      const escaped = m.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      const re = new RegExp("\\s*" + escaped + "\\b", "i");
      if (re.test(base)) m = "";
    } catch (e) {
      // ignore
    }
  }
  if (m) return (base + " " + m).trim();
  return base;
}
