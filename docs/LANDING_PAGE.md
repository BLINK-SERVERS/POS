# Landing Page Comercial (ruta raíz `/`)

**Fecha:** 2026-10-20 · **Versión:** 1.4.0

## Objetivo

La raíz de `https://pos.blink.com.ve/` es la **portada pública** de BLINK POS.
Antes redirigía a `/inicio` (que terminaba en el login). Ahora muestra una landing de
conversión que explica el producto en menos de 3 segundos y deriva al registro.

## Estructura de rutas

| Ruta | Acceso | Contenido |
|---|---|---|
| `/` | Público | Landing comercial |
| `/app/terminos` | Público | Términos y Condiciones de Uso |
| `/app/privacidad` | Público | Política de Privacidad |
| `/app/entrar` | Público* | Login |
| `/app/registro` | Público* | Crear mi comercio |
| `/app/recuperar` | Público | Recuperar contraseña |
| `/app/onboarding` | Con sesión | Alta guiada (moneda base, tipo de comercio) |
| `/app/inicio` … `/app/ajustes` | Protegido | Módulos de la app |
| `/escaner` | Público | Escáner remoto (deep link QR, queda en la raíz) |

\* `PublicOnly`: si ya hay sesión verificada, redirige a `/app/inicio`.

> `/escaner` se mantiene en la raíz a propósito: es un enlace que se comparte por QR y
> debe seguir siendo corto y estable aunque se reorganice la app.

## Secciones de la landing

1. **Header fijo** — logo a la izquierda, ancla central (Características / Cómo funciona /
   Precios), y a la derecha `Iniciar Sesión` + `Registrar mi comercio`. Sin redes sociales.
   En móvil colapsa a menú hamburguesa (`ld-burger`).
2. **Hero** — titular, subtítulo, CTA `Empezar Ahora - $25/mes` y mockup del POS en PC
   con el celular escaneando (SVG + CSS puro, sin imágenes externas).
3. **Beneficios** — grid de 3 columnas: escáner móvil por QR, multimoneda USD/EUR + BCV,
   y operación local-first.
4. **Ecosistema** — cita de confianza + 4 métricas sobre fondo Negro Blink.
5. **Precios** — tarjeta única con el plan Pro Comercial a **$25/mes** y 6 inclusiones.
6. **Footer** — logo, copyright © 2026, términos, privacidad y soporte.

## Archivos

| Archivo | Rol |
|---|---|
| `app/src/pages/Landing.tsx` | Componente de la landing (datos en arrays al inicio) |
| `app/src/pages/Legal.tsx` | Términos y privacidad (texto real de Blink) |
| `app/src/styles/landing.css` | Estilos exclusivos de la landing (scope `.ld-*`) |
| `app/src/App.tsx` | Rutas: landing en `/`, app bajo `/app/*` |
| `app/src/styles/tokens.css` | Tokens de marca Blink (`--blink-*`) |
| `app/index.html` | Metadatos SEO (description, Open Graph, Twitter Card) |
| `app/public/manifest.json` | `id`/`start_url`/`scope` apuntando a la raíz |

## Reglas aplicadas

- **Paleta:** `#FFFEFB` (fondo), `#1D1D1F` (superficies oscuras y texto principal),
  `#007AFF` **exclusivamente** para CTAs y acentos, `#424242` para texto secundario.
  Verde/rojo/amarillo solo como estados semánticos.
- **Iconos:** SVG propios del componente `Icon`. Sin emoji.
- **Tipografía:** títulos con `clamp()` y `letter-spacing` negativo; metadatos en `--fs-xs/sm`
  con gris de marca.
- **Espacio negativo:** secciones con padding amplio (`clamp(3.5rem, 9vw, 6.5rem)`) y
  `gap` generoso alrededor de los CTAs.
- **Responsive:** 3 columnas → 1 columna bajo 860px; header con hamburguesa; CTA a ancho
  completo bajo 560px.

## Aviso de cookies

La landing pública pregunta una sola vez cómo se usan las cookies
(`src/components/AvisoCookies.tsx`). La tarjeta usa el material de la hoja del
sistema —20 px de radio, superficie elevada, borde de 1 px y sombra suave—,
centrada abajo en móvil y anclada abajo a la derecha desde 768 px.

- **Tres respuestas:** «Aceptar todas», «Solo las necesarias» y «Rechazar».
  Bajo 420 px, «Aceptar todas» ocupa el ancho completo y las otras dos se
  reparten debajo.
- **Persistencia:** `localStorage` (`blink.pos.cookies`, versión 1 con fecha)
  en `src/lib/cookies.ts`; el aviso no vuelve a salir hasta borrar los datos del
  sitio o cambiar la versión.
- **Enlace:** «Política de privacidad» lleva a `/app/privacidad`, cuyo apartado
  4 describe cookies y consentimiento.
- **Botones:** clases `cookies__boton*` en `landing.css`. La landing no carga
  `app.css`, así que `.btn` no existe aquí y los botones se visten aparte.
- **Alcance:** solo la landing; la app con sesión nunca lo muestra.

## Verificación

- `npx tsc --noEmit` → sin errores
- `npx vitest run` → 50/50
- `npm run build:pages` → OK (bundle principal 100.4 kB → 116.9 kB por la landing)
- Navegador: sin errores de consola; menú móvil, anclas y rutas verificados

## Notas de mantenimiento

- La landing se importa **estáticamente** en `App.tsx` (no `lazy`) para que forme parte
  del bundle inicial y el FCP no dependa de una descarga extra. Los módulos de la app
  siguen en `lazy`.
- Si se añade un enlace interno en la app, debe apuntar a `/app/...`.
- `src/styles/landing.css` se importa desde `Landing.tsx`, así que Vite lo extrae a un
  chunk propio. No importarlo también en `main.tsx` para evitar duplicarlo.
