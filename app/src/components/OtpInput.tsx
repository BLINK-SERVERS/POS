// Entrada de código de verificación (6 casillas). Soporta pegado.
import { useRef, type ClipboardEvent, type KeyboardEvent, type ChangeEvent } from "react";

const LEN = 6;

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
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (!raw) {
      setAt(index, "");
      return;
    }
    const next = chars.slice();
    let cursor = index;
    for (const ch of raw) {
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
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const raw = e.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, LEN);
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
          inputMode="text"
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
