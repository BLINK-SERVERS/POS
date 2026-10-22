// Formato de dinero dual USD / VES.

const usd = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const bs = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
// La tasa puede tener más decimales que un monto.
const rateFmt = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});
// La tasa de la cabecera: dos decimales, ni uno más ni uno menos.
const tasaFmt = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(n: number): string {
  return `$ ${usd.format(n || 0)}`;
}

export function toBs(n: number, rate: number): number {
  return (n || 0) * (rate || 0);
}

export function formatBs(n: number, rate: number): string {
  return `Bs ${bs.format(toBs(n, rate))}`;
}

export function formatBsDirect(amountBs: number): string {
  return `Bs ${bs.format(amountBs || 0)}`;
}

/** Formatea una tasa BCV (hasta 4 decimales). */
export function formatRate(rate: number): string {
  return `Bs ${rateFmt.format(rate || 0)}`;
}

/**
 * La tasa en la cabecera, con DOS decimales exactos (884,75).
 *
 * El calculo de dinero sigue con la precision completa (hasta cuatro
 * decimales); lo que se muestra en la barra es la cifra de un vistazo.
 */
export function formatTasaCabecera(rate: number): string {
  return `Bs ${tasaFmt.format(rate || 0)}`;
}

/** Redondeo comercial a 2 decimales. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
