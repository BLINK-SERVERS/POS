// Pruebas del módulo de escáner: detección del lector físico (HID) y
// emparejamiento del celular. Son funciones puras, así que corren en Node.
import { describe, expect, it } from "vitest";
import { HID_KEY_GAP_MS, hidKey, initialHidState } from "../scanner/hid";
import { isExpired, newPairing, pairUrl, PAIRING_DAYS, type Pairing } from "../scanner/pairing";

/** Simula un lector: teclea `code` a intervalos cortos y pulsa Enter. */
function typeScan(code: string, startAt = 1000, gap = 10): string | null {
  let state = initialHidState();
  let at = startAt;
  let result: string | null = null;
  for (const ch of code) {
    const step = hidKey(state, ch, at);
    state = step.state;
    at += gap;
  }
  const enter = hidKey(state, "Enter", at);
  result = enter.code;
  return result;
}

describe("lector físico (HID)", () => {
  it("reconoce un código rápido terminado en Enter", () => {
    expect(typeScan("7591234567890")).toBe("7591234567890");
  });

  it("también acepta Tab como fin de lectura", () => {
    let state = initialHidState();
    let at = 0;
    for (const ch of "ABC12345") {
      state = hidKey(state, ch, at).state;
      at += 10;
    }
    expect(hidKey(state, "Tab", state.lastAt + 10).code).toBe("ABC12345");
  });

  it("descarta escritura humana (huecos largos entre teclas)", () => {
    let state = initialHidState();
    let at = 1000;
    for (const ch of "759123") {
      const step = hidKey(state, ch, at);
      state = step.state;
      at += HID_KEY_GAP_MS + 200; // demasiado lento: parece una persona
    }
    expect(hidKey(state, "Enter", at).code).toBeNull();
  });

  it("ignora códigos demasiado cortos", () => {
    expect(typeScan("123")).toBeNull();
  });

  it("normaliza espacios del buffer al completar", () => {
    expect(typeScan("  7591 23  ")).toBe("7591 23");
  });
});

describe("emparejamiento del celular", () => {
  it("genera un id público y un secreto distintos", () => {
    const a = newPairing();
    const b = newPairing();
    expect(a.id).toMatch(/^p_[0-9a-f]{16}$/);
    expect(a.token).toMatch(/^[0-9a-f]{32}$/);
    expect(a.id).not.toBe(b.id);
    expect(a.token).not.toBe(b.token);
  });

  it("vence dentro de PAIRING_DAYS", () => {
    const p = newPairing();
    const days = (Date.parse(p.expiresAt) - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(PAIRING_DAYS - 1);
    expect(days).toBeLessThan(PAIRING_DAYS + 0.01);
  });

  it("marca vencido solo si la fecha ya pasó", () => {
    const base: Pairing = { ...newPairing(), expiresAt: "" };
    expect(isExpired(base)).toBe(false); // sin caducidad (el teléfono)
    expect(isExpired({ ...base, expiresAt: "2000-01-01T00:00:00.000Z" })).toBe(true);
    expect(isExpired({ ...base, expiresAt: "2999-01-01T00:00:00.000Z" })).toBe(false);
  });

  it("arma la URL del QR respetando la base del despliegue", () => {
    const p: Pairing = { ...newPairing(), id: "p_abc", token: "deadbeef" };
    expect(pairUrl(p, "https://ejemplo.com/POS/")).toBe(
      "https://ejemplo.com/POS/escaner?p=p_abc&t=deadbeef"
    );
  });
});
