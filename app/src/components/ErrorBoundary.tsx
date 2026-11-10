import { Icon } from "../components/Icon";
// Límite de errores global: si un fallo de render se escapa, en vez de dejar la
// pantalla en blanco muestra un mensaje claro con opción de recargar. Sin él,
// cualquier throw desmonta todo React y el comerciante queda sin punto de venta.
import { Component, type ErrorInfo, type ReactNode } from "react";

// BLINK-089: los límites de React solo capturan errores de RENDER; los de
// manejadores de eventos y promesas asíncronas (todas las llamadas de la
// nube) los esquiva. Este canal global permite que main.tsx reporte esas
// fallas al boundary para que el comerciante vea la misma pantalla de
// rescate en lugar de un fallo silencioso.
let reportarGlobal: ((error: unknown) => void) | null = null;

/** Registra el receptor de errores globales (lo usa <ErrorBoundary>). */
export function instalarReporteGlobal(fn: (error: unknown) => void): () => void {
  reportarGlobal = fn;
  return () => {
    if (reportarGlobal === fn) reportarGlobal = null;
  };
}

/**
 * Reporta una falla fuera del render (promesa rechazada, handler de evento).
 * Si no hay boundary montado, solo queda el rastro en consola.
 */
export function reportarErrorGlobal(error: unknown): void {
  console.error("Error no controlado en BLINK POS:", error);
  reportarGlobal?.(error);
}

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  private desinstalar: (() => void) | null = null;

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Se deja rastro en consola para diagnóstico; no se rompe el render.
    console.error("Error no controlado en BLINK POS:", error, info.componentStack);
  }

  componentDidMount() {
    // Errores de promesas/handlers: llegan por el canal global.
    this.desinstalar = instalarReporteGlobal((error) => {
      this.setState({
        error: error instanceof Error ? error : new Error(String(error)),
      });
    });
  }

  componentWillUnmount() {
    this.desinstalar?.();
    this.desinstalar = null;
  }

  private reload = () => {
    window.location.reload();
  };

  private retry = () => {
    // BLINK-089: remonta los hijos sin recargar la página. Si el error era
    // puntual (un handler que falló una vez), la app sigue en pie; si es
    // determinista, el boundary lo vuelve a atrapar sin bucle de recarga.
    this.setState({ error: null });
  };

  private goHome = () => {
    // Navegación dura: limpia el estado roto y vuelve al inicio protegido.
    // BASE_URL para no romper bajo una subruta de despliegue.
    const base = import.meta.env.BASE_URL;
    window.location.assign(`${base.endsWith("/") ? base : `${base}/`}app/inicio`);
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <main className="auth" style={{ minHeight: "100dvh", alignItems: "center" }}>
        <div className="auth__card" style={{ maxWidth: "30rem" }}>
          <span className="brand brand--lg">
            <span className="brand__blink">BLINK</span>
            <span className="brand__pos">POS</span>
          </span>
          <h1 style={{ marginTop: "0.5rem" }}>Algo salió mal.</h1>
          <p className="muted" style={{ marginBottom: "1rem" }}>
            Tu punto de venta no pudo mostrarse. Tus datos siguen guardados: recarga
            para continuar donde estabas.
          </p>
          <pre
            className="tabular"
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "0.72rem",
              color: "var(--color-text-secondary)",
              background: "var(--color-accent-soft)",
              borderRadius: 8,
              padding: "0.6rem 0.75rem",
              marginBottom: "1rem",
            }}
          >
            {error.message || String(error)}
          </pre>
          <button className="btn btn--primary btn--block" onClick={this.retry}><Icon name="refresh" />
            Volver a intentar
          </button>
          <button
            className="btn btn--ghost btn--block"
            style={{ marginTop: "0.5rem" }}
            onClick={this.reload}
          ><Icon name="arrowRight" />
            Recargar y continuar
          </button>
          <button
            className="btn btn--ghost btn--block"
            style={{ marginTop: "0.5rem" }}
            onClick={this.goHome}
          ><Icon name="home" /> 
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }
}
