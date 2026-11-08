import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import {
  avisoDescartado,
  descartarAviso,
  instalar,
  modoInstalacion,
  suscribirInstalacion,
} from "../lib/instalacion";

/**
 * Tarjeta flotante para instalar la app.
 *
 * Solo se monta en la pantalla de inicio y con la sesión abierta: la landing
 * pública y el resto de módulos no la muestran. Cuando el navegador ofrece su
 * propio diálogo, el evento ya viene interceptado desde el arranque, así que
 * Chrome nunca enseña su cartel.
 */
export function AvisoInstalacion({ visible }: { visible: boolean }) {
  const [, refrescar] = useState(0);

  useEffect(() => suscribirInstalacion(() => refrescar((n) => n + 1)), []);

  const modo = modoInstalacion();
  if (!visible || !modo || avisoDescartado()) return null;

  return (
    <aside className="instalacion" aria-label="Instalar Blink POS">
      <div className="instalacion__cabecera">
        <img
          className="instalacion__icono"
          src={`${import.meta.env.BASE_URL}icons/icon-192.png`}
          width="44"
          height="44"
          alt=""
          draggable={false}
        />
        <div className="instalacion__texto">
          <strong>Lleva Blink POS contigo</strong>
          {modo === "nativo" ? (
            <span>Abre la app directamente, sin pasar por el navegador.</span>
          ) : modo === "ios" ? (
            <span>
              Toca <Icon name="share" size="sm" className="instalacion__glifo" />
              <span className="instalacion__glifo-texto">Compartir</span> y elige «Añadir a pantalla de
              inicio».
            </span>
          ) : (
            <span>Abre el menú del navegador y elige «Añadir a pantalla de inicio».</span>
          )}
        </div>
      </div>

      <div className="instalacion__acciones">
        {modo === "nativo" ? (
          <>
            <button type="button" className="btn btn--ghost btn--sm" onClick={descartarAviso}>
              Ahora no
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => void instalar()}>
              Instalar
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--primary btn--sm" onClick={descartarAviso}>
            Entendido
          </button>
        )}
      </div>
    </aside>
  );
}
