# Rediseño con Konsta UI + Human Interface Guidelines

**Fecha:** 2026-10-21 · **Versión:** 1.8.3

> Este documento describe el rediseño de la **v1.6.0**. Las correcciones
> posteriores están en el CHANGELOG; en particular, el **preflight de Tailwind
> v4 se activó en la v1.7.0** (ver la sección 1.1, que reemplaza la decisión
> original de importarlo sin preflight).

---

## 1. Konsta UI instalado

| Dato | Valor |
|---|---|
| Paquete | `konsta@5.5.0` (MIT) |
| Subpath | `konsta/react` (soporte React nativo) |
| Tailwind | `tailwindcss@4.3.3` + `@tailwindcss/vite` |
| Licencia | MIT — uso comercial libre |

### 1.1 Tailwind v4 con preflight (decisión vigente desde la v1.7.0)

```css
/* app/src/styles/konsta.css */
@import "tailwindcss";            /* COMPLETO: theme + preflight + utilities */
@import "konsta/react/theme.css";
```

La decisión original de la v1.6.0 era importar Tailwind **sin preflight**
(``@import "tailwindcss/theme.css" layer(theme)`` +
`@import "tailwindcss/utilities.css" layer(utilities)`) para no romper el reset
propio de `app.css`. Se **revirtió** en la v1.7.0: sin preflight, los
componentes de Konsta no recibían el reset base que necesitan (botones sin
borde del navegador, tablas, inputs, listas).

**Por qué no rompe el diseño de BLINK:** la prioridad de cascada lo resuelve.

- El preflight de Tailwind vive en `layer(base)`.
- `app.css` se importa **después** y **sin capa**.
- En CSS, las reglas **sin capa ganan a las de cualquier capa**.

Por tanto, los resets propios de BLINK siguen mandando y el preflight solo
rellena los huecos que Konsta necesita.

**Verificado tras el cambio:** fondo `#FFFEFB`, botón primario `#007AFF`,
tipografía `SF Pro Display` intactos, **0 errores de consola** y las 15 vistas
en verde (`npm run verify:ui`).

### 1.2 Nota sobre el orden de importación

El orden importa: `konsta.css` (Tailwind + Konsta) se importa **antes** que
`app.css` en el punto de entrada. Si se invirtiera, `app.css` seguiría
ganando (está sin capa), pero el orden explícito evita sorpresas.

### Configuración

- `vite.config.ts` → plugin `@tailwindcss/vite`
- `index.html` → clase `k-ios` en `<html>` (activa la variante iOS de Konsta)
- `App.tsx` → `<KonstaProvider theme="ios" iosHoverHighlight>`

---

## 2. HIG de Apple leído por completo

Apple publica una **versión Markdown** de cada página del HIG (`.md` en la misma URL).
Se descargaron **64 páginas / 764 KB** y quedan en [`HIG/`](./HIG/) con un índice en
[`HIG/INDEX.md`](./HIG/INDEX.md) y las *best practices* extraídas por página.

Páginas clave extraídas: `layout`, `lists-and-tables`, `tab-bars`, `sidebars`, `buttons`,
`search-fields`, `segmented-controls`, `materials`, `color`, `typography`, `icons`,
`dark-mode`, `accessibility`, `popovers`, `sheets`, `alerts`, `modality`, `tooltips`,
`steppers`, `toggles`, `text-fields`, `onboarding`, `settings`, `privacy`, `notifications`,
`progress-indicators`, `keyboards`, `gestures`, `data-entry`, `collections`, `tools`,
`loading`, `web`… (39 con *best practices* extraídas).

---

## 3. Qué se aplicó del HIG

### 3.1 Barra de pestañas inferior en móvil

> **HIG · Tab bars:** *"Use a tab bar to support navigation, not to provide actions"*,
> *"Include tab labels to help with navigation"*, *"Avoid overflow tabs"*,
> *"Avoid applying a similar color to tab labels and content layer backgrounds"*.

| Regla | Aplicación en BLINK |
|---|---|
| Solo navegación | Las 5 secciones son módulos, no acciones |
| Con etiquetas | `labels` activo en el `Tabbar` |
| Sin overflow | Máximo 5 tabs; se filtran por `features` del comercio |
| Monocromática | Iconos BLINK en gris; solo la tab activa usa el azul de marca |
| Capa funcional flotante | Fondo translúcido con `blur(20px) saturate(180%)` |
| Accesible | Fallback opaco con `prefers-reduced-transparency: reduce` |

Implementación: `Shell.tsx` (`<Tabbar>` + `<TabbarLink component={NavLink}>`) y
`app.css` (`.shell__tabbar`, visible solo bajo 860px).

En escritorio la tab bar se oculta y la navegación sigue en la **sidebar** (equivalente
web del sidebar de iPadOS). El `main` recibe `padding-bottom` para que la tab bar
no tape el ticket.

### 3.2 Buscador del POS con `Searchbar` de Konsta

> **HIG · Search fields:** un único campo, *placeholder* explícito, foco automático.

El `<input>` suelto se sustituyó por `<Searchbar>` de Konsta: píldora redondeada, icono
de lupa, botón de limpiar y foco iOS nativo.

### 3.3 Liquid Glass solo en la capa funcional

> **HIG · Materials:** *"Don't use Liquid Glass in the content layer"*,
> *"Use Liquid Glass effects sparingly"*.

| Superficie | Material | Razón |
|---|---|---|
| Header de la landing | Glass (Konsta `<Glass>`) | Capa funcional sobre contenido rico |
| Tab bar móvil | Translúcido propio | Capa funcional |
| Drawer móvil | Scrim translúcido | Capa funcional |
| **Tablas, precios, stock** | **Opaco** | Contenido: la legibilidad manda |
| Ticket del POS | Opaco | Contenido denso |

`prefers-reduced-transparency: reduce` → el glass se sustituye por superficie opaca en
todos los casos (comprobado: en el navegador headless el fallback se activa solo).

### 3.4 Jerarquía de la sidebar (desktop)

> **HIG · Sidebars:** *"show no more than two levels of hierarchy"*,
> *"Consider letting people hide the sidebar"*, *"use familiar symbols"*.

La sidebar de BLINK tiene un solo nivel visible (Ventas agrupa Vender/Historial) y usa
iconos propios en lugar de emojis.

---

## 4. Componentes de Konsta instalados

Ya instalados y funcionando: `KonstaProvider` · `useTheme` · `Tabbar` + `TabbarLink` · `Searchbar` · `Glass` · `Segmented` + `SegmentedButton`.

Disponibles para las siguientes iteraciones (todos con estilo iOS nativo):

`Panel` (sidebars iPadOS) · `Table`/`TableHead`/`TableRow`/`TableCell` · `List`/`ListItem`/`ListButton`/`ListInput` ·
`Sheet` (modales) · `Dialog` · `Popup` · `Popover` · `ActionSheet` ·
`Navbar` · `Toolbar`/`ToolbarPane` · `Badge` · `Chip` · `Button` · `Stepper` · `Toggle` · `Range` ·
`Progressbar` · `Messagebar` · `Notification` · `Toast` · `Card` · `Block` · `Icon` · `Fab` · `MenuList` ·
`Checkbox` · `Radio` · `Preloader` · `Link` · `Breadcrumbs` · `useTheme` (light/dark/system)

---

## 4.1 Preflight de Tailwind v4 (activado)

`app/src/styles/konsta.css` importa Tailwind **completo**, con preflight:

```css
@import "tailwindcss";
@import "konsta/react/theme.css";
```

**Por qué no rompe el diseño de BLINK:** el preflight vive en `layer(base)`, y `app.css`
se importa **después y sin capa**. En CSS, las reglas sin capa ganan a las de cualquier
capa, así que los resets propios de BLINK mandan sobre los de Tailwind. Konsta sí recibe
el base que le faltaba (botones sin el marco del navegador, tablas, inputs, listas).

**Regresiones detectadas y corregidas al activarlo** (auditoría de todos los
`border-color` sueltos del proyecto):

| Regla | Problema | Corrección |
|---|---|---|
| `.btn--ghost` | Solo fijaba `border-color`; con `border-width: 0` perdía el marco | `border: 1px solid var(--color-border-strong)` |
| `.btn--danger` | Ídem | `border: 1px solid var(--color-border-strong)` |

El resto de reglas con `border-color` heredan el ancho de su regla base, que ya declara
`border: 1px solid ...` — sin impacto.

---

## 4.2 Control segmentado de iOS 26/27

`Tabs` en `app/src/components/ui.tsx` ahora usa `<Segmented>` + `<SegmentedButton>` de
Konsta. Al reescribir el componente, **todas** las vistas con pestañas (Inventario,
Finanzas con 8 secciones, Catálogo, Contactos) adoptan el patrón sin tocar sus call
sites.

Patrón (HIG · Segmented controls): segmento activo relleno en el azul de marca con texto
blanco, inactivos en el mismo azul sobre una pista translúcida, ajustado al contenido.

---

## 4.3 Bug corregido: hook dentro de un `useCallback`

`store.tsx` → `syncRate` llamaba a `useStoreState()` **dentro** del callback:

```ts
const syncRate = useCallback(async () => {
  const base = useStoreState().state.business.baseCurrency ?? "USD";  // ❌ hook fuera del render
```

Ese callback se ejecuta fuera del render (auto-sync al abrir el POS), por lo que
React lanzaba **"Invalid hook call"** y la pantalla del POS se rompía.

**Corrección:** se lee el estado del módulo directamente.

```ts
const base = currentState.business.baseCurrency ?? "USD";  // ✅
```

Detectable con `page.on("pageerror")` en Playwright: el error aparecía al navegar a
`/app/ventas` con la sesión iniciada.


---

## 5. Estado de lo propuesto

| # | Tarea | Origen HIG | Estado |
|---|---|---|---|
| 1 | Sidebar de escritorio como `Panel` de Konsta (colapsable) | Sidebars | ⏳ Pendiente — **siguiente paso** (v1.9.0) |
| 2 | `Segmented` en los tabs de Catálogo/Inventario/Finanzas | Segmented controls | ✅ Hecho en la **v1.7.0** (también en Contactos) |
| 3 | Modales de cobro y ajustes como `Sheet` (tarea modal) | Sheets / Modality | ⏳ Pendiente |
| 4 | Importes de tabla como **píldora** en la columna derecha | Lists and tables (macOS 26) | ❌ **Descartado** — es un patrón de **macOS 26** (Finder), no de iOS. El usuario lo corrigió explícitamente: *"debe ser de iOS 27 no macos"*. |
| 5 | Tema oscuro con `useTheme` + `dark` de Konsta | Dark mode | ⏳ Pendiente |
| 6 | Fila seleccionada persistida en tablas | Lists and tables | ⏳ Pendiente |

### Lo que sí se hizo, con el HIG de fondo

| Regla del HIG | Dónde se aplicó |
|---|---|
| Listas *inset grouped* (contenedor sin borde, hairline inset, etiqueta/valor) | `app.css`, bloque `table.data tbody tr` |
| Control segmentado de iOS | `components/ui.tsx` → `Tabs` con `<Segmented>` de Konsta |
| Tab bar flotante con material translúcido | `components/Shell.tsx` → `<Glass>` de Konsta |
| Medidas oficiales de los componentes (52 px de fila, 64×28 de toggle, 46×32 de stepper, 48×48 de tab bar) | `app.css`, bloque de métricas iOS 27 |
| Superficies opacas en el POS; material translúcido solo en la landing | `styles/landing.css` vs `styles/app.css` |

Las medidas exactas están en
[`IOS27_METRICAS_COMPONENTES.md`](./IOS27_METRICAS_COMPONENTES.md) y los datos
crudos en [`ios27-geometry.json`](./ios27-geometry.json).

---

## 6. Nota de licencias (actualizada en la v1.8.0)

- **Konsta UI**: MIT → uso comercial libre. ✅
- **SF Symbols**: **sí se usan** desde la v1.8.0 (86 iconos). La licencia de
  Apple los restringe a plataformas Apple, y el repo de terceros del que se
  obtuvo el arte no trae `LICENSE`. **Riesgo asumido y documentado** en
  [`ICONOS_Y_PWA.md`](./ICONOS_Y_PWA.md), junto con las alternativas libres
  (Phosphor MIT, Lucide ISC, Tabler MIT).
- **SF Pro**: **no** se distribuye. La app usa la pila del sistema
  (`-apple-system`, Segoe UI…). Los archivos de la fuente se eliminaron del
  repo en la v1.5.0.
- **Tokens y medidas del UI Kit de iOS 27**: son datos objetivos (colores,
  tipografía, medidas, materiales). Se usan sin restricción y están
> documentados en [`DESIGN_IOS27_KIT.md`](./DESIGN_IOS27_KIT.md) y
  [`IOS27_METRICAS_COMPONENTES.md`](./IOS27_METRICAS_COMPONENTES.md).
