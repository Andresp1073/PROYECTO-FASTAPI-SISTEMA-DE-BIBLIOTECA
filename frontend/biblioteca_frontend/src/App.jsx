// [MODIFICADO]
import { Routes, Route, Navigate } from "react-router-dom";
import Navegacion from "./layout/Navegacion.jsx";

import Home from "./catalogo/Home.jsx";
import Categorias from "./catalogo/Categorias.jsx";
import ListadoLibros from "./catalogo/ListadoLibros.jsx";
import DetalleLibro from "./catalogo/DetalleLibro.jsx";

import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";
import VerifyEmail from "./auth/VerifyEmail.jsx";
import ForgotPassword from "./auth/ForgotPassword.jsx";
import ResetPassword from "./auth/ResetPassword.jsx";

import MisPrestamos from "./prestamos/MisPrestamos.jsx";

import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminCategorias from "./admin/AdminCategorias.jsx";
import AdminLibros from "./admin/AdminLibros.jsx";
import AdminUsuarios from "./admin/AdminUsuarios.jsx";
import AdminPrestamos from "./admin/AdminPrestamos.jsx";
import AdminCargaMasiva from "./admin/AdminCargaMasiva.jsx";

export default function App() {
  return (
    <>
      <Navegacion />

      <main className="container py-4">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Catálogo */}
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/libros" element={<ListadoLibros />} />
          <Route path="/libros/:id" element={<DetalleLibro />} />

          {/* Usuario */}
          <Route path="/prestamos" element={<MisPrestamos />} />

          {/* Admin (por ahora quedan las rutas, en la próxima fase bloqueamos por rol) */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/categorias" element={<AdminCategorias />} />
          <Route path="/admin/libros" element={<AdminLibros />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          <Route path="/admin/prestamos" element={<AdminPrestamos />} />
          <Route path="/admin/carga-masiva" element={<AdminCargaMasiva />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}