// Feedback sonoro del POS. Sin dependencias: Web Audio.
//
// El navegador solo permite crear/activar el audio tras una interacción del
// usuario, así que hay que "desbloquear" el contexto una vez. `primeBeeper`
// se llama en el primer gesto (scroll, toque, tecla) y deja el contexto
// listo para que el beep salga al instante cuando llegue un escaneo.

let ctx: AudioContext | null = null;
let primed = false;

type AudioCtor = typeof AudioContext;

function audioCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext ?? null;
}

/** Devuelve (y crea si hace falta) el contexto de audio. */
function ensureCtx(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = audioCtor();
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

/**
 * Desbloquea el audio en el primer gesto del usuario. Se puede llamar muchas
 * veces: a partir de la segunda no hace nada.
 */
export function primeBeeper(): void {
  if (primed) return;
  const c = ensureCtx();
  if (!c) return;
  try {
    if (c.state === "suspended") void c.resume();
    primed = true;
  } catch {
    /* sin audio disponible */
  }
}

/**
 * Beep de escaneo correcto: un tono corto y brillante. Es lo que confirma al
 * cajero, sin mirar la pantalla, que el lector leyó.
 */
export function beepOk(): void {
  beep([{ f: 1180, t: 0, d: 0.085 }], 0.17);
}

/**
 * Beep de error (código no reconocido): dos tonos descendentes y suaves.
 * No es estridente: solo avisa de que hay que mirar la pantalla.
 */
export function beepError(): void {
  beep(
    [
      { f: 520, t: 0, d: 0.11 },
      { f: 380, t: 0.13, d: 0.14 },
    ],
    0.14
  );
}

interface Tone {
  /** Frecuencia en Hz. */
  f: number;
  /** Retardo en segundos desde el disparo. */
  t: number;
  /** Duración en segundos. */
  d: number;
}

function beep(tones: Tone[], peak: number): void {
  const c = ensureCtx();
  if (!c) return;
  try {
    if (c.state === "suspended") void c.resume();
    const now = c.currentTime;
    for (const tone of tones) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      const start = now + tone.t;
      const end = start + tone.d;
      osc.type = "square";
      osc.frequency.setValueAtTime(tone.f, start);
      // Envolvente corta para evitar clics y no sonar agresivo.
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(gain).connect(c.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    }
  } catch {
    /* audio no disponible: el POS sigue funcionando en silencio */
  }
}
