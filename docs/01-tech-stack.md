# 01 · Stack técnico y arquitectura

## Framework y runtime
- **Angular 22.1.4** — confirmado por el atributo `ng-version="22.1.4"` en `<bento-root>`.
- Arquitectura **standalone components** con `<router-outlet>`.
- **Reactive Forms** (`ng-untouched`, `ng-pristine`, `ng-invalid`, `novalidate`).
- **Angular Service Worker (PWA)**: `ngsw-worker.js` + `ngsw.json` con `assetGroups` (app/assets).
- **Critical CSS inlining**: atributo `data-beasties-container` en `<html>` (Beasties/Critters).

## Librería de componentes propia: `bento-*`
La app NO usa Angular Material ni PrimeNG visibles; usa una **design system propia**
expuesta como **custom elements / componentes** con prefijo `bento`:

| Elemento | Rol |
|---|---|
| `bento-root` | Componente raíz (bootstrap de la app) |
| `bento-login` | Página de login |
| `bento-auth-layout` | Layout de 2 columnas para pantallas de autenticación |
| `bento-logo` | Logo de marca (imagen wordmark) |
| `bento-icon` | Iconos SVG inline (`name="home"`, `name="arrow-right"`, …) |
| `bento-field` / `bento-field-shell` | Envoltorio de campo de formulario + label/helper |
| `bento-text-input` | Input de texto/contraseña con shell |
| `bento-form-error` | Mensajes de error de formulario |
| `bento-toasts` | Sistema de notificaciones (popover manual, `aria-live`) |
| `bento-confirm-host` | Host de diálogos de confirmación |
| `bentoinput`, `bentobutton` | Atributos/directivas de estilo para input y botón |

## CSS / estilos
- **Tailwind CSS v4** (se reconocen `@layer theme, base, components, utilities` y las
  propiedades `@property --tw-*`).
- Encima de Tailwind hay un **sistema de tokens semánticos** (`--color-surface-*`,
  `--color-text-*`, `--color-border-*`, `--color-icon-*`) definidos en `:root`.
- Nombre de archivo con hash: `styles-RYCGKBXC.css` (content-hashed para cache-busting).

## Backend / red
- Host de API: **`https://api.wink-pos.com`** (host distinto del front).
- Endpoints de autenticación observados en el arranque anónimo:
  - `POST /auth/refresh` — intenta refrescar sesión existente.
  - `GET  /auth/google/enabled` — ¿está habilitado el login con Google?
  - `GET  /auth/turnstile` — configuración de Cloudflare Turnstile (captcha).
- El `dataGroups` del service worker está **vacío** → no se cachean respuestas de API.

## Infraestructura / seguridad
- **Cloudflare** delante de todo: `Server: cloudflare`, HSTS (`max-age=31536000; includeSubDomains`),
  cookie `__cf_bm`, `Report-To`/`NEL`, y el beacon de **Cloudflare Insights**:
  `https://static.cloudflareinsights.com/beacon.min.js` con token `6a9e0dbd09224ecaadcc369cfb08f618`
  (versión 2024.11.0, `spa: 2` → SPA tracking).
- Fuentes en `fonts.gstatic.com` (Montserrat v31), con `preconnect`.

## SEO / metadatos
- `<title>` dinámico por ruta: `"WINK POS"` (raíz) y `"Entrar · WINK POS"` (login).
- `meta name="theme-color"` = `#3347dd`, `apple-mobile-web-app-title` = `WINK POS`.
- `lang="es"`, `viewport-fit=cover` (soporte de notch/safe-area).

## Empaquetado / build
- Build de producción con **code-splitting agresivo**: ~90+ `chunk-*.js` (lazy loading por feature).
- Chunks con hash de contenido (p. ej. `chunk-D8lZCCEd.js`, `main-IXWMM7SO.js`).
- `modulepreload` de los chunks críticos en el HTML inicial.
- **Sin source maps publicados** (`.js.map` devuelve el shell HTML, no un mapa).
