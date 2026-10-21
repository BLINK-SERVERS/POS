// Shell de la aplicación: topbar + sidebar + contenedor de página.
import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Glass, Tabbar, TabbarLink } from "konsta/react";
import { useStore } from "../lib/store";
import { formatBsDirect, formatRate, formatUsd, round2 } from "../lib/money";
import { expectedCash } from "../lib/metrics";
import { Field, Modal } from "./ui";
import { Icon, type IconName } from "./Icon";
import { MobileScannerModal } from "./ScannerModals";
import { ScannerProvider, useScanner } from "../lib/scanner/ScannerProvider";
import type { BusinessFeatures } from "../lib/types";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  sub?: { to: string; label: string }[];
  feature?: keyof BusinessFeatures;
}

const NAV: NavItem[] = [
  { to: "/app/inicio", label: "Inicio", icon: "home" },
  {
    to: "/app/ventas",
    label: "Ventas",
    icon: "cart",
    sub: [
      { to: "/app/ventas", label: "Vender" },
      { to: "/app/ventas/historial", label: "Historial" },
    ],
  },
  { to: "/app/catalogo", label: "Catálogo", icon: "tag" },
  { to: "/app/inventario", label: "Inventario", icon: "box", feature: "inventory" },
  { to: "/app/contactos", label: "Contactos", icon: "users", feature: "providers" },
  { to: "/app/finanzas", label: "Finanzas", icon: "wallet", feature: "expenses" },
  { to: "/app/informes", label: "Informes", icon: "chart", feature: "reports" },
  { to: "/app/ajustes", label: "Ajustes", icon: "settings" },
];

/**
 * Secciones de la barra de pestañas (solo navegación).
 *
 * HIG (Tab bars): "Use a tab bar to support navigation, not to provide actions",
 * "Include tab labels to help with navigation" y "Avoid overflow tabs" — por eso
 * son 5 como máximo y llevan etiqueta.
 */
const TABS: { to: string; label: string; icon: IconName; feature?: keyof BusinessFeatures }[] = [
  { to: "/app/ventas", label: "Ventas", icon: "cart" },
  { to: "/app/catalogo", label: "Catálogo", icon: "tag" },
  { to: "/app/inventario", label: "Inventario", icon: "box", feature: "inventory" },
  { to: "/app/contactos", label: "Contactos", icon: "users", feature: "providers" },
  { to: "/app/finanzas", label: "Finanzas", icon: "wallet", feature: "expenses" },
];

/** Botón del topbar: abre el modal del escáner y muestra si el celular está activo. */
function ScannerTopbarButton() {
  const { remoteActive, pairing } = useScanner();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className={"btn btn--plain btn--sm scan-topbtn" + (remoteActive ? " scan-topbtn--on" : "")}
        onClick={() => setOpen(true)}
        title="Escáner móvil"
      >
        <Icon name="scan" />
        <span className="scan-topbtn__label">
          {remoteActive ? "Escáner activo" : pairing ? "Escáner" : "Vincular"}
        </span>
        {remoteActive && <span className="dot dot--on" aria-hidden />}
      </button>
      {open && <MobileScannerModal onClose={() => setOpen(false)} />}
    </>
  );
}

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
  const visibleTabs = TABS.filter((item) => !item.feature || features[item.feature]);
  const location = useLocation();
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
    <ScannerProvider>
    <div className={"shell" + (navOpen ? " shell--nav-open" : "")}>
      <aside className="shell__sidebar">
        <div className="sidenav__brand">
          <Link to="/app/ventas" className="brand brand--lg" aria-label="Ir a ventas">
            <span className="brand__blink">BLINK</span>
            <span className="brand__pos">POS</span>
          </Link>
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

        <div className="sidenav__foot">
          <button className="btn btn--plain" onClick={() => { setNavOpen(false); void logout(); nav("/app/entrar"); }}>
            <Icon name="logout" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {navOpen && <div className="shell__scrim" onClick={() => setNavOpen(false)} />}

      <div className="shell__content">
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
          <ScannerTopbarButton />
          <span className="rate-chip rate-chip--live" title="Tasa de referencia BCV">
            {state.rate > 0 ? (
              <>
                <strong>{formatRate(state.rate)}</strong>
                <span className="rate-chip__suffix"> / $ · BCV</span>
              </>
            ) : (
              <strong style={{ fontSize: "0.8rem" }}>Sin tasa</strong>
            )}
          </span>
          <span className="grow" />
          {session ? (
            <button
              className="btn btn--plain btn--sm"
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
            <button className="btn btn--plain btn--sm" onClick={() => setCashOpen(true)}>
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
      </div>

      {/* Barra de pestañas flotante (solo en movil).
          HIG (Tab bars · iOS): "A tab bar floats above content at the bottom
          of the screen. Its items rest on a Liquid Glass background that allows
          content beneath to peek through." → Glass de Konsta,Separado del borde
          y con el contenido asomando por debajo. */}
      <Glass className="shell__tabbar-float">
        <Tabbar className="shell__tabbar" labels icons>
          {visibleTabs.map((t) => (
            <TabbarLink
              key={t.to}
              component={NavLink}
              linkProps={{ to: t.to }}
              active={location.pathname === t.to || location.pathname.startsWith(t.to + "/")}
              icon={<Icon name={t.icon} />}
              label={t.label}
            />
          ))}
        </Tabbar>
      </Glass>

      {/* Contenedor persistente para imprimir reportes (PDF). Oculto en pantalla. */}
      <div id="printable-report" aria-hidden="true" />

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
    </ScannerProvider>
  );
}
