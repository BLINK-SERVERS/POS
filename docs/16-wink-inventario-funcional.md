# 16 · Wink POS — Inventario funcional (sesión en vivo)

Documento elaborado a partir de una **sesión real en vivo** en la app de Wink
(`https://app.wink-pos.com`, API `https://api.wink-pos.com`), navegando e interactuando
con todos los módulos. Complementa a `09-pantallas-internas.md` (catálogo de pantallas),
`10-api-endpoints.md` (API) y `11-modelo-datos-negocio.md` (modelo de datos).

> Objetivo: describir **comportamiento funcional** (acciones, campos, validaciones, reglas,
> estados), no el código, los estilos ni el marcado de Wink. Todo lo replicable en BLINK
> se diseña de forma propia.

---

## 0. Contexto de acceso (verificado en vivo)

- **App:** `https://app.wink-pos.com` (SPA Angular, design system propio `bento-*`).
- **API:** `https://api.wink-pos.com` (REST, sesión por cookie + `POST /auth/refresh`).
- **Login:** correo + contraseña **o** `Continuar con Google` (OAuth a
  `api.wink-pos.com/auth/google/callback`). Además `Cloudflare Turnstile` (captcha, puede
  ser invisible o interactivo).
- **Sesión observada:** comercio "Tienda", dueño "Diego Beleño", moneda dual **USD + Bs**,
  tasa **BCV** (ej. `879,1225 Bs/USD`).
- Ruta protegida redirige a `/entrar?volver=<ruta>`.

---

## 1. Shell (marco común de toda la app)

**Topbar**
- Selector de comercio (superior izquierdo).
- **Chip de tasa** (`Bs 879,1225` + `por $ · BCV · hace 8 h`): abre **calculadora de tasa**.
- **Tarjeta Caja**: `Abrir caja` / `Caja abierta · <hh> h <mm> min` / `Caja · Consultando…`.
- **Mi perfil**: usuario + rol (`Dueño`). Incluye cambiar moneda de vista
  (`USD primero` / `Bs primero` / `Del comercio`), `Cambiar contraseña`,
  `Dispositivos y sesiones`.
- Botón `Ayúdanos a mejorar`.

**Sidebar** (`Principal`): Inicio · Ventas (`Vender`, `Historial`) · Catálogo · Inventario ·
Contactos · Finanzas · Informes · Ajustes · `Cerrar sesión`. Colapsable.

**Comportamientos transversales**
- Ventas y saldos se muestran **en las dos monedas** (USD + Bs) a la tasa BCV vigente.
- **Avisos (toasts)** y **host de confirmación** globales.
- Diálogos modales (`bento-dialog`) reutilizados por todos los formularios.

---

## 2. Inicio (`/inicio`)

- Saludo: `Hola, <usuario>. Así va <comercio>.`
- **Cierre del día** con selector de fecha → `Vender` + botón **Cierre del día**
  ("Resumen de la operación para compartir").
- KPIs **Hoy** y **Este mes**: `Ventas netas`, `Ventas` (nº), `Ticket promedio`,
  `Utilidad neta` (cada uno USD + Bs).
- **Por atender**: alertas agregadas (p. ej. `Stock bajo`, `Caja sin cerrar`,
  `Gastos fijos pendientes`, `Pendientes por vencer`). Cada alerta enlaza a su módulo.
- **Caja sin cerrar**: avisa del turno abierto (`El turno de <usuario> en <ubicación>
  sigue abierto desde el <fecha>.`) → `Cerrar caja`.
- **Onboarding "Para arrancar"** (`/onboarding`): checklist de puesta en marcha
  (p. ej. "Registrar la primera venta"); progreso tipo `6 de 7 completados`.
- **Promos**: "Automatiza tus ventas con Wink" (tienda en línea + bot de WhatsApp).

---

## 3. Ventas

### 3.1 Vender / POS (`/ventas`)

Layout: **izquierda** catálogo (buscador/escaner + grilla de productos), **derecha** ticket.

**Cuentas abiertas (multi-venta)**
- Pestañas de cuentas simultáneas (`Venta 1 · A-XXXXXXX`, `Venta 2`, …), con **código**.
- `Nueva cuenta` (la actual queda abierta), `Descartar cuenta`
  (si la venta no se guardó, avisa que se pierden sus productos).
- Estado de la cuenta: `Guardado` / `1 producto` / `N productos`.
- **Canal y ubicación de la cuenta** (`Principal · Principal`): botón para cambiarlos
  ("Solo puedes mover productos entre cuentas del mismo canal y ubicación").
- Indicador **`Escáner listo`** (modo escáner / ayuda).

**Catálogo del POS**
- Buscador `Buscar o escanear`.
- Grid de productos; al tocar uno se **agrega a la venta**. El tile muestra nombre,
  precio en la moneda principal + equivalente.
- Productos sin control de inventario muestran `Sin registro de existencias`.

**Ticket / carrito**
- Cliente: `Consumidor final` por defecto · `Toca para asignar un cliente` → `Asignar`.
- Líneas: producto, `Bs X c/u`, subtotal por línea, **stepper** de cantidad,
  `Quitar`, `Editar` (precio/cantidad/nota).
- Totales: `Subtotal`, `IVA 16 %`, `Total` (USD + Bs).
- Nota informativa: **"Al cobrar en dólares se suma el IGTF (3 %)."**

**Acciones del ticket**
- **Cobrar** → pantalla de cobro (ver 3.2).
- **Guardar cotización** / **Generar cotización** → la venta queda como **cotización**
  (estado `Cotización`), no cuenta como venta.
- **Dividir cuenta**: mueve productos/cantidades a otra cuenta. Requiere cuenta destino
  del **mismo canal y ubicación**.
- **Asignar mesa**: elige la **mesa** donde se atiende la cuenta (modo restaurante).
- **Descuento**: uno por venta, **sobre el subtotal antes de IVA**; lista solo descuentos
  vigentes con usos disponibles; enlace a `Catálogo → Descuentos`.
- **Recargos**: se pueden sumar varios; el porcentaje va **sobre el neto, sin IVA**;
  enlace a `Catálogo → Recargos`.
- **Nota de la venta**.

### 3.2 Cobrar (checkout)

- Encabezado: `Cobrar <Venta N · A-XXXX>`, cliente, `Guardar cotización`.
- **FALTA POR COBRAR** + `Total de la venta` (USD + Bs).
- **Método de pago**: tiles de métodos. Los métodos son **cuentas** configuradas en
  Finanzas (p. ej. `Cuenta 1 · Pago móvil · Bs`) **+ `A crédito` (Cuenta por cobrar)**.
- **Monto**: teclado numérico, entrada en Bs con equivalente `≈ $`, `Monto exacto`.
- **Comisión / Neto** (según comisión de la cuenta).
- **Referencia (opcional)**.
- **Agregar cobro** → se pueden **combinar varios cobros** (pagos parciales).
- **Ajustes de la venta**: `Descuento`, `Recargos`, `Nota de la venta` (accesos directos).
- Resumen: líneas, `Subtotal`, `IVA 16 %`, `Total`, `Cobros`.
- **Confirmar venta** (o queda a crédito si el cobro no cubre el total).
- Regla del **IGTF**: el cobro en dólares suma 3 % de IGTF.

### 3.3 Historial (`/ventas/historial`)

- Subtítulo: "Lo vendido, sus cobros y devoluciones."
- KPIs: `VENDIDO`, `VENTAS` ("Sin contar cotizaciones ni anuladas"),
  `TICKET PROMEDIO` ("Por venta"), `VENDIDO A CRÉDITO` ("Ninguna venta a crédito").
- Acciones: `Importar`, `Plantilla vacía`; nota "Para el detalle, ve a Informes".
- Filtros `Todas` + filtros activos; orden.
- Fila: **código** (`000001` numeración secuencial / `C-000001` para cotización),
  monto (USD + Bs), `Fecha`, `Cliente`, `Cajero`, `Método`, `Estado`
  (`Pagada` / `Cotización` / a crédito / anulada).
- Paginación (50/página, "Ir a la página").

---

## 4. Catálogo (`/catalogo`)

Pestañas: **Productos · Precios · Categorías · Descuentos · Recargos**.

### 4.1 Productos (`/catalogo/productos`)
- Cabecera: "Todo lo que vendes, en un solo listado." · `Importar` · `Nuevo producto`.
- Filtros: `Todos` / `Activos` / `Archivados` (con conteos).
- Columnas: **Nombre · SKU · Costo · Margen · Categoría · Tipo · Precio · Estado**.
- Acción por fila: `Eliminar` (archivar).

**Formulario "Nuevo producto"**
- **Tipo**: `Simple` | `Servicio` (radio).
- **Nombre** (*).
- **Categoría** (select `— Sin categoría —` + `+ Nueva categoría`).
- **IVA** (select; por defecto `Predeterminado del comercio (16 %)`).
- **Unidad** (*) (p. ej. `Unidad (und)`).
- **SKU** ("Opcional, único por comercio").
- **Código de barras**.
- **Precio** (*) (en moneda principal).
- **Controlar inventario** (switch) → **Stock mínimo** (número, "Aviso cuando quede por
  debajo").

### 4.2 Precios (`/catalogo/precios`)
- Subtítulo: "Costo, precio y margen de cada producto en cada canal."
- Acciones: `Descargar lista de precios`, `Cambiar precios…`.
- Por producto: costo (`Promedio de lotes`), y por **canal**: `Precio · Margen · Activo`.
- Edición masiva de precios (**`Cambiar precios…`**).

### 4.3 Categorías (`/catalogo/categorias`)
- "Agrupan tus productos en Ventas, Inventario e Informes."
- `Nueva categoría`. Campos: **Nombre**, **Estado** (`Activa`), **Orden**.

### 4.4 Descuentos (`/catalogo/descuentos`)
- "Códigos que se aplican al cobrar una venta."
- Formulario: **Nombre** (*), **Código** (*, "se guarda en MAYÚSCULAS"), **Tipo**
  (`Porcentaje` / …), **Porcentaje %**, **Usos máximos** ("Vacío = ilimitado"),
  **Vigente desde**, **Vigente hasta**, **Activo**. Regla: **un descuento por venta**.

### 4.5 Recargos (`/catalogo/recargos`)
- "Delivery, servicio de mesero y otros cargos de la venta."
- Formulario análogo a descuentos (nombre, tipo `Monto`/`Porcentaje`, monto/%, activo).
  Regla: **se pueden sumar varios**; % sobre el neto sin IVA.

---

## 5. Inventario (`/inventario`)

Pestañas: **Existencias · Movimientos · Compras · Devoluciones · Ajustes · Traslados · Lotes**.

### 5.1 Existencias (`/inventario/existencias`)
- "Consulta lo disponible por producto y ubicación."
- Acciones: `Importar`, `Nueva salida`, `Nuevo ajuste`.
- KPIs: **Valor en inventario (costo)** y **Valor a precio de venta** (USD + Bs).
- Filtros: `Todas` / `Bajo mínimo` / `Agotados` / `Por vencer`.
- Por producto: existencia (con unidad), SKU, categoría, **Costo unitario**,
  **Valor a costo**, **Valor a venta**, estado; acción rápida `Salida`.

### 5.2 Movimientos (`/inventario/movimientos`)
- "Consulta el libro de entradas y salidas."
- Filtros: Fecha del movimiento, Producto, **Origen**, Ubicación, Usuario.
- Fila: producto, tipo (`Entrada`/`Salida`), cantidad, fecha/hora, costo unitario,
  **Origen** (`Venta #000001`, `Ajuste`, `Compra`, `Traslado`, `Devolución`), ubicación, usuario.

### 5.3 Compras (`/inventario/compras`)
- "Registra la entrada de mercancía de tus proveedores."
- `Importar` (Excel) con diálogo: una fila por línea agrupada por nº de compra y proveedor;
  **previsualización** (qué se crea/actualiza/igual/rechaza) y **no guarda hasta confirmar**;
  plantilla `.xlsx` descargable; si una fila falla **no se guarda ninguna compra**.
- `Nueva compra`: **Proveedor** (*), **Ubicación** (*), **Forma de pago** (*; `Efectivo` /
  cuenta / a crédito con el proveedor), **Cuenta** (*), **Fecha** (opcional),
  **Número de factura** (opcional), **Líneas** (`Agregar línea`: producto, cantidad, costo).

### 5.4 Devoluciones (`/inventario/devoluciones`)
- "Devoluciones a proveedores"; filtro por Proveedor.

### 5.5 Ajustes (`/inventario/ajustes`)
- "Documentos de corrección de inventario"; filtros Fecha del ajuste, Ubicación.

### 5.6 Traslados (`/inventario/traslados`)
- "Mueve mercancía de una ubicación a otra."; filtro Ubicación.
- `Nuevo traslado`: **Origen** (*), **Destino** (*), **Productos**
  (producto, `Disponible en el origen`, cantidad), **Nota** (opcional).

### 5.7 Lotes (`/inventario/lotes`)
- "Costo y disponibilidad por lote **FIFO**."
- Filtros: `Incluir agotados`, `Solo por vencer`; `Descargar operaciones`.
- Por lote: producto, existencia, ubicación, `Recibido`, `Vence`, `Costo`,
  `Inicial`, y acciones `Dividir`, `Corregir costo`, `Unir lotes` (con `Motivo`).

---

## 6. Contactos (`/contactos`)

- "Clientes y proveedores en un solo lugar." · `Importar` · `Nuevo contacto`.
- Columnas: **Nombre · Documento · Teléfono · ES (tipo) · Crédito**.
- Formulario **Nuevo contacto**:
  **Nombre o razón social** (*), **Cliente** / **Proveedor** (checkboxes; un contacto puede
  ser ambos), **Tipo** de documento (p. ej. `—`, V/E/J/RIF), **Documento (cédula o RIF)**,
  **Teléfono**, **Correo**, **Días de crédito** ("Vacío = solo de contado"), **Dirección**,
  **Notas**.

---

## 7. Finanzas (`/finanzas`)

Pestañas: **Cuentas · Movimientos · Transferencias · Gastos · Pendientes ·
Gastos recurrentes · Categorías de gasto · Registros de cierre**.

### 7.1 Cuentas (`/finanzas/cuentas`)
- "Dónde entra y sale tu dinero: efectivo, bancos, pagos móviles."
- **Total consolidado** (USD + Bs).
- **Exposición cambiaria** (cuentas en bolívares, por mes): `Bolívares conservados`,
  `Variación cambiaria` (ganancia/pérdida **no realizada**), `Tasa oficial` (Bs/USD + desde
  cuándo). Navegación por meses; aclara que **no cambia saldos**.
- Filtros `Todas` / `Activas` / `Inactivas`. Por cuenta: nombre, saldo (USD+Bs), `Tipo`,
  `Estado`; acciones `Transferir`, `Ingresar`, `Retirar`, `Eliminar`.
- `Nueva cuenta`: **Nombre** (*), **Tipo** (*: `Efectivo` / `Banco` / `Pago móvil`),
  **Moneda** (*: USD/VES), **Comisión al recibir (%)** (se descuenta de cobros y abonos por
  cobrar; el documento queda pagado por el **monto bruto**), **Comisión al enviar (%)**
  (se suma a pagos de gasto, compras, abonos por pagar y reembolsos; sugerida y editable
  en transferencias), **Saldo inicial** (opcional).

### 7.2 Movimientos (`/finanzas/movimientos`)
- "Libro de entradas y salidas de tus cuentas." Filtros Fecha, Cuenta, Tipo, Usuario.
- Acciones: `Nuevo ajuste de saldo`, `Nueva transferencia`.
- Fila: tipo (`+`/`-`), monto (USD+Bs), fecha, cuenta, usuario, `Dirección`
  (Entrada/Salida), `Origen` (`Venta`, `Arqueo de caja`, `Gasto`, `Compra`, `Transferencia`,
  `Abono`…), `Nota`.
- **Ajuste de saldo**: Cuenta (*), "Saldo después del ajuste" (*), Motivo (*), Nota.
- **Nueva transferencia**: Cuenta origen/destino (*), Monto a enviar (*) con `Monto`/`Porcentaje`,
  Comisión ($/≈Bs), y resumen (monto transferido, comisión, total que sale, entra en destino).

### 7.3 Transferencias (`/finanzas/transferencias`)
- "El dinero que moviste entre tus cuentas, con su comisión y sus correcciones."
- Filtros Cuenta, Fecha, Correcciones. `Nueva transferencia`; `Corregir transferencia`.

### 7.4 Gastos (`/finanzas/gastos`)
- "Lo que sale de tu negocio: alquiler, servicios, insumos."
- KPIs: `Total`, `Pagado` ("Ya salió de tus cuentas"), `Sin pagar` ("Falta por pagar"),
  `Fijos` (de recurrentes), `Variables` (el resto).
- Filtros: Fecha del gasto, Categoría, `Incluir anulados`; estados
  `Todos` / `Sin pagar` / `Pagados` / `Anulados`.
- **Nuevo gasto**: **Categoría** (*), **Nombre** (*), **Monto** (*), **Fecha del gasto** (*),
  **Nota**, **Pagado ahora** (crea y paga en un paso).
- **Pagar gasto**: Cuenta (*), Nota.

### 7.5 Pendientes (`/finanzas/pendientes`)
- "Lo que te deben y lo que debes."
- KPIs: `Todos`, `Abiertos`, `Parciales`, `Saldados`, `Anulados`, `Solo vencidos`.
- **Nuevo pendiente**: **Dirección** (*: `Por cobrar (me deben)` / `Por pagar`),
  **Contraparte** (*, contacto), **Asunto** (*), **Monto** (*), **Fecha de emisión** (*),
  **Vencimiento** (opcional), **Nota**.
- **Abonar pendiente**: Cuenta (*), Monto del abono (*), Nota.

### 7.6 Gastos recurrentes (`/finanzas/gastos-recurrentes`)
- "Gastos que se repiten: alquiler, nómina, servicios."
- Regla: al llegar la fecha, Wink **crea un gasto pendiente de pago** en Gastos; **no mueve
  dinero**; si pasaron varios vencimientos sin generarse, **solo se crea el más reciente**.
- **Nuevo gasto recurrente**: **Nombre** (*), **Categoría** (*), **Monto** (*),
  **Frecuencia** (*; `Mensual`…), **Primer vencimiento** (*) (se repite el mismo día del mes;
  si el mes no llega a ese día, cuenta el último), **Activa**.

### 7.7 Categorías de gasto (`/finanzas/categorias-de-gasto`)
- "Agrupan tus gastos para analizarlos mejor."
- Catálogo por defecto (11): Alquiler, Compra de productos e insumos,
  Gastos administrativos, Mantenimiento y reparaciones, Mercadeo y publicidad,
  Muebles/equipos/maquinaria, Nómina, Otros, **Pago de impuestos (IVA/IGTF)** (marcada como
  **Del sistema**, no desactivable), Servicios públicos, Transporte y logística.
- **Nueva categoría de gasto**: **Nombre** (*), **Activa**.

### 7.8 Registros de cierre (`/finanzas/caja`)
- "Quién abrió y cerró cada caja, qué se contó y qué no cuadró."
- Para abrir/cerrar caja: tarjeta **Caja** del menú lateral.
- Filtros + listado (fecha, caja, ubicación, quién abrió/cerró, conteos, diferencia).

---

## 8. Informes (`/informes`)

Pestañas: **Resultados · Inventario · Ventas · Finanzas**. Selector de período (p. ej.
`Este mes`) + export **PDF**.

### 8.1 Resultados (`/informes/resultados`)
- KPIs: `Ventas netas`, `Gastos`, `Utilidad neta` (USD+Bs) con **comparación vs. período
  anterior** ("Variación en USD").
- **Resultados por mes** (últimos 12 meses, independiente del período; valores en USD).
- **"De las ventas a tu utilidad"**: `Ventas netas → Costo de lo vendido → Utilidad bruta →
  Gastos → Pérdidas de inventario → Utilidad neta`.
- **Capital (a hoy)**: "Foto de dinero, inventario, pendientes e impuestos cobrados
  vigentes. No es la utilidad del período." → `En cuentas`, `Inventario a costo`,
  `Por cobrar`, `Por pagar` (incluye gastos pendientes), `Impuestos por pagar (IVA e IGTF)`,
  `Patrimonio neto`.
- **Efecto cambiario (informativo)**.

### 8.2 Inventario (`/informes/inventario`)
- KPIs: `Valor a costo`, `Valor a venta`, `Bajo mínimo`, `Por vencer` (próximos 30 días).
- **Histórico de cierres mensuales** (valor a costo reconstruido; los cierres y mermas
  conservan sus períodos).
- **Valor por categoría** (distribución a costo).
- **Rotación y productos hot**: vendidos/30 d, existencia, rotación, días restantes.
- **Mermas por motivo** (últimos 30 d) y **Por vencer (próximos 30 días)**.

### 8.3 Ventas (`/informes/ventas`)
- KPIs: `Ventas netas`, `Ventas` (nº), `Ticket promedio`.
- **Evolución diaria**; **Ventas por canal**; **Ventas por categoría**;
  desglose **Por cliente / Por usuario / Por forma de pago**;
  **Horas y días pico** (matriz día × hora);
  **Más vendidos** + `Buscar productos del período`.

### 8.4 Finanzas (`/informes/finanzas`)
- KPIs: `Entradas del período`, `Salidas del período`, `Total consolidado`.
- **Saldos por cuenta** (moneda, equivalente USD).
- **Entradas y salidas** (gráfico del período).
- **Gastos por categoría**.
- **Antigüedad de cuentas por cobrar y pagar**: `Al día`, `1–30`, `31–60`, `61–90`,
  `Más de 90 días vencido`, `Sin vencimiento`.
- **Turnos cerrados con diferencia**; **Gastos fijos pendientes**; **Ingresos por cuenta**.

---

## 9. Ajustes (`/ajustes`)

Pestañas: **Negocio · Moneda · Impuestos · Canales · Ubicaciones · Comportamiento ·
Usuarios y roles · Bitácora**.

### 9.1 Negocio (`/ajustes/negocio`)
- "Identidad del comercio y el comprobante que reciben tus clientes."
- **Identidad**: Nombre del comercio (*), Razón social, RIF.
- **Contacto**: Teléfono, Dirección (se imprime bajo el nombre).
- **Recibo**: Título del recibo (vacío = "Comprobante de venta"), **Formato de impresión**
  (`58 mm` / `80 mm` / `Carta`), **Pie del recibo** (0/300), **Datos que se muestran**
  (Razón social, RIF, Dirección, Teléfono, Cliente, SKU de cada producto,
  Total en bolívares, Tasa de la venta, Notas de la venta), **Vista previa del recibo**.
- Barra de guardado con estado "Sin cambios".

### 9.2 Moneda (`/ajustes/moneda`)
- **Moneda principal**: `Dólares (USD)` o `Bolívares (VES)` (la otra se muestra como
  secundaria; cada usuario puede elegir su moneda de vista en Mi perfil).
- **Tasa de cambio**: muestra la tasa **BCV** vigente (Bs por $1) y **vigente desde**;
  `Definir tasa manual` (Tasa *, Fecha/Hora; sin fecha se aplica ahora).
- **Preferencias de la tasa**: `Usar la tasa del último día hábil`.
- **Historial de tasas**.

### 9.3 Impuestos (`/ajustes/impuestos`)
- "El impuesto predeterminado se aplica a todo producto nuevo."
- Lista de impuestos; `Editar impuesto`: **Nombre** (*), **Tasa** (*, fracción — "ej. 0.16 = 16 %"),
  **Activo**.

### 9.4 Canales (`/ajustes/canales`)
- "Los precios por canal se configuran en Catálogo."
- `Nuevo canal`: **Nombre** (*), **Descripción**, **Activo**. Canal `Principal` marcado como
  **Predeterminado** (no se puede desactivar). El orden define cómo lo ve el equipo al vender.

### 9.5 Ubicaciones (`/ajustes/ubicaciones`)
- "Cada una lleva su propio inventario."
- `Nueva ubicación`: **Nombre** (*), **Tipo** (`Depósito` / `Nevera` / `Tienda`),
  **Predeterminada para ventas**, **Predeterminada para compras**. Filtros de tabla.

### 9.6 Comportamiento (`/ajustes/compartimentos`)
- "Arma tu POS con piezas: pon solo lo que tu negocio necesita."
- **Perfiles** predefinidos: `Restaurante / café` (Salas y mesas, Recetas,
  Lotes y vencimiento, Cierre de caja, Comisiones al equipo), `Marca de ropa`
  (Variantes, Cierre de caja, Ventas a crédito), `Productos listos para la venta`
  (venta directa), `Personalizado`.
- **Piezas** (toggles que se pueden quitar; "quitarla la oculta, pero conserva tus datos"),
  agrupadas en:
  - *Ventas y atención*: **Salas y mesas** (mesas para restaurantes/cafés),
    **Comisiones al equipo**.
  - *Productos*: **Recetas** (productos elaborados que descuentan insumos al producir),
    **Variantes** (talla, color…).
  - *Inventario*: **Varias ubicaciones**, **Lotes y vencimiento**, **Cierre de caja**,
    **Ventas a crédito**.
  - *Kits* y *Piezas*.
- Progreso tipo "4 de 8 piezas".

### 9.7 Usuarios y roles (`/ajustes/usuarios`)
- "Organiza los accesos de tu equipo y sus permisos."
- `Invitar usuario`: **Correo** (*), **Rol** (*), **Ubicaciones permitidas**
  (`Todas` / `Solo algunas`). "El enlace vence en 7 días."
- `Editar usuario`: **Nombre** (la persona lo cambia desde Mi cuenta), **Rol**, **Activo**
  ("Desactivarlo revoca sus sesiones de inmediato"), **Ubicación por defecto**,
  **Ubicaciones permitidas**.

### 9.8 Bitácora (`/ajustes/bitacora`)
- "Quién cambió qué en tu comercio y cuándo. Toca un cambio para ver cómo era antes y cómo
  quedó."
- Filtros: Fecha, Usuario, Sección. Vista de **antes/después**.

---

## 10. Reglas de negocio transversales (confirmadas)

1. **Dual USD/VES**: todo importe se muestra en las dos monedas a la tasa BCV vigente.
2. **IGTF 3 %** al cobrar en dólares.
3. **IVA** por producto (por defecto el del comercio, 16 %).
4. **Ticket promedio** = venta neta / nº de ventas; **excluye cotizaciones y anuladas**.
5. **Venta neta** = base − descuentos (sin IVA ni recargos; menos devoluciones en reportes).
6. **Un descuento por venta** (sobre subtotal antes de IVA); **varios recargos** (% sobre el neto).
7. **Utilidad neta** = Ventas netas − Costo de lo vendido − Gastos − Pérdidas de inventario.
8. **Capital (a hoy)** = En cuentas + Inventario a costo + Por cobrar − Por pagar
   (+ impuestos por pagar mostrados aparte).
9. **Exposición cambiaria** informativa (no realizada; no cambia saldos).
10. **Cotización ≠ venta** (no cuenta en KPIs de ventas).
11. **A crédito** = cuenta por cobrar cuando el cobro no cubre el total.
12. **Inventario FIFO por lotes**; traslados entre ubicaciones; compras entran por proveedor.
13. **Categorías de gasto del sistema** (IVA/IGTF) no desactivables.
14. **Gastos recurrentes** generan gastos pendientes (no mueven dinero).
15. **Roles/ubicaciones** por usuario; desactivar usuario revoca sesiones.
16. **Importación** masiva (productos, contactos, existencias, compras) con previsualización.
