// Lector por cámara (móvil o webcam) de alta velocidad.
// Apertura instantánea, autoenfoque continuo y baja latencia.
//
// Importante para la caja: al leer un código la cámara NO se cierra. El cajero
// puede pasar varios productos seguidos y el escáner solo se pausa un instante
// (durante ese tiempo el padre muestra la lectura y un botón "Continuar").
import { useEffect, useRef, useState } from "react";
import { Icon } from "../../components/Icon";
import { beepOk, primeBeeper } from "../audio";

type CamStatus = "starting" | "running" | "no-sensor" | "denied" | "unsupported";

const PREFERRED_FORMATS = [
  "ean_13",
  "ean_8",
  "code_128",
  "code_39",
  "upc_a",
  "upc_e",
  "qr_code",
  "data_matrix",
];

/** Tras leer un código, la pasada se pausa este tiempo (una lectura por producto). */
const PAUSE_MS = 1000;

/** Botón para reanudar la lectura tras capturar un producto. */
function ContinueButton({ label, onClick, block }: { label: string; onClick: () => void; block?: boolean }) {
  return (
    <button
      type="button"
      className={"btn btn--primary btn--sm" + (block ? " btn--block" : "")}
      onClick={onClick}
    >
      <Icon name="scan" /> {label}
    </button>
  );
}

export function CameraScanner({
  onScan,
  className,
  continuous = false,
  continueLabel = "Continuar",
}: {
  onScan: (code: string) => void;
  className?: string;
  /**
   * true: tras leer un código la cámara sigue encendida y queda pendiente de
   * "Continuar" (flujo de la caja, varios productos seguidos). La lectura se
   * reanuda solo con el botón.
   * false (por defecto): se puede seguir escaneando después de un breve
   * intervalo; pensado para usos de una sola lectura (alta desde Catálogo o
   * Inventario, donde el modal se cierra al leer).
   */
  continuous?: boolean;
  /** Texto del botón que reanuda la lectura (solo en modo continuo). */
  continueLabel?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CamStatus>("starting");
  // true = esperando a que el cajero pulse "Continuar".
  const [paused, setPaused] = useState(false);

  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const continuousRef = useRef(continuous);
  continuousRef.current = continuous;

  // Control de la pausa sin re-suscribir el efecto principal.
  const pausedRef = useRef(false);
  const resumeRef = useRef<(ms?: number) => void>(() => {});

  // Desbloquea el audio en el primer gesto sobre la cámara (al tocar para
  // reenfocar), para que el beep de la lectura suene desde el primer código.
  useEffect(() => {
    const unlock = () => primeBeeper();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  // Reenfoca manualmente si la cámara lo soporta.
  const triggerFocus = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track || typeof track.applyConstraints !== "function") return;
    try {
      const caps = (typeof track.getCapabilities === "function" ? track.getCapabilities() : {}) as any;
      if (caps.focusMode && Array.isArray(caps.focusMode) && caps.focusMode.includes("continuous")) {
        await track.applyConstraints({ advanced: [{ focusMode: "continuous" }] } as any);
      }
    } catch {
      /* sensor no soporta refocus */
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer = 0;
    let stopped = false;
    let isDetecting = false;
    let lastCode = "";
    let lastAt = 0;
    // El detector se prepara en paralelo con la cámara: así la imagen aparece
    // en cuanto el sensor entrega el primer fotograma, sin esperar al modelo.
    let det: BlinkBarcodeDetector | null = null;

    if (typeof window.BarcodeDetector !== "function") {
      setStatus("no-sensor");
      return;
    }
    const Ctor = window.BarcodeDetector;

    const prepDetector = (async (): Promise<void> => {
      let formats = PREFERRED_FORMATS;
      try {
        if (typeof Ctor.getSupportedFormats === "function") {
          const supported = await Ctor.getSupportedFormats();
          if (Array.isArray(supported) && supported.length > 0) {
            formats = formats.filter((f) => supported.includes(f));
          }
        }
      } catch {
        /* usa la lista por defecto */
      }
      try {
        det = formats.length ? new Ctor({ formats }) : new Ctor();
      } catch {
        try {
          det = new Ctor();
        } catch {
          det = null;
        }
      }
    })();

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported");
        return;
      }

      // Constraints mínimas para que el sensor abra cuanto antes.
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch {
        setStatus("denied");
        return;
      }

      streamRef.current = stream;

      // Ajustes de sensor en segundo plano: no bloquean la aparición del video.
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.applyConstraints === "function") {
        void (async () => {
          try {
            const caps = (typeof track.getCapabilities === "function" ? track.getCapabilities() : {}) as any;
            const adv: any = {};
            if (caps.focusMode && Array.isArray(caps.focusMode) && caps.focusMode.includes("continuous")) {
              adv.focusMode = "continuous";
            }
            if (caps.exposureMode && Array.isArray(caps.exposureMode) && caps.exposureMode.includes("continuous")) {
              adv.exposureMode = "continuous";
            }
            if (
              caps.whiteBalanceMode &&
              Array.isArray(caps.whiteBalanceMode) &&
              caps.whiteBalanceMode.includes("continuous")
            ) {
              adv.whiteBalanceMode = "continuous";
            }
            if (Object.keys(adv).length > 0) await track.applyConstraints({ advanced: [adv] });
          } catch {
            /* el sensor no acepta ajustes */
          }
        })();
      }

      const video = videoRef.current;
      if (!video || stopped) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        /* algunos navegadores esperan interacción del usuario */
      }
      if (stopped) return;
      // En cuanto hay imagen ya ponemos "running"; el detector suele estar listo
      // en paralelo, así que la lectura empieza de inmediato.
      setStatus("running");

      // Pausa/reanudación: en modo continuo la lectura se frena tras cada código
      // y NO se reanuda sola (espera al botón "Continuar").
      resumeRef.current = (ms = PAUSE_MS) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          pausedRef.current = false;
          setPaused(false);
          void tick();
        }, ms);
      };

      // Ciclo de escaneo (55 ms) con bloqueo para no saturar el CPU.
      const tick = async () => {
        if (stopped || pausedRef.current) return;
        const el = videoRef.current;
        if (el && el.readyState >= 2 && det && !isDetecting) {
          isDetecting = true;
          try {
            const found = await det.detect(el);
            const raw = found[0]?.rawValue?.trim();
            if (raw && !pausedRef.current) {
              const now = Date.now();
              if (raw !== lastCode || now - lastAt > 1200) {
                lastCode = raw;
                lastAt = now;
                if (typeof navigator.vibrate === "function") navigator.vibrate(50);
                // La cámara no pasa por el ScannerProvider, así que confirma aquí.
                beepOk();
                onScanRef.current(raw);
                if (continuousRef.current) {
                  // Varios productos seguidos: se pausa hasta "Continuar".
                  pausedRef.current = true;
                  setPaused(true);
                } else {
                  resumeRef.current(PAUSE_MS);
                }
              }
            }
          } catch {
            /* fotograma descartado */
          } finally {
            isDetecting = false;
          }
        }
        timer = window.setTimeout(tick, 55);
      };

      await prepDetector;
      if (stopped) return;
      if (!det) {
        setStatus("no-sensor");
        return;
      }
      void tick();
    }

    void start();

    return () => {
      stopped = true;
      pausedRef.current = false;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const resume = () => {
    pausedRef.current = false;
    setPaused(false);
    resumeRef.current(0);
  };

  return (
    <div
      className={"cam" + (className ? ` ${className}` : "")}
      onClick={triggerFocus}
      title="Toca para reenfocar"
      style={{ cursor: "pointer" }}
    >
      <video ref={videoRef} className="cam__video" playsInline autoPlay muted />
      {status === "running" && <span className="cam__frame" aria-hidden />}

      {paused && (
        <div className="cam__paused">
          <ContinueButton label={continueLabel} onClick={resume} block />
        </div>
      )}

      {status === "denied" && (
        <p className="cam__note">
          No se pudo abrir la cámara. Da permiso al navegador o usa el lector USB.
        </p>
      )}
      {status === "unsupported" && (
        <p className="cam__note">
          Este navegador no permite abrir la cámara. Usa el lector USB o el celular remoto.
        </p>
      )}
      {status === "no-sensor" && (
        <p className="cam__note">
          Este navegador no puede decodificar códigos con la cámara. Usa el lector USB o el
          celular remoto.
        </p>
      )}
    </div>
  );
}
