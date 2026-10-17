// Finanzas · Cuentas, movimientos, transferencias, pendientes, gastos y cierres.
import { memo, useCallback, useMemo, useState } from "react";
import { useStoreActions, useStoreState } from "../lib/store";
import { Card, EmptyState, Field, Modal, Money, PageHead, Tabs, Badge } from "../components/ui";
import { formatBsDirect, formatRate, formatUsd, round2 } from "../lib/money";
import type {
  Account,
  CashClosure,
  Expense,
  ExpenseCategory,
  Movement,
  Pending,
  RecurringExpense,
  Transfer,
} from "../lib/types";

const TABS = [
  "Cuentas",
  "Movimientos",
  "Transferencias",
  "Pendientes",
  "Gastos",
  "Gastos recurrentes",
  "Categorías de gasto",
  "Cierres de caja",
] as const;

type Tab = (typeof TABS)[number];

/** Fecha + hora corta. */
function when(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

/** Fecha sin hora; las cadenas solo-fecha ("YYYY-MM-DD") se leen como locales. */
function dayLabel(iso: string): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return d.toLocaleDateString();
}

/* --- Filas memoizadas ------------------------------------------- */

/** Fila de cuenta. */
const AccountRow = memo(function AccountRow({
  account,
  rate,
  onMove,
}: {
  account: Account;
  rate: number;
  onMove: (id: string, sign: 1 | -1) => void;
}) {
  const hasFee = account.commissionIn > 0 || account.commissionOut > 0;
  return (
    <tr>
      <td style={{ fontWeight: 600 }}>
        {account.name}
        {hasFee && (
          <div className="dim" style={{ fontSize: "0.72rem", fontWeight: 400 }}>
            Comisión {account.commissionIn}% ent. · {account.commissionOut}% sal.
          </div>
        )}
      </td>
      <td style={{ textTransform: "capitalize" }}>{account.type.replace("_", " ")}</td>
      <td>{account.currency}</td>
      <td className="tabular" style={{ textAlign: "right" }}>
        {account.currency === "USD" ? formatUsd(account.balance) : formatBsDirect(account.balance)}
        <div className="dim" style={{ fontSize: "0.72rem" }}>
          {account.currency === "USD"
            ? formatBsDirect(account.balance * rate)
            : formatUsd(round2(account.balance / rate))}
        </div>
      </td>
      <td>
        {account.active ? <Badge tone="success" icon="check">Activa</Badge> : <Badge>Inactiva</Badge>}
      </td>
      <td className="row gap-4">
        <button className="btn btn--soft btn--sm" onClick={() => onMove(account.id, 1)}>
          Ingresar
        </button>
        <button className="btn btn--ghost btn--sm" onClick={() => onMove(account.id, -1)}>
          Retirar
        </button>
      </td>
    </tr>
  );
});

/** Fila del libro de movimientos. */
const MovementRow = memo(function MovementRow({
  movement,
  accountName,
}: {
  movement: Movement;
  accountName: string;
}) {
  const inEntry = movement.direction === "entrada";
  return (
    <tr>
      <td className="dim" style={{ whiteSpace: "nowrap" }}>{when(movement.at)}</td>
      <td>{accountName}</td>
      <td>{inEntry ? "Entrada" : "Salida"}</td>
      <td>{movement.origin}</td>
      <td className="muted">{movement.note || "—"}</td>
      <td className="dim">{movement.userId}</td>
      <td className="tabular" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
        {inEntry ? "+" : "−"}
        {formatUsd(movement.amountUsd)}
        {movement.currency && movement.amountInput !== undefined && (
          <div className="dim" style={{ fontSize: "0.72rem" }}>
            {movement.currency === "VES" ? formatBsDirect(movement.amountInput) : formatUsd(movement.amountInput)}
          </div>
        )}
      </td>
    </tr>
  );
});

/** Fila de transferencia. */
const TransferRow = memo(function TransferRow({
  transfer,
  from,
  to,
}: {
  transfer: Transfer;
  from: string;
  to: string;
}) {
  return (
    <tr>
      <td className="dim" style={{ whiteSpace: "nowrap" }}>{when(transfer.at)}</td>
      <td>{from}</td>
      <td>{to}</td>
      <td className="tabular" style={{ textAlign: "right" }}>{formatUsd(transfer.amountUsd)}</td>
      <td className="tabular" style={{ textAlign: "right" }}>
        {transfer.commission ? formatUsd(transfer.commission) : "—"}
      </td>
      <td className="muted">{transfer.note || "—"}</td>
    </tr>
  );
});

/** Fila de cierre de caja. */
const ClosureRow = memo(function ClosureRow({ closure }: { closure: CashClosure }) {
  const diff = closure.differenceUsd;
  const balanced = Math.abs(diff) < 0.01;
  return (
    <tr>
      <td className="dim" style={{ whiteSpace: "nowrap" }}>{when(closure.closedAt)}</td>
      <td className="tabular" style={{ textAlign: "right" }}>
        {closure.openingUsd !== undefined ? formatUsd(closure.openingUsd) : "—"}
      </td>
      <td className="tabular" style={{ textAlign: "right" }}>{formatUsd(closure.expectedUsd)}</td>
      <td className="tabular" style={{ textAlign: "right" }}>{formatUsd(closure.countedUsd)}</td>
      <td className="tabular" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
        {formatUsd(diff)}
        <div className="dim" style={{ fontSize: "0.72rem" }}>{formatBsDirect(closure.differenceBs)}</div>
      </td>
      <td>
        {balanced ? <Badge tone="success" icon="check">Cuadra</Badge> : <Badge>{diff > 0 ? "Sobra" : "Falta"}</Badge>}
      </td>
      <td className="muted">{closure.note || "—"}</td>
    </tr>
  );
});

/** Fila de pendiente (cuenta por cobrar/pagar). */
const PendingRow = memo(function PendingRow({
  pending,
  onAbono,
  onVoid,
}: {
  pending: Pending;
  onAbono: (id: string) => void;
  onVoid: (id: string) => void;
}) {
  const saldo = round2(pending.amountUsd - pending.paidUsd);
  const closed = pending.status === "saldado" || pending.status === "anulado";
  return (
    <tr style={pending.status === "anulado" ? { opacity: 0.5 } : undefined}>
      <td className="dim" style={{ whiteSpace: "nowrap" }}>{when(pending.at)}</td>
      <td className="dim" style={{ whiteSpace: "nowrap" }}>
        {pending.dueAt ? new Date(pending.dueAt).toLocaleDateString() : "—"}
      </td>
      <td>{pending.direction === "cobrar" ? "Por cobrar" : "Por pagar"}</td>
      <td>
        {pending.contactName || "—"}
        <div className="dim" style={{ fontSize: "0.72rem" }}>{pending.subject}</div>
      </td>
      <td className="tabular" style={{ textAlign: "right" }}>{formatUsd(pending.amountUsd)}</td>
      <td className="tabular" style={{ textAlign: "right" }}>{formatUsd(pending.paidUsd)}</td>
      <td className="tabular" style={{ textAlign: "right", fontWeight: 600 }}>{formatUsd(saldo)}</td>
      <td>
        <Badge tone={pending.status === "saldado" ? "success" : "neutral"}>
          {pending.status === "abierto"
            ? "Abierto"
            : pending.status === "parcial"
              ? "Parcial"
              : pending.status === "saldado"
                ? "Saldado"
                : "Anulado"}
        </Badge>
      </td>
      <td className="row gap-4">
        {!closed && (
          <button className="btn btn--soft btn--sm" onClick={() => onAbono(pending.id)}>
            Abonar
          </button>
        )}
        {!closed && (
          <button className="btn btn--ghost btn--sm" onClick={() => onVoid(pending.id)}>
            Anular
          </button>
        )}
      </td>
    </tr>
  );
});

/** Fila de gasto. */
const ExpenseRow = memo(function ExpenseRow({
  expense,
  accountName,
  onPay,
  onVoid,
}: {
  expense: Expense;
  accountName: string;
  onPay: (id: string) => void;
  onVoid: (id: string) => void;
}) {
  const state = expense.anulado ? "Anulado" : expense.paid ? "Pagado" : "Pendiente";
  return (
    <tr style={expense.anulado ? { opacity: 0.5 } : undefined}>
      <td className="dim" style={{ whiteSpace: "nowrap" }}>{new Date(expense.at).toLocaleDateString()}</td>
      <td>
        {expense.name}
        {expense.recurring && (
          <div className="dim" style={{ fontSize: "0.72rem" }}>Recurrente</div>
        )}
      </td>
      <td>{expense.category}</td>
      <td className="muted">{expense.note || "—"}</td>
      <td className="tabular" style={{ textAlign: "right" }}>{formatUsd(expense.amountUsd)}</td>
      <td>{expense.paid ? accountName : "—"}</td>
      <td>
        <Badge tone={expense.paid && !expense.anulado ? "success" : "neutral"}>{state}</Badge>
      </td>
      <td className="row gap-4">
        {!expense.paid && !expense.anulado && (
          <button className="btn btn--soft btn--sm" onClick={() => onPay(expense.id)}>
            Pagar
          </button>
        )}
        {!expense.anulado && (
          <button className="btn btn--ghost btn--sm" onClick={() => onVoid(expense.id)}>
            Anular
          </button>
        )}
      </td>
    </tr>
  );
});

/** Fila de gasto recurrente. */
const RecurringRow = memo(function RecurringRow({
  recurring,
  categoryName,
  onRemove,
}: {
  recurring: RecurringExpense;
  categoryName: string;
  onRemove: (id: string) => void;
}) {
  return (
    <tr>
      <td style={{ fontWeight: 600 }}>{recurring.name}</td>
      <td>{categoryName || "—"}</td>
      <td className="tabular" style={{ textAlign: "right" }}>{formatUsd(recurring.amountUsd)}</td>
      <td>Mensual · día {new Date(recurring.firstDue).getDate()}</td>
      <td>
        {recurring.lastGenerated ? (
          <span className="dim">Generado {dayLabel(recurring.lastGenerated)}</span>
        ) : (
          <span className="dim">Sin generar</span>
        )}
      </td>
      <td>
        <button className="btn btn--ghost btn--sm" onClick={() => onRemove(recurring.id)}>
          Quitar
        </button>
      </td>
    </tr>
  );
});

/** Fila de categoría de gasto. */
const CategoryRow = memo(function CategoryRow({
  category,
  onToggle,
}: {
  category: ExpenseCategory;
  onToggle: (id: string, active: boolean) => void;
}) {
  return (
    <tr>
      <td style={{ fontWeight: 600 }}>{category.name}</td>
      <td>
        {category.system ? (
          <Badge>Sistema</Badge>
        ) : (
          <label className="row gap-8">
            <input
              type="checkbox"
              checked={category.active}
              onChange={(e) => onToggle(category.id, e.target.checked)}
            />
            {category.active ? "Activa" : "Inactiva"}
          </label>
        )}
      </td>
    </tr>
  );
});

/* --- Página ----------------------------------------------------- */

export function Finanzas() {
  const { state } = useStoreState();
  const {
    addAccount,
    moveAccount,
    transfer,
    addExpense,
    payExpense,
    voidExpense,
    addPending,
    abonoPending,
    voidPending,
    addExpenseCategory,
    updateExpenseCategory,
    addRecurringExpense,
    removeRecurringExpense,
    runRecurring,
  } = useStoreActions();

  const rate = state.rate;
  const [tab, setTab] = useState<Tab>("Cuentas");

  const accountName = useCallback(
    (id?: string) => (id ? state.accounts.find((a) => a.id === id)?.name ?? "—" : "—"),
    [state.accounts]
  );

  /* Cuentas */
  const [accOpen, setAccOpen] = useState(false);
  const [accForm, setAccForm] = useState({
    name: "",
    type: "efectivo" as "efectivo" | "banco" | "pago_movil",
    currency: "USD" as "USD" | "VES",
    commissionIn: "0",
    commissionOut: "0",
  });

  const [moveOpen, setMoveOpen] = useState(false);
  const [moveId, setMoveId] = useState("");
  const [moveAmount, setMoveAmount] = useState("0");
  const [moveSign, setMoveSign] = useState<1 | -1>(1);

  /* Gastos */
  const [expOpen, setExpOpen] = useState(false);
  const [expForm, setExpForm] = useState({
    name: "",
    category: "",
    note: "",
    amountUsd: "0",
    recurring: false,
    paid: false,
    accountId: "",
  });
  const [payId, setPayId] = useState<string | null>(null);
  const [payAccount, setPayAccount] = useState("");

  /* Transferencias */
  const [trfOpen, setTrfOpen] = useState(false);
  const [trfForm, setTrfForm] = useState({
    fromId: "",
    toId: "",
    amountUsd: "0",
    commission: "0",
    note: "",
  });

  /* Pendientes */
  const [pendOpen, setPendOpen] = useState(false);
  const [pendForm, setPendForm] = useState({
    direction: "cobrar" as "cobrar" | "pagar",
    contactId: "",
    subject: "",
    amountUsd: "0",
    dueAt: "",
    note: "",
  });
  const [abonoId, setAbonoId] = useState<string | null>(null);
  const [abonoAccount, setAbonoAccount] = useState("");
  const [abonoAmount, setAbonoAmount] = useState("0");

  /* Categorías de gasto */
  const [catName, setCatName] = useState("");

  /* Gastos recurrentes */
  const [recurOpen, setRecurOpen] = useState(false);
  const [recurForm, setRecurForm] = useState({
    name: "",
    categoryId: "",
    amountUsd: "0",
    firstDue: new Date().toISOString().slice(0, 10),
  });

  /* Filtro de movimientos */
  const [movAccount, setMovAccount] = useState("");

  const movements = useMemo(
    () => (movAccount ? state.movements.filter((m) => m.accountId === movAccount) : state.movements),
    [state.movements, movAccount]
  );

  const { total, bsConserved } = useMemo(
    () => ({
      total: round2(
        state.accounts.reduce((a, x) => a + (x.currency === "USD" ? x.balance : x.balance / rate), 0)
      ),
      bsConserved: round2(
        state.accounts.filter((a) => a.currency === "VES").reduce((a, x) => a + x.balance, 0)
      ),
    }),
    [state.accounts, rate]
  );

  const openMove = useCallback((id: string, sign: 1 | -1) => {
    setMoveId(id);
    setMoveSign(sign);
    setMoveAmount("0");
    setMoveOpen(true);
  }, []);

  const openExpense = useCallback(() => {
    setExpForm({
      name: "",
      category: state.expenseCategories.find((c) => c.active)?.name ?? "Operativo",
      note: "",
      amountUsd: "0",
      recurring: false,
      paid: false,
      accountId: state.accounts[0]?.id ?? "",
    });
    setExpOpen(true);
  }, [state.expenseCategories, state.accounts]);

  const openPay = useCallback(
    (id: string) => {
      setPayId(id);
      setPayAccount(state.accounts[0]?.id ?? "");
    },
    [state.accounts]
  );

  const openTransfer = useCallback(() => {
    setTrfForm({
      fromId: state.accounts[0]?.id ?? "",
      toId: state.accounts[1]?.id ?? "",
      amountUsd: "0",
      commission: "0",
      note: "",
    });
    setTrfOpen(true);
  }, [state.accounts]);

  const openPending = useCallback(() => {
    setPendForm({
      direction: "cobrar",
      contactId: "",
      subject: "",
      amountUsd: "0",
      dueAt: "",
      note: "",
    });
    setPendOpen(true);
  }, []);

  const openAbono = useCallback(
    (id: string) => {
      const p = state.pendings.find((x) => x.id === id);
      setAbonoId(id);
      setAbonoAccount(state.accounts[0]?.id ?? "");
      setAbonoAmount(String(round2((p?.amountUsd ?? 0) - (p?.paidUsd ?? 0))));
    },
    [state.pendings, state.accounts]
  );

  const handleVoidPending = useCallback((id: string) => voidPending(id), [voidPending]);
  const handleVoidExpense = useCallback((id: string) => voidExpense(id), [voidExpense]);
  const handleRemoveRecurring = useCallback((id: string) => removeRecurringExpense(id), [removeRecurringExpense]);

  const activeCategories = useMemo(
    () => state.expenseCategories.filter((c) => c.active),
    [state.expenseCategories]
  );

  const abonoPendingObj = abonoId ? state.pendings.find((p) => p.id === abonoId) : undefined;
  const payExpenseObj = payId ? state.expenses.find((e) => e.id === payId) : undefined;

  return (
    <div className="stack gap-16">
      <PageHead
        title="Finanzas"
        subtitle="Dónde entra y sale tu dinero: efectivo, bancos, pagos móviles y créditos."
        actions={
          <>
            <button className="btn btn--ghost" onClick={openExpense}>
              Nuevo gasto
            </button>
            <button className="btn btn--primary" onClick={() => setAccOpen(true)}>
              Nueva cuenta
            </button>
          </>
        }
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {/* ---------------- Cuentas ---------------- */}
      {tab === "Cuentas" && (
        <>
          <div className="kpis">
            <Card flat>
              <div className="kpi__label">Total consolidado</div>
              <Money usd={total} rate={rate} />
            </Card>
            <Card flat>
              <div className="kpi__label">Bolívares conservados</div>
              <div className="kpi__value">{formatBsDirect(bsConserved)}</div>
              <div className="kpi__hint">equivale a {formatUsd(round2(bsConserved / rate))} a la tasa oficial</div>
            </Card>
            <Card flat>
              <div className="kpi__label">Tasa oficial</div>
              <div className="kpi__value" style={{ fontSize: "1.3rem" }}>{formatRate(rate)}</div>
              <div className="kpi__hint">por USD</div>
            </Card>
          </div>

          {state.accounts.length === 0 ? (
            <EmptyState
              title="Sin cuentas"
              hint="Crea una cuenta para registrar entradas y salidas de dinero."
              action={
                <button className="btn btn--soft btn--sm" onClick={() => setAccOpen(true)}>
                  Nueva cuenta
                </button>
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Moneda</th>
                    <th style={{ textAlign: "right" }}>Saldo</th>
                    <th>Estado</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {state.accounts.map((a) => (
                    <AccountRow key={a.id} account={a} rate={rate} onMove={openMove} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ---------------- Movimientos ---------------- */}
      {tab === "Movimientos" && (
        <>
          <div className="row gap-8" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
            <Field label="Cuenta">
              <select className="select" value={movAccount} onChange={(e) => setMovAccount(e.target.value)}>
                <option value="">Todas las cuentas</option>
                {state.accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </Field>
          </div>

          {movements.length === 0 ? (
            <EmptyState
              title="Sin movimientos"
              hint="Cada cobro, gasto, ajuste o transferencia aparece aquí como un asiento."
            />
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cuenta</th>
                    <th>Tipo</th>
                    <th>Origen</th>
                    <th>Nota</th>
                    <th>Usuario</th>
                    <th style={{ textAlign: "right" }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <MovementRow key={m.id} movement={m} accountName={accountName(m.accountId)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ---------------- Transferencias ---------------- */}
      {tab === "Transferencias" && (
        <>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button
              className="btn btn--primary btn--sm"
              onClick={openTransfer}
              disabled={state.accounts.length < 2}
            >
              Nueva transferencia
            </button>
          </div>

          {state.accounts.length < 2 && (
            <EmptyState
              title="Necesitas dos cuentas"
              hint="Las transferencias mueven dinero de una cuenta a otra. Crea al menos dos."
            />
          )}

          {state.transfers.length > 0 && (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Desde</th>
                    <th>Hacia</th>
                    <th style={{ textAlign: "right" }}>Monto</th>
                    <th style={{ textAlign: "right" }}>Comisión</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {state.transfers.map((t) => (
                    <TransferRow
                      key={t.id}
                      transfer={t}
                      from={accountName(t.fromId)}
                      to={accountName(t.toId)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {state.transfers.length === 0 && state.accounts.length >= 2 && (
            <EmptyState
              title="Sin transferencias"
              hint="Registra movimientos entre tus cuentas, con comisión si aplica."
            />
          )}
        </>
      )}

      {/* ---------------- Pendientes ---------------- */}
      {tab === "Pendientes" && (
        <>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn btn--primary btn--sm" onClick={openPending}>
              Nuevo pendiente
            </button>
          </div>

          {state.pendings.length === 0 ? (
            <EmptyState
              title="Sin cuentas por cobrar ni por pagar"
              hint="Las ventas a crédito del POS aparecen aquí automáticamente. También puedes crear pendientes manuales."
            />
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Vence</th>
                    <th>Dirección</th>
                    <th>Contacto</th>
                    <th style={{ textAlign: "right" }}>Monto</th>
                    <th style={{ textAlign: "right" }}>Abonado</th>
                    <th style={{ textAlign: "right" }}>Saldo</th>
                    <th>Estado</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {state.pendings.map((p) => (
                    <PendingRow
                      key={p.id}
                      pending={p}
                      onAbono={openAbono}
                      onVoid={handleVoidPending}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ---------------- Gastos ---------------- */}
      {tab === "Gastos" && (
        <>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn btn--primary btn--sm" onClick={openExpense}>
              Nuevo gasto
            </button>
          </div>

          {state.expenses.length === 0 ? (
            <EmptyState
              title="Sin gastos"
              hint="Registra tus gastos para conocer tu utilidad real."
              action={
                <button className="btn btn--soft btn--sm" onClick={openExpense}>
                  Nuevo gasto
                </button>
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Nota</th>
                    <th style={{ textAlign: "right" }}>Monto</th>
                    <th>Cuenta</th>
                    <th>Estado</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {state.expenses.map((e) => (
                    <ExpenseRow
                      key={e.id}
                      expense={e}
                      accountName={accountName(e.accountId)}
                      onPay={openPay}
                      onVoid={handleVoidExpense}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ---------------- Gastos recurrentes ---------------- */}
      {tab === "Gastos recurrentes" && (
        <>
          <div className="row gap-8" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn--ghost btn--sm" onClick={runRecurring}>
              Generar vencidos
            </button>
            <button
              className="btn btn--primary btn--sm"
              onClick={() => {
                setRecurForm({
                  name: "",
                  categoryId: state.expenseCategories.find((c) => c.active)?.id ?? "",
                  amountUsd: "0",
                  firstDue: new Date().toISOString().slice(0, 10),
                });
                setRecurOpen(true);
              }}
            >
              Nuevo recurrente
            </button>
          </div>

          {state.recurringExpenses.length === 0 ? (
            <EmptyState
              title="Sin gastos recurrentes"
              hint="Alquiler, servicios y suscripciones fijas. Al vencer generan un gasto pendiente, sin mover dinero."
            />
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th style={{ textAlign: "right" }}>Monto</th>
                    <th>Frecuencia</th>
                    <th>Último</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {state.recurringExpenses.map((r) => (
                    <RecurringRow
                      key={r.id}
                      recurring={r}
                      categoryName={state.expenseCategories.find((c) => c.id === r.categoryId)?.name ?? ""}
                      onRemove={handleRemoveRecurring}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ---------------- Categorías de gasto ---------------- */}
      {tab === "Categorías de gasto" && (
        <>
          <div className="row gap-8" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
            <Field label="Nueva categoría">
              <input
                className="input"
                value={catName}
                placeholder="Ej.: Marketing"
                onChange={(e) => setCatName(e.target.value)}
              />
            </Field>
            <button
              className="btn btn--primary btn--sm"
              style={{ marginBottom: "0.5rem" }}
              disabled={!catName.trim()}
              onClick={() => {
                addExpenseCategory(catName.trim());
                setCatName("");
              }}
            >
              Agregar
            </button>
          </div>

          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {state.expenseCategories.map((c) => (
                  <CategoryRow
                    key={c.id}
                    category={c}
                    onToggle={(id, active) => updateExpenseCategory(id, { active })}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <p className="dim" style={{ fontSize: "0.8rem" }}>
            La categoría de impuestos (IVA/IGTF) es del sistema y no puede desactivarse.
          </p>
        </>
      )}

      {/* ---------------- Cierres de caja ---------------- */}
      {tab === "Cierres de caja" && (
        <>
          {state.cashClosures.length === 0 ? (
            <EmptyState
              title="Sin cierres registrados"
              hint="Cada arqueo que hagas desde la barra superior queda guardado aquí."
            />
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Cierre</th>
                    <th style={{ textAlign: "right" }}>Fondo</th>
                    <th style={{ textAlign: "right" }}>Esperado</th>
                    <th style={{ textAlign: "right" }}>Contado</th>
                    <th style={{ textAlign: "right" }}>Diferencia</th>
                    <th>Estado</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {state.cashClosures.map((c) => (
                    <ClosureRow key={c.id} closure={c} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ================= Modales ================= */}

      {accOpen && (
        <Modal title="Nueva cuenta" onClose={() => setAccOpen(false)}>
          <Field label="Nombre" required>
            <input className="input" value={accForm.name} onChange={(e) => setAccForm({ ...accForm, name: e.target.value })} />
          </Field>
          <Field label="Tipo">
            <select
              className="select"
              value={accForm.type}
              onChange={(e) => setAccForm({ ...accForm, type: e.target.value as typeof accForm.type })}
            >
              <option value="efectivo">Efectivo</option>
              <option value="banco">Banco</option>
              <option value="pago_movil">Pago móvil</option>
            </select>
          </Field>
          <Field label="Moneda">
            <select
              className="select"
              value={accForm.currency}
              onChange={(e) => setAccForm({ ...accForm, currency: e.target.value as typeof accForm.currency })}
            >
              <option value="USD">USD</option>
              <option value="VES">VES (Bs)</option>
            </select>
          </Field>
          <div className="row gap-8">
            <Field label="Comisión al recibir (%)" hint="0 si no aplica">
              <input
                className="input"
                type="number"
                value={accForm.commissionIn}
                onChange={(e) => setAccForm({ ...accForm, commissionIn: e.target.value })}
              />
            </Field>
            <Field label="Comisión al enviar (%)" hint="0 si no aplica">
              <input
                className="input"
                type="number"
                value={accForm.commissionOut}
                onChange={(e) => setAccForm({ ...accForm, commissionOut: e.target.value })}
              />
            </Field>
          </div>
          <button
            className="btn btn--primary btn--block"
            disabled={!accForm.name.trim()}
            onClick={() => {
              addAccount({
                name: accForm.name.trim(),
                type: accForm.type,
                currency: accForm.currency,
                balance: 0,
                commissionIn: Number(accForm.commissionIn) || 0,
                commissionOut: Number(accForm.commissionOut) || 0,
                active: true,
              });
              setAccOpen(false);
            }}
          >
            Crear cuenta
          </button>
        </Modal>
      )}

      {moveOpen && (
        <Modal title="Movimiento de cuenta" onClose={() => setMoveOpen(false)}>
          <Field label={`Monto (${moveSign === 1 ? "entrada" : "salida"})`}>
            <input
              className="input"
              type="number"
              value={moveAmount}
              onChange={(e) => setMoveAmount(e.target.value)}
            />
          </Field>
          <div className="breakdown">
            <div className="breakdown__row breakdown__row--strong">
              <span>{moveSign === 1 ? "Entrada" : "Salida"}</span>
              <span className="tabular">{formatUsd(Number(moveAmount) || 0)}</span>
            </div>
          </div>
          <button
            className="btn btn--primary btn--block"
            style={{ marginTop: "1rem" }}
            onClick={() => {
              const amount = Number(moveAmount) || 0;
              moveAccount(
                moveId,
                moveSign * amount,
                moveSign === 1 ? `Ingreso manual · ${formatUsd(amount)}` : `Retiro manual · ${formatUsd(amount)}`
              );
              setMoveOpen(false);
            }}
          >
            Confirmar
          </button>
        </Modal>
      )}

      {expOpen && (
        <Modal title="Nuevo gasto" onClose={() => setExpOpen(false)}>
          <Field label="Nombre" required hint="Ej.: alquiler de octubre">
            <input className="input" value={expForm.name} onChange={(e) => setExpForm({ ...expForm, name: e.target.value })} />
          </Field>
          <Field label="Categoría">
            <select
              className="select"
              value={expForm.category}
              onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
            >
              {activeCategories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
              {!activeCategories.some((c) => c.name === expForm.category) && expForm.category && (
                <option value={expForm.category}>{expForm.category}</option>
              )}
            </select>
          </Field>
          <Field label="Nota">
            <input className="input" value={expForm.note} onChange={(e) => setExpForm({ ...expForm, note: e.target.value })} />
          </Field>
          <Field label="Monto (USD)">
            <input className="input" type="number" value={expForm.amountUsd} onChange={(e) => setExpForm({ ...expForm, amountUsd: e.target.value })} />
          </Field>
          <label className="row gap-8" style={{ marginBottom: "0.75rem" }}>
            <input
              type="checkbox"
              checked={expForm.paid}
              onChange={(e) => setExpForm({ ...expForm, paid: e.target.checked })}
            />
            Pagado ahora (crea el gasto y lo paga en un solo paso)
          </label>
          {expForm.paid && (
            <Field label="Cuenta de pago" required>
              <select
                className="select"
                value={expForm.accountId}
                onChange={(e) => setExpForm({ ...expForm, accountId: e.target.value })}
              >
                {state.accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} · {a.currency}</option>
                ))}
              </select>
            </Field>
          )}
          <button
            className="btn btn--primary btn--block"
            disabled={!expForm.name.trim() || (expForm.paid && !expForm.accountId)}
            onClick={() => {
              addExpense({
                name: expForm.name.trim(),
                category: expForm.category || "Operativo",
                note: expForm.note,
                amountUsd: Math.max(0, Number(expForm.amountUsd) || 0),
                recurring: expForm.recurring,
                paid: expForm.paid,
                accountId: expForm.paid ? expForm.accountId : undefined,
              });
              setExpOpen(false);
            }}
          >
            Guardar gasto
          </button>
        </Modal>
      )}

      {payExpenseObj && (
        <Modal title="Pagar gasto" onClose={() => setPayId(null)}>
          <div className="breakdown">
            <div className="breakdown__row">
              <span>{payExpenseObj.name}</span>
              <span className="tabular">{formatUsd(payExpenseObj.amountUsd)}</span>
            </div>
            <div className="breakdown__row breakdown__row--strong">
              <span>Total a pagar</span>
              <span className="tabular">{formatUsd(payExpenseObj.amountUsd)}</span>
            </div>
          </div>
          <Field label="Cuenta de pago" required>
            <select className="select" value={payAccount} onChange={(e) => setPayAccount(e.target.value)}>
              {state.accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} · {a.currency}</option>
              ))}
            </select>
          </Field>
          <button
            className="btn btn--primary btn--block"
            disabled={!payAccount}
            onClick={() => {
              if (payId) payExpense(payId, payAccount, "");
              setPayId(null);
            }}
          >
            Pagar desde la cuenta
          </button>
        </Modal>
      )}

      {trfOpen && (
        <Modal title="Nueva transferencia" onClose={() => setTrfOpen(false)}>
          <Field label="Desde" required>
            <select
              className="select"
              value={trfForm.fromId}
              onChange={(e) => setTrfForm({ ...trfForm, fromId: e.target.value })}
            >
              {state.accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} · {a.currency}</option>
              ))}
            </select>
          </Field>
          <Field label="Hacia" required>
            <select
              className="select"
              value={trfForm.toId}
              onChange={(e) => setTrfForm({ ...trfForm, toId: e.target.value })}
            >
              {state.accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} · {a.currency}</option>
              ))}
            </select>
          </Field>
          <div className="row gap-8">
            <Field label="Monto (USD)">
              <input
                className="input"
                type="number"
                value={trfForm.amountUsd}
                onChange={(e) => setTrfForm({ ...trfForm, amountUsd: e.target.value })}
              />
            </Field>
            <Field label="Comisión (USD)">
              <input
                className="input"
                type="number"
                value={trfForm.commission}
                onChange={(e) => setTrfForm({ ...trfForm, commission: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Nota">
            <input
              className="input"
              value={trfForm.note}
              onChange={(e) => setTrfForm({ ...trfForm, note: e.target.value })}
            />
          </Field>
          {trfForm.fromId === trfForm.toId && (
            <p className="dim" style={{ fontSize: "0.8rem" }}>Elige cuentas distintas.</p>
          )}
          <button
            className="btn btn--primary btn--block"
            disabled={
              !trfForm.fromId ||
              !trfForm.toId ||
              trfForm.fromId === trfForm.toId ||
              (Number(trfForm.amountUsd) || 0) <= 0
            }
            onClick={() => {
              transfer(
                trfForm.fromId,
                trfForm.toId,
                Number(trfForm.amountUsd) || 0,
                Number(trfForm.commission) || 0,
                trfForm.note
              );
              setTrfOpen(false);
            }}
          >
            Transferir
          </button>
        </Modal>
      )}

      {pendOpen && (
        <Modal title="Nuevo pendiente" onClose={() => setPendOpen(false)}>
          <Field label="Dirección">
            <select
              className="select"
              value={pendForm.direction}
              onChange={(e) => setPendForm({ ...pendForm, direction: e.target.value as typeof pendForm.direction })}
            >
              <option value="cobrar">Por cobrar (me deben)</option>
              <option value="pagar">Por pagar (yo debo)</option>
            </select>
          </Field>
          <Field label="Contacto">
            <select
              className="select"
              value={pendForm.contactId}
              onChange={(e) => setPendForm({ ...pendForm, contactId: e.target.value })}
            >
              <option value="">Sin contacto</option>
              {state.contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Concepto" required hint="Ej.: Préstamo, mercancía, servicio">
            <input
              className="input"
              value={pendForm.subject}
              onChange={(e) => setPendForm({ ...pendForm, subject: e.target.value })}
            />
          </Field>
          <Field label="Monto (USD)">
            <input
              className="input"
              type="number"
              value={pendForm.amountUsd}
              onChange={(e) => setPendForm({ ...pendForm, amountUsd: e.target.value })}
            />
          </Field>
          <Field label="Vence">
            <input
              className="input"
              type="date"
              value={pendForm.dueAt}
              onChange={(e) => setPendForm({ ...pendForm, dueAt: e.target.value })}
            />
          </Field>
          <Field label="Nota">
            <input
              className="input"
              value={pendForm.note}
              onChange={(e) => setPendForm({ ...pendForm, note: e.target.value })}
            />
          </Field>
          <button
            className="btn btn--primary btn--block"
            disabled={!pendForm.subject.trim() || (Number(pendForm.amountUsd) || 0) <= 0}
            onClick={() => {
              const contact = state.contacts.find((c) => c.id === pendForm.contactId);
              addPending({
                direction: pendForm.direction,
                contactId: pendForm.contactId || undefined,
                contactName: contact?.name,
                subject: pendForm.subject.trim(),
                amountUsd: Number(pendForm.amountUsd) || 0,
                dueAt: pendForm.dueAt
                  ? new Date(`${pendForm.dueAt}T00:00:00`).toISOString()
                  : undefined,
                note: pendForm.note,
              });
              setPendOpen(false);
            }}
          >
            Guardar pendiente
          </button>
        </Modal>
      )}

      {abonoPendingObj && (
        <Modal title="Abonar a pendiente" onClose={() => setAbonoId(null)}>
          <div className="breakdown">
            <div className="breakdown__row">
              <span>{abonoPendingObj.subject}</span>
              <span className="tabular">
                {formatUsd(round2(abonoPendingObj.amountUsd - abonoPendingObj.paidUsd))}
              </span>
            </div>
            <div className="breakdown__row breakdown__row--strong">
              <span>Saldo pendiente</span>
              <span className="tabular">
                {formatUsd(round2(abonoPendingObj.amountUsd - abonoPendingObj.paidUsd))}
              </span>
            </div>
          </div>
          <Field
            label={abonoPendingObj.direction === "cobrar" ? "Monto a recibir (USD)" : "Monto a pagar (USD)"}
          >
            <input
              className="input"
              type="number"
              value={abonoAmount}
              onChange={(e) => setAbonoAmount(e.target.value)}
            />
          </Field>
          <Field
            label={abonoPendingObj.direction === "cobrar" ? "Cuenta que recibe" : "Cuenta que paga"}
            required
          >
            <select className="select" value={abonoAccount} onChange={(e) => setAbonoAccount(e.target.value)}>
              {state.accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} · {a.currency}</option>
              ))}
            </select>
          </Field>
          <button
            className="btn btn--primary btn--block"
            disabled={!abonoAccount || (Number(abonoAmount) || 0) <= 0}
            onClick={() => {
              if (abonoId) abonoPending(abonoId, abonoAccount, Number(abonoAmount) || 0, "");
              setAbonoId(null);
            }}
          >
            Registrar abono
          </button>
        </Modal>
      )}

      {recurOpen && (
        <Modal title="Nuevo gasto recurrente" onClose={() => setRecurOpen(false)}>
          <Field label="Nombre" required hint="Ej.: Alquiler local">
            <input className="input" value={recurForm.name} onChange={(e) => setRecurForm({ ...recurForm, name: e.target.value })} />
          </Field>
          <Field label="Categoría">
            <select
              className="select"
              value={recurForm.categoryId}
              onChange={(e) => setRecurForm({ ...recurForm, categoryId: e.target.value })}
            >
              {activeCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Monto (USD)">
            <input
              className="input"
              type="number"
              value={recurForm.amountUsd}
              onChange={(e) => setRecurForm({ ...recurForm, amountUsd: e.target.value })}
            />
          </Field>
          <Field label="Primer vencimiento" hint="El gasto se generará cada mes en este día">
            <input
              className="input"
              type="date"
              value={recurForm.firstDue}
              onChange={(e) => setRecurForm({ ...recurForm, firstDue: e.target.value })}
            />
          </Field>
          <button
            className="btn btn--primary btn--block"
            disabled={!recurForm.name.trim() || (Number(recurForm.amountUsd) || 0) <= 0}
            onClick={() => {
              addRecurringExpense({
                name: recurForm.name.trim(),
                categoryId: recurForm.categoryId,
                amountUsd: Number(recurForm.amountUsd) || 0,
                frequency: "mensual",
                firstDue: new Date(`${recurForm.firstDue}T00:00:00`).toISOString(),
                active: true,
              });
              setRecurOpen(false);
            }}
          >
            Guardar recurrente
          </button>
        </Modal>
      )}
    </div>
  );
}
