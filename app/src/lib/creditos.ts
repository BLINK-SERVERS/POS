// Cuentas por cobrar: saldos, deudores, vencimientos y estado de cuenta.
//
// Módulo puro, sin React ni almacén. La vista de Créditos y el modal de
// abonos consumen estas funciones; el vendedor no las necesita para cobrar,
// así que si el módulo se quita la venta sigue funcionando igual
// (degradación elegante del plan de cierre, §2).
//
// Regla de vocabulario del proyecto: se dice «Créditos», «Cuentas por
// Cobrar» y «Deudores». Nunca la forma coloquial de fiar.
import { round2 } from "./money";
import type { Contact, Movement, Pending } from "./types";

const DIA_MS = 86400000;

/** Lo que queda por cobrar de una cuenta. Nunca sale negativo. */
export const saldo = (p: Pending) => round2(Math.max(0, p.amountUsd - p.paidUsd));

/** Cuenta por cobrar viva: direction cobrar, no anulada y con saldo. */
export const vigente = (p: Pending) =>
  p.direction === "cobrar" && p.status !== "anulado" && saldo(p) > 0;

/** Total que tiene la plaza por cobrar. */
export function totalPorCobrar(pendings: Pending[]): number {
  return round2(pendings.filter(vigente).reduce((a, p) => a + saldo(p), 0));
}

/**
 * Vencimiento de una cuenta. Las ventas a crédito ahora fijan su propio
 * `dueAt` al cobrarse; las cuentas antiguas (y las que nunca lo tuvieron)
 * se calculan con los días de crédito del cliente, que es lo único que
 * queda. Sin días ni fecha, la cuenta no vence: se devuelve cadena vacía.
 */
export function vencimiento(p: Pending, contacto?: Contact): string {
  if (p.dueAt) return p.dueAt;
  const dias = contacto?.creditDays ?? 0;
  if (dias <= 0) return "";
  return new Date(Date.parse(p.at) + dias * DIA_MS).toISOString();
}

/** Días de atraso sobre una fecha de vencimiento; 0 si no vence o no venció. */
export function diasDeAtraso(vence: string, ahora: number): number {
  if (!vence) return 0;
  return Math.max(0, Math.floor((ahora - Date.parse(vence)) / DIA_MS));
}

/** Días transcurridos desde que se abrió una cuenta. */
export function diasDesde(abrio: string, ahora: number): number {
  return Math.max(0, Math.floor((ahora - Date.parse(abrio)) / DIA_MS));
}

export interface Deudor {
  /** Clave del grupo: el id del cliente, o "" para las cuentas sin cliente. */
  contactId: string;
  name: string;
  document: string;
  phone: string;
  /** USD suma de saldos. */
  total: number;
  /** Cuántas cuentas tienen saldo. */
  cuentas: number;
  /** Cuántas cuentas están vencidas. */
  vencidas: number;
  /** ISO del vencimiento más antiguo entre las cuentas vivas ("" si no vence). */
  vence: string;
  /** Días de atraso de ese vencimiento. */
  diasAtraso: number;
  /** ISO de la apertura más antigua con saldo. */
  abrio: string;
  dias: number;
}

/**
 * Deudores agrupados, con mayor saldo primero.
 *
 * Las cuentas cuyo cliente ya no está en la libreta (o que nunca tuvieron
 * cliente) no se pierden: salen en un grupo aparte para que el total de la
 * vista cuadre con el total del libro.
 */
export function deudores(
  pendings: Pending[],
  contacts: Contact[],
  ahora: number = Date.now()
): Deudor[] {
  const grupos = new Map<string, Pending[]>();
  for (const p of pendings.filter(vigente)) {
    const clave = p.contactId ?? "";
    const b = grupos.get(clave);
    if (b) b.push(p);
    else grupos.set(clave, [p]);
  }

  const filas: Deudor[] = [];
  for (const [contactId, cs] of grupos) {
    const contacto = contactId ? contacts.find((c) => c.id === contactId) : undefined;
    const orden = [...cs].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    const vencimientos = orden
      .map((p) => vencimiento(p, contacto))
      .filter(Boolean)
      .sort((a, b) => Date.parse(a) - Date.parse(b));
    const vence = vencimientos[0] ?? "";
    filas.push({
      contactId,
      name: contacto?.name || orden[0].contactName || "Sin cliente asignado",
      document: contacto?.document ?? "",
      phone: contacto?.phone ?? "",
      total: round2(orden.reduce((a, p) => a + saldo(p), 0)),
      cuentas: orden.length,
      vencidas: vencimientos.filter((v) => Date.parse(v) < ahora).length,
      vence,
      diasAtraso: diasDeAtraso(vence, ahora),
      abrio: orden[0].at,
      dias: diasDesde(orden[0].at, ahora),
    });
  }

  return filas.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "es"));
}

/** A partir de qué día de atraso se considera moroso a un deudor. */
export const DIAS_MOROSO = 30;

export function morosos(listado: Deudor[], dias = DIAS_MOROSO): Deudor[] {
  return listado.filter((d) => d.diasAtraso >= dias);
}

/**
 * Cuentas de un deudor, de la más antigua a la más nueva.
 *
 * Con `contactId` vacío se piden las cuentas sin cliente asignado: esas
 * cuentas llegan del POS con `contactId` ausente, no con cadena vacía, y el
 * grupo «Sin cliente asignado» de la vista tiene que poder imprimir su
 * propio estado de cuenta.
 */
export function cuentasDe(pendings: Pending[], contactId: string): Pending[] {
  return pendings
    .filter(
      (p) =>
        p.direction === "cobrar" &&
        p.status !== "anulado" &&
        (p.contactId ?? "") === contactId
    )
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

/**
 * Abonos de una cuenta. Los asientos nuevos llevan `pendingId`; los viejos
 * se reconocen por el concepto, igual que hace el libro al revertir
 * (BLINK-069). Un asiento ya revertido no cuenta: su dinero volvió a salir.
 */
export function abonosDe(movements: Movement[], p: Pending): Movement[] {
  return movements.filter(
    (m) =>
      !m.reversedAt &&
      !m.reversalOf &&
      m.direction === "entrada" &&
      (m.pendingId === p.id || (!m.pendingId && m.origin === "Abono" && m.note === p.subject))
  );
}

export interface LineaEstado {
  at: string;
  concepto: string;
  referencia: string;
  debe: number;
  haber: number;
  saldo: number;
}

/**
 * Estado de cuenta de un deudor: cada venta que abrió una cuenta por cobrar
 * y cada abono que la cerró, con el saldo corrido. Se imprime tal cual, así
 * que las cadenas salen ya legibles y sin HTML.
 */
export function estadoDeCuenta(
  pendings: Pending[],
  movements: Movement[],
  contactId: string,
  options: { desde?: string; hasta?: string } = {}
): LineaEstado[] {
  const desde = options.desde ? Date.parse(options.desde) : 0;
  const hasta = options.hasta ? Date.parse(options.hasta) : Infinity;

  type Bruto = { at: string; concepto: string; referencia: string; debe: number; haber: number };
  const todas: Bruto[] = [];

  for (const p of cuentasDe(pendings, contactId)) {
    todas.push({ at: p.at, concepto: p.subject, referencia: "", debe: round2(p.amountUsd), haber: 0 });
    for (const m of abonosDe(movements, p)) {
      todas.push({
        at: m.at,
        concepto: "Abono",
        // La nota del asiento repite el concepto cuando el cajero no escribió
        // nada: en el impreso no hay que duplicar «Venta 000123».
        referencia: m.note === p.subject ? "" : m.note,
        debe: 0,
        haber: round2(m.amountUsd),
      });
    }
  }

  todas.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

  // Con periodo recortado, el impreso no puede arrancar en cero: lo que se
  // debe antes del `desde` es parte de la deuda del deudor.
  let correr = 0;
  const filas: LineaEstado[] = [];
  if (desde > 0) {
    for (const l of todas) {
      if (Date.parse(l.at) >= desde) break;
      correr = round2(correr + l.debe - l.haber);
    }
    if (correr !== 0) {
      filas.push({ at: options.desde ?? "", concepto: "Saldo anterior", referencia: "", debe: 0, haber: 0, saldo: correr });
    }
  }

  for (const l of todas) {
    const t = Date.parse(l.at);
    if (t < desde || t > hasta) continue;
    correr = round2(correr + l.debe - l.haber);
    filas.push({ ...l, saldo: correr });
  }
  return filas;
}

/** Total del estado de cuenta: lo que queda debiendo al cierre del periodo. */
export function saldoAlCierre(lineas: LineaEstado[]): number {
  return lineas.length ? lineas[lineas.length - 1].saldo : 0;
}
