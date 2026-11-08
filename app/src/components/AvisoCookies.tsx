import { useState } from "react";
import { Link } from "react-router-dom";
import {
  faltaConsentimiento,
  guardarConsentimiento,
  type DecisionCookies,
} from "../lib/cookies";

const OPCIONES: { decision: DecisionCookies; etiqueta: string; clase: string }[] = [
  { decision: "rechazado", etiqueta: "Rechazar", clase: "cookies__boton--fantasma" },
  { decision: "necesarias", etiqueta: "Solo las necesarias", clase: "cookies__boton--secundario" },
  { decision: "todas", etiqueta: "Aceptar todas", clase: "cookies__boton--primario" },
];

/**
 * Aviso de cookies de la landing pública.
 *
 * Se queda hasta que la persona elija una de las tres respuestas; la decisión
 * se guarda en `lib/cookies.ts` y no vuelve a preguntarse. La tarjeta sigue el
 * material de la hoja del sistema, igual que el aviso de instalación.
 */
export function AvisoCookies() {
  const [visible, setVisible] = useState(faltaConsentimiento);
  if (!visible) return null;

  function decidir(decision: DecisionCookies) {
    guardarConsentimiento(decision);
    setVisible(false);
  }

  return (
    <aside className="cookies" aria-labelledby="cookies-titulo">
      <h2 className="cookies__titulo" id="cookies-titulo">
        Cookies y almacenamiento local
      </h2>
      <p className="cookies__texto">
        Usamos lo necesario para que Blink POS funcione: guardar tu sesión, los ajustes
        del turno y la copia local de tu catálogo. Nada de publicidad ni seguimiento de
        terceros.{" "}
        <Link className="cookies__enlace" to="/app/privacidad">
          Política de privacidad
        </Link>
      </p>
      <div className="cookies__acciones">
        {OPCIONES.map((opcion) => (
          <button
            key={opcion.decision}
            type="button"
            className={`cookies__boton ${opcion.clase}`}
            onClick={() => decidir(opcion.decision)}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>
    </aside>
  );
}
