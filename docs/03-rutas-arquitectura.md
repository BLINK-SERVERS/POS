# 03 · Rutas y arquitectura de navegación · BLINK POS

**Fecha:** 2026-10-21 · **Versión:** 1.8.3

> El mapa de rutas de **WINK** está en
> [`wink/03-rutas-arquitectura.md`](./wink/03-rutas-arquitectura.md), como
> referencia histórica.

---

## 1. Mapa de rutas

Definido en `app/src/App.tsx`.

| Ruta | Componente | Acceso | Propósito |
|---|---|---|---|
| `/` | `Landing` | Público | Portada comercial e instalación como PWA |
| `/app/terminos` | `Legal` | Público | Términos y condiciones |
| `/app/privacidad` | `Legal` | Público | Aviso de privacidad |
| `/app` | — | — | Redirige a `/app/inicio` |
| `/app/entrar` | `Login` | `PublicOnly` | Acceso con correo + contraseña, o enlace mágico |
| `/app/registro` | `Registro` | `PublicOnly` | Alta del comercio |
| `/app/recuperar` | `Recuperar` | **Libre** | Restablecer contraseña |
| `/app/onboarding` | `Onboarding` | `OnboardingGate` | Alta guiada (moneda base, datos) |
| `/app/inicio` | `Inicio` | `Protected` | Resumen del negocio |
| `/app/ventas` | `Vender` | `Protected` | El POS: buscar, escanear, cobrar |
| `/app/ventas/historial` | `Historial` | `Protected` | Ventas realizadas |
| `/app/catalogo` | `Catalogo` | `Protected` | Catálogo global + catálogo propio |
| `/app/inventario` | `Inventario` | `Protected` | Existencias, ajustes, traslados, compras |
| `/app/contactos` | `Contactos` | `Protected` | Clientes y proveedores |
| `/app/finanzas` | `Finanzas` | `Protected` | Cuentas, movimientos, gastos, cierres de caja |
| `/app/informes` | `Informes` | `Protected` | Ventas, márgenes, más vendidos |
| `/app/ajustes` | `Ajustes` | `Protected` | Negocio, perfil, moneda, recibo, exportar, dispositivos, cuenta |
| `/escaner` | `Escaner` | **Libre** | Escáner remoto enlazado por QR |
| `*` | — | — | Redirige a `/` |

### Por qué `/escaner` vive en la raíz

El escáner se abre en el **celular** mediante un deep link con QR. La URL se
comparte por WhatsApp o se imprime en el mostrador, así que:

- no puede depender de una sesión iniciada en ese dispositivo;
- no debe verse arrastrada al prefijo `/app` cuando cambia la ruta base.

---

## 2. Guardas de ruta

| Guarda | Condición | Redirección |
|---|---|---|
| `Protected` | hay sesión **y** equipo verificado **y** onboarding completado | → `/app/entrar` o `/app/onboarding` |
| `PublicOnly` | **no** hay sesión verificada | → `/app/inicio` |
| `OnboardingGate` | hay sesión, pero el onboarding no está completo | → `/app/entrar` o `/app/inicio` |

```tsx
function Protected({ children }) {
  const authed = useAuth();
  const verified = useDeviceVerified();
  const booting = useBooting();
  const onboarded = useStoreState().state.onboarding.completed;
  if (booting) return <PageLoader />;
  if (!authed || !verified) return <Navigate to="/app/entrar" replace />;
  if (!onboarded) return <Navigate to="/app/onboarding" replace />;
  return <Shell><Suspense fallback={<PageLoader />}>{children}</Suspense></Shell>;
}
```

`booting` evita el "parpadeo" de la pantalla de acceso mientras Supabase
resuelve la sesión: mientras `booting` es `true` se muestra el cargador.

> `/app/recuperar` **no** usa `PublicOnly` a propósito: el enlace del correo
> crea una sesión de recuperación y hay que poder fijar la contraseña nueva.

---

## 3. Estructura del layout

```
Shell
├── Sidebar (escritorio ≥ 768px)
│   └── Logo + navegación + acciones
├── Topbar
│   └── Título, buscador, acciones
├── Contenido
│   └── PageHead + Card/Table/Tabs
└── TabBar flotante (móvil < 768px)   ← con Liquid Glass (Konsta <Glass>)
```

- En **escritorio** hay barra lateral fija y tablas compactas.
- En **móvil** la barra lateral se sustituye por una **tab bar flotante** con
  material translúcido, y las tablas se convierten en tarjetas.
- El `POS` (`/app/ventas`) mantiene el **ticket siempre visible** en un
  panel lateral (`--ticket-w: 360px`).

Detalle en [`09-pantallas-internas.md`](./09-pantallas-internas.md).

---

## 4. Carga diferida

Todas las páginas internas se importan con `lazy()`:

```tsx
const Vender = lazy(() => import("./pages/Vender").then((m) => ({ default: m.Vender })));
```

El bundle inicial trae solo el shell y la landing; cada módulo se descarga
cuando se visita por primera vez. Combinado con `manualChunks` (vendor
separado), esto mantiene el delta entre despliegues muy pequeño.

---

## 5. `basename`

```tsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

- En local: `BASE_URL` = `/`.
- En producción: también `/` (el dominio propio sirve desde la raíz).

Funciona igual en ambos casos sin código condicional. Si en el futuro se
volvera a publicar bajo un subdirectorio, basta con cambiar `base` en
`vite.config.ts`.

---

## 6. Emparejamiento del escáner

Flujo completo en [`21-escaner.md`](./21-escaner.md):

1. El POS muestra un QR con un **código de emparejamiento** (6 dígitos).
2. El celular abre `/escaner`, que captura la cámara o acepta el código.
3. Ambos lados se vinculan con un token y una vigencia (`PAIRING_DAYS`).
4. El celular escanea y el POS recibe las líneas; el ticket se actualiza solo.
