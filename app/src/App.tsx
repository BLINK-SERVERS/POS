// Rutas de la aplicación.
import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider, useAuth, useBooting, useDeviceVerified, useStoreState } from "./lib/store";
import { Shell } from "./components/Shell";
import { Login } from "./pages/Login";
import { Registro } from "./pages/Registro";
import { Recuperar } from "./pages/Recuperar";
import { Onboarding } from "./pages/Onboarding";

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
const Escaner = lazy(() => import("./pages/Escaner").then((m) => ({ default: m.Escaner })));

function PageLoader() {
  return <div className="page-loader">Cargando…</div>;
}

function Protected({ children }: { children: ReactNode }) {
  const authed = useAuth();
  const verified = useDeviceVerified();
  const booting = useBooting();
  const onboarded = useStoreState().state.onboarding.completed;
  if (booting) return <PageLoader />;
  // Con sesión pero sin equipo verificado se vuelve a /entrar para pedir el código.
  if (!authed || !verified) return <Navigate to="/entrar" replace />;
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  return (
    <Shell>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </Shell>
  );
}

function PublicOnly({ children }: { children: ReactNode }) {
  const authed = useAuth();
  const verified = useDeviceVerified();
  const booting = useBooting();
  if (booting) return <PageLoader />;
  // Solo se entra si además el equipo ya está verificado; si no, /entrar
  // muestra el paso del código.
  if (authed && verified) return <Navigate to="/inicio" replace />;
  return <>{children}</>;
}

function OnboardingGate({ children }: { children: ReactNode }) {
  const authed = useAuth();
  const verified = useDeviceVerified();
  const booting = useBooting();
  const onboarded = useStoreState().state.onboarding.completed;
  if (booting) return <PageLoader />;
  if (!authed || !verified) return <Navigate to="/entrar" replace />;
  if (onboarded) return <Navigate to="/inicio" replace />;
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
        path="/registro"
        element={
          <PublicOnly>
            <Registro />
          </PublicOnly>
        }
      />
      {/* Recuperar contraseña: sin PublicOnly, porque el enlace del correo crea
          una sesión de recuperación y hay que poder fijar la nueva clave. */}
      <Route path="/recuperar" element={<Recuperar />} />
      <Route
        path="/onboarding"
        element={
          <OnboardingGate>
            <Onboarding />
          </OnboardingGate>
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
      {/* Escáner remoto: lo abre el celular desde el QR. Sin sesión ni Shell. */}
      <Route
        path="/escaner"
        element={
          <Suspense fallback={<PageLoader />}>
            <Escaner />
          </Suspense>
        }
      />
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
