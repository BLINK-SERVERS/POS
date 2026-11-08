// Landing comercial de Blink POS (pos.blink.com.ve, ruta "/").
//
// Refleja la landing de Blink Pay: misma barra de cristal, misma cinta,
// titulares en afirmativo, beneficios oscuros en rejilla, pasos con el
// visual pegajoso, piezas de confianza en oscuro, acordeón de preguntas y
// notas numeradas. La diferencia es el material: aquí no hay maquetas CSS,
// sino capturas reales de la aplicación con datos de ejemplo.
//
// Convenciones del proyecto: interfaz en español, paleta oficial Blink,
// iconos SF Symbols del núcleo (los únicos del chunk público) y toda la
// tipografía y los materiales salen de tokens.css.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AvisoCookies } from "../components/AvisoCookies";
import { Icon } from "../components/Icon";
import { Link } from "react-router-dom";
import ventaSrc from "../assets/landing/pos-venta.webp";
import catalogoSrc from "../assets/landing/pos-catalogo.webp";
import historialSrc from "../assets/landing/pos-historial.webp";
import cuentaSrc from "../assets/landing/pos-cuenta.webp";
import movilSrc from "../assets/landing/pos-movil.webp";
import movilVentaSrc from "../assets/landing/pos-movil-venta.webp";
import movilCatalogoSrc from "../assets/landing/pos-movil-catalogo.webp";
import movilCobrarSrc from "../assets/landing/pos-movil-cobrar.webp";
import movilHistorialSrc from "../assets/landing/pos-movil-historial.webp";
import "../styles/landing.css";

const BASE = import.meta.env.BASE_URL;
const LOCKUP = `${BASE}brand/blink-pos.svg`;
const LOCKUP_BLANCO = `${BASE}brand/blink-pos-blanco.svg`;

const SECCIONES = [
  { href: "#como-funciona", label: "Producto" },
  { href: "#precios", label: "Precios" },
  { href: "#preguntas", label: "Preguntas" },
];

/* ------------------------------------------------------------------ *
 * Piezas visuales
 * ------------------------------------------------------------------ */

/** La captura real de la app dentro de una ventana de escritorio. */
function Ventana({ src, etiqueta }: { src: string; etiqueta: string }) {
  return (
    <div className="lp-ventana" role="img" aria-label={etiqueta}>
      <div className="lp-ventana__barra" aria-hidden="true">
        <span className="lp-ventana__punto lp-ventana__punto--rojo" />
        <span className="lp-ventana__punto lp-ventana__punto--ambar" />
        <span className="lp-ventana__punto lp-ventana__punto--verde" />
        <span className="lp-ventana__url">pos.blink.com.ve</span>
      </div>
      <img src={src} alt="" width="2000" height="1250" decoding="async" draggable={false} />
    </div>
  );
}

/** La app en el celular, dentro del marco del teléfono. */
function Telefono({ src, etiqueta }: { src: string; etiqueta: string }) {
  return (
    <div className="lp-telefono" role="img" aria-label={etiqueta}>
      <div className="lp-telefono__marco">
        <span className="lp-telefono__isla" />
        <div className="lp-telefono__pantalla">
          <img src={src} alt="" width="780" height="1688" decoding="async" draggable={false} />
        </div>
        <span className="lp-telefono__barra" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Acordeón de preguntas
 * ------------------------------------------------------------------ */

interface Pregunta {
  pregunta: string;
  respuesta: ReactNode;
}

function Acordeon({ items }: { items: Pregunta[] }) {
  const base = useId();
  const [abierta, setAbierta] = useState<number | null>(null);

  return (
    <ul className="lp-acordeon">
      {items.map((item, indice) => {
        const activo = abierta === indice;
        const idBoton = `${base}-boton-${indice}`;
        const idPanel = `${base}-panel-${indice}`;
        return (
          <li
            key={item.pregunta}
            className={`lp-acordeon__item${activo ? " lp-acordeon__item--abierto" : ""}`}
          >
            <h3 className="lp-acordeon__titulo">
              <button
                type="button"
                className="lp-acordeon__boton"
                id={idBoton}
                aria-expanded={activo}
                aria-controls={idPanel}
                onClick={() => setAbierta(activo ? null : indice)}
              >
                <span className="lp-acordeon__texto">{item.pregunta}</span>
                <span className="lp-acordeon__chevron" aria-hidden="true">
                  <Icon name="arrowRight" size="sm" />
                </span>
              </button>
            </h3>
            <div
              className="lp-acordeon__bandeja"
              id={idPanel}
              role="region"
              aria-labelledby={idBoton}
              inert={!activo}
            >
              <div className="lp-acordeon__contenido">
                <p className="lp-acordeon__respuesta">{item.respuesta}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ *
 * Pasos con el visual pegajoso (como el hardware de Blink Pay)
 * ------------------------------------------------------------------ */

const PASOS = [
  {
    titulo: "Carga tu catálogo una vez.",
    cuerpo: (
      <>
        Registra cada producto con su código de barras, su precio en dólares y en bolívares, su
        IVA y su margen. El stock se descuenta solo al vender y te avisa cuando algo llega al
        mínimo.<sup>1</sup>
      </>
    ),
    pie: "Catálogo real, con datos de ejemplo.",
  },
  {
    titulo: "Cobra como te paguen.",
    cuerpo: (
      <>
        Efectivo, pago móvil, punto de venta o dólares. La cuenta suma el IVA, aplica descuentos
        y recargos, y calcula el vuelto en la moneda que elijas con la tasa BCV del día.
      </>
    ),
    pie: "La cuenta de una venta real.",
  },
  {
    titulo: "Cierra el día cuadrado.",
    cuerpo: (
      <>
        Cada venta queda con su método de pago, su referencia y su tasa. Al cerrar el turno, el
        arqueo de efectivo se compara con lo que entró y sabes exactamente cuánto hay en
        caja.<sup>2</sup>
      </>
    ),
    pie: "Historial del día, con datos de ejemplo.",
  },
];

function useMedio(consulta: string) {
  const [ok, setOk] = useState(
    () => typeof window !== "undefined" && window.matchMedia(consulta).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(consulta);
    const on = () => setOk(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [consulta]);
  return ok;
}

/**
 * Como la barra de Apple: el cristal se tiñe según lo que pasa por debajo.
 * Sobre una sección oscura el blanco translúcido se lee gris; ahí la barra
 * pasa a negro y el contenido a claro.
 */
function useSobreOscuro() {
  const [oscuro, setOscuro] = useState(false);
  useEffect(() => {
    const secciones = Array.from(
      document.querySelectorAll<HTMLElement>(".lp-seccion--oscura")
    );
    if (!secciones.length) return;
    const revisar = () =>
      setOscuro(
        secciones.some((seccion) => {
          const { top, bottom } = seccion.getBoundingClientRect();
          return top <= 28 && bottom > 28;
        })
      );
    revisar();
    let cuadro = 0;
    const alMover = () => {
      if (cuadro) return;
      cuadro = requestAnimationFrame(() => {
        cuadro = 0;
        revisar();
      });
    };
    window.addEventListener("scroll", alMover, { passive: true });
    window.addEventListener("resize", alMover);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", alMover);
      window.removeEventListener("resize", alMover);
    };
  }, []);
  return oscuro;
}

function Pasos() {
  // El visual pegajoso necesita dos columnas; debajo de 900 se apila.
  const escritorio = useMedio("(min-width: 901px)");
  // Las capturas del celular solo tienen sentido en un teléfono.
  const compacto = useMedio("(max-width: 767px)");
  const [activo, setActivo] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  // El visual queda fijo y cambia con el párrafo que se está leyendo.
  useEffect(() => {
    if (!escritorio) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const indice = Number((visible.target as HTMLElement).dataset.indice);
        if (!Number.isNaN(indice)) setActivo(indice);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    refs.current.forEach((nodo) => nodo && observador.observe(nodo));
    return () => observador.disconnect();
  }, [escritorio]);

  // En el celular el visual va dentro del teléfono: una captura de
  // escritorio encogida a 350 px no se lee.
  const visuales = compacto
    ? [
        <Telefono
          key="catalogo"
          src={movilCatalogoSrc}
          etiqueta="El catálogo de Blink POS en el celular, con las fichas de producto"
        />,
        <Telefono
          key="cuenta"
          src={movilCobrarSrc}
          etiqueta="La hoja de Cobrar en el celular, con los totales y los métodos de pago"
        />,
        <Telefono
          key="historial"
          src={movilHistorialSrc}
          etiqueta="El historial de ventas en el celular, con el resumen del día"
        />,
      ]
    : [
        <Ventana
          key="catalogo"
          src={catalogoSrc}
          etiqueta="Catálogo de Blink POS con las fichas de producto, el precio en dólares y bolívares, el margen y el stock"
        />,
        <div className="lp-cuenta" key="cuenta">
          <img src={cuentaSrc} alt="" width="730" height="1300" decoding="async" />
        </div>,
        <Ventana
          key="historial"
          src={historialSrc}
          etiqueta="Historial de ventas con el método de pago de cada operación, su estado y su total"
        />,
      ];

  if (!escritorio) {
    return (
      <div className="lp-pasos">
        {PASOS.map((paso, indice) => (
          <div className="lp-paso" key={paso.titulo}>
            <div className="lp-paso__hardware">{visuales[indice]}</div>
            <div className="lp-paso__texto">
              <h3 className="lp-paso__titulo">{paso.titulo}</h3>
              <p className="lp-dos-tonos">{paso.cuerpo}</p>
              <p className="lp-nota-visual">{paso.pie}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="lp-pegajoso">
      <div className="lp-pegajoso__hardware">
        {PASOS.map((paso, indice) => (
          <div
            key={paso.titulo}
            className={`lp-pegajoso__escena${activo === indice ? " lp-pegajoso__escena--activa" : ""}`}
            aria-hidden={activo !== indice}
          >
            {visuales[indice]}
            <p className="lp-nota-visual">{paso.pie}</p>
          </div>
        ))}
      </div>
      <div className="lp-pegajoso__texto">
        {PASOS.map((paso, indice) => (
          <div
            className="lp-paso"
            key={paso.titulo}
            data-indice={indice}
            ref={(nodo) => {
              refs.current[indice] = nodo;
            }}
          >
            <div className="lp-paso__texto">
              <h3 className="lp-paso__titulo">{paso.titulo}</h3>
              <p className="lp-dos-tonos">{paso.cuerpo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Página
 * ------------------------------------------------------------------ */

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

const PREGUNTAS: Pregunta[] = [
  {
    pregunta: "¿Necesito una computadora o una impresora?",
    respuesta:
      "No. BLINK funciona en el navegador del celular o de la computadora. Si más adelante quieres imprimir tickets, puedes conectarlo desde el sistema.",
  },
  {
    pregunta: "¿Qué pasa si se cae el internet?",
    respuesta:
      "Nada. Cada venta se guarda en el dispositivo y se sincroniza en cuanto vuelve la señal. Puedes seguir cobrando y el inventario se pone al día después.",
  },
  {
    pregunta: "¿Cómo cobro en bolívares?",
    respuesta:
      "La tasa oficial BCV se actualiza sola. Puedes mezclar pagos en efectivo, pago móvil y dólares, y el sistema calcula el vuelto en la moneda que elijas.",
  },
  {
    pregunta: "¿Puedo usar el celular como escáner?",
    respuesta:
      "Sí. Enlazas el teléfono con un QR desde Ajustes y lo que escaneas aparece en la cuenta de la computadora al instante. No hay que instalar nada.",
  },
  {
    pregunta: "¿Los datos de mi negocio son míos?",
    respuesta:
      "Sí. Puedes exportar los datos y pedir su eliminación cuando quieras. Cada comercio está separado del resto y solo entra quien tenga su cuenta.",
  },
  {
    pregunta: "¿Hay instalación o permanencia?",
    respuesta:
      "No hay instalación ni permanencia: es una suscripción mensual de $25 por tienda y cancelas cuando decidas. No se cobra comisión por venta.",
  },
];

export function Landing() {
  const sobreOscuro = useSobreOscuro();

  return (
    <div className="lp">
      <a className="lp-salto" href="#contenido-lp">
        Saltar al contenido
      </a>

      <header className={`lp-nav${sobreOscuro ? " lp-nav--oscura" : ""}`}>
        <div className="lp-nav__fila">
          <Link className="lp-nav__marca" to="/" aria-label="Blink POS, inicio">
            <img
              className="lp-nav__marca--clara"
              src={LOCKUP}
              width="1055.42"
              height="192.85"
              alt=""
              draggable={false}
            />
            <img
              className="lp-nav__marca--oscura"
              src={LOCKUP_BLANCO}
              width="1055.42"
              height="192.85"
              alt=""
              draggable={false}
            />
          </Link>
          <nav className="lp-nav__enlaces" aria-label="Secciones">
            {SECCIONES.map((seccion) => (
              <a key={seccion.href} href={seccion.href}>
                {seccion.label}
              </a>
            ))}
          </nav>
          <Link className="lp-boton lp-boton--primario lp-nav__cta" to="/app/registro">
            Empezar
          </Link>
        </div>
      </header>

      <main id="contenido-lp">
        {/* Portada */}
        <section className="lp-seccion lp-seccion--clara lp-hero" id="arriba" aria-labelledby="hero-titulo">
          <div className="lp-contenido">
            <div className="lp-cinta">
              <p>
                Escáner móvil incluido.{" "}
                <a className="lp-enlace" href="#como-funciona">
                  Más información
                  <Icon name="arrowRight" size="sm" />
                </a>
              </p>
            </div>

            <h1 className="visualmente-oculto" id="hero-titulo">
              Blink POS
            </h1>
            <img className="lp-hero__marca" src={LOCKUP} width="1055.42" height="192.85" alt="Blink POS" />
            <h2 className="lp-hero__titular">
              El punto de venta hecho para Venezuela.
              <span className="lp-hero__sub">
                Cobra en dólares o bolívares a la tasa oficial, escanea con el celular y sigue
                vendiendo aunque se caiga la señal.
              </span>
            </h2>
            <p className="lp-hero__cta">
              <Link className="lp-boton lp-boton--primario" to="/app/registro">
                Empezar ahora
              </Link>
              <a className="lp-boton lp-boton--fantasma" href="#como-funciona">
                Ver cómo funciona
                <Icon name="arrowRight" size="sm" />
              </a>
            </p>

            <div className="lp-hero__hardware">
              <div className="lp-hero__escritorio">
                <Ventana
                  src={ventaSrc}
                  etiqueta="Pantalla de Vender con cuatro productos en la cuenta, el total en dólares y bolívares y el botón Cobrar"
                />
              </div>
              <div className="lp-hero__movil">
                <Telefono
                  src={movilVentaSrc}
                  etiqueta="La app de Blink POS en el celular, con la cuenta y los totales de una venta"
                />
              </div>
              <p className="lp-nota-visual">La app real, con datos de ejemplo.</p>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="lp-seccion lp-seccion--oscura lp-beneficios" aria-label="Lo que incluye Blink POS">
          <div className="lp-contenido">
            <ul className="lp-beneficios__rejilla">
              {[
                "Cobra en segundos, desde el mostrador o el celular.",
                "Sigue vendiendo aunque se caiga la señal.",
                "Dólares y bolívares, siempre a la tasa oficial.",
                "Inventario, cuentas e informes incluidos.",
              ].map((texto) => (
                <li className="lp-beneficio" key={texto}>
                  <span className="lp-beneficio__check" aria-hidden="true">
                    <Icon name="check" size="lg" />
                  </span>
                  <h2 className="lp-beneficio__titulo">{texto}</h2>
                </li>
              ))}
            </ul>
            <p className="lp-disponibilidad">
              Para cualquier comercio de <strong>Venezuela</strong>. Sin instalación ni equipos.
            </p>
          </div>
        </section>

        {/* Cómo funciona */}
        <section
          className="lp-seccion lp-seccion--clara lp-configurar"
          id="como-funciona"
          aria-labelledby="como-funciona-titulo"
        >
          <div className="lp-contenido">
            <h2 className="lp-titulo-seccion" id="como-funciona-titulo">
              Tres pasos. Ningún equipo nuevo.
            </h2>
            <Pasos />
          </div>
        </section>

        {/* Escáner móvil */}
        <section className="lp-seccion lp-simple" aria-labelledby="escaner-titulo">
          <div className="lp-contenido">
            <h2 className="lp-titulo-seccion" id="escaner-titulo">
              Tu celular ya es el escáner.
            </h2>
            <p className="lp-cuerpo-icono">
              Lo enlazas una vez con un QR y escaneas desde donde esté el producto.
            </p>
            <div className="lp-fila">
              <div className="lp-fila__visual">
                <Telefono
                  src={movilSrc}
                  etiqueta="La app de Blink POS en el celular, con la cuenta y los totales de una venta"
                />
              </div>
              <div className="lp-fila__texto">
                <h3 className="lp-subtitulo">Sin pistolas láser ni cables.</h3>
                <p className="lp-dos-tonos">
                  <strong>Escanea con la cámara del teléfono.</strong> Abre el escáner, apunta al
                  código de barras y el producto entra en la cuenta que está abierta en la
                  computadora, al instante.
                </p>
                <p className="lp-dos-tonos">
                  <strong>El mismo sistema en las dos pantallas.</strong> La cuenta, el inventario
                  y los totales se actualizan a la vez, así el mostrador y el pasillo trabajan con
                  la misma información.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Confianza */}
        <section className="lp-seccion lp-seccion--oscura lp-seguridad" id="seguridad" aria-labelledby="seguridad-titulo">
          <div className="lp-contenido">
            <h2 className="lp-titulo-seccion" id="seguridad-titulo">
              Pensado para un mostrador real.
            </h2>
            <ul className="lp-seguridad__rejilla">
              <li className="lp-pieza">
                <h3 className="lp-pieza__titulo">Se cae la señal. Tú no.</h3>
                <p className="lp-dos-tonos">
                  Cada venta se guarda en el dispositivo y se sincroniza sola cuando vuelve la
                  conexión. El estado de la conexión queda a la vista para que nunca cobres a
                  ciegas.
                </p>
              </li>
              <li className="lp-pieza">
                <h3 className="lp-pieza__titulo">Los datos de tu negocio son tuyos.</h3>
                <p className="lp-dos-tonos">
                  Cada comercio está separado del resto y solo entra quien tenga su cuenta.
                  Puedes exportar tus datos o pedir su eliminación cuando quieras, sin pedir
                  permiso.
                </p>
              </li>
              <li className="lp-pieza">
                <h3 className="lp-pieza__titulo">El vuelto, sin discusiones.</h3>
                <p className="lp-dos-tonos">
                  La tasa BCV se actualiza sola y cada cobro guarda su tasa, su moneda y su
                  referencia. El arqueo del turno cuadra al céntimo y queda en el historial.
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* Precios */}
        <section className="lp-seccion lp-precios" id="precios" aria-labelledby="precios-titulo">
          <div className="lp-contenido">
            <h2 className="lp-titulo-seccion" id="precios-titulo">
              Un solo plan. Todo incluido.
            </h2>
            <p className="lp-cuerpo-icono">
              Sin comisiones por venta, sin módulos que comprar aparte.
            </p>

            <div className="lp-plan">
              <p className="lp-plan__etiqueta">Blink POS</p>
              <p className="lp-plan__precio">
                <span className="lp-plan__moneda">$</span>25
                <span className="lp-plan__periodo"> / mes</span>
              </p>
              <p className="lp-plan__nota">Por tienda. Cancela cuando quieras.</p>

              <ul className="lp-plan__lista">
                {INCLUYE.map((item) => (
                  <li key={item}>
                    <Icon name="check" size="sm" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="lp-plan__cta">
                <Link className="lp-boton lp-boton--primario" to="/app/registro">
                  Crear mi comercio
                  <Icon name="arrowRight" size="sm" />
                </Link>
                <Link className="lp-boton lp-boton--fantasma" to="/app/entrar">
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Preguntas */}
        <section className="lp-seccion lp-preguntas" id="preguntas" aria-labelledby="preguntas-titulo">
          <div className="lp-contenido lp-contenido--estrecho">
            <h2 className="lp-titulo-seccion" id="preguntas-titulo">
              Las respuestas a tus preguntas.
            </h2>
            <Acordeon items={PREGUNTAS} />
            <ul className="lp-enlaces lp-enlaces--pie">
              <li>
                <Link className="lp-enlace" to="/app/registro">
                  Crear cuenta
                  <Icon name="arrowRight" size="sm" />
                </Link>
              </li>
              <li>
                <Link className="lp-enlace" to="/app/entrar">
                  Entrar a mi comercio
                  <Icon name="arrowRight" size="sm" />
                </Link>
              </li>
              <li>
                <Link className="lp-enlace" to="/app/terminos">
                  Términos de servicio
                  <Icon name="arrowRight" size="sm" />
                </Link>
              </li>
            </ul>
          </div>
        </section>

        {/* Notas */}
        <section className="lp-seccion lp-notas" aria-label="Notas">
          <div className="lp-contenido">
            <ol className="lp-notas__lista">
              <li>
                El catálogo se puede cargar a mano, importar desde un archivo o escanear con el
                celular. El stock se descuenta con cada venta confirmada.
              </li>
              <li>
                Las ventas hechas sin conexión se guardan en el dispositivo y se sincronizan al
                recuperar la señal. El arqueo del turno compara lo cobrado con lo contado.
              </li>
              <li>
                La tasa BCV se consulta automáticamente y puede fijarse a mano desde Ajustes. El
                plan mensual es por tienda y no cobra comisión por venta.
              </li>
            </ol>
          </div>
        </section>
      </main>

      <footer className="lp-pie">
        <div className="lp-contenido">
          <img className="lp-pie__marca" src={LOCKUP} width="1055.42" height="192.85" alt="Blink POS" />
          <div className="lp-pie__fila">
            <p className="lp-pie__legal">Copyright © 2026 Blink POS. Maracaibo, Venezuela.</p>
            <ul className="lp-pie__enlaces">
              <li>
                <Link className="lp-enlace" to="/app/terminos">
                  Términos de servicio
                </Link>
              </li>
              <li>
                <Link className="lp-enlace" to="/app/privacidad">
                  Privacidad
                </Link>
              </li>
              <li>
                <a className="lp-enlace" href="mailto:soporte@blink.com.ve">
                  soporte@blink.com.ve
                </a>
              </li>
              <li>
                <Link className="lp-enlace" to="/app/entrar">
                  Entrar
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      <AvisoCookies />
    </div>
  );
}
