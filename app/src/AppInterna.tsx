// ============================================================
// BLINK POS · La aplicación (todo lo que hay bajo /app)
// ------------------------------------------------------------
// Este módulo se carga **bajo demanda** (lazy) desde `App.tsx`.
//
// Motivo (rendimiento de carga):
//   · aquí vive el store → `lib/supabase.ts` → el cliente de Supabase
//     (285 KB en crudo). La landing pública NO lo necesita, así que
//     se descarga solo cuando el usuario entra en la aplicación;
//   · aquí viven Konsta y el CSS del POS (`app.css` + `konsta.css`),
//     que tampoco necesita la landing.
//
// Así la primera visita (la landing) descarga solo React, el router y
// la propia landing.
// ============================================================
import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { KonstaProvider } from "konsta/react";
import { StoreProvider, useAuth, useBooting, useDeviceVerified, useStoreState } from "./lib/store";
import { Shell } from "./components/Shell";
import { ConfirmProvider } from "./components/ui";
import { registrarIconos } from "./lib/iconos";
import { SF_SYMBOLS } from "./lib/sf-symbols";
import { useTema } from "./lib/tema";
import { Login } from "./pages/Login";
import { Registro } from "./pages/Registro";
import { Recuperar } from "./pages/Recuperar";
import { Onboarding } from "./pages/Onboarding";
import { Legal } from "./pages/Legal";

// El juego completo de iconos (182 KB) se registra aqui: la landing solo
// carga el nucleo (13 iconos) y asi no descarga los 100.
registrarIconos(SF_SYMBOLS);

// El CSS de la aplicación se importa aquí: Vite lo emite como CSS del
// chunk lazy, de modo que la landing no lo descarga.
import "./styles/konsta.css";
import "./styles/app.css";

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
      {/* --- Textos legales (publicos) --- */}
      <Route path="terminos" element={<Legal kind="terminos" />} />
      <Route path="privacidad" element={<Legal kind="privacidad" />} />

      {/* --- Acceso --- */}
      <Route path="entrar" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="registro" element={<PublicOnly><Registro /></PublicOnly>} />
      {/* Recuperar contraseña: sin PublicOnly, porque el enlace del correo crea
          una sesión de recuperación y hay que poder fijar la nueva clave. */}
      <Route path="recuperar" element={<Recuperar />} />
      <Route
        path="onboarding"
        element={
          <OnboardingGate>
            <Onboarding />
          </OnboardingGate>
        }
      />

      {/* --- Módulos protegidos --- */}
      <Route path="inicio" element={<Protected><Inicio /></Protected>} />
      <Route path="ventas" element={<Protected><Vender /></Protected>} />
      <Route path="ventas/historial" element={<Protected><Historial /></Protected>} />
      <Route path="catalogo" element={<Protected><Catalogo /></Protected>} />
      <Route path="inventario" element={<Protected><Inventario /></Protected>} />
      <Route path="contactos" element={<Protected><Contactos /></Protected>} />
      <Route path="finanzas" element={<Protected><Finanzas /></Protected>} />
      <Route path="informes" element={<Protected><Informes /></Protected>} />
      <Route path="ajustes" element={<Protected><Ajustes /></Protected>} />
      <Route path="*" element={<Navigate to="/app/inicio" replace />} />
    </Routes>
  );
}

export function AppInterna() {
  const { esOscuro } = useTema();
  return (
    <StoreProvider>
      {/* Konsta UI provee los componentes con estética iOS (MIT).
          El tema "ios" + la clase "k-ios" en <html> activan sus variantes.
          `dark` le dice a Konsta que se apliquen sus variantes oscuras
          (Konsta las activa con la clase "dark", ver konsta/styles/base.css). */}
      <KonstaProvider theme="ios" dark={esOscuro} iosHoverHighlight>
        {/* Confirmaciones con alerta nativa de iOS (reemplaza a
            `window.confirm`, que es un dialogo del navegador). */}
        <ConfirmProvider>
          <AppRoutes />
        </ConfirmProvider>
      </KonstaProvider>
    </StoreProvider>
  );
}
