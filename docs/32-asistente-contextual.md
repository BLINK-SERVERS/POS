# 32 · Asistente contextual «¿Cómo funciona?» — documentación funcional y mapa de pasos

**Módulo 5 del cierre de MVP.** Requisito del plan (§4.3): un botón **«¿Cómo funciona?» en cada vista**, colocado de forma que **nunca tape un botón operativo**, con ayuda guiada por pantalla y un interruptor en Ajustes para encenderlo o apagarlo. El cuadro se simplificó el 2026-11-21 (BLINK-129): era un recorrido con foco iluminado; hoy es **la guía entera de esa pantalla en una sola tarjeta**, sin navbar (ver §3).

---

## 1. Piezas

| Archivo | Qué es |
|---|---|
| `app/src/lib/wizard.ts` | **El contenido.** Guías por ruta (`GUIAS`), con `guiaParaRuta`, `contarPasos` y `listarGuias`. Sin React: son datos. |
| `app/src/components/Asistencia.tsx` | **El mecanismo.** Botón + capa a pantalla completa con la guía entera en una sola tarjeta. |
| `app/src/components/Shell.tsx` | Dónde vive el botón (una sola vez, en la barra superior). |
| `app/src/pages/Ajustes.tsx` | El interruptor, en la pestaña **Apariencia**. |

La separación es la del principio rector: el contenido es un dato editable sin tocar el mecanismo, y el mecanismo no sabe nada de ventas, ni de inventario, ni de dinero.

**Resolution de la guía.** `guiaParaRuta` prueba la ruta exacta, luego el prefijo más largo que coincida (una subruta hereda la guía de su pantalla) y si nada encaja cae en `GUIA_GENERICA` —tres pasos que siempre aplican—. **Ninguna vista se queda sin ayuda.**

---

## 2. El botón nunca tapa nada

Se monta **una sola vez**, en `Shell`, antes del separador elástico de la barra superior. El hueco que absorbe la línea es aire, no botones: la tasa, el avatar y cualquier acción de la barra quedan exactamente donde estaban. No hay botones flotantes por pantalla, ni pegatinas en las esquinas, ni capas sobre `.page-head`.

**Medido (T9):** en las seis rutas comprobadas hay **exactamente 1 botón** y la guía se abre desde él.

---

## 3. Cómo se lee, y qué se cerró (BLINK-129)

**Antes** la guía era un recorrido: un paso por vez, `medirObjetivo(target)` medía la caja del elemento y el velo se recortaba alrededor para iluminarlo, con Siguiente / Anterior / Omitir. **Desde el 2026-11-21 eso no existe.** El dueño lo pidió literalmente: «el cuadro contextual no debe tener navbar ya que toda la info se debe leer de un solo vistazo».

Lo que hay ahora:

- un solo `.ayuda__velo` parejo, que **cierra** (pulsar fuera = cerrar);
- una tarjeta `.ayuda__tarjeta` con **todos** los pasos de la pantalla en un `<ol>` numerado por CSS (`counter-reset: paso`), con su botón de cierre `×` y un único **Entendido**;
- sin paginación ni flechas: `Esc` cierra y nada más. Las teclas se escuchan en **fase de captura**, así que la página de atrás no se entera de que se pulsaron;
- **que quepa según la resolución**: `width: min(660px, 100%)`, dos columnas a partir de 700 px (seis pasos caben sin scrollear), una columna por debajo, y `max-height: 100%` con `overflow-y: auto` solo como red final. El pie con «Entendido» está pegajoso (`position: sticky`), así que el botón se ve aunque la lista crezca. **La tarjeta no reserva hueco para la barra de pestañas**: `.ayuda__capa` está en `z-index: 90` y la barra flotante en `60`, así que la guía se pinta **encima** de ella; el hueco de 96 px (`6rem`) que existe abajo es de `.shell__main` —el contenido de la página, que sí se esconde bajo la barra— y no tiene nada que ver con el cuadro de ayuda. Reservarlo también en la capa solo quitaba altura útil. Lo que sí se respeta es `env(safe-area-inset-bottom)`. Medido con Playwright en las 6 rutas y 5 tamaños (2026-11-21): **0 px de desborde** en 390×844, 430×932, 768×1024 y 1280×900, con el pie a la vista; en 320×568 el texto scrollea **dentro** de la tarjeta (7–279 px según la pantalla) y el botón sigue a la vista. Se reproduce con `sonda-ajuste-guia.mjs` (mismo expediente que las demás sondas).

**Qué es `target` hoy.** El mecanismo dejó de iluminar, pero el campo sigue en `wizard.ts` y sigue siendo el **ancla documentada de cada paso**: la sonda `sonda-anclas-ayuda.mjs` lo parsea y mide en navegador que el elemento exista. Es decir, un `target` que no resuelve ya no rompe la ayuda (no pinta nada), pero **sí es un hallazgo**: significa que el paso habla de algo que la pantalla no tiene. Por eso se sigue midiendo.

**Contrato de anclas.** Un paso apunta a un selector CSS. Los estables son `data-tour="…"` (un elemento concreto de una pantalla) y `data-tab="…"` (una pestaña, que estampa el componente `Tabs`). Todo lo demás —`.page-head`, `.kpis`, `.tabs`— es estructura de la casa y puede moverse. **Antes de dar un paso por bueno, se mide** (la sonda vive en el expediente de hallazgos, no en este repo, como todas las `sonda-*.mjs` que citan `docs/28`, `docs/29` y `docs/31`): `cd /home/prodz/BLINK_POS_Hallazgos/scripts && BASE=http://localhost:5199 node sonda-anclas-ayuda.mjs`.

---

## 4. Encender y apagar

Ajustes → **Apariencia** → «Guía «¿Cómo funciona?» en cada pantalla». La preferencia vive en `localStorage` bajo **`blink-pos-ayuda-v1`**, o sea **por dispositivo**, no por comercio: el dueño que está capacitando a un cajero lo deja encendido y el cajero experto lo apaga en su propia caja sin afectar a nadie.

**Medido (T9):** apagar en Ajustes → el botón pasa de 1 a 0 en el DOM y la preferencia queda en `"0"`; volver a encender → 1 y `"1"`.

**Y si el módulo se cae:** `LimiteAsistencia` es un `ErrorBoundary` local que renderiza **nada**. Un error del asistente no desmonta el POS ni usa el canal global de errores —sería un desastre que la ayuda capturara un fallo del cobro—. **La venta y el inventario no dependen de que la ayuda funcione.**

---

## 5. Mapa de pasos por pantalla

12 guías · **56 pasos** · generado desde `app/src/lib/wizard.ts` (no transcrito a mano, para que no se desalinee del fuente).

| Pantalla | Ruta | Paso | Título | Ancla (ya no se ilumina; la mide la sonda) |
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

**Re-medida el 2026-11-21** tras el cambio de tarjeta (BLINK-129), con `BASE=http://localhost:5199 node sonda-anclas-ayuda.mjs`: **52 anclas comprobadas · 0 sin resolver**. Conciliación vuelve a salir `✗ REDIRIGIÓ A /app/inicio` (pide sesión de plataforma), así que sus 4 anclas siguen sin medirse en local. Que el mecanismo ya no ilumine no retire la sonda: lo que comprueba ahora es que el paso hable de algo que la pantalla tiene.

Los 19 se repartían en tres causas, todas corregidas: anclas `data-tour` que `wizard.ts` referenciaba pero nadie había puesto en el markup; pasos de pestaña que apuntaban al contenido de la pestaña activa por defecto; y dos selectores (`.table-wrap`, `.card`) que en esa pantalla no existen. Detalle y verificación: [29](./29-registro-correcciones-pdf.md#3-asistente-cómo-funciona-blink-100).

Decisión de diseño registrada: el asistente **no cambia de pestaña** para poder iluminar. Hacerlo ejecutaría código de la pantalla detrás de una capa opaca. Lo que hace el paso es iluminar **el botón de la pestaña que hay que abrir** —para eso `Tabs` estampa `data-tab`—.

---

## 7. Añadir un paso nuevo (receta)

1. En la pantalla, poner el asa: `data-tour="pantalla-cosa"` en el elemento, o reutilizar `.tabs [data-tab="Pestaña"]`.
2. En `wizard.ts`, añadir el paso con `target: '[data-tour="pantalla-cosa"]'`.
3. Medir: `node /home/prodz/BLINK_POS_Hallazgos/scripts/sonda-anclas-ayuda.mjs` → tiene que decir `✓`. Si dice `✗ AUSENTE`, el paso habla de algo que la pantalla no tiene: la tarjeta no se cae (no ilumina nada), pero la guía miente.

El paso se escribe en dos o tres frases y **entra en la lista sin más**: no hay que registrarlo en ningún recorrido ni decidir en qué orden se ve, porque la tarjeta muestra todos a la vez. Lo que sí se cuida es el tamaño: si una guía crece tanto que en un teléfono de 390 px no cabe sin scrollear, se parten los pasos o se acortan los textos (BLINK-129: «que toda la info quepa según la resolución de pantalla»).
