# 30 · Créditos / Cuentas por Cobrar (CXC) — documentación funcional

**Módulo 3 del cierre de MVP.** Ruta `/app/creditos`, entrada «Créditos» en la navegación, tarjeta `creditcard`. Se activa con `business.features.credit`: si el comercio no lo tiene encendido, la entrada no aparece y **el POS funciona exactamente igual** —es el requisito de desacoplamiento, no un adorno.

---

## 1. Vocabulario: una regla de producto, no de estilo

Las palabras **«fiado», «fiar» y sus flexiones están prohibidas** en interfaz, mensajes, reportes y base de datos. El vocabulario oficial es **Créditos**, **Cuentas por Cobrar (CXC)** y **Deudores**.

Comprobado sobre el repo: `grep -rniE "\bfiad[oa]s?\b|\bfiar\b"` sobre `app/src`, migraciones y funciones solo devuelve **una línea**, y es un comentario de `lib/creditos.ts:9` que enuncia la propia regla («…y «Deudores». Nunca la forma coloquial de fiar»). Ningún dato, columna ni etiqueta la usa.

**Por qué importa:** el comercio imprime estos textos y se los manda a su cliente. «Fiado» suena a favor; «Cuenta por cobrar» suena a libro. Y un término coloquial que se cuela en una columna de base de datos después no hay Dios que lo saque.

---

## 2. Sin límite de crédito

No existe campo de límite ni validación de tope: un deudor puede acumular lo que el comercio decida acreditarle. Es una decisión de producto del plan (§4.1), no una ausencia. Lo que sí se controla es el **plazo**: `creditDays` del contacto, congelado como `dueAt` **en el momento de la venta**.

```
dueAt = at + contact.creditDays · 86 400 000
```

Congelarlo y no calcularlo leyendo el contacto evita el defecto clásico: que cambiar los días de crédito de un cliente reescriba —y revise hacia atrás— cuentas ya emitidas. La cuenta refleja las condiciones de la venta que la originó.

---

## 3. Vender a crédito

En la ventana de cobro, el método de pago ofrece **«Crédito»**. Acepta las dos ramas que pide el plan:

- **crédito completo** — toda la cuenta queda pendiente;
- **mixto parcial + crédito** — una parte se cobra en caja/banco y el resto queda por cobrar.

Al marcar «A crédito» se abre el **modal ágil de cliente** (`components/SelectorCliente.tsx`), sin salir de la venta:

| Campo | Carácter |
|---|---|
| Nombre | **obligatorio** |
| Apellido | **obligatorio** |
| Cédula | opcional |
| Teléfono | opcional |

Busca por nombre, cédula o teléfono; si el cliente no está, **la misma ventana** ofrece la ficha de alta rápida (`addContact` ahora devuelve el `id` para poder acreditarle la venta en el mismo gesto). Escape cierra el selector sin cerrar la ventana de cobro.

**Medido (T4, T5).** Alta rápida: `venta method="Crédito" cliente="MARIA PEREZ"` + `pendiente direction=cobrar status=abierto amount=10 contactId="cont_…"`. Cliente existente: `Enter` elige y cierra, `contactId="c1"`, y la caja **no se mueve** (`caja tras la venta a crédito: [0]`) — una venta a crédito no entra dinero.

---

## 4. La vista de Deudores

Tres cifras arriba (`creditos-resumen`), lista filtrable (`creditos-lista`) y ficha por deudor (`creditos-ficha`):

```
Por cobrar $ 10.00   ·   Deudores 1 (1 cuenta vencida)   ·   En mora 0 (con 30 días o más)
Deudor · Documento · Teléfono · Cuentas · Saldo · Vence · Atraso        [ Ver ] [ Abonar ]
```

- **«Vence»** muestra la fecha de `dueAt`; **«sin vencimiento»** si el contacto no tiene plazos.
- **«Atraso»** son días sobre el vencimiento; **«mora»** empieza a los **30 días** (`DIAS_MOROSO`).
- Las ventas a crédito hechas **sin cliente** no se pierden: se agrupan en **«Sin cliente asignado»** y se pueden abonar y reportar como cualquier otro deudor (medido en **T8**: `fila: "Sin cliente asignado — 1 $ 10.00 sin vencimiento 40 días"`).

El dominio puro vive en `lib/creditos.ts` —`saldo`, `vigente`, `totalPorCobrar`, `vencimiento`, `diasDeAtraso`, `deudores`, `morosos`, `cuentasDe`, `abonosDe`, `estadoDeCuenta`, `saldoAlCierre`— sin React ni almacenamiento, con **18 pruebas unitarias**. La pantalla solo presenta; la cuenta la lleva el dominio.

---

## 5. Abonos: las mismas opciones multidivisa que en la venta

El botón **«Abonar»** abre la ventana con **el mismo selector de cuentas y las mismas dos monedas (Bs / \$) que la pantalla de venta**, no una versión simplificada. Muestra saldo de la cuenta, «Abonado ahora» y «Falta por abonar» mientras se teclea, y el botón dice exactamente lo que va a registrar: `Registrar abono de $ 10.00`.

Regla de dinero única: `CobroAbono { accountId, amountUsd, reference? }` y `abonoPendingPagos(id, cobros, note)`. `abonoPending` es una fachada que delega con un solo cobro, así que **no hay dos formas de abonar**.

- Cada cobro se **topa al saldo restante**: `aplicado = round2(min(c.amountUsd, restante))`. Nadie puede abonar de más por un tecleo torpe.
- La **comisión** de la cuenta receptora se aplica al movimiento (`net`), igual que en una venta.
- El **IGTF no se aplica a los abonos**, a propósito: abonar no es pasar una terminal.
- El estado se recalcula con el total aplicado: `parcial` o `saldado`.

**Medido (T7), un abono partido en dos monedas** —\$ 4 en Caja y **Bs 240** en Banco, con la tasa del día a 40 y el botón «Monto exacto» rellenando la conversión:

```
libro: pending=saldado paid=10 · cuentas=["Caja:4","Banco:240"]
       asientos=["Abono/USD/4/pend=pd1","Abono/VES/6/pend=pd1"]
ficha: "Venta 000001 06 oct 2026 · $ 10.00 · saldo $ 0.00 saldado 15 nov 2026
        · Caja · Venta 000001 $ 4.00 15 nov 2026 · Banco · Venta 000001 $ 6.00"
```

La ventana de abono se cierra y **la ficha del deudor se queda abierta** para seguir registrando; la cuenta pasa a `saldado` con su fecha.

---

## 6. Salida impresa

Dos documentos, ambos por el contrato medido de [29](./29-registro-correcciones-pdf.md):

- **Estado de cuenta** por deudor: totales (cuentas, movimientos, total cargado, total abonado, saldo al cierre) y tabla Fecha · Concepto · Referencia · Debe · Haber · Saldo. Medido en T7 y T8, incluido el grupo «Sin cliente asignado».
- **Reporte CXC general**: cabecera con deudores y vencidas, cuatro cifras y la tabla de deudores. Medido en T8.

---

## 7. Anular una venta a crédito

Anular revierte los abonos aplicados **y anula la cuenta por cobrar, incluso si estaba saldada** —antes se saltaba las saldadas y dejaba en pie el fantasma de un crédito de una venta que ya no existe (**BLINK-099**, corregido y documentado en [29](./29-registro-correcciones-pdf.md#1-motor-de-impresion-blink-099--el-único-camino-al-pdf)). El historial sigue visible: anular no es borrar.

---

## 8. Cómo se vuelve a medir

```bash
cd /home/prodz/BLINK_POS_Hallazgos/scripts
SOLO=T4,T5,T7,T8 node sonda-cierre-mvp.mjs    # crédito completo, alta rápida, abono multidivisa, sin cliente
npx vitest run src/lib/creditos.test.ts        # 18 pruebas del dominio puro
```
