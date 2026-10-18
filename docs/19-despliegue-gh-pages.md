# 19 · Despliegue en GitHub Pages

**Sitio en vivo:** https://blink-servers.github.io/POS/
**Repositorio:** https://github.com/BLINK-SERVERS/POS (público)
**Último despliegue:** v1.1.1 · 2026-10-18 (commit `8d9b57c`) — verificado en vivo (consola
sin errores; `versión 1.1.1` visible en la pantalla de acceso).

## Cómo está armado

| Pieza | Dónde | Qué hace |
|---|---|---|
| Base del build | `app/package.json` → `build:pages` | `vite build --base=/POS/` genera los assets bajo el subdirectorio del proyecto. |
| `basename` del router | `app/src/App.tsx` | `<BrowserRouter basename={import.meta.env.BASE_URL}>` → funciona igual en local (`/`) y en Pages (`/POS/`). |
| Fallback 404 | `app/scripts/postbuild-pages.mjs` | Copia `dist/index.html` a `dist/404.html` y crea `.nojekyll`. Así las rutas profundas de la SPA (p. ej. `/POS/catalogo`) cargan la app en vez de dar 404. |
| Publicación | `gh-pages` (devDependency) | `npm run deploy` = build + push de `dist/` a la rama `gh-pages`. |
| Pages | Config del repo | Fuente = rama `gh-pages`, carpeta `/`. HTTPS forzado. |

## Comandos

```bash
cd app
npm run build      # build normal (base /), para probar en local
npm run build:pages # build con base /POS/ + 404.html + .nojekyll
npm run deploy     # build:pages + push a la rama gh-pages
```

Tras un `deploy`, GitHub reconstruye el sitio en ~30 s.

## Requisitos que se cumplieron

- **Repo público**: Pages gratis en repos públicos (en privados exige plan de pago).
- **Credenciales**: se ejecutó `gh auth setup-git` para que el `push` de `gh-pages` use el
  helper de GitHub CLI (sin esto, Git Credential Manager pide interacción y el deploy se cuelga).
- **Sin secretos en el repo**: `.env.local` está ignorado; solo se publica la clave **pública**
  de Supabase (que además no la usa la UI).
- **Sin fuentes propietarias**: se retiró San Francisco (Apple). La app usa la pila del sistema
  (`-apple-system`, Segoe UI…), así que no se distribuye ninguna fuente con licencia restringida.
  Los archivos SF quedan solo en local (`app/.fonts-sf-local/`, ignorado).
- **Sin material de Wink**: `clone/`, `captures/`, `recon/`, `screenshots/`, `chrome-profile/`,
  `scripts/` y los volcados crudos (`docs/tokens.*`, `styleguide.html`, `estructura-*`) están
  ignorados; el repo solo lleva código propio, `README` y la documentación redactada por el
  proyecto.
