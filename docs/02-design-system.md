# 02 · Design System · BLINK POS

**Fecha:** 2026-10-21 · **Versión:** 1.8.3

Fuente de verdad: `app/src/styles/tokens.css` (tokens) y
`app/src/styles/app.css` (componentes). El bloque `--ios-*` procede del
**UI Kit oficial de iOS 27** de Apple.

> El design system de **WINK** (proyecto previo) está en
> [`wink/02b-design-system-wink.md`](./wink/02b-design-system-wink.md) como
> referencia histórica. No se usa en BLINK.

---

## 1. Principio rector

BLINK usa una **paleta estricta de 3 colores**; cualquier variación se deriva
de esos tres con transparencia, para no introducir un cuarto color:

| Rol | Token | Claro | Oscuro | Uso |
|---|---|---|---|---|
| Fondo | `--blink-bg-main` | `#FFFEFB` | `#000000` | Fondo de la app |
| Superficie | `--color-bg-elevated` | `#FFFEFB` | `#1a1a1a` | Tarjetas, paneles, tablas |
| Acento | `--blink-primary` | `#0088FF` | `#0091FF` | Solo CTA, enlaces activos y foco |
| Texto | `--blink-text-muted` | `#424242` | `#EBEBF5` | Textos, bordes, iconos |
| Tinta | `--blink-dark` | `#1D1D1F` | `#FFFFFF` | Texto principal |

> **HIG (Dark Mode):** *"the color palette in Dark Mode includes dimmer
> background colors and brighter foreground colors. It's important to realize
> that these colors aren't necessarily inversions of their light
> counterparts"*. Los dos modos **no** son una inversión: cada valor sale de
> su variante en el **UI Kit de iOS 27** (materiales *Dark/Regular*,
> `IOS_LABELS.dark`, `IOS_SYSTEM_COLORS.blue.dark`).

### La paleta oficial BLINK

Diez grupos de color, cada uno con su par claro/oscuro. Es la fuente de
verdad de la marca (y la que se aplica en los tokens):

| Grupo | Claro | Oscuro |
|---|---|---|
| Rojo | `#ff383c` | `#ff4245` |
| Carmesí | `#ff2d55` | `#ff375f` |
| Naranja | `#ff8d28` | `#ff9230` |
| Amarillo | `#ffcc00` | `#ffd600` |
| Verde | `#34c759` | `#30d158` |
| Turquesa 1 | `#00c8b3` | `#00dac3` |
| Turquesa 2 | `#00c3d0` | `#0fd5e2` |
| Azul / Celeste | `#00c0e8` | `#3cd3fe` |
| **Azul Principal** | `#0088ff` | `#0091ff` |
| Índigo / Violeta | `#6a5ff6` | `#7684ff` |
| Magenta / Púrpura | `#ce3ce2` | `#dd40f3` |
| Marrón / Tierra | `#b18767` | `#bb916f` |

El **Azul Principal** es el acento de la app; el verde, el rojo y el
amarillo son los estados semánticos (éxito, error, aviso).

### Cómo se cambia de apariencia

Un solo valor en `<html>`: `color-scheme`.

| Preferencia | `color-scheme` | Resultado |
|---|---|---|
| Automático (por defecto) | `light dark` | Sigue al sistema operativo |
| Claro | `light` | Siempre claro |
| Oscuro | `dark` | Siempre oscuro |

Los tokens se declaran con `light-dark(claro, oscuro)`, de modo que la
paleta **no se duplica**: una regla, dos modos. El ajuste vive en
**Ajustes › Apariencia** y se recuerda en el dispositivo; un script en línea
de `index.html` lo aplica **antes del primer pintado** (sin destello) y
Konsta recibe `dark={esOscuro}` para sus propias variantes oscuras.

Derivados (transparencia, sin color nuevo):

```css
--color-text-secondary: rgba(66, 66, 66, 0.78);   /* contraste AA sobre #FFFEFB */
--color-text-tertiary:  rgba(66, 66, 66, 0.74);
--color-border:         rgba(66, 66, 66, 0.14);
--color-border-strong:  rgba(66, 66, 66, 0.26);
--color-accent-soft:    rgba(0, 122, 255, 0.10);
--color-accent-ring:    rgba(0, 122, 255, 0.35);
--color-neutral-soft:   rgba(66, 66, 66, 0.07);
```

### Estados semánticos

Excepcionalmente, cuatro colores más para estado (nunca para decoración):

| Estado | Token | Hex |
|---|---|---|
| Éxito | `--blink-success` | `#34A853` |
| Error | `--blink-danger` | `#EA4335` |
| Aviso | `--blink-warning` | `#FBBC05` |
| Texto principal | `--blink-dark` | `#1D1D1F` |

> El acento `#007AFF` **no** se usa para decorar. Si algo no es un CTA, un
> enlace activo o el foco, no lleva azul.

### Modo oscuro

La app es de un solo tema (claro). El bloque `--ios-*-dark` del UI Kit está
disponible en `tokens.css` para un futuro modo oscuro, pero **no se activa**.

---

## 2. Tipografía

**Una sola pila para toda la app** (landing, POS y páginas legales):

```css
--font-pila: "SF Pro", "SF Pro Text", "SF Pro Display", "Inter",
  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, …;
--font-display: var(--font-pila);
--font-text:    var(--font-pila);
--font-primary: var(--font-pila);
--font-mono:    "SF Mono", ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace;
```

- **SF Pro se pide al sistema con `local()`** (`app/src/styles/fonts.css`): en
  iPhone, iPad y Mac viene de serie; en Windows y Linux se usa si el usuario
  la instala (gratis, en `developer.apple.com/fonts`).
- Se declara la variante **variable**, con su eje óptico (`opsz`): el
  navegador interpola entre los tamaños ópticos Display y Text. La HIG lo
  explica: *"the system fonts support dynamic optical sizes, which merge
  discrete optical sizes (like Text and Display) and weights into a single,
  continuous design"*.
- `--font-display`, `--font-text` y `--font-primary` apuntan a **la misma
  pila**: la diferencia entre el corte Display y el Text la resuelve el eje
  óptico de la propia fuente, no el nombre de la familia. Antes se separaban
  ("SF Pro Display" para titulares, "SF Pro Text" para el cuerpo) y eso
  obligaba a que el titular y su párrafo se dibujaran con familias
  distintas.
- **Inter (SIL OFL 1.1) va justo detrás de SF Pro** y se sirve desde la app
  (`app/public/fonts/inter-latin.woff2`, 40 KB, recortado al juego de
  caracteres que usa el producto; licencia en
  `app/public/fonts/LICENSE-Inter.txt`). Es el respaldo para los equipos sin
  SF Pro instalada: sin él, el titular grande de la landing salía en la
  tipografía del sistema (Segoe UI) y el resto del texto en otra voz. Inter
  es la alternativa libre más parecida a SF Pro (mismas proporciones, eje
  `wght` 100-900).
- **No se distribuye ninguna fuente de Apple.** El archivo `app/public/fonts/`
  se eliminó en la v1.5.0 (servía SF Pro públicamente, con su licencia) y se
  verificó en 404 tras el despliegue. Los ficheros de la v1.10.0 viven solo en
  `app/.fonts-sf-local/` (ignorado por git) y **solo se sirven en
  desarrollo**, mediante un middleware propio de Vite (`apply: "serve"`) y un
  `fonts-dev.css` que se carga únicamente si `import.meta.env.DEV`.
- En desarrollo, `fonts-dev.css` declara **todo el rango 100-900**: los
  ficheros de `.fonts-sf-local/` son instancias estáticas (regular,
  semibold, bold e italic). Si un peso quedara sin cubrir, el navegador
  descartaba la familia y ese texto salía con la tipografía del sistema.
- La pila vive en `:root` (no en `body`) y los controles de formulario
  (`button`, `input`, `select`, `textarea`) heredan: el navegador les da su
  propia fuente por defecto. `--default-font-family` y `--font-sans` están
  definidos para que el preflight de Tailwind no imponga la pila del sistema
  al `<html>`.
- Los **nombres de familia son los reales** de los ficheros oficiales de
  Apple: `.SF NS Text` y `.SF NS Display` (leídos de su tabla `name`).

### Escala propia

| Token | Tamaño | Uso típico |
|---|---|---|
| `--fs-xs` | 0.75rem | pies, metadatos |
| `--fs-sm` | 0.8125rem | valores secundarios, tablas |
| `--fs-base` | 1rem | cuerpo |
| `--fs-lg` | 1.125rem | subtítulos |
| `--fs-xl` | 1.375rem | títulos de tarjeta |
| `--fs-2xl` | 1.75rem | `h1` de página (verificado por `verify:ui`) |

### Escala oficial de iOS 27 (del UI Kit)

Existe como referencia en `docs/DESIGN_IOS27_KIT.md` y en
`app/src/lib/ios-design-tokens.ts`:

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

---

## 3. Formas, sombras y movimiento

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 8px | inputs, chips |
| `--radius-md` | 12px | tarjetas, listas, botones |
| `--radius-lg` | 18px | superficies grandes (shell, paneles) |
| `--radius-pill` | 50px | píldoras (badges, chips) |
| `--shadow-ios-card` | `0 1px 2px rgba(29,29,31,.04), 0 4px 16px rgba(29,29,31,.05)` | tarjeta, grupo, tabla |
| `--shadow-ios-panel` | `0 1px 2px rgba(29,29,31,.05), 0 12px 32px rgba(29,29,31,.07)` | panel del shell, caja de acceso |
| `--shadow-ios-raised` | `0 1px 2px rgba(29,29,31,.06), 0 2px 6px rgba(29,29,31,.06)` | ficha de producto, vista previa |
| `--shadow-pop` | `0 12px 32px rgba(66,66,66,.18)` | modales |
| `--transition-speed` | `0.2s ease-in-out` | transiciones |

### Por qué sombra y no borde

La paleta obliga a que **todos** los fondos sean `#FFFEFB`, así que no se puede
usar un tinte de "fondo agrupado" para separar un grupo del lienzo (como hace
`systemGroupedBackground` en iOS). La jerarquía se construye **con elevación**:
la tarjeta flota sobre el lienzo blanco. Por eso las superficies **no llevan
marco de 1 px**: el marco era el recurso de aplicación web y la sombra hace
ese papel mejor.

---

## 4. El shell: lienzo flotante (iPadOS 27)

En iPadOS la barra lateral y el contenido **no son columnas pegadas al borde**
de la ventana, sino paneles flotantes redondeados. BLINK replica ese patrón:

```
┌──────────────────────────────────────────────┐
│  ┌────────────┐  ┌─────────────────────────┐  │
│  │  sidebar   │  │  barra de navegación    │  │
│  │  flotante  │  ├─────────────────────────┤  │
│  │  (18 px)   │  │                         │  │
│  │            │  │  contenido (scroll)     │  │
│  │            │  │                         │  │
│  └────────────┘  └─────────────────────────┘  │
└──────────────────────────────────────────────┘
```

| Pieza | Medida / regla |
|---|---|
| Separación entre paneles | 12 px (`gap`) + 12 px de margen exterior |
| Radio de los paneles | 18 px (`--radius-lg`) |
| Fila de la sidebar | **44 px** (medida oficial del UI Kit) |
| Icono de la sidebar | *well* de 26×26 con radio 7 px; relleno de acento cuando el item está activo |
| Barra de navegación | 56 px, hairline inferior, acciones en texto plano de acento |
| Título de pantalla | **Large Title** 34 px / leading 41 (28 px en móvil) |

### 4.1 · Navegación: sin hamburguesa, con barra inferior flotante

En móvil (< 860 px) el contenido va a sangre y **no hay menú hamburguesa**
ni panel lateral. La navegación es una **barra inferior flotante de
material** (Liquid Glass) y la gestión de cuenta vive en el **avatar de
la cabecera**.

```
┌───────────────────────────────┐
│  cabecera ······  (avatar)    │
│                               │
│         contenido             │
│                               │
│  ┌─────────────────────────┐  │
│  │ General  Catálogo  $  ⋮ │  │   ← 2 + 1 + 2
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

| Pieza | Regla |
|---|---|
| Elementos de la barra | **5** (el límite de la HIG): 2 a la izquierda, la acción principal y 2 a la derecha |
| Acción central | **Vender**, con el símbolo de dólar, en un círculo de acento (34 px), ligeramente mayor que el resto |
| Simetría | los dos elementos de cada lado, a la misma distancia del centro (± 1,5 px) |
| Item de tab bar | 48 × 48 (área táctil), icono + etiqueta |
| Menú de avatar | panel flotante bajo el avatar: cuenta, ajustes y **cerrar sesión** separado y en color de peligro |
| Presión | **sin escalado**: el toque se marca con tono, nunca con zoom (iOS no agranda el control) |

Los módulos que no caben en la barra (la HIG limita la barra a 5) se
alcanzan desde **General**, que hace de panel con la misma iconografía.

### 4.2 · Iconografía de los módulos

Una sola fuente de verdad (`app/src/lib/modulos.ts`): el mismo módulo
lleva el mismo icono en la sidebar de escritorio, en la barra inferior y
en el panel de General.

| Módulo | Icono | Glifo |
|---|---|---|
| General / Inicio | panel / dashboard | `grid2x2` |
| Ventas / Vender | carrito | `cart` |
| Historial | reloj | `clock` |
| Catálogo | etiqueta | `tag` |
| Inventario | caja / stock | `box` |
| Contactos | usuarios / libreta | `users` |
| Finanzas | billetera | `wallet` |
| Informes | gráficas | `chart` |

La cuenta (perfil y datos del comercio), los ajustes y el cierre de
sesión **no** están en la sidebar: están en el menú del avatar.

### 4.3 · La pantalla General (bento de cristal)

La sección se llama **General** (antes "Inicio"). Es el centro de control
del comercio: cuatro métricas con su variación y el gráfico de ventas
por mes.

```
┌──────────┬──────────┬──────────┬──────────┐
│ Ventas   │ Órdenes  │ Ticket   │ Margen   │  ← 4 tarjetas de métrica
│ totales  │ pagadas  │ promedio │ bruto    │
├──────────┴──────────┼──────────┴──────────┤
│ Ventas por mes       │ Capital │ Cierre    │  ← el gráfico ocupa 2 columnas
├──────────┬──────────┼──────────┴──────────┤
│ Por      │ Para     │ Módulos              │
│ atender  │ arrancar │                      │
└──────────┴──────────┴──────────────────────┘
```

| Pieza | Regla |
|---|---|
| Rejilla | 4 columnas en escritorio (≥ 1280 px), 2 en tablet y móvil |
| Tarjeta | fondo traslúcido + `backdrop-filter: blur(20px)`, borde de 1 px, radio de 22 px (20 px en móvil) |
| Cifra grande | SF Pro Display, 700, con `font-variant-numeric: tabular-nums` |
| Etiqueta | SF Pro Text, 12 px, secundaria |
| Pastilla de variación | verde `#34c759`/`#30d158` si sube, rojo `#ff383c`/`#ff4245` si baja; **no se muestra** si el periodo anterior fue 0 (no hay comparación honesta) |
| Detalle del mes | tarjeta flotante de cristal sobre el gráfico, con el mes, el importe, las órdenes y el ticket |
| periods | Hoy / Mes / Año, con el equivalente anterior como comparativo |

El gráfico es **interactivo**: cada barra es un botón (se puede tocar o
recorrer con el teclado) y la tarjeta flotante muestra el detalle exacto
del mes elegido.

> Detrás de las tarjetas hay un **velo de acento**: sobre una página clara
> el material translúcido solo se ve si hay algo que difuminar.

---

## 5. Métricas de componentes (medidas reales de iOS 27)

Extraídas del UI Kit oficial (1.657 símbolos). Tabla completa en
[`IOS27_METRICAS_COMPONENTES.md`](./IOS27_METRICAS_COMPONENTES.md).

| Componente | Medida oficial | Aplicado en BLINK |
|---|---|---|
| **Botón Large** | **50** de alto | `.btn` (50 px) |
| **Botón Medium** | **34** de alto | `.btn--sm` (34 px) |
| **Botón Small** | **28** de alto | `.btn--xs` (28 px) |
| Botón con símbolo (Large) | 50 × 50 | botón de icono |
| Botón con texto (Large) | 72 × 50 | `.btn` |
| Botón con símbolo + texto (Large) | 91 × 50 | `.btn` con icono |
| Control segmentado | 80 × 28 | `Tabs` (Konsta `<Segmented>`) |
| Fila de lista | 402 × 52 | `table.data tbody tr` → 52 px |
| Campo de texto | 288 × 52 | `.input` / `.select` → 52 px |
| Toggle | 64 × 28 | `.toggle` |
| Stepper | 46 × 32 | `.stepper button` |
| Item de tab bar | 48 × 48 | `.tabbar__item` (área táctil) |
| Fila de sidebar | 260 × 44 | `.nav__link` (44 px) |
| Alerta | 300 × 184 | `<Dialog>` de Konsta (300 px) |
| Botón de alerta | 120 × 48 | `<DialogButton>` de Konsta |
| Hoja inferior | borde inferior | `<Sheet>` de Konsta |
| Lista agrupada | 370 de ancho | `.form-group` |
| Cabecera de lista (Prominent) | 370 × 45 | `.page-head h1` (Title 1/34 px) |
| Diámetro de página (iPhone 17 Pro) | 402 pt de ancho | referencia del ancho de pantalla |

> Los botones de 34 y 28 px usan un **área táctil de 44 pt** en punteros
> gruesos (HIG · Buttons: *"a button needs a hit region of at least 44x44
> pt"*).

---

## 6. Botones con material Liquid Glass (HIG · Buttons / Materials)

### Medidas del kit

| Variante del kit | Alto | Símbolo | Texto | Símbolo + texto |
|---|---|---|---|---|
| Large | 50 | 50 | 72 | 91 |
| Medium | 34 | 34 | 56 | 75 |
| Small | 28 | 28 | 49 | 66 |

### Roles (HIG · Buttons)

| Rol | Clase | Aspecto |
|---|---|---|
| **Primary** | `.btn--primary` | relleno de acento + material |
| Normal | `.btn--ghost` / `.btn--soft` | relleno gris o tintado de acento |
| Cancel | `.btn--plain` | solo texto |
| Destructive | `.btn--danger` | relleno rojo suave |

La HIG es explícita: *"Don't assign the primary role to a button that performs
a destructive action"*. Por eso una acción destructiva **nunca** es el botón
Primary: en las alertas es un botón rojo aparte.

### El material

- **Variante "regular"** de Liquid Glass: desenfoque de **6 px** (el valor
  real del kit para *Light/Regular - Small*).
- **Brillo especular** en el borde superior (`inset 0 1px 0`) y sombra en el
  inferior: es lo que le da el aspecto de vidrio.
- **Degradado vertical** del material: más luz arriba, translúcido abajo.

### Forma

La HIG pide explícitamente una forma según la disposición:

- **Fila horizontal** → **cápsula** (`border-radius: 999px`): todos los arcos
  son circulares, es decir, **curvatura continua**.
- **Pila vertical** (botón a todo el ancho, `.btn--block`) → **rectángulo
  redondeado** de 12 px.

### Estado de pulsación

HIG: *"Always include a press state for a custom button"*. El botón se hunde
(`scale(.97)`) y el especular se apaga.

### Accesibilidad

- Área táctil de **44 pt** garantizada en punteros gruesos.
- Con `prefers-reduced-transparency` el material se desactiva y el botón
  pasa a relleno plano.

### Dónde **no** se aplica

> Los **datos** —tablas, precios, stock, ticket— siguen siendo **100 %
> opacos**. La HIG lo dice sin rodeos: *"Don't use Liquid Glass in the content
> layer"*. El material se reserva para los **controles**.

---

## 7. Listas, tablas y acciones de fila (HIG · Lists)

El patrón de lista de iOS, no el de tabla de macOS:

- Contenedor **sin borde**, con sombra suave: la separación la hace la sombra.
- Separadores **hairline sólidos** (`--ios-separator`), **inset** por el padding.
- Etiqueta a la izquierda en color primario, valor a la derecha en secundario.
- En escritorio las tablas **no** llevan divisores verticales.
- En escritorio los datos **no se parten**: si la columna no cabe, la tabla se
  desplaza en horizontal en vez de estrujar la cifra.
- Las **acciones de fila** (Editar, Archivar, Eliminar) son botones de **texto
  plano** en acento, no píldoras: es lo que hace iOS en las listas.

Implementado en `app.css` con el bloque `table.data tbody tr` y la clase
`.row-actions`.

### Estados vacíos

Icono en un círculo tintado (56 px), título en *Title 3* y texto de ayuda.
**Sin marco discontinuo**: era un recurso de aplicación web.

### KPIs

Una sola superficie con celdas separadas por hairline (`.kpis--group`), la
etiqueta en *footnote* secondary y el dato en *Title 2* tabular. Dentro de una
tarjeta se usa la variante `.kpis--inline` (solo las celdas).

---

## 8. Diálogos y formularios nativos (HIG · Alerts / Sheets / Modality)

### Qué componente se usa y cuándo

| Contexto | Componente | Presentación |
|---|---|---|
| Formulario con campos | `<Sheet>` de Konsta (móvil) / panel centrado (escritorio) | hoja inferior con tirador en móvil |
| Confirmación | `<Dialog>` de Konsta | alerta con el material de Apple |
| Aviso no bloqueante | `Toast` / `Messagebar` de Konsta | — |

En móvil, un formulario se presenta **siempre como hoja inferior**: sube
desde el borde, lleva tirador y esquineras redondeadas arriba. En escritorio
se presenta centrado, como en iPadOS.

### Alertas

HIG (Alerts): título corto, mensaje y hasta tres botones con rol. El
`<Dialog>` de Konsta ya trae el material y la medida del kit (**300 px** de
ancho, botones de **48 px** de alto).

- El botón de **rol Primary** lleva el acento.
- El de **rol Destructive** va en rojo y **nunca** es el Primary.
- El de **rol Cancel** es el que responde a la tecla Escape.

En BLINK, la confirmación es asíncrona:

```tsx
const confirm = useConfirm();
if (await confirm({
  title: "¿Eliminar el producto?",
  message: "Se borrará del catálogo y de tu inventario.",
  confirmText: "Eliminar",
  destructive: true,
})) {
  eliminar();
}
```

Ya **no queda ningún `window.confirm`** en la app: era un diálogo del
navegador, no de iOS.

### Formularios: listas agrupadas

Los campos **consecutivos** de un formulario forman una **lista agrupada**
(HIG · Lists): un contenedor redondeado con separadores hairline entre filas
(clase `.form-group`). Hay **44 grupos** en 11 ficheros.

Cuando el grupo cae dentro de una fila, sus campos siguen siendo los
elementos de la fila (`display: contents`), para que no se apilen.

### Controles

Los formularios usan los **controles nativos del navegador** (`input`,
`select`, `textarea`): son los que dan el comportamiento de teclado,
accesibilidad y selección de texto del sistema, y son los que iOS usa
detrás de sus propios componentes.

---

## 9. Liquid Glass

Materiales con desenfoque real, disponibles en `tokens.css` y en
`app/src/lib/ios-design-tokens.ts`:

| Material | Fondo | Blur |
|---|---|---|
| Light/Regular - Small | `#f8f8f8` | 6 |
| Light/Regular - Medium | `#cccccc` | 15 |
| Light/Regular - Large | `#ffffff` | 30 |
| Dark/Regular - Small | `#000000` | 6 |
| Dark/Regular - Large | `#1a1a1a` | 30 |
| Clear | `#f8f8f8` | 3 |

### Regla de uso

> **Liquid Glass solo en la landing y en la tab bar móvil** (que es*cromo de
> navegación*, no un dato). En el POS —tablas, precios, stock, ticket— todo
> es **100 % opaco**: un precio o una cantidad no puede quedar legible a
> través de un desenfoque.

Implementado con `<Glass>` de Konsta UI en la tab bar móvil y en la landing.

---

## 10. Iconografía

- **SVG únicamente.** Sin emoji en ninguna pantalla.
- Set: **102 SF Symbols** de Apple, normalizados a `currentColor`
  (`app/src/lib/sf-symbols.ts`, generado con `npm run icons:sf`).
  El set se parte en dos: `sf-nucleo.ts` (los 13 que usa la landing) y
  `sf-symbols.ts` (los 100, que carga la aplicación), de modo que la
  página pública no descarga los iconos que no usa.
- API pública estable: `<Icon name="…" size={…} />`, con `IconName` como
  unión de tipos. Ningún *call site* cambia al migrar.
- **Licencia:** los SF Symbols son material de Apple con uso restringido a
  software de plataformas Apple. Está documentado, junto con las alternativas
  libres (Phosphor MIT, Lucide ISC, Tabler MIT), en
  [`ICONOS_Y_PWA.md`](./ICONOS_Y_PWA.md).

---

## 11. Componentes

| Componente | Origen | Notas |
|---|---|---|
| `Card`, `PageHead`, `Field`, `EmptyState` | propios | envuelven los estilos de iOS |
| `Modal` | `<Sheet>` / panel propio | hoja inferior en móvil, panel centrado en escritorio |
| `Alert`, `useConfirm` | `<Dialog>` de Konsta | alerta nativa para confirmaciones |
| `Tabs` | Konsta `<Segmented>` | control segmentado de iOS, desplazable si hay muchas pestañas |
| `Searchbar` | Konsta | búsqueda en la barra |
| `Glass` | Konsta | tab bar flotante y landing |
| `DataTable` | propio | tabla en escritorio, tarjetas en móvil |
| `Receipt` | propio | ticket en vivo, siempre visible |
| `Icon` | SF Symbols | `currentColor`, sin emoji |

Konsta UI es MIT. Se usa como **capa de componentes iOS**, no como fuente de
la paleta: los tokens de BLINK mandan.

> ⚠️ Konsta impose algunos valores por clase de Tailwind (`justify-center` y
> `overflow-hidden` en el control segmentado, `w-full` en sus botones). Como
> `app.css` va **sin capa**, gana a las utilidades de Tailwind: por eso el
> segmentado se redefine en `.tabs`.

---

## 12. Verificación

`npm run verify:ui` recorre la app en una **matriz de 2 tamaños × 2
apariencias** (escritorio 1280×860 y móvil 390×844, en claro y en oscuro): **76
comprobaciones** —las 15 rutas en cada combinación, el onboarding, el acceso
sin sesión y la presentación del modal (hoja inferior en móvil / panel
centrado en escritorio). En cada vista comprueba:

- render sin errores de consola;
- `h1` presente y con el tamaño esperado;
- iconos no vacíos;
- ausencia de desbordamiento horizontal;
- elementos que se salen por la derecha;
- elementos con **poco texto pero mucha altura** (síntoma de un choque de
  clases);
- la presencia del **grupo de campos** y del **tirador de la hoja**;
- que la **apariencia se haya aplicado de verdad** (el fondo oscuro en
  oscuro, el claro en claro) y que el **contraste texto/fondo sea ≥ 4.5:1**
  (HIG · Dark Mode: *"make sure that the contrast ratio of colors is no
  lower than 4.5:1"*).

Además renderiza el **onboarding** y las **pantallas de acceso sin sesión** en
contexto aparte (con sesión el gate de ruta devuelve al Inicio y nunca se
ven).

Además hay scripts sueltos: `npm run qa:apariencia` (el cambio manual de
tema, la persistencia y la vuelta a "Automático") y `npm run qa:carga`
(medición de la carga real contra el build de producción).

Sale con código 1 si algo falla, así que sirve como **regresión visual** en CI.

---

## 13. Referencias

| Documento | Contenido |
|---|---|
| [`IOS27_METRICAS_COMPONENTES.md`](./IOS27_METRICAS_COMPONENTES.md) | Medidas reales de cada componente de iOS 27 |
| [`DESIGN_IOS27_KIT.md`](./DESIGN_IOS27_KIT.md) | Tokens, tipografía y materiales del UI Kit |
| [`REDISENO_KONSTA_HIG.md`](./REDISENO_KONSTA_HIG.md) | Reglas del HIG aplicadas una a una |
| [`DESIGN_APPLE_HIG_REFERENCE.md`](./DESIGN_APPLE_HIG_REFERENCE.md) | Patrón de lista/tabla de Apple |
| [`ICONOS_Y_PWA.md`](./ICONOS_Y_PWA.md) | Iconos, favicon, PWA y licencias |
| [`HIG/`](./HIG) | 85 páginas del Human Interface Guidelines de Apple |
