// Lector por cámara (móvil o webcam) de alta velocidad.
// Optimizado para apertura instantánea, autoenfoque continuo y baja latencia.
import { useEffect, useRef, useState } from "react";

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

export function CameraScanner({
  onScan,
  className,
}: {
  onScan: (code: string) => void;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CamStatus>("starting");
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  // Tocar para reenfocar manualmente si la cámara lo soporta
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

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported");
        return;
      }

      // Constraints optimizadas para apertura instantánea (720p/1080p sin demoras de sensor)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 },
          },
          audio: false,
        });
      } catch {
        // Fallback rápido si el sensor rechaza constraints avanzadas
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" } },
            audio: false,
          });
        } catch {
          setStatus("denied");
          return;
        }
      }

      streamRef.current = stream;

      // Habilitar enfoque continuo y ajustes automáticos de luz en el sensor
      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          const caps = (typeof track.getCapabilities === "function" ? track.getCapabilities() : {}) as any;
          const adv: any = {};
          if (caps.focusMode && Array.isArray(caps.focusMode) && caps.focusMode.includes("continuous")) {
            adv.focusMode = "continuous";
          }
          if (caps.exposureMode && Array.isArray(caps.exposureMode) && caps.exposureMode.includes("continuous")) {
            adv.exposureMode = "continuous";
          }
          if (caps.whiteBalanceMode && Array.isArray(caps.whiteBalanceMode) && caps.whiteBalanceMode.includes("continuous")) {
            adv.whiteBalanceMode = "continuous";
          }
          if (Object.keys(adv).length > 0 && typeof track.applyConstraints === "function") {
            await track.applyConstraints({ advanced: [adv] });
          }
        } catch {
          /* ignore */
        }
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
      setStatus("running");

      const Ctor = window.BarcodeDetector;
      if (!Ctor) {
        setStatus("no-sensor");
        return;
      }

      let detector: BlinkBarcodeDetector;
      try {
        let formats = PREFERRED_FORMATS;
        if (typeof Ctor.getSupportedFormats === "function") {
          try {
            const supported = await Ctor.getSupportedFormats();
            if (Array.isArray(supported) && supported.length > 0) {
              formats = formats.filter((f) => supported.includes(f));
            }
          } catch {
            /* ignore */
          }
        }
        detector = formats.length ? new Ctor({ formats }) : new Ctor();
      } catch {
        try {
          detector = new Ctor();
        } catch {
          setStatus("no-sensor");
          return;
        }
      }

      // Ciclo de escaneo ultrarrápido (60ms) con bloqueo para no saturar CPU
      const tick = async () => {
        if (stopped) return;
        const el = videoRef.current;
        if (el && el.readyState >= 2 && !isDetecting) {
          isDetecting = true;
          try {
            const found = await detector.detect(el);
            const raw = found[0]?.rawValue?.trim();
            if (raw) {
              const now = Date.now();
              if (raw !== lastCode || now - lastAt > 1200) {
                lastCode = raw;
                lastAt = now;
                if (typeof navigator.vibrate === "function") navigator.vibrate(50);
                onScanRef.current(raw);
              }
            }
          } catch {
            /* fotograma descartado */
          } finally {
            isDetecting = false;
          }
        }
        timer = window.setTimeout(tick, 60);
      };

      void tick();
    }

    void start();

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  return (
    <div
      className={"cam" + (className ? ` ${className}` : "")}
      onClick={triggerFocus}
      title="Toca para reenfocar"
      style={{ cursor: "pointer" }}
    >
      <video ref={videoRef} className="cam__video" playsInline autoPlay muted />
      {status === "running" && (
        <>
          <span className="cam__frame" aria-hidden />
          <span
            className="dim"
            style={{
              position: "absolute",
              bottom: "8px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "0.72rem",
              background: "rgba(0,0,0,0.6)",
              color: "#ffffff",
              padding: "2px 8px",
              borderRadius: "10px",
              pointerEvents: "none",
            }}
          >
            Toca la pantalla para reenfocar
          </span>
        </>
      )}
      {status === "starting" && <p className="cam__note">Iniciando cámara rápidamente…</p>}
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
