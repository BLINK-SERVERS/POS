// Landing page comercial de BLINK (ruta raíz "/").
//
// Objetivo: explicar en menos de 3 segundos qué es BLINK POS y convertir al
// visitante en un registro. Sin dependencias de red: todo es SVG + CSS.
//
// Estructura al estilo de las páginas de producto de Apple: una idea por
// bloque, titulares cortos en afirmativo, un solo precio y una sola llamada
// a la acción. La capa de cristal (Liquid Glass) se usa solo en la capa
// funcional —barra, tarjetas y cierre—, nunca en el contenido.
//
// Convenciones del proyecto: interfaz en español, paleta oficial Blink,
// iconos SVG propios (sin emoji) y 3 colores base + los semánticos de marca.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import "../styles/landing.css";

/** Anclas de navegación de la landing. */
const NAV = [
  { href: "#producto", label: "El producto" },
  { href: "#caracteristicas", label: "Características" },
  { href: "#precios", label: "Precios" },
  { href: "#preguntas", label: "Preguntas" },
  { href: "https://pasajes.blink.com.ve", label: "Pasajes" },
];

/**
 * Los momentos: una capacidad por bloque, con su titular y su visual.
 * El titular va en afirmativo y corto; el párrafo explica el beneficio
 * concreto, sin adjetivos.
 */
const MOMENTOS = [
  {
    num: "01 · Escáner móvil",
    titulo: "Tu celular ya es el escáner.",
    texto:
      "Enlaza el teléfono con un QR y escanea desde cualquier pasillo. Sin pistolas láser, sin instalar nada, sin cables.",
    escena: "scan",
  },
  {
    num: "02 · Multimoneda",
    titulo: "Dólares y bolívares, siempre a la tasa oficial.",
    texto:
      "La tasa BCV se actualiza sola. Puedes mezclar efectivo, pago móvil y dólares, y el sistema calcula el vuelto.",
    escena: "money",
  },
  {
    num: "03 · Local-first",
    titulo: "Se cae la señal. Tú no.",
    texto:
      "Cada venta se guarda en el dispositivo y se sincroniza sola cuando vuelve la conexión. Puedes cobrar siempre.",
    escena: "offline",
  },
];

/** Cifras que resumen el producto. */
const CIFRAS = [
  { valor: "0", texto: "equipos que comprar" },
  { valor: "3 s", texto: "de la venta al cobro" },
  { valor: "24/7", texto: "facturando, con o sin internet" },
  { valor: "$25", texto: "al mes, sin comisión por venta" },
];

/** Todo lo que incluye el plan. */
const INCLUYE = [
  "Punto de venta ilimitado",
  "Caja, arqueos y cierre de turno",
  "Escáner móvil enlazado por QR",
  "Multimoneda con tasa BCV en vivo",
  "Inventario, compras y ajustes",
  "Cuentas por cobrar y por pagar",
  "Informes de ventas y márgenes",
  "Catálogo compartido entre comercios",
];

/** Las capacidades, en tarjetas. */
const CAPACIDADES = [
  {
    icon: "cash" as const,
    titulo: "Caja y arqueo",
    texto: "Abre, cobra y cierra el turno con el conteo de efectivo ya cuadrado.",
  },
  {
    icon: "box" as const,
    titulo: "Inventario",
    texto: "Mínimos, ajustes y compras. El stock se descuenta solo al vender.",
  },
  {
    icon: "creditcard" as const,
    titulo: "Multimoneda",
    texto: "USD y EUR con bolívares a tasa BCV, y vuelto mixto.",
  },
  {
    icon: "receipt" as const,
    titulo: "Cuentas por cobrar",
    texto: "Créditos a clientes, abonos parciales y cuentas por pagar a proveedores.",
  },
  {
    icon: "chart" as const,
    titulo: "Informes",
    texto: "Ventas, márgenes y los productos que más rotan, listos para imprimir.",
  },
  {
    icon: "store" as const,
    titulo: "Catálogo compartido",
    texto: "Productos precargados que puedes reutilizar entre comercios.",
  },
];

/** Preguntas frecuentes. */
const PREGUNTAS = [
  {
    q: "¿Necesito una computadora o una impresora?",
    a: "No. BLINK funciona en el navegador del celular o de la computadora. Si más adelante quieres imprimir tickets, puedes conectarlo desde el sistema.",
  },
  {
    q: "¿Qué pasa si se cae el internet?",
    a: "No pasa nada. Cada venta se guarda en el dispositivo y se sincroniza en cuanto vuelve la señal.",
  },
  {
    q: "¿Cómo cobro en bolívares?",
    a: "La tasa oficial BCV se actualiza sola. Puedes mezclar pagos en efectivo, pago móvil y dólares, y el sistema calcula el vuelto.",
  },
  {
    q: "¿Puedo usar el celular como escáner?",
    a: "Sí. Enlazas el teléfono con un QR desde Ajustes y el celular empieza a enviarte los productos que escanea.",
  },
  {
    q: "¿Los datos de mi negocio son míos?",
    a: "Sí. Puedes exportar los datos y pedir su eliminación cuando quieras. Cada comercio está separado del resto.",
  },
  {
    q: "¿Hay instalación o permanencia?",
    a: "No hay instalación ni permanencia: es una suscripción mensual de $25 por tienda y cancelas cuando decidas.",
  },
];

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Cierra el menú al redimensionar a escritorio (evita un estado "colgado").
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 860) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="landing">
      {/* ---------------- Navegación ---------------- */}
      <div className="ld-glass">
        <header className="ld-header">
          <div className="ld-header__inner">
            <Link to="/" className="ld-logo" aria-label="BLINK POS, inicio">
              <span className="ld-logo__blink">BLINK</span>
              <span className="ld-logo__pos">POS</span>
            </Link>

            <nav className={"ld-nav" + (menuOpen ? " ld-nav--open" : "")} aria-label="Navegación principal">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  className="ld-nav__link"
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {n.label}
                </a>
              ))}
            </nav>

            <div className="ld-header__actions">
              <Link className="ld-btn--glass" to="/app/entrar">
                Iniciar sesión
              </Link>
              <Link className="ld-btn ld-btn--primary" to="/app/registro">
                Empezar
              </Link>
            </div>

            <button
              className="ld-burger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
            >
              <Icon name={menuOpen ? "close" : "menu"} size="lg" />
            </button>
          </div>
        </header>
      </div>

      {/* ---------------- Portada ---------------- */}
      <section className="ld-hero">
        <div className="ld-hero__inner">
          <div>
            <span className="ld-glass-pill">
              <Icon name="chart" size="sm" />
              100 % en la nube
            </span>
            <h1>El punto de venta hecho para Venezuela.</h1>
            <p className="ld-hero__sub">
              Cobra en dólares o bolívares a la tasa oficial, escanea con el celular y sigue
              vendiendo aunque se caiga la señal.
            </p>
            <div className="ld-hero__cta">
              <Link className="ld-btn ld-btn--primary ld-btn--lg" to="/app/registro">
                Empezar ahora
                <Icon name="arrowRight" />
              </Link>
              <a className="ld-btn--glass" href="#producto">
                Ver cómo funciona
              </a>
            </div>
            <p className="ld-hero__note">
              <Icon name="check" size="sm" />
              Sin instalación. Sin hardware. $25 al mes.
            </p>
          </div>

          {/* Maqueta: la pantalla del POS y el celular escaneando */}
          <div className="ld-mock" aria-hidden>
            <div className="ld-mock__pc">
              <div className="ld-mock__screen">
                <div className="ld-mock__bar">
                  <div className="ld-mock__search">
                    <Icon name="search" size="sm" />
                    Buscar o escanear…
                  </div>
                </div>
                <div className="ld-mock__line">
                  <b>AZUCAR KONFIT 1kg</b>
                  <span>2 x $2.00</span>
                </div>
                <div className="ld-mock__line">
                  <b>MALTA RETORNABLE</b>
                  <span>3 x $1.50</span>
                </div>
                <div className="ld-mock__line">
                  <b>PAPEL DE ALUMINIO TUC</b>
                  <span>1 x $0.90</span>
                </div>
                <div className="ld-mock__total">
                  <span>Total a pagar</span>
                  <strong>$ 8.40</strong>
                </div>
                <div className="ld-mock__bs">Bs 7.408,80 · Tasa BCV 882.00</div>
              </div>
            </div>

            <div className="ld-mock__phone">
              <div className="ld-mock__phone-screen">
                <div className="ld-mock__frame">
                  <div className="ld-mock__barcode" />
                </div>
                <span className="ld-mock__pill">Escaneado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- BLINK Pasajes ---------------- */}
      <section className="ld-section ld-pasajes" aria-labelledby="pasajes-titulo">
        <div className="ld-section__inner">
          <div className="ld-pasajes__card ld-glass-card">
            <div className="ld-pasajes__texto">
              <span className="ld-glass-pill">
                <Icon name="chart" size="sm" />
                Transporte público
              </span>
              <h2 id="pasajes-titulo">BLINK Pasajes</h2>
              <p>
                El cobro del pasaje en cada unidad, con tarjeta y sin efectivo. El pasajero
                recarga desde su celular y tú ves la recaudación del día al instante.
              </p>
            </div>
            <a className="ld-btn ld-btn--primary ld-btn--lg" href="https://pasajes.blink.com.ve">
              Abrir Pasajes
              <Icon name="arrowRight" />
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- El producto ---------------- */}
      <section className="ld-moments" id="producto">
        {MOMENTOS.map((m, i) => (
          <article className={"ld-moment" + (i % 2 ? " ld-moment--flip" : "")} key={m.num}>
            <div className="ld-moment__body">
              <span className="ld-moment__num">{m.num}</span>
              <h2>{m.titulo}</h2>
              <p>{m.texto}</p>
            </div>

            <div className={"ld-scene ld-scene--" + m.escena}>
              {m.escena === "scan" && (
                <div className="ld-scene__phone">
                  <div className="ld-scene__view">
                    <span className="ld-scene__mark" />
                    <div className="ld-scene__bars" />
                  </div>
                  <span className="ld-scene__toast">Añadido a la cuenta</span>
                </div>
              )}

              {m.escena === "money" && (
                <>
                  <div className="ld-scene__card">
                    <div className="ld-scene__row">
                      <span>Total</span>
                      <b>$ 24.00</b>
                    </div>
                    <div className="ld-scene__row">
                      <span>Recibido</span>
                      <b>Bs 21.168,00</b>
                    </div>
                    <div className="ld-scene__row ld-scene__row--hi">
                      <span>Vuelto</span>
                      <b>$ 1.20</b>
                    </div>
                  </div>
                  <span className="ld-scene__chip">Tasa BCV 882,00</span>
                </>
              )}

              {m.escena === "offline" && (
                <div className="ld-scene__card">
                  <span className="ld-scene__status">
                    <span className="ld-scene__dot" />
                    Vendiendo sin conexión
                  </span>
                  <div className="ld-scene__row">
                    <span>Cuenta #0142</span>
                    <b>$ 8.40</b>
                  </div>
                  <div className="ld-scene__row">
                    <span>Estado</span>
                    <b>Guardada en el equipo</b>
                  </div>
                  <div className="ld-scene__row">
                    <span>Sincronización</span>
                    <b>Al volver la señal</b>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* ---------------- Cifras ---------------- */}
      <section className="ld-section ld-section--dark">
        <div className="ld-section__inner">
          <div className="ld-stats">
            {CIFRAS.map((s) => (
              <div className="ld-stat" key={s.valor}>
                <strong>{s.valor}</strong>
                <span>{s.texto}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Características ---------------- */}
      <section className="ld-section" id="caracteristicas">
        <div className="ld-section__inner">
          <div className="ld-section__head">
            <h2>Todo lo que un comercio necesita. Nada más.</h2>
            <p>Una sola herramienta, sin módulos que comprar por separado.</p>
          </div>

          <div className="ld-benefits">
            {CAPACIDADES.map((c) => (
              <article className="ld-benefit ld-glass-card" key={c.titulo}>
                <div className="ld-benefit__icon">
                  <Icon name={c.icon} size="lg" />
                </div>
                <h3>{c.titulo}</h3>
                <p>{c.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Precios ---------------- */}
      <section className="ld-section" id="precios">
        <div className="ld-section__inner">
          <div className="ld-section__head">
            <h2>Un solo plan. Todo incluido.</h2>
            <p>Sin comisiones por venta, sin planes ocultos, sin sorpresas en la factura.</p>
          </div>

          <div className="ld-pricing ld-glass-card">
            <span className="ld-glass-pill">Plan comercial</span>
            <div className="ld-pricing__price">
              <strong>$25</strong>
              <span>/ mes</span>
            </div>
            <p className="ld-pricing__hint">Por tienda. Cancela cuando quieras.</p>

            <ul className="ld-pricing__list">
              {INCLUYE.map((item) => (
                <li key={item}>
                  <Icon name="check" size="sm" />
                  {item}
                </li>
              ))}
            </ul>

            <Link className="ld-btn ld-btn--primary ld-btn--lg" to="/app/registro">
              Crear mi comercio
              <Icon name="arrowRight" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Preguntas ---------------- */}
      <section className="ld-section" id="preguntas">
        <div className="ld-section__inner">
          <div className="ld-section__head">
            <h2>Preguntas frecuentes.</h2>
            <p>Si te queda alguna duda, escríbenos a soporte@blink.com.ve.</p>
          </div>

          <div className="ld-faq">
            {PREGUNTAS.map((p) => (
              <details className="ld-glass-card" key={p.q}>
                <summary>{p.q}</summary>
                <p>{p.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Cierre ---------------- */}
      <section className="ld-glass-band">
        <div className="ld-cta">
          <div className="ld-cta__inner">
            <h2>Empieza hoy.</h2>
            <p>Crea tu comercio en un minuto. Sin instalación y sin hardware.</p>
            <div className="ld-cta__actions">
              <Link className="ld-btn ld-btn--primary ld-btn--lg" to="/app/registro">
                Crear mi comercio
                <Icon name="arrowRight" />
              </Link>
              <a className="ld-btn--glass" href="mailto:soporte@blink.com.ve">
                Hablar con soporte
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Pie ---------------- */}
      <footer className="ld-footer">
        <div className="ld-footer__inner">
          <Link to="/" className="ld-logo" aria-label="BLINK POS, inicio">
            <span className="ld-logo__blink">BLINK</span>
            <span className="ld-logo__pos">POS</span>
          </Link>

          <nav className="ld-footer__legal" aria-label="Enlaces legales">
            <Link to="/app/terminos">Términos de servicio</Link>
            <Link to="/app/privacidad">Política de privacidad</Link>
            <a href="mailto:soporte@blink.com.ve">Soporte técnico</a>
          </nav>

          <p className="ld-footer__copy">© 2026 Blink POS</p>
        </div>
      </footer>
    </div>
  );
}
