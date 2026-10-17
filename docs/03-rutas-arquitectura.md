# 03 · Rutas y arquitectura de navegación

## Flujo de arranque observado (usuario anónimo)

```
GET https://app.wink-pos.com/
   └─ 200  index.html  (shell de Angular + critical CSS inline + main-*.js)
        └─ Angular arranca (<bento-root ng-version="22.1.4">)
             ├─ <router-outlet> resuelve la ruta
             ├─ Auth guard: no hay sesión
             ├─ POST https://api.wink-pos.com/auth/refresh   (intenta refrescar)
             ├─ GET  https://api.wink-pos.com/auth/google/enabled
             ├─ GET  https://api.wink-pos.com/auth/turnstile
             └─ Redirect a: /entrar?volver=%2Finicio
                            └─ renderiza <bento-login>
```

## Rutas conocidas
| Ruta | Descripción | Estado |
|---|---|---|
| `/` (`/inicio`) | Inicio / dashboard | 🔒 requiere sesión |
| `/entrar` | Login (`?volver=` guarda el destino) | ✅ pública |
| `/crear-comercio` | Registro de comercio nuevo ("Vamos a crear tu comercio") | ✅ pública |
| `/recuperar-contrasena` | Recuperar contraseña ("¿Olvidaste tu contraseña?") | ✅ pública |

> El parámetro `volver=%2Finicio` confirma que **`/inicio` es la pantalla post-login**
> y que el guard restaura el destino tras autenticarse.

> **Rutas de BLINK (implementación propia, 2026-10-17).** BLINK usa las mismas bases pero con
> registro real: `/entrar` (login), `/registro` (datos personales + código de 6 dígitos),
> `/onboarding` (alta guiada) y, ya dentro del shell, `/inicio`, `/ventas`, `/ventas/historial`,
> `/catalogo`, `/inventario`, `/contactos`, `/finanzas`, `/informes`, `/ajustes`. Las rutas
> internas exigen sesión y alta completada (ver `docs/18` y `docs/20`).

## Patrón de routing
- **SPA con cliente-side routing** por hash de assets; **todas** las rutas desconocidas
  devuelven `200 index.html` (fallback del servidor → `index.html`).
  - Comprobado: `/login`, `/api`, `/api/health`, `/sw.js` → todos 200 + mismo HTML (22611 bytes).
- Rutas en **español**, kebab-case (`crear-comercio`, `recuperar-contrasena`).
- Atributo `routerlink` en anchors internos (p. ej. `routerlink="/crear-comercio"`).

## Carga diferida (code splitting)
- `ngsw.json` (assetGroup `app`) lista **~90 chunks JS** + `main-*.js` + `styles-*.css` con
  `installMode: prefetch` → el service worker **precarga toda la app** tras la primera visita.
- `assetGroup assets` (lazy) contiene marca e iconos.
- Nombre de chunks por hash de contenido → cada feature es un módulo lazy.

## Service worker (PWA)
- Registro: `ngsw-worker.js` (registrado por `@angular/service-worker`).
- Config: `ngsw.json` (versión `timestamp: 1791923249405`).
- `dataGroups`: **vacío** → **no** se cachean respuestas de API (correcto para datos sensibles).
- `manifest.webmanifest`: `display: standalone`, `start_url: "/"`, `theme_color: #3347dd`,
  `background_color: #f4f5fd`, iconos 192/512 + maskable.

## Analítica / terceros observados
| Host | Recurso | Uso |
|---|---|---|
| `static.cloudflareinsights.com` | `beacon.min.js` | RUM de Cloudflare (Web Analytics) |
| `app.wink-pos.com/cdn-cgi/rum` | XHR | reporte de RUM |
| `fonts.gstatic.com` | `.woff2` | Montserrat |
| `api.wink-pos.com` | fetch | backend |

> El beacon de Cloudflare Insights se usa para métricas de rendimiento reales (Core Web Vitals)
> y no requiere cookies; token público `6a9e0dbd09224ecaadcc369cfb08f618`.
