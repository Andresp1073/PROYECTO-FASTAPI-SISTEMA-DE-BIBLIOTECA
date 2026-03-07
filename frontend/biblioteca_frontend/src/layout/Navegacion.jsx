// src/layout/Navegacion.jsx
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState, useEffect, useCallback } from "react";
import { getNotificacionesNoLeidas, getSolicitudesPendientes } from "../api/solicitudes.js";

export default function Navegacion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const [solicitudesCount, setSolicitudesCount] = useState(0);

  const fetchCounts = useCallback(() => {
    if (!isAuthenticated) return;
    
    if (user?.rol === "ADMIN") {
      getSolicitudesPendientes()
        .then((res) => setSolicitudesCount(res.length || 0))
        .catch(() => {});
    } else {
      getNotificacionesNoLeidas()
        .then((res) => setNotifCount(res.count || 0))
        .catch(() => {});
    }
  }, [isAuthenticated, user?.rol]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts, location.pathname]);

  useEffect(() => {
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  if (!isAuthenticated) return null;

  const esAdmin = user?.rol === "ADMIN";

  const salir = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to={esAdmin ? "/admin" : "/"}>
          <i className="bi bi-journal-bookmark-fill me-2" />
          Biblioteca
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMain"
          aria-controls="navMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {!esAdmin ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/categorias">
                    <i className="bi bi-tags me-1" />
                    Categorías
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/libros">
                    <i className="bi bi-book me-1" />
                    Libros
                  </NavLink>
                </li>

<li className="nav-item">
                  <NavLink className="nav-link" to="/prestamos">
                    <i className="bi bi-journal-check me-1" />
                    Mis Préstamos
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/notificaciones">
                    <i className="bi bi-bell me-1" />
                    Notificaciones
                    {notifCount > 0 && (
                      <span className="badge bg-danger ms-1">{notifCount > 9 ? '9+' : notifCount}</span>
                    )}
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin">
                    <i className="bi bi-speedometer2 me-1" />
                    Panel
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/categorias">
                    <i className="bi bi-tags me-1" />
                    Categorías
                  </NavLink>
                </li>

                {/* ✅ ADMIN LIBROS */}
                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/libros">
                    <i className="bi bi-book me-1" />
                    Libros
                  </NavLink>
                </li>

<li className="nav-item">
                  <NavLink className="nav-link" to="/admin/prestamos">
                    <i className="bi bi-clipboard-check me-1" />
                    Préstamos
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/solicitudes">
                    <i className="bi bi-envelope-check me-1" />
                    Solicitudes
                    {solicitudesCount > 0 && (
                      <span className="badge bg-danger ms-1">{solicitudesCount > 9 ? '9+' : solicitudesCount}</span>
                    )}
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/admin/usuarios">
                    <i className="bi bi-people me-1" />
                    Usuarios
                  </NavLink>
                </li>

<li className="nav-item">
                  <NavLink className="nav-link" to="/admin/carga-masiva">
                    <i className="bi bi-upload me-1" />
                    Carga Masiva de Libros
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <div className="text-secondary small d-none d-lg-block">
              <span className="text-light">{user?.nombre ?? "Usuario"}</span>{" "}
              <span className="badge text-bg-secondary">{user?.rol ?? "—"}</span>
            </div>

            <button className="btn btn-outline-light btn-sm" onClick={salir}>
              <i className="bi bi-box-arrow-right me-2" />
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}