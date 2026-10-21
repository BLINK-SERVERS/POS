// Rutas de la aplicación.
//
// Estructura:
//   /            → Landing comercial (pública, sin autenticación)
//   /app/*       → Aplicación (login, onboarding, módulos)
//   /escaner     → Escáner remoto (deep link que abre el celular)
//
// RENDIMIENTO: el módulo principal solo trae el router y la landing.
// Todo lo demás (la aplicación con su store, Supabase, Konsta y el CSS
// del POS) se carga **bajo demanda** desde `AppInterna`, de modo que la
// primera visita no descarga lo que no usa.
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TemaProvider } from "./lib/tema";

const Landing = lazy(() => import("./pages/Landing").then((m) => ({ default: m.Landing })));
const AppInterna = lazy(() => import("./AppInterna").then((m) => ({ default: m.AppInterna })));
const Escaner = lazy(() => import("./pages/Escaner").then((m) => ({ default: m.Escaner })));

function PageLoader() {
  return <div className="page-loader">Cargando…</div>;
}

export function App() {
  return (
    <TemaProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* --- Landing comercial (pública) --- */}
            <Route path="/" element={<Landing />} />

            {/* --- Aplicación (carga su propio chunk) --- */}
            <Route path="/app/*" element={<AppInterna />} />

            {/* Escáner remoto: lo abre el celular desde el QR. Sin sesión ni
                Shell. Vive en la raíz porque es un deep link que se comparte. */}
            <Route path="/escaner" element={<Escaner />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TemaProvider>
  );
}
