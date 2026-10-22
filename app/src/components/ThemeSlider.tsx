// Control deslizante de apariencia (sol ↔ luna).
//
// HIG · Sliders: el control es un interruptor tactil con un knob que
// se desplaza. Aqui el knob lleva dentro el icono del modo EN
// vigor (sol a la izquierda, luna a la derecha), de modo que se
// ve de un vistazo que tema esta activo.
//
// Ademas del control hay un boton "Automatico": la app sigue al
// sistema hasta que el usuario toca el control, y entonces el
// control manda.
import { useRef } from "react";
import { Icon } from "./Icon";
import { useTema } from "../lib/tema";

export function ThemeSlider() {
  const { modo, esOscuro, setModo } = useTema();
  const track = useRef<HTMLDivElement>(null);

  /* Arrastre del knob: el control tambien se puede arrastrar. */
  const alArrastrar = (e: React.PointerEvent<HTMLDivElement>) => {
    const caja = track.current?.getBoundingClientRect();
    if (!caja) return;
    const x = e.clientX - caja.left;
    setModo(x < caja.width / 2 ? "claro" : "oscuro");
  };

  return (
    <div className="temaslider">
      <div
        className="temaslider__track"
        ref={track}
        onPointerDown={alArrastrar}
        role="presentation"
      >
        <span className="temaslider__extremo temaslider__extremo--sol" aria-hidden>
          <Icon name="sun" size="sm" />
        </span>
        <span className="temaslider__extremo temaslider__extremo--luna" aria-hidden>
          <Icon name="moon" size="sm" />
        </span>
        <span
          className={"temaslider__knob" + (esOscuro ? " is-dark" : " is-light")}
          aria-hidden
        >
          <Icon name={esOscuro ? "moon" : "sun"} size="sm" />
        </span>
      </div>

      <div className="temaslider__pie">
        <button
          type="button"
          className="temaslider__label"
          aria-pressed={modo === "claro"}
          onClick={() => setModo("claro")}
        >
          Claro
        </button>
        <button
          type="button"
          className={"temaslider__auto" + (modo === "auto" ? " is-on" : "")}
          aria-pressed={modo === "auto"}
          onClick={() => setModo("auto")}
        >
          Automático
        </button>
        <button
          type="button"
          className="temaslider__label"
          aria-pressed={modo === "oscuro"}
          onClick={() => setModo("oscuro")}
        >
          Oscuro
        </button>
      </div>

      <p className="field__hint temaslider__hint">
        {modo === "auto" &&
          "Ahora mismo la app usa el tema que tenga configurado el sistema."}
        {modo === "claro" && "Ahora mismo la app se muestra siempre en claro."}
        {modo === "oscuro" && "Ahora mismo la app se muestra siempre en oscuro."}
      </p>
    </div>
  );
}
