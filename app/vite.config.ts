import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
