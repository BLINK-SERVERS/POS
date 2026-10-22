// Shell de la aplicación: topbar + sidebar + barra inferior flotante.
//
// Navegación (v1.13.0):
//   · En escritorio, la navegación vive en la barra lateral.
//   · En móvil, NO hay hamburguesa: la navegación es una barra inferior
//     flotante de material (Liquid Glass) con una acción central destacada
//     (Vender) y el menú de cuenta en el avatar del cabecera.
//   · Todos los módulos usan la misma iconografía (ver MODULOS).
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Glass } from "konsta/react";
import { useStore } from "../lib/store";
import { formatBsDirect, formatRate, formatUsd, round2 } from "../lib/money";
import { expectedCash } from "../lib/metrics";
import { Field, Modal } from "./ui";
import { Icon, type IconName } from "./Icon";
import { MobileScannerModal } from "./ScannerModals";
import { ScannerProvider, useScanner } from "../lib/scanner/ScannerProvider";
import { type Modulo } from "../lib/modulos";

/** Elemento de la barra lateral, con sus subsecciones. */
interface NavItem extends Modulo {
  sub?: { to: string; label: string; icon: IconName }[];
}

const NAV: NavItem[] = [
  { to: "/app/inicio", label: "General", icon: "grid2x2" },
  {
    to: "/app/ventas",
    label: "Ventas",
    icon: "cart",
    sub: [
      { to: "/app/ventas", label: "Vender", icon: "cart" },
      { to: "/app/ventas/historial", label: "Historial", icon: "clock" },
    ],
  },
  { to: "/app/catalogo", label: "Catálogo", icon: "tag" },
  { to: "/app/inventario", label: "Inventario", icon: "box", feature: "inventory" },
  { to: "/app/contactos", label: "Contactos", icon: "users", feature: "providers" },
  { to: "/app/finanzas", label: "Finanzas", icon: "wallet", feature: "expenses" },
  { to: "/app/informes", label: "Informes", icon: "chart", feature: "reports" },
];

/**
 * Barra inferior flotante (solo móvil).
 *
 * La HIG limita la barra de pestañas a 5 elementos, así que la barra usa
 * 2 + 1 + 2: dos accesos a la izquierda, la acción principal en el centro
 * y dos accesos a la derecha. El resto de módulos se alcanzan desde
 * General (el panel de módulos) y desde la barra lateral del escritorio.
 */
const BAR_IZQUIERDA: Modulo[] = [
  { to: "/app/inicio", label: "Inicio", icon: "grid2x2" },
  { to: "/app/catalogo", label: "Catálogo", icon: "tag" },
];

/** Prioridad para los dos accesos de la derecha (si un módulo está
 *  apagado en el comercio, entra el siguiente de la lista). */
const BAR_DERECHA: Modulo[] = [
  { to: "/app/inventario", label: "Inventario", icon: "box", feature: "inventory" },
  { to: "/app/finanzas", label: "Finanzas", icon: "wallet", feature: "expenses" },
  { to: "/app/contactos", label: "Contactos", icon: "users", feature: "providers" },
  { to: "/app/informes", label: "Informes", icon: "chart", feature: "reports" },
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

/**
 * Menú de avatar (cabecera).
 *
 * Sustituye al menú hamburguesa en móvil: la cuenta, los ajustes y el
 * cierre de sesión se concentran aquí.
 */
function AvatarMenu() {
  const { user, logout } = useStore();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const displayName =
    user && (user.firstName || user.lastName)
      ? [user.firstName, user.lastName].filter(Boolean).join(" ")
      : user?.email ?? "";
  const iniciales = (displayName || "?").slice(0, 2).toUpperCase();
  // Sin nombre propio, el titulo del menu es "Tu cuenta" y el correo
  // pasa al subtitulo (si no, se veria el mismo dato dos veces).
  const tieneNombre = Boolean(user && (user.firstName || user.lastName));

  // Cierra al pulsar fuera o con Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ir = (destino: string) => {
    setOpen(false);
    nav(destino);
  };

  return (
    <div className="avatarmenu__wrap" ref={box}>
      <button
        type="button"
        className="userchip userchip--button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Cuenta y ajustes"
      >
        <span className="avatar">{iniciales}</span>
        <div className="stack" style={{ lineHeight: 1.15 }}>
          <strong style={{ fontSize: "0.8rem" }}>{displayName || "Sesión activa"}</strong>
          <span className="dim" style={{ fontSize: "0.7rem" }}>
            Dueño
          </span>
        </div>
      </button>

      {open && (
        <>
          <div className="avatarmenu__scrim" onClick={() => setOpen(false)} />
          <div className="avatarmenu" role="menu" aria-label="Cuenta y ajustes">
            <div className="avatarmenu__head">
              <span className="avatar avatar--lg">{iniciales}</span>
              <div className="avatarmenu__id">
                <strong>{tieneNombre ? displayName : "Tu cuenta"}</strong>
                <span className="dim">{tieneNombre ? user?.email : "Dueño del comercio"}</span>
              </div>
            </div>

            <div className="avatarmenu__sep" role="separator" />

            <button type="button" role="menuitem" className="avatarmenu__item" onClick={() => ir("/app/ajustes?tab=Negocio")}>
              <Icon name="store" />
              <span>Datos del comercio</span>
            </button>
            <button type="button" role="menuitem" className="avatarmenu__item" onClick={() => ir("/app/ajustes?tab=Perfil")}>
              <Icon name="person" />
              <span>Tu perfil</span>
            </button>
            <button type="button" role="menuitem" className="avatarmenu__item" onClick={() => ir("/app/ajustes")}>
              <Icon name="settings" />
              <span>Ajustes</span>
            </button>

            <div className="avatarmenu__sep" role="separator" />

            <button
              type="button"
              role="menuitem"
              className="avatarmenu__item avatarmenu__item--danger"
              onClick={() => {
                setOpen(false);
                void logout();
                nav("/app/entrar");
              }}
            >
              <Icon name="logout" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Barra de navegación inferior flotante (solo móvil). */
function BarraInferior({ izquierda, derecha }: { izquierda: Modulo[]; derecha: Modulo[] }) {
  const location = useLocation();
  const activo = (to: string) => location.pathname === to || location.pathname.startsWith(to + "/");

  const item = (m: Modulo) => (
    <NavLink
      key={m.to}
      to={m.to}
      className={"tabbar__item" + (activo(m.to) ? " is-active" : "")}
      aria-current={activo(m.to) ? "page" : undefined}
    >
      <span className="tabbar__glyph" aria-hidden>
        <Icon name={m.icon} size="lg" />
      </span>
      <span className="tabbar__label">{m.label}</span>
    </NavLink>
  );

  return (
    <Glass className="shell__tabbar-float">
      <nav className="tabbar" aria-label="Navegación principal">
        <div className="tabbar__side">{izquierda.map(item)}</div>

        {/* Acción principal: Vender. */}
        <NavLink
          to="/app/ventas"
          className={"tabbar__main" + (activo("/app/ventas") ? " is-active" : "")}
          aria-label="Vender"
        >
          <span className="tabbar__main-glyph" aria-hidden>
            <Icon name="dollarsign" size="xl" />
          </span>
          <span className="tabbar__main-label">Vender</span>
        </NavLink>

        <div className="tabbar__side">{derecha.map(item)}</div>
      </nav>
    </Glass>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { state, openCash, closeCash } = useStore();
  const [cashOpen, setCashOpen] = useState(false);
  const [usd, setUsd] = useState("0");
  const [bs, setBs] = useState("0");
  const [closeOpen, setCloseOpen] = useState(false);
  const [cUsd, setCUsd] = useState("0");
  const [cBs, setCBs] = useState("0");
  const [cNote, setCNote] = useState("");

  const features = state.business.features;
  const visibleNav = NAV.filter((item) => !item.feature || features[item.feature]);

  // La barra inferior mantiene 2 + 2 aunque un módulo esté apagado.
  const derecha = BAR_DERECHA.filter((m) => !m.feature || features[m.feature]).slice(0, 2);

  const session = state.cashSession;
  const expected = session ? expectedCash(state) : { usd: 0, bs: 0 };
  const countedUsd = Number(cUsd) || 0;
  const countedBs = Number(cBs) || 0;
  const diffUsd = round2(countedUsd - expected.usd);
  const diffBs = round2(countedBs - expected.bs);
  const hasDiff = diffUsd !== 0 || diffBs !== 0;

  return (
    <ScannerProvider>
    <div className="shell">
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
                      className={({ isActive }) =>
                        isActive ? "nav__link active" : "nav__link"
                      }
                    >
                      <span className="nav__icon" aria-hidden>
                        <Icon name={s.icon} />
                      </span>
                      {s.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

      </aside>

      <div className="shell__content">
        <header className="shell__topbar">
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
            ><Icon name="cash" />
              <span className="btn__label">Cerrar caja</span>
            </button>
          ) : (
            <button className="btn btn--plain btn--sm" onClick={() => setCashOpen(true)}><Icon name="cash" />
              <span className="btn__label">Abrir caja</span>
            </button>
          )}
          <AvatarMenu />
        </header>

        <main className="shell__main">
          {/* El POS (Vender) es la unica pagina que ocupa el alto
              completo: su ticket lleva el pie con el boton de cobrar y
              tiene que caber en pantalla. */}
          <div className={"page" + (location.pathname === "/app/ventas" ? " page--pos" : "")}>
            {children}
          </div>
        </main>
      </div>

      {/* Barra de navegación inferior flotante (solo en móvil).
          HIG (Tab bars · iOS): "A tab bar floats above content at the bottom
          of the screen. Its items rest on a Liquid Glass background that allows
          content beneath to peek through." → Glass de Konsta, separado del
          borde y con el contenido asomando por debajo. */}
      <BarraInferior izquierda={BAR_IZQUIERDA} derecha={derecha} />

      {/* Contenedor persistente para imprimir reportes (PDF). Oculto en pantalla. */}
      <div id="printable-report" aria-hidden="true" />

      {cashOpen && (
        <Modal title="Abrir caja" onClose={() => setCashOpen(false)}>

            <div className="form-group">
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
            </div>

          <button
            className="btn btn--primary btn--block"
            onClick={() => {
              openCash(Number(usd) || 0, Number(bs) || 0);
              setCashOpen(false);
            }}
          ><Icon name="check" />
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

            <div className="form-group">
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
            </div>

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
          ><Icon name="check" />
            Confirmar cierre
          </button>
        </Modal>
      )}
    </div>
    </ScannerProvider>
  );
}
