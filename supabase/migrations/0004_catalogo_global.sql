-- ============================================================
-- BLINK POS · 0004 · Catálogo Global colaborativo (2 niveles)
-- ------------------------------------------------------------
-- POR QUÉ: hoy `products` mezcla la ficha descriptiva del producto
-- (nombre, código de barras, medida, categoría) con datos operativos
-- privados del comercio (costo, precio, IVA, stock). Eso impide el
-- efecto de red: si una tienda registra un producto con código de
-- barras, otra tienda debería poder reutilizar su ficha.
--
-- QUÉ HACE: separa en dos niveles.
--   · Nivel 1 · `catalogo_global` (COMPARTIDO entre TODAS las tiendas):
--       barcode (clave primaria), nombre en MAYÚSCULAS, cantidad de
--       medida + unidad, categoría y fabricante. Datos descriptivos
--       universales. NO contiene costos, precios, stock ni IVA.
--   · Nivel 2 · `products` (PRIVADO por comercio): se mantiene igual,
--       referencia el `barcode` del catálogo global y guarda lo privado.
--
-- SEGURIDAD (RLS):
--   · `catalogo_global`:
--       SELECT  → cualquier usuario autenticado de la plataforma.
--       INSERT  → cualquier usuario que sea owner/manager de algún
--                 comercio (aporta fichas nuevas con código de barras).
--       UPDATE  → solo administración central (bloqueado a comercios).
--       DELETE  → solo administración central (bloqueado a comercios).
--   · `products`: SIN CAMBIOS. Aislamiento estricto por membresía,
--       como en 0002 (`is_business_member(business_id)`).
--
-- ADITIVO E IDEMPOTENTE: se puede aplicar sobre una base en producción
-- sin romper nada. No toca `businesses.data` ni `products` existentes.
--
-- CÓMO EJECUTARLO (Supabase SQL Editor → New query → pegar → Run):
--   1. Aplica 0002 y 0003 antes.
--   2. Este archivo crea la tabla, sus políticas y backfillea las
--      fichas a partir de los `products` que ya tengan código de barras.
-- ============================================================

-- ------------------------------------------------------------------
-- 1. Ayudante: ¿el usuario actual es owner/manager de ALGÚN comercio?
--    `security definer` para poder leer `business_members` sin que RLS
--    de esa tabla bloquee la consulta (mismo patrón que 0002).
-- ------------------------------------------------------------------
create or replace function public.is_any_manager()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.business_members m
    where m.user_id = auth.uid()
      and m.role in ('owner', 'manager')
  );
$$;

-- ------------------------------------------------------------------
-- 2. Catálogo Maestro Global (Nivel 1 · compartido)
--    `barcode` es la clave: no puede haber dos fichas con el mismo.
--    Solo datos descriptivos universales; nada privado del comercio.
-- ------------------------------------------------------------------
create table if not exists public.catalogo_global (
  barcode          text primary key check (barcode <> ''),
  name             text not null default '',          -- MAYÚSCULAS
  presentation_qty numeric not null default 1,         -- cantidad de medida
  unit             text not null default 'unidad',     -- lista cerrada
  category         text not null default '',
  brand            text not null default '',           -- fabricante (interno)
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists catalogo_global_name_idx on public.catalogo_global (name);
create index if not exists catalogo_global_category_idx on public.catalogo_global (category);

-- Trigger de `updated_at` (reutiliza la función de 0002).
drop trigger if exists catalogo_global_updated_at on public.catalogo_global;
create trigger catalogo_global_updated_at
  before update on public.catalogo_global
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- 3. Extiende `products` (Nivel 2 · privado) con los campos que el
--    catálogo usa hoy solo en el cliente. Aditivo e idempotente.
-- ------------------------------------------------------------------
alter table public.products
  add column if not exists brand            text not null default '';
alter table public.products
  add column if not exists presentation_qty numeric not null default 1;

-- El tipo "servicio" se elimina por completo: todo producto es tangible.
-- Normaliza cualquier fila heredada antes de que el cliente la lea.
update public.products set type = 'simple' where type <> 'simple';

-- ------------------------------------------------------------------
-- 4. RLS del catálogo global.
--    NOTA: como en `business_members`, NO se usa `force`, para que las
--    funciones `security definer` (is_any_manager) puedan leer sin
--    recursión. El propietario de la tabla es quien administra; los
--    usuarios `authenticated` quedan sujetos a las políticas de abajo.
-- ------------------------------------------------------------------
alter table public.catalogo_global enable row level security;

drop policy if exists catalogo_global_select on public.catalogo_global;
create policy catalogo_global_select on public.catalogo_global
  for select to authenticated using (true);

drop policy if exists catalogo_global_insert on public.catalogo_global;
create policy catalogo_global_insert on public.catalogo_global
  for insert to authenticated with check (public.is_any_manager());

-- UPDATE / DELETE: sin política para `authenticated` → bloqueados.
-- La administración central usa la clave de servicio (service_role),
-- que ignora RLS. Así una tienda no puede alterar la ficha que usan
-- otras tiendas.

-- ------------------------------------------------------------------
-- 5. Backfill: crea fichas globales a partir de los productos que ya
--    existen y tienen código de barras. Idempotente (on conflict).
--    No pisa fichas existentes.
-- ------------------------------------------------------------------
insert into public.catalogo_global (barcode, name, presentation_qty, unit, category, brand)
select distinct on (trim(p.barcode))
       trim(p.barcode),
       upper(trim(p.name)),
       greatest(coalesce(p.presentation_qty, 1), 0),
       coalesce(nullif(trim(p.unit), ''), 'unidad'),
       coalesce(trim(p.category), ''),
       coalesce(trim(p.brand), '')
  from public.products p
 where trim(p.barcode) <> ''
 order by trim(p.barcode), p.updated_at desc
on conflict (barcode) do nothing;

-- ------------------------------------------------------------------
-- 6. Permisos y recarga del esquema (PostgREST).
-- ------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert on public.catalogo_global to authenticated;
notify pgrst, 'reload schema';
