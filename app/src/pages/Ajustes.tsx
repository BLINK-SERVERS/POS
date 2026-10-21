// Ajustes · Negocio, perfil, moneda, recibo, exportación y cuenta.
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useStoreState, useStoreActions } from "../lib/store";
import { Card, Field, PageHead, Tabs, useConfirm } from "../components/ui";
import { useTema, type ModoTema } from "../lib/tema";
import { Icon } from "../components/Icon";
import { MobileScannerModal } from "../components/ScannerModals";
import { useScanner } from "../lib/scanner/ScannerProvider";
import { PAIRING_DAYS } from "../lib/scanner/pairing";
import { formatBsDirect, formatRate } from "../lib/money";
import { buildDatasets, type Dataset } from "../lib/exportData";
import { downloadText, printReport, printableTable, reportName, toCsv } from "../lib/export";

/** Modos de apariencia (HIG · Dark Mode). */
const MODOS_APARIENCIA: { modo: ModoTema; etiqueta: string }[] = [
  { modo: "auto", etiqueta: "Automático" },
  { modo: "claro", etiqueta: "Claro" },
  { modo: "oscuro", etiqueta: "Oscuro" },
];

const TABS = [
  "Negocio",
  "Perfil",
  "Moneda e impuestos",
  "Recibo",
  "Exportar",
  "Dispositivos",
  "Apariencia",
  "Cuenta",
] as const;

export function Ajustes() {
  const { state, user } = useStoreState();
  const { updateBusiness, setRate, syncRate, updateProfile, clearAll, logout } = useStoreActions();
  const confirm = useConfirm();
  const { modo, setModo } = useTema();
  const { pairing, remoteActive, rotatePairing } = useScanner();
  // La pestana activa se puede fijar por URL (?tab=Perfil): asi el menu de
  // avatar abre directamente la seccion que el usuario eligio.
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab");
  const [tab, setTab] = useState<(typeof TABS)[number]>(
    (TABS as readonly string[]).includes(tabParam ?? "") ? (tabParam as (typeof TABS)[number]) : "Negocio"
  );

  /** Cambia de pestana y refleja el cambio en la URL. */
  const irTab = (t: (typeof TABS)[number]) => {
    setTab(t);
    const p = new URLSearchParams(params);
    p.set("tab", t);
    setParams(p, { replace: true });
  };
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
  const [rateMsg, setRateMsg] = useState("");
  const [rateBusy, setRateBusy] = useState(false);
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

  async function onSyncRate() {
    setRateBusy(true);
    setRateMsg("");
    const result = await syncRate();
    setRateBusy(false);
    if (result === "error") {
      setRateMsg("Sin conexión con la fuente oficial. Se mantiene la tasa guardada.");
      return;
    }
    // Refleja en el campo la tasa recién aplicada al estado.
    setRateMsg(result === "cached" ? "Tasa oficial vigente aplicada." : "Tasa oficial actualizada.");
  }

  const firstProduct = state.products[0];

  // Todos los conjuntos exportables, memorizados.
  const datasets = useMemo(() => buildDatasets(state), [state]);

  const exportOneCsv = (ds: Dataset) =>
    downloadText(`${reportName(ds.kind)}.csv`, toCsv(ds.headers, ds.rows));

  const exportOnePdf = (ds: Dataset) =>
    printReport({
      title: ds.label,
      business: state.business.legalName || state.business.name || "Mi negocio",
      bodyHtml: printableTable(ds.headers, ds.rows),
    });

  /** Descarga todos los CSV en cascada (un archivo por conjunto). */
  function exportAllCsv() {
    datasets.forEach((ds, i) => {
      if (!ds.rows.length) return;
      window.setTimeout(() => exportOneCsv(ds), i * 350);
    });
  }

  /** Resumen imprimible (PDF) con TODOS los conjuntos en un solo documento. */
  function exportAllPdf() {
    const bodyHtml = datasets
      .filter((ds) => ds.rows.length)
      .map((ds) => `<h3 class="pr-section">${ds.label}</h3>${printableTable(ds.headers, ds.rows)}`)
      .join("");
    printReport({
      title: "Resumen general",
      business: state.business.legalName || state.business.name || "Mi negocio",
      bodyHtml,
    });
  }

  /** Copia de seguridad completa (JSON) de todo el estado. */
  function exportBackupJson() {
    downloadText(
      `${reportName("copia-seguridad")}.json`,
      JSON.stringify(state, null, 2),
      "application/json"
    );
  }

  const totalRows = datasets.reduce((a, ds) => a + ds.rows.length, 0);

  return (
    <div className="stack gap-16">
      <PageHead
        title="Ajustes"
        subtitle="Configura tu comercio, tu perfil y tu forma de trabajar."
      />

      <Tabs tabs={TABS} value={tab} onChange={irTab} />

      {tab === "Negocio" && (
        <form className="form-grid" onSubmit={onSubmitNegocio}>
          <Card title="Datos del comercio" hint="Identificación y contacto de tu negocio.">
            
              
                
                  <div className="form-group">
                    <Field label="Nombre del comercio" required hint="Así lo verá tu equipo en BLINK POS.">
                                                                                          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                                                                        </Field>
                                                                                        <Field label="Razón social" hint="Nombre legal, si es distinto al comercial.">
                                                                                          <input className="input" value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} />
                                                                                        </Field>
                                                                                        <Field label="RIF" hint="Identificación tributaria.">
                                                                                          <input className="input" value={form.rif} onChange={(e) => setForm({ ...form, rif: e.target.value })} />
                                                                                        </Field>
                  </div>
                
              
            
            <div className="row gap-12">
              
                
                  
                    <div className="form-group">
                      <Field label="Teléfono">
                                                                                                    <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                                                                                  </Field>
                                                                                                  <Field label="Dirección">
                                                                                                    <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                                                                                                  </Field>
                    </div>
                  
                
              
            </div>
            <button className="btn btn--primary" type="submit"><Icon name="check" /> 
              {saved ? (
                <>
                  Guardado
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
                <span>
                  {state.rate > 0
                    ? formatBsDirect((firstProduct?.price ?? 0) * state.rate)
                    : "Configura la tasa"}
                </span>
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
              
                
                  
                    <div className="form-group">
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
                  
                
              
            </div>
            
              
                
                  <div className="form-group">
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
                  </div>
                
              
            
            {profileError && <p className="field__error">{profileError}</p>}
            <button className="btn btn--primary" type="submit"><Icon name="check" /> 
              {profileSaved ? (
                <>
                  Guardado
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
          <div className="row gap-8" style={{ flexWrap: "wrap", marginTop: "0.25rem" }}>
            <button
              className="btn btn--primary"
              onClick={() => setRate(Number(rate.replace(",", ".")) || 0)}
            ><Icon name="refresh" /> 
              Guardar tasa
            </button>
            <button className="btn btn--soft" onClick={onSyncRate} disabled={rateBusy}>
              <Icon name="download" /> {rateBusy ? "Consultando…" : "Actualizar desde la API"}
            </button>
          </div>
          {rateMsg && (
            <p className="field__hint" style={{ marginTop: "0.6rem" }}>
              {rateMsg}
            </p>
          )}
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
          
            
              
                <div className="form-group">
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
                </div>
              
            
          
          <button className="btn btn--primary" onClick={() => updateBusiness(form)}><Icon name="check" /> 
            Guardar
          </button>
        </Card>
      )}

      {tab === "Exportar" && (
        <>
          <Card
            title="Exportar todo"
            hint={`Copia de seguridad y reportes completos · ${datasets.length} conjuntos, ${totalRows} registros.`}
          >
            <p className="muted" style={{ marginBottom: "0.75rem" }}>
              Descarga la información de tu negocio en CSV (para Excel), PDF (para imprimir o
              compartir) o una copia de seguridad JSON con todos tus datos.
            </p>
            <div className="row gap-8" style={{ flexWrap: "wrap" }}>
              <button className="btn btn--primary" onClick={exportAllPdf}>
                <Icon name="download" /> Resumen general (PDF)
              </button>
              <button className="btn btn--ghost" onClick={exportAllCsv}>
                <Icon name="table" /> Todos los reportes (CSV)
              </button>
              <button className="btn btn--soft" onClick={exportBackupJson}><Icon name="fileText" /> 
                <Icon name="fileText" /> Copia de seguridad (JSON)
              </button>
            </div>
          </Card>

          <Card title="Por sección" hint="Elige el conjunto y el formato.">
            <div className="stack gap-8">
              {datasets.map((ds) => (
                <div
                  key={ds.kind}
                  className="between"
                  style={{
                    padding: "0.6rem 0.75rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <span className="row gap-8">
                    
                    <span>{ds.label}</span>
                    <span className="dim" style={{ fontSize: "0.78rem" }}>
                      {ds.rows.length} reg.
                    </span>
                  </span>
                  <span className="row gap-8">
                    <button
                      className="btn btn--soft btn--sm"
                      onClick={() => exportOneCsv(ds)}
                      disabled={!ds.rows.length}
                      title="Descargar CSV"
                    >
                      <Icon name="table" /> CSV
                    </button>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => exportOnePdf(ds)}
                      disabled={!ds.rows.length}
                      title="Exportar PDF"
                    >
                      <Icon name="download" /> PDF
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </>
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
                onClick={async () => {
                  const ok = await confirm({
                    title: "Generar un codigo nuevo",
                    message: "¿Generar un código nuevo? Los teléfonos vinculados antes quedarán desvinculados.",
                    confirmText: "Generar codigo nuevo",
                  });
                  if (ok) rotatePairing();
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

      {tab === "Apariencia" && (
        <Card
          title="Apariencia"
          hint="Claro, oscuro o según el sistema. Lo eligen los ajustes de tu teléfono."
        >
          <Tabs
            tabs={MODOS_APARIENCIA.map((m) => m.etiqueta)}
            value={MODOS_APARIENCIA.find((m) => m.modo === modo)?.etiqueta ?? "Automático"}
            onChange={(etiqueta) => {
              const m = MODOS_APARIENCIA.find((x) => x.etiqueta === etiqueta);
              if (m) setModo(m.modo);
            }}
          />
          <p className="field__hint" style={{ marginTop: "0.75rem" }}>
            {modo === "auto" &&
              "Ahora mismo la app usa el tema que tenga configurado el sistema."}
            {modo === "claro" && "Ahora mismo la app se muestra siempre en claro."}
            {modo === "oscuro" && "Ahora mismo la app se muestra siempre en oscuro."}
          </p>

          <hr
            style={{
              margin: "1.25rem 0",
              border: "none",
              borderTop: "1px solid var(--color-border)",
            }}
          />

          <div className="stack gap-8">
            <div className="row gap-8" style={{ alignItems: "center" }}>
              <Icon name="sun" size="lg" />
              <span>La paleta oscura usa los colores del UI Kit de iOS 27 para el tema oscuro.</span>
            </div>
            <div className="row gap-8" style={{ alignItems: "center" }}>
              <Icon name="moon" size="lg" />
              <span>El cambio se aplica al instante y se recuerda en este dispositivo.</span>
            </div>
          </div>
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
            onClick={async () => {
              const ok = await confirm({
                title: "Borrar todos los datos",
                message: "¿Borrar todos los datos del comercio? Se eliminarán productos, ventas, cuentas y ajustes.",
                confirmText: "Borrar todo",
                destructive: true,
              });
              if (ok) clearAll();
            }}
          >
            <Icon name="trash" /> Borrar todos los datos
          </button>
        </Card>
      )}

      {qrOpen && <MobileScannerModal onClose={() => setQrOpen(false)} />}
    </div>
  );
}
