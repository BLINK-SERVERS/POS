# 18 · Auditoría de código de `app/` (BLINK POS)

> Auditoría estática de la aplicación propia (`app/`, React 19 + Vite + TypeScript).
> Objetivo: saber con precisión **qué está implementado de verdad**, qué está a medias y
> qué está roto, para priorizar la réplica P1 de `docs/17`.
> Fecha: 2026-10-15 · Método: lectura completa de `app/src` + `tsc --noEmit` + `vite build`.

> ## ⚠️ Estado al 2026-10-18 (v1.1.1) — este informe es un **instantánea histórica**
>
> Los hallazgos de abajo se levantaron el **2026-10-15**. Desde entonces se corrigió lo
> esencial; **no tomes esta fecha como estado actual** (el estado vigente vive en
> `18-estado-y-plan-de-desarrollo.md`). Resumen de lo resuelto:
>
> | Hallazgo del 2026-10-15 | Estado hoy |
> |---|---|
> | «Compilación rota: **9 errores** de `tsc`» (§3) | 🟢 **0 errores** — `npm run typecheck` en verde |
> | «Caja se abre pero **nunca cierra**» (B2) | 🟢 **Cerrada** — `closeCash` con arqueo real (Fase 1 · ítem 8) |
> | `moveAccount` inexistente → `TypeError` (B1) | 🟢 corregido (la acción real es `adjustAccount`) |
> | `metrics` sumaba gastos y capital mal (B4) | 🟢 corregido (v1.0.0) |
> | Compras/stock sin trazabilidad (B6) | 🟢 corregido (v1.0.0: `addPurchase` + pestañas reales) |
> | Alta de producto/contacto descartaba campos (B7/B8) | 🟢 corregido (forms completos, Fase 1–2) |
> | Historial sin estados reales ni anulación (B9) | 🟢 corregido (Fase 1 · ítem 2) |
> | **Pruebas: 0** | 🟢 **26 pruebas** (`npm test`) + integración de migraciones |
> | **`app/README.md` corrupto (7 MB)** | 🟢 reescrito (5 KB) |
> | **Sin `.gitignore` ni repo git** | 🟢 repo `BLINK-SERVERS/POS` con `.gitignore` |
> | Sin `ErrorBoundary` (pantalla blanca) | 🟢 añadido en **v1.1.1** |
> | Sin validación de existencia en el POS (menor) | 🟢 **v1.1.1**: acota al stock y marca «Agotado» |
>
> Se mantiene el detalle histórico abajo para trazabilidad. Los ítems que **siguen abiertos**
> (sub-informes, `receiptFields`/impresión, canales/ubicaciones en la venta, filtros,
> importación, confirmaciones destructivas, accesibilidad del `Modal`) están priorizados en el
> backlog de `18` §7.

---

## 1. Resumen ejecutivo

- **El modelo de datos y el motor de negocio están casi completos; la UI es la que está a medias.**
  `lib/types.ts` y `lib/store.tsx` ya definen y operan descuentos, recargos, movimientos,
  transferencias, pendientes CxC/CxP, cierres de caja, IVA por producto, IGTF, comisiones,
  tipos de documento, categorías de gasto y cuentas abiertas del POS.
- **La compilación está rota:** `npm run typecheck` falla con **9 errores** (6 archivos).
- **Hay una acción fantasma que rompe Finanzas en tiempo de ejecución** (`moveAccount`).
- **La caja se puede abrir pero nunca cerrar:** el botón existe y no hace nada.
- Muchas acciones del store **nunca se invocan** desde la UI: el negocio está en el motor, no en la pantalla.

| Métrica | Valor |
|---|---|
| Archivos fuente | 24 (`src/`) |
| Líneas aprox. | ~3.500 |
| Errores de `tsc` | 9 |
| Acciones del store | 31 |
| Acciones sin uso en la UI | 17 |
| Páginas | 11 (2 de auth + 9 internas) |
| Pruebas automatizadas propias | 0 (solo scripts Playwright de reconocimiento) |

---

## 2. Inventario de archivos

| Ruta | KB | Rol | Estado |
|---|---|---|---|
| `src/main.tsx` | 0,4 | arranque | ✅ |
| `src/App.tsx` | 3,2 | rutas + guardas | ✅ |
| `src/lib/types.ts` | 5,2 | modelo de dominio | ✅ completo |
| `src/lib/store.tsx` | 26,8 | estado + persistencia + acciones | ✅ motor completo |
| `src/lib/money.ts` | 1,1 | formato dual USD/Bs | ✅ |
| `src/lib/fiscal.ts` | 1,7 | IVA, IGTF, recargos, descuento | ✅ |
| `src/lib/metrics.ts` | 4,0 | KPIs, utilidad, capital | 🟡 2 bugs |
| `src/components/Icon.tsx` | 3,6 | 22 iconos SVG | ✅ |
| `src/components/ui.tsx` | 4,0 | primitivas | 🟡 modal sin ESC/foco |
| `src/components/DataTable.tsx` | 2,9 | tabla + virtualización | 🟡 alto fijo de fila |
| `src/components/Shell.tsx` | 5,2 | topbar + sidebar + caja | ❌ cerrar caja no funciona |
| `src/pages/Login.tsx` | 3,2 | acceso (demo) | 🟡 auth simulada |
| `src/pages/CrearComercio.tsx` | 2,0 | registro (demo) | 🟡 |
| `src/pages/Inicio.tsx` | 4,8 | KPIs + checklist + por atender | 🟡 parcial |
| `src/pages/Vender.tsx` | 24,8 | POS | ✅ casi completo |
| `src/pages/Historial.tsx` | 3,5 | historial | 🟡 parcial |
| `src/pages/Catalogo.tsx` | 6,7 | productos + categorías | 🟡 parcial |
| `src/pages/Inventario.tsx` | 7,7 | existencias/movimientos/compras | 🟡 parcial |
| `src/pages/Contactos.tsx` | 4,4 | clientes/proveedores | 🟡 parcial |
| `src/pages/Finanzas.tsx` | 10,7 | cuentas/gastos | ❌ roto |
| `src/pages/Informes.tsx` | 7,3 | resultados | 🟡 parcial |
| `src/pages/Ajustes.tsx` | 6,5 | negocio/moneda/recibo | 🟡 parcial |

---

## 3. Errores de compilación (`npm run typecheck`)

```
src/components/Shell.tsx(36,36): 'closeCash' is declared but never read
src/components/Shell.tsx(41,10): 'closeOpen' is declared but never read
src/components/Shell.tsx(42,10): 'cUsd' is declared but never read
src/components/Shell.tsx(43,10): 'cBs' is declared but never read
src/pages/Catalogo.tsx(72,16): addProduct() missing barcode, unit, taxRate, trackStock
src/pages/Contactos.tsx(47,16): addContact() missing docType, email, address, notes
src/pages/Finanzas.tsx(64,23): Property 'moveAccount' does not exist on StoreActions
src/pages/Finanzas.tsx(248,26): addAccount() missing commissionIn, commissionOut
src/pages/Finanzas.tsx(306,26): addExpense() missing 'paid'
src/pages/Inventario.tsx(130,32): addProduct() missing barcode, unit, taxRate, trackStock
```

Todos son **síntoma del mismo problema**: el modelo se amplió y los formularios no se actualizaron.

---

## 4. Bugs funcionales (prioridad alta)

| # | Dónde | Bug | Impacto |
|---|---|---|---|
| B1 | `Finanzas.tsx:64,283` | Invoca `moveAccount(...)`, que no existe en el store (la real es `adjustAccount(accountId, newBalance)`). | **TypeError al pulsar Ingresar/Retirar.** La pantalla de cuentas no permite mover dinero. |
| B2 | `Shell.tsx:104-120` | El botón "Cerrar caja" solo setea estado local; **no hay modal de cierre** y `closeCash` nunca se llama. | La caja queda abierta para siempre; `cashClosures` nunca se alimenta. |
| B3 | `Finanzas.tsx` | No hay pestaña **Movimientos** ni **Transferencias** ni **Pendientes**: `movements`, `transfers` y `pendings` solo se escriben desde el POS. | En Finanzas no se ve el libro de dinero ni se abonan cuentas. |
| B4 | `metrics.ts:35-58` | `expenses` suma **todos** los gastos, pagados o no. Además `capital()` suma saldos VES y USD como si fuesen USD. | Utilidad y capital incorrectos con multi-moneda y gastos pendientes. |
| B5 | `Finanzas.tsx:306` | `addExpense` no envía `paid`, y el gasto **no descuenta de ninguna cuenta**. | El gasto no mueve dinero ni aparece como pendiente. |
| B6 | `Inventario.tsx:83-89` | `registrarCompra` ignora el costo unitario y **no guarda ninguna compra ni movimiento**, ni actualiza el costo del producto. | No hay trazabilidad de compras ni actualización de costo. |
| B7 | `Catalogo.tsx:70-85` | El alta de producto **descarta** tipo, unidad, IVA, código de barras y "controlar inventario" (siempre `type:"simple"`, `taxRate` heredado del seed). | Todo producto nuevo nace con datos por defecto erróneos. |
| B8 | `Contactos.tsx:45-56` | El alta de contacto **descarta** tipo de documento, correo, dirección y notas. | No se puede llevar CxC/CxP con datos fiscales. |
| B9 | `Historial.tsx:99-105` | Solo hay dos estados visuales (Crédito/Cobrada). **Cotización y Anulada se muestran como "Cobrada".** | Historial engañoso; no hay forma de anular. |
| B10 | `Inicio.tsx:109` | "Por atender" solo lista stock bajo. Faltan caja sin cerrar, gastos por pagar y pendientes. | No es el panel de tareas de Wink. |
| B11 | `store.tsx:386` | `login(email)` **ignora el correo** (parámetro `_email`) y todo el app hardcodea "Diego Beleño". | No hay identidad de usuario real. |
| B12 | `Ajustes.tsx:115-131` | La pestaña "Moneda e impuestos" **no gestiona impuestos** (no hay CRUD aunque `Tax`/`addTax`/`updateTax` existen). | No se puede cambiar el IVA ni añadir IGTF configurable. |

---

## 5. Cobertura UI vs. motor (acciones sin usar)

Acciones definidas en el store que **ninguna** página invoca:

`updateAccount`, `removeAccount`, `transfer`, `transferBetween`, `adjustAccount`,
`payExpense`, `addRecurringExpense`, `removeRecurringExpense`, `addPending`,
`abonoPending`, `addExpenseCategory`, `toggleExpenseCategory`, `addTax`, `updateTax`,
`addDiscount`, `removeDiscount`, `addSurcharge`, `removeSurcharge`, `closeCash`.

→ 19 de 31 acciones (61 %) **no tienen interfaz**. Es el trabajo central de la réplica P1.

---

## 6. Estado por módulo frente a `docs/17`

| Módulo | Página | Lo que ya hay | Lo que falta (P1) |
|---|---|---|---|
| Shell | `Shell.tsx` | topbar, tasa, abrir caja, usuario | **cerrar caja con arqueo**, calculadora de tasa, toasts |
| Inicio | `Inicio.tsx` | KPIs hoy/mes, checklist, capital, stock bajo | "Por atender" completo, cierre del día |
| Vender | `Vender.tsx` | buscador, grid, ticket, cuentas abiertas, descuento, recargos, nota, cotización, multi-cobro, IGTF, crédito | 🔵 solo falta pulir/mesas |
| Historial | `Historial.tsx` | KPIs, tabla | estados reales (cotización/anulada), anular, cajero, filtros |
| Catálogo | `Catalogo.tsx` | productos (tabla+alta), categorías (lista) | form completo, **Precios**, **Descuentos**, **Recargos**, categorías CRUD, archivados, editar |
| Inventario | `Inventario.tsx` | existencias, ajuste simple, compra simple | **devoluciones, ajustes como documento, traslados**, filtros, movimientos reales, compras con forma de pago |
| Contactos | `Contactos.tsx` | tabla + alta básica | tipo doc, correo, ficha, filtros, importar |
| Finanzas | `Finanzas.tsx` | cuentas (roto), gastos (simple), recurrentes (vacío) | **movimientos, transferencias, pendientes, categorías**, comisiones, cierre |
| Informes | `Informes.tsx` | resultados, series, capital | sub-informes Ventas/Inventario/Finanzas con desgloses |
| Ajustes | `Ajustes.tsx` | negocio, tasa, recibo | **impuestos**, canales, ubicaciones, usuarios, bitácora |

---

## 7. Deuda técnica y calidad

1. **Sin pruebas propias.** Solo hay scripts de reconocimiento. No hay tests unitarios de
   `fiscal.ts` / `metrics.ts` (donde viven los cálculos críticos) ni de integración del POS.
2. **`app/README.md` corrupto:** 7.292.511 bytes con cientos de miles de líneas en blanco
   (>99 % del archivo es ruido). Hay que reescribirlo.
3. **README raíz desactualizado:** enlaza `docs/12 · estructura-dom.md` y
   `docs/13 · estructura-layout.md`, que en disco son `docs/estructura-dom.md` y
   `docs/estructura-layout.md`.
4. **`moveAccount`** es un resto de una API anterior: el contrato del store cambió y la página no.
5. **Sin `.gitignore` ni repositorio git:** `node_modules/` (raíz y `app/`) queda versionable por accidente.
6. **Accesibilidad:**
   - `Modal` no cierra con `Esc`, no atrapa el foco ni lo restaura.
   - `Tabs` no soporta navegación con flechas (patrón tablist incompleto).
   - En `Vender`, las "cuentas abiertas" son `<span role="button">` con un `<button>` anidado (HTML inválido).
7. **Rendimiento:** `DataTable` virtualiza con `rowHeight = 45` fijo; las filas de dos líneas
   (precio + Bs) descuadran el scroll al superar 150 filas. Las páginas Inicio/Informes/Ajustes
   usan `useStoreState` (re-render total) en vez de selectores.
8. **`seed()`** deja `Harina de maíz 1kg` con `stock 0 / minStock 6`: la app arranca con una alerta
   de stock baja artificial.
9. **Persistencia:** todo vive en `localStorage` (clave `blink-pos-state-v1`), sin migraciones
   versionadas; `load()` fusiona de forma tolerante pero no descarta campos obsoletos.

---

## 8. Lo que está bien y conviene preservar

- Separación limpia **motor de negocio (`lib/`) ↔ UI (`pages/`)**.
- `useSyncExternalStore` con **suscripciones por selector** (`useStoreSelector`): bien pensado.
- Contexto de **acciones separado** del estado → despachar no re-renderiza.
- Persistencia con *debounce* + volcado en `pagehide`/`visibilitychange` + sync entre pestañas.
- `fiscal.ts` y `money.ts` pequeños, puros y testeables.
- `Vender.tsx` es una implementación del POS genuinamente completa.
- Sistema de diseño propio, paleta de 3 colores, iconos SVG originales, cero dependencias de UI.

---

## 9. Plan de corrección derivado (P1)

| Orden | Trabajo | Archivos |
|---|---|---|
| 1 | Reparar compilación y `moveAccount` | `Finanzas.tsx`, `Catalogo.tsx`, `Contactos.tsx`, `Inventario.tsx` |
| 2 | Cerrar caja con arqueo y duración | `Shell.tsx`, `store.tsx` |
| 3 | Finanzas: Movimientos, Transferencias, Pendientes, Categorías, comisiones | `Finanzas.tsx` |
| 4 | Catálogo: form completo, Precios, Descuentos, Recargos, categorías CRUD, archivados | `Catalogo.tsx` |
| 5 | Inventario: movimientos reales, compras con forma de pago, devoluciones, ajustes, traslados, filtros | `Inventario.tsx` |
| 6 | Historial: estados reales + anular + filtros | `Historial.tsx` |
| 7 | Contactos: tipo doc, correo, ficha | `Contactos.tsx` |
| 8 | Ajustes: impuestos (+ canales) | `Ajustes.tsx` |
| 9 | Inicio: "Por atender" completo | `Inicio.tsx` |
| 10 | Arreglos de cálculo (`metrics.ts`) y accesibilidad (`ui.tsx`) | `metrics.ts`, `ui.tsx` |

El detalle de lo implementado y el backlog vigente viven en `18-estado-y-plan-de-desarrollo.md`
(§4 mapa de estado, §7 backlog). *(Nota: aquí se enlazaba antes `docs/19-cobertura-y-replica.md`,
un nombre que nunca existió en disco; el `19` real es `19-despliegue-gh-pages.md`.)*
