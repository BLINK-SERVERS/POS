# 21 · Módulo Escáner (USB · cámara · celular remoto)

> Estado: **implementado** en la versión **1.3.0**. Esta fase **no** toca la base
> de datos. El **catálogo global** (diccionario de autocompletado) es la fase
> **2.0.0** y se documenta aparte cuando se implemente.

## Por qué

En una caja real, casi todo se vende pasando un lector por el código de barras.
Wink lo da por hecho; BLINK hasta ahora solo permitía buscar escribiendo. Esta
fase añade las **tres** formas de leer que el comercio puede tener a mano, con
una sola lógica de resolución para no duplicar reglas por página:

1. **Lector USB/Bluetooth (HID)** — el más común y el más barato. Se conecta como
   un teclado y "teclea" el código; no requiere drivers ni permisos.
2. **Cámara del equipo** — útil en un teléfono o una tablet sin lector.
3. **Celular como escáner remoto** — el mostrador no tiene lector y hay un
   celular: se vincula una vez y queda como lector inalámbrico.

## Cómo funciona (visión general)

```
                 ┌─────────────── ScannerProvider (dentro de <Shell>) ──────────────┐
  lector USB ──► │  hid.ts: detecta el código y lo entrega a `dispatch`             │
  cámara     ──► │  CameraScanner: decodifica y llama a `dispatch`                   │
  celular    ──► │  Realtime: recibe `barcode` y, si el secreto coincide, `dispatch` │
                 └───────────────────────────────┬──────────────────────────────────┘
                                                 ▼
                       useScanHandler (registra la vista activa)
                                                 ▼
                       Vender / Catálogo / Inventario resuelven el código
```

La página activa registra su manejador con `useScanHandler`. Cuando hay varios
(p. ej. un modal sobre la página), **gana el último registrado**.

## Archivos

| Archivo | Rol |
| --- | --- |
| `app/src/lib/scanner/hid.ts` | Lógica **pura** de detección del lector físico (probada). |
| `app/src/lib/scanner/ScannerProvider.tsx` | Contexto: HID, canal de la caja, heartbeat. |
| `app/src/lib/scanner/CameraScanner.tsx` | Lector por cámara (`BarcodeDetector`). |
| `app/src/lib/scanner/pairing.ts` | Emparejamiento (id + secreto) y persistencia. |
| `app/src/lib/scanner/barcode-detector.d.ts` | Tipos de la API `BarcodeDetector`. |
| `app/src/components/QrCode.tsx` | Render del QR como SVG (librería `qrcode`). |
| `app/src/components/ScannerModals.tsx` | Modales "Celular como escáner" y "Escanear con cámara". |
| `app/src/pages/Escaner.tsx` | Página `/escaner` (la abre el celular). |

## 1. Lector físico (USB / Bluetooth HID)

Un lector se comporta como un teclado: escribe el código **muy rápido** y
termina con **Enter** (algunos con **Tab**). `hid.ts` decide si lo tecleado es un
lector o una persona:

- se guarda un **búfer** de teclas;
- si el hueco entre dos teclas supera **70 ms**, se reinicia (era una persona);
- al pulsar Enter/Tab, si el búfer tiene **≥ 5** caracteres, es un **código**.

`ScannerProvider` escucha `keydown` en **fase de captura** y, cuando hay código,
hace `preventDefault()` para que el Enter del lector **no** envíe formularios ni
abra diálogos. La lógica vive separada de React para poder probarla
(`src/lib/__tests__/scanner.test.ts`).

> No hay nada que configurar: el lector se conecta por USB o Bluetooth y el
> sistema operativo lo trata como teclado. Funciona en todos los navegadores.

## 2. Cámara del equipo

`CameraScanner` abre la cámara con `getUserMedia` (prefiriendo la trasera en el
celular) y decodifica con la API nativa **`BarcodeDetector`** (Shape Detection),
disponible en **Chrome/Edge** (escritorio y Android) y **Safari 17+**.

- Si el navegador **no** puede decodificar, se muestra el video y se avisa: hay
  que usar el lector USB o el celular remoto. **No se añade ninguna librería de
  decodificación** en esta fase.
- Los códigos repetidos se ignoran durante **1,5 s** para no duplicar lecturas.

## 2. Celular como escáner remoto

Es un **token de capacidad**: no hay cuenta en el teléfono y la **caja es la
autoridad**.

1. La caja crea un emparejamiento: un **id público** (`p_…`) y un **secreto**
   (`token`, 128 bits). Muestra un **QR** con la dirección
   `…/escaner?p=…&t=…`.
2. El celular abre esa dirección, **guarda** el emparejamiento y conecta.
3. Cada código escaneado viaja por un canal de **Supabase Realtime**
   (`scanner:<id>`) junto con el secreto.
4. La caja **comprueba el secreto**: si coincide, acepta el código; si no, lo
   ignora. La caja es la única que decide.

Detalles pensados para el día a día:

- **Persistencia**: el teléfono recuerda el emparejamiento. Al volver a la
  dirección no hay que escanear el QR otra vez. La caja lo guarda **30 días**
  (luego pide regenerar).
- **Heartbeat**: el teléfono saluda cada 8 s; la caja lo marca **"activo"** y,
  si deja de recibir señales, **"inactivo"** (20 s). El indicador del topbar y
  `Ajustes › Dispositivos` reflejan ese estado.
- **Reconexión**: al desbloquear el teléfono o volver a la pestaña
  (`visibilitychange`) se saluda de nuevo y, si el canal se cayó, se reconecta.
- **Microcortes**: si un código se escanea justo cuando el canal no está listo,
  se **encola** y se envía al recuperar la conexión (se muestra "+N en cola").
- **Revocación**: "Desvincular teléfonos" genera un **secreto nuevo**; los
  teléfonos anteriores dejan de ser aceptados. Está en `Ajustes › Dispositivos`.

> El emparejamiento es **local** (por equipo) y no se guarda en la base de datos.
> Como el teléfono no tiene cuenta, **la caja es la autoridad** y basta con que
> ella verifique el secreto; así no se expone el negocio en la nube. Si más
> adelante se quiere revocar desde *otro* equipo, se añadirá una tabla
> `scanner_pairings` (ver el plan 2.0.0).

### Seguridad

- El secreto va solo en la URL del QR y en el emparejamiento local del teléfono.
- El canal es **público** (broadcast con la clave pública); quien conozca el `id`
  y el `token` podría inyectar códigos. Por eso el QR se muestra en la caja y el
  secreto se **regenera** cuando se desea cerrar el acceso.
- El código escaneado **no** es un secreto (es el de barras del producto).

## Resolución del código (cascade)

La misma para los tres métodos, en cada página:

| Página | Qué hace al leer un código |
| --- | --- |
| **Vender** | Busca en el catálogo por código de barras/SKU/nombre exacto y **agrega a la cuenta**. Si no está, ofrece **registrarlo**. |
| **Catálogo** | Si existe, **abre** ese producto; si no, abre el alta con el código **precargado**. |
| **Inventario** | Abre el **ajuste de existencias** del producto. |

En Catálogo, el alta de producto incorpora un botón de **cámara** y otro para
**generar un código interno** (`INT-…`) cuando el producto no trae código de
barras.

## Campo `brand` (marca)

- Se añade `brand` (opcional) al producto: identifica al **fabricante**.
- Es **interno**: **nunca** aparece en el recibo ni en el ticket.
- Los datos viejos se normalizan (`brand: p.brand ?? ""`), así que no hay que
  migrar nada: al guardarse en la nube queda el campo en el JSONB del negocio.

## Pruebas manuales sugeridas

1. **USB**: con un lector (o simulando teclas rápidas), escanear en Vender y ver
   que suma 1 al producto y **no** escribe en el buscador.
2. **Cámara**: en Vender, "escanear" con la cámara de un portátil/celular.
3. **Remoto**: `Ajustes › Dispositivos › Vincular celular`; abrir el QR desde el
   celular; ver "Escáner móvil activo"; escanear y comprobar que la caja recibe.
3b. **Persistencia**: recargar la página del celular (sin volver a escanear el
   QR) y comprobar que sigue enviando.
3c. **Revocación**: "Desvincular teléfonos" y verificar que el teléfono ya no
   envía (queda "esperando").
4. **Alta**: código que no existe → Vender ofrece "Crear producto" → Catálogo
   abre con el código precargado y enfoca el precio.
3. **Código interno**: en el alta, "generar código interno" y comprobar que
   empieza por `INT-`.
