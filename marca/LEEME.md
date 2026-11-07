# Carpeta de entrega de marca

Esta carpeta reúne los **iconos de app** del isotipo oficial de Blink. El
logotipo y el isotipo suelto se sirven desde `app/public/brand/`, y todos los
PNG, ICO y assets de la app se derivan de estos SVG con los scripts de
`app/scripts/`. No se editan a mano.

## Qué hay aquí

| Archivo | Uso |
|---|---|
| `blink-icono-app.svg` | Icono de app: isotipo blanco de 700 px (68,4 %) sobre cuadrado azul #007AFF |
| `blink-icono-maskable.svg` | Igual, con el glifo a 600 px (58,6 %) para la zona segura |
| `blink-favicon.svg` | Favicon: mismo arte con esquinas redondeadas (r = 230) |

El logotipo y el isotipo se sirven desde `app/public/brand/` (y sus copias
sin prólogo, para incrustar, en `app/src/assets/`) porque los consume la
interfaz:

| Archivo | Uso |
|---|---|
| `blink.svg` | Logotipo Blink + isotipo, tinta oscura (fondos claros) |
| `blink-blanco.svg` | Logotipo Blink + isotipo, blanco (fondos oscuros y azul) |
| `blink-isotipo.svg` | Isotipo suelto, sin contenedor |

## Generación

Todo se produce con `/home/prodz/.cache/blink-marca/generar.py` (fontTools +
uharfbuzz, trazando los glifos reales de SF Pro). Ese generador escribe los
SVG de `POS/marca/`, `Pay/marca/` y sus copias en `app/public/brand/`.

```bash
cd app
npm run icons    # PNG 192/512, maskable y apple-touch-icon desde public/icons/*.svg
npm run og       # imagen Open Graph 1200×630
npm run deploy   # build + publicación en gh-pages
```

`npm run icons` rasteriza `public/icons/icon.svg`,
`public/icons/icon-maskable.svg` y `public/favicon.svg` con Chromium de
Playwright, así que el PNG y el SVG son el mismo dibujo.

## Estado actual

Los iconos live en producción ya salen del **isotipo oficial de Blink**
(tres figuras: ojo que guiña en píldora, ojo abierto circular y boca de
semidisco) sobre azul #007AFF. Sustituyen al juego anterior, que derivaba
del icono de Wink, el competidor analizado para este proyecto: ese arte
ya no se usa en ningún sitio.

| Fichero | Origen |
|---|---|
| `app/public/favicon.svg` | `blink-favicon.svg` |
| `app/public/icons/icon.svg` | `blink-icono-app.svg` |
| `app/public/icons/icon-maskable.svg` | `blink-icono-maskable.svg` |
| `app/public/favicon.png` (32 px) | raster del favicon |
| `app/public/icon.png` (512 px) | raster del icono de app |
| `app/public/favicon.ico` (16/32/48) | raster multirresolución |
| `app/public/icons/icon-*.png` | PWA instalable |
| `app/public/icons/apple-touch-icon.png` | iOS «añadir a pantalla de inicio» |

### Cómo se mide el isotipo

El glifo se dibuja en una cuadrícula propia y se escala al lienzo de
1024×1024 con `isotipo(alto, tx, ty, color)`: `(tx, ty)` es la esquina
superior izquierda del isotipo ya escalado. El icono de app usa 700 px de
ancho de glifo; el maskable, 600 (zona segura de iOS); el favicon, 640 con
`rx="230"` en el cuadrado. Ver `Pay/docs/documento-maestro-estetica.md`.
