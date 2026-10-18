// Ajustes · Negocio, perfil, moneda, recibo y cuenta.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useStoreState, useStoreActions } from "../lib/store";
import { Card, Field, PageHead, Tabs } from "../components/ui";
import { Icon } from "../components/Icon";
import { MobileScannerModal } from "../components/ScannerModals";
import { useScanner } from "../lib/scanner/ScannerProvider";
import { PAIRING_DAYS } from "../lib/scanner/pairing";
import { formatBsDirect, formatRate } from "../lib/money";

const TABS = ["Negocio", "Perfil", "Moneda e impuestos", "Recibo", "Dispositivos", "Cuenta"] as const;

export function Ajustes() {
  const { state, user } = useStoreState();
  const { updateBusiness, setRate, updateProfile, clearAll, logout } = useStoreActions();
  const { pairing, remoteActive, rotatePairing } = useScanner();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Negocio");
  const [qrOpen, setQrOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const timer2 = useRef<number | undefined>(undefined);

  const [form, setForm] = useState({
    name: state.business.name,
    legalName: state.business.legalName,
    rif: state.business.rif,
    phone: state.business.phone,
    address: state.business.address,
    receiptTitle: state.business.receiptTitle,
    receiptFooter: state.business.receiptFooter,
    printFormat: state.business.printFormat,
  });
  const [rate, setRateField] = useState(String(state.rate || ""));
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
  });

  useEffect(() => () => {
    window.clearTimeout(timer.current);
    window.clearTimeout(timer2.current);
  }, []);

  function onSubmitNegocio(e: FormEvent) {
    e.preventDefault();
    updateBusiness(form);
    setSaved(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSaved(false), 2200);
  }

  async function onSubmitPerfil(e: FormEvent) {
    e.preventDefault();
    setProfileError("");
    const err = await updateProfile(profile);
    if (err) {
      setProfileError(err);
      return;
    }
    setProfileSaved(true);
    window.clearTimeout(timer2.current);
    timer2.current = window.setTimeout(() => setProfileSaved(false), 2200);
  }

  const firstProduct = state.products[0];

  return (
    <div className="stack gap-16">
      <PageHead
        title="Ajustes"
        subtitle="Configura tu comercio, tu perfil y tu forma de trabajar."
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "Negocio" && (
        <form className="kpis" onSubmit={onSubmitNegocio}>
          <Card title="Datos del comercio" hint="Identificación y contacto de tu negocio.">
            <Field label="Nombre del comercio" required hint="Así lo verá tu equipo en BLINK POS.">
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Razón social" hint="Nombre legal, si es distinto al comercial.">
              <input className="input" value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} />
            </Field>
            <Field label="RIF" hint="Identificación tributaria.">
              <input className="input" value={form.rif} onChange={(e) => setForm({ ...form, rif: e.target.value })} />
            </Field>
            <div className="row gap-12">
              <Field label="Teléfono">
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Dirección">
                <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </Field>
            </div>
            <button className="btn btn--primary" type="submit">
              {saved ? (
                <>
                  <Icon name="check" /> Guardado
                </>
              ) : (
                "Guardar"
              )}
            </button>
          </Card>

          <Card title="Vista previa del recibo" hint="Con tus datos reales.">
            <div className="mono" style={{ fontSize: "0.82rem", lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700 }}>{form.name || "Sin nombre"}</div>
              {form.rif && <div>RIF: {form.rif}</div>}
              {form.address && <div>{form.address}</div>}
              {form.phone && <div>{form.phone}</div>}
              <hr />
              <div>{form.receiptTitle || "Comprobante de venta"}</div>
              <div>Consumidor final</div>
              <hr />
              {firstProduct ? (
                <>
                  <div className="between">
                    <span>{firstProduct.name}</span>
                    <span>${firstProduct.price.toFixed(2)}</span>
                  </div>
                  {firstProduct.sku && <div className="dim">SKU: {firstProduct.sku}</div>}
                </>
              ) : (
                <div className="dim">Aún no tienes productos.</div>
              )}
              <hr />
              <div className="between">
                <span>Total en bolívares</span>
                <span>{formatBsDirect((firstProduct?.price ?? 0) * state.rate)}</span>
              </div>
              <hr />
              <div className="muted">{form.receiptFooter || "(sin pie de recibo)"}</div>
            </div>
          </Card>
        </form>
      )}

      {tab === "Perfil" && (
        <Card title="Tu perfil" hint="Tus datos personales de la cuenta.">
          <form onSubmit={onSubmitPerfil}>
            <div className="row gap-12">
              <Field label="Nombre" required>
                <input
                  className="input"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
              </Field>
              <Field label="Apellido" required>
                <input
                  className="input"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Teléfono">
              <input
                className="input"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </Field>
            <Field label="Correo electrónico" hint="Tu correo de acceso no se cambia desde aquí.">
              <input className="input" value={user?.email ?? ""} disabled />
            </Field>
            {profileError && <p className="field__error">{profileError}</p>}
            <button className="btn btn--primary" type="submit">
              {profileSaved ? (
                <>
                  <Icon name="check" /> Guardado
                </>
              ) : (
                "Guardar perfil"
              )}
            </button>
          </form>
        </Card>
      )}

      {tab === "Moneda e impuestos" && (
        <Card title="Moneda principal" hint="Dólares (USD) o bolívares (VES).">
          <Field label="Tasa de referencia (Bs por USD)" hint="La tasa real del día. Con ella se muestra el total en bolívares.">
            <input
              className="input"
              inputMode="decimal"
              value={rate}
              onChange={(e) => setRateField(e.target.value)}
            />
          </Field>
          <button
            className="btn btn--primary"
            onClick={() => setRate(Number(rate.replace(",", ".")) || 0)}
          >
            Guardar tasa
          </button>
          {state.rate > 0 && (
            <p className="field__hint" style={{ marginTop: "0.6rem" }}>
              1 USD = {formatRate(state.rate)} Bs
              {state.rateUpdatedAt
                ? ` · actualizada ${new Date(state.rateUpdatedAt).toLocaleString()}`
                : ""}
            </p>
          )}
        </Card>
      )}

      {tab === "Recibo" && (
        <Card title="Formato del recibo" hint="Cómo se ve el comprobante que entregas.">
          <Field label="Título del recibo">
            <input
              className="input"
              value={form.receiptTitle}
              onChange={(e) => setForm({ ...form, receiptTitle: e.target.value })}
              placeholder="Comprobante de venta"
            />
          </Field>
          <Field label="Formato">
            <select
              className="select"
              value={form.printFormat}
              onChange={(e) => setForm({ ...form, printFormat: e.target.value as typeof form.printFormat })}
            >
              <option value="58mm">Ticket 58 mm</option>
              <option value="80mm">Ticket 80 mm</option>
              <option value="carta">Carta</option>
            </select>
          </Field>
          <Field label="Pie del recibo" hint="Máximo 300 caracteres.">
            <textarea
              className="textarea"
              maxLength={300}
              value={form.receiptFooter}
              onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
            />
          </Field>
          <button className="btn btn--primary" onClick={() => updateBusiness(form)}>
            Guardar
          </button>
        </Card>
      )}

      {tab === "Dispositivos" && (
        <Card
          title="Escáner móvil"
          hint="Usa un celular como lector inalámbrico de códigos de barras."
        >
          <p className="muted" style={{ marginBottom: "0.75rem" }}>
            Vincula un celular con un código QR. Queda emparejado {PAIRING_DAYS} días: no
            tendrás que escanear el QR cada mañana, basta con abrir la dirección del QR.
          </p>
          <div className="row gap-8" style={{ flexWrap: "wrap" }}>
            <button className="btn btn--primary" onClick={() => setQrOpen(true)}>
              <Icon name="scan" /> Vincular celular
            </button>
            {pairing && (
              <button
                className="btn btn--soft"
                onClick={() => {
                  if (
                    window.confirm(
                      "¿Generar un código nuevo? Los teléfonos vinculados antes quedarán desvinculados."
                    )
                  ) {
                    rotatePairing();
                  }
                }}
              >
                <Icon name="close" /> Desvincular teléfonos
              </button>
            )}
          </div>
          {pairing && (
            <p className="field__hint" style={{ marginTop: "0.6rem" }}>
              Estado: {remoteActive ? "celular activo" : "sin señal del celular"} · vence el{" "}
              {new Date(pairing.expiresAt).toLocaleDateString()}.
            </p>
          )}
          <p className="field__hint" style={{ marginTop: "0.6rem" }}>
            ¿Un lector USB o Bluetooth? Conéctalo y escanea: se lee solo, sin instalar nada.
          </p>
        </Card>
      )}

      {tab === "Cuenta" && (
        <Card title="Tu cuenta" hint="Sesión y datos del comercio.">
          <p className="muted" style={{ marginBottom: "0.75rem" }}>
            Sesión iniciada como <strong>{user?.email}</strong>.
          </p>
          <button className="btn btn--ghost" onClick={() => void logout()}>
            <Icon name="logout" /> Cerrar sesión
          </button>
          <hr style={{ margin: "1.25rem 0", border: "none", borderTop: "1px solid var(--color-border)" }} />

          <p className="muted" style={{ marginBottom: "0.75rem" }}>
            Borrar todos los datos vuelve a dejar el sistema en blanco y te lleva al alta guiada.
            Esta acción no se puede deshacer.
          </p>
          <button
            className="btn btn--soft"
            onClick={() => {
              if (
                window.confirm(
                  "¿Borrar todos los datos del comercio? Se eliminarán productos, ventas, cuentas y ajustes."
                )
              ) {
                clearAll();
              }
            }}
          >
            <Icon name="trash" /> Borrar todos los datos
          </button>
        </Card>
      )}

      {qrOpen && <MobileScannerModal onClose={() => setQrOpen(false)} />}

      <p className="dim" style={{ textAlign: "center", fontSize: "0.8rem" }}>
        BLINK POS · versión {__APP_VERSION__}
      </p>
    </div>
  );
}
