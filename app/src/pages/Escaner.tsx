// Escáner remoto: el celular lee códigos y los envía a la caja.
//
// Se abre escaneando el QR de la caja, pero el emparejamiento queda guardado
// en el teléfono: al volver a esta dirección no hace falta escanear el QR otra
// vez (ver `lib/scanner/pairing.ts`). No requiere iniciar sesión.
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Icon } from "../components/Icon";
import { CameraScanner } from "../lib/scanner/CameraScanner";
import {
  clearRemotePairing,
  deviceLabel,
  loadRemotePairing,
  saveRemotePairing,
  type Pairing,
} from "../lib/scanner/pairing";

type LinkStatus = "connecting" | "waiting" | "online";
const PONG_TIMEOUT_MS = 25_000;

export function Escaner() {
  const [params] = useSearchParams();
  const [pairing, setPairing] = useState<Pairing | null>(() => loadRemotePairing());
  const [status, setStatus] = useState<LinkStatus>("connecting");
  const [lastCode, setLastCode] = useState("");
  const [sent, setSent] = useState(0);
  const [queued, setQueued] = useState(0);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const onlineRef = useRef(false);
  const lastPongRef = useRef(0);
  const pairingRef = useRef(pairing);
  pairingRef.current = pairing;
  const queuedRef = useRef<string[]>([]);

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
      expiresAt: "",
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
      setLastCode(code);
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
    }, 8_000);

    return () => {
      window.clearInterval(hb);
      channelRef.current = null;
      onlineRef.current = false;
      void supabase.removeChannel(ch);
    };
  }, [pairing?.id, pairing?.token, flush]);

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
          <Icon name="alert" />
          <p>
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

          <CameraScanner onScan={send} className="scan-remote__cam" />

          <div className="scan-remote__foot stack gap-8">
            <div className="between">
              <span className="dim">Último código</span>
              <span className="mono">{lastCode || "—"}</span>
            </div>
            <div className="between">
              <span className="dim">Enviados</span>
              <span className="tabular">
                {sent}
                {queued > 0 ? ` (+${queued} en cola)` : ""}
              </span>
            </div>
            <button
              className="btn btn--soft btn--sm"
              onClick={() => {
                clearRemotePairing();
                setPairing(null);
                setStatus("connecting");
              }}
            >
              <Icon name="close" /> Cambiar de caja
            </button>
          </div>
        </>
      )}
    </div>
  );
}
