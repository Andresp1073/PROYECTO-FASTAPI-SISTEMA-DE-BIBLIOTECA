// [MODIFICADO]
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { isAuthenticated, user, isAdmin } = useAuth();

  return (
    <div className="container py-4">
      <div className="p-4 border rounded bg-body-tertiary">
        <h1 className="h3 mb-2">
          <i className="bi bi-book me-2"></i>
          Biblioteca Web
        </h1>

        <p className="text-secondary mb-4">
          Catálogo y préstamos con autenticación segura (cookies HttpOnly + access token en memoria).
        </p>

        {!isAuthenticated && (
          <div className="d-flex gap-2 flex-wrap">
            <Link className="btn btn-light" to="/login">
              <i className="bi bi-box-arrow-in-right me-1"></i> Login
            </Link>
            <Link className="btn btn-outline-light" to="/register">
              <i className="bi bi-person-plus me-1"></i> Register
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <>
            <div className="alert alert-success mb-3">
              Sesión activa: <strong>{user?.nombre || user?.email}</strong>
              {isAdmin ? <span className="badge text-bg-warning ms-2">ADMIN</span> : null}
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <Link className="btn btn-outline-light" to="/categorias">
                <i className="bi bi-tags me-1"></i> Categorías
              </Link>
              <Link className="btn btn-outline-light" to="/libros">
                <i className="bi bi-journals me-1"></i> Libros
              </Link>
              <Link className="btn btn-outline-light" to="/prestamos">
                <i className="bi bi-journal-check me-1"></i> Mis Préstamos
              </Link>
              {isAdmin && (
                <Link className="btn btn-outline-warning" to="/admin">
                  <i className="bi bi-shield-lock me-1"></i> Admin
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}