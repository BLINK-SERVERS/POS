// Registro: datos personales → verificación por código de 6 dígitos.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStoreActions } from "../lib/store";
import { Field } from "../components/ui";
import { Icon } from "../components/Icon";
import { OtpInput } from "../components/OtpInput";

export function Registro() {
  const { signUp, verifyEmail, resendCode } = useStoreActions();
  const nav = useNavigate();
  const [step, setStep] = useState<"datos" | "codigo">("datos");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (cooldown <= 0) return;
    timer.current = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer.current);
  }, [cooldown]);

  async function onSubmitDatos(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("Escribe tu nombre y tu apellido.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Escribe un correo electrónico válido.");
      return;
    }
    if (!/^[+()\d\s-]{7,}$/.test(phone.trim())) {
      setError("Escribe un número de teléfono válido.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    const err = await signUp({
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    });
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setStep("codigo");
    setCooldown(45);
    setInfo(`Enviamos un código de 6 dígitos a ${email.trim()}.`);
  }

  async function onSubmitCodigo(e: FormEvent) {
    e.preventDefault();
    if (code.length < 6) return;
    setBusy(true);
    setError("");
    const err = await verifyEmail(email.trim(), code);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    nav("/onboarding");
  }

  async function reenviar() {
    if (cooldown > 0) return;
    setBusy(true);
    setError("");
    const err = await resendCode(email.trim());
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setCooldown(45);
    setInfo("Te enviamos un código nuevo.");
  }

  return (
    <main className="auth">
      <div className="auth__pitch">
        <span className="blink-pos-title">
          <span className="blink">BLINK</span>
          <span className="pos">POS</span>
        </span>
        <h2>Empecemos por lo básico.</h2>
        <p style={{ maxWidth: "34ch", fontSize: "1.2rem", fontWeight: 600 }}>
          Crea tu cuenta, verifica tu correo y arma tu punto de venta a tu medida.
        </p>
      </div>

      <div className="auth__panel">
        <div className="auth__card">
          <div className="auth__steps" aria-hidden>
            <span className={step === "datos" ? "auth__step auth__step--on" : "auth__step"}>1</span>
            <span className="auth__step-line" />
            <span className={step === "codigo" ? "auth__step auth__step--on" : "auth__step"}>2</span>
          </div>

          {step === "datos" ? (
            <form onSubmit={onSubmitDatos}>
              <h1>Crea tu cuenta</h1>
              <p className="muted" style={{ marginBottom: "1.25rem" }}>
                Tus datos reales, sin plantillas. Los usamos para tu operación y tu recibo.
              </p>

              <div className="row gap-12">
                <Field label="Nombre" required>
                  <input
                    className="input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                  />
                </Field>
                <Field label="Apellido" required>
                  <input
                    className="input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                  />
                </Field>
              </div>

              <Field label="Teléfono" required>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+58 412 000 0000"
                />
              </Field>

              <Field label="Correo electrónico" required hint="Aquí llegará el código de verificación.">
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="tucorreo@dominio.com"
                />
              </Field>

              <div className="row gap-12">
                <Field label="Contraseña" required>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Confirmar contraseña" required>
                  <input
                    className="input"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>
              </div>

              {error && <p className="field__error">{error}</p>}

              <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
                {busy ? "Creando cuenta…" : "Continuar"}
              </button>

              <p className="muted" style={{ fontSize: "0.8rem", marginTop: "1.25rem", textAlign: "center" }}>
                ¿Ya tienes cuenta? <Link to="/entrar">Entrar</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={onSubmitCodigo}>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setStep("datos");
                  setCode("");
                  setError("");
                }}
                style={{ marginBottom: "0.75rem" }}
              >
                ← Cambiar datos
              </button>
              <h1>Verifica tu correo</h1>
              <p className="muted" style={{ marginBottom: "1.25rem" }}>
                {info || `Escribe el código de 6 dígitos que enviamos a ${email.trim()}.`}
              </p>

              <OtpInput value={code} onChange={setCode} disabled={busy} />

              {error && (
                <p className="field__error" style={{ marginTop: "0.75rem" }}>
                  {error}
                </p>
              )}

              <button
                className="btn btn--primary btn--block"
                type="submit"
                style={{ marginTop: "1rem" }}
                disabled={busy || code.length < 6}
              >
                {busy ? "Verificando…" : "Verificar"}
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
          )}
        </div>
      </div>
    </main>
  );
}
