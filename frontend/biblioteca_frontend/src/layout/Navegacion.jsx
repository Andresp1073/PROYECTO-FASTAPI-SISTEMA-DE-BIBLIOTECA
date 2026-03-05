// [MODIFICADO]
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navegacion() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const salir = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg border-bottom bg-body-tertiary">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to="/">
          <i className="bi bi-book me-2"></i>
          Biblioteca Web
        </Link>

        <div className="d-flex gap-2 flex-wrap">
          {!isAuthenticated && (
            <>
              <NavLink className="btn btn-sm btn-outline-light" to="/login">
                <i className="bi bi-box-arrow-in-right me-1"></i> Login
              </NavLink>

              <NavLink className="btn btn-sm btn-light" to="/register">
                <i className="bi bi-person-plus me-1"></i> Register
              </NavLink>
            </>
          )}

          {isAuthenticated && (
            <>
              <NavLink className="btn btn-sm btn-outline-light" to="/categorias">
                <i className="bi bi-tags me-1"></i> Categorías
              </NavLink>

              <NavLink className="btn btn-sm btn-outline-light" to="/libros">
                <i className="bi bi-journals me-1"></i> Libros
              </NavLink>

              <NavLink className="btn btn-sm btn-outline-light" to="/prestamos">
                <i className="bi bi-journal-check me-1"></i> Mis Préstamos
              </NavLink>

              <button className="btn btn-sm btn-danger" onClick={salir}>
                <i className="bi bi-box-arrow-right me-1"></i> Salir
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}