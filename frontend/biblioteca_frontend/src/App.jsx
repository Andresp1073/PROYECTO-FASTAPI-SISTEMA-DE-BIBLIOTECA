// [MODIFICADO]
import { Link, Route, Routes } from "react-router-dom";
import AuthBridge from "./layout/AuthBridge.jsx";

import Home from "./catalogo/Home.jsx";
import Categorias from "./catalogo/Categorias.jsx";
import ListadoLibros from "./catalogo/ListadoLibros.jsx";

import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";
import VerifyEmail from "./auth/VerifyEmail.jsx";
import ForgotPassword from "./auth/ForgotPassword.jsx";
import ResetPassword from "./auth/ResetPassword.jsx";

import RutaProtegida from "./layout/RutaProtegida.jsx";
import MisPrestamos from "./prestamos/MisPrestamos.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";

function NotFound() {
  return (
    <div className="p-4 rounded-3 border bg-body-tertiary">
      <h1 className="h4 mb-2">404</h1>
      <p className="mb-0 text-secondary">Página no encontrada.</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <AuthBridge />

      <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
        <div className="container">
          <Link to="/" className="navbar-brand fw-semibold text-decoration-none">
            <i className="bi bi-book me-2"></i>
            Biblioteca Web
          </Link>

          <div className="ms-auto d-flex align-items-center gap-2 flex-wrap">
            <Link to="/categorias" className="btn btn-sm btn-outline-light">
              <i className="bi bi-tags me-1"></i>
              Categorías
            </Link>

            <Link to="/libros" className="btn btn-sm btn-outline-light">
              <i className="bi bi-book-half me-1"></i>
              Libros
            </Link>

            <Link to="/prestamos" className="btn btn-sm btn-outline-light">
              <i className="bi bi-journal-check me-1"></i>
              Mis Préstamos
            </Link>

            <Link to="/admin" className="btn btn-sm btn-outline-warning">
              <i className="bi bi-shield-lock me-1"></i>
              Admin
            </Link>

            <Link to="/login" className="btn btn-sm btn-outline-light">
              <i className="bi bi-box-arrow-in-right me-1"></i>
              Login
            </Link>

            <Link to="/register" className="btn btn-sm btn-light">
              <i className="bi bi-person-plus me-1"></i>
              Register
            </Link>
          </div>
        </div>
      </nav>

      <main className="container py-4 flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/libros" element={<ListadoLibros />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* RUTAS PROTEGIDAS */}
          <Route element={<RutaProtegida />}>
            <Route path="/prestamos" element={<MisPrestamos />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="border-top py-3">
        <div className="container small text-secondary">
          © {new Date().getFullYear()} Biblioteca Web
        </div>
      </footer>
    </div>
  );
}