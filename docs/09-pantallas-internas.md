# 09 · Pantallas internas y distribución (área autenticada)

Capturado con la sesión real (staging/pruebas). Datos de ejemplo del comercio: **"Tienda"**,
dueño **Diego Beleño**, moneda dual **USD + VES (Bs)** con **tasa BCV**.

> ⚠️ Privacidad: estos archivos contienen datos reales del comercio (nombre, RIF, proveedores).
> No compartir fuera del proyecto.

---

## 9.1 Layout del shell (distribución general)

Todas las pantallas comparten el mismo **shell de 3 zonas**:

```
┌───────────────────────────────────────────────────────────────────────┐
│ TOPBAR                                                                 │
│  [Tienda]  Bs 877,9023 BCV  por $ · BCV · hace un momento   [Abrir caja] │
│                                                        Diego Beleño · Dueño │
├──────────────┬────────────────────────────────────────────────────────┤
│ SIDEBAR      │  CONTENIDO (título + subtítulo + tabs + acciones + …)   │
│  Principal   │                                                         │
│   · Inicio   │                                                         │
│   · Ventas   │                                                         │
│     – Vender │                                                         │
│     – Historial                                                         │
│   · Catálogo │                                                         │
│   · Inventario│                                                        │
│   · Contactos│                                                         │
│   · Finanzas │                                                         │
│   · Informes │                                                         │
│   · Ajustes  │                                                         │
│  Cerrar sesión│                                                        │
└──────────────┴────────────────────────────────────────────────────────┘
```

**Topbar**
- Selector de comercio: **Tienda**.
- Indicador de tasa: **`Bs 877,9023 BCV`**, etiqueta `por $ · BCV · hace un momento`
  (tasa del **Banco Central de Venezuela**).
- Botón **Abrir caja** (inicia sesión de caja / cash-session).
- Usuario: **Diego Beleño · Dueño**.

**Sidebar** (navegación principal, grupo "Principal"):
`Inicio`, `Ventas` → (`Vender`, `Historial`), `Catálogo`, `Inventario`, `Contactos`,
`Finanzas`, `Informes`, `Ajustes`, y al final `Cerrar sesión`.

**Tema:** claro (`data-theme="light"`), densidad compacta (controles `h-9`, ~36px).
Ancho de sidebar según tokens: 13rem / 11rem / 4.5rem (colapsable).

---

## 9.2 Catálogo de pantallas

### `/inicio` — Inicio
- Saludo: **"Hola, Diego Beleño. Así va Tienda."**
- **Cierre del día** (Hoy, 13 oct.): Ventas netas, Ventas (nº), Ticket promedio, Utilidad neta.
  Cada KPI muestra **USD y Bs**; subtítulos: "Después de descuentos, sin IVA",
  "Número de ventas realizadas", "Venta neta promedio por operación", "Resultado del período".
- **Este mes** (1 oct.–13 oct.): mismos KPIs.
- **Para arrancar** (onboarding): "Prepara tu negocio, un paso a la vez." → **6 de 7 completados**;
  tareas tipo "Registrar la primera venta" con botón **Continuar** / **Ver todos los pasos**.
- **Por atender**: alertas → **Stock bajo (1)** ("Harina · Quedan 0 · mínimo 6") → **Ver existencias**.
- **Automatiza tus ventas con Wink**: promos → "Quiero mi tienda", "Quiero mi bot de WhatsApp"
  (abren en otra pestaña), con mockup de chat.

### `/ventas` — Vender (POS)
- Pestañas: **Vender** / **Historial**.
- Modo POS: **"Escáner listo"**, toggle **Modo POS**, buscador de productos.
- Grid de productos; ejemplo: `Harina $ 2,00 / Bs 1.755,80` (con "Sin registro de existencias").
- Estado vacío: **"Empieza una cuenta"** — "Toca un producto o escanea su código: la cuenta se abre sola."
- Botón **Nueva cuenta**.
- **Cuentas abiertas (1)**: `Venta 1 · A-FE237112` → **1 producto**.

### `/ventas/historial` — Historial de ventas
- Subtítulo: "Lo vendido, sus cobros y devoluciones."
- KPIs: **Vendido** ($ / Bs), **Ventas** (nº, "Sin contar cotizaciones ni anuladas"),
  **Ticket promedio**, **Vendido a crédito**.
- Acciones: **Importar**, **Plantilla vacía**.
- Filtros: **Todas** · "0 filtros activos".
- Vacío: "Aún no hay ventas… Las ventas que cobres en el POS aparecen aquí al instante." → **Ir al POS**.

### `/catalogo` — Catálogo
- Pestañas: **Productos** / **Precios** / **Categorías** / **Descuentos** / **Recargos**.
- Productos: "Todo lo que vendes, en un solo listado." · **Importar** · **Nuevo producto**.
- Tabla: columnas **Nombre · SKU · Costo · Margen · Categoría · Tipo · Precio · Estado**.
  Ejemplo: `Harina | — | — | — | Comida | Simple | $ 2,00 / Bs 1.755,80 | Activo`.
- Paginación: **50 por página**, Anterior/Siguiente, "Ir a la página".

### `/inventario` — Inventario
- Pestañas: **Existencias** / **Movimientos** / **Compras** / **Devoluciones** / **Ajustes** /
  **Traslados** / **Lotes**.
- Existencias: "Consulta lo disponible por producto y ubicación."
- Acciones: **Importar**, **Nueva salida**, **Nuevo ajuste**.
- KPIs: **Valor en inventario (costo)**, **Valor a precio de venta** (USD + Bs).
- Vacío: "Las existencias aparecerán aquí cuando registres una entrada de inventario." → **Registrar una compra**.

### `/contactos` — Contactos
- "Clientes y proveedores en un solo lugar." · **Importar** · **Nuevo contacto**.
- Tabla: **Nombre · Documento · Teléfono · ES (tipo) · Crédito**.
  Ejemplo: `COCA-COLA | J-342015804 | 04145553435 | Proveedor | 30 días`.
- Paginación 50/página.

### `/finanzas` — Finanzas
- Pestañas: **Cuentas** / **Movimientos** / **Transferencias** / **Gastos** / **Pendientes** /
  **Gastos recurrentes** / **Categorías de gasto** / **Registros de cierre**.
- Cuentas: "Dónde entra y sale tu dinero: efectivo, bancos, pagos móviles." · **Nueva cuenta**.
- **Total consolidado** ($ / Bs).
- **Exposición cambiaria** (cuentas en bolívares, mes): **Bolívares conservados**,
  **Variación cambiaria**, **Tasa oficial 877,9023 Bs por USD**.
  Nota: "Es una variación del valor en USD de lo que conservas, no una pérdida realizada."
- Tabla: **Nombre · Tipo · Moneda · Saldo · Estado** (`Cuenta 1 | Pago móvil | VES | Bs 0,00 / $ 0,00 | Activa`).
- Acciones por fila: Transferir, Ingresar, Retirar, Eliminar.

### `/informes` — Informes (Resultados)
- Pestañas: **Resultados** / **Inventario** / **Ventas** / **Finanzas**.
- Selector de período (**Este mes**) + export **PDF**.
- KPIs: Ventas netas, Gastos, Utilidad neta — cada uno con **comparación vs. período anterior**.
- Gráfico **Resultados por mes** (últimos 12 meses, valores en USD, accesible por flechas).
- **"De las ventas a tu utilidad"**: Ventas netas → Costo de lo vendido → Utilidad bruta →
  Gastos → Pérdidas de inventario → Utilidad neta.
- **Capital (a hoy)**: En cuentas, Inventario a costo, Por cobrar, Por pagar, Patrimonio neto.
- **Desglose del resultado** y **Efecto cambiario (informativo)**.

### `/ajustes` — Ajustes
- Pestañas: **Negocio** / **Moneda e impuestos** / **Canales** / **Ubicaciones** /
  **Comportamiento** / **Usuarios y roles** / **Bitácora**.
- **Negocio** → *Datos del comercio*: Nombre del comercio (*), Razón social, RIF, Teléfono, Dirección.
- **Recibo**: Título del recibo (default "Comprobante de venta"), Formato de impresión
  (**Ticket 58 mm / 80 mm / Carta**), Pie del recibo (máx. 300 caracteres), "Datos que se muestran",
  **Vista previa**.
- **Moneda principal: Dólares (USD)** → "Ir a Moneda e impuestos".
- Estado de cambios: "Sin cambios — Aún no has realizado cambios en esta sección" → **Guardar**.

---

## 9.3 Detalle de sub-rutas capturadas
| Ruta | Contenido |
|---|---|
| `/informes/resultados` | Igual a `/informes` (pestaña por defecto Resultados) |
| `/informes/ventas` | Informe de ventas del período |
| `/inventario/existencias` | Igual a `/inventario` (pestaña Existencias) |

> La captura de sub-rutas navegó por enlaces del menú; muchas pestañas son **estado interno**
> (no cambian la URL), por lo que su contenido está en el DOM/HTML capturado de cada pantalla.
