# Métricas reales de los componentes de iOS 27

**Fecha:** 2026-10-21 · **Origen:** `Apple iOS 27 UI Kit.sketch` (oficial de Apple) y la
biblioteca pública `sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/symbols`
(1.857 símbolos, 107 variables de color, 105 estilos de texto, 42 estilos de capa).

Datos crudos: [`ios27-geometry.json`](./ios27-geometry.json) (21 páginas, 1.657 símbolos con
tamaño, estilos y textos).

---

## 1. Medidas de referencia (pts)

| Componente | Medida | Cantidad | Uso en BLINK |
|---|---|---|---|
| **Segmented Control** | **80 × 28** | 6 | `.tabs` (Inventario, Finanzas, Catálogo) |
| | 370 × 48 / 370 × 32 | 4 / 4 | Variantes grande y compacto |
| **Toggle** | **64 × 28** | 12 | Interruptores de Ajustes/Finanzas |
| | 59 × 37 | 2 | Variante con etiqueta |
| **List row** | **402 × 52** | 16 | Filas de inventario/contactos |
| | 402 × 68 | 6 | Fila con dos líneas (título + metadatos) |
| **Tab bar item** | **48 × 48** | 8 | Items de la tab bar móvil |
| | 346 × 62 | 16 | Tab bar completa (5 tabs + accessory) |
| **Sidebar row** | **260 × 44** | 10 | Filas de la sidebar de escritorio |
| | 180 × 64 | 4 | Fila de sidebar con sección |
| **Text field** | **288 × 52** | 8 | Campos de formulario |
| **Stepper** | **46 × 32** | 12 | Ajustes de cantidad |
| | 92 × 32 | 2 | Stepper con etiqueta |
| **Button** | 50 × 50 | 24 | Botón grande |
| | 72 × 50 / 91 × 50 | 24 | Botón con icono y con texto |
| **Toolbar** | 44 × 44 | 16 | Botón de toolbar |
| | 402 × 56 | 12 | Toolbar completa |
| **Page control** | 393 × 44 | 36 | Paginación |
| **Menu item** | 198 × 54 / 38 / 60 | 10 c/u | Menús contextuales |
| **Alert** | 120 × 48 | 6 | Botón de alerta |
| | 300 × 304 | 2 | Alert con contenido |
| **Popover** | 130 × 130 | 24 | Popover cuadrado (iPad) |
| **Slider** | 37 × 24 | 4 | Thumb del slider |
| | 402 × 52 | 24 | Slider completo |
| **Progress** | 20 × 20 / 35 × 35 | 2 c/u | Spinner |

## 2. Tipografía (del kit oficial)

| Estilo | Tamaño | Interlineado |
|---|---|---|
| Large Title | 34 | 41 |
| Title 1 | 28 | 34 |
| Title 2 | 22 | 28 |
| Title 3 | 20 | 25 |
| Headline | 17 | 22 |
| Body | 17 | 22 |
| Callout | 16 | 21 |
| Subheadline | 15 | 20 |
| Footnote | 13 | 18 |
| Caption 1 | 12 | 16 |
| Caption 2 | 11 | 13 |

## 3. Materiales Liquid Glass (blur real)

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

## 4. Qué usa ya BLINK

| Pieza BLINK | Medida BLINK | Medida iOS 27 | Estado |
|---|---|---|---|
| Control segmentado (`.tabs`) | ~28 px | 80 × 28 | ✅ coincide en alto |
| Fila de tabla (`table.data td`) | ~46 px | 402 × 52 | ⚠️ 6 px más baja |
| Item de tab bar | ~28 px (ícono+label) | 48 × 48 | ⚠️ el área táctil debe ser 48 |
| Toggle | — | 64 × 28 | Pendiente |
| Stepper | 26 × 26 (`.stepper button`) | 46 × 32 | ⚠️ más pequeño |
| Campo de texto (`.input`) | 41 px | 288 × 52 | ⚠️ 11 px más bajo |
| Botón (`.btn`) | 44 px | 50 px | ⚠️ 44 es el mínimo táctil, iOS usa 50 |
| Radio (`.rate-chip`) | ~28 px | — | — |
| Header de tabla | ~37 px | — | — |

## 5. Taxonomía completa del kit (35 grupos)

Action Sheets · Activity View · Alerts · App Icons · Buttons · Color Pickers ·
Date and Time Pickers · Edit Menu · Examples · FaceID · Home Indicators ·
iPhone Duo · Keyboard · Lists · Menu Bar (iPad) · Menus · Page Control ·
Popovers (iPad Only) · Progress Indicators · Scroll Edge Effect ·
Segmented Controls · Sheets (iPhone) · Sheets · Sidebar · Sliders ·
Status Bars · Stepper · System · Tab Bars · Text Fields · Toggles · Toolbars ·
Wallpapers · Windows

> Cada grupo tiene subcarpetas **Dark** y **Light**, y dentro variantes por
> tamaño y estado (Idle / Pressed / Disabled).

## 6. Cómo regenerar la geometría

```bash
# El .sketch se lee con 7-Zip (bundle, no zip plano)
cd app
npm run tokens:ios
```

Los datos de geometría se extraen con `app/scripts/extract-ios-geometry.mjs`
(opcional, requiere 7-Zip y el kit en `~/OneDrive/Documentos`).
