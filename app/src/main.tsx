import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/konsta.css";
import "./styles/app.css";

// Solo en DESARROLLO: se usa la SF Pro real de `app/.fonts-sf-local/`
// para trabajar con la tipografia definitiva. En produccion no se carga
// (los ficheros de Apple no se distribuyen). Ver styles/fonts.css.
if (import.meta.env.DEV) {
  void import("./styles/fonts-dev.css");
}

const el = document.getElementById("root");
if (!el) throw new Error("No se encontró #root");

createRoot(el).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
