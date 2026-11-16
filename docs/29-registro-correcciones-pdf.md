# 29 · Registro de correcciones del lote 29, con el PDF medido

**Fecha:** 2026-11-15 · **Base:** `main@3a6ee12` + cambios de este lote.
Todo lo de esta tabla está **medido en Chromium**, no inspeccionado a ojo. Para reproducir: `cd /home/prodz/BLINK_POS_Hallazgos/scripts && node sonda-cierre-mvp.mjs` (T1–T10), `node sonda-anclas-ayuda.mjs`, `node sonda-atajos-modal.mjs`.

---

## 1. Motor de impresión (BLINK-099) — el único camino al PDF

BLINK POS no trae librería de PDF. Todo lo que sale en papel o en «Guardar como PDF» pasa por dos portales montados en `<body>` y un bloque `@media print` en `app/src/styles/app.css`. Por eso un defecto aquí no se arregla cambiando un dato: se arregla el contrato CSS, y se mide.

**Antes.** `#printable-report` vivía **dentro de `#root`**. Al imprimir, la app se ocultaba con `visibility`, así que unos **100 nodos seguían ocupando espacio** y empujaban el reporte **432 px hacia abajo**: el PDF salía con páginas en blanco por delante. El ticket tenía el mismo problema por la otra vía: `handlePrint()` llamaba a `window.print()` sin avisar de qué se imprimía, así que `Ctrl+P` desde el visor mandaba a la impresora **la pantalla entera** —barra lateral, buscador y botones—.

**Después.**

| Pieza | Cambio | Efecto |
|---|---|---|
| `components/Shell.tsx` | `<div id="printable-report">` se monta con `createPortal(…, document.body)` | sale del flujo de la app; ya no hay nodos que lo empujen |
| `lib/export.ts` · `printReport()` | añade `body.print-report` antes de `window.print()` y lo quita a los 500 ms | el `@media print` sabe que lo que se imprime es el reporte y quita la app con `display:none` |
| `components/Receipt.tsx` · `handlePrint()` | ídem con `body.print-receipt` | el ticket se aísla solo; la botonera (`.no-print`) desaparece de la hoja |
| `styles/app.css` · bloque `@media print` | reglas para `.pr-head`, `.pr-table` (`display:table`), `thead` (`table-header-group`), `tr` con `break-inside:avoid` y `td`/`th` | **estructura firme**: las tablas se repiten como tablas en la hoja, el encabezado se repite al saltar de página y **una fila nunca se parte a la mitad** |
| `lib/store.tsx` · anular venta | la cuenta por cobrar asociada ahora también se anula cuando estaba `saldado` (sus abonos se revirtieron justo arriba) | desaparece el **crédito fantasma**: una cuenta de una venta que ya no existe |

**Medido (T10, `emulateMedia("print")` sobre el navegador real):**

```
reporte: app=none · #printable-report=block de 1280px · tabla=table fila=table-row
         celda=table-cell thead=table-header-group · break-inside=avoid · nodos con caja=13
Ctrl+P sin exportar: #printable-report=none
ticket:  existe=true · visible · ancho=299px · lineas=10 · reporte=none ·
         appVisible=hidden · botonera=none
```

Lectura de cada número: la app entera sale con `display:none` (`app=none`), el reporte ocupa el ancho útil de la hoja, los **13 nodos con caja** son el reporte y nada más (antes eran ~100), `break-inside=avoid` confirma que las filas no se cortan, y `Ctrl+P` sin exportar deja el portal en `none` — **no queda hoja fantasma**. En el ticket: 299 px es el formato de 80 mm, `reporte=none` prueba que reporte y ticket no se pisan, y `botonera=none` que los botones no se imprimen.

> **BLINK-102, mitad 1:** la versión anterior de T10 medía el contrato del ticket **sin montar nunca un ticket**. Buscaba `#printable-receipt`, encontraba `existe:false` y lo registraba como pase. Ahora T10 entra a Historial, abre el ticket real y mide el nodo vivo. Los números de arriba son de esa medición honesta.

---

## 2. Salidas auditadas una por una

| Salida | Ruta de código | Qué se comprobó |
|---|---|---|
| Ticket de venta (80 mm y A4) | `Receipt.tsx` → `#printable-receipt` | ancho correcto, visibilidad aislada, sin botonera, sin reporte detrás |
| Ticket reimpresso desde Historial | `pages/Historial.tsx` → mismo visor | **T10 lo abre de verdad** y mide el nodo |
| Estado de cuenta de un deudor | `pages/Creditos.tsx` → `printReport` + `printableTable` | **T7**: 8 líneas con Fecha · Concepto · Referencia · Debe · Haber · Saldo, totales «Cuentas 1 / Movimientos 3 / Total cargado \$ 10.00 / Total abonado \$ 10.00 / Saldo al cierre \$ 0.00» |
| Reporte CXC general | `pages/Creditos.tsx` → `printReport` | **T8**: cabecera «1 deudor · 0 cuentas vencidas», columnas Deudor · Documento · Teléfono · Cuentas · Saldo · Vence · Atraso |
| Estado de cuenta «Sin cliente asignado» | ídem, grupo sin `contactId` | **T8**: se imprime con su propio título y su saldo, sin inventar un nombre |
| Informes (4) · Inventario · Finanzas | `pages/*` → `printReport` | mismo contrato; **T10** mide el contrato, no cada pantalla |

Regla que sostiene todas ellas: `printableTable()` y `printablePairs()` **escapan cada valor** antes de tocar el HTML del portal. Un nombre de producto con `<` no rompe la hoja ni inyecta marcado.

---

## 3. Asistente «¿Cómo funciona?» (BLINK-100)

| Antes | Después |
|---|---|
| 19 de 55 anclas no resolvían: el paso prometía iluminar un elemento que no estaba en el DOM. Casi todas eran pasos **de pestaña** (`Precios`, `Pendientes`, `Cierres de caja`, `Moneda e impuestos`, `Exportar`, `Apariencia`) apuntando al contenedor de la pestaña *activa por defecto*. | `Tabs` estampa el rótulo en cada botón (`data-tab`), y esos seis pasos apuntan a `.tabs [data-tab="…"]`: iluminan **la pestaña que hay que abrir**, sin cambiar de pestaña a escondidas detrás de la capa. |
| Cuatro anclas `data-tour` que el `wizard.ts` referenciaba pero nadie había puesto en el markup (`ventas-resultados`, `ventas-nueva-cuenta`, `historial-ticket`, `inventario-escanear`, `contactos-credito`, `general-por-atender`, `general-modulos`). | Añadidas en su pantalla correspondiente. |
| Catálogo apuntaba a `.table-wrap` y `.card`, que en esa vista no existen (es una rejilla de fichas). | `.prodcard` y la pestaña correspondiente. |
| Un paso de Contactos decía que la columna Crédito mostraba días de atraso cuando muestra días de plazo. | Texto corregido: «si están en 0, la cuenta no tiene fecha de vencimiento». |
| Un `data-tour="ajustes-guia"` que quedó huérfano al reubicar el paso. | Eliminado del markup. |

**Medido:** `sonda-anclas-ayuda.mjs` → **51 anclas comprobadas · 0 sin resolver** (antes 55 · 19). Las 4 restantes son las de Conciliación, que **no son medibles en local** —ver abajo— y la sonda ahora lo dice en vez de medirlas mal.

> **BLINK-102, mitad 2:** la sonda de anclas comprobaba que el armazón (`​.shell__sidebar`) estuviera montado, que es el mismo en todas las vistas. `/app/admin/conciliacion` sin sesión de administrador **redirige al tablero**, y la corrida vieja reportaba «✓ .page-head · ✓ .tabs» en Conciliación: estaba midiendo el dashboard y dándolo por bueno. Ahora la sonda compara la URL en la que aterrizó con la que pidió y, si difiere, imprime `✗ REDIRIGIÓ A /app/inicio` y **no** cuenta esas anclas. Un instrumento que miente es peor que no medir.

La sonda además **falla en voz alta** si la pantalla no montó (`✗ LA PANTALLA NO MONTÓ`) en vez de reportar anclas «ausentes» que eran una pantalla que nunca llegó, y provoca los elementos que solo existen con datos: en Vender teclea `PRUEBA` para que la lista de resultados exista antes de medirla.

---

## 4. Teclado y modales (BLINK-101)

| Síntoma medido | Causa | Corrección |
|---|---|---|
| Con la ventana de cobro abierta, **F4 vaciaba la cuenta** (líneas 1→0) mientras se estaba cobrando | `modalAbierto` se calculaba pero solo lo consultaban las flechas, el 1-9 y Enter. F2/F4/F6/F8 se ejecutaban siempre | guarda al principio del manejador: con una ventana montada, **ningún** atajo global actúa; Esc sí, porque es la tecla que cierra esas ventanas |
| Con el selector de cliente abierto, **F2 sacaba el foco del diálogo** (`dentro del modal=true` → `false`) | ídem | ídem |
| **F3** armaba el panel de venta rápida por detrás del diálogo y le robaba el foco | el listener de captura de `Rapidos.tsx` no miraba si había ventana | F3 no arma nada si hay un `[role="dialog"]` montado |
| Tras **F8**, el teclado seguía en el buscador: lo que el cajero escribía filtraba productos **detrás** de la ventana de cobro | `Modal` devolvía el foco al cerrarse, pero nunca lo tomaba al abrirse | `useFocoDeDialogo`: el panel `.modal` recibe el foco al montar (`tabIndex={-1}`) y lo devuelve al cerrarse. La app es la misma; Tab ya recorre los controles del diálogo |

**Medido:** `sonda-atajos-modal.mjs`, 11 teclas (F2 F4 F6 F8 F3 ↓ ↑ 1 + − Enter) sobre tres ventanas (cobro, cliente, descuento) = **33 pulsaciones**. Antes: la cuenta se vaciaba y el foco escapaba en las tres. Después: **0 fogonazos**, líneas siempre 1→1, ventanas intactas y el foco ya estaba dentro del diálogo en las tres.

**Sin regresión:** **T1** (ciclo completo sin ratón), **T2** (F3 + tecla + ← → + Esc) y **T6** (las flechas siguen sin colarse en los campos) siguen verdes en el barrido completo.

---

## 5. Gates del lote

| Gate | Resultado |
|---|---|
| `npm run typecheck` | **0 errores** |
| `npx vitest run` | **24 ficheros · 240 pruebas · 240 en verde** (ninguna prueba modificada para pasar) |
| `npm run build` | ✓ **7,33 s** |
| `npm run docs:check` | 141 archivos, 746 enlaces · **2 rotos, ambos preexistentes en HEAD** (apuntan a `../../Pay/docs/…`, fuera del repo) |
| Suite T1–T10 | los diez recorridos en verde |
| Anclas del asistente | 51 medidas · 0 sin resolver |
| Contención de atajos | 33 pulsaciones · 0 fugas |
