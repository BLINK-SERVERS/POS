// ============================================================
// BLINK POS · Siembra del entorno de pruebas (QA)
// ------------------------------------------------------------
// Crea un comercio ficticio con su usuario propietario en
// Supabase, siembra el catálogo global compartido, lo importa en
// el catálogo privado de esa tienda y escribe el estado completo
// (AppState) que la app hidrata al entrar.
//
// IMPORTANTE — dónde vive el estado:
//   · En la nube, la app lee y escribe `businesses.data` (el AppState
//     completo en JSONB). Las tablas normalizadas (`products`,
//     `contacts`…) son un reflejo para consulta; la app NO las lee.
//     Por eso la siembra escribe el `data`.
//   · `catalogo_global` sí se lee (catálogo colaborativo).
//
// Es IDEMPOTENTE: se puede volver a ejecutar sin duplicar nada.
//
// Uso:
//   node scripts/qa-seed.mjs
//   node scripts/qa-seed.mjs --email qa@tienda.local --password Clave1 --name "Tienda QA"
//
// Requiere en `app/.env.local`:
//   VITE_SUPABASE_URL=...   SUPABASE_ACCESS_TOKEN=...
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(HERE, "..");

/* ---------------------------------------------------------------- */
/* Argumentos                                                        */
/* ---------------------------------------------------------------- */
const args = process.argv.slice(2);
const arg = (n, def) => {
  const i = args.indexOf("--" + n);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const EMAIL = arg("email", "qa.blink@tienda.local");
const PASSWORD = arg("password", "ClavePrueba123");
const NEGOCIO = arg("name", "Tienda QA");
const TASA = Number(arg("rate", "883.3963"));

/* ---------------------------------------------------------------- */
/* Entorno                                                           */
/* ---------------------------------------------------------------- */
function leerEnv() {
  const env = {};
  const f = path.join(APP, ".env.local");
  if (fs.existsSync(f)) {
    for (const linea of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
      const m = linea.match(/^([A-Z_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].trim();
    }
  }
  return env;
}
const env = leerEnv();
const URL = env.VITE_SUPABASE_URL;
const TOKEN = env.SUPABASE_ACCESS_TOKEN;
if (!URL || !TOKEN) {
  console.error("Falta VITE_SUPABASE_URL o SUPABASE_ACCESS_TOKEN en app/.env.local");
  process.exit(1);
}
const REF = URL.match(/https:\/\/([a-z0-9]+)\./)[1];
const H = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

async function sql(q) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({ query: q }),
  });
  const t = await r.text();
  let data;
  try {
    data = JSON.parse(t);
  } catch {
    data = t;
  }
  // La API responde 200 con {message} cuando la consulta falla: hay que
  // mirarlo, o los errores se silencian y el sembrado queda a medias.
  if (r.status >= 400 || (data && data.message)) {
    throw new Error(
      "SQL: " + String(data?.message ?? t).slice(0, 300) + "\n  " + q.slice(0, 170)
    );
  }
  return { status: r.status, data };
}
const lit = (s) => "'" + String(s).replace(/'/g, "''") + "'";
/** Igual que lit(), pero un valor nulo se escribe como NULL de SQL. */
const litN = (s) => (s === null || s === undefined ? "null" : lit(s));
const iso = (d) => new Date(Date.now() - d * 3600_000).toISOString();

/* ---------------------------------------------------------------- */
/* Usuario (Admin API): correo YA confirmado = sin pasarela de pago  */
/* ---------------------------------------------------------------- */
async function claveServicio() {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/api-keys`, { headers: H });
  const k = await r.json();
  const sr = k.find((x) => x.type === "legacy" && x.name === "service_role");
  if (!sr) throw new Error("no se encontro la clave service_role");
  return sr.api_key;
}
async function usuarios(sk) {
  const r = await fetch(`${URL}/auth/v1/admin/users?per_page=200`, {
    headers: { apikey: sk, Authorization: `Bearer ${sk}` },
  });
  return (await r.json()).users || [];
}
async function crearUsuario(sk, email, password) {
  const r = await fetch(`${URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { apikey: sk, Authorization: `Bearer ${sk}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true, // flujo de cortesía: sin correo ni pasarela
      user_metadata: { full_name: "QA BLINK" },
    }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("no se pudo crear el usuario: " + JSON.stringify(d).slice(0, 200));
  return d;
}
async function setPassword(sk, id, password) {
  await fetch(`${URL}/auth/v1/admin/users/${id}`, {
    method: "PUT",
    headers: { apikey: sk, Authorization: `Bearer ${sk}`, "Content-Type": "application/json" },
    body: JSON.stringify({ password, email_confirm: true }),
  });
}

/* ---------------------------------------------------------------- */
/* Catalogo global: fichas de una abastopedia venezolana           */
/* ---------------------------------------------------------------- */
const EAN = (base12) => {
  let s = 0;
  for (let i = 0; i < 12; i++) s += Number(base12[i]) * (i % 2 === 0 ? 1 : 3);
  return base12 + String((10 - (s % 10)) % 10);
};

/** [nombre, categoria, marca, presentacion, unidad, costo, precio, stock, minimo] */
const FICHAS = [
  ["ARROZ BLANCO 1 KG", "Alimentos", "GENERAL", 1, "kg", 0.78, 1.15, 48, 12],
  ["AZUCAR BLANCA 1 KG", "Alimentos", "GENERAL", 1, "kg", 0.62, 0.95, 40, 10],
  ["ACEITE DE GIRASOL 1 L", "Alimentos", "GENERAL", 1, "L", 1.35, 1.85, 24, 6],
  ["HARINA DE TRIGO 1 KG", "Alimentos", "GENERAL", 1, "kg", 0.55, 0.85, 36, 9],
  ["PASTA MACARRON 500 G", "Alimentos", "GENERAL", 500, "g", 0.7, 1.05, 30, 8],
  ["FRIJOL BLANCO 500 G", "Alimentos", "GENERAL", 500, "g", 1.1, 1.6, 22, 6],
  ["ATUN EN LATA 170 G", "Alimentos", "GENERAL", 170, "g", 1.05, 1.55, 26, 8],
  ["LECHE EN POLVO 900 G", "Lacteos", "GENERAL", 900, "g", 3.4, 4.6, 14, 4],
  ["QUESO BLANCO 500 G", "Lacteos", "GENERAL", 500, "g", 2.6, 3.5, 9, 3],
  ["MARGARINA 500 G", "Lacteos", "GENERAL", 500, "g", 1.15, 1.6, 18, 5],
  ["COCA COLA 1.5 L", "Bebidas", "COCA COLA", 1.5, "L", 0.85, 1.2, 48, 12],
  ["AGUA MINERAL 1.5 L", "Bebidas", "CRISTAL", 1.5, "L", 0.25, 0.45, 60, 15],
  ["JUGO DE NARANJA 1 L", "Bebidas", "GENERAL", 1, "L", 0.7, 1.1, 20, 6],
  ["CERVEZA PILSENER 355 ML", "Bebidas", "ZULTA", 355, "ml", 0.45, 0.7, 24, 6],
  ["PAN BLANCO TAZADO", "Panaderia", "LA CORTE", 1, "unidad", 0.35, 0.6, 30, 10],
  ["PAN MARRAQUETAS 12 UN", "Panaderia", "LA CORTE", 12, "unidad", 1.6, 2.3, 8, 3],
  ["GALLETA DE AVENA 500 G", "Panaderia", "GENERAL", 500, "g", 1.1, 1.55, 16, 4],
  ["DETERGENTE 3 KG", "Limpieza", "GENERAL", 3, "kg", 3.2, 4.4, 12, 3],
  ["LEJIA 1 L", "Limpieza", "GENERAL", 1, "L", 0.55, 0.9, 20, 6],
  ["JABON EN POLVO 1 KG", "Limpieza", "GENERAL", 1, "kg", 1.35, 1.9, 15, 4],
  ["BOLS PLASTICO 50 UN", "Limpieza", "GENERAL", 50, "unidad", 0.8, 1.2, 10, 3],
  ["JABON DE MANO 400 ML", "Aseo personal", "GENERAL", 400, "ml", 0.9, 1.35, 18, 5],
  ["PASTA DENTRICA 200 G", "Aseo personal", "GENERAL", 200, "g", 0.95, 1.4, 14, 4],
  ["TOALLA HIGIENICA 4 UN", "Aseo personal", "GENERAL", 4, "unidad", 1.2, 1.7, 22, 6],
];

/* ---------------------------------------------------------------- */
/* Siembra                                                           */
/* ---------------------------------------------------------------- */
async function main() {
  console.log("== Siembra del entorno de pruebas de BLINK POS ==\n");
  const sk = await claveServicio();

  /* 1 · Usuario con correo confirmado (flujo de cortesía) */
  const lista = await usuarios(sk);
  let usuario = lista.find((u) => u.email === EMAIL);
  if (!usuario) {
    usuario = await crearUsuario(sk, EMAIL, PASSWORD);
    console.log(`1 · Usuario creado (correo ya confirmado): ${EMAIL}`);
  } else {
    await setPassword(sk, usuario.id, PASSWORD);
    console.log(`1 · Usuario ya existente (contraseña actualizada): ${EMAIL}`);
  }
  const uid = usuario.id;

  /* 2 · Comercio + membresía de propietario */
  let negocioId = null;
  const r2 = await sql(
    `insert into public.businesses (owner_id, name, data)
     values (${lit(uid)}::uuid, ${lit(NEGOCIO)}, '{}'::jsonb)
     on conflict (owner_id) do update set name = excluded.name, data = excluded.data
     returning id;`
  );
  negocioId = r2.data?.[0]?.id;
  if (!negocioId) {
    const r2b = await sql(
      `select id from public.businesses where owner_id = ${lit(uid)}::uuid order by created_at desc limit 1;`
    );
    negocioId = r2b.data?.[0]?.id;
  }
  await sql(
    `insert into public.business_members (business_id, user_id, role)
     values (${lit(negocioId)}::uuid, ${lit(uid)}::uuid, 'owner')
     on conflict do nothing;`
  );
  console.log(`2 · Comercio "${NEGOCIO}" (${negocioId}) con membresía de propietario`);

  /* 3 · Catálogo global compartido (nivel 1) */
  const fichas = FICHAS.map((f, i) => ({
    barcode: EAN(String(780000000000 + i * 137).slice(0, 12)),
    f,
  }));
  await sql(
    `insert into public.catalogo_global (barcode, name, presentation_qty, unit, category, brand)
     values ${fichas
       .map(
         ({ barcode, f }) =>
           `(${lit(barcode)}, ${lit(f[0])}, ${f[3]}, ${lit(f[4])}, ${lit(f[1])}, ${lit(f[2])})`
       )
       .join(", ")}
     on conflict (barcode) do update
       set name = excluded.name, presentation_qty = excluded.presentation_qty,
           unit = excluded.unit, category = excluded.category, brand = excluded.brand;`
  );
  console.log(`3 · Catálogo global: ${fichas.length} fichas (EAN-13 con dígito de control válido)`);

  /* 4 · Catálogo privado de la tienda (nivel 2): importado del global */
  const productos = fichas.map(({ barcode, f }) => ({
    id: `qa-${barcode}`,
    name: f[0],
    brand: f[2],
    sku: `SKU-${barcode.slice(-4)}`,
    barcode,
    presentationQty: f[3],
    unit: f[4],
    cost: f[5],
    price: f[6],
    channelPrices: {},
    category: f[1],
    taxRate: 0.16,
    active: true,
    archived: false,
    trackStock: true,
    stock: f[7],
    minStock: f[8],
  }));
  const cats = [...new Set(productos.map((p) => p.category))];

  /* 5 · Registros operativos */
  const contactos = [
    { id: "qa-c1", name: "Maria Gomez", document: "V-12345678", docType: "V", phone: "+58 412 111 1111", email: "maria@ejemplo.local", isClient: true, isProvider: false, creditDays: 0, address: "Caracas", notes: "" },
    { id: "qa-c2", name: "Distribuidora El Norte", document: "J-98765432-1", docType: "J", phone: "+58 414 222 2222", email: "ventas@elnorte.local", isClient: false, isProvider: true, creditDays: 30, address: "Valencia", notes: "Proveedor delogueo" },
    { id: "qa-c3", name: "Pedro Ramirez", document: "V-87654321", docType: "V", phone: "+58 416 333 3333", email: "pedro@ejemplo.local", isClient: true, isProvider: false, creditDays: 15, address: "Maracay", notes: "" },
  ];
  const cuentas = [
    { id: "qa-a1", name: "Caja principal", type: "efectivo", currency: "USD", balance: 250, commissionIn: 0, commissionOut: 0, inCashClose: true, active: true },
    { id: "qa-a2", name: "Banco Banesco 1234", type: "banco", currency: "USD", balance: 800, commissionIn: 0, commissionOut: 0, inCashClose: true, active: true },
    { id: "qa-a3", name: "Pago movil", type: "pago_movil", currency: "USD", balance: 120, commissionIn: 2, commissionOut: 2, inCashClose: true, active: true },
  ];
  const ventas = [
    {
      id: "qa-s1",
      code: "QA-0001",
      at: iso(2),
      lines: [
        { productId: productos[0].id, name: productos[0].name, presentation: "1 kg", qty: 1, price: 1.15, cost: 0.78, taxRate: 0.16 },
        { productId: productos[7].id, name: productos[7].name, presentation: "900 g", qty: 1, price: 4.6, cost: 3.4, taxRate: 0.16 },
      ],
      status: "cobrada",
      discount: 0,
      surcharge: 0,
      tax: 0.4,
      igtf: 0,
      net: 2.5,
      notes: "Venta de prueba",
      payments: [{ method: "Caja principal", accountId: "qa-a1", amountUsd: 2.9, currency: "USD" }],
      customerId: "qa-c1",
      customerName: "Maria Gomez",
      paymentMethod: "Caja principal",
      channelId: "ch_principal",
      locationId: "loc_principal",
      userId: uid,
      rate: TASA,
      amountReceived: 2.9,
      changeUsd: 0,
      changeBs: 0,
    },
  ];
  const movimientos = [
    { id: "qa-m1", at: iso(2), accountId: "qa-a1", direction: "entrada", amountUsd: 2.9, currency: "USD", amountInput: 2.9, origin: "Venta", note: "QA-0001", userId: uid },
  ];
  const pendientes = [
    { id: "qa-p1", at: iso(120), direction: "cobrar", contactId: "qa-c1", contactName: "Maria Gomez", subject: "Venta a credito", amountUsd: 120, paidUsd: 0, dueAt: new Date(Date.now() + 10 * 86400_000).toISOString(), note: "PENDIENTE ABIERTO", status: "abierto" },
    { id: "qa-p2", at: iso(480), direction: "cobrar", contactId: "qa-c3", contactName: "Pedro Ramirez", subject: "Abono semanal", amountUsd: 60, paidUsd: 60, dueAt: new Date(Date.now() - 5 * 86400_000).toISOString(), note: "PENDIENTE SALDADO", status: "saldado" },
    { id: "qa-p3", at: iso(48), direction: "pagar", contactId: "qa-c2", contactName: "Distribuidora El Norte", subject: "Compra a credito", amountUsd: 95, paidUsd: 40, dueAt: new Date(Date.now() + 5 * 86400_000).toISOString(), note: "PENDIENTE PARCIAL", status: "parcial" },
  ];
  const gastos = [
    { id: "qa-e1", at: iso(72), name: "Alquiler del local", category: "Alquiler", note: "GASTO PAGADO", amountUsd: 180, recurring: false, paid: true, anulado: false, accountId: "qa-a2", paidAt: iso(72) },
    { id: "qa-e2", at: iso(24), name: "Compra de inventario", category: "Merma", note: "GASTO PENDIENTE", amountUsd: 75.5, recurring: false, paid: false, anulado: false },
  ];
  const recurrentes = [
    { id: "qa-r1", name: "Alquiler del local", categoryId: "ecat_0", amountUsd: 180, frequency: "mensual", firstDue: new Date(Date.now() + 12 * 86400_000).toISOString(), active: true },
  ];
  const descuentos = [
    { id: "qa-d1", name: "Cliente fiel", code: "FIEL10", type: "porcentaje", value: 10, maxUses: null, used: 3, active: true },
  ];
  const recargos = [{ id: "qa-sg1", name: "Delivery", type: "monto", value: 1.5, active: true }];
  const stockMoves = [
    { id: "qa-im1", at: iso(144), productId: productos[0].id, productName: productos[0].name, kind: "entrada", qty: 50, costUnit: 0.78, origin: "Apertura", locationId: "loc_principal", userId: uid },
    { id: "qa-im2", at: iso(24), productId: productos[0].id, productName: productos[0].name, kind: "salida", qty: 2, costUnit: 0.78, origin: "Venta QA-0001", locationId: "loc_principal", userId: uid },
    { id: "qa-im3", at: iso(24), productId: productos[21].id, productName: productos[21].name, kind: "salida", qty: 1, costUnit: 0.9, origin: "Merma", locationId: "loc_principal", userId: uid },
  ];
  const catsGasto = [
    "Alquiler", "Compra de productos e insumos", "Gastos administrativos",
    "Mantenimiento y reparaciones", "Mercadeo y publicidad",
    "Muebles, equipos y maquinaria", "Nómina", "Otros", "Servicios públicos",
    "Transporte y logística",
  ].map((name, i) => ({ id: `ecat_${i}`, name, active: true }));
  catsGasto.push({ id: "ecat_sys", name: "Pago de impuestos (IVA/IGTF)", active: true, system: true });

  /* 6 · El AppState completo: es lo que la app hidrata (businesses.data) */
  const estado = {
    business: {
      name: NEGOCIO,
      legalName: "Inversiones QA, C.A.",
      rif: "J-40123456-7",
      phone: "+58 412 000 0000",
      address: "Av. Principal, Local 12, Caracas",
      currency: "USD",
      type: "abastos",
      features: { inventory: true, providers: true, expenses: true, reports: true, customers: true },
      receiptTitle: NEGOCIO,
      receiptFooter: "Gracias por su compra",
      printFormat: "80mm",
      receiptFields: { legalName: true, rif: true, address: false, phone: false, customer: true, sku: true, totalBs: true, rate: true, notes: true },
    },
    rate: TASA,
    rateUpdatedAt: iso(1),
    taxes: [
      { id: "tax_iva", name: "IVA 16%", rate: 0.16, active: true, isDefault: true },
      { id: "tax_0", name: "Exento", rate: 0, active: true },
    ],
    categories: cats.map((name, i) => ({ id: `cat_${i}`, name, active: true, order: i })),
    channels: [{ id: "ch_principal", name: "Principal", description: "", active: true, isDefault: true }],
    locations: [{ id: "loc_principal", name: "Principal", type: "tienda", active: true, defaultSales: true, defaultPurchases: true }],
    products: productos,
    contacts: contactos,
    sales: ventas,
    accounts: cuentas,
    movements: movimientos,
    transfers: [],
    pendings: pendientes,
    expenses: gastos,
    recurringExpenses: recurrentes,
    expenseCategories: catsGasto,
    discounts: descuentos,
    surcharges: recargos,
    inventoryMoves: stockMoves,
    purchases: [],
    stockReturns: [],
    stockAdjustments: [],
    stockTransfers: [],
    cashSession: { openedAt: iso(8), openingUsd: 250, openingBs: 0, userId: uid, locationId: "loc_principal" },
    cashClosures: [],
    openTabs: [],
    onboarding: { completed: true },
  };

  await sql(
    `update public.businesses set data = ${lit(JSON.stringify(estado))}::jsonb, name = ${lit(NEGOCIO)}, updated_at = now()
     where id = ${lit(negocioId)}::uuid;`
  );
  console.log("4 · AppState completo escrito en businesses.data (lo que la app hidrata)");

  /* 7 · Reflejo en las tablas normalizadas (para consultas SQL) */
  await sql(
    `delete from public.products where business_id = ${lit(negocioId)}::uuid;
     insert into public.products
       (id, business_id, name, sku, barcode, unit, cost, price, channel_prices, category, type,
        tax_rate, active, archived, track_stock, stock, min_stock, version, brand, presentation_qty)
     values ${productos
       .map(
         (p) =>
           `(${lit(p.id)}, ${lit(negocioId)}::uuid, ${lit(p.name)}, ${lit(p.sku)}, ${lit(p.barcode)}, ${lit(p.unit)}, ${p.cost}, ${p.price}, '{}'::jsonb, ${lit(p.category)}, 'simple', ${p.taxRate}, true, false, true, ${p.stock}, ${p.minStock}, 1, ${lit(p.brand)}, ${p.presentationQty})`
       )
       .join(", ")};`
  );
  await sql(
    `delete from public.contacts where business_id = ${lit(negocioId)}::uuid;
     insert into public.contacts (id, business_id, name, document, doc_type, phone, email, is_client, is_provider, credit_days, address, notes)
     values ${contactos
       .map(
         (c) =>
           `(${lit(c.id)}, ${lit(negocioId)}::uuid, ${lit(c.name)}, ${lit(c.document)}, ${lit(c.docType)}, ${lit(c.phone)}, ${lit(c.email)}, ${c.isClient}, ${c.isProvider}, ${c.creditDays}, ${lit(c.address)}, ${lit(c.notes)})`
       )
       .join(", ")};`
  );
  await sql(
    `delete from public.accounts where business_id = ${lit(negocioId)}::uuid;
     insert into public.accounts (id, business_id, name, type, currency, balance, commission_in, commission_out, in_cash_close, active)
     values ${cuentas
       .map(
         (a) =>
           `(${lit(a.id)}, ${lit(negocioId)}::uuid, ${lit(a.name)}, ${lit(a.type)}, ${lit(a.currency)}, ${a.balance}, ${a.commissionIn}, ${a.commissionOut}, true, true)`
       )
       .join(", ")};`
  );
  await sql(
    `delete from public.sales where business_id = ${lit(negocioId)}::uuid;
     insert into public.sales (id, business_id, code, at, status, discount, surcharge, tax, igtf, net, total, notes, payment_method, customer_name, user_id)
     values ${ventas
       .map(
         (v) =>
           `(${lit(v.id)}, ${lit(negocioId)}::uuid, ${lit(v.code)}, ${lit(v.at)}, ${lit(v.status)}, ${v.discount}, ${v.surcharge}, ${v.tax}, ${v.igtf}, ${v.net}, 2.9, ${lit(v.notes)}, ${lit(v.paymentMethod)}, ${lit(v.customerName)}, ${lit(uid)})`
       )
       .join(", ")};`
  );
  await sql(
    `insert into public.sale_lines (id, business_id, sale_id, product_id, name, qty, price, cost, tax_rate)
     values ${ventas
       .flatMap((v) =>
         v.lines.map((l, i) => `('qa-sl-${v.id}-${i}', ${lit(negocioId)}::uuid, ${lit(v.id)}, ${lit(l.productId)}, ${lit(l.name)}, ${l.qty}, ${l.price}, ${l.cost}, ${l.taxRate})`)
       )
       .join(", ")};`
  );
  await sql(
    `delete from public.pendings where business_id = ${lit(negocioId)}::uuid;
     insert into public.pendings (id, business_id, at, direction, contact_id, contact_name, subject, amount_usd, paid_usd, due_at, note, status)
     values ${pendientes
       .map(
         (p) =>
           `(${lit(p.id)}, ${lit(negocioId)}::uuid, ${lit(p.at)}, ${lit(p.direction)}, ${lit(p.contactId)}, ${lit(p.contactName)}, ${lit(p.subject)}, ${p.amountUsd}, ${p.paidUsd}, ${lit(p.dueAt)}, ${lit(p.note)}, ${lit(p.status)})`
       )
       .join(", ")};`
  );
  await sql(
    `delete from public.expenses where business_id = ${lit(negocioId)}::uuid;
     insert into public.expenses (id, business_id, at, name, category, note, amount_usd, recurring, paid, anulado, account_id, paid_at, user_id)
     values ${gastos
       .map(
         (g) =>
           `(${lit(g.id)}, ${lit(negocioId)}::uuid, ${lit(g.at)}, ${lit(g.name)}, ${lit(g.category)}, ${lit(g.note)}, ${g.amountUsd}, ${g.recurring}, ${g.paid}, ${g.anulado}, ${litN(g.accountId)}, ${litN(g.paidAt)}, ${lit(uid)})`
       )
       .join(", ")};`
  );
  await sql(
    `delete from public.inventory_moves where business_id = ${lit(negocioId)}::uuid;
     insert into public.inventory_moves (id, business_id, at, product_id, product_name, kind, qty, cost_unit, origin, location_id, user_id)
     values ${stockMoves
       .map(
         (m) =>
           `(${lit(m.id)}, ${lit(negocioId)}::uuid, ${lit(m.at)}, ${lit(m.productId)}, ${lit(m.productName)}, ${lit(m.kind)}, ${m.qty}, ${m.costUnit}, ${lit(m.origin)}, ${lit(m.locationId)}, ${lit(uid)})`
       )
       .join(", ")};`
  );
  console.log("5 · Reflejo en las tablas normalizadas (products, contacts, accounts, sales, pendings, expenses, inventory_moves)");

  /* 8 · Informe */
  const r = await sql(`
    select
      (select count(*) from public.catalogo_global) as global,
      (select count(*) from public.products where business_id = ${lit(negocioId)}::uuid) as productos,
      (select count(*) from public.contacts where business_id = ${lit(negocioId)}::uuid) as contactos,
      (select count(*) from public.accounts where business_id = ${lit(negocioId)}::uuid) as cuentas,
      (select count(*) from public.sales where business_id = ${lit(negocioId)}::uuid) as ventas,
      (select count(*) from public.pendings where business_id = ${lit(negocioId)}::uuid) as pendientes,
      (select count(*) from public.expenses where business_id = ${lit(negocioId)}::uuid) as gastos,
      (select jsonb_array_length(data->'products') from public.businesses where id = ${lit(negocioId)}::uuid) as productos_app,
      (select jsonb_array_length(data->'contacts') from public.businesses where id = ${lit(negocioId)}::uuid) as contactos_app;
  `);
  console.log("\n== Recuento final ==");
  console.log(JSON.stringify(r.data?.[0] ?? r.data, null, 1));
  console.log(`\n== Credenciales del entorno de pruebas ==
   correo:   ${EMAIL}
   clave:    ${PASSWORD}
   comercio: ${NEGOCIO} (${negocioId})`);
}

main().catch((e) => {
  console.error("\nFALLO:", e.message);
  process.exit(1);
});
