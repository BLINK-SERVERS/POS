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

En móvil (< 860 px) el contenido va a sangre, la sidebar sigue siendo un
drawer —también flotante— y la navegación pasa a la tab bar con Liquid Glass.

---

## 5. Métricas de componentes (medidas reales de iOS 27)

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

## 5. Listas, tablas y acciones de fila (HIG · Lists)

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

> **Liquid Glass solo en la landing y en la tab bar móvil** (que es*cromo de
> navegación*, no un dato). En el POS —tablas, precios, stock, ticket— todo
> es **100 % opaco**: un precio o una cantidad no puede quedar legible a
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

## 9. Verificación

`npm run verify:ui` recorre la app en **dos tamaños** (escritorio 1280×860 y
móvil 390×844) y comprueba, en cada vista:

- render sin errores de consola;
- `h1` presente y con el tamaño esperado;
- iconos no vacíos;
- ausencia de desbordamiento horizontal;
- elementos que se salen por la derecha;
- elementos con **poco texto pero mucha altura** (síntoma de un choque de
  clases).

Además renderiza el **onboarding** y las **pantallas de acceso sin sesión** en
contexto aparte (con sesión el gate de ruta devuelve al Inicio y nunca se
ven).

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
