# 18 · Estado del desarrollo y plan de traspaso

**Fecha de este documento: 2026-10-15.** Este es el documento de referencia del **estado real
del código** y de **qué queda por hacer**. Los documentos `16` (inventario funcional de Wink)
y `17` (mapa de brechas) son referencia de comportamiento; si algo contradice a este `18`,
manda `18`.

> Regla del proyecto: replicamos **comportamiento funcional** de Wink, nunca código, estilos,
> marca ni marcado. Todo en BLINK es diseño y código originales, con la paleta estricta
> (`#FFFEFB`, `#007AFF`, `#424242`), tipografía del sistema e iconos en SVG.

---

## 1. Estado en un vistazo

| Verificación | Estado (2026-10-15) | Cómo |
|---|---|---|
| Tipos | 🟢 verde | `npm run typecheck` (exit 0) |
| Build producción | 🟢 verde (~4,1 s) | `npm run build` |
| Tests | 🔴 no existen | — |
| Linter / formateador | 🔴 no existen | — |
| CI | 🔴 no existe | — |
| Deploy | 🟢 en vivo | https://blink-servers.github.io/POS/ — ver doc `19` |

> **Cambios recientes (2026-10-17) · Ajuste responsive (móvil).** El shell ahora es usable en
> teléfono: en anchos ≤ 860 px la barra lateral pasa a ser un **panel deslizante (drawer)** con
> botón hamburguesa en la barra superior, fondo oscurecido y cierre automático al navegar. Se
> corrigió el desborde horizontal (antes la navegación se apilaba en fila y empujaba el
> contenido). El chip de tasa se acorta en móvil y el nombre del negocio se recorta con
> elipsis. Verificado sin overflow de **320 a 1280 px** en las 9 rutas y en el POS.

> **Cambios recientes (2026-10-17) · Fase 3: cuentas reales, datos en la nube y alta guiada.**
> Se reemplazó el acceso simulado por **Supabase Auth** (correo + contraseña). El registro pide
> datos personales reales (nombre, apellido, teléfono, correo) y **verifica el correo con un
> código de 6 dígitos** (plantilla con `{{ .Token }}`). Tras verificar, un **asistente paso a
> paso (onboarding)** pide: datos del comercio y su giro, los módulos que quiere usar, su
> **cuenta para recibir pagos** (nombre, divisa USD/VES y si participa del cierre de caja),
> categorías, productos y proveedores. **Se eliminaron los datos ficticios**: el estado inicial
> está vacío y el comercio se guarda en **Supabase** (tabla `businesses`, una fila por usuario,
> con RLS). Detalle de la configuración en el documento `20`. La persistencia es local
> (caché) y remota (debounce), y el acceso directo al `store` sin sesión queda bloqueado por el
> *gate* de `App.tsx`.

**Consecuencia:** el `typecheck` es la única red de seguridad. Toda tarea debe terminar con
`npm run typecheck` y `npm run build` en verde (ver checklist §8).

Tamaño actual de los *chunks* del build (gzip): vendor 81,98 kB · index 12,74 kB ·
Vender 4,22 kB · el resto de rutas 0,6–2,4 kB. Las 9 rutas internas están diferidas con
`React.lazy`; el vendor está particionado con `manualChunks` (Rolldown/Vite 8).

**Alcance funcional de hoy:** BLINK vende de punta a punta: abrir caja → multi-cuenta en el
POS → descuento por código (con vigencia) → recargos → IVA por producto → cobro multi-método
(cuentas + A crédito) con IGTF 3 % en USD → historial (con anulación) → cierre de caja con
arqueo → informes básicos. **Finanzas** ya cubre cuentas (con comisiones), libro de
movimientos, transferencias, pendientes CxC/CxP con abonos, gastos (pagar/anular), recurrentes,
categorías de gasto y registros de cierre.

**La gran asimetría del proyecto:** la capa de datos (`lib/types.ts` + `lib/store.tsx`) está
mucho más adelantada que la interfaz. Quedan **decenas de acciones de store sin UI** (listadas
en §4 y §7): el modelo de negocio está modelado casi completo, lo que falta es pantallas.

---

## 2. Cómo ejecutar

```bash
cd "C:\Users\prodz\Desktop\BLINK POS\app"
npm install
npm run dev                      # http://localhost:5173
npx vite --host 0.0.0.0          # acceso desde el celular por LAN (http://192.168.1.158:5173)
npm run typecheck                # tsc --noEmit
npm run build                    # build producción -> dist/
npm run preview                  # sirve dist/
```

**Datos:** la cuenta y el comercio viven en **Supabase** (doc `20`). En el navegador queda una
**caché** y la sesión:

- `blink-pos-state-v3` — caché local del documento del comercio (la fuente de verdad es Supabase).
- Sesión de Supabase — la administra `supabase-js` en `localStorage`.
- Las claves antiguas (`blink-pos-state-v1`, `blink-pos-state-v2`, `blink-pos-auth-v1`) se
  **borran** al arrancar (tenían datos ficticios).

Para reiniciar el comercio: **Ajustes → Cuenta → Borrar todos los datos** (vuelve al alta
guiada y sincroniza el borrado con Supabase).

### 2.1 Supabase (cliente + uso en la UI)

`src/lib/supabase.ts` expone `createClient(url, publishableKey)` con las dos variables `VITE_*`.
Desde la Fase 3 **sí se usa en la interfaz**: `lib/cloud.ts` envuelve autenticación y datos.

Se instaló `@supabase/supabase-js` como base y, en la Fase 3, pasó a ser la capa de datos real:
**auth + `businesses` (con RLS)**. El cliente mantiene un enfoque local-first con **caché** local
y sincronización remota. El detalle está en el documento `20`.

Archivos nuevos en `app/`:

| Archivo | Qué es |
|---|---|
| `src/lib/supabase.ts` | `export const supabase = createClient(url, publishableKey)` |
| `src/lib/cloud.ts` | sesión, registro con OTP y comercio (una fila por usuario) |
| `supabase/migrations/0001_init.sql` | esquema + políticas RLS (se ejecuta en Supabase) |
| `src/vite-env.d.ts` | tipado de `import.meta.env` para las dos variables `VITE_*` |
| `.env.local` | valores reales (en `.gitignore`, **no** se versiona) |
| `.env.example` | plantilla con la explicación de seguridad |
| `.gitignore` | ignora `node_modules/`, `dist/` y `.env*` |

Variables (solo lo que empieza por `VITE_` es público, se incluye en el bundle):

```bash
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

> ⚠️ **Regla de seguridad:** en el navegador **solo** va la clave pública
> (`publishable`/`anon`). La **secret key** y el `service_role` saltan el RLS y dan acceso
> total a la base de datos: se usan únicamente en el servidor, jamás en `VITE_*`.

Verificado: `typecheck` y `build` en verde; la clave pública responde en
`/auth/v1/health` (GoTrue 200).

---

## 3. Arquitectura y convenciones

### 3.1 Capas

```
lib/types.ts      modelo de dominio (interfaces puras; sin lógica)
lib/store.tsx     estado global observable + acciones + persistencia (local + nube)
lib/cloud.ts      Supabase: sesión, registro con OTP y comercio (una fila por usuario)
lib/fiscal.ts     cálculo fiscal puro (base, IVA, recargos, IGTF)
lib/metrics.ts    métricas de negocio puras (ventas, utilidad, capital, series)
lib/money.ts      formato USD/Bs, redondeo
lib/supabase.ts   cliente de Supabase (solo clave pública)
components/*      Shell, ui (primitivas), Icon, DataTable, OtpInput
pages/*           una página por módulo, autocontenida (+ Login, Registro, Onboarding)
```

- **Store externo:** `useSyncExternalStore` + selectores por hook (`useStoreSelector`).
  Un componente que solo selecciona `s.products` no se re-renderiza si cambia `cashSession`.
- **Acciones en contexto aparte** (`useStoreActions`): despachar no provoca re-render.
- **Persistencia:** serializable + debounce de 250 ms + volcado en `beforeunload`/`pagehide`/
  `visibilitychange` + sincronización entre pestañas por evento `storage`.

### 3.2 Convenciones a mantener

1. **Textos de interfaz siempre en español.** Identificadores cortos del store en inglés
   técnico (`addProduct`), tipos de dominio en singular (`Product`), clases CSS en BEM.
2. **Iconos:** solo SVG, agregados a `components/Icon.tsx`. Nada de emoji.
3. **Paleta estricta:** usar las clases/tokens existentes; no introducir colores nuevos
   (los estados se derivan con transparencia, ver `styles/tokens.css`).
4. **Filas de tabla memoizadas** (`ProductRow`, `ContactRow`, `ExpenseRow`): el patrón
   existente evita que escribir en un formulario re-renderice la tabla completa.
5. **Selectores específicos:** `useStoreSelector((s) => s.x)` cuando solo se necesita un
   campo; `useStoreState()` completo solo en páginas que usan muchos campos.
6. **`Modal` recibe `{ title, onClose, children }`**, nada más.
7. **Sin dependencias nuevas** sin acordar (hoy solo React, React DOM y React Router).

### 3.3 Cómo añadir una funcionalidad (paso a paso)

1. **Tipo** en `lib/types.ts` si el modelo no lo tiene ya (casi todos los del plan existen).
2. **Acción** en `lib/store.tsx`: firma en `StoreActions` + implementación que muta
   `currentState` y llama `commit()`. Mantener la lógica de negocio en acciones o en
   `fiscal.ts`/`metrics.ts` (puros, testeables), nunca en los componentes.
3. **UI** en la página correspondiente; destrucutar **solo** las acciones usadas.
4. Persistencia es automática si el estado es serializable (no guardar funciones ni refs).
5. `npm run typecheck` → verde. `npm run build` → verde.
6. Recorrer el flujo manual en el navegador (§8) y, si cambió UI, probar por LAN en el celular.

> **Historia útil:** el modelo creció en paralelo sin actualizar las páginas y rompió el build
> con 7 errores. Corregir consistencia fue trivial; evitarlo es más barato: **typecheck por
> cambio, siempre.**

---

## 4. Mapa del estado por módulo

Columnas: **UI hoy** = lo que se ve y funciona · **Listo sin UI** = tipos y acciones del store
ya implementadas, esperando pantalla · **Falta** = el trabajo real pendiente.

| Módulo | UI hoy | Listo sin UI | Falta |
|---|---|---|---|
| **Login / Crear comercio** | ✅ completo | — | — |
| **Inicio** | ✅ KPIs Hoy/Mes, checklist de arranque, "Por atender" (stock bajo), cierre del día, capital | — | ampliar "Por atender": caja sin cerrar, pendientes vencidos, gastos fijos del mes |
| **Vender (POS)** | ✅ multi-cuenta (pestañas), buscador por nombre/SKU/código de barras, descuento por código **con vigencia validada**, recargos múltiples, nota de venta, IVA por producto, cobro multi-método (cuentas + A crédito), IGTF 3 % en USD, "monto exacto", cotización | `channelId`/`locationId` en `Sale` | dividir cuenta; mesas; registrar canal/ubicación de la cuenta en la venta |
| **Historial** | ✅ KPIs (vendido, nº, ticket, a crédito), estados Cobrada/Crédito/Cotización/Anulada, botón **Anular** con motivo | `voidSale(id, reason)` | filtros por fecha/estado, detalle de venta |
| **Catálogo** | ✅ 5 tabs: Productos (alta/edición/archivar/reactivar), **Precios por canal** (edición por canal + % masivo), Descuentos y Recargos (CRUD), **Categorías** (CRUD con orden/estado) | — | filtros Todos/Activos/Archivados; importar |
| **Inventario** | ✅ Existencias (KPIs valor costo/venta, alertas, ajuste manual de stock) | compras reales (`addPurchase`), libro de movimientos (`inventoryMoves`), devoluciones (`addStockReturn`), ajustes documentados (`addStockAdjustment`), traslados (`addStockTransfer`) | tab **Movimientos** con datos reales; tab **Compras** que registre compra real (proveedor, pago, líneas); devoluciones/ajustes/traslados con pantalla; filtros bajo mínimo/agotados |
| **Contactos** | ✅ tabla + alta completa (tipo doc, documento, teléfono, correo, dirección, notas, cliente/proveedor/ambos, días de crédito) | `updateContact` | editar contacto, ficha con cuenta corriente (pendientes del contacto), filtros |
| **Finanzas** | ✅ Cuentas (alta con moneda/tipo **y comisiones**; ingreso/retiro manual con movimiento), Movimientos (libro con filtro por cuenta), Transferencias (con comisión), Pendientes CxC/CxP (alta, abono, anulación), Gastos (alta con nombre/categoría/cuenta, pagar, anular con reverso de dinero), Gastos recurrentes (alta + generar vencidos), Categorías de gasto (alta, activar/desactivar; la del sistema IVA/IGTF queda fija), Cierres de caja | `adjustAccount`, `updateAccount`, `removeAccount` | ajuste con motivo, editar/eliminar cuenta |
| **Informes** | ✅ Resultados (KPIs, comparación vs mes anterior, desglose ventas→utilidad, capital), tabs Ventas/Inventario/Finanzas básicas | — | sub-informes completos: ventas por canal/categoría/cliente/método; finanzas (entradas/salidas, antigüedad CxC/CxP); export PDF |
| **Ajustes** | ✅ Negocio (datos), Moneda (tasa + fecha), Recibo (título, formato, pie, vista previa) | impuestos (`addTax`, `updateTax`, `setDefaultTax`), canales (CRUD), ubicaciones (CRUD), `receiptFields` | tabs **Impuestos**, **Canales**, **Ubicaciones**; UI de `receiptFields`; más adelante: comportamiento, usuarios/roles, bitácora |
| **Shell** | ✅ navegación, chip de tasa, abrir caja, cerrar caja con **arqueo real** (esperado = fondo + entradas − salidas del turno; contado USD/Bs + nota) | `cashClosures` | calculadora de tasa |

---

## 5. Contrato del store (lo que hay que conocer antes de programar)

### 5.1 Persistencia

- `STORAGE_KEY = "blink-pos-state-v3"` (caché local) · `LEGACY_KEYS` (v1, v2, auth) se borran ·
  `WRITE_DELAY = 250` ms. La **fuente de verdad es Supabase** (`businesses.data`), ver doc `20`.
- `USER`: variable (ya no constante) con el nombre del perfil autenticado; firma los movimientos.
  La sesión la resuelve `supabase.auth` (`useSessionUser`). Usuarios/roles de equipo es Fase 4.
- `booting` / `hydrate`: mientras se resuelve la sesión y se carga el comercio remoto, la UI
  muestra «Cargando…»; `hydrated` evita pisar la nube con el estado vacío antes de tiempo.

### 5.2 Firmas clave

```ts
checkout(input: CheckoutInput)                       // el corazón del POS
closeCash(countedUsd, countedBs, note)               // arqueo; guarda CashClosure
openCash(openingUsd, openingBs)
moveAccount(accountId, delta, note)                  // ingreso/retiro manual
adjustAccount(accountId, newBalance, motive, note)   // corrección con motivo
transfer(fromId, toId, amountUsd, commission, note)  // con comisión
addPurchase(purchaseInput)                           // compra → stock + movimientos + CxP opcional
addStockReturn / addStockAdjustment / addStockTransfer
addPending / abonoPending(id, accountId, amountUsd, note) / voidPending
addDiscount / updateDiscount / removeDiscount        // code en MAYÚSCULAS
addSurcharge / updateSurcharge / removeSurcharge
addTax / updateTax / setDefaultTax                   // IVA/IGTF del sistema: system=true
addExpenseCategory / updateExpenseCategory
addRecurringExpense / removeRecurringExpense / runRecurring
voidSale(id, reason)                                 // anula y revierte stock/dinero
```

### 5.3 Reglas fiscales (ya implementadas en `lib/fiscal.ts` y en `checkout`)

- `saleBase(venta)` = Σ(precio·qty) − descuento ··· IVA se calcula **por línea** con su
  `taxRate` (16 % por defecto; configurable por producto y por comercio).
- Un **descuento por venta** (por código), aplicado al subtotal **antes de IVA**.
- **Recargos:** varios por venta; el porcentaje aplica sobre el neto sin IVA.
- `igtfFor(monto)` = 3 % cuando el cobro es en **USD** (no en Bs).
- `ticketTotal` = base − descuento + IVA + recargos + IGTF.
- En `checkout`: la **cotización** no descuenta stock ni dinero; los **pagos parciales**
  son válidos; el resto se registra como **Pending "cobrar"** (cuenta por cobrar); cada
  cobro genera su `Movement`; `trackStock` descuenta existencias y genera su movimiento;
  el descuento incrementa su contador `used`.
- **Vigencia de descuentos:** `Vender.tsx` respeta `active`, `maxUses` y la ventana `from`/`to` (Fase 1, ítem 1).

### 5.4 Métricas (`lib/metrics.ts`)

- `isCountable(venta)`: excluye cotizaciones y anuladas del ticket promedio.
- `saleNet` = base − descuento (sin IVA) · `capital(state)` = cuentas + inventario a costo +
  por cobrar − por pagar · `metrics(...)` = ventas netas, costo de lo vendido, gastos,
  utilidad bruta/neta · `monthlySeries` para la gráfica de 6 meses.

---

## 6. Deuda técnica y riesgos (conocidos)

1. **Acciones sin UI** (§4): al cierre de la auditoría eran ~40; Fase 1 conectó varias en
   Finanzas. El trabajo pendiente sigue siendo de interfaz, no de modelo.
2. **Arqueo simplificado:** al cerrar caja, el "esperado" es el fondo inicial; no considera
   ventas en efectivo ni salidas del turno. *Fix:* calcular esperado = fondo + Σ entradas de
   efectivo del turno − Σ salidas (usando `state.movements` + pagos en cuentas de tipo
   `efectivo` desde `openedAt`). Archivos: `lib/store.tsx` (`closeCash`) y `components/Shell.tsx`.
3. **~~Descuentos sin vigencia:~~** resuelto en Fase 1, ítem 1 (`Vender.tsx` filtra `active`,
   `maxUses` y `from`/`to`).
4. **~~Comisiones de cuenta sin UI:~~** resuelto en Fase 1, ítem 6 (el alta de cuenta expone
   `commissionIn`/`commissionOut`).
5. **Compras no reales:** el modal "Registrar compra" de Inventario solo hace `setStock`;
   no usa `addPurchase`, por lo que no guarda proveedor, forma de pago, ni genera
   movimientos/CxP. Sustituir por el flujo completo.
6. **Canal y ubicación no se registran en la venta** aunque `Sale` tiene los campos; el POS
   usa siempre el precio del canal predeterminado.
7. **~~Historial sin anulación~~** resuelto en Fase 1, ítem 2 (requiere motivo; `voidSale`
   revierte stock, dinero y pendientes en el store).
8. **`receiptFields` sin UI:** el modelo define qué datos lleva el recibo; Ajustes no lo expone.
9. **Sin tests:** considerar tests unitarios de `fiscal.ts`, `metrics.ts` y `checkout` antes
   de tocar reglas fiscales (son funciones puras, baratas de testear).
10. **Sin backend:** los datos viven en el navegador. Exportar/importar estado y sincronización
    multi-dispositivo son decisiones de arquitectura pendientes (P3).
11. **Ediciones concurrentes:** el modelo creció en paralelo y rompió el build. Disciplina:
    typecheck por cambio (§3.3).
12. **Licencia tipográfica:** SF (Apple) solo es válida en entorno local; para publicar hay
    que sustituirla por una fuente licenciada (docs `03` y README).

### 6.1 Auditoría de código (2026-10-15 · ver fecha arriba)

Auditoría estática completa (store/fiscal/metrics, 11 páginas, 4 componentes, configs, CSS).
Resumen ejecutivo; el detalle con `archivo:línea` está en el informe de la sesión:

**Críticos (→ Fase 0 §7):** "monto exacto" USD cierra mal y genera crédito fantasma (C1);
arqueo ignora salidas de efectivo que no sean ventas (C2); `voidSale` revierte bruto y sin
asientos (C3); fallos de `localStorage` silenciados, riesgo de pérdida de datos (C4);
migración v1→v2 incompleta que puede crashear `closeCash` (I4, incluido en Fase 0).

**Importantes seleccionados:**
- `saleTotal` resta el descuento dos veces (`metrics.ts:28`) — export muerto, latente.
- `addPurchase`: total y costo promedio usan fuentes distintas; `paymentMethod:"efectivo"`
  no mueve dinero (`store.tsx:1402-1474`).
- Devoluciones/ajustes no cuadran libro vs stock ni dinero (`store.tsx:1488-1566`).
- Colisión de códigos de cotización (secuencia derivada del conteo de ventas).
- División por tasa sin proteger (`rate || 1`) en 4 puntos; tasa negativa aceptada.
- `useMemo` de `capital(state)` sin `pendings`/`rate` en deps (`Inicio.tsx:29`,
  `Informes.tsx:26`): capital desactualizado tras abonos.
- Inventario: "Registrar compra" ignora `addPurchase` y descarta el costo digitado;
  pestañas Movimientos/Compras son stubs pese a que el store registra todo.
- Historial etiqueta "Cobrada" para anuladas/cotizaciones y no hay UI de anulación. **[Fase 1 · ítem 2: resuelto.]**
- Gasto "Pagado ahora" sin cuenta (no mueve dinero) y admite montos negativos. **[Fase 1 · ítem 6: la cuenta es obligatoria y los montos se acotan a ≥ 0.]**
- Autenticación ficticia (cualquier contraseña ≥3 chars) — aceptable en demo, documentar.
- Sin `ErrorBoundary`: cualquier throw deja la app en blanco.
- Descuentos: `from`/`to` nunca se leen; las pistas "Créalos en Catálogo → Descuentos" apuntan a un Catálogo que no los tiene todavía. **[Resuelto: vigencia validada en el POS y CRUD completo en Catálogo → Descuentos/Recargos (Fase 1 · ítems 1, 9).]**
- *(Bug corregido)* `discounts.filter(isDiscountValid)` pasaba el índice como `now`, descartando todo descuento con `from`/`to`. Corregido a `filter((d) => isDiscountValid(d))`. **[Fase 1 · ítem 1.]**

**Menores:** etiqueta "IVA (16%)" hardcodeada en el POS; valores `"—"` guardados como datos;
`ExpenseRow` **ya muestra el nombre del gasto**; cierre convierte Bs a tasa actual; `key={i}`;
escáner sin auto-agregar con Enter; sin validación de existencia al agregar líneas;
páginas enteras suscritas al estado completo (Shell re-renderiza en cada cambio);
`runRecurring` muerto y con overflow de fecha (29-31); `remove*` sin confirmación ni
cascada; `storage` multi-pestaña last-write-wins; `dist/` commiteada.

**Modelo muerto (siempre dummy o sin escritura):** `SalePayment.amountInput/commission`,
`Business.receiptFields/printFormat` (no hay impresión),
`Transfer.correctionOf`, `AppState.openTabs`, `metrics.saleTotal/taxesCollected/openPendings`,
`fiscal.lineBase/ticketTotal`. *(Ya **no** están muertos: `Account.commissionIn/Out`,
`Discount.from/to` y `Pending.dueAt` (Fase 1); `Product.channelPrices` y
`add/update/removeCategory` (Fase 2 · ítems 11–12). El POS sigue usando `p.price` para cobrar.)*

**Acciones del store:** 15 usadas en UI al cierre de la auditoría · **44 sin uso** entonces
(Fase 1 conectó transferencias, pendientes, anulaciones de gasto, categorías de gasto,
gastos recurrentes, comisiones de cuenta, y el CRUD de descuentos/recargos y `updateProduct`
desde Catálogo). Sigue habiendo deuda de interfaz, no de modelo.

**Cumplimiento de diseño:** cero emoji, iconos 100 % SVG, cero `any`/`dangerouslySetInnerHTML`.
**Dos desvíos:** (a) `--color-accent-hover: #0062cc` (`tokens.css:15`) es un 4.º color —
derivarlo con `color-mix` sobre `#007AFF`; (b) `<strong>` pone negrita 700 implícita en
marcas del topbar y totales (Shell/Vender/Ajustes) — si aplica la regla de peso 400, resetear
`strong { font-weight: 400 }` o usar clases.

---

## 7. Backlog priorizado (orden de trabajo recomendado)

Cada ítem: **qué**, **archivo(s)**, **acciones a usar**, **criterio de aceptación (CA)**.

> **Nota (2026-10-17).** Además del backlog numerado, se ejecutó una **Fase 3 (cuentas reales +
> datos en Supabase + alta guiada)**, pedida aparte: Supabase Auth con código de 6 dígitos,
> asistente de onboarding sin datos ficticios y persistencia en `businesses` con RLS (doc `20`).
> Los ítems «Fase 3» de abajo son la **configuración y reportes** que ya estaban planificados; no
> confundir ambos usos del nombre.

### Fase 0 — Correcciones críticas (salen antes que todo lo demás)

Hallazgos de la auditoría de código del 2026-10-15 (detalle en §6.1):

1. **"Monto exacto" USD cierra mal y crea crédito fantasma.** `pages/Vender.tsx:205-209` +
   `store.checkout`. Divide `missing/1.03`; el cierre correcto es `missing/(1 − 0,03)`
   (≈ ×1,0309). Hoy queda un resto ~5,8 % que `checkout` convierte en venta "a crédito" sin
   avisar. CA: con "monto exacto" el `remaining` es 0 y el estado queda "cobrada"; si hay
   resto, el POS lo muestra y exige confirmar crédito.
2. **Arqueo que ignora salidas de efectivo.** `store.closeCash` (`store.tsx:944-953`) suma
   fondo + cobros en efectivo pero no descuenta gastos pagados, retiros ni transferencias
   salientes del turno. CA: esperado = fondo + entradas − salidas (libro de `movements`).
3. **`voidSale` revierte en bruto y sin asientos.** `store.tsx:896-901`: resta el bruto
   aunque se acreditó neto (comisión), no genera movimientos inversos ni decrementa
   `discount.used`. CA: reversión neta + asientos inversos + pendiente proporcional.
4. **Fallos de `localStorage` silenciados.** `store.tsx:560-574` traga `QuotaExceededError`:
   el cajero cree que guardó y no. CA: banner de error + ofrecer exportación JSON.
5. **Migración v1→v2 incompleta.** `normalize` (`store.tsx:272-315`) no rellena
   `sales[].payments/igtf/status/...` → `closeCash` crashea con datos v1. CA: backfill de
   defaults; migrar datos viejos sin crash.

### Fase 1 — Cerrar el núcleo (P1)

> ✅ **Ítems 1–7 hechos el 2026-10-15** (vigencia de descuentos, Historial con anulación, y las
> tabs de Finanzas: Movimientos, Transferencias, Pendientes, Gastos + Categorías, Cierres).
> ✅ **Ítems 8–10 hechos el 2026-10-15** (arqueo real en `closeCash` + Shell; Catálogo con
> 4 tabs: Productos con alta/edición/archivado, Descuentos y Recargos con CRUD; el POS
> excluye productos archivados). Verificado en navegador; `typecheck` y `build` en verde.
>
> 🐞 Bug corregido en el ítem 1: `discounts.filter(isDiscountValid)` pasaba el **índice** del
> array como parámetro `now`, de modo que todo descuento con `from`/`to` quedaba fuera del POS.
> Se cambió a `filter((d) => isDiscountValid(d))`.

1. **Validar vigencia de descuentos.** ✅ `pages/Vender.tsx`. Filtro `d.from`/`d.to` contra hoy.
   CA: un descuento fuera de vigencia no aparece en el diálogo ni se aplica por código.
2. **Historial: estados y anulación.** ✅ `pages/Historial.tsx` + `voidSale`. Badge Cotización/
   Anulada; botón Anular que pide motivo. CA: anular exige motivo, revierte stock y dinero,
   la venta queda visible como Anulada y sale de los KPIs.
3. **Finanzas → tab Movimientos.** ✅ `pages/Finanzas.tsx` (lista `state.movements` con cuenta,
   dirección, origen, usuario). CA: cada cobro/gasto/ajuste aparece en el libro.
4. **Finanzas → tab Transferencias.** ✅ `pages/Finanzas.tsx` + `transfer`. CA: transferir
   entre cuentas mueve saldos, descuenta comisión y registra movimientos en ambas.
5. **Finanzas → tab Pendientes (CxC/CxP).** ✅ `pages/Finanzas.tsx` + `addPending`,
   `abonoPending`, `voidPending`. CA: los créditos del POS aparecen aquí; abonar reduce el
   pendiente y registra el movimiento; el estado cambia abierto→parcial→saldado.
6. **Finanzas: pagar/anular gasto + tab Categorías de gasto.** ✅ `pages/Finanzas.tsx` +
   `payExpense`, `voidExpense`, `addExpenseCategory`. CA: un gasto sin pagar se paga desde
   una cuenta (genera movimiento) y la categoría del sistema IVA/IGTF no se puede desactivar.
7. **Finanzas → tab Registros de cierre.** ✅ `pages/Finanzas.tsx` (lee `state.cashClosures`).
   CA: cada cierre con fecha, fondo, contado, diferencia y nota.
8. **Arqueo real.** ✅ `lib/store.tsx` (`closeCash`) + `components/Shell.tsx`. Esperado =
   fondo + entradas − salidas del turno. CA: la diferencia se calcula contra el turno real,
   no contra el fondo inicial.
9. **Catálogo: tabs Descuentos y Recargos (CRUD).** ✅ `pages/Catalogo.tsx` + `addDiscount`,
   `updateDiscount`, `removeDiscount`, `addSurcharge`, `updateSurcharge`, `removeSurcharge`.
   CA: crear/editar/desactivar desde Catálogo; el POS lista solo los activos; código en
   mayúsculas; usos/vigencia respetados.
10. **Catálogo: editar y archivar producto.** ✅ `pages/Catalogo.tsx` + `updateProduct`.
    CA: editar sin perder stock/historial; archivar excluye del POS pero conserva datos.

### Fase 2 — Catálogo e inventario (P1/P2)

> ✅ **Ítems 11–12 hechos el 2026-10-16** (Catálogo con 5 tabs: se añadieron **Precios** y el
> CRUD de **Categorías**; el form de producto usa dropdown de categorías activas y precios por
> canal). Verificado en navegador; `typecheck` y `build` en verde.

11. **CRUD de categorías** (`Category` con orden/estado) + dropdown en el form de producto. ✅
    `pages/Catalogo.tsx` + `addCategory`, `updateCategory`, `removeCategory`.
    CA: crear/reordenar/desactivar; el form solo ofrece categorías activas (más el valor actual
    al editar un producto con una categoría ya inactiva).
12. **Tab Precios por canal** (`setChannelPrice`, `bulkPrice`) + variación por canal en el
    form. ✅ CA: editar el precio de cada producto por canal (commit al salir del campo); % masivo
    sobre el canal elegido; el canal predeterminado también ajusta el precio base.
13. **Compras reales** (`pages/Inventario.tsx` + `addPurchase`): proveedor, forma de pago,
    líneas con costo. CA: la compra aumenta stock, genera movimientos y, si es a crédito,
    crea un Pending "pagar".
14. **Tab Movimientos** con `state.inventoryMoves` (origen, usuario, ubicación). CA: cada
    venta/compra/ajuste genera su línea con referencia.
15. **Devoluciones, Ajustes y Traslados** (`addStockReturn`, `addStockAdjustment`,
    `addStockTransfer`). CA: cada operación registra su documento y sus movimientos.
16. **Gastos recurrentes** (`addRecurringExpense`, `runRecurring` al abrir caja). CA: el
    vencimiento mensual crea su gasto/pending sin duplicarse.
17. **Inicio: "Por atender" completo** (caja sin cerrar, pendientes vencidos, gastos fijos).

### Fase 3 — Configuración y reportes (P2)

18. **Ajustes → tab Impuestos** (`addTax`, `updateTax`, `setDefaultTax`). CA: IVA/IGTF del
    sistema no desactivables; el default del comercio alimenta el form de producto.
19. **Ajustes → tabs Canales y Ubicaciones** (CRUD) + UI de `receiptFields`. CA: crear
    canal/ubicación y que aparezcan en POS/Inventario.
20. **Informe Ventas** (por canal/categoría/cliente/método) y **Finanzas** (entradas/salidas,
    antigüedad de CxC/CxP). CA: tablas agregadas por el rango del mes.
21. **Vender: registrar canal/ubicación** de la cuenta en `Sale`. CA: la venta guarda
    `channelId`/`locationId` y el precio corresponde al canal.

### Fase 4 — Avanzado (P3)

22. Lotes FIFO (dividir/unir, corregir costo, vencimiento) · mesas · variantes/recetas ·
    usuarios y roles con permisos · bitácora de auditoría · importaciones masivas ·
    exportar/importar datos · calculadora de tasa · export PDF de informes.

---

## 8. Checklist de verificación por cambio

1. `npm run typecheck` → sin errores.
2. `npm run build` → sin errores; revisar el tamaño de chunks si cambió mucho.
3. Flujo manual mínimo: **abrir caja → vender (descuento + recargo + IVA) → cobrar en USD
   (ver IGTF) y otra a crédito → Historial → cerrar caja con arqueo → Informes cuadra**.
4. Si cambió UI: probar por LAN en el celular (`npx vite --host 0.0.0.0`) — la app es
   responsive y el POS está pensado para tacto.
5. Si se tocaron reglas fiscales: revisar `lib/fiscal.ts` con una calculadora real.

---

## 9. Documentos relacionados

- `16-wink-inventario-funcional.md` · relevamiento funcional completo de Wink (referencia).
- `17-wink-vs-blink-gap.md` · mapa de brechas y fases (complemento de este).
- `15-rendimiento-escalabilidad.md` · decisiones de rendimiento ya aplicadas.
- `03-*` · tipografía (licencia SF) y sistema de diseño.
