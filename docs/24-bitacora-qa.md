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
