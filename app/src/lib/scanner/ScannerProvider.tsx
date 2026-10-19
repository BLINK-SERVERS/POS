// Estado central del escáner: lector USB/Bluetooth (teclado) y escáner
// remoto por celular (Supabase Realtime).
//
// · Lector físico (HID): teclea el código muy rápido y termina con Enter.
//   Se detecta por la velocidad entre teclas y se intercepta para que no
//   escriba dentro de los campos ni dispare el formulario.
// · Celular: la "caja" (host) crea un emparejamiento y muestra un QR. El
//   teléfono envía los códigos por un canal de Realtime; la caja comprueba
//   el secreto antes de aceptarlos.
//
// La página activa registra su manejador con `useScanHandler`. Cuando hay
// varios (p. ej. un modal sobre la página), gana el último registrado.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { useStoreState } from "../store";
import {
  clearHostPairing,
  isExpired,
  loadHostPairing,
  newPairing,
  pairUrl,
  saveHostPairing,
  type Pairing,
} from "./pairing";
import { hidKey, initialHidState } from "./hid";
import { beepOk, primeBeeper } from "../audio";

export type ScanSource = "hardware" | "camera" | "remote";
type ScanHandler = (code: string, source: ScanSource) => void;

interface ScannerContextValue {
  /** Emparejamiento activo de esta caja (o null si no se ha vinculado). */
  pairing: Pairing | null;
  /** URL que va dentro del QR. */
  pairingUrl: string;
  /** El teléfono respondió hace poco (heartbeat). */
  remoteActive: boolean;
  /** El canal de Realtime de la caja está suscrito. */
  connected: boolean;
  ensurePairing: () => Pairing;
  rotatePairing: () => Pairing;
  forgetPairing: () => void;
  /** Envía un código al manejador activo (lo usan cámara y USB). */
  dispatch: (code: string, source?: ScanSource) => void;
  /** Registra el manejador de la vista activa. Devuelve el "desregistro". */
  register: (fn: ScanHandler) => () => void;
  /**
   * Escucha un evento del teléfono remoto (p. ej. "names") en el canal de la
   * caja. El payload ya viene validado con el secreto del emparejamiento.
   * Devuelve la función para dejar de escuchar.
   */
  subscribeRemote: (event: string, fn: (payload: any) => void) => () => void;
  /** Envía un evento al teléfono remoto (p. ej. la lista de nombres). */
  sendToRemote: (event: string, payload: Record<string, unknown>) => void;
}

const ScannerContext = createContext<ScannerContextValue | null>(null);

export function useScanner(): ScannerContextValue {
  const ctx = useContext(ScannerContext);
  if (!ctx) throw new Error("useScanner debe usarse dentro de <ScannerProvider>");
  return ctx;
}

/** La vista activa escucha los escaneos. El manejador se mantiene fresco. */
export function useScanHandler(fn: ScanHandler): void {
  const { register } = useScanner();
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => register((code, source) => ref.current(code, source)), [register]);
}

/** Sin señales del teléfono en este tiempo, se marca "inactivo". */
const REMOTE_TIMEOUT_MS = 20_000;

export function ScannerProvider({ children }: { children: ReactNode }) {
  const { user } = useStoreState();
  const owner = user?.id ?? "";

  const [pairing, setPairing] = useState<Pairing | null>(null);
  const [connected, setConnected] = useState(false);
  const [remoteActive, setRemoteActive] = useState(false);

  const handlersRef = useRef<ScanHandler[]>([]);
  const lastSeenRef = useRef(0);
  const dispatchRef = useRef<(code: string, source?: ScanSource) => void>(() => {});
  const channelRef = useRef<RealtimeChannel | null>(null);
  // Oyentes de eventos del teléfono (p. ej. "names"), por nombre de evento.
  const remoteListenersRef = useRef<Map<string, Set<(payload: any) => void>>>(new Map());

  const register = useCallback((fn: ScanHandler) => {
    handlersRef.current.push(fn);
    return () => {
      handlersRef.current = handlersRef.current.filter((h) => h !== fn);
    };
  }, []);

  const dispatch = useCallback((code: string, source: ScanSource = "hardware") => {
    const clean = code.trim();
    if (!clean) return;
    // Un escaneo recibido (USB, cámara o celular) siempre confirma con un beep.
    beepOk();
    const handler = handlersRef.current[handlersRef.current.length - 1];
    if (handler) handler(clean, source);
  }, []);
  dispatchRef.current = dispatch;

  // ---- Desbloqueo del audio (feedback sonoro) ----------------------
  // Los navegadores exigen un gesto del usuario antes de sonar. Con el primer
  // toque/tecla dejamos el contexto listo para que el beep sea instantáneo.
  useEffect(() => {
    const unlock = () => primeBeeper();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // ---- Lector físico (HID) ----------------------------------------
  useEffect(() => {
    let state = initialHidState();

    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const step = hidKey(state, e.key, Date.now());
      state = step.state;
      if (step.code) {
        // Evita que el Enter del lector envíe formularios o abra diálogos.
        e.preventDefault();
        dispatchRef.current(step.code, "hardware");
      }
    }

    // Fase de captura: interceptamos antes de que el campo reciba la tecla.
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);

  // ---- Emparejamiento de la caja ----------------------------------
  useEffect(() => {
    if (!owner) {
      setPairing(null);
      return;
    }
    const stored = loadHostPairing(owner);
    setPairing(stored && !isExpired(stored) ? stored : null);
  }, [owner]);

  const ensurePairing = useCallback((): Pairing => {
    const current = pairing && !isExpired(pairing) ? pairing : null;
    const p = current ?? newPairing();
    if (owner) saveHostPairing(owner, p);
    setPairing(p);
    return p;
  }, [owner, pairing]);

  const rotatePairing = useCallback((): Pairing => {
    const p = newPairing(pairing?.label);
    if (owner) saveHostPairing(owner, p);
    setPairing(p);
    setRemoteActive(false);
    return p;
  }, [owner, pairing]);

  const forgetPairing = useCallback(() => {
    if (owner) clearHostPairing(owner);
    setPairing(null);
    setRemoteActive(false);
    setConnected(false);
  }, [owner]);

  // ---- Canal de Realtime (caja) -----------------------------------
  const pairingId = pairing?.id ?? "";
  const pairingToken = pairing?.token ?? "";
  useEffect(() => {
    if (!pairingId || !pairingToken) {
      setConnected(false);
      return;
    }
    let channel: RealtimeChannel | null = supabase.channel(`scanner:${pairingId}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel.on("broadcast", { event: "hello" }, (msg) => {
      const payload = msg.payload as { token?: string } | undefined;
      if (payload?.token !== pairingToken) return;
      lastSeenRef.current = Date.now();
      setRemoteActive(true);
      void channel?.send({ type: "broadcast", event: "pong", payload: { token: pairingToken } });
    });

    channel.on("broadcast", { event: "barcode" }, (msg) => {
      const payload = msg.payload as { token?: string; code?: string } | undefined;
      if (payload?.token !== pairingToken || !payload.code) return;
      lastSeenRef.current = Date.now();
      setRemoteActive(true);
      dispatchRef.current(payload.code, "remote");
    });

    // Eventos del teléfono distintos del código (hoy: "names" = pide nombres).
    channel.on("broadcast", { event: "names" }, (msg) => {
      const payload = msg.payload as { token?: string } | undefined;
      if (!payload || payload.token !== pairingToken) return;
      lastSeenRef.current = Date.now();
      setRemoteActive(true);
      remoteListenersRef.current.get("names")?.forEach((fn) => fn(payload));
    });

    channel.subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      const ch = channel;
      channel = null;
      channelRef.current = null;
      if (ch) void supabase.removeChannel(ch);
      setConnected(false);
    };
  }, [pairingId, pairingToken]);

  const subscribeRemote = useCallback((event: string, fn: (payload: any) => void) => {
    let set = remoteListenersRef.current.get(event);
    if (!set) {
      set = new Set();
      remoteListenersRef.current.set(event, set);
    }
    set.add(fn);
    return () => {
      set?.delete(fn);
    };
  }, []);

  const sendToRemote = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      const ch = channelRef.current;
      if (ch) void ch.send({ type: "broadcast", event, payload });
    },
    []
  );

  // Marca al teléfono como inactivo si deja de dar señales.
  useEffect(() => {
    const t = window.setInterval(() => {
      setRemoteActive((prev) => {
        const next = Date.now() - lastSeenRef.current < REMOTE_TIMEOUT_MS;
        return prev === next ? prev : next;
      });
    }, 5_000);
    return () => window.clearInterval(t);
  }, []);

  const pairingUrl = useMemo(() => (pairing ? pairUrl(pairing) : ""), [pairing]);

  const value = useMemo<ScannerContextValue>(
    () => ({
      pairing,
      pairingUrl,
      remoteActive,
      connected,
      ensurePairing,
      rotatePairing,
      forgetPairing,
      dispatch,
      register,
      subscribeRemote,
      sendToRemote,
    }),
    [
      pairing,
      pairingUrl,
      remoteActive,
      connected,
      ensurePairing,
      rotatePairing,
      forgetPairing,
      dispatch,
      register,
      subscribeRemote,
      sendToRemote,
    ]
  );

  return <ScannerContext.Provider value={value}>{children}</ScannerContext.Provider>;
}
