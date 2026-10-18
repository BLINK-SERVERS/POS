# 20 · Cuentas reales y datos en la nube (Supabase)

Este documento explica cómo está construida la **Fase 3** (autenticación real, verificación por
correo con código de 6 dígitos, alta guiada y almacenamiento del comercio en Supabase) y qué
**debes configurar** en el panel de Supabase para que funcione con usuarios reales.

> **Regla de seguridad (no negociable):** en el navegador **solo** va la clave pública
> (`VITE_SUPABASE_PUBLISHABLE_KEY`, del tipo `sb_publishable_…` o `anon`). La **secret key** y el
> `service_role` **jamás** se escriben en un archivo del proyecto ni en `VITE_*`: dan acceso total
> y saltan el RLS.

---

## 1. Qué hace BLINK hoy (flujo real)

```
/entrar        Login con correo + contraseña (Supabase Auth).
/registro      1) Datos personales: nombre, apellido, teléfono, correo, contraseña.
               2) Código de 6 dígitos enviado al correo  →  verifyOtp.
/onboarding    Asistente paso a paso (solo con sesión y sin alta completada):
                 · Datos del comercio (nombre, giro, RIF, teléfono, dirección, moneda).
                 · Recorrido: módulos que BLINK habilita (inventario, proveedores,
                   crédito, gastos, informes).
                 · Cuenta para recibir pagos (nombre, tipo, divisa USD/VES y si
                   participa del cierre de caja).
                 · Categorías, productos y proveedores (datos reales del usuario).
               Al terminar, se marca `onboarding.completed` y se entra a /inicio.
```

- **Sin datos ficticios.** El estado inicial está vacío; todo lo carga el usuario.
- **Gate de navegación.** `App.tsx` bloquea las rutas internas sin sesión (→ `/entrar`) y sin alta
  completada (→ `/onboarding`). Mientras se resuelve la sesión se muestra «Cargando…».
- **Persistencia.** Cada cambio se guarda con *debounce* (250 ms) en la caché local y en Supabase.
  Al iniciar sesión se carga el comercio remoto; si no existe, se crea al primer guardado.
- **Entre pestañas** del mismo navegador el estado se sincroniza por el evento `storage`.
- **Giro → módulos.** El giro elegido propone qué módulos activar (editable en el paso
  «Recorrido» y en Ajustes). El `Shell` oculta del menú lo que esté desactivado; los demás datos
  siguen guardándose. Más adelante BLINK podrá **quitar/agregar funciones** según esta
  configuración.
- **Cierre de caja.** Cada cuenta tiene «participa en el cierre de caja». El arqueo
  (`expectedCash`) solo suma las cuentas de efectivo con esa marca activa.

---

## 2. Configuración en Supabase (una sola vez)

### 2.1 Crear el esquema (SQL)

1. Entra a <https://supabase.com/dashboard> → tu proyecto.
2. **SQL Editor → New query**.
3. Ejecuta **en orden** los archivos de `supabase/migrations/`, uno por uno (pulsa **Run** y
   debe responder «Success. No rows returned»):
   1. `0001_init.sql` — tabla `businesses` (una fila por usuario), sus **políticas RLS**
      (cada quien solo ve lo suyo) y el `updated_at` automático.
   2. `0002_normalize.sql` — **esquema normalizado**: catálogo (`products`, `contacts`,
      `accounts`) y libros de solo-agregar (`sales`+`sale_lines`, `movements`,
      `inventory_moves`, `purchases`+`purchase_lines`, `expenses`, `pendings`+
      `pending_payments`, `transfers`, `cash_closures`, `cash_sessions`), más
      `business_members` (membresías) con RLS por membresía/rol. **Aditivo**: no toca
      `businesses.data`, así que la app sigue funcionando mientras se migra el cliente.
   3. `0003_unpack.sql` — funciones `unpack_business(id)` / `unpack_all_businesses()` que
      vuelcan el JSONB existente hacia las tablas (repitibles, sin borrar el original).

> **Estado en producción (2026-10-18):** los tres archivos **ya están aplicados** en el
> proyecto Supabase de producción (`zspgwnbkcvnhdwsidjnn`) vía Management API: 17 tablas
> públicas, 66 políticas RLS (activo en todas), 6 funciones. La app **cliente** sigue
> leyendo/escribiendo el JSONB de `businesses.data` hasta la **Fase B** (capa de datos sobre
> las tablas normalizadas). Ver `18` y el arnés `npm run test:migrations`.

### 2.2 Correo con SMTP propio (obligatorio para usuarios reales)

El correo por defecto de Supabase **solo entrega al dueño del proyecto** y está limitado. Para
enviar los códigos a cualquier persona:

1. **Project Settings → Auth → SMTP Settings** → activa **Enable Custom SMTP** y completa
   *host*, *port*, *user*, *password* y *sender* de tu proveedor (Resend, SendGrid, Brevo, Gmail
   SMTP…).
2. Recomendado: **Auth → Rate Limits** → ajusta a tu volumen.

### 2.3 Plantilla del correo con el código de 6 dígitos

El cliente no puede cambiar la plantilla: hay que editar el **Confirm signup** para incluir el
token.

1. **Authentication → Email Templates → Confirm signup**.
2. Asegúrate de que el cuerpo incluye `{{ .Token }}` (el código de 6 dígitos). Ejemplo mínimo:

   ```html
   <h2>Tu código para BLINK POS</h2>
   <p>Escribe este código para verificar tu correo:</p>
   <p style="font-size:28px;font-weight:700;letter-spacing:4px">{{ .Token }}</p>
   <p>Si no creaste una cuenta, ignora este mensaje.</p>
   ```

3. Guarda. **No** hace falta `{{ .ConfirmationURL }}`; BLINK usa el código, no el enlace.

### 2.4 Otros ajustes

- **Authentication → Providers → Email**: activado; «Confirm email» **activado** (así el código
  es obligatorio).
- **Providers → Google / Phone**: **desactivados** (BLINK no usa Google).
- **URL Configuration**: agrega `https://blink-servers.github.io/POS/` como *Site URL* /
  *Redirect URLs* (por si más adelante se usa recuperación de contraseña por enlace).

### 2.5 Variables de entorno del cliente

En `app/.env.local` (no se versiona):

```bash
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

Estas dos se incluyen en el bundle (son públicas). **Nunca** pongas la secret key aquí.

---

## 3. Cómo funciona por dentro

### 3.1 Autenticación (`src/lib/cloud.ts`)

| Función | Supabase |
|---|---|
| `authSignUp` | `signUp({ email, password, options.data: { first_name, last_name, phone } })` |
| `authVerifyCode` | `verifyOtp({ email, token, type: "signup" })` |
| `authResendCode` | `resend({ type: "signup", email })` |
| `authSignIn` | `signInWithPassword({ email, password })` |
| `authSignOut` | `signOut()` |
| `authUpdateProfile` | `updateUser({ data })` |

Los errores se traducen al español (`authError`).

### 3.2 Datos (`businesses`)

```sql
businesses(
  id uuid pk default gen_random_uuid(),
  owner_id uuid unique not null → auth.users(id) on delete cascade,
  name text,
  data jsonb,            -- documento completo del POS
  created_at timestamptz,
  updated_at timestamptz
)
```

- `cloudLoadBusiness()` → `select name,data where owner_id = auth.uid()`.
- `cloudSaveBusiness()` → `upsert(..., onConflict: "owner_id")`.

**¿Por qué un documento JSON y no tablas por entidad?** El POS es hoy un sistema **local-first**
con ~23 colecciones sincronizadas y lógica pura síncrona. Guardar el documento completo en una
fila dio **persistencia real, RLS y multi-dispositivo** sin reescribir la lógica. **Ya existe el
esquema normalizado** (migración `0002`, aplicado en producción: 17 tablas, ver §2.1), pero
**la capa cliente todavía escribe el JSONB** hasta la **Fase B**: repositorios que lean/escriban
las tablas manteniendo intacta la API del store (`useStoreActions()`), sin cambiar la interfaz.

### 3.3 RLS (seguridad)

```sql
using (auth.uid() = owner_id)   -- select / update / delete
with check (auth.uid() = owner_id)
```

Nadie —ni con la clave pública— puede leer ni escribir filas de otro comercio.

---

## 4. Verificación end-to-end

1. `npm run typecheck` y `npm run build` en verde.
2. `npm run dev` (o `npx vite --host` para el teléfono).
3. **Registro**: completa los datos, recibe el código, verifícalo.
4. **Onboarding**: recorre los 6 pasos con datos reales y termina.
5. Recarga la página: debe entrar directo a `/inicio` con tus datos (sin ficticios).
6. Abre en otro navegador/dispositivo e inicia sesión: verás el **mismo** comercio.
7. Ajustes → Cuenta → **Borrar todos los datos** → vuelve al alta y el borrado se sincroniza.

---

## 5. Pendientes / decisiones de esta fase

- ~~Normalizar entidades en tablas~~ **[Hecho (Fase A): migración `0002` aplicada en
  producción.]** Queda la **Fase B**: capa de datos cliente sobre esas tablas
  (repositorios) manteniendo la API del store intacta.
- Recuperar contraseña (por enlace, requiere *Redirect URL* configurada).
- Invitaciones/roles de equipo (hoy: un usuario = un comercio; `business_members` ya preparado).
- Resolución de conflictos multi-dispositivo (hoy gana la última escritura con *debounce*).
