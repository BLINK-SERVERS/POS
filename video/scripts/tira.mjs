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
const TIRA = path.join(BASE, "capturas", "tira.png");

execFileSync(
  FFMPEG,
  [
    "-y",
    "-i",
    MP4,
    "-vf",
    "fps=1/6,scale=320:-1,tile=5x3",
    "-frames:v",
    "1",
    "-update",
    "1",
    TIRA,
  ],
  { stdio: ["ignore", "ignore", "pipe"] }
);
console.log("tira:", TIRA);
