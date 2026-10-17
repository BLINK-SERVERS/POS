# Historial de versiones · BLINK POS

Esquema de versiones (SemVer adaptado):

- **MAJOR** (`1.x.x` → `2.0.0`): cambios grandes (fases completas, rediseños, migraciones de datos).
- **MINOR** (`1.0.x` → `1.1.0`): cambios medianos (módulos nuevos, funciones nuevas visibles).
- **PATCH** (`1.0.0` → `1.0.1`): cambios menores y correcciones de bugs.

La versión se declara **una sola vez** en `app/package.json` y Vite la inyecta en el
bundle (`__APP_VERSION__`). Se muestra en **Ajustes › Cuenta** y en la pantalla de acceso.

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
