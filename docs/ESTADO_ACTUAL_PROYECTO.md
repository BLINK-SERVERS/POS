# Estado Actual BLINK POS

**Fecha:** 2026-10-21 · **Versión:** 1.10.0 · **Dominio:** www.blink.com.ve

## Estado General

| Comprobación | Resultado |
|---|---|
| TypeScript (`npx tsc --noEmit`) | Sin errores |
| Tests (`npx vitest run`) | 50/50 en 5 archivos |
| Migraciones (`npm run test:migrations`) | Todas las comprobaciones pasan |
| Build (`npm run build:pages`) | Exitoso |
| Deploy (`npm run deploy`) | Publicado en gh-pages |
| Verificación de UI (`npm run verify:ui`) | 38 comprobaciones (escritorio + móvil + diálogos), 0 errores de consola, 0 iconos vacíos, 0 desbordes |
| Documentación (`npm run docs:check`) | 318 Markdown, 2.676 enlaces relativos, 0 rotos |
| Stress test (`npm run qa:e2e`) | 93 botones en 10 vistas · 0 fallos · 0 diálogos atascados |
| Funcional (`npm run qa:funcional`) | 8/8 (ticket, IVA, venta, compra, abono, arqueo) |
| Responsive (`npm run qa:responsive`) | 36 combinaciones resolución×vista · 0 fallos · SF Pro en uso |
| Dominio `www.blink.com.ve` | 200 OK, 0 errores de consola |
| Dominio `blink.com.ve` | 301 → www (path y query preservados) |
| Landing `/` | Renderiza sin sesión, 0 errores de consola |

## Módulos

### Core
- [x] React 19 + Vite 8 + TypeScript 5.9
- [x] Store global con `useSyncExternalStore`
- [x] Persistencia localStorage con manejo de cuota
- [x] Migración de esquema de productos (`migrate.ts`, testeada)
- [x] RBAC: tipos + helpers (`permissions.ts`)
- [x] Auditoría: helper de logs (`audit.ts`)

### Autenticación
- [x] Login / registro con verificación
- [x] Onboarding guiado (wizard)
- [x] Moneda base USD/EUR inmutable tras guardar
- [x] Verificación de dispositivo
- [x] Versión declarada en un solo sitio (`app/package.json`) y **no mostrada en la UI** (BUG-12)

### POS / Ventas
- [x] Sin grilla de productos (búsqueda multicriterio + ticket en vivo)
- [x] Búsqueda por nombre, barcode, SKU, medida, unidad y marca
- [x] Ticket con presentación siempre visible
- [x] Totales en moneda base + Bolívares
- [x] Escaneo (USB, cámara, celular remoto)
- [x] Pagos múltiples, cotizaciones, créditos, cuentas abiertas

### Catálogo e Inventario
- [x] Catálogo global colaborativo (`catalogo_global`, migración 0004)
- [x] Control de stock, mínimos, ajustes, transferencias, compras
- [x] Formateador de nombres con deduplicación (`productDisplay.ts`)

### Finanzas
- [x] Cuentas, movimientos, transferencias
- [x] Gastos, pendientes, abonos
- [x] Cierres de caja
- [x] Informes imprimibles (PDF)

### UI/UX — sistema de diseño iOS 27 (v1.6.0 → v1.9.0)
- [x] Paleta oficial Blink: `#FFFEFB` fondo, `#007AFF` acento, `#424242` secundario, `#1D1D1F` primario
- [x] Konsta UI 5 (MIT) como capa de componentes iOS
- [x] Tailwind v4 con preflight activado, sin alterar el diseño de BLINK
- [x] Control segmentado de iOS (`<Segmented>`) en Inventario, Finanzas, Catálogo, Contactos, Ajustes, Informes
- [x] Tab bar flotante con Liquid Glass en móvil (`<Glass>`)
- [x] Listas *inset grouped* de iOS (contenedor sin borde, hairline inset, etiqueta/valor)
- [x] Liquid Glass **solo** en la landing y en la tab bar (cromo); el POS es 100 % opaco
- [x] Tokens oficiales del UI Kit de iOS 27 (107 colores, 105 estilos de texto, 42 materiales)
- [x] Geometría real de 1.657 componentes del kit (`docs/ios27-geometry.json`)
- [x] Métricas aplicadas: fila 52 px, campo 52 px, toggle 64×28, stepper 46×32, tab 48×48, fila de sidebar 44 px
- [x] **100 SF Symbols** normalizados a `currentColor`
- [x] **SF Pro en todos los dispositivos** (`local()`, sin distribuir ficheros) con tamaño óptico variable
- [x] **Botones con material Liquid Glass** (blur 6 px del kit + brillo especular) y medidas reales 50/34/28 px
- [x] **Diálogos nativos**: hoja inferior en móvil, panel centrado en escritorio, alertas con `<Dialog>` de Konsta
- [x] **Confirmaciones nativas**: `useConfirm()`; ningún `window.confirm` en la app
- [x] **44 listas agrupadas** de formulario (HIG · Lists)
- [x] **Shell flotante de iPadOS 27** (v1.9.0): sidebar y contenido como paneles redondeados; la barra de navegación vive dentro del panel de contenido
- [x] **Large Title** (34 px) en todas las pantallas
- [x] Superficies sin marco: la jerarquía se construye con elevación
- [x] Campos *filled*, botones de radio 12 px con la familia real de iOS
- [x] Acciones de fila en texto plano; datos que no se parten
- [x] KPIs como grupo con celdas separadas por hairline
- [x] Estados vacíos con icono en círculo tintado (los 20 de la app)
- [x] Verificación visual automatizada en **escritorio y móvil** (`npm run verify:ui`)

Detalle en [`REDISENO_KONSTA_HIG.md`](./REDISENO_KONSTA_HIG.md),
[`DESIGN_IOS27_KIT.md`](./DESIGN_IOS27_KIT.md),
[`IOS27_METRICAS_COMPONENTES.md`](./IOS27_METRICAS_COMPONENTES.md) y
[`02-design-system.md`](./02-design-system.md).

### Landing comercial (v1.4.0)
- [x] Portada pública en `/` (header, hero, beneficios, ecosistema, precios, footer)
- [x] App reorganizada bajo `/app/*`; `/escaner` se mantiene en la raíz (deep link QR)
- [x] Páginas legales con el texto real de Blink (`/app/terminos`, `/app/privacidad`)
- [x] SEO: `title`, `description`, Open Graph y Twitter Card en `index.html`
- [x] Iconos de marca reales: favicon (claro/oscuro/.ico) + 5 iconos PWA (any + maskable)
- [x] Imagen Open Graph 1200×630 (`og-image.png`) con favicon + marca BLINK POS

Detalle en [`LANDING_PAGE.md`](./LANDING_PAGE.md) e [`ICONOS_Y_PWA.md`](./ICONOS_Y_PWA.md).

## Infraestructura

| Componente | Configuración |
|---|---|
| Cloudflare | Zona `2234ba7bcd3fe793c8d5f6e04198a19a` (activa) |
| DNS | 2 CNAME proxiados → `blink-servers.github.io` |
| Redirect | Ruleset `62d0778365be4e699f9833ca23ce29c7` (apex → www, 301) |
| GitHub Pages | Dominio `www.blink.com.ve`, `Enforce HTTPS` |
| MCP | `cloudflare` + `cloudflare-docs` conectados (global) |

Detalle completo en [`DNS_CLOUDFLARE_GITHUB_PAGES.md`](./DNS_CLOUDFLARE_GITHUB_PAGES.md).

## Pendientes

### Desarrollo
- [ ] Sidebar flotante con Liquid Glass en tablet (iPadOS 27)
- [ ] Buscador como pestaña de búsqueda dedicada (Search tab)
- [ ] Aplicar permisos RBAC en la UI (ocultar costos/márgenes por rol)
- [ ] Enganchar `addAuditLog` en acciones críticas (caja, anulaciones, stock)
- [ ] Migrar comercios existentes a `baseCurrencyLocked`
- [ ] Integrar `formatProductDisplayName` en ticket impreso y catálogo

### Infraestructura
- [x] Propagación DNS
- [x] Registros CNAME
- [x] Redirección apex → www
- [x] Dominio personalizado en GitHub Pages
- [ ] Verificar `Enforce HTTPS` en el panel de GitHub (opcional: Cloudflare ya fuerza HTTPS)
- [ ] Renovar el token de la API de Cloudflare (expiró; `refresh` devuelve `invalid_scope`)

### Legales / licencias
- [ ] Decidir el set de iconos definitivo: SF Symbols es material de Apple con uso
      restringido a plataformas Apple. Alternativas libres documentadas en
      [`ICONOS_Y_PWA.md`](./ICONOS_Y_PWA.md) (Phosphor MIT, Lucide ISC, Tabler MIT).

## Comandos

```bash
cd app
npm run dev            # Desarrollo en :5173
npm run typecheck      # Verificar tipos
npx vitest run         # Tests
npm run test:migrations # Migraciones contra PostgreSQL real
npm run build:pages    # Build estático
npm run deploy         # Publicar en gh-pages
npm run verify:ui      # Regresión visual: escritorio + móvil
npm run docs:check     # Enlaces de la documentación
npm run qa:seed         # Siembra del comercio de pruebas en Supabase
npm run qa:e2e           # Stress test de todos los botones
npm run qa:funcional     # Pruebas de negocio (ticket, venta, compra, abono)
npm run qa:responsive    # Matriz de resoluciones y tipografía
npm run qa              # Bateria completa de QA
npm run tokens:ios     # Regenerar tokens del UI Kit de iOS 27
npm run icons:sf       # Regenerar el set de SF Symbols
```
