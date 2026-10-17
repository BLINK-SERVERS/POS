// Alta guiada (onboarding): comercio → recorrido → cuenta de pagos →
// categorías → productos → proveedores. Todo con datos reales del usuario.
import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useStoreState, useStoreActions, DEFAULT_FEATURES } from "../lib/store";
import type { BusinessFeatures } from "../lib/types";
import { Card, Field } from "../components/ui";
import { Icon } from "../components/Icon";

const STEPS = [
  "Tu comercio",
  "Recorrido",
  "Cuenta de pagos",
  "Categorías",
  "Productos",
  "Proveedores",
] as const;

const TIPOS = [
  "Abarrotes / bodega",
  "Panadería / pastelería",
  "Restaurante / comida",
  "Farmacia",
  "Licorería",
  "Ropa / calzado",
  "Belleza / estética",
  "Tecnología / electrónica",
  "Servicios",
  "Otro",
] as const;

function suggestFeatures(tipo: string): BusinessFeatures {
  switch (tipo) {
    case "Servicios":
      return { inventory: false, providers: false, credit: true, expenses: true, reports: true };
    case "Belleza / estética":
      return { inventory: false, providers: true, credit: true, expenses: true, reports: true };
    case "Restaurante / comida":
      return { inventory: true, providers: true, credit: false, expenses: true, reports: true };
    case "Panadería / pastelería":
      return { inventory: true, providers: true, credit: false, expenses: true, reports: true };
    case "Licorería":
      return { inventory: true, providers: true, credit: false, expenses: true, reports: true };
    default:
      return { ...DEFAULT_FEATURES };
  }
}

const FEATURE_LABELS: { key: keyof BusinessFeatures; label: string; hint: string }[] = [
  { key: "inventory", label: "Inventario", hint: "Controlar existencias, compras y ajustes." },
  { key: "providers", label: "Proveedores", hint: "Registrar a quién le compras mercancía." },
  { key: "credit", label: "Crédito", hint: "Vender a crédito y llevar cuentas por cobrar." },
  { key: "expenses", label: "Gastos", hint: "Registrar gastos y gastos recurrentes." },
  { key: "reports", label: "Informes", hint: "Ver ventas, utilidad y capital." },
];

export function Onboarding() {
  const { state } = useStoreState();
  const actions = useStoreActions();
  const nav = useNavigate();

  const [step, setStep] = useState(0);

  // Paso 1 · comercio
  const [name, setName] = useState(state.business.name);
  const [tipo, setTipo] = useState(state.business.type || "");
  const [rif, setRif] = useState(state.business.rif);
  const [phone, setPhone] = useState(state.business.phone);
  const [address, setAddress] = useState(state.business.address);
  const [currency, setCurrency] = useState<"USD" | "VES">(state.business.currency);
  const [features, setFeatures] = useState<BusinessFeatures>(state.business.features);
  const [error, setError] = useState("");

  // Cuenta de pagos
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState<"efectivo" | "banco" | "pago_movil">("efectivo");
  const [accCurrency, setAccCurrency] = useState<"USD" | "VES">(state.business.currency);
  const [accClose, setAccClose] = useState(true);

  // Catálogo
  const [catName, setCatName] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCost, setProdCost] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodCat, setProdCat] = useState("");

  // Proveedores
  const [provName, setProvName] = useState("");
  const [provDoc, setProvDoc] = useState("");
  const [provPhone, setProvPhone] = useState("");
  const [provEmail, setProvEmail] = useState("");

  const defaultChannel = useMemo(
    () => state.channels.find((c) => c.isDefault)?.id ?? state.channels[0]?.id ?? "ch_principal",
    [state.channels]
  );

  function pickTipo(t: string) {
    setTipo(t);
    setFeatures(suggestFeatures(t));
  }

  function next() {
    setError("");
    if (step === 0) {
      if (!name.trim()) {
        setError("Escribe el nombre de tu comercio.");
        return;
      }
      if (!tipo) {
        setError("Elige el giro de tu comercio.");
        return;
      }
      actions.updateBusiness({
        name: name.trim(),
        type: tipo,
        rif: rif.trim(),
        phone: phone.trim(),
        address: address.trim(),
        currency,
      });
    }
    if (step === 1) {
      actions.updateBusiness({ features });
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  function finish() {
    actions.completeOnboarding();
    nav("/inicio", { replace: true });
  }

  // ---- acciones ----
  function addAccountStep() {
    if (!accName.trim()) {
      setError("Ponle un nombre a la cuenta (por ejemplo, Caja principal).");
      return;
    }
    actions.addAccount({
      name: accName.trim(),
      type: accType,
      currency: accCurrency,
      balance: 0,
      commissionIn: 0,
      commissionOut: 0,
      inCashClose: accClose,
      active: true,
    });
    setAccName("");
    setError("");
  }

  function addCategoryStep(e: FormEvent) {
    e.preventDefault();
    const name = catName.trim();
    if (!name) return;
    if (state.categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError("Ya existe esa categoría.");
      return;
    }
    actions.addCategory({ name, active: true, order: state.categories.length });
    setCatName("");
    setError("");
  }

  function addProductStep(e: FormEvent) {
    e.preventDefault();
    const name = prodName.trim();
    if (!name) {
      setError("Escribe el nombre del producto.");
      return;
    }
    const price = Number(prodPrice.replace(",", ".")) || 0;
    if (price <= 0) {
      setError("El precio de venta debe ser mayor que cero.");
      return;
    }
    const cost = Number(prodCost.replace(",", ".")) || 0;
    const stock = Number(prodStock.replace(",", ".")) || 0;
    actions.addProduct({
      name,
      sku: "",
      barcode: "",
      unit: "und",
      cost,
      price,
      channelPrices: { [defaultChannel]: price },
      category: prodCat,
      type: "simple",
      taxRate: 0.16,
      active: true,
      archived: false,
      trackStock: stock > 0 || features.inventory,
      stock,
      minStock: 0,
    });
    setProdName("");
    setProdPrice("");
    setProdCost("");
    setProdStock("");
    setError("");
  }

  function addProviderStep(e: FormEvent) {
    e.preventDefault();
    const name = provName.trim();
    if (!name) {
      setError("Escribe el nombre del proveedor.");
      return;
    }
    actions.addContact({
      name,
      document: provDoc.trim(),
      docType: provDoc.trim().includes("-") ? provDoc.trim().split("-")[0] : "",
      phone: provPhone.trim(),
      email: provEmail.trim(),
      isClient: false,
      isProvider: true,
      creditDays: 0,
      address: "",
      notes: "",
    });
    setProvName("");
    setProvDoc("");
    setProvPhone("");
    setProvEmail("");
    setError("");
  }

  const canFinish = state.business.name.trim() !== "" && state.accounts.length > 0;

  return (
    <main className="auth wizard">
      <div className="auth__pitch">
        <span className="brand brand--lg">
          <span className="brand__blink">BLINK</span> POS
        </span>
        <h2>Vamos a dejar tu punto de venta listo.</h2>
        <p style={{ maxWidth: "34ch", fontSize: "1.05rem", fontWeight: 600 }}>
          Cada paso usa tus datos reales. Nada de ejemplos: lo que cargues es lo que verás.
        </p>
        <ol className="wizard__steps">
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? "is-current" : i < step ? "is-done" : ""}>
              <span className="wizard__dot">{i < step ? <Icon name="check" /> : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="auth__panel">
        <div className="wizard__panel">
          {error && (
            <p className="field__error" style={{ marginBottom: "0.75rem" }}>
              {error}
            </p>
          )}

          {step === 0 && (
            <Card title="Datos de tu comercio" hint="Así aparecerá en BLINK POS y en tus recibos.">
              <Field label="Nombre del comercio" required>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej.: Abastos La Esquina"
                  autoFocus
                />
              </Field>
              <Field label="Giro del comercio" required hint="Define qué módulos te mostramos.">
                <select className="select" value={tipo} onChange={(e) => pickTipo(e.target.value)}>
                  <option value="">Elige una opción…</option>
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="row gap-12">
                <Field label="RIF">
                  <input className="input" value={rif} onChange={(e) => setRif(e.target.value)} placeholder="J-000000000" />
                </Field>
                <Field label="Teléfono">
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Field>
              </div>
              <Field label="Dirección">
                <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
              </Field>
              <Field label="Moneda principal" hint="En la que registras tus precios de venta.">
                <select
                  className="select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "USD" | "VES")}
                >
                  <option value="USD">Dólares (USD)</option>
                  <option value="VES">Bolívares (VES)</option>
                </select>
              </Field>
            </Card>
          )}

          {step === 1 && (
            <Card
              title="Tu recorrido"
              hint="Esto es lo que BLINK puede hacer por ti. Ajusta lo que necesites."
            >
              <p className="muted" style={{ marginBottom: "0.75rem" }}>
                Según el giro que elegiste (<strong>{tipo || "sin definir"}</strong>), activamos
                estos módulos. Puedes cambiarlos ahora o luego en Ajustes.
              </p>
              <div className="feature-list">
                {FEATURE_LABELS.map((f) => (
                  <label key={f.key} className="feature">
                    <input
                      type="checkbox"
                      checked={features[f.key]}
                      onChange={(e) => setFeatures({ ...features, [f.key]: e.target.checked })}
                    />
                    <span>
                      <strong>{f.label}</strong>
                      <span className="muted" style={{ display: "block", fontSize: "0.8rem" }}>
                        {f.hint}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card
              title="Cuenta para recibir pagos"
              hint="Como una billetera: aquí se registra el dinero que entra."
            >
              <div className="mini-list">
                {state.accounts.map((a) => (
                  <div key={a.id} className="mini-list__row">
                    <Icon name="wallet" />
                    <span>
                      {a.name} · {a.currency}
                      {a.inCashClose ? " · cierra caja" : ""}
                    </span>
                  </div>
                ))}
                {state.accounts.length === 0 && (
                  <p className="muted">Aún no tienes cuentas. Crea al menos una.</p>
                )}
              </div>
              <Field label="Nombre de la cuenta" required>
                <input
                  className="input"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="Ej.: Caja principal, Banco, Pago móvil"
                />
              </Field>
              <div className="row gap-12">
                <Field label="Tipo">
                  <select
                    className="select"
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as typeof accType)}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="banco">Banco</option>
                    <option value="pago_movil">Pago móvil</option>
                  </select>
                </Field>
                <Field label="Divisa">
                  <select
                    className="select"
                    value={accCurrency}
                    onChange={(e) => setAccCurrency(e.target.value as "USD" | "VES")}
                  >
                    <option value="USD">Dólares (USD)</option>
                    <option value="VES">Bolívares (VES)</option>
                  </select>
                </Field>
              </div>
              <label className="feature">
                <input type="checkbox" checked={accClose} onChange={(e) => setAccClose(e.target.checked)} />
                <span>
                  <strong>Participa en el cierre de caja</strong>
                  <span className="muted" style={{ display: "block", fontSize: "0.8rem" }}>
                    Cuenta su saldo en el arqueo.
                  </span>
                </span>
              </label>
              <button className="btn btn--soft" type="button" onClick={addAccountStep}>
                <Icon name="plus" /> Agregar cuenta
              </button>
            </Card>
          )}

          {step === 3 && (
            <Card title="Categorías" hint="Agrupa tu catálogo como tú lo piensas.">
              <div className="mini-list">
                {state.categories.map((c) => (
                  <div key={c.id} className="mini-list__row">
                    <Icon name="tag" />
                    <span>{c.name}</span>
                    <button
                      className="icon-btn"
                      onClick={() => actions.removeCategory(c.id)}
                      aria-label="Quitar"
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                ))}
                {state.categories.length === 0 && <p className="muted">Aún no hay categorías.</p>}
              </div>
              <form className="row gap-8" onSubmit={addCategoryStep}>
                <input
                  className="input"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ej.: Bebidas"
                />
                <button className="btn btn--soft" type="submit">
                  <Icon name="plus" /> Añadir
                </button>
              </form>
            </Card>
          )}

          {step === 4 && (
            <Card title="Productos" hint="Lo que vendes, con su precio real.">
              <div className="mini-list">
                {state.products.map((p) => (
                  <div key={p.id} className="mini-list__row">
                    <Icon name="box" />
                    <span>
                      {p.name} · ${p.price.toFixed(2)}
                      {p.category ? ` · ${p.category}` : ""}
                    </span>
                    <button
                      className="icon-btn"
                      onClick={() => actions.removeProduct(p.id)}
                      aria-label="Quitar"
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                ))}
                {state.products.length === 0 && <p className="muted">Aún no hay productos.</p>}
              </div>
              <form onSubmit={addProductStep}>
                <Field label="Nombre del producto" required>
                  <input className="input" value={prodName} onChange={(e) => setProdName(e.target.value)} />
                </Field>
                <div className="row gap-12">
                  <Field label="Precio de venta (USD)" required>
                    <input className="input" inputMode="decimal" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} />
                  </Field>
                  <Field label="Costo (USD)">
                    <input className="input" inputMode="decimal" value={prodCost} onChange={(e) => setProdCost(e.target.value)} />
                  </Field>
                </div>
                <div className="row gap-12">
                  <Field label="Existencia inicial">
                    <input className="input" inputMode="decimal" value={prodStock} onChange={(e) => setProdStock(e.target.value)} />
                  </Field>
                  <Field label="Categoría">
                    <select className="select" value={prodCat} onChange={(e) => setProdCat(e.target.value)}>
                      <option value="">Sin categoría</option>
                      {state.categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <button className="btn btn--soft" type="submit">
                  <Icon name="plus" /> Agregar producto
                </button>
              </form>
            </Card>
          )}

          {step === 5 && (
            <Card title="Proveedores" hint="A quién le compras. Lo usarás en compras y cuentas por pagar.">
              <div className="mini-list">
                {state.contacts
                  .filter((c) => c.isProvider)
                  .map((c) => (
                    <div key={c.id} className="mini-list__row">
                      <Icon name="users" />
                      <span>
                        {c.name}
                        {c.phone ? ` · ${c.phone}` : ""}
                      </span>
                      <button
                        className="icon-btn"
                        onClick={() => actions.removeContact(c.id)}
                        aria-label="Quitar"
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  ))}
                {state.contacts.filter((c) => c.isProvider).length === 0 && (
                  <p className="muted">Aún no hay proveedores.</p>
                )}
              </div>
              <form onSubmit={addProviderStep}>
                <Field label="Nombre o razón social" required>
                  <input className="input" value={provName} onChange={(e) => setProvName(e.target.value)} />
                </Field>
                <div className="row gap-12">
                  <Field label="RIF / documento">
                    <input className="input" value={provDoc} onChange={(e) => setProvDoc(e.target.value)} placeholder="J-000000000" />
                  </Field>
                  <Field label="Teléfono">
                    <input className="input" value={provPhone} onChange={(e) => setProvPhone(e.target.value)} />
                  </Field>
                </div>
                <Field label="Correo">
                  <input className="input" type="email" value={provEmail} onChange={(e) => setProvEmail(e.target.value)} />
                </Field>
                <button className="btn btn--soft" type="submit">
                  <Icon name="plus" /> Agregar proveedor
                </button>
              </form>
            </Card>
          )}

          <div className="wizard__nav">
            <button className="btn btn--ghost" onClick={back} disabled={step === 0}>
              Atrás
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn btn--primary" onClick={next}>
                Continuar
                <Icon name="arrowRight" />
              </button>
            ) : (
              <button className="btn btn--primary" onClick={finish} disabled={!canFinish}>
                Terminar <Icon name="check" />
              </button>
            )}
          </div>
          {step === STEPS.length - 1 && !canFinish && (
            <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.5rem", textAlign: "right" }}>
              Necesitas el nombre del comercio y al menos una cuenta de pagos.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
