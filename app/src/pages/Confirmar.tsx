// Confirmación del correo: recoge el enlace y solo entonces entra al POS.
//
// Por qué existe esta pantalla: Supabase devolvía al usuario a la raíz
// (`https://pos.blink.com.ve/`), donde vive la landing. La landing no carga
// el cliente de Supabase, así que el hash con los tokens se quedaba sin leer
// y el usuario «volvía» sin sesión. Aquí el cliente ya está montado, se
// verifica el enlace y se encamina a la activación del pago.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { authResendCode } from "../lib/cloud";
import { useAuth, useStoreActions } from "../lib/store";
import { BrandLogo } from "../components/BrandLogo";
import { Icon } from "../components/Icon";
import { BrandLoader } from "../components/BrandLoader";

const CORREO_KEY = "blink-pos-ultimo-correo";

type Estado = "verificando" | "listo" | "vencido";

/** Parámetros del enlace ANTES de que supabase-js limpie la URL. */
function leerEnlace() {
  const hash = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search || "");
  const get = (k: string) => hash.get(k) ?? query.get(k);
  return {
    tokenHash: get("token_hash"),
    type: get("type"),
    code: get("code"),
    errorCode: get("error_code"),
    errorDescription: get("error_description"),
    tieneSesionEnUrl: hash.has("access_token") || query.has("access_token"),
  };
}

export function Confirmar() {
  const nav = useNavigate();
  const authed = useAuth();
  const { logout } = useStoreActions();

  const [estado, setEstado] = useState<Estado>("verificando");
  const [detalle, setDetalle] = useState("");
  const [correo, setCorreo] = useState(() => {
    try {
      return localStorage.getItem(CORREO_KEY) || "";
    } catch {
      return "";
    }
  });
  const [aviso, setAviso] = useState("");
  const [busy, setBusy] = useState(false);

  // 1) Verificación del enlace (token_hash, code o hash implícito).
  useEffect(() => {
    let vivo = true;
    const enlace = leerEnlace();

    async function verificar() {
      if (enlace.errorCode || enlace.errorDescription) {
        if (!vivo) return;
        setDetalle(enlace.errorDescription || "");
        setEstado("vencido");
        return;
      }
      try {
        if (enlace.tokenHash && enlace.type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: enlace.tokenHash,
            type: enlace.type as "signup" | "magiclink" | "email" | "recovery",
          });
          if (error && !vivo) return;
        } else if (enlace.code) {
          await supabase.auth.exchangeCodeForSession(enlace.code);
        }
      } catch {
        /* la sesión puede venir igual por el detector de supabase-js */
      }

      // 2) Espera a que exista sesión (el detector del cliente lee el hash
      //    de forma asíncrona al arrancar).
      for (let i = 0; i < 24; i++) {
        if (!vivo) return;
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setEstado("listo");
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }
      if (!vivo) return;
      setEstado("vencido");
    }

    void verificar();
    return () => {
      vivo = false;
    };
  }, []);

  // 3) Con sesión (aunque el enlace ya se hubiera consumido al cargar),
  //    se entra a la activación. Esperar un instante deja que el store
  //    termine de registrar la sesión y el equipo verificado.
  useEffect(() => {
    if (estado !== "listo" || !authed) return;
    const t = window.setTimeout(() => nav("/app/activacion", { replace: true }), 700);
    return () => window.clearTimeout(t);
  }, [estado, authed, nav]);

  async function reenviar() {
    const destino = correo.trim();
    if (!destino) return;
    setBusy(true);
    const { error: err } = await authResendCode(destino);
    setBusy(false);
    setAviso(err ?? `Te enviamos un enlace nuevo a ${destino}.`);
  }

  async function otraCuenta() {
    try {
      localStorage.removeItem(CORREO_KEY);
    } catch {
      /* sin almacenamiento */
    }
    await logout();
    nav("/app/entrar", { replace: true });
  }

  return (
    <main className="auth">
      <div className="auth__pitch">
        <BrandLogo className="brand-logo--auth" />
        <h2>Un paso y entramos.</h2>
        <p style={{ maxWidth: "34ch", fontSize: "1.2rem", fontWeight: 600 }}>
          Estamos comprobando tu enlace de correo para abrir tu punto de venta.
        </p>
      </div>

      <div className="auth__panel">
        <div className="auth__card">
          {estado === "verificando" && (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <BrandLoader />
            </div>
          )}

          {estado === "listo" && (
            <div style={{ textAlign: "center" }}>
              <Icon name="checkmarkCircle" size="xl" />
              <h1>Correo verificado</h1>
              <p className="muted" style={{ marginBottom: "1.5rem" }}>
                Tu cuenta ya está lista. Te llevamos a la activación para habilitar tu comercio.
              </p>
              <button
                className="btn btn--primary btn--block"
                type="button"
                onClick={() => nav("/app/activacion", { replace: true })}
              >
                Continuar
              </button>
            </div>
          )}

          {estado === "vencido" && (
            <div>
              <h1>El enlace venció</h1>
              <p className="muted" style={{ marginBottom: "1rem" }}>
                {detalle || "Los enlaces de correo caducan por seguridad o se consumen al abrirlos."} Puedes pedir uno nuevo.
              </p>

              {correo ? (
                <>
                  <input
                    className="input"
                    type="email"
                    autoComplete="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    aria-label="Correo electrónico"
                    style={{ marginBottom: "0.75rem" }}
                  />
                  {aviso && (
                    <p className="field__hint" style={{ marginBottom: "0.75rem" }}>
                      <Icon name="mail" /> {aviso}
                    </p>
                  )}
                  <button
                    className="btn btn--primary btn--block"
                    type="button"
                    onClick={reenviar}
                    disabled={busy}
                  >
                    <Icon name="mail" /> {busy ? "Enviando…" : "Reenviar enlace"}
                  </button>
                </>
              ) : (
                <Link className="btn btn--primary btn--block" to="/app/registro">
                  Volver a crear la cuenta
                </Link>
              )}

              <button
                className="btn btn--ghost btn--sm btn--block"
                type="button"
                onClick={otraCuenta}
                style={{ marginTop: "0.6rem" }}
              >
                Usar otra cuenta
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
