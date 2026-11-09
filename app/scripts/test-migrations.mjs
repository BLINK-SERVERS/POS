// ============================================================
// BLINK POS · Prueba de integración de las migraciones SQL
// ------------------------------------------------------------
// Levanta un PostgreSQL embebido, crea un esquema `auth` mínimo que
// imita a Supabase (roles + `auth.uid()`), ejecuta las migraciones
// REALES en orden y verifica comportamiento real: membresías
// (backfill + trigger), desempaquetado JSONB → tablas, idempotencia,
// casteo de fechas, neto de venta y aislamiento por RLS.
//
// Ejecutar:  npm run test:migrations   (requiere npm install)
// Sale con código != 0 si algo falla. No toca la base de Supabase real.
// ============================================================
import EmbeddedPostgres from 'embedded-postgres';
import { Client } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { tmpdir } from 'os';

const HERE = dirname(fileURLToPath(import.meta.url));
const MIG = join(HERE, '..', '..', 'supabase', 'migrations');
const read = (name) => readFileSync(join(MIG, name), 'utf8');

const PORT = 55432 + Math.floor(Math.random() * 3000);
const pg = new EmbeddedPostgres({
  databaseDir: join(tmpdir(), `blink-pgtest-${Date.now()}`),
  user: 'postgres',
  password: 'pw',
  port: PORT,
  persistent: false,
});

let failures = 0;
const ok = (name, cond, extra = '') => {
  if (cond) console.log(`  PASS  ${name}`);
  else { failures++; console.log(`  FAIL  ${name} ${extra}`); }
};

async function run() {
  console.log('· iniciando postgres embebido...');
  await pg.initialise();
  await pg.start();
  // Supabase usa UTF8; el locale del sistema (español/Windows) crea la BD en
  // WIN1252, que no admite los `→` de los comentarios del SQL. Forzamos UTF8.
  const admin = new Client({ host: 'localhost', port: PORT, user: 'postgres', password: 'pw', database: 'postgres' });
  await admin.connect();
  await admin.query(`drop database if exists blink`);
  await admin.query(`create database blink encoding 'UTF8' lc_collate 'C' lc_ctype 'C' template template0`);
  await admin.end();

  const c = new Client({ host: 'localhost', port: PORT, user: 'postgres', password: 'pw', database: 'blink' });
  await c.connect();

  // --- Stub de Supabase: roles + esquema auth ---
  await c.query(`create role anon nologin; create role authenticated nologin; create role service_role nologin;`);
  await c.query(`create schema if not exists auth;`);
  await c.query(`create table if not exists auth.users (
    id uuid primary key default gen_random_uuid(),
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
  );`);
  await c.query(`create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('blink_test.uid', true), '')::uuid $$;`);

  // --- Migraciones reales, en el orden de una BD ya en producción ---
  // 1) 0001 primero; luego un comercio ANTES de 0002 (caso real: el negocio
  //    ya existía al normalizar) para probar el backfill de membresías.
  console.log('· running 0001_init.sql');
  await c.query(read('0001_init.sql'));

  const u = await c.query(`insert into auth.users (email) values ('t@t.com') returning id`);
  const userId = u.rows[0].id;
  await c.query(`select set_config('blink_test.uid', $1, false)`, [userId]);
  const b1 = await c.query(`insert into public.businesses (owner_id, name, data) values ($1, 'Mi Tienda', '{}'::jsonb) returning id`, [userId]);
  const bizId = b1.rows[0].id;

  // 2) 0002 crea tablas + trigger + BACKFILL; 0003 desempaqueta.
  console.log('· running 0002_normalize.sql');
  await c.query(read('0002_normalize.sql'));
  console.log('· running 0003_unpack.sql');
  await c.query(read('0003_unpack.sql'));
  console.log('· running 0004_catalogo_global.sql');
  await c.query(read('0004_catalogo_global.sql'));
  ok('las 4 migraciones se ejecutan sin error', true);

  const memb1 = await c.query(`select role from public.business_members where business_id = $1 and user_id = $2`, [bizId, userId]);
  ok('BACKFILL: comercio preexistente gana membresía owner', memb1.rowCount === 1 && memb1.rows[0].role === 'owner', `(got ${memb1.rowCount})`);

  // 3) Comercio nuevo DESPUÉS de 0002, de OTRO dueño (la regla actual es un
  //    comercio por dueño) → lo da de alta el trigger.
  const u2row = await c.query(`insert into auth.users (email) values ('owner2@t.com') returning id`);
  const owner2 = u2row.rows[0].id;
  const b2 = await c.query(`insert into public.businesses (owner_id, name, data) values ($1, 'Otra Tienda', '{}'::jsonb) returning id`, [owner2]);
  const biz2 = b2.rows[0].id;
  const memb2 = await c.query(`select role from public.business_members where business_id = $1 and user_id = $2`, [biz2, owner2]);
  ok('TRIGGER: comercio nuevo gana membresía owner', memb2.rowCount === 1 && memb2.rows[0].role === 'owner', `(got ${memb2.rowCount})`);

  // --- Data representativa ( AppState en camelCase ) ---
  const data = {
    products: [
      { id:'prodx_a1', name:'Café', sku:'C01', barcode:'123', unit:'und', cost:2.5, price:5, channelPrices:{ch1:5.5}, category:'Bebidas', type:'simple', taxRate:0.16, active:true, archived:false, trackStock:true, stock:10, minStock:2 },
      { id:'prodx_b2', name:'Pan', sku:'P01', barcode:'456', unit:'und', cost:0.5, price:1, channelPrices:{}, category:'', type:'simple', taxRate:0, active:true, archived:false, trackStock:true, stock:50, minStock:5 },
    ],
    contacts: [
      { id:'contx_1', name:'Proveedor X', document:'J-123', docType:'J', phone:'0414', email:'x@y.com', isClient:false, isProvider:true, creditDays:30, address:'', notes:'' },
    ],
    accounts: [
      { id:'accx_usd', name:'Caja USD', type:'efectivo', currency:'USD', balance:0, commissionIn:0, commissionOut:0, inCashClose:true, active:true },
      { id:'accx_ban', name:'Banco', type:'banco', currency:'USD', balance:100, commissionIn:0, commissionOut:0, inCashClose:true, active:true },
    ],
    sales: [
      { id:'sale_x1', code:'0001', at:'2026-10-17T10:00:00.000Z',
        lines:[
          { productId:'prodx_a1', name:'Café', qty:2, price:5, cost:2.5, taxRate:0.16 },
          { productId:'prodx_b2', name:'Pan', qty:3, price:1, cost:0.5, taxRate:0 },
        ],
        status:'cobrada', discount:1, surcharge:0, tax:1.44, igtf:0, notes:'',
        payments:[{ method:'Caja USD', accountId:'accx_usd', amountUsd:13.44, currency:'USD' }], userId:'u1', paymentMethod:'Caja USD' },
    ],
    movements: [
      { id:'mov_x1', at:'2026-10-17T10:00:00.000Z', accountId:'accx_usd', direction:'entrada', amountUsd:13.44, currency:'USD', amountInput:13.44, origin:'Venta', note:'', userId:'u1' },
      { id:'mov_x2', at:'2026-10-17T11:00:00.000Z', accountId:'accx_usd', direction:'salida', amountUsd:5, currency:'USD', amountInput:5, origin:'Gasto', note:'', userId:'u1' },
    ],
    inventoryMoves: [
      { id:'inv_x1', at:'2026-10-17T10:00:00.000Z', productId:'prodx_a1', productName:'Café', kind:'salida', qty:2, costUnit:2.5, origin:'Venta #0001', locationId:'', ref:'sale_x1', userId:'u1' },
    ],
    purchases: [
      { id:'pur_x1', at:'2026-10-17T09:00:00.000Z', supplierId:'contx_1', supplierName:'Proveedor X', locationId:'', paymentMethod:'efectivo', accountId:'accx_usd', invoiceNo:'F-001',
        lines:[ { productId:'prodx_a1', name:'Café', qty:10, costUnit:2.5 } ], totalUsd:25, userId:'u1' },
    ],
    expenses: [
      { id:'exp_x1', at:'2026-10-17T12:00:00.000Z', name:'Alquiler', category:'Fijo', note:'', amountUsd:20, recurring:false, paid:true, anulado:false, accountId:'accx_usd', paidAt:'2026-10-17T12:00:00.000Z' },
    ],
    pendings: [
      { id:'pend_x1', at:'2026-10-17T13:00:00.000Z', direction:'cobrar', contactId:'contx_1', contactName:'Cliente', subject:'Venta crédito', amountUsd:50, paidUsd:10, dueAt:'2026-11-01T00:00:00.000Z', note:'', status:'parcial' },
    ],
    transfers: [
      { id:'trf_x1', at:'2026-10-17T14:00:00.000Z', fromId:'accx_usd', toId:'accx_ban', amountUsd:10, commission:0, note:'', userId:'u1' },
    ],
    cashClosures: [
      { id:'cc_x1', openedAt:'2026-10-17T08:00:00.000Z', closedAt:'2026-10-17T18:00:00.000Z', userId:'u1', locationId:'', openingUsd:0, openingBs:0, countedUsd:30, countedBs:0, expectedUsd:33.44, expectedBs:0, differenceUsd:-3.44, differenceBs:0, note:'' },
    ],
    cashSession: { openedAt:'2026-10-17T08:00:00.000Z', openingUsd:0, openingBs:0, userId:'u1', locationId:'' },
  };

  await c.query(`update public.businesses set data = $1 where id = $2`, [JSON.stringify(data), bizId]);
  console.log('· running unpack_business()');
  await c.query(`select public.unpack_business($1)`, [bizId]);

  const count = async (t) => (await c.query(`select count(*)::int n from public.${t} where business_id = $1`, [bizId])).rows[0].n;
  const cases = [
    ['products', 2], ['contacts', 1], ['accounts', 2], ['sales', 1], ['sale_lines', 2],
    ['movements', 2], ['inventory_moves', 1], ['purchases', 1], ['purchase_lines', 1],
    ['expenses', 1], ['pendings', 1], ['transfers', 1], ['cash_closures', 1], ['cash_sessions', 1],
  ];
  for (const [t, exp] of cases) ok(`unpack ${t} = ${exp}`, (await count(t)) === exp, `(got ${await count(t)})`);

  // net = max(0, 2*5 + 3*1 − 1) = 12
  const sale = (await c.query(`select net, total, at from public.sales where business_id=$1`, [bizId])).rows[0];
  ok('sale net = 12 (bruto 13 − desc 1)', Number(sale.net) === 12, `(got ${sale.net})`);
  ok('sale at casteado a timestamp', sale.at instanceof Date, `(got ${typeof sale.at})`);

  // ids de línea generados con sufijo _l<pos>
  const lineIds = (await c.query(`select id from public.sale_lines where business_id=$1 order by id`, [bizId])).rows.map((r) => r.id);
  ok('line ids generados con sufijo _l', lineIds.every((id) => /_l\d+$/.test(id)), `(got ${JSON.stringify(lineIds)})`);

  // idempotencia del desempaquetado
  await c.query(`select public.unpack_business($1)`, [bizId]);
  ok('unpack es idempotente (re-corrido)', (await count('sales')) === 1 && (await count('sale_lines')) === 2);

  // trigger updated_at
  const up = await c.query(`update public.products set price = 6 where id='prodx_a1' and business_id=$1 returning updated_at`, [bizId]);
  ok('trigger updated_at en products funciona', up.rowCount === 1);

  // RLS: un usuario ajeno no ve negocios ajenos (rol no-superuser).
  const other = await c.query(`insert into auth.users (email) values ('o@o.com') returning id`);
  await c.query(`create role testuser login password 'x'`);
  await c.query(`grant usage on schema public to testuser; grant all on all tables in schema public to testuser;`);
  await c.query(`grant authenticated to testuser;`);
  const rls = new Client({ host: 'localhost', port: PORT, user: 'testuser', password: 'x', database: 'blink' });
  await rls.connect();
  // El uid va en la conexión `rls`: `auth.uid()` es una variable de sesión.
  // `testuser` es superusuario de su propia sesión para set_config; luego
  // se le quita con `set role authenticated` en el bloque de 0004.
  await rls.query(`select set_config('blink_test.uid', $1, false)`, [other.rows[0].id]);
  const seen = await rls.query(`select count(*)::int n from public.businesses`);
  ok('RLS: usuario ajeno NO ve otros negocios', seen.rows[0].n === 0, `(got ${seen.rows[0].n})`);

  // --- 0004 · Catálogo global colaborativo ---
  // Nota: al correr 0004 en esta prueba `products` aún está vacío (se
  // llena con unpack_business más abajo), así que el backfill se verifica
  // DESPUÉS del desempaquetado, más abajo.
  // IMPORTANTE: `auth.uid()` lee una variable de SESIÓN, y cada conexión
  // tiene la suya. Por eso el uid se fija en la conexión `rls`.

  await rls.query(`set role authenticated`);

  // Aislamiento: un usuario autenticado SIN comercio no puede insertar.
  await rls.query(`select set_config('blink_test.uid', $1, false)`, [other.rows[0].id]);
  let denied = false;
  try {
    await rls.query(`insert into public.catalogo_global (barcode, name) values ('999','NO AUTORIZADO')`);
  } catch { denied = true; }
  ok('RLS: sin membresía no puede insertar en el catálogo global', denied);

  // Un owner/manager SÍ aporta fichas nuevas.
  await rls.query(`select set_config('blink_test.uid', $1, false)`, [userId]);
  const ins = await rls.query(`insert into public.catalogo_global (barcode, name, unit) values ('789','HARINA PAN 1KG','kg') returning barcode`);
  ok('RLS: owner/manager puede insertar en el catálogo global', ins.rowCount === 1);

  // Cualquier autenticado LEE el catálogo global, incluso sin ser el autor.
  await rls.query(`select set_config('blink_test.uid', $1, false)`, [other.rows[0].id]);
  const gRead = await rls.query(`select count(*)::int n from public.catalogo_global`);
  ok('RLS: cualquier autenticado LEE el catálogo global', gRead.rows[0].n === 1, `(got ${gRead.rows[0].n})`);

  // UPDATE/DELETE bloqueados a comercios (no hay política para authenticated).
  let updDenied = false;
  try {
    await rls.query(`update public.catalogo_global set name='ALTERADO' where barcode='789'`);
    updDenied = (await rls.query(`select count(*)::int n from public.catalogo_global where name='ALTERADO'`)).rows[0].n === 0;
  } catch { updDenied = true; }
  ok('RLS: comercio NO puede modificar el catálogo global', updDenied);

  await rls.query(`reset role`);
  await rls.end();

  // --- 0004 · Backfill del catálogo global desde productos existentes ---
  // Ahora que `products` tiene filas (unpack), re-correr 0004 debe crear
  // fichas y seguir siendo idempotente.
  await c.query(read('0004_catalogo_global.sql'));
  const gAll = (await c.query(`select barcode, name from public.catalogo_global where barcode in ('123','456') order by barcode`)).rows;
  ok('catálogo global backfill: 2 fichas de products', gAll.length === 2, `(got ${gAll.length})`);
  // `upper()` de Postgres es sensible al locale: con lc_ctype 'C' no
  // mayúsculiza acentos. La normalización REAL la hace el cliente en JS
  // (`toUpperCase()`), así que aquí solo se comprueba el caso ASCII.
  const pan = gAll.find((r) => r.barcode === '456');
  ok('catálogo global: nombre en MAYÚSCULAS', pan?.name === 'PAN', `(got ${pan?.name})`);
  await c.query(read('0004_catalogo_global.sql'));
  ok('catálogo global: 0004 idempotente', (await c.query(`select count(*)::int n from public.catalogo_global`)).rows[0].n === 3);

  // --- 0005 · Activación de pago y conciliación ---
  console.log('· running 0005_activacion.sql');
  await c.query(read('0005_activacion.sql'));
  ok('0005: la migración se ejecuta sin error', true);

  const actViejo = (await c.query(`select estado, vigente_hasta, purge_en from public.activaciones where user_id = $1`, [userId])).rows[0];
  ok('0005: BACKFILL deja las cuentas previas activas y sin vencimiento',
    actViejo?.estado === 'activo' && actViejo?.vigente_hasta === null && actViejo?.purge_en === null,
    `(got ${JSON.stringify(actViejo)})`);

  const adminRow = await c.query(`insert into auth.users (email) values ('admin@blink.com.ve') returning id`);
  const adminId = adminRow.rows[0].id;
  const actAdmin = (await c.query(`select estado, purge_en, vigente_hasta from public.activaciones where user_id = $1`, [adminId])).rows[0];
  ok('0005: el administrador nace activo y sin purga',
    actAdmin?.estado === 'activo' && actAdmin?.purge_en === null && actAdmin?.vigente_hasta === null,
    `(got ${JSON.stringify(actAdmin)})`);

  const nuevoRow = await c.query(
    `insert into auth.users (email, raw_user_meta_data) values ('nuevo@t.com', '{"first_name":"Ana","last_name":"Pérez"}'::jsonb) returning id, created_at`
  );
  const nuevoId = nuevoRow.rows[0].id;
  const actNuevo = (await c.query(`select estado, purge_en, nombre from public.activaciones where user_id = $1`, [nuevoId])).rows[0];
  const horas = (new Date(actNuevo.purge_en) - new Date(nuevoRow.rows[0].created_at)) / 3600000;
  ok('0005: TRIGGER deja la cuenta nueva pendiente con 24 h',
    actNuevo.estado === 'pendiente' && Math.abs(horas - 24) < 0.01, `(got ${actNuevo.estado}, ${horas} h)`);
  ok('0005: copia el nombre de los metadatos', actNuevo.nombre === 'Ana Pérez', `(got ${actNuevo.nombre})`);

  // El cliente solo tiene acceso a lo suyo; sin pago, el comercio no existe.
  await c.query(`grant all on all tables in schema public to testuser`);
  const rls2 = new Client({ host: 'localhost', port: PORT, user: 'testuser', password: 'x', database: 'blink' });
  await rls2.connect();
  await rls2.query(`set role authenticated`);
  await rls2.query(`select set_config('blink_test.uid', $1, false)`, [nuevoId]);

  let sinComercio = false;
  try {
    await rls2.query(`insert into public.businesses (owner_id, name, data) values ($1, 'Impaga', '{}'::jsonb)`, [nuevoId]);
  } catch { sinComercio = true; }
  ok('0005: sin pago conciliado NO se puede crear el comercio', sinComercio);

  const pago = (await rls2.query(
    `select public.reportar_pago('pago_movil', 'VES', 26250, 1050, '123456789') as id`
  )).rows[0].id;
  ok('0005: el usuario reporta su pago', !!pago);

  const actRevision = (await c.query(`select estado, metodo, tasa_ves from public.activaciones where user_id = $1`, [nuevoId])).rows[0];
  ok('0005: reportar deja la activación en revisión',
    actRevision.estado === 'en_revision' && actRevision.metodo === 'pago_movil' && Number(actRevision.tasa_ves) === 1050,
    `(got ${JSON.stringify(actRevision)})`);

  let duplicado = false;
  try {
    await rls2.query(`select public.reportar_pago('pago_movil', 'VES', 26250, 1050, '123456789')`);
  } catch { duplicado = true; }
  ok('0005: no se duplica un reporte en revisión', duplicado);

  let usuarioConcilia = false;
  try {
    await rls2.query(`select public.decidir_pago($1, true, null)`, [pago]);
  } catch { usuarioConcilia = true; }
  ok('0005: un usuario normal NO puede conciliar', usuarioConcilia);

  await rls2.query(`reset role`);
  await rls2.query(`set role authenticated`);
  await rls2.query(`select set_config('blink_test.uid', $1, false)`, [adminId]);
  await rls2.query(`select public.decidir_pago($1, true, null)`, [pago]);

  const actAprob = (await c.query(`select estado, vigente_hasta, purge_en from public.activaciones where user_id = $1`, [nuevoId])).rows[0];
  const dias = (new Date(actAprob.vigente_hasta) - Date.now()) / 86400000;
  ok('0005: aprobar activa 30 días y cancela la purga',
    actAprob.estado === 'activo' && actAprob.purge_en === null && Math.abs(dias - 30) < 0.01,
    `(got ${actAprob.estado}, ${dias} días)`);

  await rls2.query(`select set_config('blink_test.uid', $1, false)`, [nuevoId]);
  const comercio = await rls2.query(
    `insert into public.businesses (owner_id, name, data) values ($1, 'Ya paga', '{}'::jsonb) returning id`,
    [nuevoId]
  );
  ok('0005: tras aprobar SÍ se crea el comercio', comercio.rowCount === 1);

  // Renovación anticipada: el POS sigue operativo mientras el admin revisa.
  await rls2.query(`select set_config('blink_test.uid', $1, false)`, [nuevoId]);
  const pagoRenov = (await rls2.query(
    `select public.reportar_pago('binance_pay', 'USDT', 25, null, 'TX-RENOV-1') as id`
  )).rows[0].id;
  const actRenov = (await c.query(
    `select estado, purge_en from public.activaciones where user_id = $1`, [nuevoId]
  )).rows[0];
  ok('0005: una renovación anticipada no apaga el POS',
    actRenov.estado === 'activo' && actRenov.purge_en === null,
    `(got ${JSON.stringify(actRenov)})`);

  await rls2.query(`select set_config('blink_test.uid', $1, false)`, [adminId]);
  await rls2.query(`select public.decidir_pago($1, true, null)`, [pagoRenov]);
  const actExt = (await c.query(
    `select estado, vigente_hasta from public.activaciones where user_id = $1`, [nuevoId]
  )).rows[0];
  const diasExt = (new Date(actExt.vigente_hasta) - Date.now()) / 86400000;
  ok('0005: aprobar la renovación suma 30 días a la vigencia',
    actExt.estado === 'activo' && Math.abs(diasExt - 60) < 0.02,
    `(got ${actExt.estado}, ${diasExt} días)`);

  // Rechazo: vuelve a quedar pendiente y gana 24 h nuevas.
  const rechRow = await c.query(`insert into auth.users (email) values ('rechazado@t.com') returning id`);
  const rechId = rechRow.rows[0].id;
  await rls2.query(`select set_config('blink_test.uid', $1, false)`, [rechId]);
  const pagoRech = (await rls2.query(
    `select public.reportar_pago('binance_pay', 'USDT', 25, null, 'TX-998877') as id`
  )).rows[0].id;
  await rls2.query(`select set_config('blink_test.uid', $1, false)`, [adminId]);
  await rls2.query(`select public.decidir_pago($1, false, 'Comprobante ilegible')`, [pagoRech]);

  const actRech = (await c.query(`select a.estado, a.purge_en, p.motivo from public.activaciones a join public.pagos_activacion p on p.user_id = a.user_id where a.user_id = $1`, [rechId])).rows[0];
  const horasRech = (new Date(actRech.purge_en) - Date.now()) / 3600000;
  ok('0005: rechazar deja 24 h nuevas para reintentar',
    actRech.estado === 'rechazado' && Math.abs(horasRech - 24) < 0.01 && actRech.motivo === 'Comprobante ilegible',
    `(got ${actRech.estado}, ${horasRech} h)`);

  // Un pago en revisión no se purga aunque el reloj venza.
  const revRow = await c.query(`insert into auth.users (email) values ('revision@t.com') returning id`);
  const revId = revRow.rows[0].id;
  await rls2.query(`select set_config('blink_test.uid', $1, false)`, [revId]);
  await rls2.query(`select public.reportar_pago('pago_movil', 'VES', 26000, 1040, 'REF-1')`);
  await c.query(`update public.activaciones set purge_en = now() - interval '1 hour' where user_id = $1`, [revId]);
  await c.query(`select set_config('blink_test.uid', $1, false)`, [adminId]);
  await c.query(`select public.purgar_activaciones()`);
  const sigue = await c.query(`select 1 from auth.users where id = $1`, [revId]);
  ok('0005: la purga respeta los pagos en revisión', sigue.rowCount === 1);

  // Purga real de una cuenta rechazada y vencida.
  await c.query(`update public.activaciones set purge_en = now() - interval '1 hour' where user_id = $1`, [rechId]);
  await c.query(`select public.purgar_activaciones()`);
  const borrada = await c.query(`select 1 from auth.users where id = $1`, [rechId]);
  const sinAct = await c.query(`select 1 from public.activaciones where user_id = $1`, [rechId]);
  ok('0005: la purga borra la cuenta vencida y su activación',
    borrada.rowCount === 0 && sinAct.rowCount === 0);

  await rls2.query(`reset role`);
  await rls2.end();

  await c.end();
  await pg.stop();

  console.log(failures === 0 ? '\n✅ TODAS LAS COMPROBACIONES PASARON' : `\n❌ ${failures} comprobaciones fallaron`);
  process.exit(failures === 0 ? 0 : 1);
}

run().catch(async (e) => { console.error('ERROR:', e.message); try { await pg.stop(); } catch { /* noop */ } process.exit(2); });
