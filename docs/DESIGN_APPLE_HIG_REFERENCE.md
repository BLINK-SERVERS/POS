# Referencia de diseño: Apple macOS 26 ↔ BLINK POS

**Fecha:** 2026-10-20 · **Origen:** Figma Community — *macOS 26* (kit oficial de Apple)
**FileKey:** `o3yuG6lyAokRrfI4Xijgb3` · **Leído vía:** MCP de Figma + puente propio

Los extractos XML y las capturas de pantalla de cada página están en
[`apple-macOS-26/`](./apple-macOS-26/).

---

## 1. Paleta oficial de Apple (macOS 26)

### Acentos

| Color | Standard | Vibrant |
|---|---|---|
| Red | `#FF4245` | `#FF4747` |
| Orange | `#FF9230` | `#FF9E33` |
| Yellow | `#FFD600` | `#FFE014` |
| Green | `#30D158` | `#3BDB63` |
| Mint | `#00DAC3` | `#2DE0CD` |
| Teal | `#00D2E0` | `#2DD7E0` |
| Cyan | `#3CD3FE` | `#47D8FC` |
| **Blue** | **`#0091FF`** | **`#0A99FF`** |
| Indigo | `#6D7CFF` | `#7163FF` |
| Purple | `#DB34F2` | `#E647FC` |
| Pink | `#FF375F` | `#FF4169` |
| Brown | `#B78A66` | `#C29672` |
| Gray | `#98989F` | — |

### Fills (superficies translúcidas)

Escalonado de 5 niveles, igual en claro y oscuro:

| Nivel | Claro | Oscuro |
|---|---|---|
| Primary | `rgba(0,0,0,0.10)` | `#FFFFFF1A` (10%) |
| Secondary | `rgba(0,0,0,0.08)` | `#FFFFFF14` (8%) |
| Tertiary | `rgba(0,0,0,0.05)` | `#FFFFFF0D` (5%) |
| Quaternary | `rgba(0,0,0,0.03)` | `#FFFFFF08` (3%) |
| Quinary | `rgba(0,0,0,0.02)` | `#FFFFFF05` (2%) |

Component stroke (contorno de debug del kit): `#6155F5`

---

## 2. Escala tipográfica (SF Pro)

Cada estilo tiene variante **Regular** y **Emphasized**.

| Estilo | Tamaño | Peso (Emphasized) | Interlineado |
|---|---|---|---|
| Large Title | 26 | Bold 700 | 32 |
| Title 1 | 22 | Bold 700 | 26 |
| Title 2 | 17 | Bold 700 | 22 |
| Title 3 | 15 | Semibold 590 | 20 |
| Headline | 13 | **Heavy 860** | 16 |
| Body | 13 | Regular 400 | 16 |
| Callout | 12 | Regular 400 | 15 |
| Subheadline | 11 | Regular 400 | 13 |
| Footnote | 10 | Regular 400 | 13 |
| Caption 1 | 10 | Medium 510 | 13 |
| Caption 2 | 10 | Regular 400 | 13 |

**Jerarquía de color de etiquetas** (3 niveles, igual peso tipográfico):
`Label Color` (principal) → `Secondary Label Color` → `Tertiary Label Color`.
En tema oscuro: `rgba(255,255,255,0.85)` / `rgba(255,255,255,0.5)` / `rgba(255,255,255,0.35)`.

---

## 3. Patrón de lista / tabla (el más relevante para BLINK)

Del componente *List Item* del kit:

```
Fila compacta ≈ 28 px de alto
Estados de fondo:  None · Alternating Gray · Selected · Selected Inactive
Columna:            Primary (rectángulo) · Secondary (PÍLDORA redondeada)
```

Dos aprendizajes directos:

1. La **columna secundaria (importes a la derecha) se dibuja como píldora
   redondeada** (`border-radius: 999px`), no como texto plano. Da jerarquía
   visual al monto sin necesidad de color.
2. La columna primaria (nombre del producto) es texto plano en negrita; los
   metadatos van en una línea secundaria más pequeña y atenuada.

> Esto **coincide exactamente** con el modelo híbrido que ya pediste para
> BLINK (nombre en negrita arriba, metadatos debajo, importe a la derecha).

---

## 4. Gap analysis: Apple vs. BLINK POS

### Tipografía

| | Apple | BLINK actual (`tokens.css`) | Gap |
|---|---|---|---|
| Menor | 10 px (Caption) | 12 px (`--fs-xs`) | BLINK +2 px |
| Base | 13 px (Body) | 13 px (`--fs-sm`) | ✅ igual |
| Cuerpo | 13 px | 16 px (`--fs-base`) | **BLINK +3 px** |
| Título | 22 px (Title 1) | 22 px (`--fs-xl`) | ✅ igual |
| Display | 26 px (Large Title) | 28 px (`--fs-2xl`) | BLINK +2 px |

**Conclusión:** la escala de BLINK es basically la de Apple, salvo que el
"cuerpo" arranca en 16 px en vez de 13 px. Para tablas densas de inventario,
**13 px como base** (el `--fs-sm` actual) da ~23% más de filas por pantalla.

### Color

| Rol | Apple | BLINK | Nota |
|---|---|---|---|
| Primario | `#0091FF` | `#007AFF` | Δ menor, ambos "system blue" |
| Éxito | `#30D158` | `#34A853` | BLINK usa el verde de Google |
| Error | `#FF4245` | `#EA4335` | BLINK usa el rojo de Google |
| Advertencia | `#FFD600` | `#FBBC05` | BLINK usa el amarillo de Google |
| Texto | etiquetas 3 niveles | `#424242` + opacidades | ver abajo |

**Conclusión:** la paleta de BLINK es la de **Google Material**, no la de Apple.
Si el objetivo es que BLINK se lea como "Apple-like", el cambio de una sola
línea por token alcanza:

```css
--blink-success: #30D158;   /* era #34A853 */
--blink-danger:  #FF4245;   /* era #EA4335 */
--blink-warning: #FFD600;   /* era #FBBC05 */
--blink-primary: #0091FF;   /* era #007AFF */
```

### Opacidad de texto (el gap más visible)

| Nivel | Apple (oscuro) | BLINK actual |
|---|---|---|
| Primario | `rgba(255,255,255,0.85)` | `#1D1D1F` (sólido) |
| Secundario | `rgba(255,255,255,0.50)` | `rgba(66,66,66,0.78)` |
| Terciario | `rgba(255,255,255,0.35)` | `rgba(66,66,66,0.74)` |

⚠️ **Problema en BLINK:** el secundario (0.78) y el terciario (0.74) casi no se
distinguen — 4% de diferencia es imperceptible. Apple's separa 0.85 / 0.50 / 0.35.

**Corrección sugerida** (`tokens.css`):

```css
--color-text-secondary: rgba(66, 66, 66, 0.72);
--color-text-tertiary: rgba(66, 66, 66, 0.46);
```

### Bordes y superficies

| | Apple | BLINK |
|---|---|---|
| Borde sutil | fill Quaternary 3% | `rgba(66,66,66,0.14)` |
| Borde fuerte | — | `rgba(66,66,66,0.26)` |
| Superficie neutra | fill Secondary 8% | `rgba(66,66,66,0.07)` |

**Corrección sugerida** — el borde de BLINK (14%) está entre el Tertiary (5%) y
Secondary (8%) de Apple; bajarlo a ~8% haría las tablas más ligeras:

```css
--color-border: rgba(66, 66, 66, 0.09);
--color-border-strong: rgba(66, 66, 66, 0.20);
```

### Densidad de tabla

| | Apple | BLINK actual |
|---|---|---|
| Padding de celda | ≈ 6 px vertical | `0.7rem` (11.2 px) vertical |
| Alto de fila | ≈ 28 px | ≈ 33 px |

Para el requisito de "tabla compacta de alta densidad": bajar el padding a
`0.5rem` deja filas de ~29 px, en línea con Apple.

---

## 5. Cómo reutilizar esto en el código

### Importar los tokens de Apple

El MCP permite extraer variables de cualquier nodo:

```js
await figma.get_variable_defs({
  fileKey: "o3yuG6lyAokRrfI4Xijgb3",
  nodeId: "485:9769",   // página Accents
});
// → { "Accents/Blue": "#0091ff", "Accents/Green": "#30d158", ... }
```

Nodos útiles de este archivo:

| Página | nodeId | Contenido |
|---|---|---|
| Colors | `0:687` | Swatches de color |
| Text Styles | `0:962` | Escala tipográfica completa |
| Materials | `483:8848` | Materiales (vibrancy, blur) |
| Buttons | `207:14487` | Botones |
| Lists and Tables | `207:14499` | Patrón de lista/tabla |
| Text Fields | `207:14500` | Campos de texto |

### Píldora en la columna de importes

Para llevar el patrón de Apple a `table.data td.num`:

```css
/* Columna de importes como píldora (patrón Apple) */
table.data td[data-amount] {
  justify-self: end;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-pill);
  background: var(--color-neutral-soft);
  font-variant-numeric: tabular-nums;
}
```

---

## 6. Límites del plan

El MCP de Figma en el plan **Starter** tiene un límite de llamadas por periodo
(se agotó durante esta sesión). Para extracciones grandes conviene:

1. Pedir `get_metadata` de una página (barato) antes de `get_design_context`.
2. Usar `get_variable_defs` por nodo (barato) en vez de `get_design_context` (caro).
3. Si se agota, esperar al reinicio del periodo o subir de plan.

Además, el seat **View** no permite escribir fuera de borradores propios:
`code_layers_enabled: false` y `specs_enabled: false`.

---

## 7. Conclusión

El BLINK POS **ya está muy cerca** del lenguaje visual de Apple:

- ✅ Escala tipográfica casi idéntica (SF Pro Display ya está embebida en el proyecto)
- ✅ Sistema de 3 niveles de texto, ya existen `--fs-*` equivalentes
- ✅ Colores con los mismos roles (primario / éxito / error / advertencia)
- ✅ Radio de píldora (`--radius-pill: 50px`) ya implementado en badges
- ✅ Patrón de fila con nombre en negrita + metadatos + importe a la derecha

Los 4 ajustes de mayor impacto, en orden de retorno visual:

| # | Cambio | Dónde | Ganancia |
|---|---|---|---|
| 1 | Separar los 3 niveles de texto (0.72 / 0.46 en vez de 0.78 / 0.74) | `tokens.css` | Jerarquía visible de golpe |
| 2 | Alinear la paleta con los acentos de Apple | `tokens.css` | Coherencia total con el marco |
| 3 | Importes como píldora en la columna derecha | `app.css` | Patrón Apple exacto, mayor legibilidad del total |
| 4 | Reducir padding de celda a `0.5rem` (~29 px de fila) | `app.css` | +15% de filas por pantalla en inventario |
