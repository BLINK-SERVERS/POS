// Detección del lector físico (USB/Bluetooth HID).
//
// Un lector se comporta como un teclado: "teclea" el código muy rápido y
// termina con Enter. Distinguimos eso de una persona por el tiempo entre
// teclas. La lógica vive aquí, separada de React, para poder probarla.

/** Máximo tiempo entre teclas para considerar que es un lector (no humano). */
export const HID_KEY_GAP_MS = 70;
/** Longitud mínima del código del lector. */
export const HID_MIN_LEN = 5;

export interface HidState {
  buffer: string;
  lastAt: number;
}

export interface HidStep {
  state: HidState;
  /** Código completo cuando el lector termina (Enter/Tab); si no, null. */
  code: string | null;
}

export const initialHidState = (): HidState => ({ buffer: "", lastAt: 0 });

/** Procesa una tecla. Devuelve el estado nuevo y, si se completó, el código. */
export function hidKey(state: HidState, key: string, at: number): HidStep {
  // Un hueco largo reinicia: era una persona escribiendo, no un lector.
  const buffer = at - state.lastAt > HID_KEY_GAP_MS ? "" : state.buffer;

  if (key === "Enter" || key === "Tab") {
    const code = buffer.trim();
    return {
      state: { buffer: "", lastAt: at },
      code: code.length >= HID_MIN_LEN ? code : null,
    };
  }
  if (key.length === 1) {
    return { state: { buffer: buffer + key, lastAt: at }, code: null };
  }
  return { state: { buffer, lastAt: at }, code: null };
}
