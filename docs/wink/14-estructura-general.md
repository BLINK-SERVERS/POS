# 14 · Arquitectura y estructura general (síntesis)

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

Consolida el análisis de `captures/*.html` + `recon/`. Es una **descripción estructural**
(qué componentes, cómo se organizan, qué sistema de estilos usan), no una copia del código.

## 14.1 Arquitectura front-end

- **Framework:** Angular 22.1.4 (standalone components), PWA con Angular Service Worker.
- **Librería de UI propia:** prefijo **`bento-*`** (design system interno de Wink).
- **Estilos:** **Tailwind CSS v4** con **design tokens** (tema por CSS variables y `data-theme`).
- **Motor de plantillas/DOM:** `data-beasties-container` (critical-CSS inliner "Beasties") +
  animaciones `data-morph`.
- **Backend:** `https://api.wink-pos.com` (REST), sesión por cookie + `/auth/refresh`.

## 14.2 Shell de la app (3 zonas)

`<bento-root>` → `<bento-shell>` contiene siempre:

1. **Topbar** (`<header>`): selector de comercio, **rate-chip** (`bento-rate-calculator` +
   `bento-rate-chip`, tasa BCV), botón **Abrir caja** (`bento-cash-register-card`), perfil
   (`bento-my-profile`).
2. **Sidebar** (`<aside>` + `<nav>`: `bento-sidebar-nav`): grupo "Principal" con
   Inicio / Ventas (Vender, Historial) / Catálogo / Inventario / Contactos / Finanzas /
   Informes / Ajustes + Cerrar sesión. Colapsable.
3. **Contenido** (`<main>`): la página de la ruta (p. ej. `bento-home`, `bento-pos-page`).

Fuera del flujo, siempre montados: `bento-toasts` (avisos) y `bento-confirm-host` (diálogos de confirmación).
Además: `bento-cash-register-panel` (panel de caja), `bento-my-profile` (perfil), `bento-dialog` + `bento-scroll`.

```
bento-root
└─ bento-shell
   ├─ header  (topbar: logo · rate-chip · Abrir caja · perfil)
   ├─ aside > nav (bento-sidebar-nav)
   ├─ main    (página de ruta: bento-home | bento-pos-page | …)
   ├─ bento-cash-register-panel (overlay)
   ├─ bento-my-profile (overlay)
   ├─ bento-toasts
   └─ bento-confirm-host
```

## 14.3 Taxonomía de componentes `bento-*`

**Shell / navegación:** `root`, `shell`, `logo`, `sidebar-nav`, `module-navigation`,
`page-header`, `segregated-control`, `pill-tabs`, `cash-register-card`, `cash-register-panel`,
`my-profile`, `rate-chip`, `rate-calculator`, `wink-tienda-promo`.

**Páginas (feature):** `home`, `home-kpis`, `home-inbox`, `pos-page`, `pos-catalog`,
`pos-ticket-panel`, `pos-ticket-empty`, `pos-mode-toggle`, `pos-quote-dialog`,
`pos-product-sheet`, `sales-page`, `sales-layout`, `catalog-shell`, `products-page`,
`product-form`, `category-form`, `inventory-shell`, `stock-page`, `adjust-stock-form`,
`outflow-form`, `return-form`, `contacts-page`, `contact-detail`, `contact-form`,
`member-settle-form`, `finance-shell`, `accounts-page`, `account-exposure-card`,
`account-form`, `account-transfer-form`, `account-balance-move-form`, `reports-shell`,
`results-page`, `sales-report-page`, `settings-shell`, `business-page`, `settings-save-bar`.

**Primitivas de UI:** `card`, `table`, `field`, `field-shell`, `text-input`, `select`,
`multiselect`, `switch`, `checkbox`, `radio-group`, `money`, `money-input`, `animated-number`,
`input-unit`, `date-input`, `date-range-filter`, `query-bar`, `query-suggestions`, `tooltip`,
`dialog`, `scroll`, `toasts`, `badge`, `alert`, `empty-state`, `pagination`, `stepper`,
`line-chart`, `bar-chart`, `report-metric`, `report-disclosure`, `import-actions`,
`submit-bar`, `column-toggle`, `segmented-control`, `icon`, `form-error`.

> **Patrón de composición:** *shell* → *page* → *forms/sheets*, apoyado en primitivas atómicas
> (`field-shell`, `icon`, `money`, `dialog`). Los formularios usan prefijo `-form`
> (`product-form`, `contact-form`, `account-form`…) y los paneles/diálogos `-panel`/`-dialog`.

## 14.4 Sistema de estilos

- **Tailwind v4** con tokens semánticos en clases: `bg-surface-default`, `bg-surface-subtle`,
  `text-text-primary/secondary/tertiary`, `border-border-subtle`, `outline-border-focus`.
- **Variantes propias:** `phone:` (962 usos), `pointer-coarse:`, `pointer-fine:`,
  `motion-safe:`, `motion-reduce:`. Breakpoints estándar `sm/md/lg` + arbitrarios
  `max-[1366px]:`, `max-[899px]:`, `max-md:`.
- **Tema:** `data-theme` (claro por defecto); 252 design tokens documentados en `docs/tokens.css`.
- **A11y cuidada:** `aria-hidden`, `aria-label`, `aria-expanded`, `aria-pressed`, `aria-live`,
  `role`, `focus-visible:` en casi todos los controles.
- **Micro-interacciones:** `transition-colors`, `group-hover:`, `data-morph`, `bento-animated-number`
  (números que se animan; hay 145 en total).

## 14.5 Layout y responsive

- Regiones semánticas: `header`, `main`, `nav`, `aside`, `section` (×8), `footer`, `dialog`.
- Estrategia **mobile/phone-first** (variante `phone:` y `pointer-coarse:` para táctil).
- Rejillas basadas en flex/gap (`flex` 1719, `gap` 1439) más que en `grid` explícito.
- Densidad compacta (controles ~h-9/36px; `tabular-nums` para cifras; `whitespace-nowrap` en tablas).
- Anchos de referencia (tokens): `--sidebar-width:13rem`, `--pos-ticket-w:27.5rem`,
  `--topbar-height:3.85rem`.

## 14.6 Routing y guardas

- Rutas públicas: `/entrar`, `/crear-comercio`, `/recuperar-contrasena`.
- Guard redirige a `/entrar?volver=<ruta>` si no hay sesión.
- Área privada: `/inicio`, `/ventas` (+`/historial`), `/catalogo`, `/inventario` (+`/existencias`),
  `/contactos`, `/finanzas`, `/informes` (+`/resultados`, `/ventas`), `/ajustes`.
- Muchas sub-pestañas son **estado interno** (no cambian la URL) → el contenido está en el DOM
  de la página padre.

## 14.7 Flujo de datos

- Arranque: `POST /auth/refresh` → `GET /auth/me` → `GET /business` → datos del shell.
- Cada `bento-page` consulta su recurso (`/products`, `/sales`, `/accounts`, `/reports/*`…).
- Números/importes renderizados por `bento-money` + `bento-animated-number` (dual USD/VES).
- Sin tokens en `localStorage`; sesión en cookies de `.wink-pos.com` / `api.wink-pos.com`.

---

### Activos fuente del análisis
| Archivo | Contenido |
|---|---|
| `docs/estructura-dom.md` | Árbol de componentes `bento-*` por pantalla |
| `docs/estructura-layout.md` | Regiones y sistema de utilidades |
| `docs/09-pantallas-internas.md` | Catálogo funcional de pantallas |
| `docs/10-api-endpoints.md` | Endpoints observados |
| `docs/11-modelo-datos-negocio.md` | Modelo de datos y reglas |
| `captures/*.html/.txt/.png` | Evidencia cruda por pantalla |
