// Pantalla de acceso (Supabase Auth).
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStoreActions } from "../lib/store";
import { Field } from "../components/ui";
import { Icon } from "../components/Icon";

export function Login() {
  const { login } = useStoreActions();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || password.length < 6) {
      setError("Introduce tu correo y tu contraseña.");
      return;
    }
    setBusy(true);
    setError("");
    const err = await login(email, password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    nav("/inicio");
  }

  return (
    <main className="auth">
      <div className="auth__pitch">
        <span className="brand brand--lg">
          <span className="brand__blink">BLINK</span> POS
        </span>
        <h2>Tu punto de venta, rápido y claro.</h2>
        <p style={{ maxWidth: "34ch", fontSize: "1.2rem", fontWeight: 600 }}>
          Vende, cobra en dólares y bolívares, y controla tu inventario desde un solo lugar.
        </p>
      </div>

      <div className="auth__panel">
        <form className="auth__card" onSubmit={submit}>
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
      </div>
    </main>
  );
}
