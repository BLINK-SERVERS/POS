# BLINK POS

Punto de venta web (Vite + React 19 + TypeScript). Original: código, diseño y
marca propios. Vende, cobra en dólares y bolívares, y controla inventario,
finanzas e informes desde un solo lugar.

## Estructura

```
app/    Aplicación (Vite + React + TS)
docs/   Documentación de producto, arquitectura y plan de desarrollo
```

## Desarrollo

```bash
cd app
npm install
npm run dev        # http://localhost:5173
```

Para probar desde el móvil en la misma red Wi-Fi:

```bash
npm run dev -- --host 0.0.0.0
```

## Verificación

```bash
cd app
npm run typecheck  # tsc --noEmit
npm run build      # build de producción
```

## Publicación en GitHub Pages

El sitio se publica en `https://blink-servers.github.io/POS/`.

```bash
cd app
npm run deploy     # build con base /POS/ + push a la rama gh-pages
```

- `vite build --base=/POS/` genera rutas de assets bajo el subdirectorio.
- `scripts/postbuild-pages.mjs` crea `404.html` (copia de `index.html`) y
  `.nojekyll` para que las rutas profundas de la SPA funcionen en Pages.
- El `basename` del router usa `import.meta.env.BASE_URL`, así que funciona
  igual en local (`/`) y en Pages (`/POS/`).

## Notas

- Tipografía: pila de fuentes del sistema (en Apple se ve San Francisco vía
  `-apple-system`). No se distribuye ninguna fuente propietaria.
- Supabase: solo se usa la clave **pública** (publishable/anon) en el cliente.
  La secret key y el service_role nunca van al navegador.
