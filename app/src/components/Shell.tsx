// Shell de la aplicación: topbar + sidebar + barra inferior flotante.
//
// Navegación (v1.13.0):
//   · En escritorio, la navegación vive en la barra lateral.
//   · En móvil, NO hay hamburguesa: la navegación es una barra inferior
//     flotante de material (Liquid Glass) con una acción central destacada
//     (Vender), una pestaña «Más» con la hoja de los módulos que no caben
//     y el menú de cuenta en el avatar del cabecera.
//   · Todos los módulos usan la misma iconografía (ver MODULOS).
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Glass, Sheet } from "konsta/react";
import { useActivacion, useStore } from "../lib/store";
import { estadoReal, fechaCorta, restante, restanteTexto } from "../lib/activacion";
import { formatBsDirect, formatTasaCabecera, formatUsd, round2 } from "../lib/money";
import { expectedCash } from "../lib/metrics";
import { Field, Modal, useCerrarConEscape, useFocoDeDialogo } from "./ui";
import { Icon, type IconName } from "./Icon";
import { BrandLogo } from "./BrandLogo";
import { Asistencia } from "./Asistencia";
import { AvisoInstalacion } from "./AvisoInstalacion";
import { ScannerProvider } from "../lib/scanner/ScannerProvider";
import { type Modulo } from "../lib/modulos";

/** Elemento de la barra lateral, con sus subsecciones. */
interface NavItem extends Modulo {
  sub?: { to: string; label: string; icon: IconName }[];
}

const NAV: NavItem[] = [
  { to: "/app/inicio", label: "General", icon: "grid2x2.solid" },
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
  { to: "/app/creditos", label: "Créditos", icon: "creditcard", feature: "credit" },
  { to: "/app/informes", label: "Informes", icon: "chart", feature: "reports" },
];

/**
 * Barra inferior flotante (solo móvil).
 *
 * La HIG limita la barra de pestañas a 5 destinos visibles a la vez, así que
 * la barra usa 2 + 1 + 2 (dos accesos a la izquierda, la acción principal en
 * el centro y dos a la derecha) y una sexta pestaña «Más» que abre una hoja
 * con el resto de módulos. La hoja se deriva de NAV: nunca hay que mantener
 * dos listas a mano. En escritorio el sidebar sigue mostrando todo.
 */
const BAR_IZQUIERDA: Modulo[] = [
  { to: "/app/inicio", label: "Inicio", icon: "grid2x2.solid" },
  { to: "/app/catalogo", label: "Catálogo", icon: "tag" },
];

/** Acción central de la barra (el POS). */
const BAR_CENTRAL: Modulo = { to: "/app/ventas", label: "Vender", icon: "dollarsign" };

/** Prioridad para los dos accesos de la derecha (si un módulo está
 *  apagado en el comercio, entra el siguiente de la lista). */
const BAR_DERECHA: Modulo[] = [
  { to: "/app/inventario", label: "Inventario", icon: "box", feature: "inventory" },
  { to: "/app/finanzas", label: "Finanzas", icon: "wallet", feature: "expenses" },
  { to: "/app/contactos", label: "Contactos", icon: "users", feature: "providers" },
  { to: "/app/informes", label: "Informes", icon: "chart", feature: "reports" },
];

/**
 * Destinos de la barra lateral aplastados: en móvil no hay árbol de
 * navegación, así que las subsecciones (Vender, Historial) son filas.
 */
function destinosDe(nav: NavItem[]): Modulo[] {
  return nav.flatMap((item) =>
    item.sub
      ? item.sub.map((s) => ({ to: s.to, label: s.label, icon: s.icon, feature: item.feature }))
      : [{ to: item.to, label: item.label, icon: item.icon, feature: item.feature }],
  );
}

/**
 * Menú de avatar (cabecera).
 *
 * Sustituye al menú hamburguesa en móvil: la cuenta, los ajustes y el
 * cierre de sesión se concentran aquí.
 */
function AvatarMenu({
  onCaja,
  cajaAbierta,
}: {
  /** Abre el formulario de apertura o de cierre de caja. */
  onCaja: () => void;
  /** Si la caja del dia esta abierta. */
  cajaAbierta: boolean;
}) {
  const { user, logout } = useStore();
  const activacion = useActivacion();
  const plan = estadoReal(activacion);
  const porVencerDias = restante(activacion?.vigenteHasta);
  // Aviso discreto: solo en los últimos tres días de vigencia.
  const planPorVencer =
    plan === "activo" &&
    porVencerDias !== null &&
    !porVencerDias.vencido &&
    porVencerDias.ms <= 3 * 86_400_000;
  const planTexto =
    plan === "activo"
      ? activacion?.vigenteHasta
        ? `Hasta ${fechaCorta(activacion.vigenteHasta)}`
        : "Sin corte"
      : plan === "en_revision"
        ? "En revisión"
        : plan === "rechazado"
          ? "Rechazada"
          : plan === "vencido"
            ? "Vencida"
            : "Pendiente";

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

            {/* La caja del dia vive aqui: la barra superior se queda
                solo con el nombre, la tasa y la cuenta. */}
            <button
              type="button"
              role="menuitem"
              className="avatarmenu__item"
              onClick={() => {
                setOpen(false);
                onCaja();
              }}
            >
              <Icon name="cash" />
              <span>{cajaAbierta ? "Cerrar caja" : "Abrir caja"}</span>
            </button>

            <div className="avatarmenu__sep" role="separator" />

            <button type="button" role="menuitem" className="avatarmenu__item" onClick={() => ir("/app/ajustes?tab=Negocio")}>
              <Icon name="store" />
              <span>Datos del comercio</span>
            </button>
            <button type="button" role="menuitem" className="avatarmenu__item" onClick={() => ir("/app/ajustes?tab=Perfil")}>
              <Icon name="person" />
              <span>Tu perfil</span>
            </button>
            <button type="button" role="menuitem" className="avatarmenu__item" onClick={() => ir("/app/activacion")}>
              <Icon name="seal" />
              <span>Suscripción</span>
              <span
                className={"avatarmenu__meta" + (planPorVencer || plan === "vencido" ? " avatarmenu__meta--warn" : "")}
              >
                {planPorVencer
                  ? `Vence en ${restanteTexto(activacion?.vigenteHasta)}`
                  : planTexto}
              </span>
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

/**
 * Hoja de los destinos que no caben en la barra inferior · BLINK-140
 * (dueño, 2026-11-21: «no necesito ver todo, pero sí poder acceder a ellas»).
 *
 * Se portal a `document.body`: la barra vive dentro de un `Glass` de Konsta
 * (blur + `overflow:hidden`), que recortaria y posicionaria la hoja.
 */
function HojaMas({ destinos, onCerrar }: { destinos: Modulo[]; onCerrar: () => void }) {
  const nav = useNavigate();
  const panel = useFocoDeDialogo<HTMLElement>();
  useCerrarConEscape(onCerrar);

  const ir = (to: string) => {
    onCerrar();
    nav(to);
  };

  return createPortal(
    <Sheet
      opened
      onBackdropClick={onCerrar}
      className="sheet hoja-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Más opciones"
      tabIndex={-1}
      ref={panel}
    >
      {/* Tirador: la seña de una hoja de iOS. */}
      <div className="sheet__grabber" aria-hidden />
      <header className="sheet__head">
        <h2 className="sheet__title">Más opciones</h2>
        <button type="button" className="sheet__close" onClick={onCerrar} aria-label="Cerrar">
          <Icon name="close" />
        </button>
      </header>
      <div className="sheet__body">
        <nav className="hoja-nav__lista" aria-label="Más secciones">
          {destinos.map((m) => (
            <button key={m.to} type="button" className="hoja-nav__item" onClick={() => ir(m.to)}>
              <span className="hoja-nav__glyph" aria-hidden>
                <Icon name={m.icon} />
              </span>
              <span className="hoja-nav__label">{m.label}</span>
              <span className="hoja-nav__flecha" aria-hidden>
                <Icon name="chevronRight" />
              </span>
            </button>
          ))}
        </nav>
      </div>
    </Sheet>,
    document.body
  );
}

/** Barra de navegación inferior flotante (solo móvil). */
function BarraInferior({
  izquierda,
  central,
  derecha,
  mas,
}: {
  izquierda: Modulo[];
  central: Modulo;
  derecha: Modulo[];
  mas: Modulo[];
}) {
  const location = useLocation();
  const [masAbierta, setMasAbierta] = useState(false);
  const activo = (to: string) => location.pathname === to || location.pathname.startsWith(to + "/");
  // La acción central es exacta: /app/ventas/historial pertenece a «Más».
  const centralActivo = location.pathname === central.to;
  // «Más» se marca mientras la hoja está abierta o la ruta es una de sus entradas.
  const masActivo = masAbierta || mas.some((m) => activo(m.to));

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
          to={central.to}
          className={"tabbar__main" + (centralActivo ? " is-active" : "")}
          aria-label={central.label}
        >
          <span className="tabbar__main-glyph" aria-hidden>
            <Icon name={central.icon} size="xl" />
          </span>
          <span className="tabbar__main-label">{central.label}</span>
        </NavLink>

        <div className="tabbar__side">
          {derecha.map(item)}
          {mas.length > 0 && (
            <button
              type="button"
              className={"tabbar__item" + (masActivo ? " is-active" : "")}
              onClick={() => setMasAbierta(true)}
              aria-haspopup="dialog"
              aria-expanded={masAbierta}
              aria-label="Más opciones"
            >
              <span className="tabbar__glyph" aria-hidden>
                <Icon name="more" size="lg" />
              </span>
              <span className="tabbar__label">Más</span>
            </button>
          )}
        </div>
      </nav>

      {masAbierta && <HojaMas destinos={mas} onCerrar={() => setMasAbierta(false)} />}
    </Glass>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { state, openCash, closeCash } = useStore();
  const { pathname } = useLocation();
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

  // Lo que no cabe en los cinco destinos de la barra se va a la hoja «Más».
  const enBarra = new Set(
    [...BAR_IZQUIERDA, ...derecha, BAR_CENTRAL].map((m) => m.to),
  );
  const mas = destinosDe(visibleNav).filter((m) => !enBarra.has(m.to));

  const session = state.cashSession;
  const expected = session ? expectedCash(state) : { usd: 0, bs: 0, rateMissing: false };
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
          <Link to="/app/ventas" className="brand" aria-label="Blink POS, ir a ventas">
            <BrandLogo />
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
          {/* La barra lleva solo lo imprescindible: el nombre del
              comercio, la tasa del dia y la cuenta. El escaner y la
              caja se abren desde sus propios modulos. */}
          <span className="topbar__name">{state.business.name}</span>
          {/* Ayuda guiada «¿Cómo funciona?» (BLINK · MVP 4.3). Montada UNA sola
              vez, aqui: es el unico punto que comparten todas las vistas. Va
              ANTES del `grow` elastico, asi que el hueco que absorbe la linea
              es aire, no botones: la tasa, el avatar y cualquier accion de la
              barra quedan exactamente donde estaban. La capa del asistente se
              portal a `document.body` desde el propio componente.
              Se apaga por dispositivo en Ajustes → Apariencia; si el modulo
              falla, su ErrorBoundary local lo desmonta y el POS sigue igual. */}
          <Asistencia />
          <span className="grow" />
          <span className="rate-chip rate-chip--live" title="Tasa de referencia BCV">
            {state.rate > 0 ? (
              <>
                <strong>{formatTasaCabecera(state.rate)}</strong>
                <span className="rate-chip__suffix"> / $ · BCV</span>
              </>
            ) : (
              <strong style={{ fontSize: "0.8rem" }}>Sin tasa</strong>
            )}
          </span>
          <AvatarMenu
            onCaja={
              session
                ? () => {
                    setCUsd(String(session.openingUsd));
                    setCBs(String(session.openingBs));
                    setCNote("");
                    setCloseOpen(true);
                  }
                : () => setCashOpen(true)
            }
            cajaAbierta={Boolean(session)}
          />
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
          borde y con el contenido asomando por debajo. Los destinos que no
          caben viven en la pestaña «Más», no en un rejilla escondida. */}
      <BarraInferior
        izquierda={BAR_IZQUIERDA}
        central={BAR_CENTRAL}
        derecha={derecha}
        mas={mas}
      />

      {/* Solo en la pantalla de inicio y con sesión: la landing y el resto
          de módulos no ofrecen la instalación. */}
      <AvisoInstalacion visible={pathname === "/app/inicio" || pathname === "/app/general"} />

      {/* Contenedor persistente para imprimir reportes (PDF). Vive en
          `document.body`, no dentro de `#root`: así el `@media print` puede
          quitar la aplicación completa con `display:none` en vez de ocultar
          con `visibility` unos 100 nodos que seguían ocupando espacio y
          empujaban el reporte 432 px hacia abajo, dejando páginas en blanco
          (BLINK-099, medido 2026-11-15). Oculto en pantalla. */}
      {createPortal(<div id="printable-report" aria-hidden="true" />, document.body)}

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
          {/* BLINK-066: los asientos viejos sin monto nativo y sin tasa no
              fabrican un esperado en Bs: se avisa antes de cerrar el turno. */}
          {expected.rateMissing && (
            <p className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: "0.5rem" }}>
              Hay movimientos en bolívares sin tasa oficial y el esperado en Bs puede estar
              incompleto. Configura la tasa en Ajustes antes de cerrar el turno.
            </p>
          )}
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
