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
