// Rutas de la aplicación.
//
// Estructura:
//   /            → Landing comercial (pública, sin autenticación)
//   /app/*       → Aplicación protegida (login, onboarding, módulos)
//   /escaner     → Escáner remoto (deep link que abre el celular, sin sesión)
import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { KonstaProvider } from "konsta/react";
import { StoreProvider, useAuth, useBooting, useDeviceVerified, useStoreState } from "./lib/store";
import { Shell } from "./components/Shell";
import { ConfirmProvider } from "./components/ui";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Registro } from "./pages/Registro";
import { Recuperar } from "./pages/Recuperar";
import { Onboarding } from "./pages/Onboarding";
import { Legal } from "./pages/Legal";

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
  if (!authed || !verified) return <Navigate to="/app/entrar" replace />;
  if (!onboarded) return <Navigate to="/app/onboarding" replace />;
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
  if (authed && verified) return <Navigate to="/app/inicio" replace />;
  return <>{children}</>;
}

function OnboardingGate({ children }: { children: ReactNode }) {
  const authed = useAuth();
  const verified = useDeviceVerified();
  const booting = useBooting();
  const onboarded = useStoreState().state.onboarding.completed;
  if (booting) return <PageLoader />;
  if (!authed || !verified) return <Navigate to="/app/entrar" replace />;
  if (onboarded) return <Navigate to="/app/inicio" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* --- Landing comercial (pública) --- */}
      <Route path="/" element={<Landing />} />
      <Route path="/app/terminos" element={<Legal kind="terminos" />} />
      <Route path="/app/privacidad" element={<Legal kind="privacidad" />} />

      {/* --- Aplicación protegida --- */}
      <Route path="/app" element={<Navigate to="/app/inicio" replace />} />
      <Route
        path="/app/entrar"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/app/registro"
        element={
          <PublicOnly>
            <Registro />
          </PublicOnly>
        }
      />
      {/* Recuperar contraseña: sin PublicOnly, porque el enlace del correo crea
          una sesión de recuperación y hay que poder fijar la nueva clave. */}
      <Route path="/app/recuperar" element={<Recuperar />} />
      <Route
        path="/app/onboarding"
        element={
          <OnboardingGate>
            <Onboarding />
          </OnboardingGate>
        }
      />
      <Route path="/app/inicio" element={<Protected><Inicio /></Protected>} />
      <Route path="/app/ventas" element={<Protected><Vender /></Protected>} />
      <Route path="/app/ventas/historial" element={<Protected><Historial /></Protected>} />
      <Route path="/app/catalogo" element={<Protected><Catalogo /></Protected>} />
      <Route path="/app/inventario" element={<Protected><Inventario /></Protected>} />
      <Route path="/app/contactos" element={<Protected><Contactos /></Protected>} />
      <Route path="/app/finanzas" element={<Protected><Finanzas /></Protected>} />
      <Route path="/app/informes" element={<Protected><Informes /></Protected>} />
      <Route path="/app/ajustes" element={<Protected><Ajustes /></Protected>} />
      {/* Escáner remoto: lo abre el celular desde el QR. Sin sesión ni Shell.
          Vive en la raíz porque es un deep link que se comparte por QR. */}
      <Route
        path="/escaner"
        element={
          <Suspense fallback={<PageLoader />}>
            <Escaner />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <StoreProvider>
      {/* Konsta UI provee los componentes con estética iOS (MIT).
          El tema "ios" + la clase "k-ios" en <html> activan sus variantes. */}
      <KonstaProvider theme="ios" iosHoverHighlight>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          {/* Confirmaciones con alerta nativa de iOS (reemplaza a
              `window.confirm`, que es un dialogo del navegador). */}
          <ConfirmProvider>
            <AppRoutes />
          </ConfirmProvider>
        </BrowserRouter>
      </KonstaProvider>
    </StoreProvider>
  );
}
