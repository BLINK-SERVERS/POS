# Historial de versiones · BLINK POS

Esquema de versiones (SemVer adaptado):

- **MAJOR** (`1.x.x` → `2.0.0`): cambios grandes (fases completas, rediseños, migraciones de datos).
- **MINOR** (`1.0.x` → `1.1.0`): cambios medianos (módulos nuevos, funciones nuevas visibles).
- **PATCH** (`1.0.0` → `1.0.1`): cambios menores y correcciones de bugs.

La versión se declara **una sola vez** en `app/package.json` y Vite la inyecta en el
bundle (`__APP_VERSION__`). **No se muestra en la interfaz**: es un requisito
del producto, no una omisión (ver BUG-12 en
[`docs/22-qa-caza-de-bugs.md`](docs/22-qa-caza-de-bugs.md)).

---

## [1.18.0] · 2026-10-22

**Rediseño de la interfaz: barra superior, saludo, selector de periodo, deslizante de apariencia, catálogo de tarjetas y tablas en móvil.**

### Botón de Inicio

- Los cuatro cuadrados del icono de General son **macizos**, con el radio
  suave de Apple. El de SF Symbols es un contorno y no se puede modificar
  (su licencia), así que el icono es un dibujo propio de la marca:
  `lib/iconos-blink.ts` (`grid2x2.solid`), registrado en el mismo
  diccionario que los SF Symbols.

### Barra superior

- Se retiran el **botón de escáner** y el **acceso de caja**. La barra queda
  limpia: nombre del comercio a la izquierda (peso medio), tasa del día y
  avatar a la derecha.
- La caja del día se abre desde el **menú del avatar** («Abrir caja» /
  «Cerrar caja»), que es donde ya viven la cuenta y los ajustes.
- La tasa se muestra con **dos decimales exactos** (`Bs 884,75`); el cálculo
  de dinero sigue con la precisión completa (hasta cuatro decimales).
- **Paridad en oscuro**: la barra y las páginas comparten exactamente el
  mismo fondo (`--color-bg-primary`, negro de marca) y el borde de la barra
  desaparece en oscuro. Antes la barra era una superficie `#1a1a1a` sobre un
  lienzo negro: un parche visible.

### Cabecera del panel

- El saludo es directo: **«Hola, [Nombre] [Apellido]»**, con el subtítulo
  «Así va tu negocio». Sin nombre de usuario, «Hola».

### Selector de periodo

- El resumen general tiene **Día, Semana y Mes**. Se retira **Año**: los
  informes anuales se consultan en Informes.
- La semana va de **lunes a domingo** (`weekRange` y `prevWeekRange` en
  `lib/metrics.ts`).
- Sigue siendo el control segmentado nativo de Konsta (iOS UI Kit), con su
  indicador deslizante.

### Deslizante de apariencia

- El selector de tema es un **control deslizante** (HIG · Sliders): un knob
  que se desplaza y lleva dentro el icono del tema en vigor —**sol** a la
  izquierda, **luna** a la derecha. Se puede tocar o arrastrar.
- «Automático» sigue disponible: la app sigue al sistema hasta que se toca
  el control.

### Catálogo de productos

- La tabla de nueve columnas pasa a una **rejilla de tarjetas** de cristal:
  miniatura con las iniciales sobre un tinte estable, nombre, marca y
  categoría, **precio alineado a la derecha** con su equivalente en
  bolivares, margen, estado y acciones al pie.

### Tablas en móvil

- Las tablas se convierten en **tarjetas apiladas** sin scroll lateral: cada
  celda lleva el rótulo de su columna a la izquierda y el valor a la
  derecha. Los rótulos se sacan de la propia cabecera, así que ninguna
  página los repite (`DataTable` los inyecta como `data-label`).

### Paridad claro/oscuro

- Todo lo anterior está desarrollado con sus dos estilos: el deslizante
  cambia de icono, la barra funde con el lienzo, las tarjetas de producto
  usan el mismo material en las dos apariencias y las tablas en móvil
  comparten la retícula.

### QA

- `qa:navegacion` incorpora 20 comprobaciones nuevas: barra superior
  (nombre, peso, tasa, sin escáner, sin caja, mismo fondo que la página),
  selector de periodo (exactamente Día/Semana/Mes), catálogo (tarjetas,
  miniatura, radio, precio, cristal, rejilla) y tablas en móvil (rótulos en
  todas las celdas y sin scroll horizontal).
- `qa:apariencia` se adaptó al deslizante. `verify:ui` siembra ya el
  nombre del comercio, para que la barra se pueda comprobar.

---
## [1.17.0] · 2026-10-22

**Liquid Glass en el modo oscuro, fondos planos y correcciones de diseño.**

### Liquid Glass en los botones (modo oscuro)

- El material de cristal **ya no se ve plano en oscuro**. El velo (`--ios-veil`),
  el brillo especular (`--ios-specular`) y el canto interior (`--ios-rim`, nuevo)
  suben en la aparición oscura, y el desenfoque pasa de 6 px a **15 px**, que es
  el radio real del material "Dark/Regular" del UI Kit (`--ios-blur`).
- El botón primario, el secundario de la landing, las insignias y las píldoras
  llevan ese material: velo + desenfoque + especular + canto.
- Los tokens siguen a `color-scheme`, así que el modo elegido a mano en
  Ajustes también se respeta (no es una consulta de medios).

### Fondos planos

- La página **General** deja de llevar la aurora de acento: el fondo es un
  color plano (`--color-bg-primary`) en las dos apariencias. El relieve lo
  dan las tarjetas de cristal, no un halo detrás.

### Correcciones de diseño

- **BUG-16**: en la aparición oscura, el texto de los botones primarios salía
  **negro sobre el azul** (el token de texto inverso se invierte con el modo).
  Nuevo token `--color-text-on-accent`, siempre claro, en el botón primario,
  el avatar, el punto de la lista de pasos y los botones de la landing.
- **BUG-17**: el texto de los botones tintados, de las insignias de acento y
  de las píldoras de variación **no llegaba a 4,5:1** (el azul de la marca sobre
  su propio velo daba 2,9:1 en oscuro y 3,3:1 en claro). Nuevos tokens
  `--color-accent-text`, `--color-success-text` y `--color-danger-text`.
- **BUG-18**: el botón de **cobrar** quedaba cortado por abajo en la pantalla
  de venta: el pie del ticket se encogía. Ahora el pie no encoge, la lista de
  líneas es la que se desplaza, y la página del POS ocupa el alto que deja la
  cabecera.
- **BUG-19**: en móvil, el botón del estado vacío ("Ir al Catálogo") se
  solapaba con la cabecera del ticket: la página del POS estaba comprimida
  al alto de la pantalla en una sola columna. En una columna vuelve a su alto
  natural.
- **BUG-20**: el gráfico de ventas con los doce meses a cero era un hueco
  vacío con los nombres de los meses. Ahora se dice que no hay ventas.
- La barra de pestañas de Konsta y los scripts de QA se han revisado; el
  contador de `qa:apariencia` ya no llama "avisos" a las comprobaciones
  correctas.

### QA

- `npm run verify:ui`: 0 vistas con problemas, 0 errores de consola (las
  capturas de `verify-shots/` incluyen las cuatro combinaciones de tamaño y
  apariencia).
- `npm run qa:apariencia`: 0 fallos. `npm run qa:responsive`: 0 fallos.
- `npm test`: 50/50. `npm run typecheck`: sin errores.

---

## [1.16.0] · 2026-10-21

**Vista previa (Open Graph) e iconos institucionales.**

- El lema oficial de la marca, «Vende en un parpadeo, factura con BLINK ;)»,
  es el que llevan `og:title`, `og:description`, `twitter:title`, la
  descripción de la página y el manifiesto.
- `og-image.png` se regenera: 1200×630 px (la proporción que piden WhatsApp,
  Telegram, X, LinkedIn y Slack), con el mockup del POS, el móvil escaneando y
  tarjetas de cristal, en la paleta oficial (`#0088ff`, verde `#34c759`).
- A partir del fichero institucional se generan `favicon.png` (32 px),
  `icon.png` (512 px), `favicon.ico` (16/32/48) y el juego del manifiesto.
- El `favicon.svg` se reconstruyó midiendo el PNG (radio 80/512, ojo píldora
  150×75 en 55/182, ojo circular r=75 en 381/181, boca de semidisco r=81 en
  175/324).
- Se añaden `og:image:type`, `og:image:alt` y `twitter:image:alt`.

### Correcciones

- **BUG-12**: `npm run og` fallaba (leía las fuentes de Apple que se
  eliminaron de `public/` en la v1.5.0) y la imagen que seguía en producción
  era de una versión anterior, con el indigo del clon.
- **BUG-13**: los iconos de la app no tenían versión raster institucional.

---

## [1.15.0] · 2026-10-21

**General, el command center del comercio (bento de cristal).**

- La sección «Inicio» pasa a llamarse «General» en móvil y escritorio (la
  ruta `/app/inicio` se mantiene; `/app/general` funciona como alias).
- Bento de tarjetas translucidas: 4 columnas en escritorio, 2 en tablet y
  móvil, con `backdrop-filter: blur(20px)`, borde de 1 px y radio de 22 px.
- Cuatro métricas con su variación frente al periodo equivalente anterior
  (selector Hoy/Mes/Año): Ventas totales, Órdenes pagadas, Ticket promedio y
  Margen bruto, con pastilla verde/roja.
- Gráfico de ventas por mes (12 meses) interactivo: cada barra es un botón y
  una tarjeta flotante de cristal muestra el detalle exacto del mes elegido.
- Cifras en SF Pro Display con `tabular-nums`; etiquetas en SF Pro Text.
- Iconos nuevos: `arrowUp`, `arrowDown` y `trendUp`.

### Correcciones

- **BUG-10**: `growth()` devolvía `null` sin base de comparación; con el
  comercio recién abierto se mostraba «+100,0 %» por una división por cero.

---

## [1.14.0] · 2026-10-21

**Navegación móvil sin hamburguesa, con barra inferior flotante.**

- Barra inferior flotante (Liquid Glass) con distribución 2 + 1 + 2: General y
  Catálogo a la izquierda, la acción principal (Vender) en el centro exacto
  (desvío de 0,00 px) con el símbolo de dólar en un círculo de acento, e
  Inventario y Finanzas a la derecha (simetría lateral de 72,7 vs 72,7 px).
- Cinco elementos con icono y etiqueta (el límite de la HIG). Los módulos que
  no caben se alcanzan desde General, que hace de panel.
- Se eliminan el botón y el panel lateral en móvil: la cuenta, los ajustes y
  el cierre de sesión pasan al menú del avatar, y el botón de caja se queda
  solo con el icono.
- Iconografía por módulo desde una sola fuente (`lib/modulos.ts`).

---

## [1.13.0] · 2026-10-21

**Landing tipo Apple con Liquid Glass y una sola pila tipográfica.**

- Estructura al estilo de las páginas de producto de Apple: portada, tres
  momentos (una idea por bloque con su visual), cifras, capacidades, un único
  plan de precio, preguntas frecuentes, cierre y pie. Redacción corta y en
  afirmativo, sin superlativos.
- Liquid Glass en la capa funcional (barra, fichas, precio, cierre), resuelto
  en CSS con los tokens del proyecto; con «reducir transparencia» el material
  se sustituye por un relleno plano.
- Páginas legales rehechas: cabecera con llamada a la acción, texto de entrada
  como bloque de cristal, separadores finos y columna de lectura centrada.

### Correcciones de raíz

- **BUG-06**: `light-dark()` anidado en `rgb()` es inválido en Chrome y hacía
  que toda la capa translucida no se pintara. Los tokens guardan ahora el
  color y la transparencia se compone con color relativo.
- **BUG-07**: media app se dibujaba con la tipografía del sistema porque los
  pesos 800-900 no tenían `@font-face`. Una sola pila en toda la app.

---
## [1.12.0] · 2026-10-21

**Modo oscuro con la paleta oficial BLINK + optimización de la carga (la landing baja un 66 %).**

### Modo oscuro

- **Las dos apariencias** (claro y oscuro) con una sola paleta de marca. Los
  valores de cada modo salen del **UI Kit oficial de iOS 27** y de la
  **paleta oficial BLINK**:
  - Fondo `#000000` · superficie `#1a1a1a` (materiales *Dark/Regular* del kit)
  - Texto `#FFFFFF` · secundario `#EBEBF5` (`IOS_LABELS.dark`)
  - Acento `#0091FF` (`IOS_SYSTEM_COLORS.blue.dark`)
- **Paleta oficial aplicada**: los diez grupos de color con su par claro/oscuro
  (rojo, carmesí, naranja, amarillo, verde, turquesa, azul/celeste, índigo,
  magenta, marrón). El acento pasa a ser el **Azul Principal** `#0088FF` /
  `#0091FF` y los estados semánticos usan los colores del sistema
  (verde `#34C759`/`#30D158`, rojo `#FF383C`/`#FF4245`, amarillo
  `#FFCC00`/`#FFD600`).
- **Un solo mecanismo**: `color-scheme` en `<html>`. Los tokens se declaran
  con `light-dark(claro, oscuro)`, asi que la paleta no se duplica. El
  aparecimiento se elige en **Ajustes › Apariencia** (Automático / Claro /
  Oscuro) y se recuerda en el dispositivo.
- **Sin destello**: un script en linea de `index.html` aplica la apariencia
  antes del primer pintado, y el `theme-color` de la barra del navegador
  sigue a la apariencia.
- **Konsta** recibe `dark={esOscuro}`: sus variantes oscuras (que se activan
  con la clase `dark`) también siguen la preferencia.
- **Los colores fijos** del CSS (64 valores) se han tokenizado con canales RGB
  (`rgb(var(--tinta-rgb) / …)`) para que se adapten al modo.
- La **maqueta del producto** de la landing es una ilustración: mantiene su
  aspecto en los dos modos (HIG · Dark Mode: *"if an asset looks good in only
  one mode, modify the asset"*).
- Se reconstructye el verificador de UI: **matriz de 2 tamanos × 2
  apariencias** (76 comprobaciones) que además verifica que la apariencia se
  aplicó de verdad y que el **contraste texto/fondo ≥ 4.5:1** (HIG).
- Nuevo `npm run qa:apariencia`: comprueba el cambio manual, la clase
  `dark` de Konsta, la persistencia y la vuelta a "Automático".

### Rendimiento de carga

- **La landing deja de arrastrar la aplicación**: el chunk principal solo trae
  el router y la landing; el store, Supabase, Konsta y el CSS del POS se
  cargan **bajo demanda** (`AppInterna`).
- **Los iconos se parten en dos**: la landing usa 13 (`sf-nucleo.ts`) y la
  aplicación los 100. El chunk principal pasa de 185 KB a 22 KB.
- **Las coordenadas de los SF Symbols se redondean** a 3 decimales (el repo
  las trae con 11): el set pesa un 35 % menos sin diferencia visible.
- **El CSS se separa**: `base.css` (reset, iconos, utilidades) para todas las
  páginas y `app.css` solo con la aplicación. El CSS de Konsta se poda
  (`@source` limitado a los 9 componentes que se usan).
- **La landing pasa de 1.100 KB a 369 KB** de descarga inicial (−66 %).
- Nuevo `npm run qa:carga`: mide peticiones, bytes transferidos, FCP y LCP
  contra el build de producción.

### Correcciones

- La siembra del catálogo global (migración `0004`) **no estaba aplicada en
  producción** en una entrega anterior: la tabla no existia.
- El recorte de `@source` de Konsta dejaba fuera `konsta/shared/colors`, de
  donde sale `bg-primary`: **el estado activo de los controles segmentados
  se quedaba sin pintar**. Ahora la fuente está incluida.

---

## [1.11.0] · 2026-10-21

**Batería de QA automatizada: entorno de pruebas sembrado en Supabase, stress test de todos los botones, pruebas funcionales de negocio y matriz de responsividad.**

### Entorno de pruebas

- **Comercio ficticio real en Supabase**, sembrado con `npm run qa:seed`:
  usuario `qa.blink@tienda.local` (propietario) con **el correo ya
  confirmado** — sin correo de verificación ni pasarela de pago.
- **24 fichas en el catálogo global** (EAN-13 con dígito de control
  válido) **importadas al catálogo privado** de la tienda, más contactos,
  cuentas, ventas, pendientes en sus tres estados, gastos, movimientos de
  inventario y caja abierta.
- La siembra es **idempotente** y escribe el `AppState` completo en
  `businesses.data` (que es lo que la app hidrata) además de reflejar las
  filas en las tablas normalizadas.

### Herramientas nuevas

| Script | Qué hace |
|---|---|
| `npm run qa:seed` | Siembra el entorno de pruebas en Supabase |
| `npm run qa:e2e` | Stress test: pulsa los 93 botones de 10 vistas y comprueba respuesta, diálogos, foco y doble ejecución |
| `npm run qa:funcional` | Flujos con efecto real: ticket, IVA, venta, compra, abono y arqueo |
| `npm run qa:responsive` | 6 resoluciones × 6 vistas: scroll, recorte, tabla→tarjeta y caída de la tipografía |
| `npm run qa` | Batería completa: tipos, tests, las tres auditorías y documentación |

### Bugs resueltos

- **La migración del catálogo global nunca se aplicó en producción**:
  la tabla `catalogo_global` no existía y la función de búsqueda del
  catálogo fallaba en silencio. Migración aplicada (aditiva e idempotente).
- **El foco se perdía al cerrar cualquier diálogo** (40 casos): ahora
  vuelve al control que lo abrió.
- **El verificador contaba el 404 del *fallback SPA* de GitHub Pages** como
  error de consola: se distingue del 404 de un recurso real, de modo que la
  comprobación contra producción es fiable.
- **La siembra silenciaba los errores de SQL** (la API de gestión de
  Supabase responde 200 con `{message}`): ahora se lanzan.

Detalle en [`docs/24-bitacora-qa.md`](docs/24-bitacora-qa.md).

### Verificación

```
typecheck      sin errores
tests          50/50
migraciones    todas pasan
verify:ui      38/38 · 0 errores de consola · 0 iconos vacíos · 0 desbordes
qa:e2e         93 botones · 0 fallos
qa:funcional   8/8
qa:responsive  36 combinaciones · 0 fallos · SF Pro en uso
docs:check     319 Markdown · 2.683 enlaces · 0 rotos
```

## [1.10.0] · 2026-10-21

**Estandarización visual y funcional: SF Pro, Liquid Glass en los botones, iconografía, armonización móvil y diálogos nativos de Apple.**

Todo lo que sigue sale de la **HIG alojada en el repo** (`docs/HIG/`, 85 páginas)
y del **UI Kit oficial de iOS 27** (`docs/ios27-geometry.json`, 1.657
componentes). No se ha inventado ningún valor: las medidas vienen del kit.

### 1 · SF Pro en todos los dispositivos

- `app/src/styles/fonts.css` pasa de ser un comentario a ser la
  implementación real: **`@font-face` con `local()`** para SF Pro (Regular,
  Semibold, Bold e Italic) y SF Mono. Se le pide la fuente **al sistema**: en
  iPhone, iPad y Mac sale de serie; en Windows y Linux se usa si el usuario la
  instala (gratis, en `developer.apple.com/fonts`, el mismo enlace que da la
  HIG).
- Se declara la variante **variable** con su eje óptico (`opsz`), de modo que
  el navegador interpola entre los tamaños ópticos Display y Text
  (HIG · Typography: *"the system fonts support dynamic optical sizes"*).
- Tres tokens de familia: `--font-display` (≥ 20 px, títulos), `--font-text`
  (cuerpo) y `--font-mono` (cifras monoespaciadas). SF Pro y SF Mono son
  **nombres de familia reales**: se han leído de la tabla `name` de los
  ficheros oficiales (`.SF NS Text`, `.SF NS Display`).
- Cifras tabulares (`font-variant-numeric: tabular-nums`) en importes, KPIs y
  totales, para que las columnas queden alineadas.
- **Los ficheros de la fuente NO se distribuyen** (la licencia de Apple no lo
  permite en un sitio público: en la v1.5.0 se retiraron del repo). Para
  trabajar con la tipografía definitiva, en **desarrollo** sí se sirven desde
  `app/.fonts-sf-local/` (un middleware propio de Vite, `apply: "serve"`) y
  `fonts-dev.css` se carga solo si `import.meta.env.DEV`. En producción no se
  sirven.

### 2 · Botones con la estética Liquid Glass

- Se adopta el **material "regular" de Liquid Glass** del kit (blur 6 px) con
  el **brillo especular** del borde superior (`inset 0 1px 0`) y el degradado
  vertical del material.
- **Medidas reales del kit**: Large **50 px**, Medium **34 px**, Small
  **28 px** (antes 44 / 36 / —).
- **Forma según la HIG**: cápsula en fila horizontal (curvatura continua) y
  rectángulo redondeado de 12 px en pila vertical.
- **Roles de la HIG** respetados: Normal, Primary (acento), Cancel y
  Destructive (rojo). El estado de pulsación hunde el botón y apaga el
  especular.
- **Área táctil de 44 pt** garantizada en punteros gruesos, aunque el botón
  visualmente mida 28 o 34 px.
- `prefers-reduced-transparency` desactiva el material y deja rellenos planos.
- Los **datos** (tablas, precios, stock) siguen siendo **100 % opacos**: el
  material se aplica solo a controles, nunca a la capa de contenido
  (HIG · Materials: *"Don't use Liquid Glass in the content layer"*).

### 3 · Auditoría de iconografía

- Se recorrieron los **137 botones** de la app: 86 sin icono, 51 con icono.
- El set de SF Symbols pasa de **86 a 100** iconos (14 nuevos verificados en
  el repo de origen): `refresh`, `transfer`, `importData`, `exportData`,
  `copy`, `folder`, `adjust`, `listView`, `more`, `dollars`, `tray`, `grid2x2`,
  `userPlus`, `seal`.
- **76 botones** reciben icono, siguiendo la HIG (*"Try to associate familiar
  actions with familiar icons"*). Donde el rótulo ya lo dice (Entrar, Crear
  mi comercio) se deja solo el texto, como hace iOS.
- Las **acciones de fila** pasan a botón de solo icono (HIG · Buttons,
  *"Square buttons"*), con `title` y `aria-label`: la columna de acciones deja
  de empujar la tabla y los datos ya no se cortan.

### 4 · Armonización móvil

- Respeto de las **safe areas** en la barra de navegación y al final del
  scroll.
- Títulos a **Title 1 (28 px)**; KPIs en una sola columna con separadores
  hairline; celda de acciones de fila a su propia línea.
- Área táctil de 44 pt en botones medianos, pequeños y de acción de fila.

### 5 · Diálogos y formularios nativos

- Los formularios modales se presentan como **hoja inferior** en móvil
  (`<Sheet>` de Konsta, con tirador) y como **panel centrado** en escritorio.
- Las confirmaciones usan la **alerta nativa** (`<Dialog>` de Konsta, con el
  material de Apple): título corto, mensaje y botones con rol Primary,
  Cancel y Destructive. Ya **no queda ningún `window.confirm`**.
- Nueva `useConfirm()` con alerta nativa para las **acciones destructivas**
  (eliminar producto, descuento, recargo, categoría, contacto, gasto
  recurrente, y borrar todos los datos).
- Los **campos consecutivos** de un formulario se agrupan en una **lista
  agrupada** de iOS (contenedor redondeado + separadores hairline): 44 grupos
  en 11 ficheros.

### 6 · Verificación

- `npm run verify:ui` comprueba ahora, en escritorio **y** móvil, las 15
  rutas, el **onboarding**, el **acceso sin sesión** y la **presentación del
  modal** (hoja inferior en móvil / panel centrado en escritorio):
  **38 comprobaciones**, 0 errores de consola, 0 iconos vacíos, 0 desbordes.
- `app/package.json` → `1.10.0`.

## [1.9.0] · 2026-10-21

**Rediseño completo de la aplicación al lenguaje visual de iOS 27.**

Todo el POS (shell, navegación, tablas, formularios, tarjetas, ticket, estados
vacíos y pantallas de acceso) pasa del patrón de *aplicación web* al de
**iOS 27**. La landing no se toca: ya estaba en el lenguaje correcto.

### El shell pasa a ser un lienzo flotante (iPadOS 27)

- La **sidebar** deja de ser una columna con una línea vertical a la derecha:
  ahora es un **panel flotante** redondeado (radio 18 px) con sombra propia,
  separado del contenido por un margen. En móvil sigue siendo un drawer, pero
  también flotante.
- El **contenido** es otro panel flotante, y la **barra de navegación vive
  dentro** de él: así la barra y las páginas comparten bordes redondeados y el
  hairline no se escapa de la esquina.
- Los **items de la sidebar** miden 44 px (medida oficial del UI Kit) y llevan
  el icono dentro de una *well* redondeada que se rellena de azul cuando el
  item está activo.
- Las acciones de la barra de navegación son **texto plano en acento**, como
  las de una barra de navegación de iOS (nada de píldoras).

### Tipografía y superficies

- El título de cada pantalla pasa a **Large Title de iOS** (34 px, leading 41);
  en pantallas compactas, Title 1 (28 px).
- Las **tarjetas** pierden el marco de 1 px: la jerarquía se construye con
  sombra (elevación), no con bordes, como en iOS.
- Los **campos** adoptan el estilo *filled* de iOS: relleno suave derivado del
  color de texto, radio de 10 px, foco con anillo de acento.
- Los **botones** pasan de píldora a radio de 12 px, con la familia real de
  iOS: relleno (acento), gris, tintado de acento, texto plano y destructivo.
- Las **tablas** dejan de estrujar las cifras: los datos no se parten y, si no
  caben, la tabla se desplaza en horizontal. La cabecera pierde la banda gris
  y las mayúsculas.
- Las **acciones de fila** son botones de texto plano (acento), no píldoras.
- Los **KPIs** son un único grupo con celdas separadas por hairline, con la
  etiqueta en *footnote* secondary y el dato en *Title 2*.
- Los **estados vacíos** tienen icono en un círculo tintado, título y texto:
  se eliminó el marco discontinuo.

### Pantallas de acceso

- Login, registro, recuperación y **onboarding** se rehacen como superficies
  flotantes (marca + caja del formulario), con campos *filled* y CTA de azul
  relleno.
- El **escáner** remoto recibe la misma tarjeta flotante en su estado "caja no
  vinculada".

### Bugs corregidos

- **Choque de clases `.pos`**: el logotipo "BLINK **POS**" usaba `class="pos"`,
  que es la del grid del POS (`height: calc(100vh - …)`). El logotipo crecía
  hasta **740 px de alto** y empujaba el resto de la columna de marca fuera de
  la pantalla. Las clases internas del wordmark pasan a `wordmark__blink` /
  `wordmark__pos`.
- **Control segmentado recortado**: Konsta lo centra (`justify-center`) y lo
  recorta (`overflow-hidden`), así que con muchas pestañas (Finanzas tiene 9) la
  primera quedaba fuera de la vista. Ahora el control se desplaza en
  horizontal, con un degradado que avisa de que hay más.

### Verificación

- `npm run verify:ui` **verifica ahora dos tamaños** (escritorio 1280×860 y
  móvil 390×844), 15 rutas en cada uno, más el onboarding y las pantallas de
  acceso **sin sesión** (antes nunca se veían: el gate de ruta devolvía al
  Inicio). Total: 34 comprobaciones, 0 errores de consola, 0 iconos vacíos,
  0 desbordes.
- El verificador detecta además **elementos con poco texto pero mucha altura**
  (el síntoma del choque de clases) y **elementos que se salen por la derecha**.
- `app/package.json` → `1.9.0`.

## [1.8.3] · 2026-10-21

**Documentación completa del proyecto + métricas reales de iOS 27.**

- **Geometría oficial de iOS 27 extraída del UI Kit** — se procesó el bundle
  `.sketch` con 7-Zip y se leyeron los `symbolMaster` de 21 páginas: **1.657
  componentes** con su tamaño, estilos de capa y textos.
  - La clase correcta en Sketch es `symbolMaster` (no `artboard`), y `7z e`
    aplana la ruta: el JSON de página cae en la raíz del destino, no en `pages/`.
  - Resultado en [`docs/ios27-geometry.json`](docs/ios27-geometry.json) y
    sintetizado en [`docs/IOS27_METRICAS_COMPONENTES.md`](docs/IOS27_METRICAS_COMPONENTES.md).
- **Métricas aplicadas al CSS** (`app/src/styles/app.css`): fila de lista
  **52 px** (medida oficial), campo de texto **52 px**, toggle **64 × 28**,
  stepper **46 × 32** y área táctil de la tab bar **48 × 48**.
- **Versión de la aplicación actualizada a `1.8.3`** en `app/package.json`
  (fuente única; Vite la inyecta como `__APP_VERSION__`). **No se muestra en la
  interfaz**, por requisito del producto (BUG-12).
- **Documentación reorganizada:**
  - Nuevo índice maestro [`docs/INDEX.md`](docs/INDEX.md).
  - `README.md` reescrito por completo (antes describía la v1.1.2, 26 pruebas,
    la URL `blink-servers.github.io/POS/` y `base: /POS/`, todo obsoleto).
  - `docs/ESTADO_ACTUAL_PROYECTO.md` actualizado a la v1.8.3.
  - `docs/RBAC_AUDIT_IMPLEMENTADO.md` rellenado (era un archivo de 0 bytes).
    Documenta el estado **real**: la tabla `business_members` y el RLS por rol
    ya están en Supabase, pero `permissions.ts` y `audit.ts` están definidos
    y **sin usar** en la UI, y no existe tabla de auditoría en el servidor.
  - **Documentación de WINK aislada en `docs/wink/`.** Once documentos
    numerados (`01`, `03`, `04`, `05`, `06`, `07`, `08`, `10`, `14`) describían
    **WINK POS** (Angular 22, `bento-*`, `api.wink-pos.com`, Montserrat), no
    BLINK. Ahora están en [`docs/wink/`](docs/wink/README.md), con un aviso en
    cada archivo, y sus equivalentes reales de BLINK están **reescritos**
    (`01-tech-stack.md`, `03-rutas-arquitectura.md`, `14-estructura-general.md`).
  - `docs/02-design-system.md` reescrito: documentaba el design system de
    WINK (252 tokens, `#3347DD`). El de BLINK (3 colores base + tokens `--ios-*`
    + métricas de componentes) está ahora en su lugar; el de WINK quedó como
    `docs/wink/02b-design-system-wink.md`.
  - `docs/19-despliegue-gh-pages.md` corregido: apuntaba a
    `blink-servers.github.io/POS/` y a `vite build --base=/POS/`. El sitio
    vivo es `https://www.blink.com.ve` con `base: "/"`.
  - `docs/20-supabase-auth-y-datos.md`: *Redirect URLs* de Supabase
    actualizadas al dominio propio.
  - `docs/REDISENO_KONSTA_HIG.md` corregido: decía que Tailwind se importaba
    **sin preflight** (decisión de la v1.6.0, revertida en la v1.7.0) y que
    los SF Symbols no se usaban. Actualizado, con el estado real de cada tarea
    propuesta.
  - `docs/ICONOS_Y_PWA.md`: añadida la sección del set de SF Symbols con la
    **nota de licencia** y las alternativas libres (Phosphor MIT, Lucide ISC,
    Tabler MIT).
  - Eliminadas **20 páginas del HIG que devolvían `HTTP 404`** (slugs
    inexistentes en la documentación de Apple). Quedan **85 páginas** del HIG
    más el índice.
- **Nuevo `npm run docs:check`**: recorre los 318 Markdown del repositorio,
  valida los **2.674 enlaces relativos** y detecta páginas del HIG con
  contenido `HTTP 404`. Sale con código 1 si algo falla.
- **`app/package.json`** → `1.8.3`.

## [1.8.2] · 2026-10-21

**Métricas reales de los componentes de iOS 27 aplicadas al CSS.**

- Se extrajo la geometría de los artboards del UI Kit oficial y se comparó con
  las medidas de BLINK (ver [`docs/IOS27_METRICAS_COMPONENTES.md`](docs/IOS27_METRICAS_COMPONENTES.md)).
- Alturas corregidas: fila de tabla, campo de texto, toggle, stepper y área
  táctil de los items de la tab bar.
- `docs/ios27-geometry.json` (datos crudos) y
  `docs/IOS27_METRICAS_COMPONENTES.md` (síntesis + tabla de comparación).

## [1.8.1] · 2026-10-21

**Set de iconos ampliado de 70 a 86 SF Symbols.**

- Iconos añadidos para la tab bar flotante, split view, panel *inspector* y los
  controles de iOS 27 (segmented control, toggle, stepper, slider, page control).
- `app/src/lib/sf-symbols.ts` regenerado; `npm run icons:sf` mantiene el flujo.

## [1.8.0] · 2026-10-21

**UI Kit oficial de iOS 27 extraído y aplicado + iconos SF Symbols + verificador de UI.**

- **UI Kit de Apple analizado** — `Apple iOS 27 UI Kit.sketch` (160 MB) procesado con
  7-Zip (es un bundle, no un zip plano). Contiene 34 páginas, **1.578 artboards**,
  107 colores, 105 estilos de texto y 42 materiales.
- **`app/src/lib/ios-design-tokens.ts` (nuevo, generado)** — tokens oficiales:
  12 colores del sistema (light/dark), 5 niveles de etiquetas, 5 de rellenos, la
  escala tipográfica de iOS 27 con sus variantes y leading, y los 19 materiales
  Liquid Glass con su radio de desenfoque real.
- **`tokens.css`** — bloque `--ios-*` con los valores exactos del kit (antes
  eran aproximaciones extraídas del .dmg de SF Symbols).
- **`app/src/lib/sf-symbols.ts` (nuevo, generado)** — 70 SF Symbols normalizados a
  `currentColor` con viewBox propio, desde
  `github.com/brendanballon/sfsymbols-svg`.
- **`Icon.tsx` migrado** a SF Symbols rellenos (los iconos de trazo propios se
  sustituyen). La API pública (`IconName`, `size`) se mantiene: ningún call site
  cambia.
- **`npm run verify:ui` (nuevo)** — verifica las 15 vistas (render, tamaño de h1,
  iconos vacíos, desbordamiento horizontal y errores de consola) y deja capturas
  en `verify-shots/`. Sale con código 1 si algo falla: sirve como regresión.
- **Scripts nuevos:** `tokens:ios`, `icons:sf`, `verify:ui`.

## [1.7.0] · 2026-10-21

**Preflight de Tailwind v4 activado + control segmentado de iOS + corrección de bug de hooks.**

- **Preflight de Tailwind habilitado** — `konsta.css` pasa a importar `tailwindcss`
  completo (con preflight) en vez de solo `theme` + `utilities`. Konsta necesita ese
  reset base (botones sin marco del navegador, tablas, inputs, listas). Como `app.css` se
  importa **después y sin capa**, sus reglas ganan a las del `layer(base)` de Tailwind:
  el preflight no altera el diseño de BLINK.
- **Regresiones del preflight corregidas** — `.btn--ghost` y `.btn--danger` solo definían
  `border-color`; con el preflight (`border-width: 0`) perdían el marco. Ahora fijan
  `border: 1px solid`.
- **Control segmentado de iOS 26/27** — `<Segmented>` de Konsta en el componente
  `Tabs`, con lo que Inventario, Finanzas, Catálogo y Contactos adoptan el patrón
  (segmento activo relleno en el azul de marca con texto blanco, inactivos en azul
  sobre pista translúcida) sin tocar sus call sites.
- **🐛 Bug corregido: hook dentro de un `useCallback`** — `syncRate` en `store.tsx`
  llamaba `useStoreState()` (un hook) dentro del callback, que se ejecuta fuera del
  render. Provocaba *"Invalid hook call"* al abrir el POS. Ahora lee `currentState`
  del módulo.

## [1.6.0] · 2026-10-20

**Konsta UI instalado + HIG de Apple leído completo + barra de pestañas de iOS.**

- **Konsta UI v5.5.0** (MIT) instalado con su subpath de React (`konsta/react`).
  Aporta los componentes con estética iOS nativa, los colores del sistema, el material
  *liquid glass*, hairlines, safe areas y touch ripple.
- **Tailwind CSS v4.3.3** añadido **sin preflight**: el proyecto ya tiene su propio
  reset en `app.css` y el preflight de Tailwind habría reescrito botones, inputs y
  tablas. Solo se importan `theme` + `utilities` + el theme de Konsta.
- **HIG de Apple leído por completo** — 64 páginas / 764 KB en `docs/HIG/` (la versión
  Markdown oficial que Apple publica en la misma URL), con índice y *best practices*
  extraídas por página en `docs/HIG/INDEX.md`.
- **Barra de pestañas inferior en móvil** (`<Tabbar>` de Konsta) con 5 secciones y
  etiquetas, en tonos monocromáticos y material translúcido, con fallback opaco bajo
  `prefers-reduced-transparency: reduce`. En escritorio se oculta y la navegación sigue
  en la sidebar.
- **Buscador del POS** sustituido por `<Searchbar>` de Konsta (píldora redondeada, lupa,
  botón de limpiar, foco iOS).
- **Header de la landing** con `<Glass>` de Konsta (blur + saturación + brillo especular).
  El POS (tablas, precios, stock) queda **100 % opaco**, como indica el HIG: *"Don't use
  Liquid Glass in the content layer"*.
- **Documentación** — `docs/REDISENO_KONSTA_HIG.md` con el mapeo de cada regla del HIG
  a su implementación, y lista de componentes de Konsta pendientes de integrar.

---

## [1.5.0] · 2026-10-20

**Extracción de iOS 27 / iPadOS 27 + tokens del sistema + corrección de licencias.**

- **Extracción del kit oficial** — `SF-Symbols-27.dmg` (paquete de Apple) procesado
  en Windows con 7-Zip (`.dmg` → `.pkg` → `Payload` cpio → `Payload~`).
  Obtenido: paleta del sistema (20 colores × 8 variantes), 3.986 nombres de símbolos,
  26 vectores SVG de referencia, 85 archivos SF Pro y el texto de la licencia.
- **`app/src/lib/ios-tokens.ts`** — módulo nuevo con la paleta iOS 27 completa
  (`IOS_COLORS`, `iosColor()`), la escala tipográfica iOS/iPadOS 27 y sus variantes
  Dynamic Type (AX1–AX5), la escala de macOS 26, los materiales estándar, las
  dos variantes de Liquid Glass y las constantes de radio y área táctil.
- **`tokens.css`** — nuevos tokens `--ios-*`: colores del sistema, rellenos
  translúcidos, 3 niveles de etiqueta y radios continuos de iOS 27.
- **Liquid Glass solo en la landing** — el header público usa la variante `regular`
  (blur 20 px + saturate 180 %) con el borde especular de Apple y fallback para
  `prefers-reduced-transparency`. **El POS queda 100 % opaco**, como indica el HIG.
- **⚠️ Corrección de licencia** — `app/public/fonts/` (5 archivos SF Pro Display) se
  seguían sirviendo públicamente en `www.blink.com.ve/fonts/…` pese a que el propio
  `fonts.css` documentaba que SF Pro no se puede distribuir en web. **Eliminados**
  del repositorio y del despliegue.
- **Documentación** — `docs/DESIGN_IOS27.md` (paleta, tipografía, materiales, mapeo
  iOS→BLINK, alternativas libres) y `docs/ios27/` (datos crudos + texto legal).
- **Limitación de la API de Figma** — con seat *View* en plan *Starter*, los endpoints
  Tier 1 dan **20 llamadas/mes** (el PAT no sube ese techo: `retry-after: 398482` s).
  Los specs a nivel de nodo se completarán al reiniciarse la cuota.

---

## [1.4.0] · 2026-10-20

**Landing page comercial en la raíz + iconos de marca reales (favicon y PWA).**

- **Iconos de marca reales** — se copiaron los assets originales de `clone/`:
  `favicon.svg`, `favicon-dark.svg`, `favicon.ico` e `icons/icon.svg`. Los dos stubs
  de 207 bytes (`favicon.svg` y `apple-touch-icon.png`) quedan reemplazados por los
  archivos reales.
- **PNG generados** — `icon-192.png`, `icon-512.png`, `icon-maskable-192.png`,
  `icon-maskable-512.png` y `apple-touch-icon.png` (180×180), rasterizados desde los
  SVG con Chromium. Nueva variante *maskable* con fondo a sangre y marca blanca en
  la zona segura del 80%.
- **Script reproducible** — `npm run icons` (`app/scripts/build-icons.mjs`) regenera
  los PNG cuando cambia un SVG.
- **Manifest completo** — 5 iconos (`any` + `maskable`), `theme_color` `#3347DD` y
  `background_color` `#FFFEFB`; `id`/`start_url`/`scope` en la raíz.
- **HTML** — `favicon.svg`, `favicon.ico`, `favicon-dark.svg` (tema oscuro del SO) y
  tres `apple-touch-icon` para iOS.
- **Imagen Open Graph** — `og-image.png` (1200×630) generada con el favicon y el
  lockup *BLINK POS*, con la maqueta del POS y el precio. Se publica en `og:image`,
  `og:image:width/height`, `og:image:alt` y `twitter:image`. Nuevo script `npm run og`.

**Landing page comercial en la raíz + reorganización de rutas bajo `/app`.**

**Landing page comercial en la raíz + reorganización de rutas bajo `/app`.**

- **Landing pública en `/`** — la raíz del dominio deja de redirigir al login y muestra
  una portada de conversión: header fijo con anclas y CTAs, hero con mockup del POS y del
  celular escaneando, grid de 3 beneficios (escáner móvil por QR, multimoneda USD/EUR + BCV,
  operación local-first), bloque de ecosistema con métricas, plan Pro Comercial a **$25/mes**
  y footer con enlaces legales. Todo con iconos SVG propios y la paleta oficial Blink.
- **App reorganizada bajo `/app/*`** — login, registro, recuperación, onboarding y los
  módulos (inicio, ventas, historial, catálogo, inventario, contactos, finanzas, informes,
  ajustes) viven ahora bajo el prefijo `/app`. Todos los enlaces internos actualizados.
- **`/escaner` se mantiene en la raíz** — es el deep link que se comparte por QR; queda
  estable e independiente de la reorganización de la app.
- **Páginas legales reales** — `/app/terminos` y `/app/privacidad` con el texto completo
  de los Términos y Condiciones de Uso de Blink (suscripción de $25 USD, pagos vía Pago
  Móvil/Binance Pay, vigencia de 30 días, política de no reembolsos, servicio "tal cual",
  uso adecuado, propiedad intelectual, privacidad, cambios y cancelaciones).
- **SEO de la portada** — `index.html` actualiza `title`, `description`, Open Graph y
  Twitter Card; `manifest.json` declara `id`, `start_url` y `scope` en la raíz.
- **Tokens de marca** — `--blink-bg-main`, `--blink-primary`, `--blink-text-muted`,
  `--blink-success`, `--blink-danger`, `--blink-warning` y `--blink-dark` en `tokens.css`.
- **Icono `sm`** — nuevo tamaño en el componente `Icon` para usos compactos.

---

## [1.3.5] · 2026-10-19

**Fase B — Catálogo global colaborativo + normalización · Fase C — Ticket concatenado.**

- **Catálogo global (`catalogo_global`)** — migración `0004`: tabla compartida entre todas
  las tiendas, clave = código de barras. Guarda solo datos descriptivos universales
  (nombre en MAYÚSCULAS, cantidad de medida, unidad, categoría, fabricante). No contiene
  costos, precios, stock ni IVA.
- **RLS del catálogo global**: cualquier usuario autenticado lee; owner/manager insertan;
  nadie modifica ni borra fichas ajenas (administración central con `service_role`).
- **`products` sigue siendo privado** por comercio (precios, costo, IVA, stock) y ahora
  incluye `brand` y `presentation_qty`.
- **Formulario de producto rediseñado** por secciones: Producto · Presentación ·
  Precios e impuesto · Inventario. El nombre se guarda siempre en **MAYÚSCULAS**.
- **Presentación normalizada**: campo numérico + selector cerrado de unidades
  (`unidad, kg, g, mg, L, ml, pack`); sin texto libre.
- **Se elimina `Product.type = "servicio"`**: todo producto es tangible; los heredados
  pasan a `simple` con `trackStock: false` al normalizar.
- **Autocompletado por escaneo**: al leer un código no registrado en la tienda se consulta
  `catalogo_global` y se precargan nombre, medida, unidad, categoría y fabricante.
- **Ticket concatenado (Fase C)**: cada línea imprime `NOMBRE 500 g` cuando la cantidad
  es 1 unidad.
- **`catalogoLookup` / `catalogoUpsert`** en `lib/cloud.ts`: nunca lanzan; si no hay red o
  sesión, el producto igual se guarda localmente.
- **Verificado**: typecheck limpio, 43 pruebas Vitest en verde, 27 comprobaciones de
  migración (PG embebido) y build de Pages limpio.

---

## [1.3.4] · 2026-10-19

**Fase A — Tasa oficial automática (`ve.dolarapi.com`).** Detalle en `docs/23-plan-nuevas-especificaciones.md`.

- Nuevo servicio `lib/exchange.ts`: consulta la tasa oficial BCV con caché de 1 h en
  `localStorage`, timeout de 8 s y nunca lanza errores; si falla, se mantiene la tasa
  manual.
- Acción `syncRate()` en el store: devuelve `ok | cached | error` y actualiza `rate` y
  `rateUpdatedAt`.
- **Ajustes › Moneda e impuestos**: botón "Actualizar desde la API" que sincroniza y
  muestra el resultado ("Tasa oficial actualizada" / "Tasa oficial vigente aplicada" /
  "Sin conexión, se mantiene la tasa guardada").
- **POS (Vender)**: sincronización automática al abrir la caja (respeta la caché, no
  golpea la API en cada carga).
- **Verificado**: typecheck y 38 pruebas en verde; build de Pages limpio.

---

## [1.3.3] · 2026-10-19

**Escáner: pulido de cámara, beep y vista previa en el celular.** Detalle en `docs/21-escaner.md`.

- **Apertura instantánea de la cámara**: se piden constraints mínimas y el `BarcodeDetector` se
  prepara en paralelo; los ajustes de sensor no bloquean la imagen. Se elimina el texto
  "Iniciando cámara rápidamente…".
- **Escaneo seguido ("Continuar")**: en el POS la cámara ya **no se cierra** al leer; se pausa un
  instante y aparece un botón **Continuar** para pasar al siguiente producto.
- **Feedback sonoro (beep)**: nuevo `lib/audio.ts` (Web Audio, sin archivos). Suena en los tres
  métodos (USB, cámara y celular); el audio se desbloquea en el primer gesto del usuario.
- **Celular remoto con vista previa**: el teléfono muestra su propia lista de lo escaneado (nombre,
  cantidad, subtotal) y una **vista previa del ticket**; la caja responde los nombres/precios por
  el canal (`names`).
- **Corrección**: el canal de Realtime del teléfono ya no se reconstruye en cada escaneo.
- **Verificado**: typecheck y 38 pruebas en verde; build de Pages limpio.

---

## [1.3.2] · 2026-10-19

**QA · caza de bugs de punta a punta (rol comerciante).** Revisión manual completa del POS y
correcciones. Detalle en `docs/22-qa-caza-de-bugs.md`.

- **Cotización con distintivo**: el comprobante de una cotización ahora muestra **COTIZACIÓN** y
  **SIN VALOR FISCAL** (antes se imprimía igual que un ticket de venta).
- **Abonos a pendientes acotados**: no se puede abonar más que el saldo restante; el store acota
  el monto y calcula la comisión sobre lo aplicado (la cuenta ya no se acredita de más).
- **Onboarding**: se limpia la categoría al añadir varios productos seguidos (antes se retenía).
- **Descuentos**: "Usos máximos" vacío/0/inválido = ilimitado (antes 0 dejaba el descuento
  inservible).
- **Stock bajo**: solo alerta cuando el mínimo es `> 0` (evita falsos positivos con mínimo 0).
- **Tasa sin configurar**: se ocultan equivalencias/valores engañosos (`Bs 0,00`, `$ ∞`, `NaN`) en
  Inicio, POS, Catálogo, Finanzas, Ajustes, chip de tasa y recibo; textos claros en su lugar.
- **Accesibilidad**: la etiqueta "Método de pago" ya no corrompe el nombre accesible del primer
  botón de cuenta (`Field` con `as="group"`).
- **Contactos**: "Días de crédito" no acepta negativos.
- **Requisito**: se retira la versión visible al pie de Ajustes (la versión se declara solo en
  `app/package.json`).
- **Verificado**: typecheck y 38 pruebas en verde; flujos de efectivo, cotización, crédito, pago
  en bolívares con referencia, anulación, cierre de caja (arqueo), transferencia multimoneda y
  exportación CSV probados en vivo.

---

## [1.3.1] · 2026-10-18

**Cierre de Bloqueadores de MVP y Preparación para Producción.**

- **Cálculo de vuelto / cambio multimoneda**: el modal de cobro ahora permite pagar con exceso
  (monto recibido > monto exacto). Calcula en tiempo real el vuelto a entregar en USD y su
  equivalente en bolívares a la tasa BCV del día, muestra botones rápidos de efectivo (\$5, \$10,
  \$20, \$50, \$100), e imputa a la cuenta y al arqueo únicamente el monto necesario para saldar
  la venta (sin inflar la caja con dinero que salió de vuelto).
- **Comprobante de venta (Ticket térmico 58mm / 80mm e impresión)**: nuevo componente
  `Receipt.tsx` con soporte de impresión física (`window.print()`) y reglas CSS `@media print`.
  Se muestra automáticamente tras confirmar la venta en el POS con modal de éxito y botón para
  imprimir el ticket, y se añade botón de reimpresión directa desde la tabla de Historial.
- **Persistencia de carritos / cuentas abiertas (`drafts`)**: las cuentas abiertas del POS se
  persisten en `localStorage` (`blink-pos-drafts-v1`), evitando la pérdida accidental de tickets
  en curso si el usuario recarga la página, cambia de pestaña o se reactiva la PWA.
- **Guardia de caja abierta en POS**: si el turno de caja no ha sido abierto con su fondo inicial,
  el botón de cobro abre automáticamente el modal de apertura con fondo inicial en USD y Bs
  antes de procesar el pago, asegurando la consistencia del arqueo.
- **Pruebas y estabilidad**: 38 pruebas unitarias en verde (+3 pruebas de cálculos de vuelto),
  typecheck y build de producción limpios.

---

## [1.3.0] · 2026-10-18

**Módulo Escáner.** Tres formas de leer códigos de barras, integradas en Vender, Catálogo,
Inventario y Ajustes:

1. **Lector USB/Bluetooth (HID)**: se conecta como teclado y funciona sin instalar nada.
2. **Cámara del equipo**: usa la API nativa `BarcodeDetector` (Chrome/Edge y Safari 17+).
3. **Celular como escáner remoto**: se vincula una vez con un código QR y queda emparejado
   **30 días** (sin volver a escanear el QR cada día).

### Escáner

- **Detección del lector físico** (`lib/scanner/hid.ts`, `lib/scanner/ScannerProvider.tsx`): se
  distingue un lector de una persona por el tiempo entre teclas (≤ 70 ms) y la terminación en
  Enter/Tab; se intercepta en fase de captura para que el código no se escriba en los campos ni
  dispare formularios. Lógica pura y probada.
- **Cámara** (`lib/scanner/CameraScanner.tsx`): vista previa con guía; si el navegador no puede
  decodificar, avisa y sugiere el lector USB o el celular. Sin dependencias.
- **Celular remoto** (`pages/Escaner.tsx`, `lib/scanner/pairing.ts`): la caja genera un
  emparejamiento (id público + secreto) y muestra un **QR**; el teléfono lo guarda y envía los
  códigos por **Supabase Realtime**. Incluye **heartbeat** (estado "activo"), **reconexión** al
  volver a la pestaña (`visibilitychange`) y **cola** para microcortes. La caja verifica el secreto
  antes de aceptar cada código.
- **Revocación** (`Ajustes › Dispositivos`): "Desvincular teléfonos" regenera el secreto y deja
  fuera a los equipos anteriores. El emparejamiento es **local** (por equipo) y por eso no guarda
  nada en la base de datos.
- **Integración**: en **Vender** el código agrega el producto a la cuenta (o propone registrarlo);
  en **Catálogo** abre el producto existente o el alta con el código precargado; en **Inventario**
  abre el ajuste de existencias. Botón de cámara y "generar código interno" (`INT-…`) en el alta
  de producto.
- **Nuevo campo interno `brand`** (marca/fabricante) en el producto: solo para uso interno, nunca
  sale en el recibo. Se normaliza en el cargador (`store.tsx`) y se edita en el alta.

### Dependencias

- Se añade **`qrcode`** (+ `@types/qrcode`, solo en desarrollo) para dibujar el QR del
  emparejamiento como SVG local. No hay servicios externos de QR.

### Verificación

- `npm run typecheck`, `npm run build` y `npm test` (**35 pruebas**: 9 nuevas del escáner) en
  verde.
- Migraciones: sin cambios (`npm run test:migrations` sigue igual).

### Pendiente (siguiente fase)

- **Catálogo global colaborativo** (fase **2.0.0**): diccionario de autocompletado en IndexedDB,
  sincronización completa + delta y contribución opcional. Requiere la migración `0004`.

---

## [1.2.0] · 2026-10-18

Verificación por correo: se arregla el enlace que apuntaba a **localhost** y se añade
**«Confiar en este dispositivo»** con verificación por código al entrar desde un equipo nuevo.

### Acceso y verificación

- **Arregla el enlace a localhost** (configuración de Supabase Auth, no código): el `site_url`
  del proyecto era `http://localhost:5173`; ahora es `https://blink-servers.github.io/POS/` y la
  lista de URLs permitidas incluye producción y desarrollo local. Antes los enlaces de los
  correos de verificación llevaban a `localhost`.
- **«Confiar en este dispositivo»** (`pages/Login.tsx`, `pages/Registro.tsx`, `lib/store.tsx`):
  casilla en el paso del código. Los equipos de confianza se recuerdan **por usuario**
  (`localStorage`); la verificación de una sola pestaña vive en `sessionStorage`.
- **Código también al entrar** (nuevo): al iniciar sesión desde un equipo **no** confiable, tras
  validar correo y contraseña se envía un código de 6 dígitos y se pide antes de entrar. Desde un
  equipo de confianza se entra directo. Las guardias de ruta (`App.tsx`) ahora exigen equipo
  verificado, no solo sesión.
- **Se acepta también el enlace del correo**: si el usuario llega abriendo el enlace de
  verificación, el equipo queda verificado solo (`supabase.ts` guarda el tipo de enlace y
  `store.tsx` lo aplica).

### Limitación conocida (plan gratuito de Supabase)

- Desde el **3-jun-2026**, los proyectos **gratuitos** con el proveedor de correo por defecto
  **no pueden editar las plantillas** de correo. El correo trae un **enlace**, no un código de 6
  dígitos, y el servicio por defecto limita a ~2 correos por hora por proyecto. Para que llegue el
  **código** hace falta **SMTP propio** (p. ej. Resend + dominio verificado) o plan Pro; con eso se
  activa la plantilla con `{{ .Token }}` (la app ya está lista para el código).

### Verificación

- `npm run typecheck`, `npm run build` y `npm test` (26 pruebas) en verde.
- Probado en el navegador: `/entrar` y `/registro` renderizan; la guardia de rutas redirige
  `/inicio` → `/entrar`; sin errores de consola.

---

## [1.1.2] · 2026-10-18

Wordmark BLINK POS. Cambio de identidad visual aprobado por el dueño. Sin cambios de esquema.

### Visual

- **Identidad del logo** (`app.css`): **BLINK** en acento `#007AFF`, cursiva y **extra bold (800)**;
  **POS** en texto `#424242`, recta y **ligera (300)**; tracking negativo y pila de fuentes del
  sistema (sin Inter empaquetada). Paleta estricta por tokens (sin colores nuevos).
- Dos variantes: **`.blink-pos-title`** (grande, pantallas de acceso — Login, Registro, Asistente)
  y **`.brand`** compacta (barra lateral y pantalla de error), con POS envuelto en su propio span
  (`brand__pos`) para aplicar el gris claro.
- **Actualiza la regla de peso 400** del wordmark (documentada en `docs/18`) a **800/300**. El CSS
  propuesto con `#0075FF`/`#434343` seguía descartado por salirse de la paleta; solo se adoptaron
  sus pesos y estructura, corregidos a los colores de token.

### Verificación

- `npm run typecheck`, `npm run build` y `npm test` (26 pruebas) en verde.
- Comprobado en navegador: colores y pesos computados (`BLINK` = `rgb(0,122,255)`/800/cursiva,
  `POS` = `rgb(66,66,66)`/300/recta), consola sin errores.

---

## [1.1.1] · 2026-10-18

Corrección de bugs detectados al probar la app en el navegador. Sin cambios de esquema.

### Correcciones

- **Límite de errores global** (`components/ErrorBoundary.tsx`): antes, cualquier error de render
  sin capturar desmontaba React y dejaba la pantalla **en blanco** (punto de venta inutilizable).
  Ahora un fallo muestra un mensaje claro con «Recargar y continuar» y «Volver al inicio», en vez
  de perder la operación. Se envuelve `<App />` en `main.tsx`.
- **No se vende más stock del disponible** (`pages/Vender.tsx`): en productos con control de
  existencias, el POS ahora limita la cantidad al stock real — no se puede agregar al ticket ni
  incrementar por encima de lo disponible, y los productos agotados aparecen deshabilitados con
  la etiqueta «Agotado». Antes se permitía vender de más y el stock quedaba en 0 sin avisar.

### Verificación y despliegue

- `npm run typecheck`, `npm run build` y `npm test` (26 pruebas) en verde.
- Probado en el navegador: arranque limpio sin errores de consola, guardia de rutas protegidas
  redirige a `/entrar`, y la app no se en blanco ante un fallo.
- **Desplegado** a GitHub Pages (commit `8d9b57c`); en vivo con `versión 1.1.1` y consola limpia.

---

## [1.1.0] · 2026-10-17

Base de escalabilidad. La app no cambia para el usuario; se prepara el terreno para soportar
miles de comercios y mucho volumen de operaciones, y se añade la red de seguridad de pruebas.

### Arquitectura (base para escala)

- **Esquema normalizado** (`supabase/migrations/0002_normalize.sql`): los datos dejan de vivir en
  un único documento JSONB que se reescribía entero con cada cambio. Ahora son tablas reales:
  catálogo (`products`, `contacts`, `accounts`) y **libros de solo-agregar** (`sales` + `sale_lines`,
  `movements`, `inventory_moves`, `purchases` + `purchase_lines`, `expenses`, `pendings` +
  `pending_payments`, `transfers`, `cash_closures`) y caja (`cash_sessions`). Es **aditivo**: no
  toca `businesses.data`, así que la app actual sigue funcionando mientras se migra la capa cliente.
- **Multi-usuario preparado** (`business_members` + RLS por membresía y rol). Hoy solo el
  propietario; abre la puerta a cajeros/gerentes sin migrar el esquema después. La migración
  **backfilla** la membresía de los comercios que ya existían (si no, RLS bloquearía a su propio
  dueño al aplicarla) y un trigger la da de alta en los comercios nuevos.
- **IDs `text`, `business_id` uuid**: los IDs de entidad que genera el cliente son cadenas
  (`prodx_a1b2c3`), no UUIDs; se usan como `text` para migrar datos existentes sin reescribirlos.
- **Desempaquetado** (`0003_unpack.sql`): función `unpack_business(id)` / `unpack_all_businesses()`
  que rellena las tablas normalizadas desde `businesses.data`, repitable y sin borrar el original.
- **Offline / multi-terminales (preparado)**: los libros son de solo-agregar y los clientes generan
  id y hora propios; `version` en las tablas mutables permite rechazar escrituras obsoletas el día
  que se habilite.

### Pruebas

- **Arnés de pruebas con Vitest** (`npm test`). 26 pruebas sobre la lógica pura del dinero:
  `fiscal.ts` (base, IVA proporcional, recargos, IGTF 3 %, total del ticket, descuentos) y
  `metrics.ts` (neto, costo, total sin descuento doble, qué cuenta en KPIs, capital en USD,
  saldo de pendientes y **arqueo de caja**). Es el seguro antes de tocar la lógica de dinero en la
  migración a las tablas.
- **Prueba de integración de migraciones** (`npm run test:migrations`). Levanta un PostgreSQL
  embebido (devDep `embedded-postgres`), imita el esquema `auth` de Supabase y ejecuta las tres
  migraciones reales: verifica membresías (backfill + trigger), el desempaquetado JSONB → tablas
  (conteos, neto de venta, casteo de fechas, ids de línea), idempotencia y aislamiento por RLS.
  Encontró y corrigió el fallo de backfill antes de tocar producción.

### Despliegue en producción

- **Migraciones aplicadas a la base de Supabase en producción (2026-10-18)** vía Management
  API: `0002_normalize.sql` + `0003_unpack.sql` + `unpack_all_businesses()`. Verificación
  posterior: 17 tablas públicas, 66 políticas RLS, RLS habilitado en todas las tablas
  (`business_members` sin forzar, por diseño), 6 funciones creadas. **Prueba funcional en vivo**
  (dentro de una transacción con `ROLLBACK`): alta de usuario + comercio dispara el trigger de
  membresía, y venta + línea respetan la FK; la base quedó intacta tras el rollback. El
  desempaquetado fue no-op: la tabla `businesses` estaba vacía (cero comercios en vivo), por lo
  que la aplicación no supuso riesgo de pérdida de datos.

### Sin cambios visibles

- El bundle y la interfaz son idénticos a 1.0.0; la migración del cliente (leer/escribir las
  tablas) es el siguiente paso (Fase B).

---

## [1.0.0] · 2026-10-17

Primer lanzamiento: el núcleo del punto de venta funciona de punta a punta, con cuentas
reales y datos en la nube.

### Novedades (Fase 1–3)

- **Cuentas reales** con Supabase Auth (correo + contraseña). Se eliminó el acceso simulado.
- **Registro y verificación**: datos personales reales (nombre, apellido, teléfono, correo) y
  verificación del correo con un **código alfanumérico de 6 dígitos**.
- **Alta guiada (onboarding)** tras verificar: datos del comercio y su giro → módulos que activa
  → cuenta de pagos (nombre, divisa USD/VES, si participa del cierre de caja) → categorías →
  productos → proveedores. Sin datos de ejemplo.
- **Datos en la nube**: una fila por comercio en la tabla `businesses` (JSONB) con RLS. El caché
  local es solo respaldo sin conexión.
- **Núcleo POS**: abrir caja → cobro multi-cuenta (USD/Bs) → descuentos con vigencia → recargos →
  IVA por producto → IGTF 3 % en USD → historial con anulación → cierre de caja con arqueo →
  informes. **Finanzas**: cuentas y comisiones, libro de movimientos, transferencias, CxC/CxP con
  abonos, gastos (pagar/anular), recurrentes.
- **Catálogo**: productos, precios por canal, descuentos, recargos y categorías.

### Correcciones

- **Inicio/Informes**: el capital no se refrescaba al abonar un pendiente o cambiar la tasa
  (faltaban `pendings` y `rate` en las dependencias del cálculo).
- **Inventario · Registrar compra**: ahora registra la compra de verdad (`addPurchase`): proveedor,
  forma de pago (efectivo/cuenta/crédito), cuenta de origen, N° de factura y **actualiza el costo
  promedio**. Antes solo sumaba existencias y **descartaba el costo** tecleado.
- **Inventario**: se eliminó el botón **"Añadir producto de ejemplo"**, que insertaba datos
  ficticios (regla del proyecto: nada de datos de relleno). Ahora guía al Catálogo.
- **Inventario · Movimientos y Compras**: pestañas ya no son marcadores vacíos; muestran los
  movimientos de existencias y las compras reales.

### Notas

- Configuración de Supabase (Auth, SMTP, plantilla del código) en `docs/20`.
- Estado y plan de desarrollo en `docs/18`.
