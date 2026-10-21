# 05 · Inventario de assets (107 recursos públicos)

> ⚠️ **Documento de referencia de WINK POS — no describe BLINK.**
>
> Este archivo forma parte del **reconocimiento pasivo de `app.wink-pos.com`**
> (proyecto previo del que BLINK nació como alternativa). Describe la
> arquitectura, el diseño y el comportamiento de **WINK**, no los de BLINK.
>
> Se conserva como **material de estudio**: fue la fuente del comparativo
> funcional y de buena parte de las decisiones de BLINK. Para el estado real
> de BLINK, ver el [índice](../INDEX.md).
>
> **No tomar como referencia de la implementación actual.**

Origen: `ngsw.json` (assetGroup `app` + `assets`) y las peticiones observadas.
Todo esto lo descarga cualquier navegador anónimo.

## 5.1 Marca (`/brand`)
| Archivo | Descripción |
|---|---|
| `brand/wordmark.svg` | Logotipo completo "WINK POS" (295×51, relleno `#3347DD`) |
| `brand/wordmark-dark.svg` | Wordmark para fondo oscuro |
| `brand/mark.svg` | Isotipo (solo el símbolo "W") — trazo `#3347DD` |
| `brand/mark-dark.svg` | Isotipo para fondo oscuro |

**Paleta de la marca:** azul `#3347DD` (idéntico a `--brand-blue-500`).

## 5.2 Iconos de app (`/icons`)
| Archivo | Uso |
|---|---|
| `icons/icon.svg` | Icono PWA vectorial (`purpose: any`) |
| `icons/icon-192.png`, `icons/icon-512.png` | Iconos PWA |
| `icons/icon-maskable-192.png`, `icons/icon-maskable-512.png` | Iconos maskable (Android) |
| `icons/apple-touch-icon.png` | Icono iOS |
| `favicon.svg`, `favicon.ico`, `favicon-dark.svg` | Favicons (claro/oscuro) |

## 5.3 Código (en `/`)
| Archivo | Bytes | Rol |
|---|---|---|
| `index.html` | 22.611 | Shell + critical CSS inline |
| `main-IXWMM7SO.js` | 1.252.855 | Bundle principal (Angular + app) |
| `styles-RYCGKBXC.css` | 110.746 | CSS global (Tailwind + tokens + componentes) |
| `ngsw.json` | 11.847 | Config del service worker (lista de chunks) |
| `ngsw-worker.js` | — | Worker de Angular PWA |
| `manifest.webmanifest` | 943 | Manifiesto PWA |
| `chunk-D8lZCCEd.js` | 846 | Chunk crítico de arranque |
| `chunk-jgQbO1tX.js` | 167.740 | Chunk crítico de arranque |
| **+ ~88 `chunk-*.js`** | varios | Módulos lazy (features) |

Total de chunks JS referenciados en `ngsw.json`: **~90**.

## 5.4 Lista completa de chunks (hasahed, sin nombre semántico)
Los nombres son hashes de contenido, por lo que **no revelan** la feature. Están en
`recon/assets/ngsw.json`. Ejemplos:
`chunk-7AiOt71Z.js`, `chunk-BOVHLHK9.js`, `chunk-C056D3CS.js`, `chunk-Du-qeotM.js`, …
(el inventario completo se puede regenerar con `recon/assets/ngsw.json`).

## 5.5 Maps
No hay source maps: `main-*.js.map` devuelve el shell HTML (22611 bytes). El código está minificado.

## 5.6 Lo que se descargó a `recon/assets/`
```
recon/assets/
├─ styles-RYCGKBXC.css
├─ main-IXWMM7SO.js
├─ chunk-D8lZCCEd.js
├─ chunk-jgQbO1tX.js
├─ ngsw.json
├─ manifest.webmanifest
├─ favicon.svg / favicon.ico / favicon-dark.svg
├─ brand/{mark,mark-dark,wordmark,wordmark-dark}.svg
└─ icons/{icon.svg,icon-192.png,icon-512.png,icon-maskable-*.png,apple-touch-icon.png}
```
