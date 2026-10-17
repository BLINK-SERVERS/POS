# 06 · Reproducción

Todo el material de este repo se puede regenerar desde cero con los scripts en `scripts/`.

## Requisitos
- Node.js LTS (probado con v24.14.0) + npm (11.9.0)
- Conexión a internet (para bajar assets y fuentes públicas)

## Instalación
```powershell
cd "C:\Users\prodz\Desktop\BLINK POS"
npm install
npx playwright install chromium
```

## Scripts

### `scripts/extract-tokens.mjs` → `docs/tokens.json`, `docs/tokens.css`
Parsea los bloques `<style>` de `recon/index.html` y extrae todas las custom properties
`--var: valor` (252 tokens), clasificadas por prefijo.

### `scripts/capture.mjs` → screenshots + recon/
1. Abre Chromium headless (UA Chrome, locale `es-ES`).
2. Navega a `https://app.wink-pos.com/`, espera hidratación de Angular (4s).
3. Guarda el DOM final en `recon/rendered-dom.html`.
4. Captura `screenshots/login-{desktop,laptop,tablet,mobile}.png`.
5. Extrae estilos computados → `docs/computed-styles.json`.
6. Registra red → `recon/network-requests.json` y consola → `recon/console-log.json`.

### `scripts/make-static-snapshot.mjs` → `clone/`
Toma `recon/rendered-dom.html`, **quita todo `<script>`** (evita re-arrancar Angular),
fuerza la hoja de estilos y copia assets → `clone/index.html` navegable offline.

## Descarga manual de assets

```powershell
$base = "https://app.wink-pos.com"
$dir  = "recon\assets"
foreach ($a in @("styles-RYCGKBXC.css","main-IXWMM7SO.js","chunk-D8lZCCEd.js",
                 "chunk-jgQbO1tX.js","ngsw.json","manifest.webmanifest")) {
  Invoke-WebRequest "$base/$a" -OutFile (Join-Path $dir $a)
}
```

## Verificar el snapshot
```powershell
npx serve clone        # http://localhost:3000
```
Debería verse idéntico a la pantalla de login pública (salvo que la fuente requiere internet).

## Re-capturar el inventario de red
```powershell
node scripts/capture.mjs
Get-Content recon/network-requests.json | ConvertFrom-Json | Select method,url -Unique
```

## Notas de reproducibilidad
- Los nombres de `chunk-*.js` y `styles-*.css` cambian con cada build → re-ejecutar `capture.mjs`
  o volver a leer `ngsw.json` actualiza el inventario.
- El snapshot `clone/` congela **un** build concreto; no se auto-actualiza.
