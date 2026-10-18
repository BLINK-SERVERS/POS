// Pantalla de acceso (Supabase Auth).
//
// Dos pasos: correo + contraseña y, si el equipo NO es de confianza, un código
// de 6 dígitos enviado al correo. Al marcar «Confiar en este dispositivo» no
// se vuelve a pedir el código en este equipo.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth, useDeviceVerified, useSessionUser, useStoreActions } from "../lib/store";
import { Field } from "../components/ui";
import { Icon } from "../components/Icon";
import { OtpInput } from "../components/OtpInput";

export function Login() {
  const { login, sendDeviceCode, verifyDevice, logout } = useStoreActions();
  const authed = useAuth();
  const verified = useDeviceVerified();
  const user = useSessionUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [trust, setTrust] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  // Hay sesión pero el equipo aún no está verificado → pedimos el código.
  const needsCode = authed && !verified;
  const codeEmail = user?.email ?? email.trim();

  useEffect(() => {
    if (cooldown <= 0) return;
    timer.current = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer.current);
  }, [cooldown]);

  async function onSubmitCredenciales(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Escribe un correo electrónico válido.");
      return;
    }
    if (!password) {
      setError("Escribe tu contraseña.");
      return;
    }
    setBusy(true);
    const err = await login(email, password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    // Si el equipo no era de confianza, el store ya envió el código.
    setCooldown(45);
  }

  async function onSubmitCodigo(e: FormEvent) {
    e.preventDefault();
    if (code.length < 6) return;
    setBusy(true);
    setError("");
    const err = await verifyDevice(codeEmail, code, trust);
    setBusy(false);
    if (err) setError(err);
  }

  async function reenviar() {
    if (cooldown > 0) return;
    setBusy(true);
    setError("");
    const err = await sendDeviceCode(codeEmail);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setCode("");
    setCooldown(45);
  }

  async function usarOtraCuenta() {
    await logout();
    setCode("");
    setPassword("");
    setTrust(false);
    setCooldown(0);
    setError("");
  }

  return (
    <main className="auth">
      <div className="auth__pitch">
        <span className="blink-pos-title">
          <span className="blink">BLINK</span>
          <span className="pos">POS</span>
        </span>
        <h2>Tu punto de venta, rápido y claro.</h2>
        <p style={{ maxWidth: "34ch", fontSize: "1.2rem", fontWeight: 600 }}>
          Vende, cobra en dólares y bolívares, y controla tu inventario desde un solo lugar.
        </p>
      </div>

      <div className="auth__panel">
        <div className="auth__card">
          {needsCode ? (
            <form onSubmit={onSubmitCodigo}>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={usarOtraCuenta}
                style={{ marginBottom: "0.75rem" }}
              >
                ← Usar otra cuenta
              </button>
              <h1>Verifica este dispositivo</h1>
              <p className="muted" style={{ marginBottom: "1.25rem" }}>
                Por seguridad enviamos un correo a <strong>{codeEmail}</strong>. Abre el enlace o
                escribe el código de 6 dígitos.
              </p>

              <OtpInput value={code} onChange={setCode} disabled={busy} />

              {error && (
                <p className="field__error" style={{ marginTop: "0.75rem" }}>
                  {error}
                </p>
              )}

              <label className="row gap-8 auth__trust" style={{ marginTop: "0.75rem" }}>
                <input type="checkbox" checked={trust} onChange={(e) => setTrust(e.target.checked)} />
                <span>Confiar en este dispositivo (no volver a pedir el código aquí)</span>
              </label>

              <button
                className="btn btn--primary btn--block"
                type="submit"
                style={{ marginTop: "1rem" }}
                disabled={busy || code.length < 6}
              >
                {busy ? "Verificando…" : "Verificar y entrar"}
              </button>

              <button
                type="button"
                className="btn btn--ghost btn--block"
                style={{ marginTop: "0.5rem" }}
                onClick={reenviar}
                disabled={busy || cooldown > 0}
              >
                <Icon name="mail" />
                {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código"}
              </button>

              <p className="muted" style={{ fontSize: "0.75rem", marginTop: "1rem", textAlign: "center" }}>
                ¿No llega? Revisa spam o promociones. El código vence en unos minutos.
              </p>
            </form>
          ) : (
            <form onSubmit={onSubmitCredenciales}>
              <h1>Qué bueno verte por aquí.</h1>
              <p className="muted" style={{ marginBottom: "1.5rem" }}>
                Entra para abrir tu punto de venta.
              </p>

              <Field label="Correo electrónico" required>
                <input
                  className="input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@dominio.com"
                />
              </Field>
              <Field label="Contraseña" required>
                <input
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                />
              </Field>

              {error && <p className="field__error">{error}</p>}

              <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
                {busy ? "Entrando…" : "Entrar"}
              </button>

              <p className="muted" style={{ fontSize: "0.8rem", marginTop: "1.25rem", textAlign: "center" }}>
                ¿Nuevo por aquí? <Link to="/registro">Crear mi comercio</Link>
              </p>
              <p className="muted" style={{ fontSize: "0.75rem", marginTop: "0.5rem", textAlign: "center" }}>
                <Icon name="lock" /> Tu correo se verifica con un código.
              </p>
              <p className="dim" style={{ fontSize: "0.72rem", marginTop: "0.75rem", textAlign: "center" }}>
                versión {__APP_VERSION__}
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
