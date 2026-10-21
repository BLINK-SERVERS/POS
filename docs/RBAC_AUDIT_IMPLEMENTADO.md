# RBAC y auditoría · BLINK POS

**Fecha:** 2026-10-21 · **Versión:** 1.8.3

Estado real de los roles, los permisos y la auditoría en BLINK POS: qué está
implementado, dónde, y qué falta para que sea un sistema de acceso real.

> Este documento **no** describe lo que debería ser: describe lo que el código
> hace hoy. Los huecos están marcados como tales.

---

## 1. Resumen

| Capa | Estado | Dónde |
|---|---|---|
| Tabla de membresías en Supabase | ✅ Implementado | `supabase/migrations/0002_normalize.sql` |
| Funciones de ayuda `is_business_member` / `business_role` | ✅ Implementado | `supabase/migrations/0002_normalize.sql` |
| RLS por comercio en todas las tablas | ✅ Implementado | `supabase/migrations/0002_normalize.sql` |
| Tipos de rol en el cliente | ⚠️ Definidos, sin conectar | `app/src/lib/types.ts` |
| Helpers de permisos en el cliente | ⚠️ Definidos, sin uso | `app/src/lib/permissions.ts` |
| Aplicar permisos en la UI | ❌ Pendiente | — |
| Bitácora de auditoría | ⚠️ Solo en localStorage | `app/src/lib/audit.ts` |
| Tabla de auditoría en Supabase | ❌ No existe | — |
| Lectura del rol desde Supabase | ❌ Pendiente | — |

**Resumen en una frase:** el backend ya aísla los datos por comercio y por rol;
el frontend todavía no usa esa información para ocultar ni bloquear nada.

---

## 2. Modelo de roles

### 2.1 En la base de datos (canónico)

Los roles viven en `public.business_members.role`:

```sql
create table if not exists public.business_members (
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null default 'owner' check (role in ('owner', 'manager', 'cashier')),
  created_at  timestamptz not null default now(),
  primary key (business_id, user_id)
);
```

| Rol en SQL | Significado | Puede |
|---|---|---|
| `owner` | Propietario del comercio | Todo, incluidos ajustes, miembros y anulaciones |
| `manager` | Administrador | Operar el negocio; no gestionar miembros ni ajustes del comercio |
| `cashier` | Cajero | Cobrar y consultar; sin costos, márgenes ni informes financieros |

### 2.2 En el cliente (aún desconectado)

`app/src/lib/types.ts` declara el rol en español:

```ts
export type UserRole = "dueño" | "administrador" | "cajero";
```

> ⚠️ **Desajuste de nomenclatura.** Los nombres del cliente (`dueño`,
> `administrador`, `cajero`) **no coinciden** con los de la base de datos
> (`owner`, `manager`, `cashier`). El cliente nunca consulta
> `business_members`, así que hoy no se produce el conflicto; pero en cuanto se
> conecte hay que fijar el mapeo. La opción recomendada es **unificar en el
> identificador de rol en inglés** (`owner` / `manager` / `cashier`) y mostrar la
> etiqueta en español solo en la interfaz, para no duplicar vocabulario.

### 2.3 Funciones SQL de ayuda

```sql
create or replace function public.is_business_member(target uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.business_members m
    where m.business_id = target and m.user_id = auth.uid()); $$;

create or replace function public.business_role(target uuid)
returns text language sql stable security definer set search_path = public
as $$ select m.role from public.business_members m
    where m.business_id = target and m.user_id = auth.uid(); $$;
```

Son `security definer` para **evitar la recursión de RLS**: sin ellas, una
política de `products` que consultara `business_members` dispararía a su vez la
política de `business_members`, y Supabase lo rechaza.

---

## 3. Permisos

### 3.1 Declarados en el cliente

`app/src/lib/permissions.ts`:

```ts
const ROLE_ORDER: Record<UserRole, number> = { cajero: 1, administrador: 2, dueño: 3 };

export function hasPermission(role, required) { ... }   // jerárquico
export function canAccess(role, allowed) { ... }        // lista explícita

export const PERMISSIONS = {
  VIEW_COSTS:        ["administrador", "dueño"],
  MANAGE_PRODUCTS:   ["administrador", "dueño"],
  MANAGE_USERS:      ["dueño"],
  VOID_SALE:         ["administrador", "dueño"],
  CLOSE_CASH:        ["administrador", "dueño"],
  VIEW_REPORTS:      ["administrador", "dueño"],
  MANAGE_SETTINGS:   ["dueño"],
};
```

Dos modelos conviven:

- **Jerárquico** (`hasPermission`): el rol del usuario debe ser igual o superior
  al requerido según `ROLE_ORDER`.
- **Por lista** (`canAccess`): el rol debe estar explícitamente en la lista.
  Es el que usa `PERMISSIONS`.

### 3.2 Aplicación real en la UI

**Ninguna.** Una búsqueda en todo `app/src` devuelve:

- `permissions.ts` → solo la definición.
- `types.ts` → la declaración de `UserRole` y el campo `currentUserRole?`.
- `currentUserRole` → **nunca se escribe ni se lee** en ninguna parte.

Consecuencia práctica: **hoy un cajero ve exactamente lo mismo que el dueño**,
incluidos costos, márgenes, informes y el cierre de caja. El aislamiento real
lo garantiza el backend (RLS), pero la interfaz no lo refleja.

### 3.3 Qué hay que hacer

1. Leer el rol al iniciar sesión:
   `select role from business_members where business_id = <id> and user_id = auth.uid()`.
2. Guardarlo en el store (`state.currentUserRole`, ya tipado) y exponerlo con un
   hook, p. ej. `usePermission("VIEW_COSTS")`.
3. Aplicarlo en la UI: ocultar columnas de costo y margen en Inventario y
   Catálogo, el botón de anulación en Ventas, el de cierre de caja en Finanzas,
   y las pestañas Informes y Ajustes.
4. Respetar el mismo orden de los SQL: `owner` > `manager` > `cashier`.

---

## 4. Auditoría

### 4.1 Lo que hay

`app/src/lib/audit.ts` — bitácora **exclusivamente local**:

```ts
const AUDIT_KEY = "blink-audit-logs-v1";

export function getAuditLogs(): AuditLogEntry[] { ... }
export function addAuditLog(entry: Omit<AuditLogEntry, "id" | "at">): void { ... }
```

- Clave: `blink-audit-logs-v1` en `localStorage`.
- Máximo **500 entradas** (las más recientes primero).
- Entrada: `{ id, businessId, userId, action, details?, at }`.
- `id` generado con `log_<timestamp>_<aleatorio>`; `at` en ISO 8601.
- Todos los errores se silencian (`try/catch`): la auditoría nunca rompe la app.

### 4.2 Lo que falta

| Punto | Estado |
|---|---|
| `addAuditLog` llamado desde acciones críticas | ❌ Sin llamadas en todo `app/src` |
| Tabla `audit_logs` en Supabase | ❌ No existe en ninguna migración |
| Sincronización de la bitácora local con el servidor | ❌ No existe |
| Pantalla para consultar la bitácora | ❌ No existe |
| Respaldo ante borrado de datos del navegador | ❌ No hay (`clearAll` no la toca) |

> La bitácora en `localStorage` es **por dispositivo**. Si el mismo comercio
> opera en tres terminales, cada uno tiene su propio historial, y un borrado de
> datos del navegador lo elimina. Para una auditoría real hay que moverla a
> `public.audit_logs` con RLS por comercio (misma política que el resto de las
> tablas) y escribir con `addAuditLog` → insert.

### 4.3 Acciones que deberían registrarse

| Acción | Dónde | Permiso exigido |
|---|---|---|
| Anular una venta | `Vender` | `VOID_SALE` |
| Cerrar caja | `Finanzas` | `CLOSE_CASH` |
| Crear / editar / eliminar producto | `Inventario`, `Catálogo` | `MANAGE_PRODUCTS` |
| Ajustar existencias o stock | `Inventario` | `MANAGE_PRODUCTS` |
| Registrar gasto o traspaso | `Finanzas` | — |
| Cambiar la tasa BCV | `Ajustes` | `MANAGE_SETTINGS` |
| Exportar datos | `Ajustes › Exportar` | `MANAGE_SETTINGS` |
| Borrar todos los datos | `Ajustes › Cuenta` | `MANAGE_SETTINGS` |
| Invitar / quitar un miembro | Ajustes (pendiente) | `MANAGE_USERS` |
| Iniciar y cerrar sesión | `Shell` | — |

---

## 5. Pruebas

`app/scripts/test-migrations.mjs` (`npm run test:migrations`) levanta un
PostgreSQL embebido, crea un esquema `auth` mínimo que imita a Supabase,
ejecuta las migraciones reales y verifica, entre otras cosas:

- backfill de membresías y su trigger;
- desempaquetado de JSONB a tablas;
- idempotencia de las migraciones;
- aislamiento por RLS entre comercios.

Las políticas de rol (`owner`/`manager` vs `cashier`) **no** tienen cobertura
de pruebas propia todavía.

---

## 6. Plan de cierre

| # | Tarea | Tamaño |
|---|---|---|
| 1 | Migración `0005_audit_logs.sql` (tabla + RLS + índices) | S |
| 2 | Unificar el vocabulario de roles entre cliente y SQL | S |
| 3 | Leer el rol en el login y exponer `usePermission()` | M |
| 4 | Aplicar permisos en Inventario, Catálogo, Ventas, Finanzas y Ajustes | M |
| 5 | Enganchar `addAuditLog` (local) + insert remoto en las acciones de la tabla 4.3 | M |
| 6 | Pantalla de bitácora en Ajustes › Cuenta | M |
| 7 | Pruebas de RLS por rol en `test-migrations.mjs` | M |

---

## 7. Referencias

- Esquema y RLS: [`20-supabase-auth-y-datos.md`](./20-supabase-auth-y-datos.md)
- Endpoints observados en WINK: [`wink/10-api-endpoints.md`](./wink/10-api-endpoints.md)
- Modelo de datos: [`11-modelo-datos-negocio.md`](./11-modelo-datos-negocio.md)
- Auditoría de código: [`18-auditoria-codigo.md`](./18-auditoria-codigo.md)
- Plan de especificaciones: [`23-plan-nuevas-especificaciones.md`](./23-plan-nuevas-especificaciones.md)
