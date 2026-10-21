# BLINK POS

Punto de venta web para el comercio venezolano. Vende, cobra en **dólares y
bolívares a tasa BCV**, controla inventario, caja, contactos y finanzas desde un
solo lugar — con la cámara del teléfono como escáner de códigos de barras.

**Estado:** v1.8.3 · en vivo en **<https://www.blink.com.ve>** ·
typecheck / build / **50 pruebas** en verde · Supabase (auth + datos) en producción.

- Landmarks del diseño: [`docs/INDEX.md`](docs/INDEX.md)
- Estado y hoja de ruta: [`docs/ESTADO_ACTUAL_PROYECTO.md`](docs/ESTADO_ACTUAL_PROYECTO.md)
- Historial completo: [`CHANGELOG.md`](CHANGELOG.md)

---

## Qué hace

| Módulo | Descripción |
|---|---|
| **POS (Vender)** | Buscador multicriterio, escáner por USB/cámara/celular, ticket en vivo, pago mixto USD + Bs, IGTF, descuentos y recargos |
| **Catálogo** | Catálogo global colaborativo por código de barras + inventario y precios propios de cada comercio |
| **Inventario** | Existencias, mínimos, ajustes, traslados y compras con control de costo promedio |
| **Finanzas** | Cuentas, movimientos, transferencias, gastos recurrentes, cuentas por cobrar y cierres de caja |
| **Contactos** | Clientes y proveedores con días de crédito |
| **Informes** | Ventas, márgenes y productos más vendidos, imprimibles |
| **Landing pública** | Portada comercial en la raíz del dominio, con instalación como PWA |
| **Multimoneda** | Moneda base inmutable (USD o EUR) + tasa oficial BCV automática |

## Stack

- **App:** Vite 8 · React 19 · TypeScript 5.9 · Tailwind CSS 4 (sin preflight) · Konsta UI 5 (MIT)
- **Datos:** Supabase (PostgreSQL) con RLS por comercio
- **Deploy:** GitHub Pages (`gh-pages`) + Cloudflare (DNS, proxy, SSL, purga de caché)
- **Iconos:** SF Symbols de Apple (ver nota de licencia abajo) · **Tipografía:** pila del sistema (SF Pro en dispositivos Apple, Segoe UI en Windows)

## Estructura

```
app/                 Aplicación (Vite + React + TS)
  src/components/    Shell, Icon, DataTable, Receipt, ui
  src/lib/           store, cloud (Supabase), money, fiscal, scanner, ios-tokens
  src/pages/         Landing, Vender, Catálogo, Inventario, Finanzas, …
  src/styles/        tokens · app · konsta · landing
  scripts/           generadores y verificadores
docs/                Documentación (índice en docs/INDEX.md)
  wink/              Referencia histórica de WINK POS (proyecto previo)
  HIG/               Human Interface Guidelines de Apple (85 páginas)
supabase/migrations/ Esquema normalizado con RLS por comercio
```

## Desarrollo

```bash
cd app
npm install
npm run dev              # http://localhost:5173
npm run dev -- --host 0.0.0.0   # para probar desde el móvil en la misma Wi-Fi
```

### Scripts disponibles

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (`dist/`) |
| `npm run build:pages` | Build para GitHub Pages (+ `404.html` y `.nojekyll`) |
| `npm run deploy` | Build + push a la rama `gh-pages` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run test:migrations` | Integración de migraciones (PostgreSQL embebido) |
| `npm run verify:ui` | Verifica las 15 vistas (render, iconos, overflow, consola) y deja capturas en `verify-shots/` |
| `npm run docs:check` | Verifica que no haya enlaces rotos en la documentación |
| `npm run tokens:ios` | Extrae los tokens del UI Kit de iOS 27 → `src/lib/ios-design-tokens.ts` |
| `npm run icons:sf` | Descarga y normaliza los SF Symbols → `src/lib/sf-symbols.ts` |
| `npm run icons` / `npm run og` | Generan los PNG del PWA y la imagen Open Graph |

## Verificación

```bash
cd app
npm run typecheck        # tsc --noEmit
npm test                 # 50 pruebas
npm run test:migrations  # migraciones contra PostgreSQL real
npm run build            # build de producción
npm run verify:ui        # regresión visual (requiere el dev server)
npm run docs:check       # enlaces de la documentación sin rotos
```

## Publicación

El sitio vive en **<https://www.blink.com.ve>** (Cloudflare → GitHub Pages).

```bash
cd app
npm run deploy
```

- `vite.config.ts` usa `base: "/"` porque el dominio propio sirve desde la raíz.
- `scripts/postbuild-pages.mjs` genera `404.html` (copia de `index.html`) y
  `.nojekyll` para que las rutas profundas de la SPA funcionen en Pages.
- El `basename` del router usa `import.meta.env.BASE_URL`.

Configuración de DNS y SSL en
[`docs/DNS_CLOUDFLARE_GITHUB_PAGES.md`](docs/DNS_CLOUDFLARE_GITHUB_PAGES.md).

## Notas importantes

- **Tipografía:** pila del sistema. `-apple-system` da San Francisco en Apple y
  Segoe UI en Windows. **No se distribuye ninguna fuente propietaria.**
- **Supabase:** el cliente solo usa la clave **pública** (publishable/anon). La
  secret key y `service_role` nunca llegan al navegador.
- **SF Symbols:** los iconos provienen de Apple y su licencia restringe su uso a
  software de plataformas Apple (iOS, iPadOS, macOS, tvOS, watchOS). Está
  documentado en [`docs/ICONOS_Y_PWA.md`](docs/ICONOS_Y_PWA.md), junto con las
  alternativas libres (Phosphor MIT, Lucide ISC, Tabler MIT).
- **Tokens de diseño:** en `docs/ios27/` están los valores extraídos del UI Kit
  oficial de iOS 27 (colores, tipografía, materiales, geometría). Son datos
  objetivos y reutilizables libremente.
- **Documentación:** `docs/INDEX.md` es el índice maestro. La documentación de
  **WINK** (el proyecto previo del que nació BLINK) está aislada en
  [`docs/wink/`](docs/wink/README.md) y marcada como referencia histórica.

## Licencia

Código, diseño y marca propios. Las referencias de terceros (UI Kit de Apple,
SF Symbols, HIG) se usan **solo como material de estudio** y están identificadas
en su documentación.
