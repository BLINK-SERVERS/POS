-- ============================================================
-- BLINK POS · 0003 · Desempaquetado de datos (JSONB → tablas)
-- ------------------------------------------------------------
-- OBJETIVO: mover los datos que ya existen en `businesses.data`
-- (documento JSONB) hacia las tablas normalizadas creadas en 0002.
-- La app NO se rompe: `businesses.data` NO se borra. Este proceso es
-- de SOLO-LECTURA sobre `data`; esquema nuevo se llena a partir de él.
--
-- CÓMO EJECUTARLO (en Supabase SQL Editor, con permisos de servicio):
--   1. Aplica 0002_normalize.sql antes que este.
--   2. En SQL Editor → New query → pega TODO este archivo → Run.
--   3. Desempaqueta UN comercio:
--        select public.unpack_business('ID-DEL-COMERCIO');
--      O desempaqueta TODOS:
--        select public.unpack_all_businesses();
--   4. Es REPETIBLE: borra y vuelve a insertar las filas de ese comercio
--      a partir de `data`. Si `data` cambia, vuelves a correr y listo.
--
-- NOTAS:
--   · `data` guarda el AppState en camelCase (claves = interfaces TS).
--   · Las líneas de venta/compra NO traen id en el JSON; se genera uno
--     con el id del documento + su posición.
--   · Los timestamps ISO se castean a timestamptz; si faltan, caen a now().
--   · `sale_payments` no se modela aparte: el resumen vive en
--     `sales.payment_method` y el impacto real por cuenta ya está en
--     `movements`. (Simplificación consciente.)
-- ============================================================

create or replace function public.unpack_business(target uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  doc jsonb;
begin
  select data into doc from public.businesses where id = target;
  if doc is null or doc = '{}'::jsonb then
    raise notice 'unpack_business: no hay data para el comercio %', target;
    return;
  end if;

  -- Idempotente: limpia lo que ya existía de este comercio.
  delete from public.sale_lines         where business_id = target;
  delete from public.sales              where business_id = target;
  delete from public.purchase_lines     where business_id = target;
  delete from public.purchases          where business_id = target;
  delete from public.inventory_moves    where business_id = target;
  delete from public.movements          where business_id = target;
  delete from public.expenses           where business_id = target;
  delete from public.pending_payments   where business_id = target;
  delete from public.pendings           where business_id = target;
  delete from public.transfers          where business_id = target;
  delete from public.products           where business_id = target;
  delete from public.contacts           where business_id = target;
  delete from public.accounts           where business_id = target;
  delete from public.cash_closures      where business_id = target;
  delete from public.cash_sessions      where business_id = target;

  -- Catálogo: productos -------------------------------------------
  insert into public.products (
    id, business_id, name, sku, barcode, unit, cost, price, channel_prices,
    category, type, tax_rate, active, archived, track_stock, stock, min_stock
  )
  select
    x->>'id', target,
    coalesce(x->>'name',''), coalesce(x->>'sku',''), coalesce(x->>'barcode',''),
    coalesce(x->>'unit','und'),
    coalesce((x->>'cost')::numeric,0), coalesce((x->>'price')::numeric,0),
    coalesce(x->'channelPrices','{}'::jsonb),
    coalesce(x->>'category',''), coalesce(x->>'type','simple'),
    coalesce((x->>'taxRate')::numeric,0),
    coalesce((x->>'active')::boolean,true),
    coalesce((x->>'archived')::boolean,false),
    coalesce((x->>'trackStock')::boolean,true),
    coalesce((x->>'stock')::numeric,0), coalesce((x->>'minStock')::numeric,0)
  from jsonb_array_elements(coalesce(doc->'products','[]'::jsonb)) x
  where x->>'id' is not null;

  -- Contactos ----------------------------------------------------
  insert into public.contacts (
    id, business_id, name, document, doc_type, phone, email,
    is_client, is_provider, credit_days, address, notes
  )
  select
    x->>'id', target,
    coalesce(x->>'name',''), coalesce(x->>'document',''), coalesce(x->>'docType',''),
    coalesce(x->>'phone',''), coalesce(x->>'email',''),
    coalesce((x->>'isClient')::boolean,true),
    coalesce((x->>'isProvider')::boolean,false),
    coalesce((x->>'creditDays')::integer,0),
    coalesce(x->>'address',''), coalesce(x->>'notes','')
  from jsonb_array_elements(coalesce(doc->'contacts','[]'::jsonb)) x
  where x->>'id' is not null;

  -- Cuentas ------------------------------------------------------
  insert into public.accounts (
    id, business_id, name, type, currency, balance,
    commission_in, commission_out, in_cash_close, active
  )
  select
    x->>'id', target,
    coalesce(x->>'name',''), coalesce(x->>'type','efectivo'), coalesce(x->>'currency','USD'),
    coalesce((x->>'balance')::numeric,0),
    coalesce((x->>'commissionIn')::numeric,0), coalesce((x->>'commissionOut')::numeric,0),
    coalesce((x->>'inCashClose')::boolean,true), coalesce((x->>'active')::boolean,true)
  from jsonb_array_elements(coalesce(doc->'accounts','[]'::jsonb)) x
  where x->>'id' is not null;

  -- Ventas (cabecera) --------------------------------------------
  insert into public.sales (
    id, business_id, code, at, status, discount, discount_id, discount_code,
    surcharge, tax, igtf, net, total, notes, payment_method,
    customer_id, customer_name, channel_id, location_id, user_id, voided_at, void_reason
  )
  select
    x->>'id', target, coalesce(x->>'code',''),
    coalesce(nullif(x->>'at','')::timestamptz, now()),
    coalesce(x->>'status','cobrada'),
    coalesce((x->>'discount')::numeric,0), x->>'discountId', x->>'discountCode',
    coalesce((x->>'surcharge')::numeric,0), coalesce((x->>'tax')::numeric,0),
    coalesce((x->>'igtf')::numeric,0),
    -- net = max(0, Σ(price*qty) − discount); total = net + tax + surcharge + igtf
    greatest(0, coalesce(
      (select sum((l->>'price')::numeric * (l->>'qty')::numeric)
       from jsonb_array_elements(coalesce(x->'lines','[]'::jsonb)) l), 0)
      - coalesce((x->>'discount')::numeric,0)),
    coalesce((x->>'total')::numeric,0),
    coalesce(x->>'notes',''), coalesce(x->>'paymentMethod',''),
    x->>'customerId', x->>'customerName', x->>'channelId', x->>'locationId',
    coalesce(x->>'userId',''),
    nullif(x->>'voidedAt','')::timestamptz, x->>'voidReason'
  from jsonb_array_elements(coalesce(doc->'sales','[]'::jsonb)) x
  where x->>'id' is not null;

  -- Líneas de venta (id generado: sale.id + posición) ------------
  insert into public.sale_lines (
    id, business_id, sale_id, product_id, name, qty, price, cost, tax_rate, note
  )
  select
    (s->>'id') || '_l' || l.ord, target, s->>'id',
    coalesce(l.elem->>'productId',''), coalesce(l.elem->>'name',''),
    coalesce((l.elem->>'qty')::numeric,0), coalesce((l.elem->>'price')::numeric,0),
    coalesce((l.elem->>'cost')::numeric,0), coalesce((l.elem->>'taxRate')::numeric,0),
    coalesce(l.elem->>'note','')
  from jsonb_array_elements(coalesce(doc->'sales','[]'::jsonb)) s
  cross join lateral jsonb_array_elements(coalesce(s->'lines','[]'::jsonb))
    with ordinality as l(elem, ord)
  where s->>'id' is not null;

  -- Movimientos de cuenta ----------------------------------------
  insert into public.movements (
    id, business_id, at, account_id, direction, amount_usd, currency,
    amount_input, origin, note, user_id, ref_id
  )
  select
    x->>'id', target, coalesce(nullif(x->>'at','')::timestamptz, now()),
    coalesce(x->>'accountId',''), coalesce(x->>'direction','entrada'),
    coalesce((x->>'amountUsd')::numeric,0), x->>'currency',
    nullif(x->>'amountInput','')::numeric,
    coalesce(x->>'origin',''), coalesce(x->>'note',''), coalesce(x->>'userId',''),
    x->>'ref'
  from jsonb_array_elements(coalesce(doc->'movements','[]'::jsonb)) x
  where x->>'id' is not null;

  -- Movimientos de inventario ------------------------------------
  insert into public.inventory_moves (
    id, business_id, at, product_id, product_name, kind, qty, cost_unit,
    origin, location_id, ref, user_id
  )
  select
    x->>'id', target, coalesce(nullif(x->>'at','')::timestamptz, now()),
    coalesce(x->>'productId',''), coalesce(x->>'productName',''),
    coalesce(x->>'kind','entrada'), coalesce((x->>'qty')::numeric,0),
    coalesce((x->>'costUnit')::numeric,0),
    coalesce(x->>'origin',''), coalesce(x->>'locationId',''), x->>'ref',
    coalesce(x->>'userId','')
  from jsonb_array_elements(coalesce(doc->'inventoryMoves','[]'::jsonb)) x
  where x->>'id' is not null;

  -- Compras (cabecera) -------------------------------------------
  insert into public.purchases (
    id, business_id, at, supplier_id, supplier_name, location_id,
    payment_method, account_id, invoice_no, total_usd, user_id
  )
  select
    x->>'id', target, coalesce(nullif(x->>'at','')::timestamptz, now()),
    x->>'supplierId', coalesce(x->>'supplierName',''), coalesce(x->>'locationId',''),
    coalesce(x->>'paymentMethod','efectivo'), x->>'accountId',
    coalesce(x->>'invoiceNo',''), coalesce((x->>'totalUsd')::numeric,0),
    coalesce(x->>'userId','')
  from jsonb_array_elements(coalesce(doc->'purchases','[]'::jsonb)) x
  where x->>'id' is not null;

  -- Líneas de compra ---------------------------------------------
  insert into public.purchase_lines (
    id, business_id, purchase_id, product_id, name, qty, cost_unit
  )
  select
    (p->>'id') || '_l' || l.ord, target, p->>'id',
    coalesce(l.elem->>'productId',''), coalesce(l.elem->>'name',''),
    coalesce((l.elem->>'qty')::numeric,0), coalesce((l.elem->>'costUnit')::numeric,0)
  from jsonb_array_elements(coalesce(doc->'purchases','[]'::jsonb)) p
  cross join lateral jsonb_array_elements(coalesce(p->'lines','[]'::jsonb))
    with ordinality as l(elem, ord)
  where p->>'id' is not null;

  -- Gastos -------------------------------------------------------
  insert into public.expenses (
    id, business_id, at, name, category, note, amount_usd, recurring,
    paid, anulado, account_id, paid_at, user_id
  )
  select
    x->>'id', target, coalesce(nullif(x->>'at','')::timestamptz, now()),
    coalesce(x->>'name',''), coalesce(x->>'category',''), coalesce(x->>'note',''),
    coalesce((x->>'amountUsd')::numeric,0),
    coalesce((x->>'recurring')::boolean,false),
    coalesce((x->>'paid')::boolean,false),
    coalesce((x->>'anulado')::boolean,false),
    x->>'accountId', nullif(x->>'paidAt','')::timestamptz, coalesce(x->>'userId','')
  from jsonb_array_elements(coalesce(doc->'expenses','[]'::jsonb)) x
  where x->>'id' is not null;

  -- Pendientes (CxC / CxP) ---------------------------------------
  insert into public.pendings (
    id, business_id, at, direction, contact_id, contact_name, subject,
    amount_usd, paid_usd, due_at, note, status
  )
  select
    x->>'id', target, coalesce(nullif(x->>'at','')::timestamptz, now()),
    coalesce(x->>'direction','cobrar'), x->>'contactId',
    coalesce(x->>'contactName',''), coalesce(x->>'subject',''),
    coalesce((x->>'amountUsd')::numeric,0), coalesce((x->>'paidUsd')::numeric,0),
    nullif(x->>'dueAt','')::timestamptz, coalesce(x->>'note',''),
    coalesce(x->>'status','abierto')
  from jsonb_array_elements(coalesce(doc->'pendings','[]'::jsonb)) x
  where x->>'id' is not null;

  -- Transferencias -----------------------------------------------
  insert into public.transfers (
    id, business_id, at, from_id, to_id, amount_usd, commission,
    note, user_id, correction_of
  )
  select
    x->>'id', target, coalesce(nullif(x->>'at','')::timestamptz, now()),
    x->>'fromId', x->>'toId', coalesce((x->>'amountUsd')::numeric,0),
    coalesce((x->>'commission')::numeric,0),
    coalesce(x->>'note',''), coalesce(x->>'userId',''), x->>'correctionOf'
  from jsonb_array_elements(coalesce(doc->'transfers','[]'::jsonb)) x
  where x->>'id' is not null;

  -- Cierres de caja ----------------------------------------------
  insert into public.cash_closures (
    id, business_id, opened_at, closed_at, user_id, location_id,
    opening_usd, opening_bs, counted_usd, counted_bs,
    expected_usd, expected_bs, difference_usd, difference_bs, note
  )
  select
    x->>'id', target,
    coalesce(nullif(x->>'openedAt','')::timestamptz, now()),
    coalesce(nullif(x->>'closedAt','')::timestamptz, now()),
    coalesce(x->>'userId',''), coalesce(x->>'locationId',''),
    coalesce((x->>'openingUsd')::numeric,0), coalesce((x->>'openingBs')::numeric,0),
    coalesce((x->>'countedUsd')::numeric,0), coalesce((x->>'countedBs')::numeric,0),
    coalesce((x->>'expectedUsd')::numeric,0), coalesce((x->>'expectedBs')::numeric,0),
    coalesce((x->>'differenceUsd')::numeric,0), coalesce((x->>'differenceBs')::numeric,0),
    coalesce(x->>'note','')
  from jsonb_array_elements(coalesce(doc->'cashClosures','[]'::jsonb)) x
  where x->>'id' is not null;

  -- Sesión de caja abierta (objeto único, mutable) ---------------
  if doc->'cashSession' is not null and doc->'cashSession' != 'null'::jsonb then
    insert into public.cash_sessions (
      business_id, opened_at, opening_usd, opening_bs, user_id, location_id
    )
    values (
      target,
      coalesce(nullif(doc->'cashSession'->>'openedAt','')::timestamptz, now()),
      coalesce((doc->'cashSession'->>'openingUsd')::numeric,0),
      coalesce((doc->'cashSession'->>'openingBs')::numeric,0),
      coalesce(doc->'cashSession'->>'userId',''),
      coalesce(doc->'cashSession'->>'locationId','')
    )
    on conflict (business_id) do update
      set opened_at = excluded.opened_at,
          opening_usd = excluded.opening_usd,
          opening_bs = excluded.opening_bs,
          user_id = excluded.user_id,
          location_id = excluded.location_id;
  end if;

  raise notice 'unpack_business: comercio % desempaquetado', target;
end;
$$;

-- Desempaqueta todos los comercios existentes.
create or replace function public.unpack_all_businesses()
returns void
language plpgsql security definer set search_path = public
as $$
declare r record;
begin
  for r in select id from public.businesses loop
    perform public.unpack_business(r.id);
  end loop;
end;
$$;
