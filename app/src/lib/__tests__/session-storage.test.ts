// Pruebas del aislamiento local por usuario (claves y limpieza).
import { describe, expect, it } from "vitest";
import {
  ACTIVE_TAB_KEY,
  DRAFTS_KEY,
  LEGACY_KEYS,
  PENDING_KEY,
  STATE_KEY,
  activeTabKeyFor,
  clearLegacyStorage,
  clearUserStorage,
  draftsKeyFor,
  pendingKeyFor,
  stateKeyFor,
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
