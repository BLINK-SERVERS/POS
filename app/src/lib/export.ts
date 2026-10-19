// Exportación de reportes: CSV (descarga) y PDF (vía impresión del navegador).
// Sin dependencias nuevas: el PDF usa el diálogo "Guardar como PDF" del navegador,
// igual que el patrón ya usado para los tickets (#printable-receipt).

export type CsvCell = string | number | boolean | null | undefined;

const BOM = "\uFEFF";

/** Escapa un valor para CSV (comillas, comas, saltos de línea). */
function esc(v: CsvCell): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "boolean" ? (v ? "Sí" : "No") : String(v);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Convierte encabezados + filas a texto CSV (con BOM para Excel en UTF-8). */
export function toCsv(headers: string[], rows: CsvCell[][]): string {
  const lines = [headers.map(esc).join(",")];
  for (const row of rows) lines.push(row.map(esc).join(","));
  return BOM + lines.join("\r\n") + "\r\n";
}

/** Dispara la descarga de un archivo de texto (CSV u otro). */
export function downloadText(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Libera el objeto URL en el siguiente tick (Safari lo necesita).
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Fecha-hora legible para nombrar archivos: 2026-10-19_0930 */
export function fileStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

/** Construye un nombre base de archivo ("informe-ventas_2026-10-19_0930"). */
export function reportName(kind: string): string {
  return `${kind}_${fileStamp()}`;
}

export interface PrintableReport {
  title: string;
  subtitle?: string;
  /** Encabezado del negocio (nombre legal / marca). */
  business?: string;
  /** HTML ya construido: tablas o bloques con la clase .pr-* (ver app.css). */
  bodyHtml: string;
}

/**
 * Abre el diálogo de impresión del navegador con un reporte formateado.
 * El usuario elige "Guardar como PDF". Reutiliza el contenedor #printable-report
 * (estilizado en app.css y con regla @media print propia).
 */
export function printReport({ title, subtitle, business, bodyHtml }: PrintableReport) {
  const root = document.getElementById("printable-report");
  if (!root) return;
  const now = new Date().toLocaleString("es", { dateStyle: "long", timeStyle: "short" });
  root.innerHTML = `
    <div class="pr-head">
      ${business ? `<div class="pr-business">${business}</div>` : ""}
      <h1 class="pr-title">${title}</h1>
      ${subtitle ? `<div class="pr-subtitle">${subtitle}</div>` : ""}
      <div class="pr-meta">Generado el ${now}</div>
    </div>
    <div class="pr-body">${bodyHtml}</div>
  `;
  // Dar un instante al layout antes de imprimir.
  requestAnimationFrame(() => {
    window.print();
    // Limpia después de imprimir para no dejar datos en el DOM.
    setTimeout(() => {
      root.innerHTML = "";
    }, 500);
  });
}

/** Tabla HTML para el reporte impreso (PDF). Valores ya formateados. */
export function printableTable(headers: string[], rows: CsvCell[][]): string {
  const th = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const tr = rows
    .map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
    .join("");
  return `<table class="pr-table"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}

/** Lista de concepto/valor para el reporte impreso (tipo desglose). */
export function printablePairs(pairs: [string, CsvCell][]): string {
  const rows = pairs
    .map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td class="pr-num">${escapeHtml(v)}</td></tr>`)
    .join("");
  return `<table class="pr-table pr-table--pairs"><tbody>${rows}</tbody></table>`;
}

function escapeHtml(v: CsvCell): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "boolean" ? (v ? "Sí" : "No") : String(v);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
