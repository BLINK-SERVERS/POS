import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { prepararInstalacion } from "./lib/instalacion";

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

// Antes de montar React: si el navegador ofrece instalar la app, el aviso
// propio lo intercepta para que no aparezca el cartel de Chrome.
prepararInstalacion();

// PWA: el worker hace la app instalable y permite abrirla sin conexión.
// Solo en producción; en desarrollo estorbaría a cada recarga.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => undefined);
  });
}

createRoot(el).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
