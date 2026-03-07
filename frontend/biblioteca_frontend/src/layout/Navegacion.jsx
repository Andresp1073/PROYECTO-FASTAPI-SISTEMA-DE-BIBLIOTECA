// src/layout/Navegacion.jsx
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState, useEffect, useCallback } from "react";
import { getNotificacionesNoLeidas, getSolicitudesPendientes } from "../api/solicitudes.js";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Navegacion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    // Al cerrar sesión, forzamos que el siguiente login vaya a la página de inicio
    // (evita volver a la última ruta protegida en la que estaba el usuario).
    navigate("/login", { replace: true, state: { from: "/" } });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary border-bottom">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to="/">
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
                  <NavLink className="nav-link text-white" to="/categorias">
                    <i className="bi bi-tags me-1" />
                    Categorías
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/libros">
                    <i className="bi bi-book me-1" />
                    Libros
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/prestamos">
                    <i className="bi bi-journal-check me-1" />
                    Mis Préstamos
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/notificaciones">
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
                  <NavLink className="nav-link text-white" to="/admin">
                    <i className="bi bi-speedometer2 me-1" />
                    Panel
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/admin/categorias">
                    <i className="bi bi-tags me-1" />
                    Categorías
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/admin/libros">
                    <i className="bi bi-book me-1" />
                    Libros
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/admin/prestamos">
                    <i className="bi bi-clipboard-check me-1" />
                    Préstamos
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/admin/solicitudes">
                    <i className="bi bi-envelope-check me-1" />
                    Solicitudes
                    {solicitudesCount > 0 && (
                      <span className="badge bg-danger ms-1">{solicitudesCount > 9 ? '9+' : solicitudesCount}</span>
                    )}
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/admin/usuarios">
                    <i className="bi bi-people me-1" />
                    Usuarios
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/admin/carga-masiva">
                    <i className="bi bi-upload me-1" />
                    Carga Masiva
                  </NavLink>
                </li>
              </>
            )}

          </ul>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-light btn-sm"
              onClick={toggleTheme}
              title={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
            >
              <i className={`bi ${theme === "light" ? "bi-moon-fill" : "bi-sun-fill"}`} />
            </button>

            <div className="text-white small d-none d-lg-block">
              {user?.nombre ?? "Usuario"}{" "}
              <span className="badge bg-light text-dark">{user?.rol ?? "—"}</span>
            </div>

            <button className="btn btn-outline-light btn-sm" onClick={salir}>
              <i className="bi bi-box-arrow-right me-1" />
              <span className="d-none d-md-inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}