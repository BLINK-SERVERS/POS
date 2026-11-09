// Activación del comercio: $25 cada 30 días.
//
// La cuenta se crea al registrarse, pero el POS (y la fila de `businesses`)
// no existe hasta que un administrador concilia el pago. Esta pantalla:
//   · muestra el importe en USD y en bolívares con la tasa Binance P2P viva;
//   · da los datos de Pago Móvil y el Binance Pay para pagar;
//   · recoge el reporte del pago (queda «en revisión»);
//   · muestra el aviso de borrado a las 24 h mientras no se concilie.
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth, useActivacion, useBooting, useStoreActions } from "../lib/store";
import {
  cloudListarPagos,
  cloudReportarPago,
  estadoReal,
  fechaCorta,
  nombreMetodo,
  PAGO,
  PRECIO_USD,
  restante,
  restanteTexto,
  type MetodoPago,
  type PagoActivacion,
} from "../lib/activacion";
import {
  decimalesDe,
  equivalente,
  fetchCripto,
  fetchTasaP2P,
  formatearNumero,
  hace,
  type Cripto,
  type ResultadoTasa,
} from "../lib/tasa";
import { BrandLogo } from "../components/BrandLogo";
import { BrandLoader } from "../components/BrandLoader";
import { Icon } from "../components/Icon";
import { QrCode } from "../components/QrCode";
import { Badge, Field, Modal, Tabs } from "../components/ui";
import { useCopiar } from "../components/useCopiar";

type Pestana = "Pago Móvil" | "Cripto";
type MonedaCripto = "USDT" | "USDC" | "BTC" | "ETH";

const MONEDAS: MonedaCripto[] = ["USDT", "USDC", "BTC", "ETH"];

/** Acepta «25875», «25.875,00» y «25,875.00». */
export function parseMonto(texto: string): number {
  const limpio = texto.replace(/\s/g, "").replace(/[^\d.,-]/g, "");
  if (!limpio) return NaN;
  const tienePunto = limpio.includes(".");
  const tieneComa = limpio.includes(",");
  let normal = limpio;
  if (tienePunto && tieneComa) {
    // El último separador es el decimal.
    normal =
      limpio.lastIndexOf(",") > limpio.lastIndexOf(".")
        ? limpio.replace(/\./g, "").replace(",", ".")
        : limpio.replace(/,/g, "");
  } else if (tieneComa) {
    normal = limpio.replace(",", ".");
  }
  const n = Number(normal);
  return Number.isFinite(n) ? n : NaN;
}

function ChipTasa({
  tasa,
  cargando,
  onRefrescar,
}: {
  tasa: ResultadoTasa | null;
  cargando: boolean;
  onRefrescar: () => void;
}) {
  const viva = tasa?.ok ? tasa.tasa : tasa?.ultima ?? null;
  return (
    <div className={"act__chip" + (viva ? "" : " act__chip--error")}>
      <span className="act__chip-dot" aria-hidden />
      <span>
        {viva ? (
          <>
            Binance P2P · Bs {formatearNumero(viva.tasa)} · {hace(viva.en)}
            {!tasa?.ok && " (última conocida)"}
          </>
        ) : (
          "Tasa no disponible"
        )}
      </span>
      <button
        type="button"
        className="act__chip-btn"
        onClick={onRefrescar}
        disabled={cargando}
        aria-label="Actualizar la tasa"
      >
        <Icon name="refresh" size="sm" />
        {cargando ? "…" : ""}
      </button>
    </div>
  );
}

function FilaDato({
  etiqueta,
  valor,
  clave,
  copiar,
  copiado,
  mono = true,
}: {
  etiqueta: string;
  valor: string;
  clave: string;
  copiar: (texto: string, clave?: string) => Promise<boolean>;
  copiado: string | null;
  mono?: boolean;
}) {
  return (
    <div className="act__dato">
      <div>
        <div className="act__dato-label">{etiqueta}</div>
        <div className={mono ? "act__dato-value tabular" : "act__dato-value"}>{valor}</div>
      </div>
      <button
        type="button"
        className="act__copy"
        onClick={() => void copiar(valor, clave)}
        aria-label={`Copiar ${etiqueta.toLowerCase()}`}
      >
        <Icon name={copiado === clave ? "check" : "copy"} size="sm" />
        {copiado === clave ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

export function Activacion() {
  const nav = useNavigate();
  const authed = useAuth();
  const booting = useBooting();
  const activacion = useActivacion();
  const { refrescarActivacion, logout } = useStoreActions();
  const { copiar, copiado } = useCopiar();

  const real = estadoReal(activacion);
  const operable = real === "activo";
  const vencido = real === "vencido";

  const [tasaRes, setTasaRes] = useState<ResultadoTasa | null>(null);
  const [cargandoTasa, setCargandoTasa] = useState(false);
  const [cripto, setCripto] = useState<Cripto>({ btc: null, eth: null, usdc: null });
  const [pestana, setPestana] = useState<Pestana>("Pago Móvil");
  const [moneda, setMoneda] = useState<MonedaCripto>("USDT");
  const [pagos, setPagos] = useState<PagoActivacion[]>([]);
  const [ahora, setAhora] = useState(() => Date.now());
  const [abrir, setAbrir] = useState(false);
  // Una cuenta activa puede adelantar la renovación sin apagar el POS.
  const [renovando, setRenovando] = useState(false);

  // Formulario del reporte.
  const [ref, setRef] = useState("");
  const [nota, setNota] = useState("");
  const [montoTexto, setMontoTexto] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cargarTasa = useCallback(async (forzar = false) => {
    setCargandoTasa(true);
    const r = await fetchTasaP2P({ forzar });
    setTasaRes(r);
    setCargandoTasa(false);
  }, []);

  const cargarPagos = useCallback(async () => {
    try {
      setPagos(await cloudListarPagos());
    } catch {
      /* RLS o red: el historial es informativo */
    }
  }, []);

  useEffect(() => {
    void cargarTasa();
    void fetchCripto().then(setCripto);
    void cargarPagos();
  }, [cargarTasa, cargarPagos]);

  // Reloj de la cuenta atrás (borrado y vigencia).
  useEffect(() => {
    const id = window.setInterval(() => setAhora(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // En revisión: se busca la aprobación cada 20 s, sin que el usuario recargue.
  useEffect(() => {
    if (real !== "en_revision") return;
    const id = window.setInterval(() => {
      void refrescarActivacion();
      void cargarPagos();
    }, 20_000);
    return () => window.clearInterval(id);
  }, [real, refrescarActivacion, cargarPagos]);

  const tasaViva = tasaRes?.ok ? tasaRes.tasa : tasaRes?.ultima ?? null;
  const tasaVieja = !tasaRes?.ok && !!tasaRes?.ultima;
  const montoBs = tasaViva ? Math.round(PRECIO_USD * tasaViva.tasa * 100) / 100 : null;

  const precioCripto = useMemo<Record<MonedaCripto, number | null>>(
    () => ({
      USDT: 1,
      USDC: cripto.usdc ?? 1,
      BTC: cripto.btc,
      ETH: cripto.eth,
    }),
    [cripto]
  );

  const esPagoMovil = pestana === "Pago Móvil";
  const metodoReportado: MetodoPago = esPagoMovil
    ? "pago_movil"
    : (moneda.toLowerCase() as MetodoPago);
  const monedaReportada = esPagoMovil ? "VES" : moneda;
  const montoCripto = useMemo(() => {
    const precio = precioCripto[moneda];
    return equivalente(PRECIO_USD, precio ?? 0);
  }, [precioCripto, moneda]);

  const datosPagoMovil = useMemo(
    () =>
      [
        `Blink POS — Pago Móvil`,
        `Cédula: ${PAGO.pagoMovil.cedula}`,
        `Teléfono: ${PAGO.pagoMovil.telefono}`,
        `Banco: ${PAGO.pagoMovil.banco}`,
        montoBs != null ? `Monto: Bs ${formatearNumero(montoBs)}` : "",
        `Concepto: Activación Blink POS`,
      ]
        .filter(Boolean)
        .join("\n"),
    [montoBs]
  );

  if (booting) return <BrandLoader />;
  if (!authed) return <Navigate to="/app/entrar" replace />;

  const enRevision = real === "en_revision";
  const rechazado = real === "rechazado";
  const pagoEnRevision = pagos.find((p) => p.estado === "en_revision") ?? null;
  const ultimoRechazo = pagos.find((p) => p.estado === "rechazado") ?? null;
  const restantePurga = restante(activacion?.purgeEn, ahora);
  const mostrarPago = (!operable && !enRevision) || (operable && renovando);

  function abrirFormulario() {
    const prefill = esPagoMovil
      ? montoBs != null
        ? formatearNumero(montoBs)
        : ""
      : montoCripto != null
        ? formatearNumero(montoCripto, decimalesDe(monedaReportada))
        : "";
    setMontoTexto(prefill);
    setRef("");
    setNota("");
    setError("");
    setAbrir(true);
  }

  async function enviarReporte(e: FormEvent) {
    e.preventDefault();
    setError("");
    const monto = parseMonto(montoTexto);
    if (!Number.isFinite(monto) || monto <= 0) {
      setError("Escribe el monto que pagaste.");
      return;
    }
    if (ref.trim().length < 3) {
      setError("Escribe el número de referencia o de transacción (mínimo 3 caracteres).");
      return;
    }
    setEnviando(true);
    const r = await cloudReportarPago({
      metodo: metodoReportado,
      moneda: monedaReportada,
      monto,
      tasa: esPagoMovil ? tasaViva?.tasa ?? null : null,
      referencia: ref.trim(),
      nota: nota.trim() || null,
    });
    setEnviando(false);
    if (r.error) {
      setError(r.error);
      return;
    }
    setAbrir(false);
    setRenovando(false);
    await refrescarActivacion();
    await cargarPagos();
  }

  async function salir() {
    await logout();
    nav("/app/entrar", { replace: true });
  }

  return (
    <main className="act">
      <header className="act__bar">
        <BrandLogo className="brand-logo--act" />
        <button type="button" className="btn btn--plain btn--sm" onClick={salir}>
          <Icon name="logout" size="sm" /> Salir
        </button>
      </header>

      <div className="act__wrap">
        {/* ---------- Estado ---------- */}
        {operable && (
          <section className="act__hero act__hero--ok">
            <span className="act__hero-icon">
              <Icon name="checkmarkCircle" size="xl" />
            </span>
            <div>
              <h1>Tu comercio está activo</h1>
              <p>
                {activacion?.vigenteHasta
                  ? `Cubre hasta el ${fechaCorta(activacion.vigenteHasta)}`
                  : "Tu cuenta está activa y sin fecha de corte."}
              </p>
              {pagoEnRevision && (
                <p className="act__deadline">
                  <Icon name="clock" size="sm" />
                  <span>
                    Tienes un pago de renovación en revisión desde el{" "}
                    {fechaCorta(pagoEnRevision.creadoEn)}
                  </span>
                </p>
              )}
            </div>
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() => nav("/app/inicio", { replace: true })}
            >
              Ir al POS <Icon name="arrowRight" size="sm" />
            </button>
            {!pagoEnRevision && (
              <button
                type="button"
                className="btn btn--soft btn--block"
                onClick={() => setRenovando((v) => !v)}
              >
                <Icon name={renovando ? "arrowUp" : "refresh"} size="sm" />
                {renovando ? "Ocultar la renovación" : "Renovar 30 días"}
              </button>
            )}
          </section>
        )}

        {!operable && (
          <>
            <section className={"act__hero" + (rechazado ? " act__hero--bad" : "")}>
              <h1>
                {enRevision
                  ? "Tu pago está en revisión"
                  : rechazado
                    ? "Ese pago no se pudo conciliar"
                    : vencido
                      ? "Tu suscripción venció"
                      : "Activa tu comercio"}
              </h1>
              <p>
                {enRevision
                  ? "Lo estamos verificando. Esta pantalla se actualiza sola; te avisamos en cuanto quede aprobado."
                  : rechazado
                    ? ultimoRechazo?.motivo || "Revisa los datos y vuelve a reportar el pago."
                    : vencido
                      ? `El período de 30 días${activacion?.vigenteHasta ? ` venció el ${fechaCorta(activacion.vigenteHasta)}` : " ya terminó"}; renueva para volver a cobrar y seguir donde ibas.`
                      : "Blink POS cuesta $25 cada 30 días. Paga por Pago Móvil o Binance Pay y reporta el pago aquí."}
              </p>
              {restantePurga && !restantePurga.vencido && (
                <p className="act__deadline">
                  <Icon name="clock" size="sm" />
                  <span>
                    La cuenta se elimina en{" "}
                    <strong>{restanteTexto(activacion?.purgeEn, ahora)}</strong> si el pago no se
                    concilia. Se borran la cuenta y sus datos.
                  </span>
                </p>
              )}
            </section>

            {enRevision && pagoEnRevision && (
              <section className="card act__card">
                <div className="act__resumen">
                  <div className="act__resumen-top">
                    <div>
                      <div className="act__dato-label">Pago reportado</div>
                      <div className="act__dato-value">
                        {nombreMetodo(pagoEnRevision.metodo)} · {formatearNumero(pagoEnRevision.monto)}{" "}
                        {pagoEnRevision.moneda}
                      </div>
                    </div>
                    <Badge tone="warning" icon="alert">
                      En revisión
                    </Badge>
                  </div>
                  <div className="act__dato-label">
                    Ref. {pagoEnRevision.referencia} · {fechaCorta(pagoEnRevision.creadoEn)}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn--soft btn--block"
                  style={{ marginTop: "0.9rem" }}
                  onClick={() => void refrescarActivacion()}
                >
                  <Icon name="refresh" size="sm" /> Actualizar estado
                </button>
              </section>
            )}
          </>
        )}

        {/* ---------- Precio y medios de pago ---------- */}
        {mostrarPago && (
          <>
            <section className="card act__card">
              <div className="act__price">
                <div>
                  <div className="act__dato-label">Total a pagar</div>
                  <div className="act__price-usd">$ {formatearNumero(PRECIO_USD)}</div>
                  <div className="act__price-bs">
                    {montoBs != null ? `Bs ${formatearNumero(montoBs)}` : "Bs —"}
                  </div>
                </div>
                <div className="act__price-meta">
                  <span>Cada 30 días</span>
                  <span>Activa al conciliar</span>
                </div>
              </div>

              <ChipTasa tasa={tasaRes} cargando={cargandoTasa} onRefrescar={() => void cargarTasa(true)} />

              {tasaVieja && (
                <p className="act__aviso">
                  <Icon name="alert" size="sm" /> No pudimos leer la tasa ahora mismo. Te mostramos
                  la última conocida: confirma el monto antes de pagar o reintenta.
                </p>
              )}
              {tasaRes && !tasaRes.ok && !tasaRes.ultima && (
                <p className="act__aviso act__aviso--bad">
                  <Icon name="alert" size="sm" /> {tasaRes.error}{" "}
                  <button type="button" className="link-btn" onClick={() => void cargarTasa(true)}>
                    Reintentar
                  </button>
                </p>
              )}
            </section>

            <section className="card act__card">
              <Tabs<Pestana>
                tabs={["Pago Móvil", "Cripto"] as const}
                value={pestana}
                onChange={setPestana}
              />

              {esPagoMovil ? (
                <div className="act__datos">
                  <FilaDato
                    etiqueta="Cédula"
                    valor={PAGO.pagoMovil.cedula}
                    clave="ci"
                    copiar={copiar}
                    copiado={copiado}
                  />
                  <FilaDato
                    etiqueta="Teléfono"
                    valor={PAGO.pagoMovil.telefono}
                    clave="tel"
                    copiar={copiar}
                    copiado={copiado}
                  />
                  <FilaDato
                    etiqueta="Banco"
                    valor={PAGO.pagoMovil.banco}
                    clave="banco"
                    copiar={copiar}
                    copiado={copiado}
                  />
                  <FilaDato
                    etiqueta="Monto exacto"
                    valor={montoBs != null ? `Bs ${formatearNumero(montoBs)}` : "—"}
                    clave="monto"
                    copiar={copiar}
                    copiado={copiado}
                  />
                  <button
                    type="button"
                    className="btn btn--soft btn--block"
                    style={{ marginTop: "0.75rem" }}
                    disabled={montoBs == null}
                    onClick={() => void copiar(datosPagoMovil, "todo")}
                  >
                    <Icon name={copiado === "todo" ? "check" : "copy"} size="sm" />
                    {copiado === "todo" ? "Datos copiados" : "Copiar datos"}
                  </button>
                  <p className="act__nota">
                    Paga desde tu banco con los datos de arriba. El monto en bolívares cambia con
                    la tasa: usa el que ves aquí en el momento de pagar.
                  </p>
                </div>
              ) : (
                <div className="act__datos">
                  <div className="act__coins" role="group" aria-label="Moneda a enviar">
                    {MONEDAS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={"act__coin" + (moneda === m ? " act__coin--on" : "")}
                        aria-pressed={moneda === m}
                        onClick={() => setMoneda(m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <div className="act__cripto">
                    <div>
                      <div className="act__dato-label">Envía exactamente</div>
                      <div className="act__dato-value act__dato-value--big">
                        {montoCripto != null
                          ? `${formatearNumero(montoCripto, decimalesDe(monedaReportada))} ${moneda}`
                          : "—"}
                      </div>
                      <div className="act__dato-label" style={{ marginTop: "0.3rem" }}>
                        Destino: Binance Pay
                      </div>
                      <div className="act__dato-value tabular">{PAGO.binancePayId}</div>
                    </div>
                    <div className="act__qr">
                      <QrCode value={PAGO.binancePayId} size={112} />
                    </div>
                  </div>

                  <FilaDato
                    etiqueta="Binance Pay ID"
                    valor={PAGO.binancePayId}
                    clave="binance"
                    copiar={copiar}
                    copiado={copiado}
                  />
                  <p className="act__nota">
                    Abre Binance → Pay → Enviar y busca este ID. Manda la cantidad exacta en{" "}
                    {moneda}. Si cambias de moneda, el monto cambia.
                  </p>
                </div>
              )}
            </section>

            <button
              type="button"
              className="btn btn--primary btn--block act__cta"
              onClick={abrirFormulario}
            >
              Ya pagué <Icon name="arrowRight" size="sm" />
            </button>

            <p className="act__legal">
              {operable
                ? "Al aprobar la renovación se suman 30 días a tu vigencia actual, sin apagar el POS mientras se revisa."
                : vencido
                  ? "Cada pago cubre 30 días. Al conciliarlo vuelves a operar de inmediato; no se borra nada de tu cuenta."
                  : "Cada pago cubre 30 días. Mientras no se concilie, la cuenta se elimina a las 24 h del registro junto con lo que hayas cargado."}
            </p>
          </>
        )}

        {enRevision && (
          <p className="act__legal">
            No cierres la sesión si puedes evitarlo: con la sesión abierta verás la aprobación en
            vivo. Si la cierras, entra de nuevo y vuelve a esta pantalla.
          </p>
        )}
      </div>

      {abrir && (
        <Modal title="Reportar el pago" onClose={() => setAbrir(false)}>
          <form onSubmit={enviarReporte} className="act__form">
            <div className="act__form-resumen">
              <Badge tone="accent">{esPagoMovil ? "Pago Móvil" : `Binance Pay · ${moneda}`}</Badge>
              <span className="muted">
                {esPagoMovil
                  ? montoBs != null
                    ? `Bs ${formatearNumero(montoBs)}`
                    : "Monto en Bs pendiente de tasa"
                  : montoCripto != null
                    ? `${formatearNumero(montoCripto, decimalesDe(monedaReportada))} ${moneda}`
                    : "Monto pendiente de precio"}
              </span>
            </div>

            <Field label={`Monto pagado (${monedaReportada})`} required>
              <input
                className="input tabular"
                inputMode="decimal"
                value={montoTexto}
                onChange={(e) => setMontoTexto(e.target.value)}
                placeholder={esPagoMovil ? "25.875,00" : "25,00"}
              />
            </Field>

            <Field
              label={esPagoMovil ? "Número de referencia" : "ID de transacción"}
              required
              hint="Cópialo del comprobante de tu banco o de Binance. Lo usamos para identificarlo."
            >
              <input
                className="input"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder={esPagoMovil ? "Ej.: 123456789" : "Ej.: TX-9988776655"}
                autoComplete="off"
              />
            </Field>

            <Field label="Nota (opcional)">
              <input
                className="input"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Banco emisor, titular u otro dato útil"
              />
            </Field>

            {error && <p className="field__error">{error}</p>}

            <button className="btn btn--primary btn--block" type="submit" disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar a revisión"}
            </button>
            <p className="act__nota" style={{ textAlign: "center" }}>
              Al enviarlo, el pago queda «en revisión». Un administrador lo concilia y tu comercio
              se activa.
            </p>
          </form>
        </Modal>
      )}
    </main>
  );
}
