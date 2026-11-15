// Entrada de código de verificación (8 casillas). Soporta pegado.
//
// La longitud y la validación viven en `lib/otp.ts`: el servidor emite 8
// dígitos (`mailer_otp_length`, medido el 2026-11-15) y no hay que mover dos
// sitios si ese valor cambia.
import { useRef, type ClipboardEvent, type KeyboardEvent, type ChangeEvent } from "react";
import { CODIGO_LARGO } from "../lib/otp";

const LEN = CODIGO_LARGO;

export function OtpInput({
  value,
  onChange,
  disabled,
  autoFocus = true,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = Array.from({ length: LEN }, (_, i) => value[i] ?? "");

  function setAt(index: number, char: string) {
    const next = chars.slice();
    next[index] = char;
    onChange(next.join("").replace(/\s/g, "").slice(0, LEN));
  }

  function handleInput(index: number, e: ChangeEvent<HTMLInputElement>) {
    const digitos = e.target.value.replace(/[^0-9]/g, "");
    if (!digitos) {
      // Sólo un borrado real deja el campo vacío. Un carácter que no es
      // dígito no debe borrar lo que había en la casilla: si lo borramos,
      // los demás dígitos se desplazan y el código queda mutilado.
      if (e.target.value === "") setAt(index, "");
      else e.target.value = chars[index];
      return;
    }
    const next = chars.slice();
    let cursor = index;
    for (const ch of digitos) {
      if (cursor >= LEN) break;
      next[cursor] = ch;
      cursor += 1;
    }
    onChange(next.join("").slice(0, LEN));
    const focusTo = Math.min(cursor, LEN - 1);
    refs.current[focusTo]?.focus();
  }

  function handleKey(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !chars[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < LEN - 1) refs.current[index + 1]?.focus();
    // Ninguna tecla que no sea dígito llega a escribirse en la casilla.
    if (
      e.key.length === 1 &&
      !/^\d$/.test(e.key) &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      e.preventDefault();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const raw = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, LEN);
    if (!raw) return;
    onChange(raw);
    refs.current[Math.min(raw.length, LEN - 1)]?.focus();
  }

  return (
    <div className="otp" role="group" aria-label="Código de verificación">
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="otp__box"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          maxLength={1}
          disabled={disabled}
          value={c}
          aria-label={`Dígito ${i + 1}`}
          onChange={(e) => handleInput(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
