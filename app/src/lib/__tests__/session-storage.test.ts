// Pruebas del aislamiento local por usuario (claves, bienvenida y limpieza).
import { describe, expect, it } from "vitest";
import {
  ACTIVE_TAB_KEY,
  BIENVENIDA_KEY,
  DRAFTS_KEY,
  LEGACY_KEYS,
  PENDING_KEY,
  STATE_KEY,
  activeTabKeyFor,
  bienvenidaKeyFor,
  clearLegacyStorage,
  clearUserStorage,
  draftsKeyFor,
  marcarBienvenido,
  pendingKeyFor,
  stateKeyFor,
  yaBienvenido,
} from "../session-storage";

function fakeStorage(): Storage & { removed: string[] } {
  const removed: string[] = [];
  return {
    removed,
    removeItem: (key: string) => {
      removed.push(key);
    },
  } as unknown as Storage & { removed: string[] };
}

describe("claves por usuario", () => {
  it("incluyen el id para no mezclar comercios en el mismo navegador", () => {
    expect(stateKeyFor("u1")).toBe(`${STATE_KEY}:u1`);
    expect(draftsKeyFor("u1")).toBe(`${DRAFTS_KEY}:u1`);
    expect(activeTabKeyFor("u1")).toBe(`${ACTIVE_TAB_KEY}:u1`);
    expect(pendingKeyFor("u1")).toBe(`${PENDING_KEY}:u1`);
    expect(stateKeyFor("u1")).not.toBe(stateKeyFor("u2"));
  });
});

describe("la marca de bienvenida", () => {
  function memoryStorage(): Storage {
    const datos = new Map<string, string>();
    return {
      getItem: (k: string) => datos.get(k) ?? null,
      setItem: (k: string, v: string) => void datos.set(k, v),
      removeItem: (k: string) => void datos.delete(k),
    } as unknown as Storage;
  }

  it("es una clave por cuenta, como el resto del estado local", () => {
    expect(bienvenidaKeyFor("u1")).toBe(`${BIENVENIDA_KEY}:u1`);
    expect(bienvenidaKeyFor("u1")).not.toBe(bienvenidaKeyFor("u2"));
  });

  it("se da una sola vez y no se propaga a la otra cuenta del mismo navegador", () => {
    const storage = memoryStorage();
    expect(yaBienvenido("u1", storage)).toBe(false);
    marcarBienvenido("u1", storage);
    expect(yaBienvenido("u1", storage)).toBe(true);
    expect(yaBienvenido("u2", storage)).toBe(false);
  });

  it("sin id no escribe nada y un almacenamiento bloqueado no rompe el panel", () => {
    const storage = memoryStorage();
    marcarBienvenido("", storage);
    expect(yaBienvenido("", storage)).toBe(false);
    const roto = {
      getItem: () => {
        throw new Error("bloqueado");
      },
      setItem: () => {
        throw new Error("bloqueado");
      },
    } as unknown as Storage;
    expect(() => marcarBienvenido("u1", roto)).not.toThrow();
    expect(yaBienvenido("u1", roto)).toBe(false);
  });
});

describe("clearUserStorage", () => {
  it("borra estado, borradores, pestaña activa y la marca pendiente", () => {
    const storage = fakeStorage();
    clearUserStorage("u1", storage);
    expect(storage.removed).toEqual([
      stateKeyFor("u1"),
      draftsKeyFor("u1"),
      activeTabKeyFor("u1"),
      pendingKeyFor("u1"),
    ]);
  });

  it("sin id no toca el almacenamiento", () => {
    const storage = fakeStorage();
    clearUserStorage("", storage);
    expect(storage.removed).toEqual([]);
  });
});

describe("clearLegacyStorage", () => {
  it("descarta el estado y los borradores de versiones previas", () => {
    const storage = fakeStorage();
    clearLegacyStorage(storage);
    for (const key of [...LEGACY_KEYS, STATE_KEY, DRAFTS_KEY, ACTIVE_TAB_KEY]) {
      expect(storage.removed).toContain(key);
    }
  });

  it("un almacenamiento que falla no rompe el arranque", () => {
    const storage = {
      removeItem: () => {
        throw new Error("bloqueado");
      },
    } as unknown as Storage;
    expect(() => clearLegacyStorage(storage)).not.toThrow();
  });
});
