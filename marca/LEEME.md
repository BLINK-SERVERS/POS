# Carpeta de entrega de marca

Deja aquí los archivos originales de marca y yo regenero todo lo que depende de ellos.

## Qué espero

| Archivo | Uso |
|---|---|
| `favicon.svg` | Favicon del navegador (SVG vectorial) |
| `favicon.ico` | Favicon para navegadores antiguos |
| `favicon-dark.svg` | Favicon en tema oscuro del sistema operativo |
| `icon.png` o `icons/icon.svg` | Isotipo para la PWA (instalable en el celular) |

Si solo tienes PNG, también sirve: los convierto a SVG/ICO con el mismo pipeline.

## Qué se regenera automáticamente

```bash
cd app
npm run icons    # PNG 192/512, maskable y apple-touch-icon
npm run og       # imagen Open Graph 1200×630
npm run deploy   # build + publicación en gh-pages
```

## Estado actual

Los iconos que están **live en producción** salen del fichero institucional
`marca/favicon.png` (512×512, el cuadrado azul con la cara que guiña un
ojo). De ese original se generan, con `npm run icons` y `npm run ico`:

| Fichero | Uso |
|---|---|
| `app/public/favicon.png` (32 px) | favicon raster |
| `app/public/icon.png` (512 px) | icono de la app |
| `app/public/favicon.svg` | favicon vectorial (mismo trazado) |
| `app/public/favicon.ico` (16/32/48) | navegadores antiguos |
| `app/public/icons/icon-*.png` | PWA instalable |
| `app/public/icons/apple-touch-icon.png` | iOS "añadir a pantalla de inicio" |

### De dónde salió el vector

`favicon.svg` e `icons/icon.svg` se reconstruyeron **midiendo el PNG**
(píxel a píxel: radio de esquina 80/512, ojo-píldora 150×75 en 55/182,
ojo circular r=75 en 381/181 y boca de semidisco r=81 en 175/324). Así el
icono vectorial y el raster son el mismo dibujo, no dos versiones parecidas.

> **Aviso de procedencia:** el diseño original (el cuadrado azul con la
> cara que guiña) es la marca de **Wink**, el competidor que se analizado
> para este proyecto, y las versiones anteriores que estaban en producción
> (trazo indigo `#3347DD`) venían de `clone/`, el clon de Wink. Si la
> marca de BLINK debe ser propia, hay que dejar aquí un original
> distinto: con ese fichero, `npm run icons` y `npm run ico` rehacen
> todo el juego de iconos.
