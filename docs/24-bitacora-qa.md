# 24 · Bitácora de QA · BLINK POS

**Fecha:** 2026-10-21 · **Versión auditada:** 1.10.0 · **Alcance:** toda la app

Registro de la sesión de auditoría: qué se probó, qué falló, cuál fue el
comportamiento anómalo y cómo se resolvió.

---

## 1. Entorno de pruebas

### 1.1 · Modo bypass (local)

La app trae un **bypass temporal** (`app/src/lib/bypass.ts`): al abrir
`/app/entrar?bypass=1` se crea una sesión local falsa, sin tocar Supabase.
Es lo que permite probar la interfaz sin una cuenta real.

| Qué | Cómo |
|---|---|
| Sesión | `?bypass=1` (se quita de la barra al activarse) |
| Desactivar | `?bypass=0` o "Cerrar sesión" |
| Estado | `localStorage["blink-pos-state-v3"]` |

> El bypass está marcado como **temporal** en el propio código: se retira
> cuando termine la ronda de pruebas.

### 1.2 · Comercio ficticio en Supabase (real)

Sembrado con `npm run qa:seed` (`app/scripts/qa-seed.mjs`):

| Elemento | Valor |
|---|---|
| Correo | `qa.blink@tienda.local` |
| Clave | `ClavePrueba123` |
| Comercio | "Tienda QA" (`500567ad-80ce-4ac9-9402-5b187d3a3a60`) |
| Rol | **propietario** (`business_members.role = 'owner'`) |
| Flujo de cortesía | el usuario se crea con **el correo ya confirmado** (`email_confirm: true`): ni correo de verificación ni pasarela de pago |

> ⚠️ **Hallazgo de arquitectura (importante).** La app **no** lee las tablas
> normalizadas (`products`, `contacts`, `accounts`…). En la nube, la única
> fuente de verdad es **`businesses.data`**: el `AppState` completo en JSONB
> (`cloudLoadBusiness` / `cloudSaveBusiness`). Las tablas normalizadas son un
> reflejo para consulta SQL. Por eso la siembra escribe **el `AppState`
> completo** en `businesses.data` *y* replica las filas en las tablas.

### 1.3 · Población de datos

| Dato | Cantidad | Detalle |
|---|---|---|
| Catálogo global | **24 fichas** | EAN-13 con **dígito de control válido**, de una abastopedia venezolana (alimentos, bebidas, panadería, limpieza, aseo personal, lácteos) |
| Catálogo privado | **24 productos** | **importados del catálogo global** (ficha descriptiva + datos privados: costo, precio, stock, IVA) |
| Contactos | 3 | 2 clientes + **1 proveedor** (la compra lo exige) |
| Cuentas | 3 | efectivo, banco, pago móvil (comisiones 2 %) |
| Ventas | 1 | cobrada, 2 líneas, pago mixto |
| Pendientes | 3 | **abierto**, **saldado** y **parcial** (los tres estados) |
| Gastos | 2 | pagado y pendiente |
| Movimientos de inventario | 3 | entrada, salida por venta, salida por merma |
| Caja | 1 | sesión abierta (para probar el arqueo) |
| Descuentos / recargos | 1 / 1 | con y sin importe fijo |

La siembra es **idempotente**: se puede volver a ejecutar sin duplicar.

---

## 2. Qué se probó y con qué herramientas

| Herramienta | Qué comprueba |
|---|---|
| `npm run verify:ui` | 38 comprobaciones: 15 rutas en **escritorio y móvil**, onboarding, acceso sin sesión y presentación del modal |
| `npm run qa:e2e` | **Stress test**: pulsa los 93 botones de las 10 vistas y comprueba respuesta, diálogos, foco y doble ejecución |
| `npm run qa:funcional` | Flujos de negocio con efecto real: ticket, IVA, venta, compra, abono y arqueo |
| `npm run qa:responsive` | 6 resoluciones × 6 vistas: scroll, recorte de texto, tabla→tarjeta y **caída de la tipografía** |
| `npm run qa:seed` | Siembra el entorno de pruebas |
| `npm run docs:check` | Enlaces de la documentación |

---

## 3. Errores encontrados y cómo se resolvieron

### BUG-01 · La migración del catálogo global **nunca se aplicó en producción**

- **Comportamiento anómalo:** la tabla `catalogo_global` **no existía** en la
  base de datos de producción, aunque la migración `0004_catalogo_global.sql`
  está en el repositorio y la app la usa (`catalogoLookup` / `catalogoUpsert`).
  Cualquier consulta al catálogo global devolvía un error de relación
  inexistente, y el "añadir desde el catálogo global" fallaba en silencio
  (`catalogoLookup` nunca lanza, así que el alta caía al camino manual).
- **Cómo se detectó:** al inspeccionar el esquema real de Supabase durante la
  preparación del entorno de pruebas: la consulta de recuento falló con
  `42P01: relation "public.catalogo_global" does not exist`.
- **Solución:** se aplicó la migración (es **aditiva e idempotente**, no toca
  `businesses.data` ni los `products` existentes) y se verificó que la tabla
  quedó creada con sus políticas RLS y sus índices.
- **Comprobación:** `select count(*) from catalogo_global` → 24 fichas.

### BUG-02 · El foco se perdía al cerrar cualquier diálogo

- **Comportamiento anómalo:** tras abrir y cerrar un modal (o una alerta), el
  foco volvía al `body`. Un usuario que navega con el teclado se quedaba sin
  contexto: el siguiente `Tab` empezaba desde el principio de la página.
  Se detectó en **40ocasiones** a lo largo de las 10 vistas.
- **Causa:** al desmontarse el diálogo, el navegador devuelve el foco al
  `body` porque el elemento que lo abrió nunca lo recupera.
- **Solución:** un hook `useDevolverFoco()` en `app/src/components/ui.tsx`
  (usado por `Modal` y por `Alert`) que guarda el elemento activo al montarse
  y lo vuelve a enfocar al desmontarse.
- **Comprobación:** el stress test ya no reporta ni un caso.

### BUG-03 · La siembra de QA no era visible en la app

- **Comportamiento anómalo:** con la cuenta QA real, la app entraba bien pero
  **todas las vistas salían vacías**, aunque las tablas tuvieran filas.
- **Causa:** se sembraron las tablas normalizadas, pero la app hidrata desde
  `businesses.data` (el `AppState` en JSONB). Las tablas normalizadas no se
  leen (ver §1.2).
- **Solución:** la siembra escribe ahora el **`AppState` completo** en
  `businesses.data` y además replica las filas en las tablas, para que
  ambos lados sean consultables.
- **Comprobación:** acceso con la cuenta real → 24 productos, 3 contactos,
  3 cuentas y 1 venta visibles; 0 errores de consola.

### BUG-04 · Los errores de SQL se silenciaban en la siembra

- **Comportamiento anómalo:** la primera versión de `qa-seed.mjs` informaba
  "0 ventas, 0 pendientes" **sin dar ningún error**: la API de gestión de
  Supabase responde **200 con `{message}`** cuando la consulta falla, y el
  script solo miraba el código HTTP.
- **Solución:** `sql()` ahora **lanza** si la respuesta trae `message`, y usa
  `litN()` para escribir un `NULL` de SQL real (antes producía la cadena
  `'null'`, que Postgres rechazaba en las columnas de fecha).
- **Comprobación:** la siembra termina con el recuento esperado y sin
  silencios.

### BUG-05 · El verificador contaba el 404 del *fallback SPA* como error

- **Comportamiento anómalo:** al correr `verify:ui` contra **producción**
  fallaban las 38 comprobaciones con "Failed to load resource: 404". En
  realidad el único 404 era el **documento** de las rutas profundas: GitHub
  Pages responde 404 con el HTML de la app (el fallback SPA), y el navegador
  lo registra como error de consola aunque no lo sea.
- **Solución:** el verificador distingue el 404 del documento del 404 de un
  recurso real, así que la comprobación contra producción es fiable.
- **Comprobación:** `VERIFY_BASE=https://www.blink.com.ve npm run verify:ui`
  → 38/38 en verde.

### BUG-06 · Los rellenos translúcidos no se pintaban (en las dos apariencias)

- **Comportamiento anómalo:** la capa de cristal (material "Liquid Glass"),
  los velos de acento, los bordes suaves y las sombras difusas **no se veían**
  en ninguna de las dos apariencias. El fondo, el borde y la sombra de las
  tarjetas de cristal se perdían por completo: solo quedaban los textos.
- **Causa:** los tokens de canal eran `--papel-rgb: light-dark(255 254 251, 0 0 0)`
  y se componían con `rgb(var(--papel-rgb) / 0.62)`. **Chrome no admite
  `light-dark()` anidado dentro de `rgb()`**: la expresión queda inválida y
  el navegador **descarta la declaración entera** (no es un color invalido,
  es una declaración que no llega a aplicarse). Por eso el `background`
  caía a transparente, el `border` a `0px none` y el `box-shadow` a `none`.
- **Solución:** el token guarda ahora el **color** y la transparencia se
  compone con la **sintaxis de color relativo**, que sí resuelve
  `light-dark()` y respeta la apariencia vigente:

      --papel: light-dark(#fffefb, #000000);
      background: rgb(from var(--papel) r g b / 0.62);

  Se cambiaron los 9 tokens de color y los **94 usos** repartidos entre
  `tokens.css`, `app.css` y `landing.css`.
- **Comprobación:** el material se ve en claro y en oscuro; la suite completa
  (`npm run qa`) sigue en verde y `verify:ui` da 0 problemas y 0 errores de
  consola en las 4 combinaciones de tamaño y apariencia.

### BUG-07 · Media app se dibujaba con la tipografía del sistema

- **Comportamiento anómalo:** el titular grande de la landing salía en **Segoe
  UI** (la fuente de Windows) mientras el resto del texto salía en SF Pro: dos
  voces tipográficas en la misma pantalla. Lo mismo pasaba con los pesos 800 y
  900 en cualquier parte de la app.
- **Causa:** dos motivos encadenados.
  1. `fonts-dev.css` solo declaraba los pesos 400, 500, 600 y 700. Los
     ficheros de `.fonts-sf-local/` son instancias **estáticas** (regular,
     semibold, bold e italic), no una variable: un peso sin cubrir no cae
     en la misma fuente, sino en la siguiente de la pila (la del sistema).
  2. `--font-display` (`"SF Pro Display"`) y `--font-text` (`"SF Pro Text"`)
     eran familias **distintas**, y ninguna estaba registrada como
     `@font-face`: solo lo estaba `"SF Pro"`.
- **Solución:** se declara **todo el rango 100-900** en `fonts-dev.css`, se
  registran `"SF Pro Text"` y `"SF Pro Display"` como alias, y las tres
  variables de fuente apuntan a **una sola pila** (la diferencia entre el
  corte Display y el Text la resuelve el eje óptico `opsz` de la fuente).
  Además, la pila vive en `:root` (no en `body`) y los controles de
  formulario heredan, porque el navegador les da su propia fuente.
- **Verificación en producción:** los equipos **sin SF Pro instalada** (todo
  Windows y Linux) caían en la tipografía del sistema. Se añadió **Inter**
  (SIL OFL 1.1) como respaldo servido desde la app, recortado a 27 KB: se
  mantiene una sola voz tipográfica en todos los dispositivos sin
  distribuir ningún fichero de Apple.

### BUG-08 · En móvil, la cabecera no cabía

- **Comportamiento anómalo:** la barra lateral se convertía en un *drawer*
  deslizante que se abría con el botón hamburguesa. En pantallas de 390 px
  el nombre del comercio quedaba cortado en dos letras ("Ti…") y la
  cabecera era un muro de controles.
- **Solución:** el menú hamburguesa y su panel desaparecen. La navegación
  pasa a una **barra inferior flotante de material** con la acción principal
  (Vender) en el centro, y la cuenta, los ajustes y el cierre de sesión
  pasan al **menú del avatar** de la cabecera. El botón de caja se queda
  solo con el icono en móvil y el nombre recupera el espacio.
- **Comprobación:** `npm run qa:navegacion` → 24/24 en verde (barra con 5
  elementos, acción central con desvío de 0,00 px, simetría lateral de
  72,7 vs 72,7 px, menú de avatar completo y ningún control con escala al
  pulsar).

### BUG-09 · Los controles se encogían al mantenerlos pulsados

- **Comportamiento anómalo:** botones, steppers, acciones de fila y botones
  de icono aplicaban `transform: scale(0.92-0.97)` en `:active`. Es una
  sensación de *web app*, no de iOS: la HIG pide un "press state" sin que
  el control cambie de tamaño.
- **Solución:** se quita el `scale()` de todos los estados `:active`; el
  toque se marca solo con tono (opacidad y, en los botones, el brillo
  especular apagado).
- **Comprobación:** `npm run qa:navegacion` comprueba que ningún control de
  la app tiene una matriz de transformación con escala distinta de 1.

### BUG-10 · La variación "+100 %" no significaba nada

- **Comportamiento anómalo:** con el commerce recién abierto (el periodo
  anterior a 0), las cuatro tarjetas de General mostraban "+100,0 %". No
  era una crecimiento: era una division por cero.
- **Solución:** `growth()` devuelve `null` cuando no hay base de
  comparación, y la tarjeta **no muestra pastilla** en ese caso. Es
  preferible no informar a informar algo falso.
- **Comprobación:** `npm run qa:navegacion` → 37/37 en verde.

### BUG-11 · Las etiquetas de los meses no cabían en el gráfico

- **Comportamiento anómalo:** el locale "es" devuelve "sept" para
  septiembre, y en 12 columnas la etiqueta se solapaba con la vecina en
  móvil.
- **Solución:** abreviaturas fijas de tres letras (`ene`…`dic`) y un cuerpo
  menor en móvil.

### BUG-12 · La imagen de vista previa estaba rota y con la marca equivocada

- **Comportamiento anómalo:** `npm run og` **fallaba**: el generador leia
  `app/public/fonts/SF-Pro-Display-*.otf`, ficheros que se eliminaron en la
  v1.5.0 al dejar de distribuir material de Apple. La imagen que seguía en
  producción era de una versión anterior: trazo indigo `#3347DD` (el color
  del clon, no el azul oficial) y la copia vieja.
- **Solución:** el generador usa ahora la SF Pro real de
  `app/.fonts-sf-local/` (ficheros locales, solo de desarrollo: van
  incrustados en el PNG, que es una imagen) y, si no están, cae a la pila
  del sistema. La composicion usa la **paleta oficial** y el lema oficial
  de la marca.
- **Comprobación:** `npm run og` genera 1200×630 px y la vista previa sale
  con el lema, el azul oficial y el material de cristal.

### BUG-13 · Los iconos de la app no tenian version raster institucional

- **Comportamiento anómalo:** el navegador recibia solo el `.svg` y el
  `.ico` (que venia del clon, en trazo indigo) y el PWA no tenia un PNG
  propio para la pantalla de inicio.
- **Solución:** a partir del fichero institucional se generan
  `favicon.png` (32 px), `icon.png` (512 px), el `.ico` (16/32/48) y todo
  el juego del manifiesto, y el `favicon.svg` se reconstruyo **midiendo el
  PNG** para que vectorial y raster sean el mismo dibujo.
- **Comprobación:** los seis ficheros responden 200 y el icono se lee a 16,
  32, 48 y 64 px, tambien sobre fondo oscuro.

### BUG-14 · El render del video se caia a los ~140 fotogramas

- **Comportamiento anomalo:** el render se detenia con "un delayRender() no
  se limpio tras 58000 ms" (la tipografia).
- **Causa:** no era la tipografia: era el **audio**. Remotion deja el hilo
  principal bloqueado mientras decodifica la pista, y el `delayRender` de
  la fuente se quedaba esperando hasta expirar.
- **Solucion:** la fuente va incrustada en el bundle (data URL), asi que ya
  esta lista cuando empieza a pintar: no hace falta esperarla y el
  `delayRender` solo ata el render.
- **Comprobacion:** los 1800 fotogramas se renderizan sin errores.

### BUG-15 · La locucion sonaba entera desde el fotograma 0

- **Comportamiento anomalo:** en el MP4 se oia la locucion completa de
  golpe (las cinco frases seguidas, con las pausas del fichero) en vez de
  una frase por escena.
- **Causa:** el `<Audio>` con los cinco tramos no llego a montarse: un
  replacement anterior no habia aplicado (el texto searched habia cambiado)
  y se quedo el `<Audio>` suelto de la pista entera.
- **Solucion:** cada tramo va en su `<Sequence>` (que es lo que recorta la
  duracion: `<Audio>` no admite `durationInFrames`), con `trimBefore`
  para cortar el silencio inicial de cada frase y `playbackRate` para que
  termine dentro de su ventana.
- **Comprobacion:** `npm run analizar-audio` sobre el MP4 final: los cinco
  tramos caen en 0,1 s / 4,0 s / 11,2 s / 19,0 s / 24,8 s y la voz
  termina en el 29,4 s (quedan 0,6 s antes del corte).

### BUG-16 · El degradado del lema salia como un bloque azul

- **Comportamiento anomalo:** en el cierre, "BLINK ;)" era un rectángulo
  azul solido: el texto, transparente, dejaba ver el fondo sin recortar.
- **Causa:** React **no aplica** `background-clip: text` desde el objeto
  `style` (en HTML plano, el mismo CSS funciona: verificado).
- **Solucion:** el degradado va en una **clase CSS** (inyectada con un
  `<style>`), y el barrido se mueve con la variable `--barrido`.
- **Comprobacion:** el fotograma del cierre sale con el texto en degradado.

---

## 4. Incidencias que resultaron ser **correctas** (falsos positivos)

| Observación | Por qué no es un fallo |
|---|---|
| "Productos", "Cuentas", "Resultados"… no cambian nada al pulsarlas | son la **pestana activa** del control segmentado |
| "CSV" y "PDF" no cambian el DOM | lanzan una **descarga** o el diálogo de impresión |
| El cierre de caja no altera el DOM | abre un diálogo que se cerró después |
| Doble clic en "Guardar" | la acción es **síncrona y local**: el doble clic no crea dos registros (comprobado: 1 sola copia) |

---

## 5. Estados de carga

La app es **local-first**: las acciones críticas (Cobrar, Guardar, Retirar,
Registrar compra, Registrar abono) son **síncronas** — escriben en el store y
en `localStorage`, y la sincronización con Supabase va por detrás. Por eso
**no hay *spinners* ni *skeletons*** en esos botones: no hay nada que esperar.

La única acción con estado de carga real es la **actualización de la tasa
BCV** (`Ajustes › Moneda e impuestos`), que sí consulta una API externa: el
botón se **deshabilita** y su rótulo pasa a "Consultando…".

**Comprobado en el stress test:** ningún botón produce doble ejecución
(`addPayment`, `registrarCompra` y `abonoPending` son idempotentes frente al
doble clic) y ninguno se queda pulsado sin respuesta.

---

## 6. Resultado

| Batería | Resultado |
|---|---|
| `npm run typecheck` | sin errores |
| `npm test` | 50/50 |
| `npm run test:migrations` | todas las comprobaciones pasan |
| `npm run verify:ui` | 38/38 · 0 errores de consola · 0 iconos vacíos · 0 desbordes |
| `npm run qa:e2e` | 93 botones · 66 probados · **0 fallos** |
| `npm run qa:funcional` | 8/8 comprobaciones de negocio |
| `npm run qa:responsive` | 36 combinaciones resolución×vista · **0 fallos** |
| `npm run docs:check` | 0 enlaces rotos |

**Bugs resueltos en esta sesión: 5** (uno de ellos, la migración del
catálogo global, llevaba tiempo sin detectarse en producción).

---

## 7. Referencias

- Scripts: `app/scripts/qa-seed.mjs`, `qa-e2e.mjs`, `qa-funcional.mjs`,
  `qa-responsive.mjs`, `verify-ui.mjs`
- Informes generados: `verify-shots/qa-e2e-informe.md`,
  `qa-funcional-informe.md`, `qa-responsive-informe.md`
- Estado del proyecto: [`ESTADO_ACTUAL_PROYECTO.md`](./ESTADO_ACTUAL_PROYECTO.md)
- Cambios por versión: [`../CHANGELOG.md`](../CHANGELOG.md)
- Diseño y HIG: [`02-design-system.md`](./02-design-system.md) ·
  [`REDISENO_KONSTA_HIG.md`](./REDISENO_KONSTA_HIG.md)

---

## 8. Comercial de 30 s en HyperFrames (vídeo)

**Fecha:** 2026-10-22 · **Alcance:** el video de lanzamiento y sus recortes.

El comercial se rehizo con **HyperFrames** (HTML → MP4) y se verificó antes de
renderizar, con el checker del propio motor.

| Comprobación | Resultado |
|---|---|
| `hyperframes check` (lint, runtime, layout, movimiento, contraste, craft) | **0 errores, 0 avisos** |
| Contraste WCAG AA | 13/13 y 15/15 textos pasan |
| Rejilla de beats | 153 BPM medidos sobre la pista (primer golpe en 0,17 s) |
| Revisión visual (`snapshot`) | 12 fotogramas clave revisados a 1920×1080 |
| Entregables | master 16:9 (8,8 MB), 9:16 (2,7 MB) y 1:1 (2,7 MB): los tres a 60 fps, 1800 fotogramas y con audio (pico −4,1 dB) |

### 8.1 · Errores encontrados y resueltos

| # | Error | Causa | Resolución |
|---|---|---|---|
| V-01 | Tipografías sin `@font-face` | «Segoe Print» y «Comic Sans MS» no se resuelven en el render | Se declara `@font-face { src: local(...) }` en la escena que las usa |
| V-02 | Contraste AA insuficiente | Los textos secundarios usaban `#8A9099` (3,1:1) | Se bajan a `#6F747C`; el azul de marca sobre papel pasa a `#0075DC` (los rellenos siguen en `#0088FF`) |
| V-03 | Escenas descuadradas | **GSAP pisa el `transform`** del elemento que anima, así que el `translate(-50 %, -50 %)` de centrado se perdía | El centrado pasa a rejilla (`grid` + `place-items: center`) o a `margin`/`inset` |
| V-04 | Panel de escritorio cortado | El panel (1080×620) no cabía en una celda de la rejilla 3×3 | La escena 2 usa una columna flexible |
| V-05 | Texto descentrado en la escena 4 | `1fr` crece hasta el ancho mínimo del elemento y empuja la columna central | `repeat(3, minmax(0, 1fr))` y `max-width` en el titular |
| V-06 | Dispositivos fuera de cuadro | Miniaturas escaladas sin caja: el `transform` no cambia la caja de layout | Se fija la caja (432×248 y 126×273) y se escala el interior |
| V-07 | Botón de venta encima de la cabecera | La regla global del badge (`position: absolute`) heredaba en el botón de confirmación | La escena 3 reinicia `position: relative` |
| V-08 | Primer fotograma vacío | La primera palabra entraba a opacidad 0 | Arranca visible (desenfocada) y se afina: el fotograma 0 es la miniatura en redes |
| V-09 | Partículas verdes sueltas | Las partículas existían desde el arranque, con opacidad 1 | `opacity: 0` por defecto; el tween las enciende |
| V-10 | Recortes 9:16 y 1:1 descentrados y con los titulares cortados | El motor ajusta la escena al lienzo de la raíz por su cuenta: el escalado manual de una segunda raíz se peleaba con ese ajuste | Los recortes se sacan del master con ffmpeg (lienzo completo a 1080×608 sobre un marco azul noche con la firma) |

### 8.2 · Lo que sigue pendiente

- Publicación en Product Hunt y redes (falta la cuenta y el copy final).
- El master de Remotion (`video/BLINK-COMERCIAL.mp4`) y el de HyperFrames
  (`BLINK-COMERCIAL-HF.mp4`) conviven; el de HyperFrames es el vigente.
- El `CHANGELOG.md` todavía no recoge las versiones 1.13.0 a 1.16.0 de la app.
---

## 9. Liquid Glass en oscuro, fondos planos y diseño (v1.17.0)

**Fecha:** 2026-10-22 · **Alcance:** el material de cristal en la aparición
oscura, los fondos de la página y las correcciones de diseño que salieron al
revisar las capturas.

Las capturas de `verify-shots/` se repasaron a mano en las cuatro
combinaciones (escritorio/móvil × claro/oscuro). Lo que se ve en pantalla no
lo Pillaba ningún script: el texto negro sobre el azul, el botón de cobrar
cortado y el solape en móvil salieron al mirar las imágenes.

| Comprobación | Resultado |
|---|---|
| `npm run verify:ui` | 0 vistas con problemas · 0 errores de consola |
| `npm run qa:apariencia` | 0 fallos (el contador ya no llama «avisos» a las comprobaciones correctas) |
| `npm run qa:responsive` | 0 fallos |
| `npm test` | 50/50 |
| `npm run typecheck` | sin errores |
| `npm run docs:check` | 0 enlaces rotos |

### 9.1 · Errores encontrados y resueltos

| # | Error | Causa | Resolución |
|---|---|---|---|
| BUG-16 | En oscuro, el texto de los botones primarios salía **negro sobre el azul** | El token de texto inverso se invierte con la apariencia, pero el azul de marca es igual de claro en los dos modos | Nuevo token `--color-text-on-accent` (siempre claro) en el botón primario, el avatar, el punto de la lista de pasos y los botones de la landing |
| BUG-17 | El texto de los botones tintados, las insignias de acento y las píldoras de variación no llegaba a 4,5:1 | El azul de la marca sobre su propio velo daba 3,3:1 en claro y 2,9:1 en oscuro; el verde de las píldoras, 1,9:1 | Tres tokens de texto propios: `--color-accent-text`, `--color-success-text` y `--color-danger-text` |
| BUG-18 | El botón de **cobrar** quedaba cortado por abajo | El pie del ticket encogía (flex-shrink) y el alto del POS era una cuenta fija que no descontaba la cabecera | El pie no encoge, la lista de líneas es la que se desplaza, y la página del POS ocupa el alto que deja la cabecera |
| BUG-19 | En móvil, el botón del estado vacío se solapaba con la cabecera del ticket | La página del POS estaba comprimida al alto de la pantalla en una sola columna | En una columna (`max-width: 1080px`) la página vuelve a su alto natural |
| BUG-20 | El gráfico de ventas con los doce meses a cero era un hueco vacío | Se dibujaban doce barras de 1 % de alto y los nombres de los meses | Si no hay ni un euro en el periodo, se dice: estado vacío con el icono y la explicación |

### 9.2 · El material de cristal en la aparición oscura

| Pieza | Claro | Oscuro |
|---|---|---|
| Radio de desenfoque (`--ios-blur`) | 6 px (*Light/Regular - Small*) | **15 px** (*Light/Regular - Medium*) |
| Velo (`--ios-veil`) | 0,62 → 0,22 → 0,08 | **0,20 → 0,08 → 0,035** |
| Brillo especular (`--ios-specular`) | 0,72 | **0,30** (antes 0,16) |
| Canto interior (`--ios-rim`, nuevo) | 1 px a 0,14 | 1 px a 0,13 |

El motivo es que sobre el negro un 8 % de blanco no se ve: el material se
quedaba plano. Los tokens siguen a `color-scheme`, así que el modo elegido a
mano en Ajustes también los respeta (no es una consulta de medios).

### 9.3 · Lo que sigue pendiente

- Publicación en Product Hunt y redes (falta la cuenta y el copy final).
- El `CHANGELOG.md` ya recoge las versiones 1.13.0 a 1.17.0 (se había
  quedado atrás).
---

## 10. Rediseño de interfaz (v1.18.0)

**Fecha:** 2026-10-22 · **Alcance:** barra superior, cabecera del panel,
selector de periodo, deslizante de apariencia, catálogo y tablas en móvil.

La especification llegó como documento: ocho puntos con sus reglas. Se
implementó punto por punto y cada uno tiene su comprobación en
`qa:navegacion`, para que no se deshaga sola.

| Comprobación | Resultado |
|---|---|
| `npm run typecheck` | sin errores |
| `npm test` | 50/50 |
| `npm run verify:ui` | 0 vistas con problemas · 0 errores de consola |
| `npm run qa:navegacion` | 0 fallos · 0 avisos (20 comprobaciones nuevas) |
| `npm run qa:apariencia` | 0 fallos (5 comprobaciones) |
| `npm run qa:e2e` | 70 botones, 61 probados, 1 aviso (el PDF, preexistente) |
| `npm run qa:funcional` | 8/8 |
| `npm run qa:responsive` | 0 fallos |
| `npm run docs:check` | 0 enlaces rotos |

### 10.1 · Lo que pedía la especificación y cómo quedó

| Punto | Decisión | Nota |
|---|---|---|
| 1 · Icono de Inicio macizo | Icono propio de la marca (`grid2x2.solid`) | Los SF Symbols son de Apple y no se pueden modificar: su `grid2x2` es un contorno |
| 2 · Barra superior | Fuera el escáner y la caja; nombre (peso 500) + tasa de 2 decimales + avatar | La caja se abre desde el menú del avatar |
| 2 · Paridad en oscuro | La barra y la página comparten el mismo negro, sin borde | Antes la barra era una superficie `#1a1a1a` sobre un lienzo negro: un parche visible |
| 3 · Saludo | «Hola, [Nombre] [Apellido]» + «Así va tu negocio» | Sin nombre propio, «Hola» |
| 4 · Periodo | Día, Semana, Mes (fuera Año) | Semana de lunes a domingo (`weekRange`) |
| 5 · Deslizante de tema | Knob con el icono del tema dentro: sol a la izquierda, luna a la derecha | «Automático» se mantiene: la app sigue al sistema hasta que se toca el control |
| 6 · Catálogo | Rejilla de tarjetas de cristal con miniatura, precio alineado y acciones al pie | La tabla de nueve columnas desaparece |
| 7 · Tablas en móvil | Tarjetas apiladas con el rótulo de la columna en cada celda | Los rótulos se sacan de la cabecera: ninguna página los repite |
| 8 · Paridad claro/oscuro | Todo con sus dos estilos | Comprobado en las cuatro capturas de `verify:ui` |

### 10.2 · Errores encontrados al implementarlo

| # | Error | Causa | Resolución |
|---|---|---|---|
| BUG-21 | El icono de General salía **vacío** (un cuadrado sin dibujo) | El `body` del icono llevaba los datos del *path* sin el elemento `<path>` | Se envuelve en `<path d='…' />`; el verificador de iconos vacíos lo detectó |
| BUG-22 | El deslizante no se movía de sitio | En `translateX()`, un porcentaje es el ancho del **propio** knob (36 px), no el de la pista | El recorrido es fijo: 260 − 36 − 8 = 216 px |
| BUG-23 | La barra superior quedaba **vacía** a la izquierda en las capturas | El QA no sembraba el nombre del comercio | El seed de `verify:ui` lo siembra ahora y la barra se comprueba |
| BUG-24 | `qa:navegacion` fallaba al pedir un `h1` "General" | La cabecera ahora saluda por el nombre | La comprobación acepta el saludo |

### 10.3 · Lo que sigue pendiente

- Publicación en Product Hunt y redes (falta la cuenta y el copy final).
- La caja del día se abre desde el avatar; si se abre mucho, merece su propio
  acceso en General (hoy está en la lista de arranque de tareas).
---

## 11. Saludo dinámico de la pantalla principal (v1.19.0)

**Fecha:** 2026-10-22 · **Alcance:** el título de la pantalla General.

El saludo dejó de ser un «Hola» seco: ahora se decide por la hora del
dispositivo y por la fecha del calendario, con reglas estrictas y una
prioridad definida.

| Comprobación | Resultado |
|---|---|
| `npm test` (saludo) | 14/14 en `saludo.test.ts` (64/64 en total) |
| `npm run typecheck` | sin errores |
| `npm run qa:navegacion` | 0 fallos (comprueba que el saludo corresponde a la hora y a la fecha de ahora) |
| `npm run verify:ui` | 0 vistas con problemas · 0 errores de consola |

### 11.1 · Las reglas y su prioridad

1. **1–10 de enero** → «Hola, [Nombre], Feliz Año Nuevo !» (anula todo lo demás).
2. **Diciembre**: el 24 y el 25 son obligatorios («Feliz navidad ;)»), el 31
   es de cierre de año («Feliz año nuevo ;)») y en el resto se alterna: los
   días **impares** son festivos y los **pares** recurren a los generales.
3. **Madrugada** (antes de las 06:00) → «te levantaste temprano hoy ;)».
4. El resto del año, por franja: mañana, tarde o noche.

La variante dentro de cada grupo se elige con una semilla estable (el día
del año): el mensaje no cambia al repintar la pantalla ni al navegar, pero
sí varia de un día a otro.

### 11.2 · Dos decisiones que hubo que tomar

- **La madrugada pisa a la franja de la noche.** La especificación define
  «Noche» como 19:00–05:59 y, a la vez, una condición especial por debajo
  de las 06:00. Se resolvió a favor de la condición especial: de 00:00 a
  05:59 siempre se saluda el arranque temprano. Las pruebas lo fijan.
- **En diciembre, los días pares a las 05:00 saludan la madrugada**, porque
  recurren a los saludos generales y la madrugada es una condición especial
  del grupo general. Los días impares, en cambio, muestran el saludo
  nautideño, que es obligatorio.

### 11.3 · Un detalle de coherencia

El segmento activo del control segmentado usaba el azul de Konsta
(`#007AFF`) en vez del de la marca (`#0088ff`). Ahora ambos son el mismo
azul: el control forma parte de la interfaz de BLINK, no de la librería.

## 12. Los botones de acción se veían blancos

El aviso del dueño fue concreto: «Continuar», «Cobrar» y «Aceptar» se veían
blancos. No era un color mal puesto: eran dos defectos sumados sobre el mismo
píxel.

- **El velo de vidrio sobre un relleno de acento.** `--ios-veil` es un degradado
  blanco con 0,62 de alfa arriba. Sobre las superficies neutras es lo que da el
  aspecto de vidrio; sobre el azul de marca (`#0088FF`) lavaba el relleno hasta
  dejar la etiqueta clara en **1,59:1** (3,49:1 sin el velo).
- **`opacity` en el estado deshabilitado.** `.btn:disabled` atenuaba el botón al
  40 %: «Confirmar venta», con el modal de cobro abierto, medía **1,48:1**.

Se resolvió con un token de relleno propio (`--color-accent-solid`) y un velo
apenas perceptible para acentos (`--ios-veil-on-accent`), aplicados a los
controles que llevan etiqueta clara sobre azul: botón primario del POS, botón
primario de las páginas legales, pastilla de cookies, moneda de activación,
glifo del botón central de la barra y punto del asistente. El deshabilitado
pasó a pastilla neutra con texto secundario en vez de `opacity`.

### 12.1 · Cómo se midió, no cómo se leyó

`scripts/sonda-botones.mjs` (expediente de hallazgos) recorta franjas de 6 px
del borde del botón en una captura real y calcula el contraste sobre el color
que está pintado de verdad, con el DOM ya asentado: la transición de color dura
0,2 s y leída a medias devuelve un valor interpolado que no existe. En cada
escena avisa si el relleno salió blanco, si la etiqueta baja de 4,5:1 o si el
componente baja de 3:1 contra su superficie, y distingue los botones que quedan
tapados por el scrim de un modal abierto.

| Medida | Claro | Oscuro |
|---|---|---|
| Etiqueta sobre relleno (antes) | 1,59:1 | lavado, sin medir |
| Etiqueta sobre relleno (después) | **5,02:1** | **4,74:1** |
| Relleno contra la superficie | 5,47–5,59:1 | 3,28–3,95:1 |
| Etiqueta en hover | 5,94:1 | 4,74:1 |
| Deshabilitado | 9,23:1 | 7,03:1 |

En oscuro el hover **no** toca el relleno: oscurecerlo dejaba el botón a 2,75:1
del negro y aclararlo bajaba la etiqueta a 3,76:1. Se expresa con el canto más
luminoso y 1 px de elevación.

### 12.2 · Las paginas publicas pedian un canto, no un color nuevo

Al medir el botón «Crear mi comercio» de las páginas legales y la pastilla
«Aceptar todas», la etiqueta pasó AA (5,87:1 claro, 5,52:1 oscuro) pero en
oscuro el relleno solo separaba **2,61:1** del panel: ese panel es un gris más
claro que el fondo negro del POS. No se tocó el azul —subirlo volvía a romper
la etiqueta—; se añadió `--accent-edge`, un canto interior transparente en claro
y blanco al 30 % en oscuro, que lleva la frontera a **3,93:1**. La moneda de
activación usa el mismo relleno, pero ese tramo de la pantalla solo aparece con
un pedido cripto en pie, así que no se pudo medir en vivo.

### 12.3 · El falso positivo del `rgba(2,103,204,0.88)`

Un botón mostraba un azul con alfa que no aparecía en ninguna regla. Era la
transición de `background-color` pillada en vuelo. La sonda ahora espera siempre
a que el color se asiente antes de leer el estilo computado.

### 12.4 · Un fallo del arnés que tapaba todo lo demás

`qa:apariencia` fallaba 4 de 5 comprobaciones desde antes de este cambio (se
verificó apartando los estilos con `git stash` y repitiendo la ejecución: mismo
resultado). El motivo no era la app: el arnés entraba con `/app/entrar?bypass=1`
y esperaba 1,6 s, pero ese parámetro solo se consume cuando el *chunk* perezoso
de la app ya cargó —en este equipo, con dos núcleos, tarda bastante más—, así
que la navegación siguiente perdía el parámetro, el bypass nunca se armaba y
Ajustes desviaba al login. Ahora el arnés escribe `blink-temp-bypass` en el init
script y espera `.tabs button` en lugar de un tiempo fijo: pasa 5/5.

## 13. Doce bugs de dinero, estado y teclado (caza del 2026-11-17)

El encargo fue abierto —*«busca y corrige y documenta bugs»*—, así que se
programó como una **caza** en lugar de como un feature: barrido de dinero e
impuestos, de estado y persistencia, y de interfaz/teclado. El registro completo
con las líneas de evidencia está en el expediente de hallazgos
(`BLINK_POS_Hallazgos/02_BUGS_P0_P1.md` y `03_BUGS_P2_P3.md`, BLINK-105 a 126).
La regla del barrido: **no se afirma nada que no se haya visto en el navegador**,
y lo que sólo se leyó en el fuente se marca como lectura.

### 13.1 · Los doce que se corrigieron

| ID | Síntoma medido | Regla que se movió |
|---|---|---|
| 105 | El deep link de un código de barras caía a la portada | Las rutas viven bajo `/app`; los tres enlaces de «Crear producto» la usaban |
| 106 | La pantalla y el `checkout` daban Bs distintos | `ticketTotal` + `saleBsFromTotal` son ahora la única suma |
| 107 | Dos cajas en el mismo navegador se pisaban los borradores | `draftsKeyFor` / `activeTabKeyFor` particionan por usuario, con herencia única de la clave vieja |
| 108 | Anular un gasto lo revaluaba a la tasa del día (desvío de Bs 4.423,75) | `payExpense` congela `paidCostUsd` y `paidNative`; la anulación devuelve eso |
| 109 | El abono en Bs no cuadraba con el billete que entró | `CobroAbono.amountInput` viaja hasta el store y descuenta la comisión sobre él |
| 110 | Una `Alert` de Konsta no respondía a la tecla `Esc` que el propio asistente promete | `useCerrarConEscape` en `Modal` y `Alert`, escuchando en `window` |
| 111 | La vista previa del recibo mostraba «$ 0.00 / Bs 0,00» en un producto de precio fijo | La vista consume `precioProducto()`, la etiqueta canónica |
| 112 | Un `costUnit` negativo **acreditaba** dinero en la caja | `Math.max(0, round2(...))` en la línea de compra, en el store |
| 113 | El KPI «Crédito por cobrar» ignoraba los abonos | Se lee de `pendingOutstanding` (saldo neto) |
| 114 | La variación semanal comparaba rangos no contiguos y reventaba con base 0 | `variacion(actual, anterior)` y `rangos` devuelve `[f, t, pf, pt]` |
| 115 | Una comisión negativa en una transferencia sacaba 95 y hacía entrar 100 | `transfer` recorta `amount` y `comm` a 0 |
| 116 | Una comisión negativa invertía el signo de `commission` | `pctComision(pct) = Math.max(0, pct \|\| 0)` en sus cuatro usos |

De los doce, **ocho vivían en el store** (`store.tsx`, `fiscal.ts`, `metrics.ts`).
Es el patrón que se repite lote tras lote: el `<input>` con `min="0"` no protege
nada, porque al estado llegan también el estado persistido de versiones previas,
la importación y una edición a mano.

### 13.2 · Los diez que quedaron abiertos, a propósito

**117–126** están escritos con su `file:line` y su severidad en el expediente, y
ninguno se corrigió por una razón de alcance, no por olvido: tocan RLS o el
modelo de datos (`124` necesita un campo `amountBs` en `Pending`), cambian una
cifra contable que hoy tienen pruebas dando por buena (`117`, el `rate || 1` que
afirma `metrics.test.ts:161`), o son deuda de accesibilidad y de tokens que no
rompen un flujo (`121`, `122`, `123`, `126`). Cada uno dice además si se **midió**
en navegador o si sólo se **leyó** en el fuente — `123` es el único de ese grupo
que salió de medir: con un diálogo abierto el `Tab` seguía alcanzando dos
`role="option"` del fondo.

### 13.3 · La línea base se midió, no se recordó

Con el fix ya commiteado se revirtió `app/src` al commit anterior y se corrió el
mismo instrumento: **1 de 13 escenarios en verde**. Restaurado el árbol,
**13 de 13**. Sin esa reversal las cifras «antes» habrían salido de la memoria de
la primera pasada, que en este proyecto ya falló dos veces (`docs/22-qa-caza-de-bugs.md`).

Dos advertencias honestas que salieron del cotejo: el escenario del `Esc` dentro
de un campo **ya estaba verde antes del fix** (no es mérito de este lote), y en
el KPI de crédito la lectura «antes» fue `(ausente)` porque la etiqueta cambió —
la cifra vieja que se documenta es aritmética de la regla anterior, no una
medición.

### 13.4 · Dos trampas del arnés que daban falsos rojos

- **El arranque pinta un `BrandLoader`.** Los `waitForTimeout` fijos medían
  encima de la pantalla de carga. Todo escenario pasa ahora por un `montado(page)`
  que espera la ausencia de `.brand-loader` y más de 60 caracteres de texto. Con
  esto se revive `sonda-dinero-mvp.mjs`, que llevaba corridos completos en falso
  rojo.
- **El motivo de anulación es un `<input>`, no un `<textarea>`,** y el botón de
  confirmar está `disabled={!voidReason.trim()}`. Un `fill` condicionado al tag
  equivocado dejaba el clic colgando 45 s sin explicar por qué.

Se cortan además las dos redes que pisan la siembra —`ve.dolarapi.com` y
`**/rest/v1/catalogo_global**`— porque el POS re-hidrata la tasa oficial al
arrancar y convertiría una expectativa correcta en un fallo.

### 13.5 · Gates de la docena

`tsc --noEmit` 0 · **vitest 265/265** en 26 ficheros (12 pruebas nuevas en
`app/src/lib/__tests__/verificacion-lote32.test.ts`, ninguna existente retocada
para pasar) · `npm run build` ✓ · `build:pages` + `check:dist` 37 ficheros / 0
coincidencias prohibidas · `docs:check` 146 archivos / 761 enlaces OK ·
`qa:apariencia` 5/5 · `sonda-lote32.mjs` 13/13 (antes: 1/13).

**Commit `2709ba2`. En su momento sin publicar:** el dominio estaba en
`gh-pages@4e5a0e9` y la versión declarada en `app/package.json` en **1.19.0**.
Los lotes 32, 33 y 34 se publicaron juntos el 2026-11-22 (ver §14.12).

## 14. Lote 34: cobro en un paso, vuelto en Bs y el gate de dinero que no medía nada (2026-11-21, v1.19.0)

Encargo del dueño, **16 puntos** («sin romper nada», «usa subagentes y skills, documenta y dime qué cambiaste», «todo esto con SF Symbols»). La parte visible es la mitad: la otra mitad la hicieron los **dos subagentes de auditoría** y los instrumentos, y encontraron dinero mal. El registro con `file:line` está en el expediente (`02_BUGS_P0_P1.md` §décimo bloque, `03_BUGS_P2_P3.md` §P2 lote 34) y las reglas durables en `AGENTS.md` §37.

### 14.1 · Lo que se corrigió por hallazgo, no por encargo

| ID | Síntoma | Regla que se movió |
|---|---|---|
| 138 (P1) | La pantalla decía **Bs 100,00** de vuelto y la venta guardaba **Bs 101,06** | El Bs se acumula **en Bs**; fuera el ida-y-vuelta por USD que redondeaba dos veces (banda real: ±Bs 4,59; Bs 0,50 se registraba como Bs 0,00) |
| 141 (P2) | Cambiar de caja USD a caja en Bs dejaba en «Monto (VES)» el número escrito en dólares | Cambiar de cuenta (o pasar a «A crédito») **limpia** el monto: lo auto-escrito en la otra moneda no es viejo, es incorrecto |
| 142 (P2) | `qa-funcional.mjs` reventaba en la línea 212 y, antes de eso, **medía `{}`** | Sembrar y leer la clave **por usuario** (`blink-pos-state-v3:temp-bypass-user`): la global la app la adopta y la borra |
| 130 (P2) | «Entendido» no quitaba «Lleva BLINK POS contigo» en iOS | Quedar **instalada** es descarte permanente (`blink.pos.instalada`); `standalone` sigue en `false` tras «Añadir a pantalla de inicio» |
| **143 retirado** | Se había anotado «la guía desbordaba por una reserva de 108 px», pero `git show HEAD:app/src/styles/app.css` **no tiene esa regla**: se escribió y se borró dentro del lote | El ID no cuenta como hallazgo. La regla que sí queda: la capa de ayuda (90) se pinta **encima** de la barra (60), así que no se le reserva hueco abajo; el `6rem` que existe es de `.shell__main`, el contenido de la página |
| 144 (P3) | La hoja prometía «44 pt» en un `::before` con `pointer-events: none` | Se borra la regla falsa; el blanco táctil que hace falta crece en su **caja real** |

### 14.2 · El vuelto se prueba sin depender de la tasa

La sección nueva **2b** de `qa-funcional.mjs` no hardcodea ninguna tasa: lee el «monto exacto» que la propia hoja escribe en Bs, entrega `exacto + 100` y comprueba tres cosas que antes nadie comprobaba juntas — que aparezca el bloque, que el titular esté en la moneda entregada y que **el número de pantalla sea el número registrado** (`sales[0].changeBs`). Los dos primeros intentos de esta prueba dieron rojos **por defectos del instrumento**, no del producto: el primero esperaba la tasa del fixture (la app muestra la de `tasa.ts`) y el segundo no capturaba «dólares» porque `(\w+)` sin la bandera `u` no traga vocales acentuadas — ahora es `([^:]+)`.

El tercero dio rojo **por producto** y así salió BLINK-141. Ese es el orden que conviene: un gate nuevo debe fallar por causas distintas antes de que su verde signifique algo.

### 14.3 · Dos trampas del arnés, escritas para que no se repitan

- **React necesita un tick.** `document.querySelector(".userchip--button").click()` y buscar el ítem «Cerrar caja» en el *mismo* `page.evaluate` devuelve «el menú no ofrece Cerrar caja». Con 400 ms entre los dos pasos, el menú está y el arqueo se abre. Es la lección de `qa-navegacion` (lote 29) aplicada al revés: aquí la espera faltaba, no sobraba.
- **El arqueo ya no se conforma con «apareció».** El gate lee `Esperado`, `Contado` y `Diferencia`, exige el `$` pegado a la etiqueta (la frase introductoria del modal termina en «…la diferencia.» y sin el `$` el regex casaba con ella) y comprueba la resta. Medido: esperado 147,50 · contado 100,00 · diferencia −47,50 y pide motivo.

Además, cada fallo del bloque de cobro ahora **vuelca** el diálogo abierto (título + 160 caracteres del cuerpo). Sin eso, tres rojos de este lote se habrían vuelto a leer como «el POS está roto».

### 14.4 · Lo que se descartó con evidencia

Cuatro cosas que señalaron los subagentes y no se tocaron —o se retiraron—: el matiz de descartar-y-reinstalar (BLINK-130 asume que aceptar el prompt es instalarse), el foco que se escapa de `HojaMas` (es BLINK-123, no un agujero nuevo), la palabra «cortesía» en `Receipt.tsx:165/187` y `Historial.tsx:147` — en el ticket impreso y en el historial es **dato contable**; el punto 6 del encargo era la **etiqueta** del chip en Vender, donde quedó solo en el `title` — y **BLINK-143, que se retiró**: se había apuntado como defecto corregido una reserva de `padding-bottom: 108px` en `.ayuda__capa`, y esa regla **nunca estuvo en `HEAD`** (`git show HEAD:app/src/styles/app.css` no la tiene). Era un experimento de este propio lote, escrito y borrado antes de commitear. Contarlo como hallazgo cerrado habría inflado el expediente con un arreglo de algo que nadie publicó. Cada descarte está escrito con su razón en `03_BUGS_P2_P3.md` para que nadie lo proponga de nuevo como hallazgo fresco.

### 14.5 · La guía cabe: la medida real

La afirmación «toda la info cabe según la resolución» se midió en Chromium con una sonda temporal (5 tamaños × 6 rutas, 30 lecturas de `getBoundingClientRect` sobre `.ayuda__tarjeta`, abriendo el cuadro con su propio botón):

| Ventana | Resultado |
|---|---|
| 390×844 · 430×932 · 768×1024 · 1280×900 | **0 px de desborde** en las 6 rutas; el pie «Entendido» a la vista en las 24 |
| 320×568 | Scrollea **dentro** de la tarjeta: 7 px en Inicio, 135 en Inventario, 152 en Ajustes, 263 en Ventas y Finanzas, 279 en Catálogo. El pie sigue a la vista (es pegajoso) y nada se corta por fuera: `fuera arriba 0 / abajo 0`, desborde horizontal 0 |

La red final es `max-height: 100%` con `overflow-y: auto` en la propia tarjeta, así que en 320 px el cuadro no empuja nada fuera de la pantalla; solo se lee en dos partes. Volcado completo en `evidencias/ajuste-guia-lote34-2026-11-21.txt` del expediente.

### 14.6 · Qué era el «difuminado feo»

El punto 16 del encargo («quita ese difuminado que tienen las tabbar, la de Día/Semana/Mes y en Finanzas en Cuentas/Movimientos») **no** era un `backdrop-filter`: Día/Semana/Mes y las pestañas de Finanzas son el mismo componente `Tabs`, y lo que se veía era el degradado de recorte `-webkit-mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent 100%)` que `.tabs` pintaba en su borde derecho para avisar de que había más. Fuera el `mask-image`. El `backdrop-filter` del cristal se queda donde toca (tarjetas y barra flotante). Dos bloques de CSS que apuntaban a `.shell__tabbar` se borraron de paso: la barra flotante se estampa con `.shell__tabbar-float`, así que esas dos reglas no tenían a quién aplicarle.

### 14.7 · Señalamientos del auditor sobre el cobro, fallados con código

Cinco dudas de revisión sobre el flujo de un paso. Ninguna obligó a cambiar el producto, y se deja la prueba de cada fallo:

1. **`Enter` ¿llama a un `addPayment` eliminado?** No. Se quitó el **botón** «Agregar cobro»; la función sigue en `Vender.tsx:655` y la usan el `Enter` del campo (`:1542`) y «Sumar otra cuenta» (`:1621`).
2. **Con la falta en 0, teclear acredita de más.** Es el comportamiento que ya estaba: `vuelto()` (`fiscal.ts:148-156`) es la misma fórmula que había en HEAD (`typed > exactAmount && exactAmount > 0 ? exactAmount : typed`), solo que ahora vive en un sitio. Centralizada, no relajada.
3. **Cantidad tipeada sin tope.** El toque repetido ya llegaba a cualquier número; el límite real es `findStockShortage` dentro de `checkout` (BLINK-076), que rechaza nombrando producto, disponible y pedido.
4. **«A crédito» no borra `payments`.** Es lo correcto: cobrar parte y dejar el resto pendiente es una **venta mixta**, y `store.tsx:1641` la etiqueta «Caja + crédito» con su cuenta por cobrar. Lo que sí se limpia al cambiar es la cuenta y el monto (`Vender.tsx:1503`).
5. **Queda texto de IGTF.** Lo que queda es el **nombre de la categoría del sistema** (`store.tsx:157` «Pago de impuestos (IVA/IGTF)») y el campo histórico `sale.igtf`; `metrics.ts:270` encuentra los asientos ya pagados por esa cadena exacta, así que renombrar huérfana el histórico. El cálculo ya no existe: `store.tsx:1693` guarda `igtf: 0`.

### 14.8 · Cobertura recuperada en un test

Al quitar el IGTF, la prueba de BLINK-106 que comparaba «la fórmula de la pantalla daba Bs 476,55 y la del registro 476,54» perdió su escenario (el céntimo fantasma venía del IGTF) y se reescribió. La versión nueva comprobaba solo que dos caminos coinciden, que es cierto **por construcción** y por tanto no avisaba si la fórmula se movía entera. Se fijó el número absoluto: `expect(totalBs).toBe(458.85)` (harinera de Bs 450 + recargo de $ 0,01 a tasa 884,75), además de las dos relaciones.

### 14.9 · El filtro del «texto cortado» había perdido las imágenes

Al meter los esqueletos de carga, la prueba de «texto cortado» de `qa:responsive` empezó a avisar de falsos positivos: los esqueletos miden más de lo que muestran, así que aparecían como recorte. La primera corrección fue pedirle texto al nodo, y esa era la equivocada: **dejó de medir los `<img>` y los `<svg>`**, que son justo lo que la prueba atrapaba (una imagen con `overflow:hidden` que no cabe es un recorte de verdad). Ahora el predicado es el que corresponde: se salta los nodos **decorativos sin texto**, pero `IMG`, `SVG`, `CANVAS`, `VIDEO`, `PICTURE` e `IFRAME` se miden siempre, tengan o no texto.

El cambio no agregó ningún rojo: `qa:responsive` volvió a salir 0 en las 6 resoluciones. Lo que sigue avisando es solo lo de §14.10.

### 14.10 · Avisos de esta máquina, no del producto

`qa:responsive` sigue avisando **«SF Pro no está en uso: el texto cae en la fuente genérica del sistema»** en las 6 resoluciones. Aquí no hay SF Pro instalado (`fc-list` vacío) y la hoja lo declara con `local()`, así que el aviso es **condición del banco de pruebas**, no un cambio de diseño: en un dispositivo Apple la cara del texto es otra. Se consigna para que nadie lo tome como rojo ni «arregle» la pila de fuentes.

### 14.11 · Gates del lote 34 (todos corridos el 2026-11-21)

`npm run qa` **no sirve tal cual en este banco**: los ocho instrumentos leen
`VERIFY_BASE` y su valor por defecto es el `5173` de Vite, y aquí el servidor de
desarrollo del lote 34 está en el **5199**. La cadena paró en `qa:e2e` con
`net::ERR_CONNECTION_REFUSED` — no es un fallo del POS, es la constante del
entorno. Se corrió el resto con `VERIFY_BASE=http://localhost:5199`:

- `tsc --noEmit` **0** · `vitest run` **287/287** en 27 ficheros.
- `build` ✓ · `build:pages` ✓ (404.html y `.nojekyll`) · `check:dist` **37
  ficheros / 0 coincidencias prohibidas**.
- `qa:e2e` 10 rutas + «doble ejecución (guardar dos veces)» en verde ·
  `qa:funcional` **0 fallos / 0 avisos** · `qa:responsive` 6 resoluciones con
  salida 0 (solo el aviso de fuentes de §14.10) · `qa:apariencia` **5/5** ·
  `qa:navegacion` **0 fallos / 0 avisos** · `qa:preview` **0 fallos / 0 avisos**.
- `docs:check` 146 archivos / 761 enlaces · `sonda-anclas-ayuda` **52 anclas / 0
  sin resolver**.
- Un subagente de solo lectura revisó el **diff completo** del lote buscando
  dinero mal, estados obsoletos del cobro, borrados a medias y reglas CSS muertas.

La cadena entera se **volvió a correr después** de los últimos arreglos (el
filtro de «texto cortado» de §14.9 y el número absoluto del test): los diez
instrumentos volvieron a salir 0, con los mismos números. Informe por escrito de
cada gate en `verify-shots/qa-*-informe.md`.

### 14.12 · Publicación (2026-11-22, con autorización expresa del dueño)

`npm run deploy` desde `main@774cbe1` → **`gh-pages@f2c9d0b`**. Un detalle del
banco: el `deploy` se cortaba en `gh-pages` con **«Identidad del autor
desconocida»** porque esta máquina no tiene `user.name`/`user.email` globales y
la regla del proyecto es **no tocar `git config`**. Se resolvió con variables
del proceso —`GIT_AUTHOR_NAME`/`GIT_AUTHOR_EMAIL` y `GIT_COMMITTER_*` con la
identidad BLINK—, que `git` lee sin escribir configuración.

Lo que se verificó **después** de publicar, sobre el dominio real:

- La raíz sirve la entrada **`assets/index-CEYaPxaS.js`**, la misma que acaba de
  producir el build local; el fichero responde **200**.
- Barrido de los **28 `assets/*.js` publicados por HTTPS**: `blink-temp-bypass`
  en **0** de ellos (y 0 en el árbol de la rama). `verifica-prod.sh`: 31 assets
  en 3 pasadas, con las marcas de registro y confirmación **presentes**.
- `humo-prod.mjs` **en verde** en Chromium: portada, `/app/registro`,
  `/app/entrar`, `/app/recuperar`, `/app/confirmar` y `/app/inicio` →
  `/app/entrar` (la guarda sin sesión), también a 390 px, **0 errores de
  consola**.
- El `?bypass=1` en producción **no entra**: cae en `/app/entrar`. Es la
  comprobación de BLINK-057 sobre lo publicado, no sobre el build.
- Códigos del lote 34 localizados en los chunks servidos: `Cuenta vacía`,
  `Sumar otra cuenta`, `Vuelto a entregar`, `Más opciones`, `hoja-nav__lista`,
  `brand-loader__spinner`, `esqueleto`, `ayuda__tarjeta`,
  `blink.pos.instalada` y `Lleva Blink POS contigo`.

**Y una sonda que mentía por culpa del banco:** `humo-prod.mjs` daba
`net::ERR_INVALID_AUTH_CREDENTIALS` en toda ruta externa porque este equipo sale
a internet por un proxy que pide credenciales en `HTTP_PROXY`. `curl` las lee;
Chromium no las toma del entorno. La sonda ahora arma el `proxy` de Playwright a
partir de esas variables (usuario y contraseña **nunca** se imprimen) con
`bypass: localhost;127.0.0.1`. Sin eso, el humo de producción parecía decir que
el POS estaba caído.

La versión declarada sigue en **1.19.0**: el bump a 1.20.0 es decisión del dueño
y exigiría reconstruir y volver a publicar.

## 15. Lote 35: los formularios dejan de colapsar (2026-11-22, v1.19.0)

Encargo: jerarquizar el relleno de producto y sus hermanos, sin que los campos
colapsen ni se descompagine el diálogo. Se midió antes de tocar, se corrigió en la
capa de la regla y se volvió a medir con el mismo instrumento.

### 15.1 Medición, no opinión

La sonda (`sonda-v2.mjs`, fuera del repo) recorre las 9 escenas de diálogo en 1280×900
y 390×844, pre-calienta cada ruta para que Vite transforme los chunks y sondea el
gatillo en vez de dormir. Sus números fueron la guía del arreglo:

- Grupo con `display: contents`: `width: 0`, o sea ninguna caja propia. El `select` de
  IVA a **31 px** y costo/precio a **48 px**.
- Cuerpo del diálogo a **1327 px** dentro de un `.modal` que también scrolleaba;
  «Guardar cambios» en `top: 1397`.
- Casillas de **13×13 px** con la etiqueta fuera del área pulsable.

Después del arreglo: **177 px**, **397 px**, blanco de toque de **44 px**, botón en
`top: 772` dentro de un pie que no scrollea, y `visibleSinScroll: true` en las 8 escenas
de escritorio y en las de móvil. El diálogo de producto conserva 1814 px de contenido
sobre 619 visibles: sigue scrolleando, ahora con cabecera y pie fijos.

### 15.2 Dos rojos que no son de este producto

`qa:funcional` (5 fallos) y `qa:navegacion` (salida 2) se cayeron igual **antes** del
lote. La prueba no fue lectura ni intuición: se montó un worktree en `main@8563808`,
se le enlazó el `.env` y se corrió el mismo gate contra ese servidor. Los 5 fallos
salieron con la misma firma, `diff` vacío. Lo que falla es la salida a internet del
navegador: el equipo navega por un proxy con credenciales que Chromium no toma del
entorno, la tasa BCV no llega y el POS se queda en «Sin tasa». `qa-funcional.mjs` no
intercepta ninguna de las dos redes que §13.4 dice que hay que cortar, y
`qa-navegacion.mjs` agota los 45 s del login real antes de probar el `?bypass=1`.
Queda anotado como BLINK-147 en el expediente; arreglarlo es un lote de herramienta, no
de formulario.

Lo que `qa:navegacion` iba a decir de móvil se midió por bypass: `tabbar` de 6
elementos, Vender en el centro exacto (195 px sobre 390, desvío 0), 47–48 px de alto por
control y cero scroll horizontal.

### 15.3 La trampa del conteo de caracteres

Un gate de montado que exige `innerText.length > 120` se satisface con la barra lateral
sola: sus 148 caracteres bastan. La medición entonces ocurre sobre una SPA a medio
pintar y reporta «páginas en blanco» que no existen. Es la misma familia que los
`waitForTimeout` encima del `BrandLoader` de §13.4. El gate correcto busca un marcador
de contenido (`h1`, `.page-head`, `.modal`, `.k-sheet`) y, si se mide texto, que sea
texto de la vista. Con ese cambio las 7 rutas monta y se compró: Catálogo 394
caracteres y su `h1`, Finanzas 664 con 2 filas, Contactos 314 con 1, Inventario 520 con
2, Vender 1227, Créditos 450, Informes 1226.

### 15.4 Gates de la tanda

`tsc --noEmit` 0 · vitest 287/287 en 27 ficheros · `build` ✓ · `build:pages` ✓ ·
`check:dist` 37 ficheros / 0 coincidencias prohibidas · `docs:check` 146 / 761 ✓ ·
`qa:e2e` 0 fallos / 0 avisos · `qa:apariencia` 5/5 · `qa:responsive` 0 fallos / 6 avisos
de fuente · `qa:preview` 0/0 · `qa:carga` ✓ · `qa:funcional` y `qa:navegacion` rojos por
red, iguales en `HEAD` · `qa:seed` y `qa:cuenta` no corridos (escriben en producción y
mandan correo).
