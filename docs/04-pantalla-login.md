# 04 · Pantalla pública de Login (`/entrar`)

Esta es la **única pantalla pública** y la base del snapshot reconstruido en `clone/`.

## 4.1 Estructura (DOM renderizado)

```
<bento-root ng-version="22.1.4">
  <router-outlet>
  <bento-login>
    <bento-auth-layout>
      <div class="h-dvh overflow-y-auto">
        <div class="grid min-h-full lg:grid-cols-2">

          <!-- COLUMNA IZQUIERDA (marca, visible solo en >=lg) -->
          <section class="m-4 hidden ... rounded-3xl bg-surface-brand-subtle p-8 lg:flex xl:p-10">
            <bento-logo> <img src="brand/wordmark.svg" height="32"> </bento-logo>
            <div class="mx-auto w-full max-w-md py-6">
              <!-- Ilustración "tienda" hecha con divs (auth-shop) -->
              <div class="auth-shop ... w-64 pt-10">
                <div class="absolute top-0 right-0 rotate-6 rounded-md bg-surface-inverse ...">
                  ¡Pasa, estás en casa!
                </div>
                <!-- toldo a rayas: 6 franjas brand/default alternadas -->
                <!-- letrero con "ojos" (auth-wink-eye) que guiñan -->
                <!-- cartel "Tu comercio" con bento-icon name="home" -->
              </div>
              <h2 class="max-w-sm text-3xl font-bold ...">
                Tu negocio tiene mucho por delante.
              </h2>
              <p class="mt-4 max-w-sm text-base leading-relaxed text-text-secondary">
                Vamos a poner cada cosa en su lugar. Ventas, inventario y cuentas,
                con espacio para lo que viene.
              </p>
            </div>
            <p class="text-sm text-text-secondary">Wink by Yummy</p>
          </section>

          <!-- COLUMNA DERECHA (formulario) -->
          <section class="flex min-w-0 items-start justify-center ... sm:items-center bg-surface-default">
            <div class="w-full max-w-md">
              <!-- header móvil (logo + mini-ojo), oculto en lg -->
              <div class="mb-6 ... lg:hidden"> <bento-logo> … </bento-logo> <div class="size-11 …">ojos</div> </div>
              <div class="py-2 sm:py-0">
                <h1 class="text-3xl font-bold ...">Qué bueno verte por aquí.</h1>
                <p class="mt-3 text-sm ... text-text-secondary">
                  Entra y sigamos con tu negocio. Usa tu correo o el de tu invitación.
                </p>

                <form novalidate class="mt-8 space-y-4">
                  <fieldset class="min-w-0 space-y-4">
                    <bento-field label="Correo" id="login-email"> … <input type="email" placeholder="tu@correo.com"> </bento-field>
                    <bento-text-input label="Contraseña" type="password" placeholder="Tu contraseña"> … </bento-text-input>
                    <p class="-mt-1 text-right text-sm">
                      <a href="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
                    </p>
                    <bento-form-error></bento-form-error>
                    <button type="submit" bentobutton> Entrar <bento-icon name="arrow-right"/> </button>
                    <button type="button" intent="secondary"> Continuar con Google </button>
                  </fieldset>
                </form>

                <p class="mt-6 text-center text-sm text-text-secondary">
                  ¿Primera vez por aquí?
                  <a href="/crear-comercio">Vamos a crear tu comercio</a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </bento-auth-layout>
  </bento-login>
  <bento-toasts> … </bento-toasts>
  <bento-confirm-host> … </bento-confirm-host>
</bento-root>
```

## 4.2 Copy exacto (textos de UI)

| Ubicación | Texto |
|---|---|
| `<title>` | `Entrar · WINK POS` |
| Sticker izquierda | `¡Pasa, estás en casa!` |
| Cartel ilustración | `Tu comercio` |
| Titular izquierda | `Tu negocio tiene mucho por delante.` |
| Bajada izquierda | `Vamos a poner cada cosa en su lugar. Ventas, inventario y cuentas, con espacio para lo que viene.` |
| Pie izquierda | `Wink by Yummy` |
| Titular formulario | `Qué bueno verte por aquí.` |
| Bajada formulario | `Entra y sigamos con tu negocio. Usa tu correo o el de tu invitación.` |
| Label email | `Correo` |
| Placeholder email | `tu@correo.com` |
| Label contraseña | `Contraseña` |
| Placeholder contraseña | `Tu contraseña` |
| Enlace | `¿Olvidaste tu contraseña?` |
| Botón primario | `Entrar` (+ icono `arrow-right`) |
| Botón secundario | `Continuar con Google` |
| Footer | `¿Primera vez por aquí? Vamos a crear tu comercio` |

## 4.3 Comportamiento / estados
- Form con **validación reactiva**: botón `Entrar` deshabilitado mientras inválido.
- Campos `required` + `type="email"` / `type="password"`.
- Autocompletado: email `autocomplete="username"`, password `autocomplete="current-password"`.
- Inputs con `aria-describedby` a un `<span helper>` con `aria-live="polite"`.
- Toggle de ver contraseña (marcador `<!---->` Angular → hay `<ng-container>` condicional).
- `bento-form-error` para errores de envío.
- `bento-toasts` (popover manual, `aria-live="polite"`) y `bento-confirm-host` para diálogos.

## 4.4 Responsive (de las clases Tailwind)
- **< lg (1024px):** una sola columna; el formulario ocupa todo y aparece un **header móvil**
  con logo + mini-ojo. Padding con **safe-area** (`env(safe-area-inset-*)`) para notch.
- **≥ lg:** dos columnas (`lg:grid-cols-2`); columna izquierda de marca con fondo
  `bg-surface-brand-subtle` y `rounded-3xl`.
- **≥ xl:** más padding en la columna de marca (`xl:p-10`).
- Targets táctiles: en `pointer-coarse` los controles crecen a `h-11` (~44px).

## 4.5 Estilos computados reales
`docs/computed-styles.json` contiene la tabla de estilos computados (fuente, color, fondo,
radio, padding, borde, sombra) de cada elemento visible de la pantalla.

## 4.6 Snapshot reconstruido
`clone/index.html` = DOM renderizado con el JS quitado + CSS y assets locales.
Para verlo:
```powershell
cd "C:\Users\prodz\Desktop\BLINK POS"
npx serve clone      # o abrir clone/index.html directamente
```
> El snapshot reproduce fielmente la pantalla de login (mismos tokens, mismos assets de marca).
> Las fuentes Montserrat se cargan de Google Fonts (requiere internet) o se ven con el fallback.
