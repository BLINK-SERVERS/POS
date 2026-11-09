-- ============================================================
-- BLINK POS · Activación de pago y conciliación (0005)
-- ------------------------------------------------------------
-- Blink POS cuesta 25 USD cada 30 días. El alta crea la cuenta,
-- pero el comercio (`businesses`) no existe hasta que un pago
-- sea conciliado por un administrador.
--
-- Reglas:
--   · toda cuenta nueva nace `pendiente` con 24 h de margen para
--     pagar; si no se concilia, se borra (cuenta y comercio);
--   · mientras un pago está en revisión, la cuenta NO se purga;
--   · al aprobar, la vigencia se extiende 30 días;
--   · al rechazar, el usuario tiene 24 h nuevas para reintentar;
--   · las cuentas anteriores a esta migración quedan activas y
--     sin vencimiento (abuelos), para no suspender tiendas vivas.
--
-- Cómo aplicarlo:
--   SQL Editor del proyecto de POS (zspgwnbkcvnhdwsidjnn) → Run.
--   Es idempotente: se puede volver a ejecutar sin duplicar nada.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------
-- 1. Administradores de plataforma (por correo verificado)
--    No se leen desde el cliente: solo la función de comprobación.
-- ------------------------------------------------------------------
create table if not exists public.admins_plataforma (
  email     text primary key,
  creado_en timestamptz not null default now(),
  constraint admins_plataforma_email_valido check (position('@' in email) > 1)
);

insert into public.admins_plataforma (email)
values ('admin@blink.com.ve')
on conflict (email) do nothing;

-- ------------------------------------------------------------------
-- 2. Activación de cada cuenta (una por usuario)
-- ------------------------------------------------------------------
create table if not exists public.activaciones (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  email          text not null default '',
  nombre         text not null default '',
  estado         text not null default 'pendiente'
                 check (estado in ('pendiente', 'en_revision', 'activo', 'rechazado')),
  monto_usd      numeric(10, 2) not null default 25 check (monto_usd > 0),
  metodo         text
                 check (metodo in ('pago_movil', 'binance_pay', 'usdt', 'usdc', 'btc', 'eth', 'otro')),
  tasa_ves       numeric(14, 2),
  vigente_desde  timestamptz,
  vigente_hasta  timestamptz,
  purge_en       timestamptz,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists activaciones_purga_idx
  on public.activaciones (purge_en) where purge_en is not null;
create index if not exists activaciones_estado_idx
  on public.activaciones (estado);

-- ------------------------------------------------------------------
-- 3. Pagos reportados por el usuario (historial de conciliación)
-- ------------------------------------------------------------------
create table if not exists public.pagos_activacion (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.activaciones (user_id) on delete cascade,
  email        text not null default '',
  metodo       text not null
               check (metodo in ('pago_movil', 'binance_pay', 'usdt', 'usdc', 'btc', 'eth', 'otro')),
  moneda       text not null default 'VES',
  monto        numeric(16, 2) not null check (monto > 0),
  monto_usd    numeric(10, 2) not null default 25 check (monto_usd > 0),
  tasa_ves     numeric(14, 2),
  referencia   text not null check (length(btrim(referencia)) between 3 and 120),
  nota         text,
  estado       text not null default 'en_revision'
               check (estado in ('en_revision', 'aprobado', 'rechazado')),
  creado_en    timestamptz not null default now(),
  revisado_en  timestamptz,
  revisado_por uuid references auth.users (id) on delete set null,
  motivo       text
);

create index if not exists pagos_activacion_estado_idx
  on public.pagos_activacion (estado, creado_en desc);
create index if not exists pagos_activacion_user_idx
  on public.pagos_activacion (user_id, creado_en desc);

-- ------------------------------------------------------------------
-- 4. Alta automática de la activación
--    · el reloj de 24 h corre desde el registro, no desde el login;
--    · el administrador nace activo;
--    · cualquier error se ignora para no bloquear un alta.
-- ------------------------------------------------------------------
create or replace function public.alta_activacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin  boolean;
  v_nombre text;
begin
  v_admin := exists (
    select 1
      from public.admins_plataforma a
     where lower(a.email) = lower(coalesce(new.email, ''))
  );

  v_nombre := trim(concat_ws(' ',
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  ));

  insert into public.activaciones
    (user_id, email, nombre, estado, vigente_desde, vigente_hasta, purge_en)
  values (
    new.id,
    coalesce(new.email, ''),
    v_nombre,
    case when v_admin then 'activo' else 'pendiente' end,
    case when v_admin then now() else null end,
    null,
    case when v_admin then null else coalesce(new.created_at, now()) + interval '24 hours' end
  )
  on conflict (user_id) do nothing;

  return new;
exception
  when others then
    -- Nunca impedir que Supabase cree la cuenta.
    return new;
end;
$$;

drop trigger if exists on_auth_user_created_activacion on auth.users;
create trigger on_auth_user_created_activacion
  after insert on auth.users
  for each row execute function public.alta_activacion();

-- Cuentas que ya existían: activas y sin vencimiento (abuelos).
insert into public.activaciones
  (user_id, email, nombre, estado, vigente_desde, vigente_hasta, purge_en)
select u.id,
       coalesce(u.email, ''),
       trim(concat_ws(' ',
         u.raw_user_meta_data ->> 'first_name',
         u.raw_user_meta_data ->> 'last_name')),
       'activo',
       now(),
       null,
       null
  from auth.users u
on conflict (user_id) do nothing;

-- ------------------------------------------------------------------
-- 5. Comprobaciones
-- ------------------------------------------------------------------
create or replace function public.es_admin_plataforma()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from auth.users u
      join public.admins_plataforma a
        on lower(a.email) = lower(coalesce(u.email, ''))
     where u.id = auth.uid()
  );
$$;

/** ¿La cuenta puede crear y guardar su comercio? */
create or replace function public.puede_operar()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
      from public.activaciones a
     where a.user_id = auth.uid()
       and (
         a.estado <> 'activo'
         or (a.vigente_hasta is not null and a.vigente_hasta <= now())
       )
  );
$$;

-- ------------------------------------------------------------------
-- 6. Reportar un pago (el usuario)
-- ------------------------------------------------------------------
create or replace function public.reportar_pago(
  p_metodo     text,
  p_moneda     text,
  p_monto      numeric,
  p_tasa       numeric,
  p_referencia text,
  p_nota       text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_act  public.activaciones%rowtype;
  v_pago uuid;
begin
  if v_uid is null then
    raise exception 'Inicia sesión para reportar el pago.' using errcode = '42501';
  end if;
  if p_metodo is null
     or p_metodo not in ('pago_movil', 'binance_pay', 'usdt', 'usdc', 'btc', 'eth', 'otro') then
    raise exception 'Método de pago no válido.' using errcode = '22023';
  end if;
  if p_monto is null or p_monto <= 0 then
    raise exception 'El monto debe ser mayor que cero.' using errcode = '22023';
  end if;
  if p_referencia is null or length(btrim(p_referencia)) < 3 then
    raise exception 'Escribe el número de referencia o de transacción.' using errcode = '22023';
  end if;

  select * into v_act
    from public.activaciones
   where user_id = v_uid
   for update;

  if not found then
    raise exception 'No hay una activación para esta cuenta.' using errcode = 'P0002';
  end if;
  if v_act.estado = 'en_revision'
     or exists (
       select 1
         from public.pagos_activacion
        where user_id = v_uid
          and estado = 'en_revision'
     ) then
    raise exception 'Ya tenemos un pago tuyo en revisión.' using errcode = '22023';
  end if;

  insert into public.pagos_activacion
    (user_id, email, metodo, moneda, monto, monto_usd, tasa_ves, referencia, nota)
  values (
    v_uid,
    v_act.email,
    p_metodo,
    coalesce(nullif(btrim(p_moneda), ''), 'VES'),
    round(p_monto, 2),
    v_act.monto_usd,
    nullif(p_tasa, 0),
    btrim(p_referencia),
    nullif(btrim(coalesce(p_nota, '')), '')
  )
  returning id into v_pago;

  update public.activaciones
     set -- Una renovación anticipada no apaga el POS: la cuenta sigue
         -- activa mientras el pago espera conciliación.
         estado         = case
                            when estado = 'activo'
                             and (vigente_hasta is null or vigente_hasta > now())
                            then 'activo'
                            else 'en_revision'
                          end,
         metodo         = p_metodo,
         tasa_ves       = coalesce(nullif(p_tasa, 0), tasa_ves),
         actualizado_en = now()
   where user_id = v_uid;

  return v_pago;
end;
$$;

-- ------------------------------------------------------------------
-- 7. Conciliar un pago (solo administrador)
-- ------------------------------------------------------------------
create or replace function public.decidir_pago(
  p_pago    uuid,
  p_aprobar boolean,
  p_motivo  text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pago public.pagos_activacion%rowtype;
begin
  if not public.es_admin_plataforma() then
    raise exception 'Solo un administrador puede conciliar pagos.' using errcode = '42501';
  end if;

  select * into v_pago
    from public.pagos_activacion
   where id = p_pago
   for update;

  if not found then
    raise exception 'Ese pago no existe.' using errcode = 'P0002';
  end if;
  if v_pago.estado <> 'en_revision' then
    raise exception 'Ese pago ya fue revisado.' using errcode = '22023';
  end if;

  if p_aprobar then
    update public.pagos_activacion
       set estado       = 'aprobado',
           revisado_en  = now(),
           revisado_por = auth.uid(),
           motivo       = nullif(btrim(coalesce(p_motivo, '')), '')
     where id = p_pago;

    update public.activaciones
       set estado         = 'activo',
           vigente_desde  = now(),
           -- Si aún le quedaban días, se suman; si venció, corre desde hoy.
           vigente_hasta  = greatest(now(), coalesce(vigente_hasta, now())) + interval '30 days',
           purge_en       = null,
           actualizado_en = now()
     where user_id = v_pago.user_id;
  else
    update public.pagos_activacion
       set estado       = 'rechazado',
           revisado_en  = now(),
           revisado_por = auth.uid(),
           motivo       = coalesce(nullif(btrim(coalesce(p_motivo, '')), ''),
                                   'Pago no identificado')
     where id = p_pago;

    update public.activaciones
       set estado = case
                      when vigente_hasta is not null and vigente_hasta > now() then 'activo'
                      else 'rechazado'
                    end,
           -- Ventana nueva de 24 h para reintentar.
           purge_en = case
                        when vigente_hasta is not null and vigente_hasta > now() then null
                        else now() + interval '24 hours'
                      end,
           actualizado_en = now()
     where user_id = v_pago.user_id;
  end if;
end;
$$;

-- ------------------------------------------------------------------
-- 8. Purga de cuentas impagas (24 h) y borrado manual
-- ------------------------------------------------------------------
create or replace function public.purgar_activaciones()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ids   uuid[];
  v_total integer;
begin
  -- El cron corre sin JWT; un usuario solo puede pedir la purga si es admin.
  if auth.uid() is not null and not public.es_admin_plataforma() then
    raise exception 'Solo un administrador puede purgar cuentas.' using errcode = '42501';
  end if;

  select array_agg(user_id) into v_ids
    from public.activaciones
   where purge_en is not null
     and purge_en < now()
     and estado in ('pendiente', 'rechazado');

  v_total := coalesce(array_length(v_ids, 1), 0);
  if v_total = 0 then
    return 0;
  end if;

  -- El cascade borra activaciones, pagos, comercio y membresías.
  delete from auth.users where id = any (v_ids);
  return v_total;
end;
$$;

create or replace function public.eliminar_cuenta(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.es_admin_plataforma() then
    raise exception 'Solo un administrador puede eliminar cuentas.' using errcode = '42501';
  end if;
  if p_user = auth.uid() then
    raise exception 'No puedes eliminar tu propia cuenta.' using errcode = '22023';
  end if;
  if exists (
    select 1
      from auth.users u
      join public.admins_plataforma a
        on lower(a.email) = lower(coalesce(u.email, ''))
     where u.id = p_user
  ) then
    raise exception 'No se puede eliminar a otro administrador.' using errcode = '22023';
  end if;

  delete from auth.users where id = p_user;
end;
$$;

-- ------------------------------------------------------------------
-- 9. Row Level Security
--    Sin FORCE: las funciones definer (arriba) necesitan escribir.
-- ------------------------------------------------------------------
alter table public.admins_plataforma enable row level security;

alter table public.activaciones enable row level security;
alter table public.pagos_activacion enable row level security;

drop policy if exists activaciones_select on public.activaciones;
create policy activaciones_select
  on public.activaciones for select
  to authenticated
  using (user_id = auth.uid() or public.es_admin_plataforma());

drop policy if exists pagos_activacion_select on public.pagos_activacion;
create policy pagos_activacion_select
  on public.pagos_activacion for select
  to authenticated
  using (user_id = auth.uid() or public.es_admin_plataforma());

-- Nadie inserta ni actualiza directamente: solo por las funciones.

grant select on public.activaciones, public.pagos_activacion to authenticated;

revoke all on function public.reportar_pago(text, text, numeric, numeric, text, text) from public;
revoke all on function public.decidir_pago(uuid, boolean, text) from public;
revoke all on function public.eliminar_cuenta(uuid) from public;
revoke all on function public.purgar_activaciones() from public;

grant execute on function public.reportar_pago(text, text, numeric, numeric, text, text) to authenticated;
grant execute on function public.decidir_pago(uuid, boolean, text) to authenticated;
grant execute on function public.eliminar_cuenta(uuid) to authenticated;
grant execute on function public.purgar_activaciones() to authenticated;
grant execute on function public.es_admin_plataforma() to authenticated, anon;
grant execute on function public.puede_operar() to authenticated;

-- ------------------------------------------------------------------
-- 10. Sin pago conciliado no se crea ni se guarda el comercio
-- ------------------------------------------------------------------
drop policy if exists businesses_insert_own on public.businesses;
create policy businesses_insert_own
  on public.businesses for insert
  with check (auth.uid() = owner_id and public.puede_operar());

drop policy if exists businesses_update_own on public.businesses;
create policy businesses_update_own
  on public.businesses for update
  using (auth.uid() = owner_id and public.puede_operar())
  with check (auth.uid() = owner_id and public.puede_operar());

-- ------------------------------------------------------------------
-- 11. Purga programada cada 15 minutos (si pg_cron está disponible)
-- ------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    begin
      create extension if not exists pg_cron;
      perform cron.schedule(
        'blink-pos-purga-activaciones',
        '*/15 * * * *',
        $cron$select public.purgar_activaciones()$cron$
      );
    exception
      when others then
        raise notice 'pg_cron no disponible (%); usa el botón «Purgar vencidos».', sqlerrm;
    end;
  else
    raise notice 'pg_cron no está instalado; usa el botón «Purgar vencidos».';
  end if;
end;
$$;

notify pgrst, 'reload schema';
