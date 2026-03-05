import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navegacion() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Mantienes tu regla: navbar oculta si NO estás logueado
  if (!isAuthenticated) return null;

  const esAdmin = user?.rol === "ADMIN";

  const onLogout = async () => {
    try {
      await logout(); // tu logout debería llamar /auth/logout y limpiar memoria
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Biblioteca
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/categorias">
                Categorías
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/libros">
                Libros
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/prestamos/mis-prestamos">
                Mis Préstamos
              </NavLink>
            </li>

            {esAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  Admin
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <div className="small text-body-secondary">
              {user?.nombre ? user.nombre : "Usuario"}{" "}
              {user?.rol ? `(${user.rol})` : ""}
            </div>

            <button className="btn btn-outline-danger btn-sm" onClick={onLogout}>
              <i className="bi bi-box-arrow-right me-1" />
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}