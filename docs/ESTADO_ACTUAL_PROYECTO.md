# Estado Actual BLINK POS

**Fecha:** 2026-10-20 · **Versión:** 1.4.0 · **Dominio:** www.blink.com.ve

## Estado General

| Comprobación | Resultado |
|---|---|
| TypeScript (`npx tsc --noEmit`) | Sin errores |
| Tests (`npx vitest run`) | 50/50 en 5 archivos |
| Build (`npm run build:pages`) | Exitoso |
| Deploy (`npm run deploy`) | Publicado en gh-pages |
| Dominio `www.blink.com.ve` | 200 OK, 0 errores de consola |
| Dominio `blink.com.ve` | 301 → www (path y query preservados) |
| Landing `/` | Renderiza sin sesión, 0 errores de consola |

## Módulos

### Core
- [x] React 19 + Vite 8 + TypeScript
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

### UI/UX
- [x] Paleta oficial Blink (7 tokens)
- [x] Modelo híbrido: tabla compacta (PC) / tarjetas (móvil < 768px)
- [x] Header con logo enlazado a `/vender`, sin redes sociales
- [x] Dominio propio: `base: "/"`, `app/public/CNAME`

### Landing comercial (v1.4.0)
- [x] Portada pública en `/` (header, hero, beneficios, ecosistema, precios, footer)
- [x] App reorganizada bajo `/app/*`; `/escaner` se mantiene en la raíz (deep link QR)
- [x] Páginas legales con el texto real de Blink (`/app/terminos`, `/app/privacidad`)
- [x] SEO: `title`, `description`, Open Graph y Twitter Card en `index.html`
- [x] Iconos de marca reales: favicon (claro/oscuro/.ico) + 5 iconos PWA (any + maskable)
- [ ] Imagen de preview Open Graph 1200×630 (`og:image`) — pendiente

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

## Comandos

```bash
cd app
npm run dev          # Desarrollo en :5173
npm run typecheck    # Verificar tipos
npx vitest run       # Tests
npm run build:pages  # Build estático
npm run deploy       # Publicar en gh-pages
```
