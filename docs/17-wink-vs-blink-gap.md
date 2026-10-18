# 17 · Wink POS vs BLINK POS — Brechas y plan de replicación

Compara el **inventario funcional de Wink** (`16-wink-inventario-funcional.md`) con lo que
BLINK implementa hoy, e indica qué falta y en qué prioridad.

> Regla del proyecto: replicamos **comportamiento funcional**, nunca código, estilos, marcado
> ni marca de Wink. Toda pieza nueva se diseña y se escribe de forma original en BLINK y con
> la paleta estricta (`#FFFEFB`, `#007AFF`, `#424242`), SF y todo icono en SVG.

**Leyenda:** ✅ presente · 🟡 parcial · ❌ ausente.
**Prioridad:** P1 (núcleo de negocio) · P2 (productividad) · P3 (avanzado/contable).

> **Estado real consolidado en `18-estado-y-plan-de-desarrollo.md` (revisión 2026-10-18,
> v1.1.1).** Este documento conserva el detalle funcional de referencia (qué debe hacer cada
> función); el `18` dice qué está implementado hoy, qué acciones del store ya existen sin UI,
> la deuda técnica conocida y el backlog exacto con archivos y criterios de aceptación. En caso
> de contradicción, manda el `18`.

---

## 1. Resumen por módulo (actualizado 2026-10-15)

| Módulo | BLINK hoy | Cobertura frente a Wink |
|---|---|---|
| Inicio | KPIs, checklist, "Por atender" (stock), cierre del día, capital | 🟡 falta ampliar "Por atender": caja sin cerrar, pendientes vencidos, gastos fijos; promos |
| Vender (POS) | multi-cuenta, cotización, descuento por código **con vigencia**, recargos, IVA por producto, IGTF 3 %, multi-cobro, A crédito, nota | 🟡 falta dividir cuenta, mesas, canal/ubicación |
| Historial | listado + KPIs + estados Cobrada/Crédito/Cotización/Anulada + anular con motivo | 🟡 faltan filtros, detalle de venta, importación |
| Catálogo | 5 pestañas: Productos (form completo + editar/archivar), **Precios por canal**, **Descuentos y Recargos (CRUD)**, **Categorías (CRUD)** | ✅ núcleo | 🟡 faltan filtros Todos/Activos/Archivados e importación |
| Inventario | Existencias + ajuste manual; Movimientos y Compras sin datos reales | 🟡 faltan compras reales, libro de movimientos, devoluciones, ajustes, traslados, lotes (FIFO), importación |
| Contactos | alta completa (tipo doc, correo, dirección, notas, crédito) | 🟡 falta editar, ficha/cuenta corriente, filtros, importación |
| Finanzas | 8 pestañas: Cuentas (con comisiones), Movimientos, Transferencias, Pendientes, Gastos (pagar/anular), Recurrentes, Categorías de gasto, Cierres de caja | 🟡 faltan ajuste de saldo con motivo, editar/eliminar cuenta |
| Informes | Resultados (KPIs + comparación vs mes anterior + desglose + capital); Ventas/Inventario/Finanzas básicos | 🟡 faltan sub-informes completos (Ventas, Finanzas), export PDF |
| Ajustes | Negocio, Moneda (tasa), Recibo (con vista previa) | 🟡 faltan Impuestos, Canales, Ubicaciones, `receiptFields`, Comportamiento, Usuarios, Bitácora |

---

## 2. Brechas detalladas

### 2.1 Shell / global
| Función Wink | Estado | Prio | Nota |
|---|---|---|---|
| Chip de tasa + **calculadora de tasa** | 🟡 | P2 | BLINK muestra tasa y "actualizada"; falta calculadora y "hace X h" |
| Tarjeta **Caja** (abrir/cerrar + duración) | 🟡 | P1 | Abrir y cerrar con arqueo (contado USD/Bs + nota) ya funcionan; el **esperado** del arqueo aún es el fondo inicial, no el turno real (deuda `18` §6.2) |
| **Mi perfil** (moneda de vista, contraseña, dispositivos) | ❌ | P3 | |
| Multi-**canal**/multi-**ubicación** en toda la app | 🟡 | P2 | Tipos y acciones (CRUD) listos; sin UI y sin uso en POS/Inventario |
| Toasts / confirmaciones | 🟡 | P2 | BLINK usa modales directos |

### 2.2 Inicio
| Función | Estado | Prio |
|---|---|---|
| KPIs Hoy/Mes (ventas netas, nº, ticket, utilidad) | ✅ | — |
| **"Por atender"** (stock bajo, caja sin cerrar, gastos fijos, pendientes) | 🟡 | P1 | Cubre stock bajo; faltan caja sin cerrar, pendientes vencidos y gastos fijos del mes |
| **Cierre del día** (resumen del día) | 🟡 | P2 | Existe la tarjeta "Cierre de hoy"; falta compartir/exportar por fecha |
| Onboarding/checklist | ✅ | — |
| Capital (a hoy) | ✅ | — |
| Promos tienda/WhatsApp | ❌ | P3 |

### 2.3 Vender (POS)
| Función | Estado | Prio |
|---|---|---|
| Buscador + grid + ticket + stepper | ✅ | — |
| **Multi-cuenta ("cuentas abiertas")** con pestañas, nueva/descartar | ✅ | — |
| **Cotización** (generar; estado Cotización; no descuenta stock ni dinero) | ✅ | — |
| **Dividir cuenta** (mover ítems a otra cuenta) | ❌ | P2 |
| **Mesas / salas** (asignar mesa) | ❌ | P3 (tras piezas) |
| **Multi-cobro** (varios métodos/parciales, referencia, monto exacto) | ✅ | — |
| Métodos = **cuentas configuradas** + **A crédito (CxC)** | ✅ | — |
| **IGTF 3 %** al cobrar en USD | ✅ | — |
| **Descuento por código** (uno por venta, sobre subtotal antes de IVA) | ✅ | — | Aplica, controla usos y **valida vigencia** (`from`/`to`) |
| **Recargos** (varios; % sobre neto sin IVA) | ✅ | — |
| **Nota de la venta** | ✅ | — |
| IVA por producto (16 % por defecto del comercio) | ✅ | — |
| Canal/ubicación de la cuenta (se registra en la venta) | ❌ | P2 | Campos en `Sale` listos; el POS no los llena ni usa `channelPrices` |

### 2.4 Historial
| Función | Estado | Prio |
|---|---|---|
| KPIs (vendido, ventas, ticket, a crédito) | ✅ | — |
| Estados reales: Cobrada / Crédito / Cotización / Anulada | ✅ | — |
| **Anular venta** con motivo (`voidSale`) | ✅ | — | Exige motivo; revierte stock y dinero |
| Fila con **cajero** y **método** | 🟡 | P2 | Método sí; cajero usa el usuario fijo de la sesión |
| Filtros por fecha/estado y detalle de venta | ❌ | P2 |
| **Importar / Plantilla** | ❌ | P3 |
| Enlace "Para el detalle, ve a Informes" | ❌ | P3 |

### 2.5 Catálogo
| Función | Estado | Prio |
|---|---|---|
| Productos (tabla + alta) | ✅ | — |
| Form completo: tipo Simple/Servicio, **Unidad**, **IVA**, **código de barras**, "controlar inventario" | ✅ | — |
| **Editar** producto y **archivar/reactivar** (`updateProduct`) | ✅ | — | El POS excluye archivados; conserva stock e historial |
| Filtros Todos/Activos/**Archivados** | ❌ | P2 |
| **Precios** (costo/margen por canal, cambiar precios, descargar) | ✅ | — | Tab **Precios**: edición por canal + % masivo |
| **Categorías** (nombre/estado/orden, CRUD) | ✅ | — | Tab **Categorías**: crear, renombrar, ordenar, activar/desactivar |
| **Descuentos** (código, %/monto, usos, vigencia) | ✅ | — | CRUD completo en Catálogo → Descuentos |
| **Recargos** | ✅ | — | CRUD completo en Catálogo → Recargos |
| Importar productos | ❌ | P3 |

### 2.6 Inventario
| Función | Estado | Prio |
|---|---|---|
| Existencias + valor a costo/venta + alertas de mínimo | ✅ | — |
| Ajuste manual de existencia | ✅ | — |
| Filtros Bajo mínimo / Agotados / Por vencer | 🟡 | P1 | Hay KPI de alertas; faltan filtros en la tabla |
| Movimientos (libro entrada/salida con origen/usuario) | ✅ (Finanzas) · ❌ (Inventario) | P1 | El libro de **cuentas** ya se ve en Finanzas; el de **inventario** sigue en stub |
| Compras (proveedor, forma de pago, líneas) | 🟡 | P1 | El modal solo ajusta stock (`setStock`); `addPurchase` listo para el flujo real |
| **Devoluciones a proveedor** | ❌ | P2 | Acción `addStockReturn` lista |
| **Ajustes** de inventario (documentos) | ❌ | P2 | Acción `addStockAdjustment` lista |
| **Traslados** entre ubicaciones | ❌ | P2 | Acción `addStockTransfer` lista |
| **Lotes FIFO**, dividir/unir, corregir costo, vencimiento | ❌ | P3 |
| **Importación** (compras/existencias) | ❌ | P3 |

### 2.7 Contactos
| Función | Estado | Prio |
|---|---|---|
| Alta cliente/proveedor/ambos | ✅ | — |
| **Tipo de documento** (V/E/J/RIF) + documento | ✅ | — |
| **Correo**, dirección y notas (en el formulario) | ✅ | — |
| **Días de crédito** en tabla | ✅ | — |
| **Editar** contacto (`updateContact` listo) | ❌ | P2 |
| Ficha de contacto (detalle, cuenta corriente) | ❌ | P2 |
| Importar | ❌ | P3 |

### 2.8 Finanzas
| Función | Estado | Prio |
|---|---|---|
| Cuentas (efectivo/banco/pago móvil, USD/VES) + saldo | ✅ | — |
| Ingreso/retiro manual (con movimiento y nota) | ✅ | — |
| **Comisión al recibir / al enviar** en cuentas | 🟡 | P2 | Campos `commissionIn`/`commissionOut` en el modelo; sin formulario (se guardan en 0) |
| **Comisiones al recibir/enviar** | ✅ | — | Alta de cuenta en Finanzas expone `commissionIn`/`commissionOut` |
| **Movimientos** (libro) | ✅ | — | Tab en Finanzas con filtro por cuenta, origen y usuario; `adjustAccount` sigue sin UI |
| **Transferencias** (+ comisión, `correctionOf`) | ✅ | — | Tab + formulario; registra movimientos en ambas cuentas |
| Gastos (alta con nombre/categoría/cuenta/pagado) | ✅ | — |
| **Pagar/anular gasto** (`payExpense`/`voidExpense`) | ✅ | — | Anular un gasto pagado devuelve el dinero a la cuenta |
| **Gastos recurrentes** (crean pendiente, no mueven dinero) | ✅ | — | Alta + "Generar vencidos" (idempotente) |
| **Pendientes** (CxC/CxP, abonos, antigüedad) | ✅ | — | Alta manual + abono + anulación; los créditos del POS aparecen aquí |
| **Categorías de gasto** (con categoría del sistema IVA/IGTF) | ✅ | — | Alta y activar/desactivar; la del sistema queda fija |
| **Registros de cierre de caja** | ✅ | — | Lista en Finanzas (fecha, fondo, esperado, contado, diferencia, nota) |
| **Exposición cambiaria** | ❌ | P3 |

### 2.9 Informes
| Función | Estado | Prio |
|---|---|---|
| Resultados (KPIs + composición utilidad + capital) | ✅ | — |
| Comparación vs período anterior | ✅ | — |
| Export PDF | ❌ | P2 |
| Sub-informe **Inventario** (rotación, hot, mermas, por vencer) | 🟡 | P3 | Hoy solo valor a costo/venta |
| Sub-informe **Ventas** (canal/categoría/cliente/usuario/pago, pico) | 🟡 | P2 | Hoy solo KPIs del mes |
| Sub-informe **Finanzas** (entradas/salidas, antigüedad CxC/CxP, turnos) | 🟡 | P2 | Hoy solo saldos por cuenta |

### 2.10 Ajustes
| Función | Estado | Prio |
|---|---|---|
| Negocio + Recibo (título/formato/pie + vista previa) | ✅ | — |
| `receiptFields` (qué datos lleva el recibo) | 🟡 | P1 | Modelo completo; sin UI |
| **Impuestos** (nombre + tasa fracción; IVA/IGTF del sistema) | ❌ | P1 | Acciones `addTax`/`updateTax`/`setDefaultTax` listas |
| **Canales** (nombre/descripción/activo, predeterminado) | ❌ | P2 | CRUD listo en el store |
| **Ubicaciones** (tipo, predeterminadas) | ❌ | P2 | CRUD listo en el store |
| **Comportamiento** (piezas + perfiles: mesas, recetas, variantes, lotes, cierre, crédito, comisiones) | ❌ | P3 |
| **Usuarios y roles** (invitar, permisos, ubicaciones) | ❌ | P3 |
| **Bitácora** (auditoría antes/después) | ❌ | P3 |

---

## 3. Reglas de negocio transversales (implementadas en BLINK)

1. **Dual USD/VES** en todos los importes (tasa de referencia; exposición cambiaria).
2. **IVA por producto** (16 % por defecto del comercio) en el cálculo del ticket. ✅
3. **IGTF 3 %** al cobrar en dólares. ✅
4. **Venta neta** = base − descuentos; **sin IVA** en reportes. ✅
5. **Ticket promedio** excluye cotizaciones y anuladas. ✅ (`isCountable`)
6. **Cotización ≠ venta.** ✅
7. **Un descuento por venta**; **varios recargos** (% sobre neto sin IVA); vigencia `from`/`to` validada. ✅
8. **Utilidad neta** = Ventas netas − Costo de lo vendido − Gastos. ✅ (falta mermas de inventario)
9. **Capital (a hoy)** = En cuentas + Inventario a costo + Por cobrar − Por pagar. ✅
10. **A crédito** genera cuenta por cobrar; abonable desde el tab Pendientes. ✅
11. **Inventario FIFO por lotes**; traslados; compras por proveedor con forma de pago. ❌ (acciones listas)
12. **Categoría de gasto del sistema** (IVA/IGTF) no desactivable. ✅ (tab Categorías de gasto)
13. **Gastos recurrentes** crean gastos pendientes (solo el vencimiento más reciente). ❌ (acción lista)
14. **Exposición cambiaria** informativa (no realizada). ❌
15. **Permisos por rol y ubicación**; desactivar usuario revoca sesiones. ❌ (sin usuarios reales)

---

## 4. Plan de replicación por fases

El orden detallado, con archivos y criterios de aceptación, está en `18` §7. Resumen:

**Fase 1 · Núcleo de venta (P1)**
1. ✅ Ticket POS con **IVA por producto**, **descuento por código**, **recargos**, **nota**.
2. ✅ **Multi-cobro** por cuentas + **A crédito** + **IGTF 3 %**.
3. ✅ **Multi-cuenta (cuentas abiertas)** y **cotizaciones**.
4. ✅ **Movimientos de cuenta** + **transferencias** (tab en Finanzas). *(Ajuste de saldo `adjustAccount` aún sin UI.)*
5. ✅ **Pendientes** (CxC/CxP) con abonos y anulación.
6. ✅ **Historial**: estados Cotización/Anulada + anular con motivo (`voidSale`).
7. ✅ Validar **vigencia** de descuentos en el POS.
8. ✅ **Arqueo real** al cerrar caja (esperado del turno).
9. ✅ **Descuentos** y **recargos** (CRUD en Catálogo).
   *(Además, Fase 1 añadió: comisiones de cuenta, pagar/anular gasto, gastos recurrentes, categorías de gasto y registros de cierre — ver `18` §7.)*

**Fase 2 · Catálogo e inventario (P1/P2)**
10. ✅ Form de producto completo (tipo, unidad, IVA, código de barras, control inventario).
11. ✅ **Precios por canal** y margen; **categorías** con orden/estado (CRUD).
12. ⬜ Inventario: **compras** con forma de pago real, **devoluciones**, **ajustes**, **traslados**, libro de movimientos, filtros.
13. ⬜ **Categorías de gasto** + reglas de recurrentes.
14. ✅ Editar/archivar producto *(hecho en Fase 1, ítem 10)*; ⬜ "Por atender" completo en Inicio.

**Fase 3 · Configuración y reportes (P2)**
15. ⬜ Ajustes: **Impuestos**, **Canales**, **Ubicaciones**, `receiptFields`.
16. ⬜ Informes: sub-informes Ventas y Finanzas, export PDF.
17. ⬜ Registrar canal/ubicación de la cuenta en la venta.

**Fase 4 · Avanzado (P3)**
18. ⬜ **Lotes FIFO** (dividir/unir, corregir costo, vencimiento).
19. ⬜ **Comportamiento (piezas/perfiles)**, **mesas/recetas/variantes/comisiones**.
20. ⬜ **Usuarios y roles**, **Bitácora**, importaciones masivas.

---

## 5. Estado de esta fase (2026-10-15)

- [x] Inventario funcional de Wink en vivo (`16`).
- [x] Mapa de brechas y prioridades (`17`).
- [x] Fase 1, ítems 1–3 (núcleo del POS) — implementados.
- [x] Form de producto completo (Fase 2, ítem 10) — implementado.
- [x] Caja: abrir y cerrar con **arqueo real** (esperado = fondo + entradas − salidas).
- [x] Estado consolidado + backlog detallado (`18`) — escrito.
- [x] Fase 1, ítems 1–10 — implementados y verificados en navegador (núcleo del POS, Historial,
      Finanzas completo, arqueo real, Catálogo con Productos edit/archivar + Descuentos/Recargos CRUD).
- [x] Fase 2, ítems 11–12 — Catálogo: tab **Precios por canal** + CRUD de **Categorías**.
- [ ] Fase 2, ítems 13–17 (inventario real: compras, movimientos, devoluciones/ajustes/traslados;
      gastos recurrentes al abrir caja; "Por atender" completo).

---

## 6. Deltas nuevos del relevamiento en vivo (2026-10-15)

Recorrido del Wink en producción (sesión iniciada) + sitio público (wink-pos.com). Reglas de
comportamiento que BLINK no contemplaba; conviene absorberlas en Fase 1 (son reglas de
negocio, no solo UI):

| # | Comportamiento de Wink | Impacto en BLINK |
|---|---|---|
| 1 | **Venta a crédito exige cliente y vencimiento**, con presets *7 / 15 / 30 días* + fecha libre ("Una venta a crédito necesita un cliente") | `checkout`: crédito sin cliente ni vencimiento. Agregar `dueAt` obligatorio + presets |
| 2 | **Cierre de caja ciego**: al cerrar se cuenta cada cuenta **sin ver el monto esperado**; una diferencia confirmada **exige motivo** ("No se puede dejar pasar") | Arqueo actual muestra el esperado y no exige motivo |
| 3 | **Devolución sobre venta a crédito**: el valor devuelto **rebaja primero la deuda**; el excedente solo se reembolsa si ya pagó de más | Sin flujo de devoluciones; definir precedence al implementarlo |
| 4 | **"Por atender"** incluye **"Caja sin cerrar"** con botón *Cerrar caja* | Inicio solo lista stock bajo |
| 5 | **Dividir cuenta** solo entre cuentas **del mismo canal y ubicación** | BLINK no tiene dividir (Fase 2); incorporar la restricción |
| 6 | **Traslados**: si el origen no alcanza, **no mueve nada** y dice cuánto falta; corrección por **traslado inverso** con documento | `addStockTransfer` debe validar y soportar reversa |
| 7 | **Permisos por ubicación**: sin ubicación asignada = todas; Dueño siempre. **Alertas de bajo mínimo suman todas las ubicaciones** | Al implementar usuarios (Fase 4) y al filtrar stock |
| 8 | **Mi perfil**: moneda principal (USD/Bs/ambas), ubicación por defecto, resumen diario por correo, modo oscuro, dispositivos y sesiones | No existe en BLINK (P3). *Parcial v1.2.0:* **«Confiar en este dispositivo»** + verificación al entrar desde equipo nuevo (aún sin vista de "dispositivos y sesiones") |
| 9 | **Exposición cambiaria** calculada por mes en Finanzas (cuentas en Bs vs USD) con selector de mes | Modelo previsto; sin UI |
| 10 | Estructura confirmada en vivo: Finanzas 8 pestañas · Catálogo 5 · Inventario 7 (Existencias, Movimientos, Compras, Devoluciones, Ajustes, Traslados, Lotes) · Ajustes 8 (Negocio, Moneda, Impuestos, Canales, Ubicaciones, Comportamiento, Usuarios y roles, Bitácora) | Coincide con el mapa §2; BLINK está alineado en el núcleo y atrasa en pestañas (todas con acciones ya escritas, ver `18` §4) |

Detalle adicional del sitio público: recibos 58 mm/80 mm/carta/**PDF**, roles *Dueño /
Encargado / Cajero / Almacén* (Cajero sin costos ni márgenes), **no emite facturas fiscales
del SENIAT** (solo recibos), importación/exportación Excel de catálogo, contactos y
existencias, mesas y cuentas que se dividen/mueven, recetas que descuentan insumos,
variantes de talla/color con existencia propia.

---

## 7. Evidencia de comportamiento (análisis estático REA · 2026-10-18)

Análisis **estático** del bundle de Wink con REA (*reverse-engineer-anything*, clonado en
`recon/rea`, gitignored) sobre el JS descargado (`recon/assets/…`, informe en
`recon/rea-report.json`). Sirve para **contrastar el mapa de brechas con evidencia** de qué
superficie cubre realmente el producto. **Solo observación de comportamiento:** aquí no se
copió código, estilos ni marca.

### 7.1 Rutas del SPA (alcance de pantallas observadas)

`entrar` · `verificar-correo` · `recuperar-contrasena` / `restablecer-contrasena` ·
`crear-comercio` · `elegir-perfil` · `aceptar-invitacion` · `inicio` · `ventas` ·
`inventario` · `catalogo` · `contactos` · `finanzas` · `informes` · `ajustes` ·
`auth/google/listo` · `dev/ui-kit`.

**Contraste con BLINK:**

| Ruta Wink | BLINK | Delta |
|---|---|---|
| `entrar`, `verificar-correo`, `crear-comercio` | ✅ `/entrar`, `/registro` (OTP 6 dígitos) | alineado |
| `recuperar/restablecer-contrasena` | ❌ | **P2**: recuperar contraseña (requiere *Redirect URL*) |
| `aceptar-invitacion`, `elegir-perfil` | ❌ (schema `business_members` listo) | **P3**: equipo/roles; hoy 1 usuario = 1 comercio |
| `auth/google/listo` | ❌ **a propósito** | BLINK no usa Google (doc `20`) |
| `dev/ui-kit` | — (interno) | no aplica |

### 7.2 Endpoints REST observados (API de servidor)

`GET/POST /sales` · `/sales/summary` · `/sales/surcharges` · `/purchases` ·
`/purchases/summary` · `/pendings` · `/commission-settlements` ·
`/commission-settlements/owed`.

**Contraste con BLINK:**

| Endpoint Wink | Equivalente en BLINK | Nota |
|---|---|---|
| `/sales`, `/sales/summary` | `sales` + `salesSummary` (cliente) | Resumen agregado en servidor → BLINK agrega en cliente (hoy). Fase B puede moverlo a SQL. |
| `/sales/surcharges` | ✅ `surcharge` (CRUD en Catálogo) | Wink trata recargos como recurso propio; BLINK también, pero dentro del documento. |
| `/purchases`, `/purchases/summary` | `purchases` + `addPurchase` | BLINK registra compras (v1.0.0); falta sub-informe. |
| `/pendings` | ✅ `pendings` (CxC/CxP) | alineado (alta, abono, anulación). |
| `/commission-settlements` + `/owed` | 🟡 parcial | Wink modela **liquidaciones de comisión** como documento con saldo “owed”; BLINK solo tiene `commissionIn/Out` por cuenta. **P3** (bloque al implementar equipo/comisiones). |

**Lectura para el plan:** la superficie observada confirma que el núcleo de BLINK (ventas,
compras, pendientes, recargos, descuentos) está alineado; las brechas reales siguen siendo
**recuperación de contraseña**, **equipo/roles/invitaciones**, **liquidación de comisiones** y
**agregados de reporte en servidor** (últimos dos ya anticipados en `18` §7, Fases 3–4).
