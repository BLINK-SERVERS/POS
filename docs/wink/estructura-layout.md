# 13 · Regiones de layout y sistema de estilos

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

Análisis de la estructura de **layout** (zonas) y del **sistema de utilidades** (Tailwind v4)
usado por la app. Generado por `scripts/analyze-layout.mjs`.

## 13.1 Etiquetas semánticas en `/inicio`

| Etiqueta | Usos |
|---|---|
| `<section>` | 8 |
| `<header>` | 4 |
| `<footer>` | 4 |
| `<dialog>` | 3 |
| `<form>` | 2 |
| `<main>` | 1 |
| `<nav>` | 1 |
| `<aside>` | 1 |

## 13.2 Atributos de rol/aria/data (top)

| Atributo | Usos |
|---|---|
| `aria-hidden` | 82 |
| `aria-label` | 28 |
| `role` | 6 |
| `aria-atomic` | 6 |
| `aria-live` | 6 |
| `aria-expanded` | 5 |
| `aria-labelledby` | 5 |
| `aria-haspopup` | 4 |
| `aria-describedby` | 4 |
| `aria-pressed` | 3 |
| `aria-controls` | 2 |
| `data-morph` | 2 |
| `aria-checked` | 2 |
| `data-beasties-container` | 1 |
| `data-theme` | 1 |
| `data-testid` | 1 |
| `data-state` | 1 |
| `aria-current` | 1 |
| `aria-valuemin` | 1 |
| `aria-valuemax` | 1 |

## 13.3 Variantes responsive/estado más usadas (todas las pantallas)

| Variante | Usos |
|---|---|
| `focus-visible:` | 1846 |
| `disabled:` | 1094 |
| `phone:` | 962 |
| `hover:` | 853 |
| `pointer-coarse:` | 642 |
| `max-md:` | 406 |
| `active:` | 316 |
| `md:` | 304 |
| `max-lg:` | 180 |
| `placeholder:` | 173 |
| `motion-safe:` | 139 |
| `sm:` | 123 |
| `before:` | 117 |
| `first:` | 109 |
| `last:` | 109 |
| `[--dialog-from:` | 94 |
| `max-sm:` | 85 |
| `group-hover:` | 85 |
| `empty:` | 75 |
| `max-[1366px]:` | 60 |
| `*:` | 51 |
| `open:` | 47 |
| `backdrop:` | 47 |
| `[&amp;&gt;*&gt;*]:` | 47 |
| `motion-reduce:` | 40 |
| `pointer-fine:` | 40 |
| `focus-within:` | 36 |
| `group-last:` | 29 |
| `[&amp;:` | 26 |
| `max-[899px]:` | 24 |

## 13.4 Utilidades base más usadas (todas las pantallas)

| Utilidad | Usos |
|---|---|
| `flex` | 1719 |
| `gap` | 1439 |
| `items-center` | 1432 |
| `text-sm` | 1127 |
| `px` | 1085 |
| `block` | 928 |
| `h` | 894 |
| `font-medium` | 814 |
| `text-text-secondary` | 793 |
| `transition-colors` | 791 |
| `text-text-primary` | 776 |
| `min-w` | 746 |
| `shrink` | 724 |
| `inline-flex` | 713 |
| `border` | 712 |
| `py` | 683 |
| `w-full` | 657 |
| `cursor-pointer` | 636 |
| `outline` | 629 |
| `outline-border-focus` | 629 |
| `outline-offset` | 545 |
| `p` | 537 |
| `mt` | 524 |
| `rounded-md` | 510 |
| `justify-center` | 508 |
| `size` | 498 |
| `text-xs` | 495 |
| `bg-surface-default` | 482 |
| `min-h` | 471 |
| `whitespace-nowrap` | 450 |
| `leading` | 449 |
| `relative` | 405 |
| `tabular-nums` | 384 |
| `bg-surface-subtle` | 382 |
| `opacity` | 376 |
| `text-text-tertiary` | 369 |
| `cursor-not-allowed` | 351 |
| `pointer-events-none` | 347 |
| `flex-col` | 301 |
| `font-semibold` | 297 |
