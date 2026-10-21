# 14 · Estructura general del proyecto · BLINK POS

**Fecha:** 2026-10-21 · **Versión:** 1.8.3

> La estructura de **WINK** está en
> [`wink/14-estructura-general.md`](./wink/14-estructura-general.md), como
> referencia histórica.

---

## 1. Árbol del repositorio

```
BLINK POS/
├── app/                     Aplicación (Vite + React + TypeScript)
│   ├── public/              Se sirve tal cual en el build
│   │   ├── favicon.svg      Icono claro
│   │   ├── favicon-dark.svg Variante para tema oscuro del SO
│   │   ├── favicon.ico      Fallback para navegadores antiguos
│   │   ├── icons/           Iconos del PWA (SVG + PNG any/maskable)
│   │   ├── manifest.json    Manifiesto de la PWA
│   │   ├── og-image.png     Imagen Open Graph 1200×630
│   │   └── CNAME            www.blink.com.ve
│   ├── scripts/             Generadores y verificadores (Node)
│   ├── src/
│   │   ├── components/      Piezas de interfaz
│   │   ├── lib/             Dominio, estado y datos
│   │   ├── pages/           Una por módulo
│   │   ├── styles/          Tokens y estilos
│   │   ├── App.tsx          Rutas y guardas
│   │   └── main.tsx         Punto de entrada
│   ├── index.html           Metadatos, SEO, Open Graph
│   ├── package.json         Scripts y versión (fuente única de la versión)
│   └── vite.config.ts
├── docs/                    Documentación (índice en docs/INDEX.md)
│   ├── wink/                Referencia histórica de WINK POS
│   ├── HIG/                 Human Interface Guidelines de Apple (85 págs.)
│   └── ios27/               Tokens y catálogo de símbolos de iOS 27
├── supabase/
│   └── migrations/          0001_init · 0002_normalize · 0003_unpack · 0004_catalogo_global
├── CHANGELOG.md
└── README.md
```

---

## 2. `app/src/components`

| Archivo | Qué hace |
|---|---|
| `Shell.tsx` | Layout: barra lateral, topbar, contenido, tab bar flotante con `<Glass>` |
| `Icon.tsx` | Renderiza los SF Symbols; API `IconName` + `size` |
| `ui.tsx` | `Card`, `PageHead`, `Field`, `EmptyState`, `Tabs` (con `<Segmented>` de Konsta) |
| `DataTable.tsx` | Tabla en escritorio, tarjetas en móvil |
| `Receipt.tsx` | Ticket en vivo, con su versión imprimible |
| `ScannerModals.tsx` | Modales de escaneo y emparejamiento |
| `OtpInput.tsx` | Entrada de código de 6 dígitos |
| `QrCode.tsx` | QR del emparejamiento |
| `ErrorBoundary.tsx` | Evita la pantalla blanca ante un error |

---

## 3. `app/src/lib`

| Archivo | Responsabilidad |
|---|---|
| `store.tsx` | **Store global** (`useSyncExternalStore`), persistencia, acciones, sincronización con Supabase. ≈2.280 líneas. |
| `types.ts` | Tipos del dominio: `Product`, `Sale`, `Account`, `UserRole`, `AuditLogEntry`… |
| `cloud.ts` | Lectura/escritura en Supabase (solo clave pública) |
| `supabase.ts` | Cliente de Supabase y autenticación |
| `money.ts` | Formato de moneda, conversión USD ↔ Bs a tasa BCV |
| `fiscal.ts` | IGTF, IVA proporcional, totales |
| `metrics.ts` | Márgenes, capital, agregados de informes |
| `exchange.ts` | Tasa BCV y su actualización |
| `migrate.ts` | Migraciones de esquema de datos locales (con pruebas) |
| `permissions.ts` | `hasPermission`, `canAccess`, `PERMISSIONS` — **definidos, sin aplicar en la UI** |
| `audit.ts` | Bitácora en `localStorage` — **definida, sin llamadas** |
| `export.ts` / `exportData.ts` | Exportación a CSV e informes imprimibles |
| `productDisplay.ts` | Formateador de nombres de producto con deduplicación |
| `bypass.ts` | Atajos de teclado para el POS |
| `audio.ts` | Sonidos de feedback del escáner |
| `sf-symbols.ts` | **Generado**: 86 SF Symbols en `currentColor` |
| `ios-design-tokens.ts` | **Generado**: tokens oficiales del UI Kit de iOS 27 |
| `ios-tokens.ts` | Paleta iOS 26/27 y helpers |
| `scanner/` | Proveedor de escáner, cámara, HID (USB) y emparejamiento |

### `lib/__tests__`

`catalog` · `fiscal` · `metrics` · `migrate` · `scanner` → **50 pruebas** en
5 archivos.

---

## 4. `app/src/pages`

| Página | Módulo |
|---|---|
| `Landing.tsx` | Portada comercial pública |
| `Legal.tsx` | Términos y privacidad (texto real de Blink) |
| `Login.tsx` · `Registro.tsx` · `Recuperar.tsx` | Autenticación |
| `Onboarding.tsx` | Alta guiada del comercio |
| `Inicio.tsx` | Resumen |
| `Vender.tsx` | El POS (≈40 KB, la página más grande) |
| `Historial.tsx` | Historial de ventas |
| `Catalogo.tsx` | Catálogo global + propio (≈39 KB) |
| `Inventario.tsx` | Existencias, ajustes, traslados, compras |
| `Contactos.tsx` | Clientes y proveedores |
| `Finanzas.tsx` | Cuentas, movimientos, gastos, cierres (≈48 KB) |
| `Informes.tsx` | Informes imprimibles |
| `Ajustes.tsx` | 7 pestañas de configuración |
| `Escaner.tsx` | Escáner remoto (deep link) |

---

## 5. `app/src/styles`

| Archivo | Contenido |
|---|---|
| `tokens.css` | Tokens de BLINK + bloque `--ios-*` oficial del UI Kit |
| `app.css` | Componentes, responsive, métricas de iOS 27 |
| `konsta.css` | Tailwind v4 completo (con preflight) + tema de Konsta |
| `landing.css` | La landing, con materiales Liquid Glass |
| `fonts.css` | Pila de fuentes del sistema (no se distribuye ninguna fuente) |

Orden: `konsta.css` → `app.css` → `landing.css`. `app.css` va **sin capa**,
así que sus reglas ganan a las de cualquier capa de Tailwind.

---

## 6. `app/scripts`

| Script | Qué hace |
|---|---|
| `build-ios-tokens.mjs` | Extrae los tokens del UI Kit de iOS 27 → `src/lib/ios-design-tokens.ts` |
| `build-sf-symbols.mjs` | Descarga y normaliza los SF Symbols → `src/lib/sf-symbols.ts` |
| `build-icons.mjs` | Genera los PNG del PWA (192/512, maskable, apple-touch) |
| `build-og-image.mjs` | Genera la imagen Open Graph 1200×630 |
| `verify-ui.mjs` | Verificación visual de las 15 vistas |
| `check-docs.mjs` | Verificación de enlaces de la documentación |
| `postbuild-pages.mjs` | `404.html` + `.nojekyll` para GitHub Pages |
| `test-migrations.mjs` | Migraciones y RLS contra PostgreSQL embebido |

---

## 7. `supabase/migrations`

| Migración | Qué hace |
|---|---|
| `0001_init.sql` | Tabla `businesses` + RLS básico |
| `0002_normalize.sql` | Esquema normalizado: `business_members`, `products`, `contacts`, `accounts`, `sales`, `sale_lines`, `movements`, `inventory_moves`, `purchases`, `purchase_lines`, `expenses`, `pendings`, `pending_payments`, `transfers`, `cash_sessions`, `cash_closures` + RLS y funciones de rol |
| `0003_unpack.sql` | Desempaqueta el JSONB heredado a tablas normalizadas |
| `0004_catalogo_global.sql` | Catálogo global colaborativo por código de barras |

Detalle en [`20-supabase-auth-y-datos.md`](./20-supabase-auth-y-datos.md) y
[`11-modelo-datos-negocio.md`](./11-modelo-datos-negocio.md).

---

## 8. Convenciones

- Todo el código y la documentación, **en español**.
- Los datos del *store* se guardan en `localStorage` y se sincronizan con
  Supabase; la persistencia local permite trabajar sin conexión.
- Los iconos son **SVG**, nunca emoji.
- Ninguna clave secreta llega al navegador.
- Los cambios de versión se registran en [`../CHANGELOG.md`](../CHANGELOG.md) y
  su detalle técnico en el documento temático correspondiente.
