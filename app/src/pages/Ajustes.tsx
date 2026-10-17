// Ajustes · Negocio, recibo y moneda.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useStoreState, useStoreActions } from "../lib/store";
import { Card, Field, PageHead, Tabs } from "../components/ui";
import { Icon } from "../components/Icon";
import { formatBsDirect, formatRate } from "../lib/money";

const TABS = ["Negocio", "Moneda e impuestos", "Recibo"] as const;

export function Ajustes() {
  const { state } = useStoreState();
  const { updateBusiness, setRate } = useStoreActions();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Negocio");
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
    },
    []
  );

  const b = state.business;
  const [form, setForm] = useState({
    name: b.name,
    legalName: b.legalName,
    rif: b.rif,
    phone: b.phone,
    address: b.address,
    receiptTitle: b.receiptTitle,
    receiptFooter: b.receiptFooter,
    printFormat: b.printFormat,
  });
  const [rateInput, setRateInput] = useState(String(state.rate));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    updateBusiness(form);
    setSaved(true);
    if (savedTimer.current) window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="stack gap-16">
      <PageHead
        title="Ajustes"
        subtitle="Configura tu comercio, tu equipo y tu forma de trabajar."
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "Negocio" && (
        <form className="kpis" onSubmit={onSubmit}>
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

          <Card title="Vista previa del recibo" hint="Datos de ejemplo">
            <div className="mono" style={{ fontSize: "0.82rem", lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700 }}>{form.name || "Mi Comercio"}</div>
              {form.rif && <div>RIF: {form.rif}</div>}
              {form.address && <div>{form.address}</div>}
              {form.phone && <div>{form.phone}</div>}
              <hr />
              <div>{form.receiptTitle || "Comprobante de venta"}</div>
              <div>Consumidor final</div>
              <hr />
              <div className="between">
                <span>Producto de ejemplo</span>
                <span>$ 10,00</span>
              </div>
              <div className="dim">SKU-001</div>
              <hr />
              <div className="between">
                <strong>Total</strong>
                <strong>$ 10,00</strong>
              </div>
              <div className="between">
                <span>Total en bolívares</span>
                <span>{formatBsDirect(10 * state.rate)}</span>
              </div>
              <hr />
              <div className="muted">{form.receiptFooter || "¡Gracias por su compra!"}</div>
            </div>
          </Card>
        </form>
      )}

      {tab === "Moneda e impuestos" && (
        <Card title="Moneda principal" hint="Dólares (USD) · los bolívares se conservan con exposición cambiaria.">
          <Field label="Tasa de referencia (Bs por USD)" hint="Se usa para mostrar los precios en bolívares.">
            <input className="input" type="number" value={rateInput} onChange={(e) => setRateInput(e.target.value)} />
          </Field>
          <button
            className="btn btn--primary"
            onClick={() => setRate(Number(rateInput) || state.rate)}
          >
            Actualizar tasa
          </button>
          <p className="field__hint" style={{ marginTop: "0.75rem" }}>
            Actual: {formatRate(state.rate)} por USD · actualizada{" "}
            {new Date(state.rateUpdatedAt).toLocaleString()}
          </p>
        </Card>
      )}

      {tab === "Recibo" && (
        <Card title="Formato de impresión" hint="Formato del comprobante que reciben tus clientes.">
          <Field label="Título del recibo" hint="Si lo dejas vacío se usa 'Comprobante de venta'.">
            <input className="input" value={form.receiptTitle} onChange={(e) => setForm({ ...form, receiptTitle: e.target.value })} />
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
    </div>
  );
}
