# Índice de documentación · BLINK POS

**Actualizado:** 2026-10-21 · **Versión del proyecto:** 1.8.3

Toda la documentación vive en `docs/`. Este índice dice qué hay en cada sitio y
cuál es el vigente.

---

## 1. Punto de partida

| Documento | Para qué |
|---|---|
| [`../README.md`](../README.md) | Puerta de entrada: qué hace, cómo se ejecuta, cómo se despliega |
| [`ESTADO_ACTUAL_PROYECTO.md`](./ESTADO_ACTUAL_PROYECTO.md) | Dónde estamos hoy, qué falta, qué se está haciendo |
| [`../CHANGELOG.md`](../CHANGELOG.md) | Historial de versiones con los cambios de cada una |
| [`18-estado-y-plan-de-desarrollo.md`](./18-estado-y-plan-de-desarrollo.md) | Hoja de ruta y backlog histórico (largo; en parte superado por ESTADO_ACTUAL) |

---

## 2. Diseño y sistema visual

| Documento | Contenido |
|---|---|
| [`02-design-system.md`](./02-design-system.md) | **El design system de BLINK**: tokens, tipografía, color, métricas de componentes, listas y Liquid Glass |
| [`REDISENO_KONSTA_HIG.md`](./REDISENO_KONSTA_HIG.md) | Rediseño con Konsta UI + HIG: reglas del HIG aplicadas una a una |
| [`DESIGN_IOS27_KIT.md`](./DESIGN_IOS27_KIT.md) | Tokens oficiales extraídos del UI Kit de iOS 27 (colores, tipografía, materiales) |
| [`IOS27_METRICAS_COMPONENTES.md`](./IOS27_METRICAS_COMPONENTES.md) | **Medidas reales** de cada componente de iOS 27 y comparación con BLINK |
| [`DESIGN_APPLE_HIG_REFERENCE.md`](./DESIGN_APPLE_HIG_REFERENCE.md) | Tokens de macOS 26 y patrón de lista/tabla de Apple |
| [`DESIGN_IOS27.md`](./DESIGN_IOS27.md) | Resumen de la primera extracción (v1.5.0), desde el `.dmg` y el kit de Figma |
| [`ios27-geometry.json`](./ios27-geometry.json) | Datos crudos: 1.657 símbolos con tamaño, estilos y textos |
| [`ios27/`](./ios27) | Colores del sistema, catálogo de símbolos y licencia de Apple |
| [`HIG/`](./HIG) | **85 páginas del Human Interface Guidelines** de Apple (Markdown oficial) |

---

## 3. Producto y pantallas

| Documento | Contenido |
|---|---|
| [`04-pantalla-login.md`](./wink/04-pantalla-login.md) | *En `wink/`* — la pantalla de login **de WINK**, observada. La de BLINK está en [`20-supabase-auth-y-datos.md`](./20-supabase-auth-y-datos.md) |
| [`08-sesion-autenticada.md`](./wink/08-sesion-autenticada.md) | *En `wink/`* — flujo de sesión de WINK |
| [`09-pantallas-internas.md`](./09-pantallas-internas.md) | Módulos internos de la app de BLINK |
| [`11-modelo-datos-negocio.md`](./11-modelo-datos-negocio.md) | Modelo de datos de negocio |
| [`LANDING_PAGE.md`](./LANDING_PAGE.md) | Landing pública en `/` y rutas bajo `/app` |
| [`RBAC_AUDIT_IMPLEMENTADO.md`](./RBAC_AUDIT_IMPLEMENTADO.md) | Roles, permisos y auditoría: qué está implementado y qué falta |
| [`21-escaner.md`](./21-escaner.md) | Escáner móvil, emparejamiento por QR y flujo de cobro |

---

## 4. Arquitectura y datos

| Documento | Contenido |
|---|---|
| [`01-tech-stack.md`](./01-tech-stack.md) | Stack tecnológico de BLINK y decisiones asociadas |
| [`03-rutas-arquitectura.md`](./03-rutas-arquitectura.md) | Rutas, guardas de acceso y flujo de navegación |
| [`14-estructura-general.md`](./14-estructura-general.md) | Árbol del proyecto, módulo por módulo |
| [`20-supabase-auth-y-datos.md`](./20-supabase-auth-y-datos.md) | Supabase: auth, esquema, RLS y migraciones |
| [`15-rendimiento-escalabilidad.md`](./15-rendimiento-escalabilidad.md) | Rendimiento, caché y escalabilidad |
| [`FIGMA_MCP.md`](./FIGMA_MCP.md) | Cómo se conectó el MCP de Figma (OAuth, puente propio) |

---

## 5. Infraestructura

| Documento | Contenido |
|---|---|
| [`19-despliegue-gh-pages.md`](./19-despliegue-gh-pages.md) | Despliegue en GitHub Pages |
| [`DNS_CLOUDFLARE_GITHUB_PAGES.md`](./DNS_CLOUDFLARE_GITHUB_PAGES.md) | DNS, proxy, SSL, reglas de redirección y purga de caché |
| [`ICONOS_Y_PWA.md`](./ICONOS_Y_PWA.md) | Favicon, iconos del PWA, set de SF Symbols y **nota de licencia** |

---

## 6. Calidad

| Documento | Contenido |
|---|---|
| [`22-qa-caza-de-bugs.md`](./22-qa-caza-de-bugs.md) | Proceso de QA y bugs detectados |
| [`18-auditoria-codigo.md`](./18-auditoria-codigo.md) | Auditoría de código |
| [`23-plan-nuevas-especificaciones.md`](./23-plan-nuevas-especificaciones.md) | Plan de las nuevas especificaciones (moneda base, RBAC, catálogo) |
| [`24-bitacora-qa.md`](./24-bitacora-qa.md) | **Bitácora de QA**: entorno de pruebas, siembra, auditorías y bugs resueltos |

---

## 7. Referencia histórica · WINK POS

Todo lo de esta carpeta describe **WINK**, el proyecto previo del que nació
BLINK. Se conserva como material de estudio, **no** describe la
implementación actual.

| Documento | Contenido |
|---|---|
| [`wink/README.md`](./wink/README.md) | **Índice de la carpeta y por qué existe** |
| [`wink/17-wink-vs-blink-gap.md`](./wink/17-wink-vs-blink-gap.md) | El comparativo funcional: qué hace WINK y qué le faltaba a BLINK |
| [`wink/16-wink-inventario-funcional.md`](./wink/16-wink-inventario-funcional.md) | Inventario funcional de WINK |
| [`wink/01-tech-stack.md`](./wink/01-tech-stack.md) · [`wink/02b-design-system-wink.md`](./wink/02b-design-system-wink.md) | Stack y design system de WINK (Angular, `bento-*`, 252 tokens) |
| [`wink/03-rutas-arquitectura.md`](./wink/03-rutas-arquitectura.md) · [`wink/04-pantalla-login.md`](./wink/04-pantalla-login.md) · [`wink/08-sesion-autenticada.md`](./wink/08-sesion-autenticada.md) | Pantallas y navegación de WINK |
| [`wink/05-inventario-assets.md`](./wink/05-inventario-assets.md) · [`wink/06-reproduccion.md`](./wink/06-reproduccion.md) · [`wink/07-limites-alcance.md`](./wink/07-limites-alcance.md) | Alcance del reconocimiento y cómo se hizo |
| [`wink/10-api-endpoints.md`](./wink/10-api-endpoints.md) · [`wink/14-estructura-general.md`](./wink/14-estructura-general.md) | API y arquitectura de WINK |
| [`wink/tokens.css`](./wink/tokens.css) · [`wink/tokens.json`](./wink/tokens.json) · [`wink/styleguide.html`](./wink/styleguide.html) · [`wink/computed-styles.json`](./wink/computed-styles.json) · [`wink/estructura-dom.md`](./wink/estructura-dom.md) · [`wink/estructura-layout.md`](./wink/estructura-layout.md) | Volcados crudos del análisis de WINK |
| [`wink/apple-macOS-26/`](./wink/apple-macOS-26) | Extractos del kit de macOS 26 de Apple |

---

## 8. Scripts de la app

| Script | Qué hace |
|---|---|
| `app/scripts/build-ios-tokens.mjs` | Extrae los tokens del UI Kit de iOS 27 → `src/lib/ios-design-tokens.ts` |
| `app/scripts/build-sf-symbols.mjs` | Descarga y normaliza los SF Symbols → `src/lib/sf-symbols.ts` |
| `app/scripts/build-icons.mjs` | Genera los PNG del PWA (192/512, maskable, apple-touch) |
| `app/scripts/build-og-image.mjs` | Genera la imagen Open Graph 1200×630 |
| `app/scripts/verify-ui.mjs` | Verificación visual en escritorio y móvil (regresión) |
| `app/scripts/check-docs.mjs` | Verificación de enlaces de la documentación (`npm run docs:check`) |
| `app/scripts/qa-seed.mjs` | Siembra del comercio de pruebas en Supabase (`npm run qa:seed`) |
| `app/scripts/qa-e2e.mjs` | Stress test: pulsa todos los botones y comprueba diálogos, foco y doble ejecución (`npm run qa:e2e`) |
| `app/scripts/qa-funcional.mjs` | Pruebas de negocio: ticket, IVA, venta, compra, abono y arqueo (`npm run qa:funcional`) |
| `app/scripts/qa-responsive.mjs` | Matriz de 6 resoluciones y comprobación de que SF Pro no cae a la fuente genérica (`npm run qa:responsive`)
| `app/scripts/qa-apariencia.mjs` | Cambio manual de tema, persistencia y vuelta a "Automático" (`npm run qa:apariencia`)
| `app/scripts/qa-carga.mjs` | Medición de la carga real: peticiones, bytes, FCP y LCP (`npm run qa:carga`) |
| `app/scripts/postbuild-pages.mjs` | `404.html` + `.nojekyll` para GitHub Pages |
| `app/scripts/test-migrations.mjs` | Migraciones contra PostgreSQL embebido |

---

## 9. Convenciones

- La documentación va en español.
- Los datos extraídos de kits de Apple (tokens, medidas) son **datos objetivos**
  y reutilizables; los assets con licencia restringida (SF Symbols) están
  identificados como tales en [`ICONOS_Y_PWA.md`](./ICONOS_Y_PWA.md).
- Cada cambio de versión se registra en [`../CHANGELOG.md`](../CHANGELOG.md) y
  su detalle técnico en el documento temático correspondiente.
- Los documentos describen **el estado real**, no el esperado. Si una
  funcionalidad está a medias, se dice explícitamente (ver
  [`RBAC_AUDIT_IMPLEMENTADO.md`](./RBAC_AUDIT_IMPLEMENTADO.md)).
- `npm run docs:check` comprueba que ningún enlace relativo esté roto.
