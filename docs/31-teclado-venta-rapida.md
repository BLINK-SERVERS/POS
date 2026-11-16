# 31 · Teclado de caja y Venta Rápida — documentación funcional y tabla oficial

**Módulo 4 del cierre de MVP.** Objetivo del plan (§4.2): que **todo el ciclo de venta se opere sin tocar el ratón**, con un mapa de atajos que no colisione con el navegador, insignias discretas en escritorio y un panel de **Best Sellers / Favoritos**.

---

## 1. Tabla oficial de atajos

Vigente desde este lote. Fuente: `pages/Vender.tsx` (bloque «Teclado de caja (PC)», líneas 615–764), `components/Rapidos.tsx`, `components/SelectorCliente.tsx` y `components/Asistencia.tsx`.

### 1.1 Ciclo de venta

| Tecla | Qué hace | Dónde actúa |
|---|---|---|
| `F2` | Ir al buscador de productos (foco + selecciona el texto) | Vender |
| `F3` | Armar el panel de **Venta Rápida** y llevar el foco a él | Vender |
| `F4` | **Cuenta nueva** (abre otra pestaña de venta) | Vender |
| `F6` | Recorrer las líneas de la cuenta (resalta la siguiente) | Vender |
| `F8` | **Cobrar** (abre la ventana de cobro; si la caja está cerrada, pide abrirla) | Vender |
| `↑` `↓` | Recorrer la lista de resultados del buscador; con una línea activa, cambiar de línea | Vender |
| `1`–`9` | Añadir el producto de la fila numerada (resultados o píldora de venta rápida). La lista corta en 20 resultados (`RESULTADOS_MAX`): las nueve primeras filas tienen tecla propia y del resto se apodera `↑ ↓` + `Enter` | Vender |
| `Enter` | Añadir el producto resaltado. El `Enter` del teclado numérico llega con la misma `e.key` y toma el mismo camino | Vender |
| `+` / `=` | Subir la cantidad de la línea activa | Vender |
| `-` | Bajar la cantidad de la línea activa | Vender |
| `Supr` / `Retroceso` | Quitar la línea activa (con cantidad 1, la borra) | Vender |
| `←` `→` | Cambiar entre **Favoritos** y **Más vendidos** (con el panel armado) | Rapidos |
| `Esc` | Cerrar la ventana abierta, desarmar el panel de venta rápida o limpiar la búsqueda — en ese orden | Vender / Rapidos |

### 1.2 Dentro de las ventanas

| Tecla | Qué hace |
|---|---|
| `Tab` | Recorre los controles del diálogo (el foco entra en el diálogo al abrirse) |
| `Enter` | Confirma el campo activo; en la ventana de cobro, **pagar** |
| `Esc` | Cierra **esa** ventana sin tocar la de abajo (el selector de cliente se cierra y deja el cobro abierto) |

### 1.3 En el asistente «¿Cómo funciona?»

`→` paso siguiente · `←` anterior · `Esc` salir. Escuchan en **fase de captura**, así que la página que está detrás no se entera.

---

## 2. Política de colisión con el navegador

**Regla: el POS solo toma teclas de función y de navegación que el navegador no usa.**

- Las cinco teclas de acción son `F2 F3 F4 F6 F8`. Se evitaron a propósito `F1` (ayuda), `F5` (recargar), `F7` (navegación con cursor), `F10`/`F11` (menú/pantalla completa) y `F12` (herramientas de desarrollo).
- **Ningún atajo usa `Ctrl`, `Meta` o `Alt`.** El manejador sale inmediatamente si alguna está pulsada, así que `Ctrl+P`, `Ctrl+F`, `Ctrl+C`, `⌘+R` siguen siendo del navegador y del sistema.
- `Esc`, `↑`, `↓`, `←`, `→`, `Enter`, `+`, `-`, `1`–`9` y `Supr` solo actúan cuando **el foco no está escribiendo** (salvo en el propio buscador, que es un campo del POS). La comprobación `enCampo()` deja pasar `Backspace`, las flechas dentro de un `<input>` y todo lo que teclea un formulario.
- Y la que faltaba hasta este lote (**BLINK-101**): con una ventana montada, **ningún** atajo global actúa. Antes `modalAbierto` solo frenaba las flechas, el `1`–`9` y `Enter`, así que `F4` **vaciaba la cuenta mientras se estaba cobrando** y `F2`/`F3` sacaban el foco del diálogo. Ahora la guarda está al principio del manejador y `Esc` es la única que sigue pasando, porque es la que cierra esas ventanas.

**Medido:** `scripts/sonda-atajos-modal.mjs` — 11 teclas × 3 ventanas (cobro, cliente, descuento) = **33 pulsaciones, 0 fugas**: ni una línea perdida, ni un foco escapado, ni una ventana cerrada por error. En la corrida anterior a la corrección, la cuenta pasaba de 1 línea a 0 con `F4` y el foco salía del selector de cliente con `F2`.

---

## 3. El foco entra en el diálogo

Nadie lo pidió con estas palabras, pero sin esto el teclado no cierra el ciclo: `Modal` devolvía el foco al control que lo abrió, pero **nunca lo tomaba al abrirse**. Resultado medido: tras `F8`, el foco seguía en `#pos-search`, así que lo que el cajero tecleaba **filtraba productos detrás de la ventana de cobro**.

Ahora `useFocoDeDialogo()` (en `components/ui.tsx`) hace las dos mitades: el panel `.modal` recibe el foco al montar (`tabIndex={-1}`, `preventScroll`) y lo devuelve al desmontar. `Tab` ya recorre los controles del diálogo. El anillo de foco del contenedor se suprime en CSS (`.modal:focus { outline: none }`) porque no es un control: el anillo aparece en los campos al navegarlos.

No cambia el `<Sheet>` de móvil ni el `<Dialog>` de confirmación de Konsta: cada uno conserva su propio manejo.

---

## 4. Insignias discretas (lo que se ve en pantalla)

La instrucción del dueño fue explícita: **sin textos explicativos absurdos**. Así quedó:

- **Los atajos no se escriben como ayuda visible.** Van en el `title` del botón —«Cuenta nueva (F4)», «Cobrar (F8)»— y en el `title` de la lista («↑ ↓ recorrer · Enter o 1-9 añadir»).
- **Solo dos insignias en toda la caja**: `<kbd>F4</kbd>` y `<kbd>F8</kbd>`, en los dos botones grandes, con `aria-hidden` (el texto accesible es el `title`), opacidad 0,6 y borde de 1 px.
- **Y solo si hay teclado físico**: `HAY_TECLADO` pregunta `matchMedia("(pointer: fine)")`. En un tablet la insignia no se pinta, porque no hay teclas que pulsar.
- Los números `1`–`9` que sí se ven son los de las filas (`.search-results__key`): no son documentación, son la tecla que hay que pulsar, y coinciden con el orden de la lista.

---

## 5. Venta Rápida: Best Sellers y Favoritos

Panel bajo el buscador, con dos grupos conmutables con `←` `→`.

### 5.1 «Más vendidos» — por rotación, no por ingresos

`lib/ventaRapida.ts`:

| Constante | Valor | Qué decide |
|---|---|---|
| `DIAS_ROTACION` | **30 días** | la ventana de la que se cuenta la mercancía |
| `RAPIDOS_MAX` | **9** | cuántas píldoras se muestran (las teclas `1`–`9`) |

Se ordena por **unidades movidas** dentro de la ventana, no por dinero: lo que sale rápido es lo que el cajero quiere tener a un golpe de tecla. El desempate es por **nombre**, para que la lista no baile entre dos ventas consecutivas.

**Quedan fuera de la cuenta** (y está probado): ventas anuladas, cotizaciones y líneas de cortesía. Una venta de regalo no es demanda.

### 5.2 «Favoritos» — los que fija el comercio

`favorite?: boolean` en el producto, estrella en la fila de resultados. No caducan y se sirven **antes** que los más vendidos; si el comercio se queda sin favoritos, el panel salta solo al grupo de rotación (sin hueco ni error).

### 5.3 Cómo se usa sin ratón

`F3` arma el panel (el foco entra en él y se ve un contorno de acento) → `1`–`9` añade la píldora → `←` `→` cambia de lista → `Esc` desarma y devuelve el foco al buscador. Consumir la tecla también la aparta del teclado global: si no, un «3» añadiría la píldora **y** la tercera fila de la búsqueda que quedó detrás.

**Medido (T2, T3):** `F3 + «1»` deja 1 línea en el ticket, `← →` cambia la primera píldora de «Favoritos» a «Más vendidos», `Esc` desarma, y la estrella persiste `favorite=true` → `false`.

**Unitarias (`ventaRapida.test.ts`):** ventana de 30 días, exclusión de anuladas/cotizaciones/cortesía, desempate por nombre, tope de 9 y orden de favoritos.

---

## 6. Degradación elegante

| Si esto falla o se apaga… | …el POS sigue |
|---|---|
| el catálogo no tiene ventas en 30 días | el panel no se monta (`if (!items.length) return null`); el buscador funciona igual |
| `lib/ventaRapida.ts` lanza | la pantalla de venta lo sigue haciendo: los atajos `F2/F4/F6/F8` y el ratón son independientes |
| el teclado no se usa nunca | no hay nada que estorbe: ni banners, ni leyendas, solo dos `title` y dos `kbd` |

---

## 7. Cómo se vuelve a medir

```bash
cd /home/prodz/BLINK_POS_Hallazgos/scripts
SOLO=T1,T2,T3 node sonda-cierre-mvp.mjs   # ciclo sin ratón, venta rápida, estrella
node sonda-atajos-modal.mjs               # contención: 33 pulsaciones con ventanas abiertas
npx vitest run src/lib/ventaRapida.test.ts
```
