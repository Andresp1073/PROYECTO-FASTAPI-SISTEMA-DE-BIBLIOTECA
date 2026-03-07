// [MODIFICADO]
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { isAuthenticated, user, isAdmin } = useAuth();

  return (
    <div className="container py-4">
      <div className="p-4 border rounded bg-body-tertiary mb-4">
        <div className="text-center mb-4">
          <i className="bi bi-book-half display-4 text-primary"></i>
          <h1 className="h2 mt-3 fw-bold">
            Biblioteca Académica
          </h1>
          <p className="text-secondary lead">
            Tu sistema de gestión de préstamos bibliotecarios
          </p>
        </div>

        <hr className="my-4" />

        <div className="row text-center">
          <div className="col-md-4 mb-3">
            <div className="p-3">
              <i className="bi bi-journals display-6 text-primary"></i>
              <h5 className="mt-2">Catálogo Virtual</h5>
              <p className="text-secondary small">Explora nuestra colección de libros disponibles para préstamo</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="p-3">
              <i className="bi bi-calendar-check display-6 text-primary"></i>
              <h5 className="mt-2">Préstamos Online</h5>
              <p className="text-secondary small">Solicita libros desde cualquier lugar y recógelos en biblioteca</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="p-3">
              <i className="bi bi-bell display-6 text-primary"></i>
              <h5 className="mt-2">Notificaciones</h5>
              <p className="text-secondary small">Recibe alertas sobre el estado de tus solicitudes</p>
            </div>
          </div>
        </div>

        <hr className="my-4" />

        <div className="text-center mb-4">
          {!isAuthenticated && (
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <Link className="btn btn-primary btn-lg" to="/login">
                <i className="bi bi-box-arrow-in-right me-2"></i> Iniciar Sesión
              </Link>
              <Link className="btn btn-outline-primary btn-lg" to="/register">
                <i className="bi bi-person-plus me-2"></i> Regístrate
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="alert alert-success mb-3">
              Sesión activa: <strong>{user?.nombre || user?.email}</strong>
              {isAdmin ? <span className="badge text-bg-warning ms-2">ADMIN</span> : null}
            </div>
          )}
        </div>

        {isAuthenticated && (
          <div className="d-flex gap-2 flex-wrap justify-content-center">
            <Link className="btn btn-outline-dark" to="/categorias">
              <i className="bi bi-tags me-1"></i> Categorías
            </Link>
            <Link className="btn btn-outline-dark" to="/libros">
              <i className="bi bi-journals me-1"></i> Libros
            </Link>
            <Link className="btn btn-outline-dark" to="/prestamos">
              <i className="bi bi-journal-check me-1"></i> Mis Préstamos
            </Link>
            {isAdmin && (
              <Link className="btn btn-outline-warning" to="/admin">
                <i className="bi bi-shield-lock me-1"></i> Admin
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="text-center py-3">
        <p className="text-secondary mb-0 small">
          <i className="bi bi-code-slash me-1"></i>
          Desarrollado por <strong>andrudev7</strong>
        </p>
      </div>
    </div>
  );
}