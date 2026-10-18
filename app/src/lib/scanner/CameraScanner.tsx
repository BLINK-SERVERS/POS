// Lector por cámara (móvil o webcam). Usa la API nativa `BarcodeDetector`
// cuando está disponible; si no, deja ver la cámara pero avisa que este
// navegador no puede decodificar (el lector USB y el celular remoto siguen
// funcionando). No añade dependencias.
import { useEffect, useRef, useState } from "react";

type CamStatus = "starting" | "running" | "no-sensor" | "denied" | "unsupported";

export function CameraScanner({
  onScan,
  className,
}: {
  onScan: (code: string) => void;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<CamStatus>("starting");
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer = 0;
    let stopped = false;
    let lastCode = "";
    let lastAt = 0;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch {
        setStatus("denied");
        return;
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
        /* algunos navegadores exigen gesto: el usuario ya pulsó "cámara" */
      }
      setStatus("running");

      const Ctor = window.BarcodeDetector;
      if (!Ctor) {
        setStatus("no-sensor");
        return;
      }
      let detector: BlinkBarcodeDetector;
      try {
        detector = new Ctor();
      } catch {
        setStatus("no-sensor");
        return;
      }
      const tick = async () => {
        if (stopped) return;
        const el = videoRef.current;
        if (el && el.readyState >= 2) {
          try {
            const found = await detector.detect(el);
            const raw = found[0]?.rawValue?.trim();
            if (raw) {
              const now = Date.now();
              if (raw !== lastCode || now - lastAt > 1500) {
                lastCode = raw;
                lastAt = now;
                if (typeof navigator.vibrate === "function") navigator.vibrate(40);
                onScanRef.current(raw);
              }
            }
          } catch {
            /* fotograma ilegible: se reintenta al siguiente */
          }
        }
        timer = window.setTimeout(tick, 220);
      };
      void tick();
    }

    void start();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className={"cam" + (className ? ` ${className}` : "")}>
      <video ref={videoRef} className="cam__video" playsInline muted />
      {status === "running" && <span className="cam__frame" aria-hidden />}
      {status === "starting" && <p className="cam__note">Iniciando cámara…</p>}
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
