# 01 · Stack técnico · BLINK POS

**Fecha:** 2026-10-21 · **Versión:** 1.8.3

> El stack de **WINK** (Angular + `bento-*`) está en
> [`wink/01-tech-stack.md`](./wink/01-tech-stack.md), como referencia histórica.

---

## 1. Runtime y build

| Pieza | Versión | Nota |
|---|---|---|
| **Node.js** | LTS (probado con v24) | |
| **Vite** | 8.3.4 | Build con `base: "/"` y `manualChunks` para el vendor |
| **React** | 19.3 | `react` + `react-dom` |
| **React Router** | 7.18 (`react-router-dom`) | `<BrowserRouter basename={import.meta.env.BASE_URL}>` |
| **TypeScript** | 5.9 | `strict`; `npm run typecheck` |
| **Vitest** | 5.0 | 50 pruebas en 5 archivos |
| **Tailwind CSS** | 4.3.3 | vía `@tailwindcss/vite`; importado **completo, con preflight** |
| **Konsta UI** | 5.5.0 (MIT) | `konsta/react`; tema `ios` |
| **Supabase** | `@supabase/supabase-js` 2.118 | Auth + PostgreSQL con RLS |
| **qrcode** | 1.5.4 | QR del emparejamiento del escáner |

### Configuración clave

`app/vite.config.ts`:

```ts
export default defineConfig({
  base: "/",                                        // el dominio propio sirve desde la raíz
  plugins: [react(), tailwindcss()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  server: { port: 5173 },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: { output: { manualChunks(id) {
      if (id.includes("node_modules")) return "vendor";   // vendor estable = mejor caché
      return undefined;
    } } },
  },
});
```

- La **versión** se lee de `app/package.json` en tiempo de build y se inyecta
  como `__APP_VERSION__`. **No se renderiza en la interfaz** (requisito del
  producto, ver BUG-12 en [`22-qa-caza-de-bugs.md`](./22-qa-caza-de-bugs.md)).
- `sourcemap: false` en producción: no se publican mapas de fuente.
- `manualChunks` separa las dependencias estables en un chunk `vendor`, que no
  cambia entre despliegues y por tanto se cachea mejor.

---

## 2. Arquitectura de la aplicación

```
BrowserRouter
└── KonstaProvider (tema "ios")
    └── StoreProvider (useSyncExternalStore + persistencia en localStorage)
        └── AppRoutes
            ├── Landing            → /                    (pública)
            ├── Legal              → /app/terminos, /app/privacidad
            ├── PublicOnly  → Login, Registro
            ├── OnboardingGate → Onboarding
            ├── Protected     → Shell > Inicio, Vender, Historial, Catálogo,
            │                             Inventario, Contactos, Finanzas,
            │                             Informes, Ajustes
            └── Escaner           → /escaner              (deep link QR, sin sesión)
```

Todas las páginas internas se cargan **con `lazy()` + `Suspense`**: el bundle
inicial solo trae la landing y el shell.

### Capas

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Estado | `src/lib/store.tsx` | Store global con `useSyncExternalStore`, persistencia, sincronización con Supabase |
| Datos | `src/lib/cloud.ts`, `supabase.ts` | Lectura/escritura en Supabase; cliente solo con clave pública |
| Dominio | `src/lib/money.ts`, `fiscal.ts`, `metrics.ts`, `exchange.ts` | Moneda, IGTF/IVA, márgenes, tasa BCV |
| UI | `src/components/` | `Shell`, `Icon`, `DataTable`, `Receipt`, `ui` (Card, Tabs, Field…) |
| Páginas | `src/pages/` | Una por módulo |
| Estilos | `src/styles/` | `tokens.css`, `app.css`, `konsta.css`, `landing.css` |

### Estado global

`store.tsx` es el corazón de la app (≈2.280 líneas). Puntos clave:

- `useSyncExternalStore` para que React se suscriba a los cambios.
- Persistencia en `localStorage` con control de cuota.
- `migrate.ts` migra el esquema de datos entre versiones (con pruebas).
- Sincronización con Supabase: `cloud.ts` empuja el estado al servidor.
- `syncRate` mantiene la tasa BCV al día.

> ⚠️ **Trampa conocida:** no llamar hooks dentro de `useCallback`. Ya causó un
> "Invalid hook call" al abrir el POS; se corrigió leyendo `currentState` del
> módulo en vez de invocar `useStoreState()`.

---

## 3. Backend

- **Supabase (PostgreSQL)** con **RLS por comercio**.
- La clave **pública** (`sb_publishable_…`) es la única que llega al
  navegador. `service_role` y la secret key nunca se exponen.
- Esquema normalizado en 4 migraciones: `supabase/migrations/0001…0004`.
- Pruebas de integración reales contra un PostgreSQL embebido:
  `npm run test:migrations`.

Detalle en [`20-supabase-auth-y-datos.md`](./20-supabase-auth-y-datos.md) y
[`11-modelo-datos-negocio.md`](./11-modelo-datos-negocio.md).

---

## 4. Estilos

| Archivo | Contenido |
|---|---|
| `styles/tokens.css` | Tokens de BLINK (3 colores base) + bloque `--ios-*` oficial |
| `styles/app.css` | Componentes y responsive de la app |
| `styles/konsta.css` | `@import "tailwindcss"` (con preflight) + `konsta/react/theme.css` |
| `styles/landing.css` | La landing pública (con Liquid Glass) |
| `styles/fonts.css` | Pila de fuentes **del sistema** (no se distribuye ninguna fuente) |

Orden de importación: `konsta.css` → `app.css` → `landing.css`. `app.css` va
**sin capa**, de modo que sus reglas ganan a las de cualquier capa de Tailwind
y el preflight no altera el diseño de BLINK.

Detalle en [`02-design-system.md`](./02-design-system.md) y
[`REDISENO_KONSTA_HIG.md`](./REDISENO_KONSTA_HIG.md).

---

## 5. Iconos

- **SF Symbols** de Apple: 86 SVG embebidos en `src/lib/sf-symbols.ts`,
  normalizados a `currentColor`. Se generan con `npm run icons:sf`.
- API estable: `<Icon name="…" size={…} />`, con `IconName` como unión de tipos.
- **Solo SVG, nunca emoji.**

Nota de licencia y alternativas libres en
[`ICONOS_Y_PWA.md`](./ICONOS_Y_PWA.md).

---

## 6. Despliegue

- **GitHub Pages** (rama `gh-pages`) + **Cloudflare** por delante (DNS, proxy,
  SSL, purga de caché).
- `npm run build:pages` → `vite build` + `404.html` + `.nojekyll`.
- `npm run deploy` → build + push a `gh-pages`.
- **Un push a `main` no despliega.**

Detalle en [`19-despliegue-gh-pages.md`](./19-despliegue-gh-pages.md) y
[`DNS_CLOUDFLARE_GITHUB_PAGES.md`](./DNS_CLOUDFLARE_GITHUB_PAGES.md).

---

## 7. Verificación

| Comando | Qué comprueba |
|---|---|
| `npm run typecheck` | Tipos (TS estricto) |
| `npm test` | 50 pruebas unitarias |
| `npm run test:migrations` | Migraciones y RLS contra PostgreSQL real |
| `npm run verify:ui` | 15 vistas: render, `h1`, iconos, overflow, consola |
| `npm run docs:check` | Enlaces de la documentación |

---

## 8. Dependencias

**Producción:** `@supabase/supabase-js`, `konsta`, `qrcode`, `react`,
`react-dom`, `react-router-dom`.

**Desarrollo:** `@tailwindcss/vite`, `@types/qrcode`, `@types/react`,
`@types/react-dom`, `@vitejs/plugin-react`, `embedded-postgres`, `gh-pages`,
`pg`, `tailwindcss`, `typescript`, `vite`, `vitest`.
