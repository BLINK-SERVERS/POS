import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

// La versión vive en un solo sitio (`package.json`) y se inyecta en el build.
const pkg = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8")
) as { version: string };

export default defineConfig({
  base: "/",
  plugins: [react()],
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
