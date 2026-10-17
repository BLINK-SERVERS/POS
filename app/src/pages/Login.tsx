// Pantalla de acceso (propia).
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

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || password.length < 3) {
      setError("Introduce un correo válido y una contraseña de al menos 3 caracteres.");
      return;
    }
    setError("");
    login(email);
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
              placeholder="tu@correo.com"
            />
          </Field>
          <Field label="Contraseña" required>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn--primary btn--block" type="submit" style={{ marginTop: "0.5rem" }}>
            Entrar
          </button>

          <div className="row gap-8" style={{ margin: "1rem 0" }}>
            <hr className="grow" style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />
            <span className="dim" style={{ fontSize: "0.75rem" }}>o</span>
            <hr className="grow" style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />
          </div>

          <button
            type="button"
            className="btn btn--ghost btn--block"
            onClick={() => {
              login("demo@blink.local");
              nav("/inicio");
            }}
          >
            <Icon name="google" />
            Continuar con Google
          </button>

          <p className="muted" style={{ fontSize: "0.8rem", marginTop: "1.25rem", textAlign: "center" }}>
            ¿Nuevo por aquí? <Link to="/crear-comercio">Vamos a crear tu comercio</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
