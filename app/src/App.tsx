// Rutas de la aplicación.
import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider, useAuth } from "./lib/store";
import { Shell } from "./components/Shell";
import { Login } from "./pages/Login";
import { CrearComercio } from "./pages/CrearComercio";

// Carga diferida por ruta → el bundle inicial es más pequeño y cada página
// se descarga solo cuando se visita (mejor caché y arranque más rápido).
const Inicio = lazy(() => import("./pages/Inicio").then((m) => ({ default: m.Inicio })));
const Vender = lazy(() => import("./pages/Vender").then((m) => ({ default: m.Vender })));
const Historial = lazy(() => import("./pages/Historial").then((m) => ({ default: m.Historial })));
const Catalogo = lazy(() => import("./pages/Catalogo").then((m) => ({ default: m.Catalogo })));
const Inventario = lazy(() => import("./pages/Inventario").then((m) => ({ default: m.Inventario })));
const Contactos = lazy(() => import("./pages/Contactos").then((m) => ({ default: m.Contactos })));
const Finanzas = lazy(() => import("./pages/Finanzas").then((m) => ({ default: m.Finanzas })));
const Informes = lazy(() => import("./pages/Informes").then((m) => ({ default: m.Informes })));
const Ajustes = lazy(() => import("./pages/Ajustes").then((m) => ({ default: m.Ajustes })));

function PageLoader() {
  return <div className="page-loader">Cargando…</div>;
}

function Protected({ children }: { children: ReactNode }) {
  const authed = useAuth();
  if (!authed) return <Navigate to="/entrar" replace />;
  return (
    <Shell>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </Shell>
  );
}

function PublicOnly({ children }: { children: ReactNode }) {
  const authed = useAuth();
  if (authed) return <Navigate to="/inicio" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/inicio" replace />} />
      <Route
        path="/entrar"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/crear-comercio"
        element={
          <PublicOnly>
            <CrearComercio />
          </PublicOnly>
        }
      />
      <Route path="/inicio" element={<Protected><Inicio /></Protected>} />
      <Route path="/ventas" element={<Protected><Vender /></Protected>} />
      <Route path="/ventas/historial" element={<Protected><Historial /></Protected>} />
      <Route path="/catalogo" element={<Protected><Catalogo /></Protected>} />
      <Route path="/inventario" element={<Protected><Inventario /></Protected>} />
      <Route path="/contactos" element={<Protected><Contactos /></Protected>} />
      <Route path="/finanzas" element={<Protected><Finanzas /></Protected>} />
      <Route path="/informes" element={<Protected><Informes /></Protected>} />
      <Route path="/ajustes" element={<Protected><Ajustes /></Protected>} />
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRoutes />
      </BrowserRouter>
    </StoreProvider>
  );
}
