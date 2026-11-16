# 32 · Asistente contextual «¿Cómo funciona?» — documentación funcional y mapa de pasos

**Módulo 5 del cierre de MVP.** Requisito del plan (§4.3): un botón **«¿Cómo funciona?» en cada vista**, colocado de forma que **nunca tape un botón operativo**, con recorrido guiado que ilumina elementos, navegación Siguiente / Anterior / Entendido / Omitir, y un interruptor en Ajustes para encenderlo o apagarlo.

---

## 1. Piezas

| Archivo | Qué es |
|---|---|
| `app/src/lib/wizard.ts` | **El contenido.** Guías por ruta (`GUIAS`), con `guiaParaRuta`, `contarPasos` y `listarGuias`. Sin React: son datos. |
| `app/src/components/Asistencia.tsx` | **El mecanismo.** Botón + capa a pantalla completa + foco medido + navegación por teclado. |
| `app/src/components/Shell.tsx` | Dónde vive el botón (una sola vez, en la barra superior). |
| `app/src/pages/Ajustes.tsx` | El interruptor, en la pestaña **Apariencia**. |

La separación es la del principio rector: el contenido es un dato editable sin tocar el mecanismo, y el mecanismo no sabe nada de ventas, ni de inventario, ni de dinero.

**Resolution de la guía.** `guiaParaRuta` prueba la ruta exacta, luego el prefijo más largo que coincida (una subruta hereda la guía de su pantalla) y si nada encaja cae en `GUIA_GENERICA` —tres pasos que siempre aplican—. **Ninguna vista se queda sin ayuda.**

---

## 2. El botón nunca tapa nada

Se monta **una sola vez**, en `Shell`, antes del separador elástico de la barra superior. El hueco que absorbe la línea es aire, no botones: la tasa, el avatar y cualquier acción de la barra quedan exactamente donde estaban. No hay botones flotantes por pantalla, ni pegatinas en las esquinas, ni capas sobre `.page-head`.

**Medido (T9):** en las seis rutas comprobadas hay **exactamente 1 botón** y el recorrido se abre desde él.

---

## 3. Cómo ilumina, y qué pasa cuando no puede

Al cambiar de paso, `medirObjetivo(target)` mide la caja real del elemento:

- si el elemento **no existe**, mide **0×0** o está **fuera del viewport** → devuelve `null` y la capa pinta **solo el velo** (`.ayuda__velo--solo`), sin foco, con la tarjeta centrada. El recorrido **nunca se rompe**: tres causas legítimas de no iluminar (dato que no existe todavía, pestaña cerrada, pantalla vacía) se ven como una tarjeta centrada y no como un fallo;
- si existe → velo recortado alrededor del elemento, con **8 px** de holgura (`PAD_FOCO`), la tarjeta a **14 px** del borde (`SEPARACION`), ancho fijo de **360 px** (`ANCHO_TARJETA`), y desplazamiento suave para que el objetivo quede a la vista.

Las teclas `Esc`, `←` y `→` se escuchan en **fase de captura**, así que la página que hay detrás no se entera de que se pulsaron.

**Contrato de anclas.** Un paso apunta a un selector CSS. Los estables son `data-tour="…"` (un elemento concreto de una pantalla) y `data-tab="…"` (una pestaña, que estampa el componente `Tabs`). Todo lo demás —`.page-head`, `.kpis`, `.tabs`— es estructura de la casa y puede moverse. **Antes de dar un paso por bueno, se mide:** `node sonda-anclas-ayuda.mjs`.

---

## 4. Encender y apagar

Ajustes → **Apariencia** → «Guía «¿Cómo funciona?» en cada pantalla». La preferencia vive en `localStorage` bajo **`blink-pos-ayuda-v1`**, o sea **por dispositivo**, no por comercio: el dueño que está capacitando a un cajero lo deja encendido y el cajero experto lo apaga en su propia caja sin afectar a nadie.

**Medido (T9):** apagar en Ajustes → el botón pasa de 1 a 0 en el DOM y la preferencia queda en `"0"`; volver a encender → 1 y `"1"`.

**Y si el módulo se cae:** `LimiteAsistencia` es un `ErrorBoundary` local que renderiza **nada**. Un error del asistente no desmonta el POS ni usa el canal global de errores —sería un desastre que la ayuda capturara un fallo del cobro—. **La venta y el inventario no dependen de que la ayuda funcione.**

---

## 5. Mapa de pasos por pantalla

12 guías · **56 pasos** · generado desde `app/src/lib/wizard.ts` (no transcrito a mano, para que no se desalinee del fuente).

| Pantalla | Ruta | Paso | Título | Ilumina |
|---|---|---|---|---|
| **Vender** | `/app/ventas` | 1 | Así se arma una venta | `#pos-search` |
| | | 2 | Añádelo al ticket | `[data-tour="ventas-resultados"]` |
| | | 3 | Varias cuentas a la vez | `[data-tour="ventas-nueva-cuenta"]` |
| | | 4 | Descuento, recargo y nota | `.ticket` |
| | | 5 | Cobra | `.ticket__foot` |
| | | 6 | La caja del día | `.shell__topbar .userchip` |
| **Historial de ventas** | `/app/ventas/historial` | 1 | Lo que ya quedó cobrado | `.kpis` |
| | | 2 | Imprime un ticket otra vez | `[data-tour="historial-ticket"]` |
| | | 3 | Anular no es borrar | `.table-wrap` |
| | | 4 | Vuelve al punto de venta | `.page-head .btn` |
| **Catálogo** | `/app/catalogo` | 1 | Todo lo que vendes | `.page-head` |
| | | 2 | Crea el producto | `.page-head .btn--primary` |
| | | 3 | Cinco pestañas | `.tabs` |
| | | 4 | Precios por canal | `.tabs [data-tab="Precios"]` |
| | | 5 | Actívalo o apágalo | `.prodcard` |
| **Inventario** | `/app/inventario` | 1 | Cuánta mercancía tienes | `.kpis` |
| | | 2 | Registra la compra | `.page-head .btn--primary` |
| | | 3 | Ajusta cuando cuentas | `.table-wrap` |
| | | 4 | Movimientos y compras | `.tabs` |
| | | 5 | Escanear en vez de escribir | `[data-tour="inventario-escanear"]` |
| **Contactos** | `/app/contactos` | 1 | Clientes y proveedores | `.page-head` |
| | | 2 | Nuevo contacto | `.page-head .btn--primary` |
| | | 3 | Los días de crédito | `.table-wrap` |
| | | 4 | Dónde se ve el saldo | `[data-tour="contactos-credito"]` |
| **Créditos** | `/app/creditos` | 1 | Lo que te deben | `.page-head` |
| | | 2 | Las tres cifras de arriba | `[data-tour="creditos-resumen"]` |
| | | 3 | Busca y lee la lista | `[data-tour="creditos-lista"]` |
| | | 4 | Registra el abono | `[data-tour="creditos-abonar"]` |
| | | 5 | La ficha del deudor | `[data-tour="creditos-ficha"]` |
| | | 6 | Reporte CXC | `[data-tour="creditos-reporte"]` |
| **Finanzas** | `/app/finanzas` | 1 | Dónde está tu dinero | `.kpis` |
| | | 2 | Ocho pestañas | `.tabs` |
| | | 3 | Cuentas por cobrar | `.tabs [data-tab="Pendientes"]` |
| | | 4 | Registra el abono | `.table-wrap` |
| | | 5 | Gastos y transferencias | `.page-head .btn--ghost` |
| | | 6 | El cierre de caja | `.tabs [data-tab="Cierres de caja"]` |
| **Informes** | `/app/informes` | 1 | El resultado, mes a mes | `.kpis` |
| | | 2 | Cuatro informes | `.tabs` |
| | | 3 | Saca el reporte | `.no-print` |
| | | 4 | Aquí no se edita nada | sin objetivo (tarjeta centrada, a propósito) |
| **Ajustes** | `/app/ajustes` | 1 | Se configura una vez | `.tabs` |
| | | 2 | Los datos del comercio | `.card` |
| | | 3 | La tasa del día | `.tabs [data-tab="Moneda e impuestos"]` |
| | | 4 | Copia de seguridad | `.tabs [data-tab="Exportar"]` |
| | | 5 | Enciende o apaga esta guía | `.tabs [data-tab="Apariencia"]` |
| **General (tablero)** | `/app/inicio` | 1 | El tablero del negocio | `.page-head` |
| | | 2 | Cambia el periodo | `.tabs` |
| | | 3 | Por atender | `[data-tour="general-por-atender"]` |
| | | 4 | Para arrancar y Módulos | `[data-tour="general-modulos"]` |
| **Conciliación (admin)** | `/app/admin/conciliacion` | 1 | Solo para la plataforma | `.page-head` |
| | | 2 | Filtra la bandeja | `.tabs` |
| | | 3 | Aprobar activa 30 días | `[data-tour="conciliacion-aprobar"]` |
| | | 4 | Rechazar da 24 horas | `[data-tour="conciliacion-rechazar"]` |
| **Cualquier otra vista** | `*` | 1 | Para qué sirve | `.shell__topbar` |
| | | 2 | Muévete por los módulos | `.nav` |
| | | 3 | La ayuda se enciende y se apaga | `.shell__topbar .userchip` |

Las dos últimas filas de Conciliación solo existen **cuando hay un pago pendiente de conciliar**, y la pantalla exige sesión de plataforma: no son medibles con la siembra local. Se documenta en vez de fingir que se midió.

---

## 6. Estado de la medición

| | Antes | Después |
|---|---|---|
| Anclas comprobadas | 55 | 51 (4 retiradas por no medibles en local) |
| Anclas que **no** resolvían | **19** | **0** |

Los 19 se repartían en tres causas, todas corregidas: anclas `data-tour` que `wizard.ts` referenciaba pero nadie había puesto en el markup; pasos de pestaña que apuntaban al contenido de la pestaña activa por defecto; y dos selectores (`.table-wrap`, `.card`) que en esa pantalla no existen. Detalle y verificación: [29](./29-registro-correcciones-pdf.md#3-asistente-cómo-funciona-blink-100).

Decisión de diseño registrada: el asistente **no cambia de pestaña** para poder iluminar. Hacerlo ejecutaría código de la pantalla detrás de una capa opaca. Lo que hace el paso es iluminar **el botón de la pestaña que hay que abrir** —para eso `Tabs` estampa `data-tab`—.

---

## 7. Añadir un paso nuevo (receta)

1. En la pantalla, poner el asa: `data-tour="pantalla-cosa"` en el elemento, o reutilizar `.tabs [data-tab="Pestaña"]`.
2. En `wizard.ts`, añadir el paso con `target: '[data-tour="pantalla-cosa"]'`.
3. Medir: `node /home/prodz/BLINK_POS_Hallazgos/scripts/sonda-anclas-ayuda.mjs` → tiene que decir `✓`. Si dice `✗ AUSENTE`, el paso no ilumina nada y la ayuda mintió una vez.
