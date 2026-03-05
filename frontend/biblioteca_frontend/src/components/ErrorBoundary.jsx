import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log útil en consola
    console.error("ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-4">
          <div className="alert alert-danger">
            <h4 className="alert-heading mb-2">
              Se cayó un componente (ErrorBoundary)
            </h4>
            <div className="small">
              <div className="fw-semibold mb-1">Mensaje:</div>
              <div>{String(this.state.error?.message || this.state.error)}</div>
            </div>

            <hr />

            <div className="small">
              Abre la consola del navegador (F12) para ver el stack trace completo.
              Con ese mensaje arreglamos el archivo exacto.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}