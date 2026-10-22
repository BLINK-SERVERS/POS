/**
 * Sintetiza los efectos de sonido de UI del comercial (clic, pop,
 * swoosh y ding) en WAV: son pulsos cortos, de timbre seco, que encajan
 * con el ritmo percusivo de la musica.
 *
 * Uso: node scripts/generar-sfx.mjs
 */
import fs from "node:fs";
import path from "node:path";

const BASE = "C:/Users/prodz/Desktop/BLINK POS/video-hf";
const OUT = path.join(BASE, "assets", "audio");
fs.mkdirSync(OUT, { recursive: true });

const TASA = 48000;

/** Escribe un WAV de 16 bits mono. */
function escribirWav(ruta, muestras) {
  const datos = Buffer.alloc(muestras.length * 2);
  for (let i = 0; i < muestras.length; i++) {
    const v = Math.max(-1, Math.min(1, muestras[i]));
    datos.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const cab = Buffer.alloc(44);
  cab.write("RIFF", 0);
  cab.writeUInt32LE(36 + datos.length, 4);
  cab.write("WAVE", 8);
  cab.write("fmt ", 12);
  cab.writeUInt32LE(16, 16);
  cab.writeUInt16LE(1, 20); // PCM
  cab.writeUInt16LE(1, 22); // mono
  cab.writeUInt32LE(TASA, 24);
  cab.writeUInt32LE(TASA * 2, 28);
  cab.writeUInt16LE(2, 32);
  cab.writeUInt16LE(16, 34);
  cab.write("data", 36);
  cab.writeUInt32LE(datos.length, 40);
  fs.writeFileSync(ruta, Buffer.concat([cab, datos]));
  return datos.length / 2 / TASA;
}

/** Ruido determinista (misma semilla en cada ejecucion). */
function ruido(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s / 4294967296) * 2 - 1;
  };
}

/** Un filtro paso banda simple, para el swoosh. */
function pasoBanda(x, freq, q, tasa) {
  const w = (2 * Math.PI * freq) / tasa;
  const alpha = Math.sin(w) / (2 * q);
  const b0 = alpha;
  const b2 = -alpha;
  const a0 = 1 + alpha;
  const a1 = -2 * Math.cos(w);
  const a2 = 1 - alpha;
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  return (entrada) => {
    const y = (b0 * entrada + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1;
    x1 = entrada;
    y2 = y1;
    y1 = y;
    return y;
  };
}

/* --- El clic: un toque seco, con transitorio de ruido --- */
{
  const dur = 0.055;
  const n = Math.round(TASA * dur);
  const r = ruido(7);
  const m = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / TASA;
    const env = Math.exp(-t * 90);
    m[i] = (Math.sin(2 * Math.PI * 1900 * t) * 0.55 + r() * 0.45 * Math.exp(-t * 420)) * env;
  }
  console.log("clic.wav  ", escribirWav(path.join(OUT, "clic.wav"), m).toFixed(3), "s");
}

/* --- El pop: un blip que sube --- */
{
  const dur = 0.11;
  const n = Math.round(TASA * dur);
  const m = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / TASA;
    const f = 420 + 1500 * Math.min(1, t * 14);
    const env = Math.exp(-t * 26);
    m[i] = Math.sin(2 * Math.PI * f * t) * env * 0.8;
  }
  console.log("pop.wav   ", escribirWav(path.join(OUT, "pop.wav"), m).toFixed(3), "s");
}

/* --- El swoosh: un barrido de ruido filtrado --- */
{
  const dur = 0.5;
  const n = Math.round(TASA * dur);
  const r = ruido(21);
  const m = new Float32Array(n);
  let f = 400;
  for (let i = 0; i < n; i++) {
    const t = i / TASA;
    const p = t / dur;
    f = 400 + 3600 * Math.sin(p * Math.PI);
    const filtro = pasoBanda(0, f, 1.4, TASA);
    const y = filtro(r());
    const env = Math.sin(p * Math.PI) ** 1.4;
    m[i] = y * env * 0.7;
  }
  console.log("swoosh.wav", escribirWav(path.join(OUT, "swoosh.wav"), m).toFixed(3), "s");
}

/* --- El ding: la confirmacion de la venta --- */
{
  const dur = 0.85;
  const n = Math.round(TASA * dur);
  const m = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / TASA;
    const env = Math.exp(-t * 4.2);
    m[i] =
      (Math.sin(2 * Math.PI * 1318.5 * t) * 0.5 +
        Math.sin(2 * Math.PI * 1975.5 * t) * 0.28 +
        Math.sin(2 * Math.PI * 2637 * t) * 0.12) *
      env *
      0.75;
  }
  console.log("ding.wav  ", escribirWav(path.join(OUT, "ding.wav"), m).toFixed(3), "s");
}
