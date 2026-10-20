# Iconos de marca · Favicon y PWA

**Fecha:** 2026-10-20 · **Versión:** 1.4.0

## Origen de los assets

Los archivos de marca originales están en `clone/` (carpeta **ignorada por git**,
ver `.gitignore:20`). Se copiaron a `app/public/`, que es lo que se compila y despliega.

| Origen (`clone/`) | Destino (`app/public/`) | Nota |
|---|---|---|
| `favicon.svg` | `favicon.svg` | Marcador para navegadores modernos |
| `favicon-dark.svg` | `favicon-dark.svg` | Variante para tema oscuro del SO |
| `favicon.ico` | `favicon.ico` | Fallback para navegadores antiguos |
| `icons/icon.svg` | `icons/icon.svg` | Isotipo con fondo blanco |
| — | `icons/icon-maskable.svg` | **Creado aquí**: fondo azul + marca blanca en zona segura 80% |

El color de la marca en los SVG es `#3347DD` (azul del isotipo).

## Iconos generados (PNG)

El `manifest.webmanifest` de referencia apuntaba a PNG que **no existían** en
`clone/`. Se generaron con Chromium (Playwright) desde los SVG:

| Archivo | Tamaño | Uso |
|---|---|---|
| `icons/icon-192.png` | 192×192 | Manifiesto · iOS home screen |
| `icons/icon-512.png` | 512×512 | Manifiesto · iOS home screen |
| `icons/icon-maskable-192.png` | 192×192 | Android adaptativo (máscara) |
| `icons/icon-maskable-512.png` | 512×512 | Android adaptativo (máscara) |
| `icons/apple-touch-icon.png` | 180×180 | iOS "Agregar a pantalla de inicio" |

### Regenerarlos

```bash
cd app
npm run icons     # node scripts/build-icons.mjs
```

El script `app/scripts/build-icons.mjs` usa `playwright-core` (ya estaba en
`node_modules`) con el Chromium del sistema. Si cambias un SVG, vuelve a correrlo.

### Variante maskable

Los iconos *maskable* llevan el fondo a sangre (`#3347DD`) y la marca en blanco al
78% alrededor de su centro, para que el recorte circular o redondeado de Android
nunca toque el dibujo.

## `app/public/manifest.json`

```json
{
  "name": "BLINK POS",
  "short_name": "BLINK POS",
  "id": "/",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#3347DD",
  "background_color": "#FFFEFB",
  "icons": [ /* icon.svg + 4 PNG, con purpose "any" y "maskable" */ ]
}
```

- `theme_color` = `#3347DD` para que coincida con el isotipo.
- `background_color` = `#FFFEFB` (Blanco Blink) para el splash de instalación.

## `app/index.html`

```html
<link rel="manifest" href="/manifest.json" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/svg+xml" href="/favicon-dark.svg" media="(prefers-color-scheme: dark)" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
<link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
```

## Antes vs después

| Antes | Ahora |
|---|---|
| `favicon.svg` de **207 bytes** (stub vacío) | `favicon.svg` real de 721 bytes |
| `apple-touch-icon.png` de **207 bytes** (stub vacío) | PNG de 180×180 generado |
| Sin `favicon.ico` | `favicon.ico` real (2.4 KB) |
| Sin favicon para tema oscuro | `favicon-dark.svg` con `prefers-color-scheme` |
| Manifest con 1 icono SVG | Manifest con 5 iconos (any + maskable) |
| Sin script de generación | `npm run icons` regenera los PNG |

## Verificación en producción

| Recurso | Estado |
|---|---|
| `/favicon.svg` | 200 `image/svg+xml` |
| `/favicon.ico` | 200 `image/vnd.microsoft.icon` |
| `/favicon-dark.svg` | 200 `image/svg+xml` |
| `/icons/icon.svg` | 200 `image/svg+xml` |
| `/icons/icon-192.png` | 200 `image/png` (3.9 KB) |
| `/icons/icon-512.png` | 200 `image/png` (10.9 KB) |
| `/icons/icon-maskable-192.png` | 200 `image/png` (3.3 KB) |
| `/icons/icon-maskable-512.png` | 200 `image/png` (9.2 KB) |
| `/icons/apple-touch-icon.png` | 200 `image/png` (3.7 KB) |
| `/manifest.json` | 200 `application/json` |

> **Nota sobre caché:** al desplegar iconos nuevos, Cloudflare puede seguir
> sirviendo un 404 cacheado de las rutas que aún no existían. Se resolvió con un
> `purge_cache` de la zona vía el MCP de Cloudflare.

## Instalar la PWA

- **Android/Chrome:** menú ⋮ → *Instalar aplicación* / *Añadir a pantalla de inicio*.
- **iOS/Safari:** botón Compartir → *Añadir a pantalla de inicio* (usa
  `apple-touch-icon.png`).
- La app se abre en modo `standalone` (sin barra de navegador) y arranca en `/`.
