// ============================================================
// BLINK POS · Saludo dinámico
// ------------------------------------------------------------
// El saludo de la pantalla principal se adapta al momento del día y
// a la fecha. Las reglas, por orden de prioridad:
//
//   1. Del 1 al 10 de enero: "Hola, [Nombre], Feliz Año Nuevo !"
//      (anula todos los demás saludos).
//   2. Diciembre: los días obligatorios (24, 25 y 31) y, en el resto,
//      un patrón de alternancia: los días impares (1, 3, 5...) llevan
//      un saludo festivo y los pares, los saludos generales.
//   3. Antes de las 06:00: "Hola, [Nombre], te levantaste temprano hoy ;)"
//   4. El resto del año, por franja horaria: mañana, tarde o noche.
//
// La variante dentro de cada grupo se elige con una semilla estable
// (el día del año): el mensaje no cambia cada vez que se repinta la
// pantalla, pero sí va variando de un día a otro.
//
// Convenciones: interfaz en español, sin emoji y con la puntuación
// de la marca (el wink ";)".
// ============================================================

/** Por qué se eligió el saludo (para las pruebas y el QA). */
export type MotivoSaludo =
  | "anio-nuevo"
  | "navidad"
  | "fin-de-anio"
  | "diciembre-festivo"
  | "madrugada"
  | "manana"
  | "tarde"
  | "noche";

export interface Saludo {
  /** El texto, con el nombre ya puesto. */
  texto: string;
  /** La regla que lo decidio. */
  motivo: MotivoSaludo;
}

/** El nombre, o una cadena vacia si el usuario no tiene. */
type Nombre = string;

/** "Hola, Ana, buenos días ;)" o "Hola, buenos días ;)" sin nombre. */
function hola(nombre: Nombre, resto: string): string {
  return nombre ? `Hola, ${nombre}, ${resto}` : `Hola, ${resto}`;
}

/** "Hey!, hola de nuevo Ana" o "Hey!, hola de nuevo" sin nombre. */
function holaDeNuevo(nombre: Nombre): string {
  return nombre ? `Hey!, hola de nuevo ${nombre}` : "Hey!, hola de nuevo";
}

/** Los tres saludos de una franja horaria. */
function deFranja(nombre: Nombre, momento: "buenos días" | "buenas tardes" | "buenas noches"): string[] {
  return [
    hola(nombre, `${momento} ;)`),
    hola(nombre, "que bueno verte por aquí ;)"),
    holaDeNuevo(nombre),
  ];
}

/** Un indice estable a partir de una semilla. */
function elegir(opciones: string[], semilla: number): string {
  const i = Math.abs(Math.floor(semilla)) % opciones.length;
  return opciones[i];
}

/** El dia del ano (1 = 1 de enero). */
function diaDelAnio(d: Date): number {
  const inicio = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d.getTime() - inicio.getTime()) / 86_400_000) + 1;
}

/**
 * El saludo del momento.
 *
 * @param nombre  Nombre del usuario (puede ir vacio).
 * @param ahora   Fecha y hora; por defecto, la del dispositivo.
 */
export function saludoDe(nombre: Nombre, ahora: Date = new Date()): Saludo {
  const mes = ahora.getMonth() + 1;
  const dia = ahora.getDate();
  const hora = ahora.getHours();
  const semilla = diaDelAnio(ahora);

  // 1 · Temporada de año nuevo: del 1 al 10 de enero, siempre igual.
  if (mes === 1 && dia <= 10) {
    return {
      texto: nombre ? `Hola, ${nombre}, Feliz Año Nuevo !` : "Hola, Feliz Año Nuevo !",
      motivo: "anio-nuevo",
    };
  }

  // 2 · Diciembre: dias obligatorios y alternancia en el resto.
  if (mes === 12) {
    if (dia === 24 || dia === 25) {
      return { texto: hola(nombre, "Feliz navidad ;)"), motivo: "navidad" };
    }
    if (dia === 31) {
      return { texto: hola(nombre, "Feliz año nuevo ;)"), motivo: "fin-de-anio" };
    }
    // Dias impares: saludo festivo. Dias pares: los generales.
    if (dia % 2 === 1) {
      const festivos = [hola(nombre, "Feliz navidad ;)"), hola(nombre, "Felices fiestas ;)")];
      return { texto: elegir(festivos, semilla), motivo: "diciembre-festivo" };
    }
  }

  // 3 · Madrugada: apertura temprana.
  if (hora < 6) {
    return { texto: hola(nombre, "te levantaste temprano hoy ;)"), motivo: "madrugada" };
  }

  // 4 · El resto del año, por franja horaria.
  if (hora < 12) {
    return { texto: elegir(deFranja(nombre, "buenos días"), semilla), motivo: "manana" };
  }
  if (hora < 19) {
    return { texto: elegir(deFranja(nombre, "buenas tardes"), semilla), motivo: "tarde" };
  }
  return { texto: elegir(deFranja(nombre, "buenas noches"), semilla), motivo: "noche" };
}

/** Las tres franjas, para las pruebas. */
export const FRANJAS = {
  manana: "buenos días",
  tarde: "buenas tardes",
  noche: "buenas noches",
} as const;
