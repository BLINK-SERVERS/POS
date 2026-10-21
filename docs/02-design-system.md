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

| Rol | Token | Hex | Uso |
|---|---|---|---|
| Fondo | `--blink-bg-main` | `#FFFEFB` | **Todos** los fondos |
| Acento | `--blink-primary` | `#007AFF` | Solo CTA, enlaces activos y foco |
| Texto | `--blink-text-muted` | `#424242` | Textos, bordes, iconos |

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

```css
--font-primary: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI",
                Roboto, system-ui, "Helvetica Neue", Arial, sans-serif;
--font-mono:   "SF Mono", ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace;
```

- **No se distribuye ninguna fuente.** `"SF Pro Display"` solo se usa si el
  dispositivo ya la tiene (Apple). En Windows cae en Segoe UI.
- El archivo `app/public/fonts/` se eliminó en la v1.5.0: servía SF Pro
  públicamente, con su licencia. Verificado en 404 tras el despliegue.

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
| `--radius-md` | 12px | tarjetas, listas |
| `--radius-lg` | 18px | superficies grandes |
| `--radius-pill` | 50px | píldoras |
| `--shadow-card` | `0 1px 2px rgba(66,66,66,.04)` | elevación mínima |
| `--shadow-pop` | `0 12px 32px rgba(66,66,66,.18)` | popovers, modales |
| `--transition-speed` | `0.2s ease-in-out` | transiciones |

---

## 4. Métricas de componentes (medidas reales de iOS 27)

Extraídas del UI Kit oficial (1.657 símbolos). Tabla completa en
[`IOS27_METRICAS_COMPONENTES.md`](./IOS27_METRICAS_COMPONENTES.md).

| Componente | Medida oficial | Aplicado en BLINK |
|---|---|---|
| Control segmentado | 80 × 28 | `Tabs` (Konsta `<Segmented>`) |
| Fila de lista | 402 × 52 | `table.data tbody tr` → 52 px |
| Campo de texto | 288 × 52 | `.input` / `.select` → 52 px |
| Toggle | 64 × 28 | `.toggle` |
| Stepper | 46 × 32 | `.stepper button` |
| Item de tab bar | 48 × 48 | `.shell__tabbar a` (área táctil) |
| Botón grande | 50 × 50 | `.btn` (44 px mínimo táctil) |

---

## 5. Listas *inset grouped* (HIG · Lists)

El patrón de lista de iOS, no el de tabla de macOS:

- Contenedor **sin borde**, con sombra suave: la separación la hace el fondo.
- Separadores **hairline sólidos** (`--ios-separator`), **inset** por el padding.
- Etiqueta a la izquierda en color primario, valor a la derecha en secundario.
- En escritorio las tablas **no** llevan divisores verticales.

Implementado en `app.css` con el bloque `table.data tbody tr`.

---

## 6. Liquid Glass

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

> **Liquid Glass solo en la landing.** En el POS (tablas, precios, stock) todo
> es **100 % opaco**: un precio o una cantidad no puede quedar legibles a
> través de un desenfoque.

Implementado con `<Glass>` de Konsta UI en la tab bar móvil y en la landing.

---

## 7. Iconografía

- **SVG únicamente.** Sin emoji en ninguna pantalla.
- Set: **86 SF Symbols** de Apple, normalizados a `currentColor`
  (`app/src/lib/sf-symbols.ts`, generado con `npm run icons:sf`).
- API pública estable: `<Icon name="…" size={…} />`, con `IconName` como
  unión de tipos. Ningún *call site* cambia al migrar.
- **Licencia:** los SF Symbols son material de Apple con uso restringido a
  software de plataformas Apple. Está documentado, junto con las alternativas
  libres (Phosphor MIT, Lucide ISC, Tabler MIT), en
  [`ICONOS_Y_PWA.md`](./ICONOS_Y_PWA.md).

---

## 8. Componentes

| Componente | Origen | Notas |
|---|---|---|
| `Card`, `PageHead`, `Field`, `EmptyState` | propios | envuelven los estilos de iOS |
| `Tabs` | Konsta `<Segmented>` | control segmentado de iOS |
| `Searchbar` | Konsta | búsqueda en la barra |
| `Glass` | Konsta | tab bar flotante y landing |
| `DataTable` | propio | tabla en escritorio, tarjetas en móvil |
| `Receipt` | propio | ticket en vivo, siempre visible |
| `Icon` | SF Symbols | `currentColor`, sin emoji |

Konsta UI es MIT. Se usa como **capa de componentes iOS**, no como fuente de
la paleta: los tokens de BLINK mandan.

---

## 9. Verificación

`npm run verify:ui` comprueba automáticamente en las 15 vistas:

- render sin errores de consola;
- `h1` a 22 px;
- iconos no vacíos;
- ausencia de desbordamiento horizontal.

Sale con código 1 si algo falla, así que sirve como **regresión visual** en CI.

---

## 10. Referencias

| Documento | Contenido |
|---|---|
| [`IOS27_METRICAS_COMPONENTES.md`](./IOS27_METRICAS_COMPONENTES.md) | Medidas reales de cada componente de iOS 27 |
| [`DESIGN_IOS27_KIT.md`](./DESIGN_IOS27_KIT.md) | Tokens, tipografía y materiales del UI Kit |
| [`REDISENO_KONSTA_HIG.md`](./REDISENO_KONSTA_HIG.md) | Reglas del HIG aplicadas una a una |
| [`DESIGN_APPLE_HIG_REFERENCE.md`](./DESIGN_APPLE_HIG_REFERENCE.md) | Patrón de lista/tabla de Apple |
| [`ICONOS_Y_PWA.md`](./ICONOS_Y_PWA.md) | Iconos, favicon, PWA y licencias |
| [`HIG/`](./HIG) | 85 páginas del Human Interface Guidelines de Apple |
