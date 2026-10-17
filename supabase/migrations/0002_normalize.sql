-- ============================================================
-- BLINK POS · 0002 · Esquema normalizado (escala)
-- ------------------------------------------------------------
-- POR QUÉ: el modelo anterior guardaba TODO el comercio en un único
-- documento JSONB (`businesses.data`) y lo reescribía entero con cada
-- cambio (tras 250 ms de debounce). Eso no escala:
--   · con ~500–1000 ventas cada guardado mueve ~1 MB,
--   · el localStorage local se llena (~5 MB),
--   · los informes cargaban todas las ventas al navegador.
--
-- QUÉ HACE: reparte los datos en tablas reales. Las transacciones son
-- de SOLO-AGREGAR (dos cajeros que añaden no se pisan, y funciona sin
-- internet); el catálogo es mutable con `version` (para el día que haya
-- varias terminales). Stock y saldo se derivan del libro, no se mutan a
-- mano.
--
-- TIPOS DE ID (decisión clave):
--   · `business_id` es uuid (coincide con `businesses.id`, uuid real).
--   · Los IDs de ENTIDAD (producto, venta, línea…) son `text`: el
--     cliente genera ids tipo `prodx_a1b2c3` (ver `uid()` en store.tsx),
--     no UUIDs. Usar `text` permite migrar los datos existentes SIN
--     reescribir ids ni mapearlos, y sigue aceptando UUIDs futuros.
--   · Las FK estrictas solo existen donde el padre SIEMPRE está presente
--     (línea→venta, línea→compra, abono→pendiente). Referencias "sueltas"
--     como product_id o account_id quedan como `text` sin FK para no
--     romper inserts por referencias heredadas/u offline.
--
-- IMPORTANTE — ADITIVO Y SIN ROMPER:
--   · NO toca `businesses` ni su columna `data`. La app actual sigue
--     funcionando igual mientras se migra la capa de cliente (Fase B).
--   · Aplicar en Supabase: SQL Editor → New query → pegar todo → Run.
--     Es idempotente (create table if not exists / drop policy if exists).
--
-- OFFLINE / MULTI-TERMINAL (preparado, no construido):
--   · `id` y `at` tienen default del servidor, pero el CLIENTE debe
--     enviarlos (id propio + hora local) para que una venta hecha sin
--     internet lleve su identidad y su hora reales al sincronizar.
--   · `version` en las tablas mutables permite rechazar escrituras
--     obsoletas el día que se habilite multi-terminales.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------
-- 1. Membresías: quién puede tocar cada comercio.
--    Hoy solo el propietario; abre la puerta a cajeros/gerentes
--    sin migrar el esquema después (Fase F).
-- ------------------------------------------------------------------
create table if not exists public.business_members (
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null default 'owner' check (role in ('owner', 'manager', 'cashier')),
  created_at  timestamptz not null default now(),
  primary key (business_id, user_id)
);

create index if not exists business_members_user_idx
  on public.business_members (user_id);

-- Ayudantes `security definer`: evitan la recursión de RLS al consultar
-- `business_members` dentro de las políticas de las demás tablas.
create or replace function public.is_business_member(target uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.business_members m
    where m.business_id = target and m.user_id = auth.uid()
  );
$$;

create or replace function public.business_role(target uuid)
returns text
language sql stable security definer set search_path = public
as $$
  select m.role from public.business_members m
  where m.business_id = target and m.user_id = auth.uid();
$$;

-- ------------------------------------------------------------------
-- 2. Catálogo (mutable, poco frecuente). `version` soporta
--    concurrencia futura entre terminales.
-- ------------------------------------------------------------------
create table if not exists public.products (
  id             text primary key,
  business_id    uuid not null references public.businesses (id) on delete cascade,
  name           text not null default '',
  sku            text not null default '',
  barcode        text not null default '',
  unit           text not null default 'und',
  cost           numeric not null default 0,   -- USD (costo promedio)
  price          numeric not null default 0,   -- USD
  channel_prices jsonb not null default '{}'::jsonb,
  category       text not null default '',
  type           text not null default 'simple',
  tax_rate       numeric not null default 0,   -- fracción (0.16 = 16 %)
  active         boolean not null default true,
  archived       boolean not null default false,
  track_stock    boolean not null default true,
  stock          numeric not null default 0,   -- DERIVADO de inventory_moves
  min_stock      numeric not null default 0,
  version        integer not null default 1,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists products_business_idx on public.products (business_id);
create index if not exists products_sku_idx on public.products (business_id, sku);

create table if not exists public.contacts (
  id          text primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  name        text not null default '',
  document    text not null default '',
  doc_type    text not null default '',
  phone       text not null default '',
  email       text not null default '',
  is_client   boolean not null default true,
  is_provider boolean not null default false,
  credit_days integer not null default 0,
  address     text not null default '',
  notes       text not null default '',
  version     integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists contacts_business_idx on public.contacts (business_id);

create table if not exists public.accounts (
  id             text primary key,
  business_id    uuid not null references public.businesses (id) on delete cascade,
  name           text not null default '',
  type           text not null default 'efectivo',
  currency       text not null default 'USD',
  balance        numeric not null default 0,   -- DERIVADO de movements
  commission_in  numeric not null default 0,
  commission_out numeric not null default 0,
  in_cash_close  boolean not null default true,
  active         boolean not null default true,
  version        integer not null default 1,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists accounts_business_idx on public.accounts (business_id);

-- ------------------------------------------------------------------
-- 3. Libro de ventas (SOLO-AGREGAR).
-- ------------------------------------------------------------------
create table if not exists public.sales (
  id             text primary key,
  business_id    uuid not null references public.businesses (id) on delete cascade,
  code           text not null default '',
  at             timestamptz not null default now(),  -- cliente lo envía
  status         text not null default 'cobrada'
                   check (status in ('cobrada', 'credito', 'anulada', 'cotizacion')),
  discount       numeric not null default 0,
  discount_id    text,
  discount_code  text,
  surcharge      numeric not null default 0,
  tax            numeric not null default 0,
  igtf           numeric not null default 0,
  net            numeric not null default 0,
  total          numeric not null default 0,
  notes          text not null default '',
  payment_method text not null default '',
  customer_id    text,
  customer_name  text,
  channel_id     text,
  location_id    text,
  user_id        text not null default '',
  voided_at      timestamptz,
  void_reason    text,
  created_at     timestamptz not null default now()
);

create index if not exists sales_business_at_idx on public.sales (business_id, at desc);
create index if not exists sales_business_status_idx on public.sales (business_id, status);

create table if not exists public.sale_lines (
  id          text primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  sale_id     text not null references public.sales (id) on delete cascade,
  product_id  text not null default '',
  name        text not null default '',
  qty         numeric not null default 0,
  price       numeric not null default 0,
  cost        numeric not null default 0,
  tax_rate    numeric not null default 0,
  note        text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists sale_lines_sale_idx on public.sale_lines (sale_id);
create index if not exists sale_lines_business_idx on public.sale_lines (business_id);

-- ------------------------------------------------------------------
-- 4. Libro de cuentas (movimientos). Saldo = Σ entradas − Σ salidas.
-- ------------------------------------------------------------------
create table if not exists public.movements (
  id           text primary key,
  business_id  uuid not null references public.businesses (id) on delete cascade,
  at           timestamptz not null default now(),
  account_id   text not null default '',
  direction    text not null check (direction in ('entrada', 'salida')),
  amount_usd   numeric not null default 0,
  currency     text,
  amount_input numeric,
  origin       text not null default '',
  note         text not null default '',
  user_id      text not null default '',
  ref_id       text,
  created_at   timestamptz not null default now()
);

create index if not exists movements_business_at_idx on public.movements (business_id, at desc);
create index if not exists movements_account_idx on public.movements (account_id);

-- ------------------------------------------------------------------
-- 5. Libro de inventario. Stock = Σ entradas − Σ salidas por producto.
-- ------------------------------------------------------------------
create table if not exists public.inventory_moves (
  id           text primary key,
  business_id  uuid not null references public.businesses (id) on delete cascade,
  at           timestamptz not null default now(),
  product_id   text not null default '',
  product_name text not null default '',
  kind         text not null check (kind in ('entrada', 'salida')),
  qty          numeric not null default 0,
  cost_unit    numeric not null default 0,
  origin       text not null default '',
  location_id  text not null default '',
  ref          text,
  user_id      text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists inventory_moves_business_at_idx
  on public.inventory_moves (business_id, at desc);
create index if not exists inventory_moves_product_idx
  on public.inventory_moves (product_id);

-- ------------------------------------------------------------------
-- 6. Compras a proveedores (SOLO-AGREGAR).
-- ------------------------------------------------------------------
create table if not exists public.purchases (
  id             text primary key,
  business_id    uuid not null references public.businesses (id) on delete cascade,
  at             timestamptz not null default now(),
  supplier_id    text,
  supplier_name  text not null default '',
  location_id    text not null default '',
  payment_method text not null default 'efectivo'
                   check (payment_method in ('efectivo', 'cuenta', 'credito')),
  account_id     text,
  invoice_no     text not null default '',
  total_usd      numeric not null default 0,
  user_id        text not null default '',
  created_at     timestamptz not null default now()
);

create index if not exists purchases_business_at_idx on public.purchases (business_id, at desc);

create table if not exists public.purchase_lines (
  id          text primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  purchase_id text not null references public.purchases (id) on delete cascade,
  product_id  text not null default '',
  name        text not null default '',
  qty         numeric not null default 0,
  cost_unit   numeric not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists purchase_lines_purchase_idx on public.purchase_lines (purchase_id);

-- ------------------------------------------------------------------
-- 7. Gastos.
-- ------------------------------------------------------------------
create table if not exists public.expenses (
  id          text primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  at          timestamptz not null default now(),
  name        text not null default '',
  category    text not null default '',
  note        text not null default '',
  amount_usd  numeric not null default 0,
  recurring   boolean not null default false,
  paid        boolean not null default false,
  anulado     boolean not null default false,
  account_id  text,
  paid_at     timestamptz,
  user_id     text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists expenses_business_at_idx on public.expenses (business_id, at desc);

-- ------------------------------------------------------------------
-- 8. Cuenta corriente (CxC / CxP) + abonos en solo-agregar.
--    `paid_usd` y `status` son derivados de pending_payments; se guardan
--    denormalizados para leer rápido, pero la fuente de verdad es el libro.
-- ------------------------------------------------------------------
create table if not exists public.pendings (
  id           text primary key,
  business_id  uuid not null references public.businesses (id) on delete cascade,
  at           timestamptz not null default now(),
  direction    text not null check (direction in ('cobrar', 'pagar')),
  contact_id   text,
  contact_name text not null default '',
  subject      text not null default '',
  amount_usd   numeric not null default 0,
  paid_usd     numeric not null default 0,
  due_at       timestamptz,
  note         text not null default '',
  status       text not null default 'abierto'
                 check (status in ('abierto', 'parcial', 'saldado', 'anulado')),
  created_at   timestamptz not null default now()
);

create index if not exists pendings_business_idx on public.pendings (business_id);

create table if not exists public.pending_payments (
  id          text primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  pending_id  text not null references public.pendings (id) on delete cascade,
  at          timestamptz not null default now(),
  amount_usd  numeric not null default 0,
  account_id  text,
  note        text not null default '',
  user_id     text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists pending_payments_pending_idx
  on public.pending_payments (pending_id);

-- ------------------------------------------------------------------
-- 9. Transferencias entre cuentas.
-- ------------------------------------------------------------------
create table if not exists public.transfers (
  id            text primary key,
  business_id   uuid not null references public.businesses (id) on delete cascade,
  at            timestamptz not null default now(),
  from_id       text,
  to_id         text,
  amount_usd    numeric not null default 0,
  commission    numeric not null default 0,
  note          text not null default '',
  user_id       text not null default '',
  correction_of text,
  created_at    timestamptz not null default now()
);

create index if not exists transfers_business_at_idx on public.transfers (business_id, at desc);

-- ------------------------------------------------------------------
-- 10. Caja: sesión abierta (mutable) y cierres (histórico, solo-agregar).
-- ------------------------------------------------------------------
create table if not exists public.cash_sessions (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  opened_at   timestamptz not null default now(),
  opening_usd numeric not null default 0,
  opening_bs  numeric not null default 0,
  user_id     text not null default '',
  location_id text not null default '',
  updated_at  timestamptz not null default now()
);

create table if not exists public.cash_closures (
  id             text primary key,
  business_id    uuid not null references public.businesses (id) on delete cascade,
  opened_at      timestamptz not null default now(),
  closed_at      timestamptz not null default now(),
  user_id        text not null default '',
  location_id    text not null default '',
  opening_usd    numeric not null default 0,
  opening_bs     numeric not null default 0,
  counted_usd    numeric not null default 0,
  counted_bs     numeric not null default 0,
  expected_usd   numeric not null default 0,
  expected_bs    numeric not null default 0,
  difference_usd numeric not null default 0,
  difference_bs  numeric not null default 0,
  note           text not null default '',
  created_at     timestamptz not null default now()
);

create index if not exists cash_closures_business_at_idx
  on public.cash_closures (business_id, closed_at desc);

-- ------------------------------------------------------------------
-- 11. updated_at automático para las tablas mutables.
-- ------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['products', 'contacts', 'accounts', 'cash_sessions'] loop
    execute format('drop trigger if exists %I on public.%I', t || '_set_updated_at', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end $$;

-- Al crear un comercio, su propietario queda registrado como miembro `owner`.
-- Sin esto, RLS bloquearía la lectura de todo lo que acaba de crear.
create or replace function public.handle_new_business_owner()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.business_members (business_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (business_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_business_created on public.businesses;
create trigger on_business_created
  after insert on public.businesses
  for each row execute function public.handle_new_business_owner();

-- ------------------------------------------------------------------
-- 12. Row Level Security.
--     · Cualquier miembro puede LEER y AGREGAR (un cajero debe poder
--       cobrar sin internet y sincronizar luego).
--     · Solo owner/manager pueden MODIFICAR o BORRAR (correcciones).
-- ------------------------------------------------------------------
alter table public.business_members enable row level security;
-- NOTA: en `business_members` NO se usa `force`. Los ayudantes
-- `security definer` (`is_business_member`/`business_role`) corren como el
-- dueño de la tabla y necesitan poder leerla sin que RLS se lo impida
-- (con `force` entrarían en recursión y devolverían siempre false).

drop policy if exists business_members_select on public.business_members;
create policy business_members_select on public.business_members
  for select using (public.is_business_member(business_id));

drop policy if exists business_members_owner on public.business_members;
create policy business_members_owner on public.business_members
  for all using (public.business_role(business_id) = 'owner')
            with check (public.business_role(business_id) = 'owner');

do $$
declare t text;
begin
  foreach t in array array[
    'products', 'contacts', 'accounts',
    'sales', 'sale_lines', 'movements', 'inventory_moves',
    'purchases', 'purchase_lines', 'expenses',
    'pendings', 'pending_payments', 'transfers',
    'cash_sessions', 'cash_closures'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    execute format(
      'create policy %I on public.%I for select using (public.is_business_member(business_id))',
      t || '_select', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format(
      'create policy %I on public.%I for insert with check (public.is_business_member(business_id))',
      t || '_insert', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_update', t);
    execute format(
      'create policy %I on public.%I for update using (public.business_role(business_id) in (''owner'',''manager'')) with check (public.business_role(business_id) in (''owner'',''manager''))',
      t || '_update', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_delete', t);
    execute format(
      'create policy %I on public.%I for delete using (public.business_role(business_id) in (''owner'',''manager''))',
      t || '_delete', t
    );
  end loop;
end $$;

-- ------------------------------------------------------------------
-- 13. Permisos para el cliente (solo la clave pública, RLS manda).
-- ------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
notify pgrst, 'reload schema';
