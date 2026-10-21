import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(HERE, "..");
const MP4 = path.join(BASE, "BLINK-COMERCIAL.mp4");
const CAPTURAS = path.join(BASE, "capturas");

const COMPOSITOR = path.join(BASE, "node_modules", "@remotion", "compositor-win32-x64-msvc");
const FFPROBE = path.join(COMPOSITOR, "ffprobe.exe");

const probe = (args) => execFileSync(FFPROBE, args, { encoding: "utf8" });

if (!fs.existsSync(MP4)) {
  console.log("FALLO: no existe", MP4);
  process.exit(1);
}

const info = JSON.parse(
  probe(["-v", "error", "-show_format", "-show_streams", "-of", "json", MP4])
);

const v = info.streams.find((s) => s.codec_type === "video");
const a = info.streams.find((s) => s.codec_type === "audio");

console.log("=== BLINK-COMERCIAL.mp4 ===");
console.log(`  tamaño   : ${(fs.statSync(MP4).size / 1024 / 1024).toFixed(1)} MB`);
console.log(`  video    : ${v.codec_name} ${v.width}x${v.height} · ${v.r_frame_rate} fps · ${v.nb_frames} fotogramas`);
console.log(`  duracion : ${info.format.duration} s`);
console.log(`  audio    : ${a ? a.codec_name + " · " + a.channels + " canales · " + a.sample_rate + " Hz" : "SIN AUDIO"}`);

const real = parseFloat(info.format.duration);
const esperado = 89;
const okDur = Math.abs(real - esperado) < 1.5;
console.log(`  duracion esperada ${esperado} s -> ${okDur ? "ok" : "DESVIA"}`);

/* Comprobaciones minima del guion. */
const fallos = [];
if (!okDur) fallos.push("la duracion no cuadra con la pista");
if (!a) fallos.push("no hay pista de audio");
if (v.width !== 1920 || v.height !== 1080) fallos.push("no es 1920x1080");
if (v.nb_frames !== 2670) fallos.push(`faltan fotogramas (${v.nb_frames})`);

console.log(fallos.length === 0 ? "\nTodo correcto." : `\nFALLOS: ${fallos.join(" · ")}`);
process.exit(fallos.length === 0 ? 0 : 1);
