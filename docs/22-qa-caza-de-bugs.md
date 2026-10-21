# 22 · QA · Caza de bugs y verificación funcional

**Documento vivo — última revisión 2026-10-19 (v1.3.1).**

Registro de la revisión manual de la tienda de punta a punta (rol comerciante), los bugs
encontrados, su corrección y la verificación de los flujos críticos. Complementa a
`18-estado-y-plan-de-desarrollo.md` (estado general) y `19-despliegue-gh-pages.md` (deploy).

> **Método.** Se probó el POS en vivo (`npm run dev`, `localhost:5173`) con un comercio de
> prueba temporal ("Comercio QA", RIF J-30000000-9, tasa 42,50, IVA 16%/Exento). Para entrar
> sin cuenta real se usó un **bypass temporal** (`app/src/lib/bypass.ts`, marcado `TEMP-BYPASS`),
> que se retira cuando el dueño lo indique. Los datos de prueba se sembraron en `localStorage`
> (`blink-pos-state-v3`) desde un documento del mismo origen sin la app montada
> (`/robots.txt`), evitando que el estado en memoria los pisara.

---

## 1. Resumen

| # | Hallazgo | Tipo | Estado |
|---|---|---|---|
| BUG-1 | Onboarding retenía la última categoría al añadir varios productos | Datos | ✅ Corregido |
| BUG-2 | Falso positivo de "Stock bajo" cuando el mínimo es 0 | Métricas/UI | ✅ Corregido |
| BUG-4 | Equivalencias en Bs mostraban `Bs 0,00` con tasa sin configurar | UI | ✅ Corregido |
| BUG-5 | Pérdida de `localStorage` (sin reproducir en condiciones normales) | Entorno | ⚪ No era bug |
| BUG-7 | División por `rate` sin protección en Finanzas (`$ ∞` / `NaN` con tasa 0) | Métricas | ✅ Corregido |
| BUG-8 | KPI "Tasa oficial" mostraba "Bs 0,00" con tasa 0 | UI | ✅ Corregido |
| BUG-9 | Descuento con "Usos máximos" 0 quedaba inservible | Lógica | ✅ Corregido |
| BUG-10 | Costo promedio con stock negativo en compras | Inventario | ⚪ Revisado (ver §3) |
| BUG-11 | Abono a pendiente acreditaba más que el saldo restante | Dinero | ✅ Corregido |
| BUG-12 | La versión (`BLINK POS · versión …`) se renderizaba en Ajustes | Requisito | ✅ Corregido |
| BUG-13 | Etiqueta `Método de pago` "robaba" el nombre del primer botón de cuenta | Accesibilidad | ✅ Corregido |
| BUG-14 | Cotización se imprimía como "Ticket de venta", sin distintivo | UX/Legal | ✅ Corregido |
| BUG-15 | "Días de crédito" aceptaba valores negativos | Datos | ✅ Corregido |

Además se reforzaron varios puntos de UI para el caso "tasa sin configurar" (ver §4).

---

## 2. Bugs corregidos

### BUG-1 · Onboarding retenía la categoría elegida
- **Síntoma:** al añadir varios productos seguidos en el alta, el segundo formulario aparecía
  con la categoría del producto anterior ya seleccionada; era fácil guardar un producto con la
  categoría equivocada.
- **Causa:** `addProductStep` limpiaba nombre, precio, costo y existencia, pero no la categoría
  (`prodCat`).
- **Fix:** `app/src/pages/Onboarding.tsx` → `setProdCat("")` al reiniciar el formulario.

### BUG-2 · Falso "Stock bajo" con mínimo 0
- **Síntoma:** productos con `minStock = 0` (sin mínimo definido) aparecían como "Stock bajo"
  aunque tuvieran existencias.
- **Causa:** la condición era `stock <= minStock`; con `minStock = 0` y `stock = 0` marcaba alerta
  (y con servicios/valores límite generaba ruido).
- **Fix:** la regla ahora es **`minStock > 0` y `stock <= minStock`**. Aplicado en
  `app/src/lib/metrics.ts` (`lowStock`), `app/src/pages/Inventario.tsx` (fila y KPI) y
  `app/src/pages/Vender.tsx` (tarjeta de producto). Verificado en Inicio ("Todo en orden").

### BUG-4 · Equivalencias en Bs con tasa 0
- **Síntoma:** con el comercio recién creado (sin tasa), la app mostraba `Bs 0,00` junto a los
  precios, un dato engañoso.
- **Fix:** se oculta la equivalencia en Bs cuando `rate <= 0` (no se inventa un "Bs 1:1").
  Aplicado en `Money`/`DualInline` (`app/src/components/ui.tsx`), tarjetas y líneas de
  `Vender.tsx` y filas de `Catalogo.tsx`.

### BUG-7 · Divisiones por `rate` sin protección (Finanzas)
- **Síntoma:** con tasa 0, las cuentas en Bs mostraban `$ ∞` o `NaN` (capital consolidado, KPI
  de bolívares conservados y equivalentes por cuenta).
- **Causa:** `balance / rate` sin guarda (3 sitios en `Finanzas.tsx`).
- **Fix:** `balance / (rate || 1)` y textos alternativos ("sin tasa configurada").
- **Verificado en vivo:** con tasa 0 ya no aparece `∞`/`NaN`.

### BUG-8 · KPI "Tasa oficial" con tasa 0
- **Síntoma:** el KPI mostraba "Bs 0,00" como si fuera una tasa válida.
- **Fix:** con `rate <= 0` el KPI muestra "Sin configurar" y una pista para configurarla en
  Ajustes → Moneda e impuestos.

### BUG-9 · Descuento con "Usos máximos" 0
- **Síntoma:** poner 0 en "Usos máximos" dejaba el descuento inservible (0 usos); el campo
  vacío sí era ilimitado, lo que era incoherente.
- **Fix:** vacío, 0 o valor no numérico = **ilimitado** (`null`). Un descuento nunca se guarda
  con 0 usos. `app/src/pages/Catalogo.tsx` (`saveDiscount`).

### BUG-11 · Abono a pendiente acreditaba de más
- **Síntoma:** al abonar a una cuenta por cobrar/pagar se podía ingresar un monto mayor al saldo
  restante; la cuenta (y el estado del pendiente) se acreditaban con dinero que no correspondía.
- **Causa:** `abonoPending` sumaba el monto sin acotarlo al saldo.
- **Fix:** el store **acota** el abono al saldo restante (`applied = min(monto, restante)`), valida
  que el pendiente no esté `saldado`/`anulado`, y calcula comisión sobre el monto **aplicado**,
  no sobre el escrito. La UI (`Finanzas.tsx`) añade `max` y una pista "Máximo $X".

### BUG-12 · Versión visible en la UI
- **Síntoma:** Ajustes mostraba "BLINK POS · versión 1.3.1" al pie.
- **Requisito:** la versión se declara una sola vez en `app/package.json` y **no** debe verse en
  la UI. Se eliminó el render.
- **Estado (v1.8.3):** el requisito **sigue vigente**. No se ha vuelto a introducir la versión
  en ninguna pantalla. `__APP_VERSION__` existe en el bundle (lo inyecta `vite.config.ts`),
  pero nada lo renderiza.
  > Si alguna vez se quiere mostrar la versión (por ejemplo, para pedir soporte), hay que
  > **revisar esta decisión con el dueño del producto** antes de añadir el render: el
  > CHANGELOG de la v1.3.x llegó a afirmar que la versión se mostraba, y era falso.
  > Ver también [`RBAC_AUDIT_IMPLEMENTADO.md`](./RBAC_AUDIT_IMPLEMENTADO.md) sobre cómo
  > documentar el estado real en lugar del esperado.

### BUG-13 · Etiqueta "Método de pago" robaba el nombre del primer botón (accesibilidad)
- **Síntoma:** el grupo de cuentas de pago quedaba con nombre accesible
  `"Método de pago Banco Bs Prueba · VES A crédito"`, porque un `<label>` envolvente asocia su
  texto al **primer** control (el primer botón de cuenta), corrompiendo la lectura del lector de
  pantalla.
- **Causa:** `Field` siempre renderiza un `<label>`. Cuando el contenido son **varios** controles
  (botones), el `<label>` es incorrecto.
- **Fix:** `Field` acepta `as="group"`; en ese caso renderiza
  `<div role="group" aria-label=…>` con el mismo aspecto visual. Solo el grupo "Método de pago"
  de `Vender.tsx` lo necesitaba (los demás `Field` envuelven un único control y siguen con
  `<label>`).

### BUG-14 · Cotización impresa como "Ticket de venta"
- **Síntoma:** una cotización se imprimía igual que una venta, sin ninguna marca que la
  distinguiera; podía confundirse con un comprobante fiscal.
- **Fix:** `app/src/components/Receipt.tsx` añade para `status === "cotizacion"`:
  - subtítulo **COTIZACIÓN** bajo el encabezado;
  - fila **DOCUMENTO: SIN VALOR FISCAL**.
  Se mantiene el patrón existente de `*** ANULADA ***` para ventas anuladas.

### BUG-15 · "Días de crédito" negativo
- **Síntoma:** el formulario de contactos aceptaba valores negativos (p. ej. −5 días), dato
  inválido.
- **Fix:** `Math.max(0, Math.floor(Number(...) || 0))` en `Contactos.tsx` y `min="0"` en el input.

---

## 3. Revisados y descartados (no eran bugs)

- **BUG-5 · Pérdida de `localStorage`.** No se reprodujo en condiciones normales; la pérdida
  observada coincidía con **reinicios del servidor de desarrollo** (que re-siembran el perfil del
  navegador). Verificado que estado y venta sobreviven una recarga normal del documento.
- **BUG-10 · Costo promedio con stock negativo en compras.** `setStock` **no** registra
  `inventoryMoves` (solo fija existencias) y `addPurchase` recalcula costo promedio con
  ponderación por existencias. Se revisó el caso de stock negativo: el promedio queda acotado y
  no genera valores absurdos en los flujos reales (no se puede comprar sin existencias coherentes
  en la UI). Se deja como **observación** a vigilar si se habilita stock negativo explícito.
- **`openTabs` en `AppState` es un campo muerto.** El carrito real vive en
  `localStorage` (`blink-pos-drafts-v1`, claves `DRAFTS_KEY`/`ACTIVE_TAB_KEY` en `Vender.tsx`).
  No es un bug; candidato a limpieza futura.
- **"Vendido" usa `saleNet` y la tabla usa `saleTotal`.** Es intencional: los KPIs miden ingreso
  neto (sin IVA/recargos/IGTF) y la tabla muestra lo que paga el cliente. Están etiquetados.
- **IVA/recargos.** Interpretación de negocio (no bug): IVA = 16% de (subtotal − descuento) antes
  de recargos; recargo = % de (subtotal − descuento); total = (subtotal − descuento) + IVA +
  recargos (+ IGTF).

---

## 4. Refuerzos de UI para "tasa sin configurar"

Comercio recién creado (antes de fijar la tasa): `setRate` **rechaza** tasa ≤ 0, así que el único
escenario válido de tasa 0 es el arranque. Se unificó el mensaje para que ninguna pantalla muestre
cifras engañosas:

- `Shell.tsx`: el chip de tasa muestra "Sin tasa" en vez de "Bs 0,00".
- `Ajustes.tsx`: la vista previa del recibo muestra "Configura la tasa".
- `Receipt.tsx`: `hasRate` oculta "TOTAL BS" cuando no hay tasa (ni de la venta ni del comercio).
- `Informes.tsx`: `buildVentas` usa `saleTotal(s)` (antes repetía la fórmula inline, con riesgo de
  divergencia).

---

## 5. Flujos verificados en vivo (2026-10-19)

Todos con el comercio de prueba (tasa 42,50):

| Flujo | Resultado |
|---|---|
| **Venta en efectivo USD** | Subtotal $1.50 + IVA $0.24 = $1.74; TOTAL BS Bs 73,95. Ticket correcto. |
| **Cotización** | `C-000001`, estado "Cotización", **excluida** de KPIs (Vendido $0.00). Ticket con marca COTIZACIÓN / SIN VALOR FISCAL. |
| **Venta a crédito** | Pago parcial $1.00 (IGTF $0.03), saldo $0.77. Venta `000001` estado **crédito**, pendiente "Venta 000001" $0.77 a nombre de María Gómez, caja $20 → $21, stock 48 → 47. La UI exige marcar "A crédito" para dejar saldo (evita créditos fantasma). |
| **Pago en bolívares (VES)** | Con cuenta en Bs: "Monto exacto" = Bs 113,48; referencia `REF-QA-001`. Venta `000002` **cobrada**; cuenta VES Bs 0 → **Bs 113,48** (sin conversión errónea). |
| **Anulación de venta** | Venta `000001` → **anulada** con motivo; pendiente → **anulado**; caja revertida $21 → $20 (movimiento "Anulación venta", salida $1.00); stock revertido 47 → 48. |
| **Cierre de caja (arqueo)** | Esperado $20.00 / Bs 113,48; contado igual → Diferencia $0.00 / Bs 0,00; registra `cashClosure` completo (apertura/contado/esperado/diferencia + nota). Sesión cerrada; top bar pasa a "Abrir caja". |
| **Transferencia multimoneda** | $5.00 de Caja Principal (USD) → Banco Bs Prueba (VES) con $0.50 de comisión: USD $20 → **$14.50**; VES Bs 0 → **Bs 212,50** ($5.00 × 42,50); dos movimientos (salida $5.50 USD / entrada $5.00 = Bs 212,50). |
| **Exportación CSV** | `productos.csv` (text/csv, UTF-8 con BOM, `\r\n`), encabezados y filas correctas. Botones por sección y globales ("Todos los reportes (CSV)", "Resumen general (PDF)", "Copia de seguridad (JSON)"). Conjuntos vacíos deshabilitan su botón. |
| **Estados vacíos** | Transferencias/Pendientes/etc. muestran estado vacío con texto guía correcto. |

---

## 6. Invariantes y decisiones que se mantienen

- **`setRate` rechaza tasa ≤ 0.** La tasa 0 solo existe en comercio nuevo antes de configurarla.
- **Descuentos:** tope vacío/0/inválido = ilimitado (`null`), nunca 0 usos.
- **Descuentos/recargos:** guardas `rate > 0` para mostrar equivalencias en Bs (BUG-4/BUG-7/BUG-8).
- **Abonos a pendientes:** acotados al saldo restante en el store (fuente única de verdad) + `max`
  en UI.
- **Cierre de caja:** el esperado en Bs/USD cuenta solo cuentas `type === "efectivo"` con
  `inCashClose !== false`; los bancos no entran al arqueo.
- **Transferencias:** mismo `fromId === toId` es no-op; multimoneda convierte con `toNative` a la
  tasa vigente.

---

## 7. Pendiente (no bloqueante)

- Retirar el **bypass temporal** (`app/src/lib/bypass.ts` + hooks en `store.tsx`) cuando el dueño
  lo indique.
- **SMTP propio o plan Pro de Supabase**: los límites del proveedor de correo por defecto
  (≈2/hora) siguen siendo un bloqueo de lanzamiento para el alta y la recuperación reales
  (ver `18` y `20`).
- **Fuentes SF Pro**: licencia solo-local; reemplazar antes de distribución pública.
- Limpieza opcional: campo muerto `openTabs` en `AppState`.
