// Bloque de código del correo, igual en las cuatro pantallas de acceso.
//
// Por qué existe: el enlace del correo solo inicia sesión en el dispositivo
// que lo abre. Si el correo llega al celular y uno trabaja en la PC, el enlace
// no sirve; el código escrito a mano sí, porque lo canjea el servidor.
import { useState } from "react";
import { OtpInput } from "./OtpInput";
import { CODIGO_LARGO, esCodigoValido } from "../lib/otp";

export function CodigoCorreo({
  correo,
  verificar,
  onListo,
  boton = "Usar este código",
  pregunta = "¿Te llegó el correo en otro dispositivo?",
}: {
  /** El correo al que se envió el código; puede venir vacío. */
  correo: string;
  verificar: (email: string, codigo: string) => Promise<string | null>;
  onListo: () => void;
  boton?: string;
  pregunta?: string;
}) {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const listo = esCodigoValido(codigo) && !!correo.trim();

  async function enviar() {
    if (!listo || busy) return;
    setBusy(true);
    setError("");
    const err = await verificar(correo.trim(), codigo);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setCodigo("");
    onListo();
  }

  return (
    <div style={{ marginTop: "1.25rem" }}>
      <p className="muted" style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>
        {pregunta} Escribe los {CODIGO_LARGO} dígitos del código, sin abrir el enlace.
      </p>

      <OtpInput value={codigo} onChange={setCodigo} disabled={busy} autoFocus={false} />

      {error && (
        <p className="field__error" style={{ marginTop: "0.75rem" }}>
          {error}
        </p>
      )}

      <button
        className="btn btn--primary btn--block"
        type="button"
        onClick={enviar}
        disabled={!listo || busy}
        style={{ marginTop: "0.9rem" }}
        title="El código llega en el mismo correo; vence en una hora"
      >
        {busy ? "Comprobando…" : boton}
      </button>
    </div>
  );
}
