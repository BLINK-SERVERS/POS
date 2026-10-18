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
  await c.query(`create table if not exists auth.users (id uuid primary key default gen_random_uuid(), email text);`);
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
  ok('las 3 migraciones se ejecutan sin error', true);

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
  await c.query(`select set_config('blink_test.uid', $1, false)`, [other.rows[0].id]);
  const rls = new Client({ host: 'localhost', port: PORT, user: 'testuser', password: 'x', database: 'blink' });
  await rls.connect();
  const seen = await rls.query(`select count(*)::int n from public.businesses`);
  ok('RLS: usuario ajeno NO ve otros negocios', seen.rows[0].n === 0, `(got ${seen.rows[0].n})`);
  await rls.end();

  await c.end();
  await pg.stop();

  console.log(failures === 0 ? '\n✅ TODAS LAS COMPROBACIONES PASARON' : `\n❌ ${failures} comprobaciones fallaron`);
  process.exit(failures === 0 ? 0 : 1);
}

run().catch(async (e) => { console.error('ERROR:', e.message); try { await pg.stop(); } catch { /* noop */ } process.exit(2); });
