// ============================================================
// BLINK POS · Registro de la ayuda guiada «¿Cómo funciona?»
// ------------------------------------------------------------
// MÓDULO PURO: sin React, sin DOM, sin red. Solo texto y rutas. Así se
// puede leer, medir y probar desde node sin levantar la aplicación.
//
// Un mapa por pantalla (la clave es la RUTA, no el nombre del componente:
// es lo único que coincide entre la navegación, el historial del navegador
// y lo que ve el usuario).
//
// Reglas de oro de este archivo:
//   · `target` es un selector CSS **opcional**. Quien lo consume debe
//     tolerar que no exista: muchos apuntan a `data-tour="..."`, anclas que
//     cada pantalla va añadiendo cuando puede. Si el ancla no está, el paso
//     se pinta como tarjeta centrada y listo (nada se rompe).
//   · `atajo` NUNCA se pinta: va al atributo `title`. Regla de la casa: un
//     atajo de teclado no ocupa texto en pantalla.
//   · El texto describe lo que la pantalla hace HOY. Si una pantalla cambia
//     su flujo, se corrige aquí y nada más.
// ============================================================

/** Un paso de la guía: qué es, para qué sirve y qué elemento ilumina. */
export interface PasoGuia {
  /** Titulo corto del paso (una linea). */
  titulo: string;
  /** Que hace y para que, en dos o tres frases. */
  texto: string;
  /** Selector CSS del elemento que se ilumina. Opcional: si no existe o no
   *  mide nada, el paso sale como tarjeta centrada. */
  target?: string;
  /** Atajo de teclado asociado. Se muestra solo en el `title`, nunca pintado. */
  atajo?: string;
}

/** Una guia completa: la pantalla y sus pasos, en orden. */
export interface Guia {
  /** Ruta que la dispara (tambien puede tener alias, ver `GUIAS`). */
  id: string;
  /** Como se llama la pantalla para el usuario. */
  pantalla: string;
  pasos: PasoGuia[];
}

/* ------------------------------------------------------------------ */
/* Guías por pantalla                                                  */
/* ------------------------------------------------------------------ */

const VENTAS: Guia = {
  id: "/app/ventas",
  pantalla: "Vender",
  pasos: [
    {
      titulo: "Así se arma una venta",
      texto:
        "Busca el producto por nombre, código, medida, unidad o marca. Los resultados aparecen ordenados justo debajo del campo: lo que escribes ya filtra la lista.",
      target: "#pos-search",
      atajo: "F2: buscar",
    },
    {
      titulo: "Añádelo al ticket",
      texto:
        "Toca el producto y se suma al ticket. Si lo vuelves a elegir, no se duplica: sube la cantidad de esa línea. En el ticket puedes cambiar cantidades y borrar líneas antes de cobrar.",
      target: '[data-tour="ventas-resultados"]',
      atajo: "↑ ↓: recorrer · Enter: añadir el resaltado · 1-9: elegir fila",
    },
    {
      titulo: "Varias cuentas a la vez",
      texto:
        "Cada cuenta abierta vive arriba. Con «Nueva cuenta» dejas a un cliente esperando y atendes a otro sin perder lo ya cargado; vuelve a la que quieras tocando su etiqueta.",
      target: '[data-tour="ventas-nueva-cuenta"]',
      atajo: "F4: cuenta nueva",
    },
    {
      titulo: "Descuento, recargo y nota",
      texto:
        "Antes de cobrar puedes aplicar un descuento con código, un recargo y una nota en el ticket. Los descuentos y recargos se crean en Catálogo. Si el cliente todavía no decide, genera una cotización y déjala guardada.",
      target: ".ticket",
    },
    {
      titulo: "Cobra",
      texto:
        "Revisa el total en dólares y en bolívares y pulsa el botón de cobrar. Elige el método de pago, confirma el monto y el ticket queda listo para imprimir. Las ventas a crédito se van solas a la pantalla Créditos.",
      target: ".ticket__foot",
      atajo: "F8: cobrar · Esc: cerrar el cobro",
    },
    {
      titulo: "La caja del día",
      texto:
        "El sello de arriba dice si la caja está abierta o cerrada. Para abrirla o hacer el arqueo de cierre, usa el menú de tu cuenta, en la esquina superior derecha.",
      target: ".shell__topbar .userchip",
    },
  ],
};

const HISTORIAL: Guia = {
  id: "/app/ventas/historial",
  pantalla: "Historial de ventas",
  pasos: [
    {
      titulo: "Lo que ya quedó cobrado",
      texto:
        "Aquí están las ventas con su pago y su estado: pagada, cotización o anulada. Los números de arriba resumen lo vendido, cuántas ventas hubo, el ticket promedio y lo que tienes por cobrar a crédito.",
      target: ".kpis",
    },
    {
      titulo: "Imprime un ticket otra vez",
      texto:
        "El botón de la impresora abre el comprobante y lo manda a la térmica o a PDF. Sirve cuando el cliente pidió otra copia o el papel se quedó corto.",
      target: '[data-tour="historial-ticket"]',
    },
    {
      titulo: "Anular no es borrar",
      texto:
        "Al anular, la venta queda marcada y sale de las cifras, pero se conserva con su motivo para que el corte cuadre. Las cotizaciones y las ya anuladas no se anulan.",
      target: ".table-wrap",
    },
    {
      titulo: "Vuelve al punto de venta",
      texto:
        "«Ir al POS» te regresa a Vender con las cuentas que tenías abiertas, intactas.",
      target: ".page-head .btn",
    },
  ],
};

const CATALOGO: Guia = {
  id: "/app/catalogo",
  pantalla: "Catálogo",
  pasos: [
    {
      titulo: "Todo lo que vendes",
      texto:
        "Un solo listado con tus productos, sus precios, márgenes y estado. Lo que creas aquí es lo que aparece en el buscador de Vender.",
      target: ".page-head",
    },
    {
      titulo: "Crea el producto",
      texto:
        "«Nuevo producto» pide nombre y precio; el resto es opcional: costo (para ver el margen), SKU y código de barras para escanear, categoría, unidad y medida. Activa «Controlar inventario» y define el mínimo si quieres alertas de stock.",
      target: ".page-head .btn--primary",
    },
    {
      titulo: "Cinco pestañas",
      texto:
        "Productos, Precios, Descuentos, Recargos y Categorías. Las dos del medio son las que se aplican en el ticket, desde Vender.",
      target: ".tabs",
    },
    {
      titulo: "Precios por canal",
      texto:
        "En Precios cambias el precio de un producto según el canal de venta (mostrador, mayor, delivery). El canal predeterminado es el que usa el POS y también mueve el precio base.",
      target: '.tabs [data-tab="Precios"]',
    },
    {
      titulo: "Precio fijo en Bs",
      texto:
        "Si un producto vale bolívares y no debe moverse con la tasa, dale su «Precio fijo (Bs)» al registrarlo. En la venta se cobra ese Bs exacto; el dólar se deriva con la tasa del día solo para la contabilidad (impuestos, cuentas por cobrar e informes).",
      target: ".prodcard",
    },
    {
      titulo: "Actívalo o apágalo",
      texto:
        "Desactivar un producto, descuento o categoría lo saca del POS sin borrar su historial. Desactivar es reversible; eliminar, no.",
      target: ".prodcard",
    },
  ],
};

const INVENTARIO: Guia = {
  id: "/app/inventario",
  pantalla: "Inventario",
  pasos: [
    {
      titulo: "Cuánta mercancía tienes",
      texto:
        "Las cifras de arriba dan el valor a costo y a venta de lo que hay en depósito, más las alertas de stock: los productos que ya llegaron a su mínimo.",
      target: ".kpis",
    },
    {
      titulo: "Registra la compra",
      texto:
        "Con «Registrar compra» cargas proveedor, fecha y los productos con su cantidad y costo. La existencia sube sola y el movimiento queda anotado.",
      target: ".page-head .btn--primary",
      atajo: "Esc: cerrar la ventana",
    },
    {
      titulo: "Ajusta cuando cuentas",
      texto:
        "Si al contar la realidad no cuadra (merma, error de conteo, devolución), usa «Ajustar» en la fila del producto y escribe la existencia correcta. El ajuste se registra como movimiento, no se pierde.",
      target: ".table-wrap",
    },
    {
      titulo: "Movimientos y compras",
      texto:
        "Las pestañas dividen el control: Existencias para el día a día, Movimientos para auditar qué entró y salió, Compras para revisitar a quién le compraste.",
      target: ".tabs",
    },
    {
      titulo: "Escanear en vez de escribir",
      texto:
        "«Escanear» abre la cámara para contar o buscar por código de barras. Con un lector USB o Bluetooth conectado, basta con escanear: se lee sin configurar nada.",
      target: '[data-tour="inventario-escanear"]',
    },
  ],
};

const CONTACTOS: Guia = {
  id: "/app/contactos",
  pantalla: "Contactos",
  pasos: [
    {
      titulo: "Clientes y proveedores",
      texto:
        "Una sola libreta para los dos. Un mismo contacto puede marcarse como «Ambos» si te vende y le vendes.",
      target: ".page-head",
    },
    {
      titulo: "Nuevo contacto",
      texto:
        "«Nuevo contacto» pide nombre y, si quieres, tipo y número de documento (V, E, J o RIF), teléfono, correo, dirección y notas. Con el documento completo el ticket sale con los datos fiscales del cliente.",
      target: ".page-head .btn--primary",
    },
    {
      titulo: "Los días de crédito",
      texto:
        "El tipo y los «Días de crédito» definen cuánto esperas el pago cuando vendes a crédito desde el POS. La columna Crédito de la lista muestra esos días: si están en 0, la cuenta no tiene fecha de vencimiento.",
      target: ".table-wrap",
    },
    {
      titulo: "Dónde se ve el saldo",
      texto:
        "El detalle de cada cuenta por cobrar, sus abonos y su estado de cuenta se trabaja en la pantalla Créditos. Aquí solo administras la ficha del contacto y los días de crédito que le aplican.",
      target: '[data-tour="contactos-credito"]',
    },
  ],
};

const CREDITOS: Guia = {
  id: "/app/creditos",
  pantalla: "Créditos",
  pasos: [
    {
      titulo: "Lo que te deben",
      texto:
        "Esta pantalla es la cuenta por cobrar del comercio: cada cliente con saldo abierto, cuándo le vence y cuántos días lleva de atraso. Las ventas a crédito hechas en el POS llegan solas, no hay que cargarlas acá.",
      target: ".page-head",
    },
    {
      titulo: "Las tres cifras de arriba",
      texto:
        "Por cobrar es el total de la calle, Deudores cuenta cuántos clientes deben y cuántas cuentas ya vencieron, y En mora los que tienen 30 días o más de atraso. Empieza a cobrar por los de mora.",
      target: '[data-tour="creditos-resumen"]',
    },
    {
      titulo: "Busca y lee la lista",
      texto:
        "El campo busca por nombre, cédula o teléfono. Cada fila trae las cuentas abiertas del cliente, su saldo, la fecha de vencimiento y el estado: «al día», los días de atraso en amarillo, o en rojo cuando cumple 30 días.",
      target: '[data-tour="creditos-lista"]',
    },
    {
      titulo: "Registra el abono",
      texto:
        "«Abonar» abre la ventana del cobro: eliges la cuenta que recibe, tecleas en la moneda de esa cuenta (en Bs usa la tasa del día) y puedes sumar varios cobros hasta completar. Un abono parcial deja la cuenta activa con el resto; nunca devuelve vuelto y no puede pasar del saldo.",
      target: '[data-tour="creditos-abonar"]',
    },
    {
      titulo: "La ficha del deudor",
      texto:
        "«Ver» muestra todas las cuentas del cliente con sus abonos. De ahí sale el estado de cuenta impreso, con debe, haber y saldo al cierre, y el comprobante de cada abono individual para entregar al cliente.",
      target: '[data-tour="creditos-ficha"]',
    },
    {
      titulo: "Reporte CXC",
      texto:
        "«Reporte CXC» imprime o guarda en PDF el listado completo de deudores con saldo, vencimiento y atraso: el papel con el que se manda el cobro del mes. Los días de crédito que definen el vencimiento se fijan en el contacto, en Contactos.",
      target: '[data-tour="creditos-reporte"]',
    },
  ],
};

const FINANZAS: Guia = {
  id: "/app/finanzas",
  pantalla: "Finanzas",
  pasos: [
    {
      titulo: "Dónde está tu dinero",
      texto:
        "Arriba se consolida lo que hay en todas tus cuentas, los bolívares conservados y la tasa oficial del día, que es la que convierte. Sin tasa en Ajustes, las cifras en Bs quedan vacías.",
      target: ".kpis",
    },
    {
      titulo: "Ocho pestañas",
      texto:
        "Cuentas, Movimientos, Transferencias, Pendientes, Gastos, Gastos recurrentes, Categorías de gasto y Cierres de caja. Cada una hace una sola cosa.",
      target: ".tabs",
    },
    {
      titulo: "Cuentas por cobrar",
      texto:
        "Las ventas a crédito del POS llegan solas a Pendientes, con fecha de vencimiento según los días de crédito del contacto. «Nuevo pendiente» crea uno a mano (por ejemplo, una deuda vieja). El trabajo fino cliente por cliente está en la pantalla Créditos.",
      target: '.tabs [data-tab="Pendientes"]',
    },
    {
      titulo: "Registra el abono",
      texto:
        "Cuando el cliente paga, abre su pendiente y registra el abono: el saldo baja y el dinero entra a la cuenta que elijas. Un abono parcial deja el pendiente activo con el resto.",
      target: ".table-wrap",
    },
    {
      titulo: "Gastos y transferencias",
      texto:
        "«Nuevo gasto» descuenta de una cuenta y alimenta la utilidad de Informes. Las transferencias mueven dinero entre tus cuentas sin aparecer como gasto.",
      target: ".page-head .btn--ghost",
    },
    {
      titulo: "El cierre de caja",
      texto:
        "Al cerrar la caja desde el menú de tu cuenta, el arqueo queda en Cierres de caja: esperado, contado, diferencia y su motivo obligatorio cuando no cuadra.",
      target: '.tabs [data-tab="Cierres de caja"]',
    },
  ],
};

const INFORMES: Guia = {
  id: "/app/informes",
  pantalla: "Informes",
  pasos: [
    {
      titulo: "El resultado, mes a mes",
      texto:
        "Ventas netas, costo de lo vendido, utilidad bruta, gastos y utilidad neta, con la comparación contra el mes anterior y el ticket promedio.",
      target: ".kpis",
    },
    {
      titulo: "Cuatro informes",
      texto:
        "Resultados para el cierre, Ventas para ver qué se mueve, Inventario para el valor y las alertas, Finanzas para el efectivo y las cuentas.",
      target: ".tabs",
    },
    {
      titulo: "Saca el reporte",
      texto:
        "CSV baja la pestaña activa en un archivo para Excel; PDF la abre en la vista de impresión, donde eliges imprimir o «Guardar como PDF» para enviarlo por WhatsApp.",
      target: ".no-print",
    },
    {
      titulo: "Aquí no se edita nada",
      texto:
        "Los informes solo leen lo que registraste en Ventas, Inventario y Finanzas. Si una cifra está mal, la corrección se hace en esa pantalla, no acá.",
    },
  ],
};

const AJUSTES: Guia = {
  id: "/app/ajustes",
  pantalla: "Ajustes",
  pasos: [
    {
      titulo: "Se configura una vez",
      texto:
        "Negocio, Perfil, Moneda e impuestos, Recibo, Exportar, Dispositivos, Apariencia, Suscripción y Cuenta. Lo que cambies aquí se refleja en todas las pantallas.",
      target: ".tabs",
    },
    {
      titulo: "Los datos del comercio",
      texto:
        "Nombre, razón social, RIF, teléfono y dirección salen en cada ticket. Ajustes → Negocio tiene una vista previa del recibo para que veas cómo queda antes de guardar.",
      target: ".card",
    },
    {
      titulo: "La tasa del día",
      texto:
        "En «Moneda e impuestos» está la tasa de referencia: de ella depende todo lo que ves en bolívares. «Actualizar desde la API» la trae; «Guardar tasa» deja una fija cuando la API no responde.",
      target: '.tabs [data-tab="Moneda e impuestos"]',
    },
    {
      titulo: "Copia de seguridad",
      texto:
        "En Exportar bajas el resumen general en PDF, todos los reportes en CSV o una copia JSON con toda la información del comercio. Tenla fuera de este equipo.",
      target: '.tabs [data-tab="Exportar"]',
    },
    {
      titulo: "Enciende o apaga esta guía",
      texto:
        "En «Apariencia» está el interruptor del botón «¿Cómo funciona?». Déjalo activado mientras capacitas a un cajero nuevo y apágalo cuando el turno ya se maneje solo: solo afecta a este dispositivo.",
      target: '.tabs [data-tab="Apariencia"]',
    },
  ],
};

const GENERAL: Guia = {
  id: "/app/inicio",
  pantalla: "General",
  pasos: [
    {
      titulo: "El tablero del negocio",
      texto:
        "Es la pantalla de inicio: lo primero que ves al entrar. Resume ventas, capital, lo que está por atender y el cierre del periodo.",
      target: ".page-head",
    },
    {
      titulo: "Cambia el periodo",
      texto:
        "Día, Semana o Mes. Todas las tarjetas se recalculan con el periodo que elijas, así puedes comparar la mañana de hoy contra la de ayer.",
      target: ".tabs",
    },
    {
      titulo: "Por atender",
      texto:
        "Ahí cae lo que necesita acción: cuentas por cobrar vencidas, productos en mínimo y otras deudas del día. Es la lista que conviene revisar antes de abrir la caja.",
      target: '[data-tour="general-por-atender"]',
    },
    {
      titulo: "Para arrancar y Módulos",
      texto:
        "«Para arrancar» es la lista de pendientes del alta: datos del comercio, primer producto, contacto, cuenta de dinero, caja y primera venta. «Módulos» es la puerta a todas las pantallas.",
      target: '[data-tour="general-modulos"]',
    },
  ],
};

const CONCILIACION: Guia = {
  id: "/app/admin/conciliacion",
  pantalla: "Conciliación",
  pasos: [
    {
      titulo: "Solo para la plataforma",
      texto:
        "Esta pantalla la ve el administrador de BLINK POS: aquí se aprueba el pago de activación de cada comercio. Un comercio sin pago conciliado no puede operar el punto de venta.",
      target: ".page-head",
    },
    {
      titulo: "Filtra la bandeja",
      texto:
        "Por revisar, Sin pago, Activos, Rechazados o Todos. Empieza siempre por «Por revisar»: son los reportes esperando conciliación.",
      target: ".tabs",
    },
    {
      titulo: "Aprobar activa 30 días",
      texto:
        "Al aprobar el pago, el comercio queda activo y su vigencia se extiende 30 días desde la fecha de corte. Si estaba vencido, vuelve a operar de inmediato.",
      target: '[data-tour="conciliacion-aprobar"]',
    },
    {
      titulo: "Rechazar da 24 horas",
      texto:
        "Rechazar pide un motivo, se lo muestra al comercio y le deja 24 horas para reportar otro pago. Rechazar no borra la cuenta.",
      target: '[data-tour="conciliacion-rechazar"]',
    },
  ],
};

/**
 * Guia de rescate: cualquier vista dentro de la aplicación que no tenga su
 * propia entrada (una pantalla nueva, una subruta, un id mal escrito).
 * Nunca se queda sin ayuda: tres pasos que siempre aplican.
 */
export const GUIA_GENERICA: Guia = {
  id: "*",
  pantalla: "Esta pantalla",
  pasos: [
    {
      titulo: "Para qué sirve",
      texto:
        "Estás dentro de la aplicación. Arriba a la izquierda está el nombre de tu comercio y la tasa del día; a la derecha, tu cuenta, la caja y los ajustes.",
      target: ".shell__topbar",
    },
    {
      titulo: "Muévete por los módulos",
      texto:
        "En el computador, la barra de la izquierda lleva a cada pantalla. En el teléfono, usa la barra de abajo y el panel «Módulos» de General.",
      target: ".nav",
    },
    {
      titulo: "La ayuda se enciende y se apaga",
      texto:
        "El botón «¿Cómo funciona?» se desactiva en Ajustes → Apariencia, solo en este dispositivo.",
      target: ".shell__topbar .userchip",
    },
  ],
};

/** Registro completo: una guia por ruta, con los alias reales de la app. */
export const GUIAS: Record<string, Guia> = {
  // Panel general: la ruta canónica es /app/inicio; /app/general y
  // /app/inicio/general son alias que responden a la misma pantalla.
  "/app/inicio": GENERAL,
  "/app/general": GENERAL,
  "/app/inicio/general": GENERAL,
  "/app/ventas": VENTAS,
  "/app/ventas/historial": HISTORIAL,
  "/app/catalogo": CATALOGO,
  "/app/inventario": INVENTARIO,
  "/app/contactos": CONTACTOS,
  "/app/finanzas": FINANZAS,
  "/app/creditos": CREDITOS,
  "/app/informes": INFORMES,
  "/app/ajustes": AJUSTES,
  "/app/admin/conciliacion": CONCILIACION,
};

/** Quita la barra final y normaliza vacíos para poder comparar rutas. */
function normalizar(pathname: string): string {
  const sinBarra = pathname.replace(/\/+$/, "");
  return sinBarra || "/";
}

/**
 * Guia para una ruta. Búsqueda exacta → prefijo más largo → genérica.
 * Nunca devuelve null: si mañana aparece una pantalla nueva, sale la guia
 * de rescate en vez de un botón muerto.
 */
export function guiaParaRuta(pathname: string): Guia {
  try {
    const ruta = normalizar(pathname);
    const directa = GUIAS[ruta];
    if (directa) return directa;
    // Prefijo: una subruta desconocida (/app/ventas/notas) comparte la guia
    // de su pantalla madre. Se elige la coincidencia más específica.
    let mejor: Guia | null = null;
    let mejorLargo = 0;
    for (const id of Object.keys(GUIAS)) {
      if (id === "/app/inicio/general") continue; // alias, no prefijo útil
      if (ruta.startsWith(`${id}/`) && id.length > mejorLargo) {
        mejor = GUIAS[id];
        mejorLargo = id.length;
      }
    }
    return mejor ?? GUIA_GENERICA;
  } catch {
    return GUIA_GENERICA;
  }
}

/** Cuántos pasos tiene la guia de una ruta (para el contador "Paso x de y"). */
export function contarPasos(guia: Guia): number {
  return Array.isArray(guia?.pasos) ? guia.pasos.length : 0;
}

/** Todos los ids registrados, ordenados: útil para auditoría y documentación. */
export function listarGuias(): { id: string; pantalla: string; pasos: number }[] {
  const vistos = new Set<Guia>();
  const salida: { id: string; pantalla: string; pasos: number }[] = [];
  for (const id of Object.keys(GUIAS)) {
    const g = GUIAS[id];
    if (vistos.has(g)) continue;
    vistos.add(g);
    salida.push({ id: g.id, pantalla: g.pantalla, pasos: contarPasos(g) });
  }
  salida.push({
    id: GUIA_GENERICA.id,
    pantalla: GUIA_GENERICA.pantalla,
    pasos: contarPasos(GUIA_GENERICA),
  });
  return salida;
}
