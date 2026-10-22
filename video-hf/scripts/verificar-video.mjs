/**
 * Verifica el MP4 final: duracion, resolucion, fps, numero de
 * fotogramas y si la pista de audio lleva sonido (no silencio).
 *
 * Uso: node scripts/verificar-video.mjs "../BLINK-COMERCIAL-HF.mp4"
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const OBJETIVO = {
  duracion: 30,
  fps: 60,
  fotogramas: 1800,
};

const ruta = process.argv[2] || "../BLINK-COMERCIAL-HF.mp4";
const absoluta = path.resolve(ruta);

if (!fs.existsSync(absoluta)) {
  console.error("No existe:", absoluta);
  process.exit(1);
}

const ffprobe = (args) =>
  execFileSync("ffprobe", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

/* --- El contenedor --- */
const meta = JSON.parse(
  ffprobe([
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    absoluta,
  ])
);

const formato = meta.format;
const video = meta.streams.find((s) => s.codec_type === "video");
const audio = meta.streams.find((s) => s.codec_type === "audio");

console.log("=== archivo ===");
console.log("  ruta      :", absoluta);
console.log("  tamano    :", (Number(formato.size) / 1024 / 1024).toFixed(2), "MB");
console.log("  duracion  :", Number(formato.duration).toFixed(3), "s");
console.log("  contenedor:", formato.format_name);

/* --- El video --- */
const fotogramas = Number(
  ffprobe([
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-count_frames",
    "-show_entries",
    "stream=nb_read_frames",
    "-of",
    "default=nokey=1:noprint_wrappers=1",
    absoluta,
  ]).trim()
);

const partesFps = String(video.avg_frame_rate).split("/");
const fps = Number(partesFps[1]) ? Number(partesFps[0]) / Number(partesFps[1]) : 0;

console.log("\n=== video ===");
console.log("  codec     :", video.codec_name, "| perfil", video.profile);
console.log("  resolucion:", video.width + "x" + video.height);
console.log("  fps       :", fps.toFixed(3), "(" + video.avg_frame_rate + ")");
console.log("  fotogramas:", fotogramas);

/* --- El audio --- */
console.log("\n=== audio ===");
if (!audio) {
  console.log("  no hay pista de audio");
} else {
  console.log("  codec     :", audio.codec_name);
  console.log("  muestreo  :", audio.sample_rate, "Hz ·", audio.channels, "canales");

  /* El nivel real: si el pico es 0, el video mudo.
     ffmpeg escribe el informe de astats en stderr, hay que leerlo de
     ahi (spawnSync, no execFileSync). */
  const corrida = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", absoluta, "-map", "0:a:0", "-af", "astats=metadata=1:reset=0", "-f", "null", "-"],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
  );
  const stats = `${corrida.stdout || ""}\n${corrida.stderr || ""}`;
  const pico = /Peak level dB:\s*(-?[\d.]+|-inf)/.exec(stats);
  const rms = /RMS level dB:\s*(-?[\d.]+|-inf)/.exec(stats);
  const nivelPico = pico ? pico[1] : "?";
  const nivelRms = rms ? rms[1] : "?";
  console.log("  pico dB   :", nivelPico);
  console.log("  rms dB    :", nivelRms);
  console.log(
    "  sonido    :",
    nivelPico === "-inf" || nivelPico === "?"
      ? "no se pudo medir"
      : "hay audio"
  );
}

/* --- El veredicto --- */
const problemas = [];
const duracion = Number(formato.duration);
if (Math.abs(duracion - OBJETIVO.duracion) > 0.15)
  problemas.push(`duracion ${duracion.toFixed(2)} s (se esperaba ${OBJETIVO.duracion} s)`);
if (Math.abs(fps - OBJETIVO.fps) > 0.01)
  problemas.push(`fps ${fps} (se esperaba ${OBJETIVO.fps})`);
if (video.width !== 1920 || video.height !== 1080)
  problemas.push(`resolucion ${video.width}x${video.height} (se esperaba 1920x1080)`);
if (Math.abs(Number(fotogramas) - OBJETIVO.fotogramas) > 1)
  problemas.push(`fotogramas ${fotogramas} (se esperaban ${OBJETIVO.fotogramas})`);

console.log("\n=== veredicto ===");
if (problemas.length === 0) {
  console.log("  OK: 30 s, 1920x1080, 60 fps, 1800 fotogramas.");
} else {
  for (const p of problemas) console.log("  !", p);
  process.exitCode = 1;
}
