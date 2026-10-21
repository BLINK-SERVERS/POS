# 08 · Flujo de sesión autenticada (staging)

> ⚠️ **Documento de referencia de WINK POS — no describe BLINK.**
>
> Este archivo forma parte del **reconocimiento pasivo de `app.wink-pos.com`**
> (proyecto previo del que BLINK nació como alternativa). Describe la
> arquitectura, el diseño y el comportamiento de **WINK**, no los de BLINK.
>
> Se conserva como **material de estudio**: fue la fuente del comparativo
> funcional y de buena parte de las decisiones de BLINK. Para el estado real
> de BLINK, ver el [índice](../INDEX.md).
>
> **No tomar como referencia de la implementación actual.**

Estos scripts permiten entrar al POS con **tu propia cuenta** para documentar las
pantallas internas. **Tu contraseña nunca pasa por el código.**

> Estado del captcha: `GET https://api.wink-pos.com/auth/turnstile` → `{"siteKey":null}`
> → Turnstile **no está activo** hoy. Google OAuth sí está habilitado (`enabled:true`).
> Aun así, Cloudflare tiene bot-management (`__cf_bm`): un navegador **con ventana** es lo más fiable.

## Requisitos
- Una cuenta de **staging/pruebas** (no producción).
- Playwright + Chromium ya instalados (`npm install` + `npx playwright install chromium`).

## Paso 1 — Iniciar sesión (manual, una sola vez)

```powershell
cd "C:\Users\prodz\Desktop\BLINK POS"
npm run login
```

Qué ocurre:
1. Se abre un **Chromium con ventana** en `https://app.wink-pos.com/entrar`.
2. **Tú** escribes correo y contraseña (o usas "Continuar con Google").
3. Cuando entres al POS, el script detecta el login y guarda la sesión en
   **`recon/auth-state.json`** (cookies + localStorage).
4. El navegador se cierra solo.

Opciones:
```powershell
node scripts/login.mjs --timeout 20                 # hasta 20 min para loguearte
node scripts/login.mjs --base https://otro-host     # otro entorno
```

> `recon/auth-state.json` contiene credenciales de sesión: **no lo compartas** ni lo subas a git.

## Paso 2 — Recorrer el POS autenticado

```powershell
npm run capture-authed
```

Qué hace:
1. Reutiliza `recon/auth-state.json`.
2. Carga el home (`/inicio`) y **descubre** los enlaces de navegación.
3. Por cada pantalla genera, en `captures/`:
   - `screenshots/<ruta>.png` — captura full-page
   - `<ruta>.html` — DOM renderizado
   - `<ruta>.txt` — texto visible (para documentar sin mirar imágenes)
4. Guarda el tráfico hacia la API en `captures/api-traffic.json`.

Rutas explícitas (si prefieres controlarlas):
```powershell
node scripts/capture-authed.mjs --routes /inicio,/ventas,/inventario,/caja,/reportes
```

## Consideraciones
- Usa **staging** y datos ficticios. Si tocas producción, **anonimiza** clientes/ventas.
- Si la sesión caduca, repite el Paso 1 (el refresh token puede expirar).
- Respeta los Términos de Servicio del servicio.
- Las rutas internas que aún no conozco se descubrirán automáticamente en el Paso 2;
  las documentaré en `docs/` a medida que aparezcan.
