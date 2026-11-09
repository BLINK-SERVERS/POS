// ============================================================
// BLINK POS · Estado de demostración para capturas
// ------------------------------------------------------------
// Construye un AppState realista —catálogo de abastos, ventas del
// día, caja abierta— que se inyecta en localStorage para fotografiar
// la aplicación real sin cuenta ni Supabase.
//
// Lo consume `scripts/capturar-landing.mjs`, que guarda las capturas
// en `public/landing/` para la landing comercial.
//
// No toca ninguna base de datos: es un dato local, efímero.
// ============================================================

const TASA = 883.3963;

/** [nombre, categoría, marca, presentación, unidad, costo, precio, stock, mínimo] */
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

const CATS_GASTO = [
  "Alquiler",
  "Compra de productos e insumos",
  "Gastos administrativos",
  "Mantenimiento y reparaciones",
  "Mercadeo y publicidad",
  "Muebles, equipos y maquinaria",
  "Nómina",
  "Otros",
  "Servicios públicos",
  "Transporte y logística",
].map((name, i) => ({ id: `ecat_${i}`, name, active: true }));

/** EAN-13 con dígito de control válido (13 cifras). */
function ean(base12) {
  let s = 0;
  for (let i = 0; i < 12; i++) s += Number(base12[i]) * (i % 2 === 0 ? 1 : 3);
  return base12 + String((10 - (s % 10)) % 10);
}

const r2 = (n) => Math.round(n * 100) / 100;

export function estadoDemo() {
  const uid = "demo-user";
  const ahora = Date.now();
  const iso = (minAtras) => new Date(ahora - minAtras * 60_000).toISOString();
  const enDias = (d) => new Date(ahora + d * 86_400_000).toISOString();
  /** Hora local de hoy, para la apertura de caja. */
  const hoy = (h, m = 0) => {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  const productos = FICHAS.map((f, i) => {
    const barcode = ean(String(780000000000 + i * 137).slice(0, 12));
    return {
      id: `demo-${barcode}`,
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
    };
  });
  const [arroz, azucar, aceite, harina, pasta, frijol, atun, leche, queso, margarina,
    coca, agua, jugo, cerveza, pan, marraquetas, galleta, detergente, lejia, jabonPolvo,
    bolsas, jabonMano, pastaDental, toalla] = productos;

  const presentacion = (p) => `${p.presentationQty} ${p.unit}`;

  /** Venta con sus totales calculados a partir de las líneas. */
  const venta = (code, minAtras, items, metodo, extra = {}) => {
    const lines = items.map(([p, qty], idx) => ({
      productId: p.id,
      name: p.name,
      presentation: presentacion(p),
      qty,
      price: p.price,
      cost: p.cost,
      taxRate: p.taxRate,
      ...(idx === 0 && extra.nota ? { note: extra.nota } : {}),
    }));
    const neto = lines.reduce((s, l) => s + l.qty * l.price, 0);
    const tax = r2(lines.reduce((s, l) => s + l.qty * l.price * l.taxRate, 0));
    const total = r2(neto + tax);
    const cuenta = {
      "Caja principal": "demo-cuenta-efectivo",
      "Pago móvil": "demo-cuenta-pagomovil",
      "Banesco 1234": "demo-cuenta-banco",
    }[metodo];
    return {
      id: `demo-venta-${code}`,
      code,
      at: iso(minAtras),
      lines,
      status: "cobrada",
      discount: 0,
      surcharge: 0,
      tax,
      igtf: 0,
      notes: "",
      payments: [
        {
          method: metodo,
          accountId: cuenta,
          amountUsd: total,
          currency: "USD",
          amountInput: r2(total * TASA),
          amountReceived: r2(total * TASA),
          change: 0,
          ...(metodo === "Pago móvil" ? { reference: "88340217", commission: r2(total * 0.02) } : {}),
        },
      ],
      customerName: extra.cliente,
      customerId: extra.clienteId,
      paymentMethod: metodo,
      channelId: "ch_principal",
      locationId: "loc_principal",
      userId: uid,
      rate: TASA,
      amountReceived: total,
      changeUsd: 0,
      changeBs: 0,
    };
  };

  const ventas = [
    venta("V-0148", 6, [[pan, 2], [queso, 1], [coca, 2]], "Caja principal"),
    venta("V-0147", 24, [[leche, 1], [arroz, 1], [aceite, 1]], "Pago móvil", { cliente: "María Gómez", clienteId: "demo-cliente-maria" }),
    venta("V-0146", 51, [[cerveza, 6], [agua, 2], [bolsas, 1]], "Caja principal"),
    venta("V-0145", 88, [[harina, 2], [azucar, 2], [pasta, 2], [atun, 3], [frijol, 1]], "Banesco 1234"),
    venta("V-0144", 133, [[detergente, 1], [jabonPolvo, 1], [lejia, 2], [jabonMano, 1], [pastaDental, 1], [toalla, 1]], "Caja principal", { nota: "Cliente frecuente" }),
    venta("V-0143", 176, [[marraquetas, 1], [jugo, 2], [galleta, 1], [margarina, 1]], "Pago móvil"),
  ];

  const movimientos = ventas.map((v, i) => ({
    id: `demo-mov-${i}`,
    at: v.at,
    accountId: v.payments[0].accountId,
    direction: "entrada",
    amountUsd: v.payments[0].amountUsd,
    currency: "USD",
    amountInput: v.payments[0].amountInput,
    origin: "Venta",
    note: v.code,
    userId: uid,
  }));

  return {
    business: {
      name: "Bodega Lucía",
      legalName: "Inversiones Lucía, C.A.",
      rif: "J-40331276-9",
      phone: "+58 424 618 2043",
      address: "Av. 5 de Julio, Local 3, Maracaibo",
      currency: "USD",
      type: "abastos",
      features: { inventory: true, providers: true, credit: true, expenses: true, reports: true },
      receiptTitle: "Bodega Lucía",
      receiptFooter: "Gracias por su compra",
      printFormat: "80mm",
      receiptFields: {
        legalName: false,
        rif: true,
        address: false,
        phone: false,
        customer: true,
        sku: false,
        totalBs: true,
        rate: true,
        notes: true,
      },
    },
    rate: TASA,
    rateUpdatedAt: iso(14),
    taxes: [
      { id: "tax_iva", name: "IVA 16%", rate: 0.16, active: true, isDefault: true },
      { id: "tax_0", name: "Exento", rate: 0, active: true },
    ],
    categories: [...new Set(productos.map((p) => p.category))].map((name, i) => ({
      id: `demo-cat-${i}`,
      name,
      active: true,
      order: i,
    })),
    channels: [{ id: "ch_principal", name: "Principal", description: "", active: true, isDefault: true }],
    locations: [
      { id: "loc_principal", name: "Principal", type: "tienda", active: true, defaultSales: true, defaultPurchases: true },
    ],
    products: productos,
    contacts: [
      { id: "demo-cliente-maria", name: "María Gómez", document: "V-14220387", docType: "V", phone: "+58 412 618 7743", email: "", isClient: true, isProvider: false, creditDays: 0, address: "", notes: "" },
      { id: "demo-proveedor-norte", name: "Distribuidora El Norte", document: "J-30441782-5", docType: "J", phone: "+58 414 902 1180", email: "", isClient: false, isProvider: true, creditDays: 30, address: "", notes: "" },
    ],
    sales: ventas,
    accounts: [
      { id: "demo-cuenta-efectivo", name: "Caja principal", type: "efectivo", currency: "USD", balance: 286.4, commissionIn: 0, commissionOut: 0, inCashClose: true, active: true },
      { id: "demo-cuenta-banco", name: "Banesco 1234", type: "banco", currency: "USD", balance: 812.5, commissionIn: 0, commissionOut: 0, inCashClose: true, active: true },
      { id: "demo-cuenta-pagomovil", name: "Pago móvil", type: "pago_movil", currency: "USD", balance: 128.9, commissionIn: 2, commissionOut: 2, inCashClose: true, active: true },
    ],
    movements: movimientos,
    transfers: [],
    pendings: [
      { id: "demo-p1", at: iso(1500), direction: "cobrar", contactId: "demo-cliente-maria", contactName: "María Gómez", subject: "Compra a crédito", amountUsd: 24.5, paidUsd: 0, dueAt: enDias(6), note: "", status: "abierto" },
      { id: "demo-p2", at: iso(3200), direction: "pagar", contactId: "demo-proveedor-norte", contactName: "Distribuidora El Norte", subject: "Reposición de lácteos", amountUsd: 96, paidUsd: 40, dueAt: enDias(3), note: "", status: "parcial" },
    ],
    expenses: [
      { id: "demo-e1", at: iso(2900), name: "Alquiler del local", category: "Alquiler", note: "", amountUsd: 180, recurring: false, paid: true, anulado: false, accountId: "demo-cuenta-banco", paidAt: iso(2900) },
      { id: "demo-e2", at: iso(600), name: "Bolsa y empaque", category: "Compra de productos e insumos", note: "", amountUsd: 12.4, recurring: false, paid: false, anulado: false },
    ],
    recurringExpenses: [
      { id: "demo-r1", name: "Alquiler del local", categoryId: "ecat_0", amountUsd: 180, frequency: "mensual", firstDue: iso(-12 * 1440), active: true },
    ],
    expenseCategories: CATS_GASTO,
    discounts: [
      { id: "demo-d1", name: "Cliente fiel", code: "FIEL10", type: "porcentaje", value: 10, maxUses: null, used: 3, active: true },
    ],
    surcharges: [{ id: "demo-sg1", name: "Delivery", type: "monto", value: 1.5, active: true }],
    inventoryMoves: [],
    purchases: [],
    stockReturns: [],
    stockAdjustments: [],
    stockTransfers: [],
    cashSession: { openedAt: hoy(8), openingUsd: 200, openingBs: 0, userId: uid, locationId: "loc_principal" },
    cashClosures: [],
    openTabs: [],
    onboarding: { completed: true },
  };
}
