# Historial de versiones · BLINK POS

Esquema de versiones (SemVer adaptado):

- **MAJOR** (`1.x.x` → `2.0.0`): cambios grandes (fases completas, rediseños, migraciones de datos).
- **MINOR** (`1.0.x` → `1.1.0`): cambios medianos (módulos nuevos, funciones nuevas visibles).
- **PATCH** (`1.0.0` → `1.0.1`): cambios menores y correcciones de bugs.

La versión se declara **una sola vez** en `app/package.json` y Vite la inyecta en el
bundle (`__APP_VERSION__`). Se muestra en **Ajustes › Cuenta** y en la pantalla de acceso.

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
