# 27 · Activación, pagos y conciliación · BLINK POS

**Fecha:** 2026-11-08 · **Versión:** 1.19.0

Blink POS es de pago: **$25 USD cada 30 días por tienda**. El alta crea solo la
cuenta; el comercio (`businesses`) no existe hasta que un administrador
concilia el primer pago. Si no se concilia en **24 horas**, la cuenta y sus
datos se eliminan.

---

## 1. Reglas del cobro

| Concepto | Valor |
|---|---|
| Precio | **$25 USD** cada **30 días** |
| Pago Móvil | Cédula `34201580` · teléfono `0424 6603660` · banco `BNC (0102)` |
| Binance Pay | ID `1130279410` (USDT, USDC, BTC, ETH) |
| Tasa de referencia | Binance P2P, leída de CriptoYa (`USDT/VES`) |
| Administración | `admin@blink.com.ve` |

CriptoYa es **solo un lector de la tasa**: no recibe, intermedia ni retiene
pagos. El dinero llega a Pago Móvil o al Binance Pay indicado.

---

## 2. Ciclo de vida de una cuenta

```
registro ──► pendiente (24 h) ──reporta pago──► en revisión
                  │                               │
                  │ sin pago en 24 h              ├─ aprueba ──► activo (30 días)
                  ▼                               │
             se elimina                    rechazo ──► rechazado (24 h para reintentar)
                                                  │
                                                  └─ sin reintento ──► se elimina
```

- El reloj de 24 h corre desde `auth.users.created_at`, no desde el login.
- Mientras un pago está «en revisión» la cuenta **no** se purga.
- Al aprobar se suman 30 días: `greatest(now(), vigente_hasta) + 30 days`.
- Al rechazar se abre una ventana nueva de 24 h.
- Las cuentas anteriores a la migración `0005` quedan activas **sin vencimiento**
  (abuelos), para no suspender tiendas vivas.

---

## 3. Base de datos (migración `0005_activacion.sql`)

Aplicar en el proyecto **`zspgwnbkcvnhdwsidjnn`** (POS), nunca en el de Pay.
La migración es idempotente.

### 3.1 Tablas

| Tabla | Para qué |
|---|---|
| `admins_plataforma` | Correos con permiso de conciliación (RLS sin políticas de lectura) |
| `activaciones` | Una fila por usuario: estado, importe, vigencia, `purge_en` |
| `pagos_activacion` | Historial de pagos reportados, revisión y motivo |

Estados de `activaciones.estado`: `pendiente`, `en_revision`, `activo`,
`rechazado`. Estados de `pagos_activacion.estado`: `en_revision`, `aprobado`,
`rechazado`.

### 3.2 Funciones `security definer`

| Función | Quién | Qué hace |
|---|---|---|
| `es_admin_plataforma()` | cualquiera | Compara el correo de `auth.users` con `admins_plataforma` |
| `puede_operar()` | autenticado | Hay activación `activo` y sin vencer |
| `reportar_pago(...)` | autenticado | Valida y registra el pago; deja la activación `en_revision` |
| `decidir_pago(pago, aprobar, motivo)` | admin | Aprueba (30 días) o rechaza (24 h de gracia) |
| `purgar_activaciones()` | cron o admin | Borra de `auth.users` las altas vencidas |
| `eliminar_cuenta(user)` | admin | Borrado explícito desde el panel |

### 3.3 RLS

- `activaciones` y `pagos_activacion`: `select` propio o de administrador; sin
  `insert/update/delete` para clientes (todo pasa por RPC).
- `admins_plataforma`: RLS activa, sin políticas de lectura.
- `businesses`: `insert` y `update` exigen
  `auth.uid() = owner_id and public.puede_operar()`. La lectura se mantiene.

### 3.4 Purga automática

`pg_cron` ejecuta `purgar_activaciones()` cada 15 minutos, si la extensión está
disponible. Si no lo está, la migración no falla y queda el botón **Purgar
vencidas** del panel. El `delete` sobre `auth.users` arrastra activación, pagos,
comercio y membresías por `on delete cascade`.

---

## 4. Correo y callback

- `authSignUp` usa `signUp({ email, password, options: { emailRedirectTo } })`.
  La contraseña ya no se descarta.
- Los enlaces de alta, reenvío, equipo y recuperación apuntan a
  `/app/confirmar` y `/app/recuperar`, no a la raíz.
- `/app/confirmar` consume `token_hash` (`verifyOtp`), `code`
  (`exchangeCodeForSession`) o el hash implícito, y luego entra a
  `/app/activacion`.
- `index.html` reescribe a `/app/confirmar` cualquier URL que llegue con tokens,
  aunque el enlace apunte por error a la landing.
- El service worker solo cachea navegaciones `ok` de tipo HTML (la versión de
  caché subió a `blink-pos-v2`), así no envenena el shell con el `404.html` de
  GitHub Pages.

**Configuración manual en Supabase (Authentication → URL Configuration):**

- *Site URL*: `https://pos.blink.com.ve`
- *Redirect URLs*: `https://pos.blink.com.ve/**`,
  `https://pos.blink.com.ve/app/**`, `http://localhost:5173/**`

Sin esas entradas Supabase sustituye el destino por el *Site URL* y el enlace
cae en una página que no procesa los tokens.

---

## 5. Tasa y equivalentes

- Fuente: `https://criptoya.com/api/binancep2p/USDT/VES/1` (`ask`), CORS `*`.
- Caché en `localStorage` durante **5 minutos**; si la red falla se muestra la
  última lectura marcada como «última conocida» y un botón de reintento.
- El monto en bolívares es `25 × tasa`; nunca se inventa una cifra sin tasa.
- Cripto: `api.binance.com/api/v3/ticker/price` para `BTCUSDT`, `ETHUSDT` y
  `USDCUSDT`; USDT se toma como 1 USD.
- Binance spot **no** tiene par USDT/VES (`-1121 Invalid symbol`): por eso la
  tasa en bolívares sale de P2P.

Archivos: `src/lib/tasa.ts` y `src/lib/tasa.test.ts` (caché, fallback, error).

---

## 6. Cliente

| Archivo | Papel |
|---|---|
| `src/lib/activacion.ts` | Tipos, RPC, `estadoReal`, `puedeOperar`, `restante`, `fechaCorta` |
| `src/lib/tasa.ts` | Tasa P2P, cripto, formato y equivalencias |
| `src/lib/store.tsx` | Estado `activacion`/`esAdmin`; sin pago no hidrata ni guarda `businesses` |
| `src/AppInterna.tsx` | Rutas, `Protected`/`OnboardingGate` con pago activo y `AdminGate` |
| `src/pages/Activacion.tsx` | Pantalla de pago y estados |
| `src/pages/AdminConciliacion.tsx` | Panel de conciliación |
| `src/pages/Confirmar.tsx` | Consumo del enlace del correo |
| `src/components/useCopiar.ts` | Copiar con confirmación «Copiado» |
| `src/styles/activacion.css` | Estilos de activación, suscripción y panel |

El modo de demostración/QA (`isBypassActive()`) se considera activo para no
romper capturas ni pruebas.

---

## 7. Operación

1. **Crear el administrador**: registrar `admin@blink.com.ve` como cualquier
   cuenta. El trigger lo deja `activo` y la función `es_admin_plataforma()` le
   abre `/app/admin/conciliacion`.
2. **Conciliar**: abrir cada pago pendiente, comprobar la referencia en el banco
   o en Binance y pulsar **Aprobar**. El comercio puede crear su tienda en ese
   momento.
3. **Rechazar**: escribir el motivo (lo ve el comercio) y confirmar. Se abre una
   ventana nueva de 24 h.
4. **Purgar**: el cron lo hace solo cada 15 min; el botón es el plan B.

---

## 8. Verificación

```bash
cd app
npm run test:migrations   # trigger, RPC, RLS, purga y businesses en Postgres embebido
npm test                  # helpers de activación y tasa
npx tsc --noEmit
npm run build
npm run docs:check
```

Casos cubiertos por `scripts/test-migrations.mjs`: alta pendiente con
`purge_en ≈ +24 h`, administrador activo por correo, backfill sin vencimiento,
reporte propio sí / ajeno no, decisión solo de administrador, aprobación que
extiende 30 días, rechazo que reprograma 24 h, `businesses` bloqueado sin pago y
permitido tras aprobar, y purga que borra solo las vencidas.
