// Crear comercio (registro).
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStoreActions } from "../lib/store";
import { Field } from "../components/ui";

export function CrearComercio() {
  const { login, updateBusiness } = useStoreActions();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.includes("@")) return;
    updateBusiness({ name: name.trim() });
    login(email);
    nav("/inicio");
  }

  return (
    <main className="auth">
      <div className="auth__pitch">
        <span className="brand brand--lg">
          <span className="brand__blink">BLINK</span> POS
        </span>
        <h2>Vamos a crear tu comercio.</h2>
        <p style={{ maxWidth: "34ch", fontSize: "1.2rem", fontWeight: 600 }}>
          En minutos tendrás tu punto de venta listo para cobrar en dólares y bolívares.
        </p>
      </div>
      <div className="auth__panel">
        <form className="auth__card" onSubmit={submit}>
          <h1>Crea tu comercio</h1>
          <p className="muted" style={{ marginBottom: "1.5rem" }}>
            Solo el nombre es obligatorio por ahora.
          </p>
          <Field label="Nombre del comercio" required>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mi Comercio" />
          </Field>
          <Field label="Correo electrónico" required>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" />
          </Field>
          <button className="btn btn--primary btn--block" type="submit">
            Crear comercio
          </button>
          <p className="muted" style={{ fontSize: "0.8rem", marginTop: "1.25rem", textAlign: "center" }}>
            ¿Ya tienes cuenta? <Link to="/entrar">Entrar</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
