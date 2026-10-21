import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(HERE, "..");
const FFMPEG = path.join(
  BASE,
  "node_modules",
  "@remotion",
  "compositor-win32-x64-msvc",
  "ffmpeg.exe"
);
const MP4 = path.join(BASE, "BLINK-COMERCIAL.mp4");

/** Segundos que se extraen del video final. */
const MOMENTOS = [1.2, 6.7, 10.7, 18.3, 28.3, 36, 44, 52, 58, 62, 73.3, 86.5];

for (const s of MOMENTOS) {
  const destino = path.join(BASE, "capturas", `video-${String(s).replace(".", "_")}s.png`);
  execFileSync(
    FFMPEG,
    ["-y", "-ss", String(s), "-i", MP4, "-frames:v", "1", "-update", "1", destino],
    { stdio: ["ignore", "ignore", "ignore"] }
  );
}
console.log(`${MOMENTOS.length} fotogramas extraidos del video final`);
