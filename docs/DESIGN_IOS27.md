# Diseño iOS 27 / iPadOS 27 — Extracción y guía de aplicación

**Fecha:** 2026-10-21 · **Versión:** 1.5.0 (extracción) · vigente en 1.8.3
**Fuentes:** `SF-Symbols-27.dmg` (oficial de Apple) · kit Figma *iOS and iPadOS 27* · Apple HIG

> **Este documento cubre la primera extracción (v1.5.0), basada en el `.dmg` de
> SF Symbols y en el índice de páginas del kit de Figma.** Para los valores
> definitivos ver:
>
> - [`DESIGN_IOS27_KIT.md`](./DESIGN_IOS27_KIT.md) — tokens oficiales extraídos
>   del **UI Kit de iOS 27 en `.sketch`** (107 colores, 105 estilos de texto,
>   42 materiales).
> - [`IOS27_METRICAS_COMPONENTES.md`](./IOS27_METRICAS_COMPONENTES.md) — las
>   **medidas reales** de 1.657 componentes del kit y su comparación con BLINK.
> - [`ICONOS_Y_PWA.md`](./ICONOS_Y_PWA.md) — el set de SF Symbols que sí está
>   en producción y su nota de licencia.

---

## 0. Resumen de la extracción

| Origen | Qué se obtuvo | Volumen |
|---|---|---|
| `SF-Symbols-27.dmg` → `SFSymbolsShared.framework/Resources/colors-26.csv` | **Paleta del sistema iOS 27**: 20 colores × 8 variantes + opacidades de capa | 20 filas |
| `SF-Symbols-27.dmg` → `Resources/Metadata/base_symbols_map.json` | Catálogo de símbolos | 1.841 base · 3.986 nombres |
| `SF-Symbols-27.dmg` → `Resources/*.svg` | Vectores reales (capa *badge*) | 26 SVG |
| `SF-Symbols-27.dmg` → `Library/Fonts/` | Familia SF Pro completa (Display / Text / Rounded × 9 pesos) | 85 OTF |
| `SF-Symbols-27.dmg` → `Resources/English.lproj/License.rtf` | Texto de la licencia | 119 líneas |
| Kit Figma *iOS and iPadOS 27* (fileKey `bMaKUeop8gwH6oVzHT2QKb`) | Índice de 44 páginas de componentes | 44 páginas |

**Extractos guardados en** [`ios27/`](./ios27/):
`colores.json` · `simbolos.json` · `LICENCIA-SF-SYMBOLS.txt` · `svg-badge-referencia/`

> **Limitación de la API de Figma:** con seat *View* en plan *Starter*, los endpoints
> Tier 1 (`GET file`, `GET nodes`, `GET images`) permiten **20 llamadas por mes** — el
> PAT no cambia ese techo (`retry-after: 398482` s ≈ 4,6 días). Los specs a nivel de
> nodo (radios, alturas, padding) se completarán cuando se reinicie la cuota.
>
> **Cómo se resolvió sin la API:** el kit oficial viene también como archivo
> `.sketch` (`Apple iOS 27 UI Kit.sketch`, 160 MB), que es un bundle y se lee
> con 7-Zip. Procesándolo en local se obtuvieron **los tokens y la geometría
> exactos** sin gastar una sola llamada. Ver
> [`DESIGN_IOS27_KIT.md`](./DESIGN_IOS27_KIT.md) y
> [`IOS27_METRICAS_COMPONENTES.md`](./IOS27_METRICAS_COMPONENTES.md).

---

## 1. Paleta del sistema iOS 27 (datos exactos)

Extraída de `colors-26.csv`. Cada color trae 8 variantes.

| Color | Light Std | Light Vibrant | Dark Std | Dark Vibrant | macOS |
|---|---|---|---|---|---|
| red | `#ff383c` | `#f52f32` | `#ff4245` | `#ff4747` | systemRedColor |
| orange | `#ff8d28` | `#f58625` | `#ff9230` | `#ff9e33` | systemOrangeColor |
| yellow | `#ffcc00` | `#f5c200` | `#ffd600` | `#ffe014` | systemYellowColor |
| green | `#34c759` | `#26bf4d` | `#30d158` | `#3bdb63` | systemGreenColor |
| mint | `#00c8b3` | `#00bda9` | `#00dac3` | `#2de0cd` | systemMintColor |
| teal | `#00c3d0` | `#00b3bf` | `#00d2e0` | `#2dd7e0` | systemTealColor |
| cyan | `#00c0e8` | `#00abcf` | `#3cd3fe` | `#47d8fc` | systemCyanColor |
| **blue** | **`#0088ff`** | `#0078f0` | **`#0091ff`** | `#0a99ff` | systemBlueColor |
| indigo | `#6155f5` | `#5c50e6` | `#6b5dff` | `#7163ff` | systemIndigoColor |
| purple | `#cb30e0` | `#b72bc9` | `#db34f2` | `#e647fc` | systemPurpleColor |
| pink | `#ff2d55` | `#f5234b` | `#ff375f` | `#ff4169` | systemPinkColor |
| brown | `#ac7f5e` | `#9e7354` | `#b78a66` | `#c29672` | systemBrownColor |
| white | `#ffffff` | `#ffffff` | `#ffffff` | `#ffffff` | white |
| gray | `#8e8e93` | `#848489` | `#98989d` | `#a2a2a7` | systemGrayColor |
| black | `#000000` | `#000000` | `#000000` | `#000000` | black |

### Etiquetas (3 niveles)

| Nivel | macOS | Valor |
|---|---|---|
| primary | labelColor | `#000000` (claro) · `#ffffff` (oscuro) |
| secondary | secondaryLabelColor | `#000000` · `#ffffff` |
| tertiary | tertiaryLabelColor | `#000000` · `#ffffff` |
| quaternary | quaternaryLabelColor | `#000000` · `#ffffff` |
| quinary | quinaryLabelColor | `#000000` · `#000000` |

Con opacidad (capas primary/secondary/tertiary): **100 % / 50 % / 18 %** en claro
y **100 % / 50 % / 25 %** en oscuro.

### Opacidades de relleno (system materials)

| Nivel | Claro | Oscuro |
|---|---|---|
| primary | 10 % | 10 % |
| secondary | 8 % | 8 % |
| tertiary | 5 % | 5 % |
| quaternary | 3 % | 3 % |
| quinary | 2 % | 2 % |

---

## 2. Escala tipográfica

### iOS / iPadOS 27 (Apple HIG)

| Estilo | Peso | Tamaño | Interlineado | Enfatizado |
|---|---|---|---|---|
| Large Title | Regular | 31 | 38 | Bold |
| Title 1 | Regular | 25 | 31 | Bold |
| Title 2 | Regular | 19 | 24 | Bold |
| Title 3 | Regular | 17 | 22 | Semibold |
| Headline | Semibold | 14 | 19 | Semibold |
| Body | Regular | 14 | 19 | Semibold |
| Callout | Regular | 13 | 18 | Semibold |
| Subhead | Regular | 12 | 16 | Semibold |
| Footnote | Regular | 12 | 16 | Semibold |
| Caption 1 | Regular | 11 | 13 | Semibold |
| Caption 2 | Regular | 11 | 13 | Semibold |

Tamaños accesibles (Dynamic Type) disponibles en `IOS_TEXT_STYLES_AX` (AX1→AX5).

### macOS 26 (escritorio)

Large Title 26/32 · Title 1 22/26 · Title 2 17/22 · Title 3 15/20 ·
Headline 13/16 (Heavy) · Body 13/16 · Callout 12/15 · Subheadline 11/14 ·
Footnote 10/13 · Caption 1 10/13 (Medium) · Caption 2 10/13

**Tamaño mínimo legible (HIG):** iOS/iPadOS **11 pt**, macOS **10 pt**.

---

## 3. Materiales

### Liquid Glass (iOS 26/27)

Dos variantes según el HIG:

| Variante | Cuándo | Comportamiento |
|---|---|---|
| `regular` | Componentes del sistema sobre fondos normales | Difumina **y ajusta la luminosidad** del fondo para mantener la legibilidad |
| `clear` | Solo sobre fondos visualmente ricos | Muy translúcido; el fondo sigue siendo protagonista |

Reglas de Apple (citadas del HIG):

> **"Don't use Liquid Glass in the content layer."** — el glass forma la capa
> *funcional* (barras de pestañas, sidebars) que flota sobre el contenido.

> **"Use Liquid Glass effects sparingly."** — solo en los elementos funcionales más
> importantes.

> Si el contenido de fondo es **brillante**, añadir una **capa de oscurecimiento del
> 35 %**.

### Materiales estándar (capa de contenido)

`ultraThin` · `thin` · `regular` (por defecto) · `thick` — con los valores de opacidad
de la tabla de rellenos.

### Implementación web (aproximación)

```css
.glass {
  border-radius: 22px;                        /* radio continuo iOS 27 */
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    inset 0 1.5px 0 rgba(255, 255, 255, 0.55),  /* borde especular */
    inset 0 -1px 0 rgba(255, 255, 255, 0.12),
    0 10px 30px rgba(0, 0, 0, 0.14);
}
@media (prefers-reduced-transparency: reduce) {
  .glass { background: #FFFEFB; backdrop-filter: none; -webkit-backdrop-filter: none; }
}
```

> CSS **no puede** reproducir la refracción del material real de Apple
> (`backdrop-filter` no desplaza píxeles). Lo que se puede replicar es el blur, la
> saturación, el tinte y el **borde especular**, que es lo que hace que un panel se
> lea como vidrio.

---

## 4. Mapeo iOS 27 → BLINK POS

| Patrón iOS 27 | Dónde aplica en BLINK | Nota |
|---|---|---|
| **Navigation Split View** (iPadOS) | `Vender.tsx`: catálogo \| ticket fijo | El ticket va a la derecha como columna de detalle |
| **Sidebar** (iPadOS) | `Shell.tsx`: navegación colapsable | Ya existe como sidebar; se colapsa a iconos |
| **Tab Bar** (iOS) | Móvil: barra inferior en vez del drawer | POS · Inventario · Contactos · Finanzas |
| **Label colors de 3 niveles** | `tokens.css` | Separar secundario/terciario (hoy 0.78/0.74, casi idénticos) |
| **Colores semánticos** | `tokens.css` | `ios-blue`, `ios-green`, `ios-red`… como alias del sistema |
| **Escala tipográfica** | `tokens.css` | Escala densa: 11/12/13/14/17/19/25/31 |
| **Área táctil 44 pt** | `.btn` ya tiene `min-height: 44px` | ✅ conforme |
| **Radios continuos** | `--ios-radius-*` | 8 / 12 / 16 / 20 / 22 |
| **Liquid Glass** | **Solo la landing** (header sticky + hero) | Nunca en tablas ni en el POS |
| **Materiales estándar** | Capas de contenido del POS | Translucidez sutil, sin refraction |
| **Lista con columna-secondary en píldora** | Tablas de inventario/finanzas | Patrón de macOS 26 (importe a la derecha como píldora) |

### Regla dura

> El POS (tablas, precios, stock) queda **100 % opaco**. El glass es solo de la
> landing pública. Coherente con el HIG de Apple y con la decisión tomada.

---

## 5. ⚠️ Licencia — lo que NO se puede usar en BLINK

Extraje la licencia del propio `.dmg` (`Resources/English.lproj/License.rtf`).
Texto completo en [`ios27/LICENCIA-SF-SYMBOLS.txt`](./ios27/LICENCIA-SF-SYMBOLS.txt).

### SF Symbols

> *"THE APPLE SOFTWARE IS TO BE USED SOLELY FOR CREATING USER INTERFACES TO BE USED
> IN SOFTWARE PRODUCTS RUNNING ON APPLE'S iOS, iPadOS, macOS, tvOS OR watchOS
> OPERATING SYSTEMS"*

> *"Your use of Symbols obtained from Apple's SF Font is limited to creating mock-ups
> of user interfaces for software products running on Apple's iOS, iPadOS, macOS and
> tvOS"*

**BLINK POS es una web app** (Chrome/Windows/Android). **No puede distribuir los
SF Symbols.** Los 26 SVG extraídos quedan en `ios27/svg-badge-referencia/` solo como
documentación; **no se despliegan**.

### SF Pro (la fuente)

> *"you may use the Apple Font solely for creating mock-ups of user interfaces to be
> used in software products running on Apple's iOS, iPadOS, macOS or tvOS"*

> *"You may use this Apple Font only for the purposes described in this License and
> only if you are a registered Apple Developer"*

**Estado actual de BLINK:** el `fonts.css` ya documentaba que SF Pro *"no está
licenciada para web pública"* y migró a la pila del sistema, **pero los 5 archivos
`.otf` seguían en `app/public/fonts/` y se servían públicamente** en
`https://www.blink.com.ve/fonts/SF-Pro-Display-Bold.otf` (HTTP 200, 84 KB).

✅ **Corregido en esta versión:** se eliminó `app/public/fonts/` del repositorio y
del despliegue. Ninguna fuente propietaria se distribuye ahora.

### Alternativas libres recomendadas

| Recurso | Licencia | Nota |
|---|---|---|
| **Phosphor Icons** | MIT | 7.000+ iconos, estilo *duotone* muy cercano a SF Symbols |
| **Lucide** | ISC | 1.500+ iconos, trazo de 24 px igual que SF Symbols |
| **Tabler Icons** | MIT | 5.000+ iconos |
| **Inter** (fuente) | SIL OFL 1.1 | Sustituto de SF Pro, métricas casi idénticas |
| **Material Symbols** | Apache 2.0 | Set oficial de Google con variantes filled/outlined |

**Recomendación:** mantener los iconos SVG propios de BLINK (ya son 34 y funcionan) y
ampliar con **Phosphor** cuando haga falta cobertura. Para tipografía, usar la pila
del sistema actual (`-apple-system` / `Segoe UI`), que ya renderiza SF Pro en
dispositivos Apple sin distribuir nada.

---

## 6. Cómo usar los tokens desde el código

```ts
import { IOS_COLORS, iosColor, IOS_TEXT_STYLES, LIQUID_GLASS } from "../lib/ios-tokens";

iosColor("blue");                            // "#0088ff"
iosColor("blue", { dark: true });             // "#0091ff"
iosColor("blue", { vibrant: true, dark: true }); // "#0a99ff"

IOS_TEXT_STYLES.body.size;                   // 14
IOS_TEXT_STYLES.body.leading;                // 19

LIQUID_GLASS.regular.blur;                   // 20
```

Los valores CSS equivalentes ya están en `app/src/styles/tokens.css` con el prefijo
`--ios-*`.
