# Iconos de marca · Favicon y PWA · Set de iconos de la interfaz

**Fecha:** 2026-10-21 · **Versión:** 1.8.3

> Hay **dos juegos de iconos** distintos en el proyecto y conviene no
> confundirlos:
>
> | Juego | Qué es | Dónde |
> |---|---|---|
> | **Iconos de marca** | favicon, iconos del PWA, Open Graph | `app/public/` — material propio de Blink |
> | **Iconos de interfaz** | los que se usan dentro de la app | `app/src/lib/sf-symbols.ts` — **SF Symbols de Apple** (ver la nota de licencia más abajo) |

## Origen de los assets

El archivo de marca original es `marca/favicon.png` (512×512). Todo lo demás
se genera a partir de ahí:

| Origen | Destino (`app/public/`) | Nota |
|---|---|---|
| `marca/favicon.png` | `favicon.png` (32 px) | Marcador raster |
| `marca/favicon.png` | `icon.png` (512 px) | Icono de la app |
| `marca/favicon.png` | `favicon.svg` | Marcador vectorial (trazado reconstruido) |
| `marca/favicon.png` | `favicon.ico` (16/32/48) | Fallback para navegadores antiguos |
| `marca/favicon.png` | `icons/icon.svg` | Icono de la PWA |
| — | `icons/icon-maskable.svg` | **Creado aquí**: fondo azul + marca en zona segura 80% |

### Cómo se reconstruyó el vector

El `favicon.svg` no es un calco: se **midió el PNG** pixel a pixel
(radio de esquina 80/512, ojo-píldora 150×75 en 55/182, ojo circular r=75
en 381/181 y boca de semidisco r=81 en 175/324) y se redibujó con esas
medidas. Vectorial y raster son el mismo dibujo.

> **Aviso de procedencia.** El diseño original (cuadrado azul con una cara
> que guiña un ojo) es la marca de **Wink**, el competidor que se analizó
> para este proyecto; las versiones anteriores que estaban en producción
> (trazo indigo `#3347DD`) venían de `clone/`, el clon de Wink. Si la
> marca de BLINK debe ser propia, hay que dejar en `marca/` un original
> distinto: con ese fichero, `npm run icons` y `npm run ico` rehacen
> todo el juego de iconos.

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
| `favicon.png` | 32×32 | Marcador raster del navegador |
| `icon.png` | 512×512 | Icono de la app |

### Regenerarlos

```bash
cd app
npm run icons     # node scripts/build-icons.mjs  (PNG)
npm run ico       # node scripts/build-ico.mjs    (favicon.ico)
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
<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
<link rel="icon" type="image/png" sizes="512x512" href="/icon.png" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
<link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
```

## Imagen de preview Open Graph

`app/public/og-image.png` (1200×630) — la miniatura que se ve al compartir el link
en WhatsApp, Telegram, X o Facebook.

**Generador:** `app/scripts/build-og-image.mjs` (`npm run og`)

Composición:

| Zona | Contenido |
|---|---|
| Izquierda (730 px) | Lockup *BLINK* (azul `#0088ff`, itálica 800) + *POS* (negro, peso 300) con el isotipo de marca · **lema oficial "Vende en un parpadeo, factura con BLINK ;)"** · subtítulo · 3 píldoras de beneficio · pie con `blink.com.ve` y el precio |
| Derecha (470 px) | Maqueta del POS con el móvil escaneando al lado, y **tarjetas de cristal** (`backdrop-filter: blur(20px)`) con las cifras clave |

La imagen usa la **paleta oficial** (azul principal `#0088ff`, verde
`#34c759`) y el material translúcido de la landing. El lema oficial
de la marca es **"Vende en un parpadeo, factura con BLINK ;)"**: es el que
llevan el `og:title`, el `og:description` y el `twitter:title`.
| Derecha (470 px) | Panel Negro Blink (`#1D1D1F`) con círculos brand-blue y la maqueta del POS (líneas de venta, total en USD y equivalente en Bs a tasa BCV) |

Fuentes: SF Pro Display (Bold / Semibold / Regular / Light / Italic) embebidas en
base64 desde `app/public/fonts`, para que el render no dependa de las fuentes del
sistema.

### Metadatos en `app/index.html`

```html
<meta property="og:image" content="https://www.blink.com.ve/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="BLINK POS — El punto de venta más rápido…" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://www.blink.com.ve/og-image.png" />
```

> Las URL de `og:image` son **absolutas** (con dominio). Las plataformas de social
> no resuelven rutas relativas.

### Regenerarla

```bash
cd app
npm run og      # node scripts/build-og-image.mjs
```

---

## Set de iconos de la interfaz · SF Symbols

### Qué es

La app usa **100 SF Symbols** de Apple como set de iconos de interfaz. Son SVG
embebidos en `app/src/lib/sf-symbols.ts`, generados por:

```bash
cd app
npm run icons:sf    # node scripts/build-sf-symbols.mjs
```

El script los descarga de `github.com/brendanballon/sfsymbols-svg`, les aplica
su propio `viewBox` y **normaliza el relleno a `currentColor`**, para que
hereden el color del texto y funcionen en modo claro y oscuro.

### Los 100 iconos

El set se amplía con el generador: `app/scripts/build-sf-symbols.mjs`
mantiene el mapa `ICON_MAP` (nombre interno de BLINK → fichero del símbolo en
el repo de origen) y regenera `app/src/lib/sf-symbols.ts`.

Los **14 últimos** se añadieron en la v1.10.0, tras la auditoría de los 137
botones de la app (86 sin icono, 51 con icono):

| Nombre interno | Fichero | Para qué |
|---|---|---|
| `refresh` | `arrow.clockwise` | actualizar la tasa, sincronizar |
| `transfer` | `arrow.left.arrow.right` | transferencias entre cuentas |
| `importData` | `tray.and.arrow.down` | importar datos |
| `exportData` | `square.and.arrow.up` | exportar datos |
| `copy` | `plus.square.on.square` | duplicar |
| `folder` | `folder` | categorías |
| `adjust` | `slider.horizontal.3` | ajustar existencias |
| `listView` | `list.bullet.rectangle` | vista de listado |
| `more` | `ellipsis.circle` | más acciones |
| `dollars` | `dollarsign.circle` | importes |
| `tray` | `tray` |_archivo_ |
| `grid2x2` | `square.grid.2x2` | cuadrícula |
| `userPlus` | `person.crop.circle.badge.plus` | añadir persona |
| `seal` | `checkmark.seal` | verificado |

> Para añadir uno nuevo: se comprueba que el fichero exista en el repo de
> origen (`https://api.github.com/repos/brendanballon/sfsymbols-svg/git/trees/master?recursive=1`),
> se añade al `ICON_MAP` y se ejecuta `npm run icons:sf`.

### Cómo se usan

```tsx
import { Icon } from "../components/Icon";

<Icon name="cart" />              {/* tamaño por defecto */}
<Icon name="cart" size={20} />    {/* explícito */}
```

La API pública (`IconName`, `size`) es estable: **ningún *call site* cambia**
al migrar de los iconos de trazo propios a SF Symbols. `IconName` es una unión
de tipos generada, así que un nombre mal escrito no compila.

Reglas:

- **Solo SVG.** No hay emoji en ninguna pantalla.
- Solo tres colores base (`#FFFEFB` fondo, `#007AFF` acento, `#424242` texto)
  más los semánticos (`#34A853`, `#EA4335`, `#FBBC05`).
- El icono **no** se usa como decoración: acompaña a una acción o a un dato.

### ⚠️ Nota de licencia

> Los **SF Symbols son material de Apple**. Su licencia restringe su uso a
> software que se ejecute **únicamente** en plataformas de Apple (iOS, iPadOS,
> macOS, tvOS, watchOS, visionOS). Usarlos en una aplicación web como BLINK
> —que corre en cualquier navegador— **no está cubierto por esa licencia**.
>
> El repositorio de terceros del que se obtuvo el arte
> (`brendanballon/sfsymbols-svg`) **no incluye un archivo `LICENSE`**, así que
> tampoco hay una licencia alternativa que lo cubra.
>
> **Decisión tomada:** se asume el riesgo y se documenta, tal como se pidió
> explícitamente al elegir este set. Los **tokens de diseño** del UI Kit
> (colores, tipografía, medidas, materiales) sí son datos objetivos y se usan
> sin problema; lo restringido es el **arte de los iconos**.

### Alternativas libres

Si en el futuro hay que sustituir el set, estas son las opciones con licencia
permisiva:

| Set | Licencia | Formato | Nota |
|---|---|---|---|
| [Phosphor Icons](https://phosphoricons.com/) | **MIT** | SVG con `currentColor` | Gran variedad; incluye pesos *thin/light/bold/fill* |
| [Lucide](https://lucide.dev/) | **ISC** | SVG con `currentColor` | Trazo de 24×24, muy consistente |
| [Tabler Icons](https://tabler.io/icons) | **MIT** | SVG con `currentColor` | ~5.000 iconos, excelente cobertura de acciones de negocio |

Los tres se integran igual: basta con regenerar `app/src/lib/sf-symbols.ts`
apuntando al repositorio correspondiente y adjusting la API de `Icon` si
cambia el `viewBox`. **No hay que tocar ningún *call site*.**

---

## Antes vs después

| Antes | Ahora |
|---|---|
| `favicon.svg` de **207 bytes** (stub vacío) | `favicon.svg` real de 721 bytes |
| `apple-touch-icon.png` de **207 bytes** (stub vacío) | PNG de 180×180 generado |
| Sin `favicon.ico` | `favicon.ico` real (2.4 KB) |
| Sin favicon para tema oscuro | `favicon-dark.svg` con `prefers-color-scheme` |
| Manifest con 1 icono SVG | Manifest con 5 iconos (any + maskable) |
| Sin script de generación | `npm run icons` regenera los PNG |
| Sin imagen para compartir | `og-image.png` 1200×630 con favicon + marca |
| Iconos de trazo propios | **100 SF Symbols** rellenos, `currentColor` |

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
