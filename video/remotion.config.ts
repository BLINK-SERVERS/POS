import { Config } from "@remotion/cli/config";
import fs from "node:fs";
import os from "node:os";

/**
 * Configuracion de Remotion para el comercial de BLINK POS.
 *
 * · Chrome del sistema: evita descargar el "Chrome Headless Shell" (~150 MB).
 * · H.264 en alta calidad: WhatsApp, Instagram y YouTube lo aceptan igual.
 * · JPEG como imagen intermedia: menos peso en el temporal.
 */
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
if (fs.existsSync(CHROME)) {
  Config.setBrowserExecutable(CHROME);
}

Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
Config.setOverwriteOutput(true);
Config.setConcurrency(Math.max(2, Math.min(8, os.cpus().length - 1)));
// Las fuentes locales tardan en estar listas: margen amplio para el primer frame.
Config.setDelayRenderTimeoutInMilliseconds(60_000);
