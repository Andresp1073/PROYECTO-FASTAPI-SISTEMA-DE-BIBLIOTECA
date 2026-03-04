// [MODIFICADO]
import AuthBridge from "./layout/AuthBridge.jsx";

export default function App() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <AuthBridge />

      <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
        <div className="container">
          <span className="navbar-brand fw-semibold">
            <i className="bi bi-book me-2"></i>
            Biblioteca Web
          </span>

          <div className="ms-auto d-flex align-items-center gap-2">
            <span className="badge text-bg-secondary">Dark Mode</span>
          </div>
        </div>
      </nav>

      <main className="container py-4 flex-grow-1">
        <div className="p-4 rounded-3 border bg-body-tertiary">
          <h1 className="h4 mb-2">Axios listo ✅</h1>
          <p className="mb-0 text-secondary">
            Cliente central con <code>refresh</code> automático (cookie HttpOnly)
            y access token en memoria.
          </p>
        </div>
      </main>

      <footer className="border-top py-3">
        <div className="container small text-secondary">
          © {new Date().getFullYear()} Biblioteca Web
        </div>
      </footer>
    </div>
  );
}