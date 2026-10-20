# Historial de versiones · BLINK POS

Esquema de versiones (SemVer adaptado):

- **MAJOR** (`1.x.x` → `2.0.0`): cambios grandes (fases completas, rediseños, migraciones de datos).
- **MINOR** (`1.0.x` → `1.1.0`): cambios medianos (módulos nuevos, funciones nuevas visibles).
- **PATCH** (`1.0.0` → `1.0.1`): cambios menores y correcciones de bugs.

La versión se declara **una sola vez** en `app/package.json` y Vite la inyecta en el
bundle (`__APP_VERSION__`). Se muestra en **Ajustes › Cuenta** y en la pantalla de acceso.

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
