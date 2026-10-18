// Límite de errores global: si un fallo de render se escapa, en vez de dejar la
// pantalla en blanco muestra un mensaje claro con opción de recargar. Sin él,
// cualquier throw desmonta todo React y el comerciante queda sin punto de venta.
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Se deja rastro en consola para diagnóstico; no se rompe el render.
    console.error("Error no controlado en BLINK POS:", error, info.componentStack);
  }

  private reload = () => {
    window.location.reload();
  };

  private goHome = () => {
    // Navegación dura: limpia el estado roto y vuelve al inicio protegido.
    window.location.assign("/inicio");
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <main className="auth" style={{ minHeight: "100dvh", alignItems: "center" }}>
        <div className="auth__card" style={{ maxWidth: "30rem" }}>
          <span className="brand brand--lg">
            <span className="brand__blink">BLINK</span> POS
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
          <button className="btn btn--primary btn--block" onClick={this.reload}>
            Recargar y continuar
          </button>
          <button
            className="btn btn--ghost btn--block"
            style={{ marginTop: "0.5rem" }}
            onClick={this.goHome}
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }
}
