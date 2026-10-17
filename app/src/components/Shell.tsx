// Shell de la aplicación: topbar + sidebar + contenedor de página.
import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { formatBsDirect, formatRate, formatUsd, round2 } from "../lib/money";
import { expectedCash } from "../lib/metrics";
import { Field, Modal } from "./ui";
import { Icon, type IconName } from "./Icon";
import type { BusinessFeatures } from "../lib/types";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  sub?: { to: string; label: string }[];
  feature?: keyof BusinessFeatures;
}

const NAV: NavItem[] = [
  { to: "/inicio", label: "Inicio", icon: "home" },
  {
    to: "/ventas",
    label: "Ventas",
    icon: "cart",
    sub: [
      { to: "/ventas", label: "Vender" },
      { to: "/ventas/historial", label: "Historial" },
    ],
  },
  { to: "/catalogo", label: "Catálogo", icon: "tag" },
  { to: "/inventario", label: "Inventario", icon: "box", feature: "inventory" },
  { to: "/contactos", label: "Contactos", icon: "users", feature: "providers" },
  { to: "/finanzas", label: "Finanzas", icon: "wallet", feature: "expenses" },
  { to: "/informes", label: "Informes", icon: "chart", feature: "reports" },
  { to: "/ajustes", label: "Ajustes", icon: "settings" },
];

export function Shell({ children }: { children: ReactNode }) {
  const { state, user, logout, openCash, closeCash } = useStore();
  const nav = useNavigate();
  const [cashOpen, setCashOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [usd, setUsd] = useState("0");
  const [bs, setBs] = useState("0");
  const [closeOpen, setCloseOpen] = useState(false);
  const [cUsd, setCUsd] = useState("0");
  const [cBs, setCBs] = useState("0");
  const [cNote, setCNote] = useState("");

  const features = state.business.features;
  const visibleNav = NAV.filter((item) => !item.feature || features[item.feature]);
  const displayName =
    user && (user.firstName || user.lastName)
      ? [user.firstName, user.lastName].filter(Boolean).join(" ")
      : user?.email ?? "";

  const session = state.cashSession;
  const expected = session ? expectedCash(state) : { usd: 0, bs: 0 };
  const countedUsd = Number(cUsd) || 0;
  const countedBs = Number(cBs) || 0;
  const diffUsd = round2(countedUsd - expected.usd);
  const diffBs = round2(countedBs - expected.bs);
  const hasDiff = diffUsd !== 0 || diffBs !== 0;

  return (
    <div className={"shell" + (navOpen ? " shell--nav-open" : "")}>
      <aside className="shell__sidebar">
        <div className="sidenav__brand">
          <span className="brand brand--lg">
            <span className="brand__blink">BLINK</span> POS
          </span>
        </div>

        <div className="nav-group">Principal</div>
        <nav className="nav">
          {visibleNav.map((item) => (
            <div key={item.to}>
              <NavLink
                to={item.to}
                end={!!item.sub}
                onClick={() => setNavOpen(false)}
                className={({ isActive }) =>
                  isActive && !item.sub ? "nav__link active" : "nav__link"
                }
              >
                <span className="nav__icon" aria-hidden>
                  <Icon name={item.icon} />
                </span>
                {item.label}
              </NavLink>
              {item.sub && (
                <div className="nav__sub">
                  {item.sub.map((s) => (
                    <NavLink
                      key={s.label}
                      to={s.to}
                      end={s.label === "Vender"}
                      onClick={() => setNavOpen(false)}
                      className={({ isActive }) =>
                        isActive ? "nav__link active" : "nav__link"
                      }
                    >
                      {s.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <button className="btn btn--ghost btn--sm" onClick={() => { setNavOpen(false); void logout(); nav("/entrar"); }}>
          <Icon name="logout" />
          Cerrar sesión
        </button>
      </aside>

      {navOpen && <div className="shell__scrim" onClick={() => setNavOpen(false)} />}

      <header className="shell__topbar">
        <button
          className="shell__menu"
          onClick={() => setNavOpen((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={navOpen}
        >
          <Icon name={navOpen ? "close" : "menu"} />
        </button>
        <strong className="topbar__name">{state.business.name}</strong>
        <span className="rate-chip rate-chip--live" title="Tasa de referencia BCV">
          <strong>{formatRate(state.rate)}</strong>
          <span className="rate-chip__suffix"> / $ · BCV</span>
        </span>
        <span className="grow" />
        {session ? (
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => {
              setCUsd(String(session.openingUsd));
              setCBs(String(session.openingBs));
              setCNote("");
              setCloseOpen(true);
            }}
            title={`Abierta ${new Date(session.openedAt).toLocaleTimeString()}`}
          >
            Cerrar caja
          </button>
        ) : (
          <button className="btn btn--soft btn--sm" onClick={() => setCashOpen(true)}>
            Abrir caja
          </button>
        )}
        <div className="userchip">
          <span className="avatar">
            {(displayName || "?").slice(0, 2).toUpperCase()}
          </span>
          <div className="stack" style={{ lineHeight: 1.15 }}>
            <strong style={{ fontSize: "0.8rem" }}>{displayName || "Sesión activa"}</strong>
            <span className="dim" style={{ fontSize: "0.7rem" }}>
              Dueño
            </span>
          </div>
        </div>
      </header>

      <main className="shell__main">
        <div className="page">{children}</div>
      </main>

      {cashOpen && (
        <Modal title="Abrir caja" onClose={() => setCashOpen(false)}>
          <Field label="Fondo inicial (USD)" hint="Efectivo con el que abre la caja.">
            <input
              className="input"
              type="number"
              value={usd}
              onChange={(e) => setUsd(e.target.value)}
            />
          </Field>
          <Field label="Fondo inicial (Bs)">
            <input
              className="input"
              type="number"
              value={bs}
              onChange={(e) => setBs(e.target.value)}
            />
          </Field>
          <button
            className="btn btn--primary btn--block"
            onClick={() => {
              openCash(Number(usd) || 0, Number(bs) || 0);
              setCashOpen(false);
            }}
          >
            Confirmar apertura
          </button>
          <p className="field__hint" style={{ marginTop: "0.6rem" }}>
            Fondo: {formatUsd(Number(usd) || 0)} · {formatBsDirect(Number(bs) || 0)}
          </p>
        </Modal>
      )}

      {closeOpen && session && (
        <Modal title="Cerrar caja (arqueo)" onClose={() => setCloseOpen(false)}>
          <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            Cuenta el efectivo y las bolívares contados para registrar el arqueo y la
            diferencia.
          </p>
          <Field label="Contado (USD)">
            <input
              className="input"
              type="number"
              value={cUsd}
              onChange={(e) => setCUsd(e.target.value)}
            />
          </Field>
          <Field label="Contado (Bs)">
            <input
              className="input"
              type="number"
              value={cBs}
              onChange={(e) => setCBs(e.target.value)}
            />
          </Field>
          <div className="breakdown" style={{ marginTop: "0.75rem" }}>
            <div className="breakdown__row">
              <span>Esperado (USD)</span>
              <span className="tabular">{formatUsd(expected.usd)}</span>
            </div>
            <div className="breakdown__row">
              <span>Contado (USD)</span>
              <span className="tabular">{formatUsd(countedUsd)}</span>
            </div>
            <div className="breakdown__row">
              <span>Esperado (Bs)</span>
              <span className="tabular">{formatBsDirect(expected.bs)}</span>
            </div>
            <div className="breakdown__row">
              <span>Contado (Bs)</span>
              <span className="tabular">{formatBsDirect(countedBs)}</span>
            </div>
            <div className="breakdown__row breakdown__row--strong">
              <span>Diferencia</span>
              <span className="tabular">
                {formatUsd(diffUsd)} · {formatBsDirect(diffBs)}
              </span>
            </div>
          </div>
          {hasDiff && (
            <Field label="Motivo de la diferencia" hint="Obligatorio cuando no cuadra.">
              <input
                className="input"
                value={cNote}
                onChange={(e) => setCNote(e.target.value)}
                placeholder="Ej.: vuelto de más en la mañana"
              />
            </Field>
          )}
          <button
            className="btn btn--primary btn--block"
            style={{ marginTop: "1rem" }}
            disabled={hasDiff && !cNote.trim()}
            onClick={() => {
              closeCash(
                countedUsd,
                countedBs,
                cNote.trim() ||
                  (hasDiff
                    ? `Arqueo de cierre · diferencia ${formatUsd(diffUsd)} / ${formatBsDirect(diffBs)}`
                    : "Arqueo de cierre sin diferencia")
              );
              setCloseOpen(false);
            }}
          >
            Confirmar cierre
          </button>
        </Modal>
      )}
    </div>
  );
}
