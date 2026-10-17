# 11 · Modelo de datos y reglas de negocio (inferido)

Inferido de las pantallas, del copy de la UI y de la API observada. Es un POS **multi-moneda**
(Venezuela), con control de inventario, finanzas y reportes contables.

## 11.1 Entidades principales

### Business (comercio)
- `nombre` (obligatorio), `razonSocial`, `rif`, `telefono`, `direccion`.
- `monedaPrincipal` (por defecto **USD**).
- Config de **recibo**: `titulo` (default "Comprobante de venta"), `formato`
  (`58mm | 80mm | carta`), `pie` (≤300 chars), `datosMostrados[]`.

### Product
- Campos de tabla: `nombre`, `sku`, `costo`, `margen`, `categoria`, `tipo`
  (`Simple` / …), `precio` (en USD + Bs), `estado` (`Activo`/…).
- Relacionado con `units`, `taxes`, `stock-balances`.
- **Precio dual:** se muestra en **USD** y su equivalente **Bs** según la **tasa BCV**.

### Variant / Lote / Existencia
- **Variantes** por producto, con `stock` por **ubicación** (`locations`).
- **Lotes** (Lotes tab) y **variantes por vencer** (`/stock-alerts/expiring-variants`).
- **Stock mínimo** por producto → dispara **Stock bajo** (ej. Harina: quedan 0, mínimo 6).

### Contact
- `nombre`, `documento` (ej. RIF `J-342015804`), `telefono`, `tipo` (**Cliente/Proveedor**),
  `credito` (ej. `30 días`).
- Un contacto puede ser cliente **y** proveedor.

### Sale (venta)
- Estados: **cotización**, **anulada**, **cobrada**, **a crédito**.
- KPIs: `vendido`, `nVentas`, `ticketPromedio`, `vendidoACredito`.
- **Cuentas abiertas (tabs)**: una venta puede quedar abierta en el POS (`A-…`).
- `devoluciones` asociadas.

### CashSession (caja)
- `current` por comercio/usuario; **Abrir caja** inicia la sesión.
- Registros de cierre (`Registros de cierre` en Finanzas).

### Account (cuenta financiera)
- `nombre`, `tipo` (Efectivo / Banco / **Pago móvil**), `moneda` (**VES**/USD), `saldo`, `estado`.
- Operaciones: **Transferir**, **Ingresar**, **Retirar**.
- **Exposición cambiaria**: Bolívares conservados → equivalente USD a tasa oficial; variación del mes.

### Expense (gasto)
- Gastos, **gastos recurrentes**, **categorías de gasto**.

### Pending (pendiente)
- **Por cobrar** / **por pagar**.

### Discount / Surcharge / Tax
- Descuentos, recargos e impuestos.

### User / Role / Invitation
- Roles y usuarios del comercio; invitaciones.

### ExchangeRate
- `/exchange-rates/current` → **tasa BCV** (ej. `877,9023 Bs/USD`).
- Se muestra "hace un momento" con fecha de referencia.

## 11.2 Reglas de negocio clave (observadas)

1. **Venta dual USD/VES:** todo importe se muestra en dólares y en bolívares a la tasa BCV vigente.
2. **Antes de vender hay que abrir caja** (`/cash-sessions/current`).
3. **El POS abre cuenta automáticamente** al tocar un producto o escanear un código.
4. **Stock mínimo → alerta** en Inicio ("Por atender") y en Inventario.
5. **Ticket promedio** = venta neta / nº de ventas; excluye cotizaciones y anuladas.
6. **Margen** por producto = (precio − costo) / precio.
7. **Utilidad neta** = Ventas netas − Costo de lo vendido − Gastos − Pérdidas de inventario.
   (descomposición exacta mostrada en Informes).
8. **Capital (a hoy)** = En cuentas + Inventario a costo + Por cobrar − Por pagar.
9. **Exposición cambiaria** es **informativa**: variación del valor en USD de saldos en Bs,
   **no** una pérdida realizada; no altera saldos.
10. **Importación** de catálogo/contactos/existencias vía plantillas.
11. **Recibo** configurable (formato 58/80mm o carta) con vista previa.
12. **Moneda principal USD**; los bolívares se conservan como saldo con exposición cambiaria.

## 11.3 Flujo de primera venta (onboarding 6/7)
1. Configurar negocio (nombre/RIF) → 2. … → **6. Registrar la primera venta** (pendiente).
El checklist vive en `/onboarding` y se refleja en "Para arrancar" en Inicio.
