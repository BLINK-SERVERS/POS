// Pantalla de acceso (Supabase Auth).
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStoreActions } from "../lib/store";
import { Field } from "../components/ui";
import { Icon } from "../components/Icon";

export function Login() {
  const { login, sendDeviceCode, logout } = useStoreActions();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [step, setStep] = useState<"cred" | "link">("cred");
  const timer = useRef<number | undefined>(undefined);

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
    nav("/inicio", { replace: true });
  }

  async function pedirEnlaceMagico() {
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Escribe tu correo electrónico para enviarte el enlace de acceso.");
      return;
    }
    setBusy(true);
    const err = await sendDeviceCode(email.trim());
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setStep("link");
    setCooldown(45);
  }

  async function reenviar() {
    if (cooldown > 0) return;
    setBusy(true);
    setError("");
    const err = await sendDeviceCode(email.trim());
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setCooldown(45);
  }

  async function usarOtraCuenta() {
    await logout();
    setPassword("");
    setCooldown(0);
    setError("");
    setStep("cred");
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
          {step === "link" ? (
            <div>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={usarOtraCuenta}
                style={{ marginBottom: "0.75rem" }}
              >
                ← Usar otra cuenta
              </button>
              <h1>Verifica tu correo</h1>
              <p className="muted" style={{ marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
                Enviamos un enlace de verificación a <strong>{email.trim()}</strong>. Ábrelo desde este navegador para completar el inicio de sesión.
              </p>
              <p className="muted" style={{ fontSize: "0.9rem", marginBottom: "1.25rem" }}>
                <Icon name="mail" /> Revisa Spam o Promociones si no lo ves.
              </p>

              {error && <p className="field__error">{error}</p>}

              <button
                type="button"
                className="btn btn--ghost btn--block"
                style={{ marginTop: "0.5rem" }}
                onClick={reenviar}
                disabled={busy || cooldown > 0}
              >
                <Icon name="mail" />
                {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar enlace"}
              </button>

              <p className="muted" style={{ fontSize: "0.75rem", marginTop: "1rem", textAlign: "center" }}>
                Cada comercio usa un correo único. Al abrir el enlace se iniciará sesión automáticamente.
              </p>
            </div>
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

              <button
                type="button"
                className="btn btn--ghost btn--sm btn--block"
                style={{ marginTop: "0.6rem" }}
                onClick={pedirEnlaceMagico}
                disabled={busy}
              >
                <Icon name="mail" /> Entrar con enlace al correo
              </button>

              <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.9rem", textAlign: "center" }}>
                <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
              </p>

              <p className="muted" style={{ fontSize: "0.8rem", marginTop: "1.25rem", textAlign: "center" }}>
                ¿Nuevo por aquí? <Link to="/registro">Crear mi comercio</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
