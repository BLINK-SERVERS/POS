# 28 · Auditoría inicial de cierre de MVP (flujo de negocio completo)

**Fecha:** 2026-11-15 · **Alcance:** el ciclo completo de caja de un comercio real, no el código fuente.
**Base medida:** `main@3a6ee12` + los cambios de este lote, servidos por el dev server en `http://localhost:5173`.
**Método:** nada se afirma por lectura. Cada veredicto de este documento tiene detrás un instrumento que corre en Chromium real (`/home/prodz/BLINK_POS_Hallazgos/scripts/`), y cada corrección se volvió a medir después.

Los hallazgos anteriores (98, con sus P0–P4) viven en el expediente `BLINK_POS_Hallazgos` — [`02_BUGS_P0_P1.md`](../../BLINK_POS_Hallazgos/02_BUGS_P0_P1.md) y [`03_BUGS_P2_P3.md`](../../BLINK_POS_Hallazgos/03_BUGS_P2_P3.md). Este documento es la auditoría del cierre: **qué se puso a prueba esta semana, qué se confirmó, qué se refutó y qué sigue sin poder medirse**.

---

## 1. Qué se auditó y con qué

| Área auditada | Instrumento | Qué comprueba de verdad |
|---|---|---|
| Ciclo de venta sin ratón | `sonda-cierre-mvp.mjs` **T1** | añadir, recorrer, subir/bajar cantidad, quitar línea |
| Venta rápida (Best Sellers / Favoritos) | **T2**, **T3** | panel presente, F3 + tecla 1-9, ← → cambia lista, Esc desarma, estrella persiste |
| Venta a crédito (las dos ramas) | **T4**, **T5** | alta rápida del cliente dentro del modal y cliente ya existente |
| Contención del teclado | **T6** + `sonda-atajos-modal.mjs` | que ningún atajo global toque lo que hay detrás de una ventana abierta |
| Abonos multidivisa y estado de cuenta | **T7** | dos cobros en dos monedas, libro, ficha, PDF |
| Deudores sin cliente y reporte CXC | **T8** | grupo «Sin cliente asignado» y el reporte general |
| Asistente «¿Cómo funciona?» | **T9** + `sonda-anclas-ayuda.mjs` | que cada paso ilumine algo que existe |
| Hoja de impresión | **T10** | el contrato CSS real de reporte y ticket |

Semilla compartida: `semilla-mvp.mjs` (3 productos —uno rotando, uno fijado a mano—, 3 ventas, 1 contacto con 30 días de crédito, caja abierta). Una semilla incompleta manda la app al alta y todo lo que se mide deja de ser el POS.

---

## 2. Veredictos: confirmado

**Confirmado con medición, corregido en el mismo lote.** Cuatro hallazgos nuevos, todos cerrados y re-medidos.

| ID | Gravedad | Hallazgo | Prueba |
|---|---|---|---|
| **BLINK-099** | P1 | Tres defectos en la salida impresa: el reporte arrancaba **432 px** más abajo con páginas en blanco delante; `Ctrl+P` desde el visor de ticket imprimía **la pantalla completa** (barra lateral y botones incluidos); y anular una venta dejaba en pie su cuenta por cobrar ya saldada — el fantasma de un crédito de una venta que ya no existe. | **T10** antes/después + diff de `store.tsx` |
| **BLINK-100** | P2 | **19 de 55 anclas** del asistente apuntaban a elementos que no existen: pasos que prometían iluminar «los resultados del buscador» y pintaban una tarjeta centrada. Además un paso de Contactos afirmaba algo falso sobre la columna Crédito. | `sonda-anclas-ayuda.mjs` |
| **BLINK-101** | P1 | Los atajos globales se disparaban **con una ventana montada encima**: F4 vaciaba la cuenta mientras se estaba cobrando y F2/F3 sacaban el foco del diálogo. Ningún diálogo además tomaba el foco al abrirse: tras F8 el teclado seguía en el buscador, así que lo que el cajero tecleaba filtraba productos detrás de la ventana de cobro. | `sonda-atajos-modal.mjs`, 33 pulsaciones × 3 ventanas |
| **BLINK-102** | P3 | Dos instrumentos mentían por comodidad: **T10** medía el contrato del ticket sin montar nunca un ticket y registraba `existe:false` como un pase; y la sonda de anclas daba por buena una ruta que había **redirigido al tablero**, midiendo el dashboard en lugar de Conciliación. | revisión de los propios scripts |

Detalle y corrección de cada uno: [`29-registro-correcciones-pdf.md`](./29-registro-correcciones-pdf.md).

---

## 3. Veredictos: refutado (se veía como bug y no lo es)

Cuatro cosas que en la revisión de código parecían defectos y resultaron comportamiento correcto, documentadas aquí para que nadie las «arregle»:

1. **«`abonoPending` e `abonoPendingPagos` son código duplicado».** No: `abonoPending` delega en `abonoPendingPagos` con un solo cobro. Hay **una** regla de dinero y dos entradas, que es lo que se quería. Medido en **T7**: `asientos=["Abono/USD/4/pend=pd1","Abono/VES/6/pend=pd1"]`.
2. **«El abono no aplica IGTF: bug».** Es a propósito. Los abonos no se cobran en un punto de venta con terminal, y aplicarlo habría reducido lo que el cliente efectivamente pagó. La comisión de la cuenta receptora sí se aplica (`net`).
3. **«Los pasos del asistente que no iluminan nada están rotos».** Un subconjunto es correcto: donde el dato no existe (bandeja vacía, sin deudores) el `target` no puede resolverse y la tarjeta se pinta centrada **a propósito**. Lo roto era otra cosa: que el paso apuntara a un elemento que no existe *ni existía* (BLINK-100).
4. **«El fallo intermitente de T4 era del POS».** Era del instrumento: un `waitForTimeout(400)` dejaba llegar el Enter antes de que existiera fila resaltada, la cuenta quedaba vacía y el modal de cobro no abría. Corregido con esperas por selector, **T4 verde** en el barrido completo.

---

## 4. Lo que esta auditoría NO pudo medir

Dejarlo escrito es parte del informe, no una nota al pie:

- **Conciliación (`/app/admin/conciliacion`).** Ruta de plataforma: requiere sesión de administrador contra Supabase. En local redirige al tablero, así que sus 4 pasos no son medibles con la semilla local. Sus anclas (`conciliacion-aprobar`, `conciliacion-rechazar`) apuntan a los botones reales y **solo existen cuando hay un pago pendiente de conciliar**; sin ese dato el paso degrada a tarjeta centrada, que es el comportamiento diseñado.
- **Rendimiento con catálogo grande.** La siembra tiene 3 productos. Nada de esta auditoría dice cómo se comporta el buscador o el panel de venta rápida con 5 000 referencias.
- **Sincronización entre dos dispositivos reales.** El multi-pestaña se cubrió en lotes anteriores; dos cajas físicamente distintas, no.
- **Salida PDF en papel.** Se midió el contrato CSS bajo `emulateMedia("print")`, que es lo que consume el «Guardar como PDF» del navegador. Un PDF real de impresora térmica depende del driver y no se validó aquí.

---

## 5. Estado del flujo tras la auditoría

Los diez recorridos (T1–T10) están en verde sobre el código de este lote, y las anclas del asistente quedaron **51 medidas / 0 sin resolver**. Gates: `tsc --noEmit` 0 · `vitest run` **240/240** · `npm run build` ✓ · `docs:check` con los dos únicos enlaces rotos **preexistentes en HEAD** (apuntan a `../../Pay/docs/…`, fuera del repo).

La regla que resume la auditoría: **un módulo secundario puede fallar o apagarse, pero la venta y el inventario no se tocan.** Cada una de las tres piezas nuevas de este lote (Créditos, teclado/venta rápida, asistente) cumple esa regla por construcción, y está explicado en su documento: [30](./30-creditos-cxc.md), [31](./31-teclado-venta-rapida.md), [32](./32-asistente-contextual.md).
