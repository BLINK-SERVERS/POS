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

Los iconos que están **live en producción** salen de `BLINK POS/clone/`
(`favicon.svg`, `favicon-dark.svg`, `favicon.ico`, `icons/icon.svg`). Son los
únicos assets de BLINK que existen en esta máquina — se buscaron en `Documents`,
`Downloads`, `Desktop`, `Pictures` y en todo el perfil, y no hay ningún otro
`favicon` ni `icon.png`.

Si los archivos que tienes son **otra versión** (otro color u otra forma), deja
los tuyos aquí y los reemplazo.
