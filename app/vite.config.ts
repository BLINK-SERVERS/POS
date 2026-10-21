import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync, existsSync, createReadStream } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

// La versión vive en un solo sitio (`package.json`) y se inyecta en el build.
const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8")
) as { version: string };

/**
 * Sirve la SF Pro real de `app/.fonts-sf-local/` **solo en desarrollo**.
 *
 * San Francisco es material de Apple: su licencia no permite distribuirlo
 * en un sitio publico, asi que en produccion no se sirve nada. En local si,
 * para trabajar con la tipografia definitiva (ver `src/styles/fonts.css`).
 */
function sfProDevFonts(): Plugin {
  const dir = fileURLToPath(new URL("./.fonts-sf-local/", import.meta.url));
  return {
    name: "blink:sf-pro-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/.fonts-sf-local", (req, res, next) => {
        const name = basename(decodeURIComponent((req.url || "").split("?")[0]));
        const file = join(dir, name);
        if (!file.startsWith(dir) || !existsSync(file)) return next();
        res.setHeader("Content-Type", "font/woff2");
        res.setHeader("Cache-Control", "no-cache");
        createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss(), sfProDevFonts()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { port: 5173 },
  preview: { port: 4173 },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    sourcemap: false,
    // Separa las dependencias estables (React, router) en un chunk propio:
    // mejora el cacheo entre despliegues y reduce el chunk de la app.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor";
          return undefined;
        },
      },
    },
  },
});
