# 02 · Design System

Extraído directamente del CSS público. Fuente de verdad:
`docs/tokens.json` (clasificado) y `docs/tokens.css` (listo para `@import`).

**Total: 252 tokens.** Grupos: `color` (67), `tw` (74, runtime de Tailwind),
`brand` (12), `neutral` (13), `text` (27), `radius` (9), `shadow` (6), `container` (9),
`font` (8), `pos` (4), `sidebar` (2), `violet` (2), `ease` (3), `animate` (2), `spacing`, `topbar`, `shell`, `motion`, `rail`.

---

## 1. Paleta de marca

### Azul de marca (escala)
| Token | Hex | Uso típico |
|---|---|---|
| `--brand-blue-25` | `#dae4fc` | fondos hover suaves |
| `--brand-blue-50` | `#eef0fb` | superficies muy claras |
| `--brand-blue-100` | `#d5d9f5` | |
| `--brand-blue-200` | `#aab3eb` | bordes de marca sutiles |
| `--brand-blue-300` | `#7f8de0` | |
| `--brand-blue-400` | `#5567d6` | |
| **`--brand-blue-500`** | **`#3347dd`** | **Color primario / `theme-color`** |
| `--brand-blue-600` | `#243baf` | hover de marca |
| `--brand-blue-700` | `#18278c` | pressed |
| `--brand-blue-800` | `#0f1a73` | deep |

### Acentos y neutros
| Token | Hex | Nota |
|---|---|---|
| `--brand-orange` | `#fe9300` | `--color-accent` |
| `--brand-deep-ink` | `#322961` | superficie inversa |
| `--violet-50` | `#f3ecfb` | |
| `--violet-700` | `#5b21b6` | |

Neutros (`--neutral-0` → `--neutral-100`):
`#ffffff, #fafafc, #f4f4fa, #f1f1f9, #e7e7f5, #cfcfe5, #9c9cc2, #64648f, #48486b, #32325c, #26264e, #1f1f47, #080812`
(en pasos 0,10,15,20,30,40,50,60,70,80,90,95,100).

---

## 2. Tokens semánticos

### Superficies (`--color-surface-*`)
`default`(blanco) · `subtle` · `muted` `#eceef8` · `elevated` `#f9f9ff` · `inverse`(deep-ink) ·
`app` · `brand` `#3347dd` · `brand-hover` · `brand-pressed` · `brand-deep` · `brand-subtle` `#eef3ff` ·
`success`/`error`/`warning`/`info` (+ variantes `-subtle`) · `neutral-subtle` `#f4f5fd` ·
`disabled` · `tooltip`.

### Texto (`--color-text-*`)
`primary` `#1f1f47` · `secondary` `#48486b` · `tertiary` `#6b688e` · `disabled` ·
`inverse` `#fafafa` · `on-brand` (blanco) · `brand` `#243baf` · `success` `#008765` ·
`error` `#dc2626` · `warning` `#92400e` · `neutral` `#4b4869`.

### Bordes (`--color-border-*`)
`default` `#dddbe8` · `subtle` `#eeecf6` · `strong` `#b0aec8` · `brand` · `brand-subtle` ·
`focus` `#3347dd` · `success`/`error`/`warning`/`disabled`.

### Iconos (`--color-icon-*`)
`default` `#4b4869` · `secondary`/`neutral` `#7b78a0` · `brand` `#3347dd` ·
`success`/`error`/`warning`/`on-brand`/`disabled`.

### Estados semánticos
| Familia | Color base |
|---|---|
| success | `#16a34a` (texto `#008765`) |
| error | `#dc2626` / borde `#ef4444` |
| warning | `#f5b800` (texto `#92400e`) |
| info | `#2f5fb3` |

---

## 3. Tipografía
- **Sans:** `Montserrat, "Avenir Next", "Segoe UI", system-ui, sans-serif`
  (pesos **400, 500, 600, 700**, servidas por Google Fonts v31).
- **Mono:** `JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace`.

Escala (`--text-*` con line-height asociada):
| Token | size | line-height |
|---|---|---|
| xs | .75rem | 1/.75 |
| sm | .875rem | 1.25/.875 |
| base | 1rem | 1.5 |
| lg | 1.125rem | 1.75/1.125 |
| xl | 1.25rem | 1.75/1.25 |
| 2xl | 1.5rem | 2/1.5 |
| 3xl | 1.875rem | 1.2 |
| 4xl | 2.25rem | 2.5/2.25 |
| 5xl | 3rem | 1 |

Tokens de label: `--text-label-button` (1rem/1, 500), `--text-label-input` (.875rem/1.4, 400),
`--text-label-caption` (.75rem/1rem, 500). Base global: `--font-size-base` .875rem.

---

## 4. Radios, sombras, espaciado

**Radios:** `xs .125rem` · `sm .25rem` · `md .5rem` · `lg .75rem` · `xl 1rem` · `2xl 1.5rem` ·
`3xl 2rem` · `full 9999px` · `none 0`.

**Sombras:**
| Token | Valor |
|---|---|
| `--shadow-xs` | `0 1px 1px rgba(16,24,40,.06)` |
| `--shadow-sm` | `0 1px 2px rgba(16,24,40,.07)` |
| `--shadow-card` | `0 4px 8px rgba(16,24,40,.08), 0 12px 24px rgba(16,24,40,.1)` |
| `--shadow-floating` | `0 8px 24px -8px rgba(16,24,40,.18), 0 2px 6px rgba(16,24,40,.08)` |
| `--shadow-tooltip` | `0 3px 5px rgba(50,50,92,.2)` |
| `--shadow-container` | `0 0 0 1px #dddbe8, 0 1px 2px rgba(16,24,40,.05)` |

**Espaciado:** base `--spacing: .25rem` (grid de Tailwind, escala 4px).

**Contenedores:** xs 20rem · sm 24rem · md 28rem · lg 32rem · xl 36rem · 3xl 48rem ·
4xl 56rem · 6xl 72rem · 7xl 80rem.

**Overlays:** `--color-overlay rgba(50,41,97,.45)` · `-subtle` .32 · `-strong rgba(22,18,48,.72)`.

---

## 5. Tokens de layout (específicos de la app)
| Token | Valor | Significado |
|---|---|---|
| `--topbar-height` | 3.85rem | altura de barra superior |
| `--shell-gutter` | .75rem | margen del shell |
| `--sidebar-width` | 13rem | sidebar expandida |
| `--sidebar-width-compact` | 11rem | sidebar compacta |
| `--sidebar-width-collapsed` | 4.5rem | sidebar colapsada |
| `--pos-ticket-w` | 27.5rem | ancho del ticket de venta (POS) |
| `--pos-ticket-w-md` | 23.75rem | variante md |
| `--pos-ticket-w-sm` | 23rem | variante sm |
| `--pos-ticket-narrow` | `min(40%, 23rem)` | ticket angosto |

> Estos tokens revelan la **topología del POS**: sidebar de navegación + área de contenido +
> **ticket/recibo lateral** de ~27.5rem. Es la "distribución" (layout) del producto.

---

## 6. Movimiento / animación
- `--ease-out`: `cubic-bezier(0,0,.2,1)` · `--ease-in-out`: `cubic-bezier(.4,0,.2,1)`
- `--ease-out-quart`: `cubic-bezier(.25,1,.5,1)` · `--ease-out-expo`: `cubic-bezier(.16,1,.3,1)`
- `--ease-in-quick`: `cubic-bezier(.4,0,1,1)`
- `--default-transition-duration`: `.15s`
- `--animate-spin`: `spin 1s linear infinite` · `--animate-pulse`: `pulse 2s ...`
- Respeta `@media (prefers-reduced-motion: reduce)` (anula duración de animaciones/transiciones).
- Animación propia del login: `.auth-wink-eye` (el "guiño" del logo) y `.auth-shop`.

---

## 7. Convenciones de componentes observadas

**Botón primario** (`bentobutton`):
`bg-surface-brand text-text-on-brand h-9 px-4 rounded-md text-sm font-medium`,
hover `bg-surface-brand-hover`, `active:scale-[0.97]`, focus `outline-2 outline-border-focus outline-offset-2`,
disabled `opacity-50 cursor-not-allowed pointer-events-none`. En punteros gruesos (`pointer-coarse`) sube a `h-11`.

**Botón secundario** (`intent="secondary"`):
`bg-surface-default border border-border-brand-subtle text-text-brand`,
hover `bg-surface-brand-subtle hover:border-border-brand`.

**Input de texto**:
`h-9 px-4 rounded-md text-sm border border-border-default font-medium`,
hover `border-border-strong`, focus `outline-2 outline-border-focus`,
placeholder `text-text-tertiary`, en `pointer-coarse` → `h-11`.

**Label de campo**: `text-sm font-bold leading-5 text-text-primary` + asterisco `text-text-error` para requeridos,
con `helper` en `text-xs text-text-tertiary` y `aria-live="polite"`.

**Superficie de tarjeta / contenedor**: `rounded-md/2xl/3xl` + `--shadow-card` / `--shadow-container`.

**Botones de texto/enlace**: `font-semibold text-text-brand hover:underline`, con área táctil ampliada en móvil
(`pointer-coarse:py-3`).
