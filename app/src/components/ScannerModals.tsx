// Modales del escáner: vincular el celular (QR) y escanear con la cámara.
import { useEffect, useRef, type ReactNode } from "react";
import { Modal } from "./ui";
import { Icon } from "./Icon";
import { QrCode } from "./QrCode";
import { CameraScanner } from "../lib/scanner/CameraScanner";
import { useScanner } from "../lib/scanner/ScannerProvider";
import { PAIRING_DAYS } from "../lib/scanner/pairing";

/** Estado del teléfono con un punto de la paleta (acento = activo). */
function PhoneState({ active }: { active: boolean }) {
  return (
    <span className="row gap-8" style={{ alignItems: "center" }}>
      <span className={"dot" + (active ? " dot--on" : "")} aria-hidden />
      <span>{active ? "Escáner móvil activo" : "Esperando al celular…"}</span>
    </span>
  );
}

/** Vincula un celular como escáner inalámbrico (QR persistente). */
export function MobileScannerModal({ onClose }: { onClose: () => void }) {
  const { pairing, pairingUrl, remoteActive, connected, ensurePairing, rotatePairing } =
    useScanner();
  const ensureRef = useRef(ensurePairing);
  ensureRef.current = ensurePairing;

  useEffect(() => {
    try {
      ensureRef.current();
    } catch {
      /* sin sesión: no debería ocurrir dentro de la app */
    }
  }, []);

  const expires = pairing?.expiresAt ? new Date(pairing.expiresAt) : null;

  return (
    <Modal title="Celular como escáner" onClose={onClose}>
      <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
        Escanea este código con la cámara del celular. Quedará vinculado{" "}
        {PAIRING_DAYS} días: no tendrás que volver a escanearlo cada mañana.
      </p>

      {pairingUrl ? (
        <div className="scan-pair" style={{ justifyContent: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <QrCode value={pairingUrl} size={208} />
          </div>
          <div className="scan-pair__info stack gap-8">
            <PhoneState active={remoteActive} />
            <span className="dim" style={{ fontSize: "0.8rem" }}>
              {connected ? "Caja conectada al canal." : "Sin conexión con el servidor."}
            </span>
            {expires && (
              <span className="dim" style={{ fontSize: "0.8rem" }}>
                Vence el {expires.toLocaleDateString()}.
              </span>
            )}
            <button
              className="btn btn--soft btn--sm"
              onClick={() => {
                rotatePairing();
              }}
            >
              <Icon name="close" /> Regenerar código
            </button>
          </div>
        </div>
      ) : (
        <p className="muted">Preparando el código…</p>
      )}

      <p className="field__hint" style={{ marginTop: "0.9rem" }}>
        El celular debe poder abrir esta misma dirección. “Regenerar” desvincula los
        teléfonos anteriores.
      </p>
    </Modal>
  );
}

/** Escanea con la cámara del equipo en uso (móvil o webcam). */
export function CameraScannerModal({
  onScan,
  onClose,
  continuous = false,
  hint = "Apunta al código de barras. Si tu navegador no puede decodificar, usa el lector USB o vincula un celular.",
  footer,
}: {
  onScan: (code: string) => void;
  onClose: () => void;
  /**
   * true (caja): la cámara no se cierra al leer y queda pendiente de
   * "Continuar", para escanear varios productos seguidos.
   * false (Catálogo/Inventario): se lee una vez y el modal se cierra.
   */
  continuous?: boolean;
  /** Texto de ayuda bajo la cámara. */
  hint?: string;
  /** Contenido extra bajo la cámara (p. ej. la vista previa del ticket). */
  footer?: ReactNode;
}) {
  return (
    <Modal title="Escanear con cámara" onClose={onClose}>
      <CameraScanner
        onScan={(code) => {
          onScan(code);
          if (!continuous) onClose();
        }}
        continuous={continuous}
      />
      {footer}
      <p className="field__hint" style={{ marginTop: "0.75rem" }}>
        {hint}
      </p>
    </Modal>
  );
}
