// Páginas legales públicas (términos y privacidad).
//
// Se muestran sin sesión porque son la referencia contractual de la landing.
// El contenido vive aquí (y no en un CMS) para que la web funcione aunque
// Supabase no esté disponible.
import { Link } from "react-router-dom";

type LegalKind = "terminos" | "privacidad";

/** Bloque simple: un subtítulo con su párrafo. */
type Block = { h: string; p: string };
/** Bloque con subsecciones: un subtítulo y varios incisos con título propio. */
type Section = { h: string; items: { h: string; p: string }[] };

const TERMINOS: { intro: string; blocks: (Block | Section)[] } = {
  intro:
    "¡Bienvenido a Blink! Nos alegra mucho que uses nuestra plataforma para gestionar tu negocio. Queremos que tengas la mejor experiencia posible, por lo que hemos redactado estos términos de forma sencilla y transparente. Al registrarte o utilizar nuestros servicios, estás aceptando estas reglas. Tómate un momento para leerlas.",
  blocks: [
    {
      h: "1. Tu cuenta y tu espacio",
      items: [
        {
          h: "Tu responsabilidad",
          p: "Eres el único responsable de mantener la seguridad de tu contraseña y de todo lo que ocurre dentro de tu cuenta. Si compartes tus datos de acceso o eres descuidado con la seguridad, no podemos hacernos responsables por accesos no autorizados.",
        },
        {
          h: "Tus datos son tuyos",
          p: "Toda la información que subas a tu tienda (tu inventario, tus precios, el registro de tus ventas y la información de tus clientes) te pertenece al 100%. Nosotros solo te prestamos la plataforma para que los organices y operes tu negocio.",
        },
      ],
    },
    {
      h: "2. Pagos, Suscripciones y Política de Reembolsos",
      items: [
        {
          h: "El costo del servicio",
          p: "Blink funciona mediante una suscripción mensual por tienda de $25 USD (o su equivalente en los métodos de pago aceptados).",
        },
        {
          h: "Métodos de pago autorizados",
          p: "Los pagos se realizan y se reportan a través de los canales oficiales habilitados en la plataforma (como Pago Móvil o Binance Pay).",
        },
        {
          h: "Vigencia y suspensión",
          p: "Cada pago activa tu acceso por 30 días continuos. Si llega la fecha de corte y no se ha verificado tu renovación, el acceso a tu tienda y al sistema de cobro se suspenderá temporalmente hasta que te pongas al día. No borramos tus datos de inmediato, pero no podrás usarlos hasta renovar.",
        },
        {
          h: "Política de No Reembolsos",
          p: "Todas las compras y pagos de suscripciones realizados en Blink son definitivos y no son reembolsables. Una vez procesado el pago de tu mensualidad, no se devolverá el dinero total ni parcial, independientemente de si decidiste dejar de usar el servicio antes de que termine el mes o si tu tienda estuvo inactiva.",
        },
      ],
    },
    {
      h: '3. El funcionamiento del servicio ("Tal cual")',
      items: [
        {
          h: "Imprevistos fuera de nuestro alcance",
          p: "Nos esforzamos muchísimo para que Blink funcione a la perfección todos los días. Sin embargo, el servicio se ofrece \"tal cual\" y \"según disponibilidad\". Blink no se hace responsable por interrupciones, retrasos o caídas del servicio causadas por factores externos, tales como fallas en el servicio eléctrico, cortes de internet de tu zona, problemas con los servidores en la nube que utilizamos, o cualquier otra situación de fuerza mayor.",
        },
        {
          h: "No asumimos compensaciones económicas",
          p: "No asumimos compensaciones económicas por lucro cesante, ventas perdidas o daños indirectos si la plataforma llegara a fallar temporalmente.",
        },
      ],
    },
    {
      h: "4. Uso adecuado de la plataforma",
      p: "Te comprometes a utilizar Blink de forma honesta y exclusivamente para fines comerciales legales, cumpliendo con las leyes de la República Bolivariana de Venezuela. Queda totalmente prohibido utilizar el sistema para actividades fraudulentas, ilícitas o que pongan en riesgo la seguridad de la plataforma o de otros usuarios.",
    },
    {
      h: "5. Propiedad intelectual de Blink",
      p: "Todo el diseño, la imagen visual, los logotipos, el nombre y la tecnología detrás de Blink son propiedad exclusiva de sus creadores. Está totalmente prohibido copiar, modificar, imitar o intentar extraer el código o la estructura de la plataforma sin autorización previa por escrito.",
    },
    {
      h: "6. Privacidad",
      p: "Tu información personal y la de tu negocio se manejan con total discreción. No vendemos, alquilamos ni compartimos tus datos internos con terceros. Utilizamos medidas de seguridad estrictas para que la información de cada tienda se mantenga privada y separada de las demás.",
    },
    {
      h: "7. Cambios en los términos",
      p: "Podemos actualizar estos Términos y Condiciones de vez en cuando para reflejar mejoras en el servicio. Si hacemos cambios importantes, te avisaremos a través de la plataforma. Si continúas usando Blink después de los cambios, significa que los aceptas.",
    },
    {
      h: "8. Cancelaciones",
      p: "Puedes dejar de usar Blink cuando quieras simplemente decidiendo no renovar tu siguiente mes. Si en algún momento deseas cerrar tu cuenta definitivamente y borrar todos tus datos de nuestros registros, puedes solicitarlo directamente a través de nuestro soporte.",
    },
  ],
};

const PRIVACIDAD: { intro: string; blocks: (Block | Section)[] } = {
  intro:
    "Tu información personal y la de tu negocio se manejan con total discreción. En esta página explicamos qué datos tratamos, con qué finalidad y cómo los protegemos.",
  blocks: [
    {
      h: "1. Datos que tratamos",
      p: "Datos de la cuenta (correo electrónico, nombre del comercio, RIF, teléfono y dirección), datos operativos de ventas e inventario, y registros de auditoría de las acciones críticas realizadas en la caja.",
    },
    {
      h: "2. Finalidad",
      p: "Usamos los datos exclusivamente para prestar el servicio: procesar ventas, emitir comprobantes, mantener el historial contable, calcular la tasa de cambio de referencia y ofrecer soporte técnico.",
    },
    {
      h: "3. Almacenamiento local y nube",
      p: "Los datos de operación se guardan primero en el dispositivo para que el POS siga funcionando sin conexión. Se sincronizan de forma cifrada con la nube cuando la señal regresa. La información de cada tienda se mantiene privada y separada de las demás.",
    },
    {
      h: "4. Terceros",
      p: "Solo compartimos información con proveedores estrictamente necesarios para operar el servicio: Supabase (alojamiento de base de datos y sincronización) y la fuente de la tasa oficial de cambio. No vendemos, alquilamos ni compartimos tus datos internos con terceros con fines publicitarios.",
    },
    {
      h: "5. Retención y eliminación",
      p: "Conservamos los registros contables durante el tiempo que la normativa aplicable exija. Puedes solicitar la eliminación de tu cuenta y de los datos no sujetos a obligación de conservación desde el correo de soporte.",
    },
    {
      h: "6. Tus derechos",
      p: "Puedes acceder, corregir, exportar o eliminar tus datos escribiendo a soporte@blink.com.ve. Responderemos dentro de los plazos previstos por la ley de protección de datos aplicable en Venezuela.",
    },
    {
      h: "7. Cambios",
      p: "Esta política puede actualizarse. Publicaremos la versión vigente en esta misma página y, ante cambios sustanciales, avisaremos al correo registrado de la cuenta.",
    },
  ],
};

const CONTENT: Record<LegalKind, { title: string; subtitle: string; intro: string; blocks: (Block | Section)[] }> = {
  terminos: {
    title: "Términos y Condiciones de Uso",
    subtitle: "Blink · Última actualización: Octubre de 2026",
    intro: TERMINOS.intro,
    blocks: TERMINOS.blocks,
  },
  privacidad: {
    title: "Política de Privacidad",
    subtitle: "Blink · Última actualización: Octubre de 2026",
    intro: PRIVACIDAD.intro,
    blocks: PRIVACIDAD.blocks,
  },
};

export function Legal({ kind }: { kind: LegalKind }) {
  const c = CONTENT[kind];
  return (
    <div className="ld-legal">
      <header className="ld-legal__bar">
        <Link to="/" className="ld-logo" aria-label="BLINK POS, inicio">
          <span className="ld-logo__blink">BLINK</span>
          <span className="ld-logo__pos">POS</span>
        </Link>
        <Link className="ld-btn ld-btn--ghost" to="/app/entrar">
          Iniciar Sesión
        </Link>
      </header>

      <main className="ld-legal__main">
        <h1>{c.title}</h1>
        <p className="ld-legal__sub">{c.subtitle}</p>
        <p className="ld-legal__intro">{c.intro}</p>

        {c.blocks.map((b) =>
          "items" in b ? (
            <section key={b.h}>
              <h2>{b.h}</h2>
              {b.items.map((it) => (
                <div className="ld-legal__item" key={it.h}>
                  <h3>{it.h}</h3>
                  <p>{it.p}</p>
                </div>
              ))}
            </section>
          ) : (
            <section key={b.h}>
              <h2>{b.h}</h2>
              <p>{b.p}</p>
            </section>
          )
        )}

        <p className="ld-legal__foot">
          ¿Dudas?{" "}
          <a href="mailto:soporte@blink.com.ve">soporte@blink.com.ve</a>
        </p>
      </main>
    </div>
  );
}
