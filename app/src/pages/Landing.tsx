// Landing page comercial de BLINK (ruta raíz "/").
//
// Objetivo: explicar en menos de 3 segundos qué es BLINK POS y convertir al
// visitante en un registro. Sin dependencias de red: todo es SVG + CSS.
//
// Convenciones del proyecto: interfaz en español, paleta oficial Blink,
// iconos SVG propios (sin emoji) y 3 colores base + los semánticos de marca.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import "../styles/landing.css";

/** Anclas de navegación de la landing. */
const NAV = [
  { href: "#caracteristicas", label: "Características" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#precios", label: "Precios" },
];

/** Beneficios principales (killer features). */
const FEATURES = [
  {
    icon: "scan" as const,
    title: "Usa tu celular como escáner inalámbrico",
    body: "Olvídate de pistolas láser costosas. Vincula tu teléfono por QR y escanea productos o busca al instante desde cualquier pasillo.",
    tag: "Sin hardware extra",
  },
  {
    icon: "cash" as const,
    title: "Multimoneda real (USD/EUR + BCV)",
    body: "Calcula vueltos mixtos, maneja pagos fraccionados (efectivo, pago móvil, Zelle) y actualiza la tasa oficial automáticamente sin errores.",
    tag: "Tasa BCV automática",
  },
  {
    icon: "box" as const,
    title: "Local-First sin interrupciones",
    body: "Si el internet falla, el sistema sigue facturando de manera local y sincroniza de forma segura al volver la señal.",
    tag: "Siempre vendiendo",
  },
];

/** Incluye la tarifa plana. */
const INCLUDES = [
  "POS ilimitado para todos tus puntos de venta",
  "Control de caja y cierres con arqueo",
  "App de escaneo móvil enlazada por QR",
  "Multimoneda con tasa oficial BCV en vivo",
  "Catálogo colaborativo con productos pre-cargados",
  "Soporte técnico y actualizaciones automáticas",
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
      {/* ---------------- Header fijo ---------------- */}
      {/* Material "liquid glass" de iOS 26/27 (HIG · Materials): difumina el
          fondo y aplica el brillo especular. Se resuelve con CSS (`.ld-header`)
          en vez de con el componente <Glass> de Konsta: la landing no usa
          NADA de Konsta, y así no arrastra su CSS (85 KB) ni su JS al
          primer paint. HIG: solo en la capa funcional, nunca en el
          contenido. */}
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
              <Link className="ld-btn ld-btn--ghost" to="/app/entrar">
                Iniciar Sesión
              </Link>
              <Link className="ld-btn ld-btn--primary" to="/app/registro">
                Registrar mi comercio
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

      {/* ---------------- Hero ---------------- */}
      <section className="ld-hero">
        <div className="ld-hero__inner">
          <div>
            <span className="ld-eyebrow">
              <Icon name="chart" size="sm" />
              100% en la nube
            </span>
            <h1>El Punto de Venta más rápido, inteligente y adaptado a Venezuela.</h1>
            <p className="ld-hero__sub">
              Controla tu caja, calcula al instante en Dólares y Bolívares a tasa BCV, y usa la
              cámara de tu teléfono como escáner de códigos de barras. Sin equipos costosos y 100%
              en la nube.
            </p>
            <div className="ld-hero__cta">
              <Link className="ld-btn ld-btn--primary ld-btn--lg" to="/app/registro">
                Empezar Ahora - $25/mes
                <Icon name="arrowRight" />
              </Link>
              <span className="ld-hero__note">
                <Icon name="check" size="sm" />
                Sin costo de instalación
              </span>
            </div>
          </div>

          {/* Mockup: pantalla del POS + celular escaneando */}
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

      {/* ---------------- Beneficios ---------------- */}
      <section className="ld-section" id="caracteristicas">
        <div className="ld-section__inner">
          <div className="ld-section__head">
            <h2>Todo lo que necesitas, nada más</h2>
            <p>
              Tres capacidades que reemplazan el hardware caro, el cálculo manual y la
              incertidumbre de la tasa.
            </p>
          </div>

          <div className="ld-features">
            {FEATURES.map((f) => (
              <article className="ld-feature" key={f.title}>
                <div className="ld-feature__icon">
                  <Icon name={f.icon} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
                <span className="ld-feature__tag">
                  <Icon name="check" size="sm" />
                  {f.tag}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Ecosistema / prueba social ---------------- */}
      <section className="ld-section ld-section--dark" id="como-funciona">
        <div className="ld-section__inner">
          <div className="ld-trust">
            <div>
              <p className="ld-trust__quote">
                Diseñado por desarrolladores que entienden la realidad del comercio local.
              </p>
              <p className="ld-trust__by">
                Catálogo inteligente con miles de productos pre-cargados para que configures tu
                inventario en minutos, no en horas. Cada comercio que se suma mejora el catálogo
                compartido de toda la red.
              </p>
            </div>

            <div className="ld-stats">
              <div className="ld-stat">
                <strong>USD · EUR</strong>
                <span>Multimoneda con tasa oficial BCV actualizada automáticamente.</span>
              </div>
              <div className="ld-stat">
                <strong>0 ms</strong>
                <span>Escaneo desde el celular: sin instalación ni mantenimiento.</span>
              </div>
              <div className="ld-stat">
                <strong>24/7</strong>
                <span>El POS sigue facturando aunque se caiga la conexión.</span>
              </div>
              <div className="ld-stat">
                <strong>$25</strong>
                <span>Tarifa plana mensual. Sin comisiones ni cobros por venta.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Precios ---------------- */}
      <section className="ld-section" id="precios">
        <div className="ld-section__inner">
          <div className="ld-section__head">
            <h2>Un precio. Todo incluido.</h2>
            <p>Sin commissions por venta, sin planes ocultos, sin sorpresas en la factura.</p>
          </div>

          <div className="ld-pricing">
            <span className="ld-pricing__badge">Plan Pro Comercial</span>
            <h3>Todo BLINK POS, para tu comercio</h3>
            <div className="ld-pricing__price">
              <strong>$25</strong>
              <span>/ mes</span>
            </div>
            <p className="ld-pricing__hint">Un solo plan. Todos los módulos activados.</p>

            <ul className="ld-pricing__list">
              {INCLUDES.map((item) => (
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

      {/* ---------------- Footer ---------------- */}
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
