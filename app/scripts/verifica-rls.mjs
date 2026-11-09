// ============================================================
// BLINK POS · Verificador de políticas RLS (declarado vs. vivo)
// ------------------------------------------------------------
// Reconstruye la base DESDE CERO con las migraciones del repositorio
// (Postgres embebido, en /tmp, sin tocar nada) y compara el conjunto de
// políticas resultante contra las políticas vivas del proyecto Supabase,
// expresión por expresión (usando la descompilación de pg_policies en
// ambos lados, que es la misma función y por tanto comparable).
//
// Solo lectura: no escribe en Supabase, no aplica migraciones y no crea
// cuentas. La única base que toca es la embebida efímera.
//
// Uso:
//   node scripts/verifica-rls.mjs            // local + vivo (red + token)
//   node scripts/verifica-rls.mjs --solo-local
//   node scripts/verifica-rls.mjs --json      // vuelca el diff en un archivo
//
// Con --json el resultado se escribe en `verify-shots/rls-comparacion.json`
// (o la ruta que se pase como `--json=<ruta>`) en lugar de stdout: el Postgres
// embebido escribe su arranque en stdout y lo contaminaría.
//
// Sale con código != 0 si hay deriva entre lo declarado y lo vivo.
// ============================================================
import EmbeddedPostgres from 'embedded-postgres';
import { Client } from 'pg';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { tmpdir } from 'os';

const HERE = dirname(fileURLToPath(import.meta.url));
const MIG_DIR = join(HERE, '..', '..', 'supabase', 'migrations');
const ENV_LOCAL = join(HERE, '..', '.env.local');

const REF = 'zspgwnbkcvnhdwsidjnn';
const PORT = 55432 + Math.floor(Math.random() * 3000);

const args = new Set(process.argv.slice(2));
const SOLO_LOCAL = args.has('--solo-local');
const jsonRuta = [...process.argv.slice(2)].find((a) => a.startsWith('--json='));
const JSON_OUT = args.has('--json') || Boolean(jsonRuta);

const log = (...a) => { if (!JSON_OUT) console.log(...a); };

// ------------------------------------------------------------------
// 1) Normalización comparable
// ------------------------------------------------------------------
// `pg_get_expr` puede devolver la misma condición con distinto espaciado
// o con `public.` explícito según dónde se creó la política. Se comparan
// tokens, no caracteres crudos.
function normaliza(expr) {
  if (!expr) return '';
  return String(expr)
    .replace(/\bpublic\./g, '')
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/::[a-z ]+/g, (m) => m.replace(/\s/g, ''))
    .trim()
    .toLowerCase();
}

// `firma()` renombra las columnas; la clave se construye SIEMPRE sobre su
// salida. Si se leen `tablename`/`policyname` aquí, ambas claves quedan
// `undefined::undefined` y las 70 políticas colapsan en un solo mapa.
const clave = (p) => `${p.tabla}::${p.politica}`;

function firma(p) {
  return {
    tabla: p.tablename,
    politica: p.policyname,
    cmd: String(p.cmd).toUpperCase(),
    roles: normalizaRoles(p.roles),
    permissiva: String(p.permissive).toUpperCase() === 'PERMISSIVE',
    using: normaliza(p.qual),
    check: normaliza(p.with_check ?? p.wcheck),
  };
}

function normalizaRoles(roles) {
  const r = String(roles || 'public').replace(/[{}"]/g, '').trim();
  if (r === '' || r === 'public') return 'public';
  return r.split(',').map((x) => x.trim()).sort().join(',');
}

const CONSULA = `
  select tablename, policyname, cmd, permissive,
         array_to_string(roles, ',') as roles,
         coalesce(qual, '') as qual,
         coalesce(with_check, '') as with_check
  from pg_policies
  where schemaname = 'public'
  order by tablename, policyname`;

// ------------------------------------------------------------------
// 2) Lado local: levantar Postres embebido y correr las migraciones
// ------------------------------------------------------------------
async function construirLocal() {
  const archivos = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql')).sort();
  const pg = new EmbeddedPostgres({
    databaseDir: join(tmpdir(), `blink-rls-check-${Date.now()}`),
    user: 'postgres',
    password: 'pw',
    port: PORT,
    persistent: false,
  });
  log(`· levantando Postgres embebido (puerto ${PORT}) y aplicando ${archivos.length} migraciones…`);
  await pg.initialise();
  await pg.start();

  const admin = new Client({ host: 'localhost', port: PORT, user: 'postgres', password: 'pw', database: 'postgres' });
  await admin.connect();
  await admin.query(`drop database if exists blink`);
  await admin.query(`create database blink encoding 'UTF8' lc_collate 'C' lc_ctype 'C' template template0`);
  await admin.end();

  const c = new Client({ host: 'localhost', port: PORT, user: 'postgres', password: 'pw', database: 'blink' });
  await c.connect();

  // Stub del entorno Supabase (roles + auth.users + auth.uid()) como en test-migrations.
  await c.query(`create role anon nologin; create role authenticated nologin; create role service_role nologin;`);
  await c.query(`create schema if not exists auth;`);
  await c.query(`create table if not exists auth.users (
    id uuid primary key default gen_random_uuid(),
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
  );`);
  await c.query(`create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('blink_test.uid', true), '')::uuid $$;`);

  for (const f of archivos) {
    log(`  · ${f}`);
    await c.query(readFileSync(join(MIG_DIR, f), 'utf8'));
  }

  const filas = (await c.query(CONSULA)).rows;
  await c.end();
  await pg.stop();
  return { filas, archivos };
}

// ------------------------------------------------------------------
// 3) Lado vivo: consulta de solo lectura por la Management API
// ------------------------------------------------------------------
function token() {
  try {
    const env = readFileSync(ENV_LOCAL, 'utf8');
    return (env.match(/^SUPABASE_ACCESS_TOKEN=(.+)$/m) || [])[1];
  } catch { return null; }
}

async function consultarVivo(tok) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok.trim()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: CONSULA }),
  });
  if (!r.ok) throw new Error(`Management API ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  if (Array.isArray(j)) return j;
  throw new Error(`respuesta inesperada: ${JSON.stringify(j).slice(0, 200)}`);
}

// ------------------------------------------------------------------
// 4) Comparación
// ------------------------------------------------------------------
const difiere = (a, b) =>
  a.cmd !== b.cmd || a.roles !== b.roles || a.permissiva !== b.permissiva || a.using !== b.using || a.check !== b.check;

function compara(local, vivo) {
  const A = new Map(local.map((p) => [clave(p), p]));
  const B = new Map(vivo.map((p) => [clave(p), p]));
  // Red de seguridad: si dos políticas comparten clave, el mapa las fusiona y
  // el dictamen deja de significar nada. Se aborta en vez de informar mal.
  if (A.size !== local.length || B.size !== vivo.length) {
    throw new Error(`claves duplicadas: local ${local.length}→${A.size}, vivo ${vivo.length}→${B.size}`);
  }
  const faltaVersionar = [...B.keys()].filter((k) => !A.has(k)).map((k) => B.get(k));
  const sobranVersionadas = [...A.keys()].filter((k) => !B.has(k)).map((k) => A.get(k));
  const distintas = [...A.keys()].filter((k) => B.has(k) && difiere(A.get(k), B.get(k)))
    .map((k) => ({ declarado: A.get(k), vivo: B.get(k) }));
  return { faltaVersionar, sobranVersionadas, distintas, comunes: [...A.keys()].filter((k) => B.has(k)).length };
}

function informe(res, nLocal, nVivo, archivos) {
  const lineas = [];
  lineas.push(`declaradas por las migraciones : ${nLocal}  (${archivos.join(', ')})`);
  lineas.push(`vivas en el proyecto           : ${nVivo}`);
  lineas.push(`idénticas en nombre y forma    : ${res.comunes - res.distintas.length}`);
  lineas.push('');
  if (res.faltaVersionar.length === 0 && res.sobranVersionadas.length === 0 && res.distintas.length === 0) {
    lineas.push('✅ SIN DERIVA: las migraciones reproducen exactamente las políticas vivas.');
  } else {
    lineas.push('❌ HAY DERIVA:');
    if (res.faltaVersionar.length) {
      lineas.push(`  · vivas y NO declaradas (${res.faltaVersionar.length}):`);
      for (const p of res.faltaVersionar) lineas.push(`      ${p.tabla}/${p.politica} · ${p.cmd} · using(${p.using || '—'}) check(${p.check || '—'})`);
    }
    if (res.sobranVersionadas.length) {
      lineas.push(`  · declaradas y NO vivas (${res.sobranVersionadas.length}):`);
      for (const p of res.sobranVersionadas) lineas.push(`      ${p.tabla}/${p.politica} · ${p.cmd}`);
    }
    if (res.distintas.length) {
      lineas.push(`  · mismo nombre, forma distinta (${res.distintas.length}):`);
      for (const d of res.distintas) {
        lineas.push(`      ${d.declarado.tabla}/${d.declarado.politica}`);
        if (d.declarado.using !== d.vivo.using) lineas.push(`        using  migración: ${d.declarado.using || '—'}\n        using  en vivo   : ${d.vivo.using || '—'}`);
        if (d.declarado.check !== d.vivo.check) lineas.push(`        check  migración: ${d.declarado.check || '—'}\n        check  en vivo   : ${d.vivo.check || '—'}`);
        if (d.declarado.cmd !== d.vivo.cmd) lineas.push(`        cmd    migración: ${d.declarado.cmd} · en vivo: ${d.vivo.cmd}`);
        if (d.declarado.roles !== d.vivo.roles) lineas.push(`        roles  migración: ${d.declarado.roles} · en vivo: ${d.vivo.roles}`);
      }
    }
  }
  return lineas.join('\n');
}

// ------------------------------------------------------------------
// 5) Prueba de sensibilidad del comparador
// ------------------------------------------------------------------
// Un comparador demasiado tolerante también dice "SIN DERIVA", así que el
// dictamen solo vale si el script es capaz de ver las derivas que se le
// inyectan. `--selftest` no levanta Postgres ni toca la red.
// ------------------------------------------------------------------
function selftest() {
  const fila = (sobre = {}) => ({
    tablename: 'products', policyname: 'products_select', cmd: 'SELECT', permissive: 'PERMISSIVE',
    roles: 'authenticated', qual: 'public.is_business_member(business_id)', with_check: '', ...sobre,
  });
  const casos = [
    ['idénticas no cuentan como deriva', [fila()], [fila()], 0],
    ['espaciado y public. distintos NO son deriva', [fila()], [fila({ qual: 'is_business_member( business_id )' })], 0],
    ['mayúsculas distintas NO son deriva', [fila()], [fila({ qual: 'IS_BUSINESS_MEMBER(business_id)' })], 0],
    ['política viva sin versionar', [fila()], [], 1],
    ['política versionada que no existe en vivo', [], [fila()], 1],
    ['using distinto', [fila()], [fila({ qual: 'true' })], 1],
    ['with_check distinto', [fila({ cmd: 'INSERT', qual: '', with_check: 'is_business_member(business_id)' })], [fila({ cmd: 'INSERT', qual: '', with_check: 'true' })], 1],
    ['cmd distinto', [fila()], [fila({ cmd: 'UPDATE' })], 1],
    ['roles distintos', [fila()], [fila({ roles: 'anon' })], 1],
    ['permissiva vs restrictiva', [fila()], [fila({ permissive: 'RESTRICTIVE' })], 1],
  ];
  let fallos = 0;
  for (const [nombre, local, vivo, esperadas] of casos) {
    let got;
    try {
      const r = compara(local.map(firma), vivo.map(firma));
      got = r.faltaVersionar.length + r.sobranVersionadas.length + r.distintas.length;
    } catch (e) { got = `error: ${e.message}`; }
    const ok = got === esperadas;
    if (!ok) fallos++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${nombre} (derivas ${got}, se esperaban ${esperadas})`);
  }
  // Claves duplicadas: deben abortar, no informar "sin deriva".
  let aborta = false;
  try {
    compara([fila(), fila()], [fila(), fila()]);
  } catch { aborta = true; }
  if (!aborta) fallos++;
  console.log(`  ${aborta ? 'PASS' : 'FAIL'}  claves duplicadas abortan en vez de dar verde`);
  console.log(fallos === 0 ? '\nselftest: comparador CONFIABLE' : `\nselftest: ${fallos} FALLO(S) en el comparador`);
  process.exit(fallos === 0 ? 0 : 1);
}

if (process.argv.slice(2).includes('--selftest')) selftest();

try {
  const { filas: filasLocales, archivos } = await construirLocal();
  const local = filasLocales.map(firma);
  log(`· local: ${local.length} políticas después de ${archivos.length} migraciones`);

  if (SOLO_LOCAL) {
    for (const p of local) log(`  ${p.tabla}/${p.politica} · ${p.cmd} · to ${p.roles} · using(${p.using || '—'})`);
    process.exit(0);
  }

  const tok = token();
  if (!tok) { console.error('Falta SUPABASE_ACCESS_TOKEN en app/.env.local: usa --solo-local.'); process.exit(2); }

  log('· consultando las políticas vivas (solo lectura)…');
  const vivo = (await consultarVivo(tok)).map(firma);
  const res = compara(local, vivo);

  if (JSON_OUT) {
    const ruta = jsonRuta || join(HERE, '..', 'verify-shots', 'rls-comparacion.json');
    mkdirSync(dirname(ruta), { recursive: true });
    writeFileSync(ruta, JSON.stringify({ generado: new Date().toISOString(), migraciones: archivos, res, local, vivo }, null, 1));
    console.log(`json: ${ruta}`);
    console.log(informe(res, local.length, vivo.length, archivos));
  } else {
    console.log(informe(res, local.length, vivo.length, archivos));
  }

  const derivas = res.faltaVersionar.length + res.sobranVersionadas.length + res.distintas.length;
  process.exit(derivas === 0 ? 0 : 1);
} catch (e) {
  console.error('ERROR:', e.message);
  process.exit(2);
}
