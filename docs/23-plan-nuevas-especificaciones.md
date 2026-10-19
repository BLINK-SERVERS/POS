# 23 · Plan de las nuevas especificaciones (tasa, moneda, catálogo global, impresión y RBAC)

> **Estado: PLAN — no implementado todavía.** Este documento fija el orden, las decisiones
> y los conflictos detectados antes de tocar código. Cuando una fase se implemente, se
> actualizará su estado aquí y en `18-estado-y-plan-de-desarrollo.md`.

Especificaciones recibidas (4 entregas):

1. **Tasa oficial + moneda base + catálogo global normalizado** (integración `ve.dolarapi.com`,
   moneda base USD/EUR inmutable, normalización UPPERCASE, cantidad+unidad, fabricante interno,
   quitar Servicios, UX del formulario).
2. **Concatenación del nombre en el ticket** (`NOMBRE 500g`).
3. **RBAC** (cajero / administrador / dueño) con RLS y auditoría.

---

## 0. Decisiones tomadas con el dueño (2026-10-19)

| Tema | Decisión |
| --- | --- |
| Moneda base USD/EUR | **Solo tasa automática ahora.** BLINK sigue con **USD** como única moneda base y el bolívar (VES) como segunda moneda. **EUR queda pospuesto**: exige un refactor profundo de todo el dinero. |
| Servicios (`Product.type = "servicio"`) | **Se elimina por completo.** |
| Catálogo global | **Se crea desde cero** en Supabase (tabla `catalogo_global` + RLS + normalización). |
| Orden de trabajo | **Documentar el plan y luego implementar**, empezando por lo menos conflictivo. |

---

## 1. Conflictos y hallazgos (importante)

Antes de implementar hay que reconocer qué contradice el estado actual:

1. **No existe `catalogo_global`.** Hoy hay un catálogo **por comercio** (`products`). La tabla
   global se crea nueva; el alta de producto la alimentará, sin que el POS dependa de ella.
2. **Moneda base EUR no existe.** `Business.currency: "USD" | "VES"` y *todo* el dinero está
   guardado en **USD** (precios, costos, saldos, métricas, recibos, exportaciones). Introducir
   EUR "inmutable" obliga a reescribir `money.ts`, `metrics.ts`, `Receipt.tsx`, `exportData.ts` y
   la validación. **Pospuesto por decisión del dueño.**
3. **`Product.type = "servicio"` está en uso.** Eliminarlo toca `types.ts`, `Catalogo.tsx`, las
   guardas de stock (`trackStock`) y los datos existentes ("Servicio de recarga"). Requiere
   **migración** de los productos servicio a `simple` (con `trackStock: false`).
4. **`Product.unit` es texto libre.** El nuevo modelo pide **cantidad numérica + unidad de una
   lista cerrada** (`kg, g, mg, L, ml, unidad, pack, otro`). Hay que decidir dónde vive la
   cantidad: ¿en el producto (presentación) o en la línea de venta (cantidad vendida)? Ver §3.B.
5. **La tasa hoy es manual.** `setRate` rechaza `<= 0` y guarda `rateUpdatedAt`. La API añade una
   **fuente automática** y una **política de caché** (no consultar en cada render).
6. **No hay roles.** Todo usuario autenticado tiene control total. El RBAC es una fase grande
   (esquema, RLS, UI condicional, auditoría).

---

## 2. Fases propuestas

### Fase A — Tasa oficial automática (baja fricción, sin cambios de esquema)

- Servicio `lib/exchange.ts`: consulta `https://ve.dolarapi.com/v1/dolares/oficial` (y `/euros`
  para el futuro), con **caché local** (`localStorage`, p. ej. 30–60 min) y **fallback silencioso**
  a la tasa manual si falla la red o el comercio no tiene internet.
- Se consulta **al abrir el POS** (y al abrir el módulo de caja), nunca en cada render.
- Botón **"Actualizar tasa"** en el chip de tasa / Ajustes; muestra la fecha de la última
  sincronización (`rateUpdatedAt` ya existe).
- **No** se cambia el esquema. `setRate` sigue siendo la única vía de escritura.
- Criterio de aceptación: sin internet, la app funciona igual que hoy (tasa manual).

### Fase B — Catálogo global normalizado (Supabase)

- **Migración** `00XX_catalogo_global.sql`: tabla `catalogo_global` (id, nombre **en MAYÚSCULAS**,
  cantidad `numeric`, unidad (enum cerrado), fabricante, código de barras, categoría, timestamps,
  `created_by`), índices por barcode y por nombre, y **RLS** (lectura para autenticados, inserción
  validada, sin update/delete libres).
- **Normalización al guardar**: el input mantiene el texto natural, pero se persiste
  `name.trim().toUpperCase()` (también aquí la comparación de duplicados).
- **Unidades**: cantidad numérica + `<select>` cerrado. Se define la lista y un validador.
- **Fabricante**: campo **interno** (nunca en el ticket), reutilizando el `brand` actual.
- **Servicios**: se quita `type: "servicio"` del formulario y de los tipos; **migración** de los
  productos servicio existentes a `simple` (`trackStock: false`).
- **UX**: rediseño del modal de alta (secciones claras: identificación → medida → precios →
  inventario), con validación guiada.

### Fase C — Impresión concatenada del nombre

- En `Receipt.tsx`, cada línea imprime `NOMBRE` + `espacio` + `cantidad` + `unidad` (p. ej.
  `MARGARINA MAVESA 500g`). Si no hay medida, solo el nombre.
- Aplica a productos tangibles. Ver pruebas en `Receipt`/fiscal.

### Fase D — RBAC y auditoría (la más grande)

- **Esquema**: `memberships` (usuario ↔ negocio ↔ rol: `cajero` | `administrador` | `dueño`) y
  `audit_log` (quién, qué, cuándo, negocio).
- **RLS estricta** en todas las tablas: rechazar `INSERT/UPDATE/DELETE` si el rol del token no
  alcanza. La UI **nunca** es la única barrera.
- **UI condicional**: ocultar costos/márgenes al cajero; bloquear config global y reportes de
  rentabilidad al administrador; administración de empleados al dueño.
- **Auditoría**: apertura manual de gaveta sin venta, eliminación de ítems del carrito tras el
  escaneo, y cambios de stock → siempre con timestamp + id de usuario.
- **Dependencia**: requiere decidir cómo se crea el primer `dueño` (hoy el registro crea un
  comercio de un solo usuario) y cómo se invita a un empleado.

---

## 3. Decisiones pendientes (para cerrar antes de cada fase)

### 3.A · Tasa
- ¿Sincronización **automática** al abrir el POS o solo con botón? (Propuesto: ambas; auto en
  apertura + botón manual.)
- ¿Vida de la caché? (Propuesto: 60 min.)

### 3.B · Cantidad y unidad (clave para la Fase C)
La spec mezcla dos cosas: la **presentación** del producto (500 g) y la **cantidad vendida**
(2 unidades). Hay que definir:
- **Opción 1**: `presentationQty` + `unit` en el producto (solo etiqueta de impresión) y `qty`
  sigue siendo la cantidad vendida. El ticket imprime `nombre + presentación` cuando la línea es 1.
- **Opción 2**: la unidad es por **línea de venta** (cantidad fraccionaria: 1.5 kg). Cambia el POS
  (stepper admite decimales) y el inventario.
- **Propuesta**: empezar por **Opción 1** (menos disruptiva) y evaluar la 2 en una fase posterior.

### 3.C · Unidades
- Lista cerrada propuesta: `kg, g, mg, L, ml, unidad, pack, otro`. ¿"otro" guarda texto libre
  (rompe la estandarización) o se prohíbe? (Propuesto: "otro" **no** permite texto libre; obliga a
  elegir una real.)

### 3.D · RBAC
- ¿Roles por negocio (multi-tenant) o por usuario global? (Propuesto: por negocio.)
- ¿El `dueño` es el creador del comercio y los demás se invitan por correo?

---

## 4. Orden de implementación recomendado

1. **Fase A (tasa)** — sin esquema, alto valor, bajo riesgo.
2. **Fase C (impresión)** — depende de la decisión §3.B; pequeña.
3. **Fase B (catálogo global + Servicios)** — migración y UX.
4. **Fase D (RBAC)** — la más grande; al final, con el modelo de datos ya estabilizado.

> Regla: cada fase cierra con `typecheck`, pruebas y `build:pages` en verde, y se documenta su
> estado en `18-estado-y-plan-de-desarrollo.md` y `CHANGELOG.md`.
