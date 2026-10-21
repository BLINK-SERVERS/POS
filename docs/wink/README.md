# Referencia de WINK POS

> ⚠️ **Todo lo que hay en esta carpeta describe WINK POS, no BLINK POS.**

WINK (`app.wink-pos.com`) es el proyecto previo del que nació BLINK. Durante
su desarrollo se hizo un **reconocimiento pasivo y público** de WINK: se
estudió su sistema de diseño, su arquitectura, sus pantallas y su API, y ese
material se usó como **referencia funcional** para construir BLINK.

Esta carpeta conserva ese material. Se organiza aquí, y no mezclado con la
documentación de BLINK, para que nadie lo tome por error como una descripción
de la implementación actual.

---

## Qué hay aquí

| Archivo | Qué es |
|---|---|
| [`01-tech-stack.md`](./01-tech-stack.md) | Stack de WINK: Angular 22, custom elements `bento-*`, Tailwind v4 |
| [`02b-design-system-wink.md`](./02b-design-system-wink.md) | Design system de WINK: 252 tokens, Montserrat, azul `#3347DD` |
| [`03-rutas-arquitectura.md`](./03-rutas-arquitectura.md) | Mapa de rutas y flujo de arranque observado |
| [`04-pantalla-login.md`](./04-pantalla-login.md) | La pantalla pública de login de WINK, observada |
| [`05-inventario-assets.md`](./05-inventario-assets.md) | Los 107 recursos públicos que servía WINK |
| [`06-reproduccion.md`](./06-reproduccion.md) | Cómo se regeneró el material del reconocimiento |
| [`07-limites-alcance.md`](./07-limites-alcance.md) | Alcance y límites del trabajo de reconocimiento |
| [`08-sesion-autenticada.md`](./08-sesion-autenticada.md) | Flujo de sesión autenticada de WINK |
| [`10-api-endpoints.md`](./10-api-endpoints.md) | Los endpoints observados en `api.wink-pos.com` |
| [`14-estructura-general.md`](./14-estructura-general.md) | Síntesis de la arquitectura de WINK |
| [`16-wink-inventario-funcional.md`](./16-wink-inventario-funcional.md) | Inventario funcional de WINK (para el comparativo) |
| [`17-wink-vs-blink-gap.md`](./17-wink-vs-blink-gap.md) | **El más útil:** qué hace WINK y qué le falta a BLINK |
| [`estructura-dom.md`](./estructura-dom.md) | Volcado del DOM de WINK |
| [`estructura-layout.md`](./estructura-layout.md) | Regiones de layout y sistema de utilidades de WINK |
| [`tokens.css`](./tokens.css) · [`tokens.json`](./tokens.json) | Los 252 tokens de WINK, en CSS y en JSON |
| [`styleguide.html`](./styleguide.html) | Guía de estilo de WINK, navegable |
| [`computed-styles.json`](./computed-styles.json) | Estilos calculados extraídos del sitio de WINK |
| [`apple-macOS-26/`](./apple-macOS-26) | Extractos del kit de macOS 26 de Apple |

---

## Por qué se conserva

1. **El comparativo funcional.** [`17-wink-vs-blink-gap.md`](./17-wink-vs-blink-gap.md)
   es la base de las especificaciones de BLINK: enumera qué hace WINK bien y qué
   le faltaba.
2. **El diseño.** El contraste entre el design system de WINK (Angular +
   `bento-*` + Montserrat) y el de BLINK (React + Konsta + SF Pro del sistema)
   explica muchas decisiones del rediseño.
3. **La trazabilidad.** Documenta de dónde salió cada idea, en vez de dejar
   decisiones huérfanas en el código.

## Lo que **no** es

- No es documentación de la API de BLINK. La API de BLINK es Supabase
  (PostgreSQL + RLS): ver [`../20-supabase-auth-y-datos.md`](../20-supabase-auth-y-datos.md).
- No describe el comportamiento actual de ninguna pantalla de BLINK.
- Los volcados crudos (`tokens.*`, `computed-styles.json`, `estructura-dom.md`)
  son material de análisis, no especificaciones.

---

## Documentación de BLINK

Vuelve al [índice general](../INDEX.md).
