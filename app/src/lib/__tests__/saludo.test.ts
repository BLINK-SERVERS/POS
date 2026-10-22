// Pruebas del saludo dinámico de la pantalla principal.
//
// Comprueban las fronteras de las franjas horarias, la madrugada, la
// alternancia de diciembre, los dias obligatorios y la temporada de
// año nuevo, ademas de que la eleccion sea estable dentro del dia.
import { describe, expect, it } from "vitest";
import { saludoDe } from "../saludo";

/** Una fecha concreta en hora local. */
function en(anio: number, mes: number, dia: number, hora = 10, min = 0): Date {
  return new Date(anio, mes - 1, dia, hora, min, 0, 0);
}

const NOMBRE = "Ana";

describe("saludoDe", () => {
  it("usa la franja de la mañana entre las 06:00 y las 11:59", () => {
    for (const hora of [6, 9, 11]) {
      const s = saludoDe(NOMBRE, en(2026, 6, 10, hora));
      expect(s.motivo).toBe("manana");
      expect(s.texto).toMatch(/buenos días|que bueno verte por aquí|hola de nuevo/);
    }
  });

  it("usa la franja de la tarde entre las 12:00 y las 18:59", () => {
    for (const hora of [12, 15, 18]) {
      const s = saludoDe(NOMBRE, en(2026, 6, 10, hora));
      expect(s.motivo).toBe("tarde");
      expect(s.texto).toMatch(/buenas tardes|que bueno verte por aquí|hola de nuevo/);
    }
  });

  it("usa la franja de la noche entre las 19:00 y las 23:59", () => {
    for (const hora of [19, 22, 23]) {
      const s = saludoDe(NOMBRE, en(2026, 6, 10, hora));
      expect(s.motivo).toBe("noche");
      expect(s.texto).toMatch(/buenas noches|que bueno verte por aquí|hola de nuevo/);
    }
  });

  it("la madrugada pisa a la franja de la noche entre las 00:00 y las 05:59", () => {
    // "Condición especial": antes de las 06:00 siempre se saluda el
    // arranque temprano, tambien de madrugada.
    for (const hora of [0, 2, 5]) {
      const s = saludoDe(NOMBRE, en(2026, 6, 10, hora));
      expect(s.motivo).toBe("madrugada");
    }
  });

  it("saluda distinto al de la madrugada antes de las 06:00", () => {
    const s = saludoDe(NOMBRE, en(2026, 6, 10, 5, 30));
    expect(s.motivo).toBe("madrugada");
    expect(s.texto).toBe("Hola, Ana, te levantaste temprano hoy ;)");
  });

  it("elige una variante estable dentro del mismo dia", () => {
    const a = saludoDe(NOMBRE, en(2026, 6, 10, 9));
    const b = saludoDe(NOMBRE, en(2026, 6, 10, 17));
    expect(a.texto).toBe(b.texto);
  });

  it("el nombre del usuario va en el saludo", () => {
    const s = saludoDe(NOMBRE, en(2026, 6, 10, 9));
    expect(s.texto).toContain("Ana");
  });

  it("sin nombre, el saludo no deja un hueco raro", () => {
    const s = saludoDe("", en(2026, 6, 10, 9));
    expect(s.texto).not.toMatch(/,\s*,/);
    expect(s.texto).not.toMatch(/Hola,\s*;/);
    expect(s.texto.length).toBeGreaterThan(5);
  });

  it("del 1 al 10 de enero saluda el año nuevo, sea cual sea la hora", () => {
    for (const dia of [1, 5, 10]) {
      for (const hora of [3, 10, 20]) {
        const s = saludoDe(NOMBRE, en(2027, 1, dia, hora));
        expect(s.motivo).toBe("anio-nuevo");
        expect(s.texto).toBe("Hola, Ana, Feliz Año Nuevo !");
      }
    }
  });

  it("del 11 de enero en adelante vuelven los saludos generales", () => {
    expect(saludoDe(NOMBRE, en(2027, 1, 11, 3)).motivo).toBe("madrugada");
    expect(saludoDe(NOMBRE, en(2027, 1, 11, 10)).motivo).toBe("manana");
  });

  it("los 24, 25 y 31 de diciembre son obligatorios", () => {
    expect(saludoDe(NOMBRE, en(2026, 12, 24, 3)).motivo).toBe("navidad");
    expect(saludoDe(NOMBRE, en(2026, 12, 25, 3)).motivo).toBe("navidad");
    expect(saludoDe(NOMBRE, en(2026, 12, 31, 3)).motivo).toBe("fin-de-anio");
    expect(saludoDe(NOMBRE, en(2026, 12, 24, 3)).texto).toBe("Hola, Ana, Feliz navidad ;)");
  });

  it("en diciembre los dias impares son festivos y los pares, generales", () => {
    expect(saludoDe(NOMBRE, en(2026, 12, 7, 10)).motivo).toBe("diciembre-festivo");
    expect(saludoDe(NOMBRE, en(2026, 12, 8, 10)).motivo).toBe("manana");
    expect(saludoDe(NOMBRE, en(2026, 12, 8, 15)).motivo).toBe("tarde");
  });

  it("diciembre manda sobre la madrugada en los dias festivos", () => {
    // El 7 de diciembre (impar) a las 5 de la mañana: el saludo
    // navideño es obligatorio y pisa al de la madrugada.
    expect(saludoDe(NOMBRE, en(2026, 12, 7, 5)).motivo).toBe("diciembre-festivo");
    // El 8 (par) si recurre a los saludos generales, que a esa hora
    // son los de la madrugada.
    expect(saludoDe(NOMBRE, en(2026, 12, 8, 5)).motivo).toBe("madrugada");
  });

  it("los meses que no son diciembre ni enero no se ven afectados", () => {
    for (const mes of [2, 3, 6, 11]) {
      expect(saludoDe(NOMBRE, en(2026, mes, 15, 10)).motivo).toBe("manana");
    }
  });
});
