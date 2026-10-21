// Recuperación de contraseña: pide el enlace y, tras abrirlo, fija la nueva clave.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useStoreActions } from "../lib/store";
import { Field } from "../components/ui";
import { Icon } from "../components/Icon";

export function Recuperar() {
  const { resetPassword, updatePassword, logout } = useStoreActions();
  const authed = useAuth();
  const nav = useNavigate();

  // "pedir" = enviar enlace al correo · "fijar" = definir la nueva contraseña.
  const [mode, setMode] = useState<"pedir" | "fijar">(authed ? "fijar" : "pedir");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  // Si el usuario llega abriendo el enlace del correo, Supabase crea una sesión
  // de recuperación (PASSWORD_RECOVERY) y `authed` pasa a true: mostramos el
  // formulario de la nueva contraseña.
  useEffect(() => {
    if (authed) setMode("fijar");
  }, [authed]);

  useEffect(() => {
    if (cooldown <= 0) return;
    timer.current = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer.current);
  }, [cooldown]);

  async function onPedirEnlace(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Escribe un correo electrónico válido.");
      return;
    }
    setBusy(true);
    const err = await resetPassword(email.trim());
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setInfo("Si ese correo tiene una cuenta, te enviamos un enlace para crear una nueva contraseña. Ábrelo desde este navegador.");
    setCooldown(45);
  }

  async function onFijarClave(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    const err = await updatePassword(password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    // Contraseña actualizada: cerramos la sesión de recuperación y volvemos al acceso.
    await logout();
    nav("/app/entrar", { replace: true });
  }

  async function reenviar() {
    if (cooldown > 0) return;
    setBusy(true);
    setError("");
    const err = await resetPassword(email.trim());
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
    setConfirm("");
    setError("");
    setInfo("");
    setMode("pedir");
  }

  return (
    <main className="auth">
      <div className="auth__pitch">
        <span className="blink-pos-title">
          <span className="wordmark__blink">BLINK</span>
          <span className="wordmark__pos">POS</span>
        </span>
        <h2>Recupera el acceso a tu comercio.</h2>
        <p style={{ maxWidth: "34ch", fontSize: "1.2rem", fontWeight: 600 }}>
          Te enviamos un enlace seguro para crear una nueva contraseña, sin perder tus datos.
        </p>
      </div>

      <div className="auth__panel">
        <div className="auth__card">
          {mode === "fijar" ? (
            <form onSubmit={onFijarClave}>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={usarOtraCuenta}
                style={{ marginBottom: "0.75rem" }}
              >
                ← Usar otra cuenta
              </button>
              <h1>Crea tu nueva contraseña.</h1>
              <p className="muted" style={{ marginBottom: "1.5rem" }}>
                Elige una clave que recuerdes. Al guardar, entrarás con ella.
              </p>

              <Field label="Nueva contraseña" required>
                <input
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </Field>
              <Field label="Confirmar contraseña" required>
                <input
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repítela"
                />
              </Field>

              {error && <p className="field__error">{error}</p>}

              <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
                {busy ? "Guardando…" : "Guardar contraseña"}
              </button>
            </form>
          ) : (
            <form onSubmit={onPedirEnlace}>
              <h1>¿Olvidaste tu contraseña?</h1>
              <p className="muted" style={{ marginBottom: "1.5rem" }}>
                Escribe tu correo y te enviamos un enlace para crear una nueva.
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

              {error && <p className="field__error">{error}</p>}
              {info && (
                <p className="field__hint" style={{ marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
                  <Icon name="mail" /> {info}
                </p>
              )}

              <button className="btn btn--primary btn--block" type="submit" disabled={busy || cooldown > 0}>
                {busy
                  ? "Enviando…"
                  : cooldown > 0
                    ? `Reenviar en ${cooldown}s`
                    : "Enviar enlace"}
              </button>

              {cooldown > 0 && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm btn--block"
                  style={{ marginTop: "0.6rem" }}
                  onClick={reenviar}
                  disabled={busy}
                >
                  <Icon name="mail" /> Reenviar enlace
                </button>
              )}

              <p className="muted" style={{ fontSize: "0.8rem", marginTop: "1.25rem", textAlign: "center" }}>
                ¿Ya la recuerdas? <Link to="/app/entrar">Volver a entrar</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
