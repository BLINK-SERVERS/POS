/**
 * Verifica el MP4 final: duracion, pistas de audio y fotogramas sueltos.
 * Uso: node scripts/verificar-video.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(HERE, "..");
const MP4 = path.join(BASE, "BLINK-COMERCIAL.mp4");
const CAPTURAS = path.join(BASE, "capturas");

const FFPROBE = path.join(
  BASE,
  "node_modules",
  "@remotion",
  "compositor-win32-x64-msvc",
  "ffprobe.exe"
);
const FFMPEG = path.join(
  BASE,
  "node_modules",
  "@remotion",
  "compositor-win32-x64-msvc",
  "ffmpeg.exe"
);

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
console.log(`  tamaño      : ${(fs.statSync(MP4).size / 1024 / 1024).toFixed(1)} MB`);
console.log(`  video       : ${v.codec_name} ${v.width}x${v.height} · ${v.r_frame_rate} fps · ${v.nb_frames} fotogramas`);
console.log(`  duracion    : ${info.format.duration} s`);
console.log(`  audio       : ${a ? a.codec_name + " · " + a.channels + " canales · " + a.sample_rate + " Hz" : "SIN AUDIO"}`);

const esperado = 89;
const real = parseFloat(info.format.duration);
console.log(`  duracion esperada: ${esperado} s -> ${Math.abs(real - esperado) < 1.5 ? "ok" : "DESVIA"}`);

/* Una tira de fotogramas para revisarla de un vistazo. */
const tira = path.join(CAPTURAS, "tira.png");
if (fs.existsSync(FFMPEG)) {
  execFileSync(FFMPEG, [
    "-y", "-i", MP4,
    "-vf", "fps=1/6,scale=320:-1,tile=5x3",
    "-frames:v", "1", tira,
  ], { stdio: "ignore" });
  console.log("  tira de 15 fotogramas:", tira);
}
