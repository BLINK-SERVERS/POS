// Panel de conciliación (solo administración).
//
// Cada alta nace «pendiente». El comercio no existe hasta que aquí se
// aprueba el pago reportado; si nadie lo concilia en 24 h, la purga
// elimina la cuenta. Esta pantalla junta las dos listas de la base
// (activaciones y pagos) y llama a las funciones `decidir_pago`,
// `eliminar_cuenta` y `purgar_activaciones`.
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useStoreActions } from "../lib/store";
import {
  cloudDecidirPago,
  cloudEliminarCuenta,
  cloudListarActivaciones,
  cloudListarPagos,
  cloudPurgar,
  estadoReal,
  fechaCorta,
  nombreMetodo,
  restante,
  restanteTexto,
  type Activacion,
  type EstadoReal,
  type PagoActivacion,
} from "../lib/activacion";
import { decimalesDe, formatearNumero } from "../lib/tasa";
import { Icon, type IconName } from "../components/Icon";
import {
  Badge,
  EmptyState,
  Field,
  Modal,
  PageHead,
  Tabs,
  useConfirm,
} from "../components/ui";

type Filtro = "Por revisar" | "Sin pago" | "Activos" | "Rechazados" | "Todos";

const FILTROS: readonly Filtro[] = [
  "Por revisar",
  "Sin pago",
  "Activos",
  "Rechazados",
  "Todos",
];

function tonoEstado(e: EstadoReal): "accent" | "neutral" | "warning" | "danger" {
  switch (e) {
    case "activo":
      return "accent";
    case "en_revision":
      return "warning";
    case "rechazado":
    case "vencido":
      return "danger";
    default:
      return "neutral";
  }
}

function textoEstado(e: EstadoReal): string {
  switch (e) {
    case "activo":
      return "Activo";
    case "en_revision":
      return "En revisión";
    case "rechazado":
      return "Rechazado";
    case "vencido":
      return "Vencido";
    default:
      return "Sin pago";
  }
}

/** «Bs 25.875,00» o «25,00 USDT». */
function montoTexto(monto: number, moneda: string): string {
  return moneda === "VES"
    ? `Bs ${formatearNumero(monto)}`
    : `${formatearNumero(monto, decimalesDe(moneda))} ${moneda}`;
}

/** «hace 2 h» a partir de una fecha. */
function antiguedad(iso: string, ahora: number): string {
  const r = restante(iso, ahora);
  if (!r) return "—";
  const ms = Math.abs(r.ms);
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} ${d === 1 ? "día" : "días"}`;
}

export function AdminConciliacion() {
  const { refrescarActivacion } = useStoreActions();
  const confirm = useConfirm();

  const [filtro, setFiltro] = useState<Filtro>("Por revisar");
  const [acts, setActs] = useState<Activacion[]>([]);
  const [pagos, setPagos] = useState<PagoActivacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [ahora, setAhora] = useState(() => Date.now());

  const [rechazo, setRechazo] = useState<{ pago: PagoActivacion; nombre: string } | null>(null);
  const [motivo, setMotivo] = useState("");
  const [errorRechazo, setErrorRechazo] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const [a, p] = await Promise.all([cloudListarActivaciones(), cloudListarPagos()]);
      setActs(a);
      setPagos(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer la cola de conciliación.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Cuenta atrás de la purga, sin recargar la lista.
  useEffect(() => {
    const id = window.setInterval(() => setAhora(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  /** Último pago de cada usuario (la lista viene del más reciente al más viejo). */
  const pagosPorUsuario = useMemo(() => {
    const mapa = new Map<string, PagoActivacion[]>();
    for (const p of pagos) {
      const lista = mapa.get(p.userId);
      if (lista) lista.push(p);
      else mapa.set(p.userId, [p]);
    }
    return mapa;
  }, [pagos]);

  const lista = useMemo(() => {
    const conEstado = acts.map((a) => ({
      a,
      real: estadoReal(a, ahora),
      pagos: pagosPorUsuario.get(a.userId) ?? [],
    }));

    const filtradas = conEstado.filter(({ a, real }) => {
      switch (filtro) {
        case "Por revisar":
          return a.estado === "en_revision";
        case "Sin pago":
          return a.estado === "pendiente";
        case "Activos":
          return real === "activo" || real === "vencido";
        case "Rechazados":
          return a.estado === "rechazado";
        default:
          return true;
      }
    });

    // La cola de revisión se atiende por antigüedad: primero lo que lleva
    // más tiempo esperando. El resto, del alta más reciente a la más vieja.
    const porFecha = (x: Activacion, y: Activacion) =>
      new Date(y.creadoEn).getTime() - new Date(x.creadoEn).getTime();
    return filtro === "Por revisar"
      ? filtradas.sort((x, y) => porFecha(y.a, x.a))
      : filtradas.sort((x, y) => porFecha(x.a, y.a));
  }, [acts, pagosPorUsuario, filtro, ahora]);

  const vencidasParaPurgar = useMemo(
    () =>
      acts.filter(
        (a) =>
          (a.estado === "pendiente" || a.estado === "rechazado") &&
          a.purgeEn != null &&
          new Date(a.purgeEn).getTime() < ahora
      ).length,
    [acts, ahora]
  );

  async function aprobar(pago: PagoActivacion, nombre: string) {
    const ok = await confirm({
      title: "¿Aprobar este pago?",
      message: `${nombre || pago.email} quedará activo 30 días y podrá crear su comercio. Comprueba la referencia ${pago.referencia} en el comprobante.`,
      confirmText: "Aprobar",
    });
    if (!ok) return;

    setTrabajando(pago.id);
    setError("");
    setAviso("");
    const r = await cloudDecidirPago(pago.id, true);
    setTrabajando(null);
    if (r.error) {
      setError(r.error);
      return;
    }
    setAviso(`Pago aprobado: ${pago.email}. La cuenta quedó activa 30 días.`);
    await cargar();
    // Si el administrador miraba su propia cuenta, el estado ya cambió.
    void refrescarActivacion();
  }

  function abrirRechazo(pago: PagoActivacion, nombre: string) {
    setRechazo({ pago, nombre });
    setMotivo("");
    setErrorRechazo("");
  }

  async function enviarRechazo(e: FormEvent) {
    e.preventDefault();
    if (!rechazo) return;
    if (motivo.trim().length < 3) {
      setErrorRechazo("Escribe el motivo; el comercio lo verá en su pantalla.");
      return;
    }
    setTrabajando(rechazo.pago.id);
    setError("");
    setAviso("");
    const r = await cloudDecidirPago(rechazo.pago.id, false, motivo.trim());
    setTrabajando(null);
    if (r.error) {
      setErrorRechazo(r.error);
      return;
    }
    setAviso(`Pago rechazado: ${rechazo.pago.email}. Tiene 24 h para reintentar.`);
    setRechazo(null);
    await cargar();
  }

  async function eliminar(a: Activacion) {
    const ok = await confirm({
      title: "¿Eliminar esta cuenta?",
      message: `${a.email} y todo lo que haya cargado se borran de forma permanente. Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      destructive: true,
    });
    if (!ok) return;

    setTrabajando(a.userId);
    setError("");
    setAviso("");
    const r = await cloudEliminarCuenta(a.userId);
    setTrabajando(null);
    if (r.error) {
      setError(r.error);
      return;
    }
    setAviso(`Cuenta eliminada: ${a.email}.`);
    await cargar();
  }

  async function purgar() {
    const ok = await confirm({
      title: "¿Purgar las cuentas vencidas?",
      message:
        vencidasParaPurgar > 0
          ? `Se eliminarán ${vencidasParaPurgar} ${vencidasParaPurgar === 1 ? "cuenta" : "cuentas"} pendientes o rechazadas cuyo plazo de 24 h ya venció.`
          : "Ahora mismo no hay cuentas vencidas; la purga no borrará nada.",
      confirmText: "Purgar",
      destructive: true,
    });
    if (!ok) return;

    setTrabajando("__purga");
    setError("");
    setAviso("");
    const r = await cloudPurgar();
    setTrabajando(null);
    if (r.error) {
      setError(r.error);
      return;
    }
    setAviso(
      r.total === 0
        ? "No había cuentas vencidas que purgar."
        : `${r.total} ${r.total === 1 ? "cuenta eliminada" : "cuentas eliminadas"}.`
    );
    await cargar();
  }

  const vacio: Record<Filtro, { titulo: string; pista: string; icono: IconName }> = {
    "Por revisar": {
      titulo: "Nada por revisar",
      pista: "Cuando alguien reporte un pago aparecerá aquí para conciliarlo.",
      icono: "checkmarkCircle",
    },
    "Sin pago": {
      titulo: "Nadie está esperando pago",
      pista: "Las cuentas nuevas aparecen aquí hasta que reportan su pago.",
      icono: "clock",
    },
    Activos: {
      titulo: "Sin cuentas activas",
      pista: "Las cuentas aprobadas se listan aquí con su fecha de corte.",
      icono: "seal",
    },
    Rechazados: {
      titulo: "Sin pagos rechazados",
      pista: "Los rechazos quedan aquí con su motivo y su nueva ventana de 24 h.",
      icono: "xmarkCircle",
    },
    Todos: {
      titulo: "Sin cuentas",
      pista: "Aún no se ha registrado ningún comercio.",
      icono: "person",
    },
  };

  return (
    <div className="stack gap-16 adm">
      <PageHead
        title="Conciliación"
        subtitle="Activa comercios al aprobar su pago y limpia las altas impagas."
        actions={
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => void cargar()}
            disabled={cargando || trabajando != null}
          >
            <Icon name="refresh" size="sm" /> Actualizar
          </button>
        }
      />

      <div className="row gap-8" style={{ flexWrap: "wrap" }}>
        <Tabs<Filtro> tabs={FILTROS} value={filtro} onChange={setFiltro} />
        <span className="grow" />
        <button
          type="button"
          className="btn btn--danger btn--sm"
          onClick={() => void purgar()}
          disabled={trabajando != null}
        >
          <Icon name="trash" size="sm" />
          {vencidasParaPurgar > 0 ? `Purgar vencidas (${vencidasParaPurgar})` : "Purgar vencidas"}
        </button>
      </div>

      {error && (
        <p className="adm__banner adm__banner--bad" role="alert">
          <Icon name="alert" size="sm" /> {error}
        </p>
      )}
      {aviso && (
        <p className="adm__banner" role="status">
          <Icon name="checkmarkCircle" size="sm" /> {aviso}
        </p>
      )}

      <p className="adm__cuenta muted">
        {cargando ? "Leyendo…" : `${lista.length} ${lista.length === 1 ? "cuenta" : "cuentas"} en esta vista`}
      </p>

      {cargando && acts.length === 0 ? (
        <div className="adm__esqueleto" aria-hidden>
          <div className="adm__hueso" />
          <div className="adm__hueso" />
          <div className="adm__hueso" />
        </div>
      ) : lista.length === 0 ? (
        <EmptyState
          icon={vacio[filtro].icono}
          title={vacio[filtro].titulo}
          hint={vacio[filtro].pista}
        />
      ) : (
        <section className="card adm__lista">
          {lista.map(({ a, real, pagos: suyos }) => {
            const pendiente = suyos.find((p) => p.estado === "en_revision") ?? null;
            const rechazado = suyos.find((p) => p.estado === "rechazado") ?? null;
            const ultimo = suyos[0] ?? null;
            const r = restante(a.purgeEn, ahora);
            const ocupado = trabajando === a.userId || (pendiente && trabajando === pendiente.id);
            const nombre = a.nombre || a.email;

            return (
              <article className="adm__fila" key={a.userId}>
                <header className="adm__fila-head">
                  <div>
                    <div className="adm__nombre">{nombre}</div>
                    <div className="adm__correo">{a.email}</div>
                  </div>
                  <Badge tone={tonoEstado(real)}>{textoEstado(real)}</Badge>
                </header>

                <div className="adm__meta">
                  <span>
                    <Icon name="calendar" size="sm" /> Alta {fechaCorta(a.creadoEn)}{" "}
                    <span className="dim">({antiguedad(a.creadoEn, ahora)})</span>
                  </span>
                  {r && !r.vencido && (
                    <span className={r.ms < 6 * 3_600_000 ? "adm__meta--urgente" : undefined}>
                      <Icon name="clock" size="sm" /> Se borra en{" "}
                      <strong>{restanteTexto(a.purgeEn, ahora)}</strong>
                    </span>
                  )}
                  {r?.vencido && a.estado !== "activo" && (
                    <span className="adm__meta--urgente">
                      <Icon name="clock" size="sm" /> Plazo vencido: se puede purgar
                    </span>
                  )}
                  {real === "activo" && a.vigenteHasta && (
                    <span>
                      <Icon name="seal" size="sm" /> Cubre hasta {fechaCorta(a.vigenteHasta)}
                    </span>
                  )}
                  {real === "vencido" && (
                    <span className="adm__meta--urgente">
                      <Icon name="clock" size="sm" /> Venció el {fechaCorta(a.vigenteHasta)}
                    </span>
                  )}
                </div>

                {ultimo && (
                  <div className="adm__pago">
                    <div className="adm__pago-cab">
                      <span>
                        Pago {ultimo.estado === "en_revision" ? "reportado" : ultimo.estado}
                      </span>
                      <Badge
                        tone={
                          ultimo.estado === "aprobado"
                            ? "accent"
                            : ultimo.estado === "rechazado"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {ultimo.estado === "en_revision"
                          ? "En revisión"
                          : ultimo.estado === "aprobado"
                            ? "Aprobado"
                            : "Rechazado"}
                      </Badge>
                    </div>
                    <div className="adm__pago-grid">
                      <div>
                        <span>Método</span>
                        <strong>{nombreMetodo(ultimo.metodo)}</strong>
                      </div>
                      <div>
                        <span>Monto</span>
                        <strong className="tabular">
                          {montoTexto(ultimo.monto, ultimo.moneda)}
                        </strong>
                      </div>
                      <div>
                        <span>Referencia</span>
                        <strong className="mono">{ultimo.referencia}</strong>
                      </div>
                      <div>
                        <span>Reportado</span>
                        <strong>{fechaCorta(ultimo.creadoEn)}</strong>
                      </div>
                      {ultimo.tasaVes != null && (
                        <div>
                          <span>Tasa aplicada</span>
                          <strong className="tabular">Bs {formatearNumero(ultimo.tasaVes)}</strong>
                        </div>
                      )}
                      <div>
                        <span>Equivale a</span>
                        <strong className="tabular">$ {formatearNumero(ultimo.montoUsd)}</strong>
                      </div>
                    </div>
                    {ultimo.nota && <p className="adm__nota">{ultimo.nota}</p>}
                    {ultimo.estado === "rechazado" && ultimo.motivo && (
                      <p className="adm__nota adm__nota--bad">
                        Motivo del rechazo: {ultimo.motivo}
                      </p>
                    )}
                  </div>
                )}

                {!ultimo && a.estado === "pendiente" && (
                  <p className="adm__nota">
                    Todavía no reportó ningún pago. El alta se elimina sola al cumplirse las 24 h.
                  </p>
                )}

                {rechazado && !pendiente && a.estado === "rechazado" && (
                  <p className="adm__nota adm__nota--bad">
                    {rechazado.motivo
                      ? `Motivo: ${rechazado.motivo}`
                      : "Pago no identificado. El comercio puede volver a reportarlo."}
                  </p>
                )}

                <div className="row-actions adm__acciones">
                  {pendiente ? (
                    <>
                      <button
                        type="button"
                        className="btn btn--sm"
                        onClick={() => void aprobar(pendiente, nombre)}
                        disabled={trabajando != null}
                      >
                        <Icon name="checkmarkCircle" size="sm" />
                        {trabajando === pendiente.id ? "Aprobando…" : "Aprobar"}
                      </button>
                      <button
                        type="button"
                        className="btn btn--sm btn--danger"
                        onClick={() => abrirRechazo(pendiente, nombre)}
                        disabled={trabajando != null}
                      >
                        <Icon name="xmarkCircle" size="sm" /> Rechazar
                      </button>
                    </>
                  ) : (
                    <span className="adm__sin-accion muted">
                      {a.estado === "activo"
                        ? "Sin pagos por conciliar"
                        : a.estado === "en_revision"
                          ? "Pago ya revisado"
                          : "Sin pago reportado"}
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn btn--sm btn--danger"
                    onClick={() => void eliminar(a)}
                    disabled={trabajando != null}
                  >
                    <Icon name="trash" size="sm" />
                    {ocupado ? "Eliminando…" : "Eliminar cuenta"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {rechazo && (
        <Modal title="Rechazar el pago" onClose={() => setRechazo(null)}>
          <form className="act__form" onSubmit={enviarRechazo}>
            <div className="act__form-resumen">
              <Badge tone="warning">{rechazo.nombre || rechazo.pago.email}</Badge>
              <span className="muted tabular">
                {montoTexto(rechazo.pago.monto, rechazo.pago.moneda)} ·{" "}
                {rechazo.pago.referencia}
              </span>
            </div>

            <Field
              label="Motivo del rechazo"
              required
              hint="Lo verá el comercio en su pantalla de activación. Sé concreto: referencia no encontrada, monto distinto, comprobante ilegible…"
            >
              <input
                className="input"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej.: no encontramos la referencia en el banco"
                autoFocus
              />
            </Field>

            {errorRechazo && <p className="field__error">{errorRechazo}</p>}

            <button
              type="submit"
              className="btn btn--danger btn--block"
              disabled={trabajando != null}
            >
              {trabajando === rechazo.pago.id ? "Rechazando…" : "Rechazar y dar 24 h"}
            </button>
            <p className="act__nota" style={{ textAlign: "center" }}>
              Al rechazar, la cuenta vuelve a tener 24 h para reportar otro pago antes de
              eliminarse.
            </p>
          </form>
        </Modal>
      )}
    </div>
  );
}
