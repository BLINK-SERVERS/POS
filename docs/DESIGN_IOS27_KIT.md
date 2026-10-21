# UI Kit oficial de iOS 27 — extracción y aplicación

**Fecha:** 2026-10-21 · **Versión:** 1.8.0
**Origen:** `~/OneDrive/Documentos/Apple iOS 27 UI Kit.sketch` (160 MB, Sketch 2026.3.1)

---

## 1. Qué contiene el kit

| Métrica | Cantidad |
|---|---|
| Páginas | 34 |
| Artboards | 1.578 |
| Colores compartidos (swatches) | 107 |
| Estilos de texto | 105 |
| Estilos de capa (materiales) | 42 |

**Páginas:** Sidebars · Tab Bars · Lists · Segmented Controls · Menus · Buttons ·
Toolbars · Text Fields · Steppers · Toggles · Sliders · Sheets · Popovers · Alerts ·
Action Sheets · Keyboards · System · Materials · Colors · Text Styles and Dynamic Type ·
Date and Time Pickers · Page Controls · Progress Indicators · Empty States ·
Activity Views · FaceID · Color Wells and Pickers · Library Preview · Kit · Change Log

## 2. Cómo se extrae

El `.sketch` es un **bundle** (no un zip plano): `meta.json`, `document.json`,
`user.json`, `pages/*.json`, `images/`, `previews/`.

En Windows se lee con **7-Zip** (soporta el bundle directamente):

```bash
cd app
npm run tokens:ios
```

El script `app/scripts/build-ios-tokens.mjs`:
1. Extrae `document.json` y `meta.json` con 7-Zip.
2. Agrupa los swatches por patrón `Grupo/Modo/N Nombre`.
3. Normaliza los estilos de texto (`encodedAttributes` → familia, tamaño, peso, interlineado).
4. Escribe `app/src/lib/ios-design-tokens.ts`.

> **Trampa de los nombres:** los estilos de Sketch incluyen glifos privados de SF
> Symbols intercalados en el texto. Hay que filtrar por `[^\x20-\x7E]` en vez de
> rangos Unicode concretos, o se destruye el nombre completo.

## 3. Tokens obtenidos

### Colores del sistema (12 × light/dark)

| Color | Light | Dark |
|---|---|---|
| blue | `#0088ff` | `#0091ff` |
| green | `#34c759` | `#30d158` |
| red | `#ff383c` | `#ff4245` |
| orange | `#ff8d28` | `#ff9230` |
| yellow | `#ffcc00` | `#ffd600` |
| mint | `#00c8b3` | `#00dac3` |
| teal | `#00c3d0` | `#00d2e0` |
| cyan | `#00c0e8` | `#3cd3fe` |
| indigo | `#6155f5` | `#6d7cff` |
| purple | `#cb30e0` | `#db34f2` |
| pink | `#ff2d55` | `#ff375f` |
| brown | `#ac7f5e` | `#b78a66` |

### Etiquetas (5 niveles)

| Nivel | Light | Dark |
|---|---|---|
| primary | `#000000` | `#ffffff` |
| secondary | `#3c3c43` | `#ebebf5` |
| tertiary | `#3c3c43` | `#ebebf5` |
| quaternary | `#3c3c43` | `#ebebf5` |
| quinary | `#3c3c43` | `#ebebf5` |

### Rellenos (5 niveles)

| Nivel | Light | Dark |
|---|---|---|
| primary | `#787878` | `#787880` |
| secondary | `#787880` | `#787880` |
| tertiary | `#767680` | `#767680` |
| quaternary | `#747480` | `#767680` |
| quinary | `#000000` | `#767680` |

### Escala tipográfica (iOS 27)

| Estilo | Tamaño | Interlineado | Variantes |
|---|---|---|---|
| Large Title | 34 | 41 | Default · Bold · Italic · Bold Italic |
| Title 1 | 28 | 34 |idem |
| Title 2 | 22 | 28 | idem |
| Title 3 | 20 | 25 | idem |
| Headline | 17 | 22 | idem |
| Body | 17 | 22 | idem |
| Callout | 16 | 21 | idem |
| Subheadline | 15 | 20 | idem |
| Footnote | 13 | 18 | idem |
| Caption 1 | 12 | 16 | idem |
| Caption 2 | 11 | 13 | idem |

Además el kit trae variantes de **leading** (Tight / Default / Loose) para los estilos
grandes, y las variantes se nombran con el PostScriptName (`SFPro-Regular`,
`SFPro-Semibold`, `SFPro-RegularItalic`, `SFPro-SemiboldItalic`).

### Materiales Liquid Glass

| Material | Fondo | Blur |
|---|---|---|
| Light/Regular - Small | `#f8f8f8` | 6 |
| Light/Regular - Medium | `#cccccc` | 15 |
| Light/Regular - Large | `#ffffff` | 30 |
| Dark/Regular - Small | `#000000` | 6 |
| Dark/Regular - Medium | `#1a1a1a` | 30 |
| Dark/Regular - Large | `#1a1a1a` | 30 |
| Clear | `#f8f8f8` | 3 |
| Materials/Light/4 Ultrathin | `#ffffff` | 45 |
| Materials/Light/2 Regular | `#ffffff` | 75 |
| Materials/Dark/1 Thick | `#000000` | 75 |

## 4. Qué se aplicó al proyecto

| Archivo | Cambio |
|---|---|
| `app/src/lib/ios-design-tokens.ts` | **Nuevo** (generado). Tokens oficiales del kit. |
| `app/src/styles/tokens.css` | Bloque `--ios-*` con los valores **exactos** del kit (colores, etiquetas, rellenos, escala tipográfica, blur del glass). |
| `app/src/lib/sf-symbols.ts` | **Nuevo** (generado). **86 SF Symbols** normalizados a `currentColor`. |
| `app/src/components/Icon.tsx` | Migrado de iconos de trazo propios a SF Symbols rellenos. La API pública (`IconName`, `size`) se mantiene: **ningún call site cambia**. |
| `app/src/styles/app.css` | Métricas reales de los componentes iOS 27 aplicadas (fila 52 px, campo 52 px, toggle 64×28, stepper 46×32, tab bar 48×48). |
| `docs/ios27-geometry.json` | **Nuevo**. Geometría de **1.657 símbolos** de 21 páginas del kit (tamaño, estilos y textos de cada componente). |
| `docs/IOS27_METRICAS_COMPONENTES.md` | **Nuevo**. Las medidas oficiales y su comparación con BLINK. |

### Scripts

```bash
npm run tokens:ios   # extrae los tokens del .sketch -> ios-design-tokens.ts
npm run icons:sf     # descarga y normaliza los SF Symbols -> sf-symbols.ts
npm run verify:ui    # verifica las 15 vistas (render, iconos, overflow, consola)
npm run docs:check   # verifica que no haya enlaces rotos en la documentación
```

`verify:ui` deja capturas en `verify-shots/` y sale con código 1 si algo falla:
útil como regresión tras cada cambio de diseño.

## 5. Nota de licencia

- **Los tokens de diseño** (hex, tamaños, pesos, radios de desenfoque) son **datos
  objetivos**: se pueden replicar libremente. Esto es lo que se aplicó al CSS.
- **Los SF Symbols** son artwork con licencia de Apple restringida a software de
  plataformas Apple. Ver [`ICONOS_Y_PWA.md`](./ICONOS_Y_PWA.md) para el detalle y las
  alternativas libres (Phosphor MIT, Lucide ISC, Tabler MIT).

## 6. Verificación

```
OK  landing      h1=57.6px iconos=18 (vacios 0) overflowX=false errores=0
OK  login        h1=22px   iconos=17 (vacios 0) overflowX=false errores=0
...  (15 vistas)
vistas con problemas: 0
errores de consola totales: 0
```

Tests: 50/50 · Typecheck limpio · Build OK · Deploy `Published`.
