// Pruebas del género deducible del nombre de pila.
//
// Lo que se asegura aquí es la promesa de la bienvenida: decirlo bien cuando el
// nombre lo permite y NO decirlo cuando no. Un «Bienvenido Ana» dicho a una
// mujer es peor que un saludo neutro, así que las excepciones están escritas
// nombre por nombre y los casos dudosos caen en `sin_dato`.
import { describe, expect, it } from "vitest";
import { generoDesdeNombre, terminoBienvenida } from "../genero";

describe("generoDesdeNombre", () => {
  it("lee el marcador en la vocal final", () => {
    for (const nombre of ["Ana", "María", "Lucía", "Paola"]) {
      expect(generoDesdeNombre(nombre)).toBe("femenino");
    }
    for (const nombre of ["Luis", "Pedro", "Jorge", "Andrés", "Juan"]) {
      expect(generoDesdeNombre(nombre)).toBe("masculino");
    }
  });

  it("conoce las femeninas que terminan en consonante", () => {
    for (const nombre of ["Carmen", "Soledad", "Pilar", "Luz", "Isabel", "Dolores", "Mercedes", "Belén"]) {
      expect(generoDesdeNombre(nombre)).toBe("femenino");
    }
  });

  it("conoce las femeninas que terminan en -o", () => {
    expect(generoDesdeNombre("Consuelo")).toBe("femenino");
    expect(generoDesdeNombre("Rosario")).toBe("femenino");
  });

  it("no adivina los nombres mezclados", () => {
    for (const nombre of ["Andrea", "Alex", "Guadalupe", "Cruz"]) {
      expect(generoDesdeNombre(nombre)).toBe("sin_dato");
    }
  });

  it("no adivina cuando la terminación -e, -i o -u no decide", () => {
    expect(generoDesdeNombre("Vicente")).toBe("masculino"); // lo dice la lista
    expect(generoDesdeNombre("Marlene")).toBe("femenino"); // lo dice la lista
    expect(generoDesdeNombre("Chayane")).toBe("sin_dato"); // y sin lista, no
    expect(generoDesdeNombre("Bernabú")).toBe("sin_dato");
  });

  it("no resuelve los compuestos por su primera parte", () => {
    expect(generoDesdeNombre("María José")).toBe("sin_dato");
    expect(generoDesdeNombre("José Luis")).toBe("sin_dato");
  });

  it("ignora mayúsculas, espacios sobrantes y tildes", () => {
    expect(generoDesdeNombre("  ANA  ")).toBe("femenino");
    expect(generoDesdeNombre("jose luis")).toBe("sin_dato");
  });

  it("sin nombre no hay género posible", () => {
    for (const nombre of ["", "   ", "12"]) {
      expect(generoDesdeNombre(nombre)).toBe("sin_dato");
    }
  });
});

describe("terminoBienvenida", () => {
  it("pone la palabra solo cuando hay género seguro", () => {
    expect(terminoBienvenida("masculino")).toBe("bienvenido");
    expect(terminoBienvenida("femenino")).toBe("bienvenida");
    expect(terminoBienvenida("sin_dato")).toBeNull();
  });
});
