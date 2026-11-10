// Registro: datos personales → verificación por enlace mágico.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useStoreActions } from "../lib/store";
import { guardarCorreoRegistro } from "../lib/session-storage";
import { Field } from "../components/ui";
import { Icon } from "../components/Icon";
import { BrandLogo } from "../components/BrandLogo";

export function Registro() {
  const { signUp, resendCode } = useStoreActions();

  const [step, setStep] = useState<"datos" | "link" | "duplicado">("datos");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

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
    const resultado = await signUp({
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    });
    setBusy(false);
    if (resultado.error) {
      setError(resultado.error);
      return;
    }
    // El alta duplicada responde 200 sin crear nada ni enviar correo: si se
    // tratara como un alta normal, la persona se queda esperando un enlace que
    // nunca llega (BLINK-046/063.1).
    if (resultado.outcome === "sesion") {
      // Confirmación de correo desactivada: ya hay sesión, así que el guardia
      // de rutas lleva al usuario a su POS. No se le pide que abra un enlace
      // que no existe.
      setInfo("Cuenta activa. Entrando…");
      return;
    }
    if (resultado.outcome === "duplicado") {
      setStep("duplicado");
      return;
    }
    // Se recuerda el correo para poder reenviar el enlace si caduca
    // (lo usa la pantalla /app/confirmar). BLINK-079: con caducidad de 30
    // min, no una clave global que quedaba para el siguiente usuario.
    guardarCorreoRegistro(email.trim());
    setStep("link");
    setCooldown(45);
    setInfo(`Enviamos un enlace de verificación a ${email.trim()}. Ábrelo desde el mismo equipo o dispositivo: al confirmarlo pasarás a la activación del pago.`);
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
    setInfo("Te enviamos un nuevo enlace de verificación.");
  }

  return (
    <main className="auth">
      <div className="auth__pitch">
        <BrandLogo className="brand-logo--auth" />
        <h2>Empecemos por lo básico.</h2>
        <p style={{ maxWidth: "34ch", fontSize: "1.2rem", fontWeight: 600 }}>
          Crea tu cuenta, verifica tu correo y activa tu comercio. Son $25 cada 30 días.
        </p>
      </div>

      <div className="auth__panel">
        <div className="auth__card">
          <div className="auth__steps" aria-hidden>
            <span className={step === "datos" ? "auth__step auth__step--on" : "auth__step"}>1</span>
            <span className="auth__step-line" />
            <span className={step === "link" ? "auth__step auth__step--on" : "auth__step"}>2</span>
          </div>

          {step === "datos" ? (
            <form onSubmit={onSubmitDatos}>
              <h1>Crea tu cuenta</h1>


              <div className="row gap-12">
                
                  
                    
                      <div className="form-group">
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
                    
                  
                
              </div>

              
                
                  
                    <div className="form-group">
                      <Field label="Teléfono" required>
                                                                                                    <input
                                                                                                      className="input"
                                                                                                      value={phone}
                                                                                                      onChange={(e) => setPhone(e.target.value)}
                                                                                                      autoComplete="tel"
                                                                                                      placeholder="+58 412 000 0000"
                                                                                                    />
                                                                                                  </Field>
                                                                                    
                                                                                                  <Field label="Correo electrónico" required hint="Cada comercio debe usar un correo único. Aquí llegará el enlace de verificación.">
                                                                                                    <input
                                                                                                      className="input"
                                                                                                      type="email"
                                                                                                      value={email}
                                                                                                      onChange={(e) => setEmail(e.target.value)}
                                                                                                      autoComplete="email"
                                                                                                      placeholder="tucorreo@dominio.com"
                                                                                                    />
                                                                                                  </Field>
                    </div>
                  
                
              

              <div className="row gap-12">
                
                  
                    
                      <div className="form-group">
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
                    
                  
                
              </div>

              {error && <p className="field__error">{error}</p>}

              {info && !error && (
                <p className="muted" style={{ marginBottom: "0.75rem" }}>
                  {info}
                </p>
              )}

              <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
                {busy ? "Enviando enlace…" : "Continuar"}
              </button>

              <p className="muted" style={{ fontSize: "0.75rem", marginTop: "1rem", textAlign: "center", lineHeight: 1.5 }}>
                Son $25 cada 30 días. Tras verificar el correo tendrás 24 h para
                reportar el pago; si no se concilia, la cuenta y sus datos se eliminan.
              </p>

              <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.75rem", textAlign: "center" }}>
                ¿Ya tienes cuenta? <Link to="/app/entrar">Entrar</Link>
              </p>
            </form>
          ) : step === "duplicado" ? (
            <div>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setStep("datos");
                  setError("");
                }}
                style={{ marginBottom: "0.75rem" }}
              >
                <Icon name="arrowLeft" /> Cambiar datos
              </button>
              <h1>Ese correo ya tiene una cuenta</h1>
              <p className="muted" style={{ marginBottom: "1rem" }}>
                <strong>{email.trim()}</strong> ya está registrado, así que no creamos una
                cuenta nueva ni enviamos otro enlace. Puede ser un comercio que abriste antes.
              </p>
              {error && (
                <p className="field__error" style={{ marginBottom: "0.75rem" }}>
                  {error}
                </p>
              )}

              <Link className="btn btn--primary btn--block" to="/app/entrar">
                Entrar con esa cuenta
              </Link>
              <Link
                className="btn btn--ghost btn--block"
                to="/app/recuperar"
                style={{ marginTop: "0.5rem" }}
              >
                <Icon name="lock" /> No recuerdo la contraseña
              </Link>
              <button
                type="button"
                className="btn btn--ghost btn--block"
                style={{ marginTop: "0.5rem" }}
                onClick={() => {
                  setStep("datos");
                  setError("");
                }}
              >
                <Icon name="mail" /> Usar otro correo
              </button>

              <p className="muted" style={{ fontSize: "0.75rem", marginTop: "1rem", textAlign: "center" }}>
                Cada comercio necesita su propio correo. Si este ya tiene un POS, entra y
                añade el comercio desde dentro.
              </p>
            </div>
          ) : (
            <div>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setStep("datos");
                  setError("");
                }}
                style={{ marginBottom: "0.75rem" }}
              >
                <Icon name="arrowLeft" /> Cambiar datos
              </button>
              <h1>Verifica tu correo</h1>
              <p className="muted" style={{ marginBottom: "1rem", whiteSpace: "pre-wrap" }}>
                {info || `Enviamos un enlace de verificación a ${email.trim()}. Ábrelo desde el mismo navegador para continuar.`}
              </p>
              <p className="muted" style={{ fontSize: "0.9rem", marginBottom: "1.25rem" }}>
                <Icon name="mail" /> Revisa también Spam o Promociones si no lo ves.
              </p>

              {error && (
                <p className="field__error" style={{ marginBottom: "0.75rem" }}>
                  {error}
                </p>
              )}

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
                Cada comercio usa un correo único. Al abrir el enlace se iniciará sesión
                y podrás activar tu comercio con el pago.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}