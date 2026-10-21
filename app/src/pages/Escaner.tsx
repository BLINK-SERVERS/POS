// Escáner remoto: el celular lee códigos y los envía a la caja.
//
// Se abre escaneando el QR de la caja, pero el emparejamiento queda guardado
// en el teléfono: al volver a esta dirección no hace falta escanear el QR otra
// vez (ver `lib/scanner/pairing.ts`). No requiere iniciar sesión.
//
// Además de enviar los códigos, el teléfono lleva su propia lista de lo leído
// (nombre, precio y cantidad) con el subtotal y una vista previa del ticket,
// para que el cajero no tenga que mirar la pantalla del mostrador.
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Icon } from "../components/Icon";
import { CameraScanner } from "../lib/scanner/CameraScanner";
import { formatUsd, round2 } from "../lib/money";
import {
  clearRemotePairing,
  deviceLabel,
  loadRemotePairing,
  saveRemotePairing,
  type Pairing,
} from "../lib/scanner/pairing";

type LinkStatus = "connecting" | "waiting" | "online";

/** Línea de la lista local del teléfono. */
interface RemoteLine {
  code: string;
  name: string;
  price: number;
  qty: number;
}

/** ¿Cuándo un código se parece a un número de código de barras? */
function looksLikeBarcode(code: string): boolean {
  return /^\d{8,14}$/.test(code.trim());
}

/** Precio de reserva para códigos que no son códigos de barras (SKU/QR). */
const QR_FALLBACK_PRICE = 0.01;

const PONG_TIMEOUT_MS = 25_000;

export function Escaner() {
  const [params] = useSearchParams();
  const [pairing, setPairing] = useState<Pairing | null>(() => loadRemotePairing());
  const [status, setStatus] = useState<LinkStatus>("connecting");
  const [lines, setLines] = useState<RemoteLine[]>([]);
  const [sent, setSent] = useState(0);
  const [queued, setQueued] = useState(0);
  const [showTicket, setShowTicket] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const onlineRef = useRef(false);
  const lastPongRef = useRef(0);
  const pairingRef = useRef(pairing);
  pairingRef.current = pairing;
  const linesRef = useRef<RemoteLine[]>([]);
  linesRef.current = lines;
  const queuedRef = useRef<string[]>([]);
  // Códigos presentes en la cuenta de la caja: evita el "fantasma" de una línea
  // local cuando el producto no existe en el catálogo de la caja.
  const knownRef = useRef<Set<string>>(new Set());
  const lastRequestRef = useRef(0);

  // 1) Guarda el emparejamiento que llega en el QR y limpia la dirección.
  useEffect(() => {
    const p = params.get("p");
    const t = params.get("t");
    if (!p || !t) return;
    const np: Pairing = {
      id: p,
      token: t,
      label: deviceLabel(),
      createdAt: new Date().toISOString(),
      expiresAt: "", // el teléfono no caduca; la caja decide con su emparejamiento
    };
    saveRemotePairing(np);
    setPairing(np);
    try {
      window.history.replaceState({}, "", window.location.pathname + window.location.hash);
    } catch {
      /* noop */
    }
  }, [params]);

  const flush = useCallback(() => {
    const p = pairingRef.current;
    const ch = channelRef.current;
    if (!p || !ch || !onlineRef.current) return;
    const items = queuedRef.current;
    queuedRef.current = [];
    for (const code of items) {
      void ch.send({ type: "broadcast", event: "barcode", payload: { token: p.token, code } });
    }
    if (items.length) {
      setQueued(0);
      setSent((n) => n + items.length);
    }
  }, []);

  const send = useCallback(
    (code: string) => {
      const p = pairingRef.current;
      if (!p) return;
      // Lista local: agrupa por código y va contando cantidades.
      setLines((prev) => {
        const i = prev.findIndex((l) => l.code === code);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], qty: next[i].qty + 1 };
          return next;
        }
        // Mientras la caja no nos diga el nombre, mostramos el código; si no es
        // un código de barras (SKU/QR) no arriesgamos un precio que descuadre.
        const known = knownRef.current.has(code);
        const price = known || looksLikeBarcode(code) ? QR_FALLBACK_PRICE : 0;
        return [...prev, { code, name: code, price, qty: 1 }];
      });
      const ch = channelRef.current;
      if (!ch || !onlineRef.current) {
        queuedRef.current.push(code);
        setQueued(queuedRef.current.length);
        return;
      }
      void ch.send({ type: "broadcast", event: "barcode", payload: { token: p.token, code } });
      setSent((n) => n + 1);
    },
    []
  );

  // Pide a la caja los nombres/precios de lo leído (una vez, cuando hay canal).
  // Lee `lines` de un ref para NO depender de su longitud: de lo contrario el
  // canal de Realtime se reconstruiría en cada escaneo y podría perder mensajes.
  const requestNames = useCallback(() => {
    const p = pairingRef.current;
    const ch = channelRef.current;
    if (!p || !ch || !onlineRef.current) return;
    const codes = Array.from(new Set(linesRef.current.map((l) => l.code)));
    if (!codes.length) return;
    lastRequestRef.current = Date.now();
    void ch.send({ type: "broadcast", event: "names", payload: { token: p.token, codes } });
  }, []);

  useEffect(() => {
    if (status === "online") requestNames();
  }, [status, requestNames]);

  // 2) Canal con la caja (Realtime, transmisión por difusión).
  useEffect(() => {
    if (!pairing?.id || !pairing.token) return;
    const p = pairing;
    const ch = supabase.channel(`scanner:${p.id}`, { config: { broadcast: { self: false } } });
    channelRef.current = ch;

    ch.on("broadcast", { event: "pong" }, (msg) => {
      const payload = msg.payload as { token?: string } | undefined;
      if (payload?.token !== p.token) return;
      onlineRef.current = true;
      lastPongRef.current = Date.now();
      setStatus("online");
      flush();
    });

    // La caja responde con el catálogo de los códigos leídos.
    ch.on("broadcast", { event: "names" }, (msg) => {
      const payload = msg.payload as
        | { token?: string; items?: Array<{ code: string; name: string; price: number }> }
        | undefined;
      if (payload?.token !== p.token || !Array.isArray(payload.items)) return;
      const map = new Map(payload.items.map((it) => [it.code, it]));
      for (const code of map.keys()) knownRef.current.add(code);
      setLines((prev) =>
        prev.map((l) => {
          const it = map.get(l.code);
          return it ? { ...l, name: it.name, price: it.price } : l;
        })
      );
    });

    ch.subscribe((s) => {
      if (s === "SUBSCRIBED") {
        setStatus((cur) => (cur === "online" ? cur : "waiting"));
        void ch.send({
          type: "broadcast",
          event: "hello",
          payload: { token: p.token, label: deviceLabel() },
        });
      } else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT" || s === "CLOSED") {
        onlineRef.current = false;
        setStatus("connecting");
      }
    });

    const hb = window.setInterval(() => {
      void ch.send({
        type: "broadcast",
        event: "hello",
        payload: { token: p.token, label: deviceLabel() },
      });
      // Si pasó mucho desde la última consulta y hay líneas, reintenta nombrarlas.
      if (linesRef.current.length && Date.now() - lastRequestRef.current > 12_000) requestNames();
    }, 8_000);

    return () => {
      window.clearInterval(hb);
      channelRef.current = null;
      onlineRef.current = false;
      void supabase.removeChannel(ch);
    };
  }, [pairing?.id, pairing?.token, flush, requestNames]);

  // 3) Si la caja deja de responder, se marca "esperando".
  useEffect(() => {
    const t = window.setInterval(() => {
      if (onlineRef.current && Date.now() - lastPongRef.current > PONG_TIMEOUT_MS) {
        onlineRef.current = false;
        setStatus("waiting");
      }
    }, 5_000);
    return () => window.clearInterval(t);
  }, []);

  // 4) Al desbloquear el teléfono, saluda de nuevo (despierta el canal).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const p = pairingRef.current;
      const ch = channelRef.current;
      if (p && ch) {
        void ch.send({
          type: "broadcast",
          event: "hello",
          payload: { token: p.token, label: deviceLabel() },
        });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const items = lines.reduce((a, l) => a + l.qty, 0);
  const subtotal = round2(lines.reduce((a, l) => a + l.price * l.qty, 0));
  const tone = status === "online" ? " online" : status === "waiting" ? " waiting" : "";

  return (
    <div className="scan-remote">
      <header className="scan-remote__head">
        <span className="brand">
          <span className="brand__blink">BLINK</span>
          <span className="brand__pos">POS</span>
        </span>
        <span className="dim" style={{ fontSize: "0.8rem" }}>
          Escáner
        </span>
      </header>

      {!pairing ? (
        <div className="scan-remote__empty">
          <span className="empty__icon" aria-hidden>
            <Icon name="alert" />
          </span>
          <div className="empty__title">Caja no vinculada</div>
          <p className="empty__hint">
            Este teléfono no está vinculado a ninguna caja. Abre el QR desde la caja
            (Ajustes › Dispositivos) y escanéalo con la cámara.
          </p>
        </div>
      ) : (
        <>
          <div className={"scan-pill" + tone}>
            <span className="dot" aria-hidden />
            {status === "online"
              ? "Conectado a la caja"
              : status === "waiting"
                ? "Esperando a la caja…"
                : "Conectando…"}
          </div>

          <CameraScanner onScan={send} className="scan-remote__cam" continuous />

          <section className="scan-cart" aria-label="Productos escaneados">
            <div className="scan-cart__row">
              <strong>Productos escaneados</strong>
              <span className="dim tabular">
                {items} art. · {sent} enviado{sent === 1 ? "" : "s"}
                {queued > 0 ? ` (+${queued} en cola)` : ""}
              </span>
            </div>
            {lines.length === 0 ? (
              <p className="muted" style={{ fontSize: "var(--fs-sm)", padding: "0.35rem 0" }}>
                Aún no has escaneado nada. Cada lectura se suma aquí.
              </p>
            ) : (
              <>
                {lines.map((l) => (
                  <div key={l.code} className="scan-cart__row">
                    <span className="scan-cart__line">
                      <span>{l.name}</span>
                      {l.qty > 1 && <span className="scan-cart__qty">×{l.qty}</span>}
                    </span>
                    <span className="tabular">{formatUsd(round2(l.price * l.qty))}</span>
                  </div>
                ))}
                <div className="scan-cart__row">
                  <span className="scan-cart__total">Subtotal</span>
                  <span className="tabular scan-cart__total">{formatUsd(subtotal)}</span>
                </div>
                <button className="btn btn--soft btn--sm btn--block" onClick={() => setShowTicket(true)}>
                  <Icon name="receipt" /> Vista previa del ticket
                </button>
              </>
            )}
          </section>

          <div className="scan-remote__foot stack gap-8">
            <button
              className="btn btn--soft btn--sm"
              onClick={() => {
                clearRemotePairing();
                setPairing(null);
                setStatus("connecting");
                setLines([]);
              }}
            >
              <Icon name="close" /> Cambiar de caja
            </button>
          </div>

          {showTicket && (
            <div className="scan-ticket" onClick={() => setShowTicket(false)}>
              <div className="scan-ticket__card" onClick={(e) => e.stopPropagation()}>
                <div className="receipt">
                  <div style={{ fontWeight: 700, textAlign: "center" }}>VISTA PREVIA</div>
                  <div className="dim" style={{ textAlign: "center", fontSize: "0.75rem" }}>
                    Aún no es una venta
                  </div>
                  <div style={{ marginTop: "0.75rem" }}>
                    {lines.map((l) => (
                      <div key={l.code} className="between" style={{ fontSize: "0.82rem" }}>
                        <span>
                          {l.qty} × {l.name}
                        </span>
                        <span className="tabular">{formatUsd(round2(l.price * l.qty))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="between" style={{ marginTop: "0.6rem", fontWeight: 700 }}>
                    <span>Subtotal</span>
                    <span className="tabular">{formatUsd(subtotal)}</span>
                  </div>
                  <p className="dim" style={{ fontSize: "0.72rem", marginTop: "0.6rem" }}>
                    El total final (IVA, descuentos) se calcula en la caja.
                  </p>
                </div>
                <button className="btn btn--soft btn--block" onClick={() => setShowTicket(false)}>
                  <Icon name="close" /> Cerrar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
