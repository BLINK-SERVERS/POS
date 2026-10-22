/**
 * Genera los dos recortes (9:16 y 1:1) del master 16:9 con ffmpeg.
 *
 * El lienzo entra completo (nada se corta) a 1080x608 y se apoya sobre
 * un marco de marca: en vertical, azul noche #0A0F1D con la firma; en
 * cuadrado, el mismo azul. Debajo va el rotulo con la marca, la web y la
 * fecha de lanzamiento.
 *
 * Uso: node scripts/recortar.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const BASE = "C:/Users/prodz/Desktop/BLINK POS";
const MAESTRO = path.join(BASE, "BLINK-COMERCIAL-HF.mp4");

if (!fs.existsSync(MAESTRO)) {
  console.error("No existe el master:", MAESTRO);
  process.exit(1);
}

/* La tipografia del rotulo: la del sistema, que ya esta en el equipo. */
const NEGRITA = "C\\:/Windows/Fonts/arialbd.ttf";
const NORMAL = "C\\:/Windows/Fonts/arial.ttf";

/* El marco: la banda de video mide 1080x608 (el 16:9 completo). */
const BANDA = 608;

function recorte({ salida, ancho, alto, y, fondo, rotulos }) {
  const filtros = [
    `scale=${ancho}:${BANDA}`,
    `pad=${ancho}:${alto}:0:${y}:color=${fondo}`,
  ];

  for (const r of rotulos) {
    filtros.push(
      `drawtext=fontfile='${r.fuente}':text='${r.texto}':fontcolor=${r.color}:fontsize=${r.tamano}:x=(w-text_w)/2:y=${r.y}`
    );
  }

  console.log("  ->", path.basename(salida));
  execFileSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      MAESTRO,
      "-vf",
      filtros.join(","),
      "-c:a",
      "copy",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "60",
      salida,
    ],
    { stdio: ["ignore", "inherit", "inherit"] }
  );
}

/* --- 9:16 · la banda arriba y el rotulo de marca debajo --- */
recorte({
  salida: path.join(BASE, "BLINK-COMERCIAL-HF-9x16.mp4"),
  ancho: 1080,
  alto: 1920,
  y: 520,
  fondo: "0x0a0f1d",
  rotulos: [
    { fuente: NEGRITA, texto: "BLINK POS", color: "0xf5f5f7", tamano: 58, y: 1240 },
    { fuente: NORMAL, texto: "blink.com.ve", color: "0x94a3b8", tamano: 36, y: 1320 },
    { fuente: NORMAL, texto: "Disponible el 01/12/27", color: "0x64748b", tamano: 32, y: 1400 },
  ],
});

/* --- 1:1 · la banda centrada con el rotulo al pie --- */
recorte({
  salida: path.join(BASE, "BLINK-COMERCIAL-HF-1x1.mp4"),
  ancho: 1080,
  alto: 1080,
  y: 210,
  fondo: "0x0a0f1d",
  rotulos: [
    { fuente: NEGRITA, texto: "BLINK POS", color: "0xf5f5f7", tamano: 46, y: 880 },
    { fuente: NORMAL, texto: "blink.com.ve", color: "0x94a3b8", tamano: 30, y: 945 },
  ],
});

console.log("recortes listos");
