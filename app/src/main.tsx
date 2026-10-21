import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Solo lo que necesita CUALQUIER página (reset, iconos, utilidades).
// El CSS de la aplicación (`app.css`) y el de Konsta (`konsta.css`) se
// cargan con el chunk de la aplicación, no con el principal.
import "./styles/fonts.css";
import "./styles/base.css";
import "./styles/tokens.css";

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
