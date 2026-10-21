# 19 · Despliegue en GitHub Pages

**Sitio en vivo:** **https://www.blink.com.ve**
**Repositorio:** https://github.com/BLINK-SERVERS/POS (público)
**Último despliegue:** v1.8.3 · 2026-10-21 — verificado en vivo (consola sin
errores).

> La URL pública es el **dominio propio**, no la de GitHub. `blink.com.ve`
> redirige con 301 a `www.blink.com.ve`. Ver
> [`DNS_CLOUDFLARE_GITHUB_PAGES.md`](./DNS_CLOUDFLARE_GITHUB_PAGES.md).

## Cómo está armado

| Pieza | Dónde | Qué hace |
|---|---|---|
| Base del build | `app/vite.config.ts` | `base: "/"` — el dominio propio sirve desde la raíz. **No** se usa `--base=/POS/`: el subdirectorio del repositorio es solo la fuente, no la URL pública. |
| `basename` del router | `app/src/App.tsx` | `<BrowserRouter basename={import.meta.env.BASE_URL}>` → funciona igual en local (`/`) y en producción (`/`). |
| Fallback 404 | `app/scripts/postbuild-pages.mjs` | Copia `dist/index.html` a `dist/404.html` y crea `.nojekyll`. Así las rutas profundas de la SPA (p. ej. `/app/catalogo`) cargan la app en vez de dar 404. |
| Dominio propio | `app/public/CNAME` | `www.blink.com.ve` — GitHub Pages lo usa para el certificado. |
| Publicación | `gh-pages` (devDependency) | `npm run deploy` = build + push de `dist/` a la rama `gh-pages`. |
| Pages | Config del repo | Fuente = rama `gh-pages`, carpeta `/`. HTTPS forzado. |
| CDN | Cloudflare | Proxy sobre `blink-servers.github.io`, con purga de caché desde el panel. |

## Comandos

```bash
cd app
npm run build       # build normal (base /)
npm run build:pages # build + 404.html + .nojekyll
npm run deploy      # build:pages + push a la rama gh-pages
```

> **Un `push` a `main` no despliega.** El sitio se publica solo con
> `npm run deploy`, que hace el push a `gh-pages`.

Tras un `deploy`, GitHub reconstruye el sitio en ~30 s y Cloudflare sirve la
versión nueva en cuanto termina el edge.

## Rutas de la aplicación

| Ruta | Contenido |
|---|---|
| `/` | Landing pública (sin sesión) |
| `/app/*` | La aplicación, tras iniciar sesión |
| `/escaner` | Escáner móvil enlazado por QR (deep link, se mantiene en la raíz) |
| `/app/terminos`, `/app/privacidad` | Textos legales reales de Blink |

## Requisitos que se cumplieron

- **Repo público**: Pages gratis en repos públicos (en privados exige plan de pago).
- **Credenciales**: se ejecutó `gh auth setup-git` para que el `push` de `gh-pages` use el
  helper de GitHub CLI (sin esto, Git Credential Manager pide interacción y el deploy se cuelga).
- **Sin secretos en el repo**: `.env.local` está ignorado; solo se publica la clave **pública**
  de Supabase (que además no la usa la UI).
- **Sin fuentes propietarias**: se retiró San Francisco (Apple). La app usa la pila del sistema
  (`-apple-system`, Segoe UI…), así que no se distribuye ninguna fuente con licencia restringida.
  Los archivos SF quedan solo en local (`app/.fonts-sf-local/`, ignorado).
- **Sin material de Wink en la raíz de `docs/`**: el material de reconocimiento de WINK se
  conserva, pero aislado en [`wink/`](./wink/README.md) y marcado como referencia histórica.
  Los volcados crudos (`tokens.*`, `styleguide.html`, `computed-styles.json`, `estructura-dom.md`)
  también viven ahí.

## Verificación tras desplegar

```bash
npm run docs:check   # enlaces de la documentación
npm run verify:ui    # regresión visual de las 15 vistas (requiere el dev server)
```

Y a mano, en <https://www.blink.com.ve>:

- la landing carga sin sesión y sin errores en la consola;
- `blink.com.ve` responde 301 a `www` conservando path y query;
- las rutas profundas de la SPA (`/app/catalogo`) cargan la app en vez de dar 404.
