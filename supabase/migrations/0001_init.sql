-- ============================================================
-- BLINK POS · Esquema inicial (Supabase / Postgres)
// ------------------------------------------------------------
-- Cómo usarlo:
--   1. Entra a tu proyecto en https://supabase.com/dashboard
--   2. SQL Editor → New query → pega TODO este archivo → Run
--   3. Revisa que aparezca "Success. No rows returned".
--
-- Seguridad (RLS):
--   Cada comercio pertenece a un usuario (owner_id = auth.uid()).
--   Las políticas garantizan que NADIE puede leer ni escribir
--   filas de otro comercio, ni siquiera con la clave pública.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------
-- Comercios: una fila por usuario.
-- El POS trabaja hoy con un documento JSON (`data`) para no reescribir
-- toda la lógica del cliente. Si más adelante se necesita consultar
-- entidades por separado (ventas, productos…), se normaliza en tablas.
-- ------------------------------------------------------------------
create table if not exists public.businesses (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  name        text not null default '',
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index if not exists businesses_owner_id_key
  on public.businesses (owner_id);

-- ------------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------------
alter table public.businesses enable row level security;
alter table public.businesses force row level security;

drop policy if exists businesses_select_own on public.businesses;
create policy businesses_select_own
  on public.businesses for select
  using (auth.uid() = owner_id);

drop policy if exists businesses_insert_own on public.businesses;
create policy businesses_insert_own
  on public.businesses for insert
  with check (auth.uid() = owner_id);

drop policy if exists businesses_update_own on public.businesses;
create policy businesses_update_own
  on public.businesses for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists businesses_delete_own on public.businesses;
create policy businesses_delete_own
  on public.businesses for delete
  using (auth.uid() = owner_id);

-- ------------------------------------------------------------------
-- updated_at automático
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

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- Caché de esquema para el cliente
-- ------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.businesses to authenticated;
notify pgrst, 'reload schema';
