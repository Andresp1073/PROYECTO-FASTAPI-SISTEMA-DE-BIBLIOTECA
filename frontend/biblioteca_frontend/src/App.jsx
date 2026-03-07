// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Navegacion from "./layout/Navegacion.jsx";
import RutaProtegida from "./layout/RutaProtegida.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

// Auth
import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";
import VerifyEmail from "./auth/VerifyEmail.jsx";
import ForgotPassword from "./auth/ForgotPassword.jsx";
import ResetPassword from "./auth/ResetPassword.jsx";

// User pages
import Home from "./catalogo/Home.jsx";
import Categorias from "./catalogo/Categorias.jsx";
import ListadoLibros from "./catalogo/ListadoLibros.jsx";
import DetalleLibro from "./catalogo/DetalleLibro.jsx";
import MisPrestamos from "./prestamos/MisPrestamos.jsx";
import MisNotificaciones from "./prestamos/MisNotificaciones.jsx";

// Admin pages
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminCategorias from "./admin/AdminCategorias.jsx";
import AdminLibros from "./admin/AdminLibros.jsx";
import AdminUsuarios from "./admin/AdminUsuarios.jsx";
import AdminPrestamos from "./admin/AdminPrestamos.jsx";
import AdminCargaMasiva from "./admin/AdminCargaMasiva.jsx";
import AdminSolicitudes from "./admin/AdminSolicitudes.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <Navegacion />

      <Routes>
        {/* ===== PUBLIC ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ===== USER (requiere login) ===== */}
        <Route
          path="/"
          element={
            <RutaProtegida>
              <Home />
            </RutaProtegida>
          }
        />
        <Route
          path="/categorias"
          element={
            <RutaProtegida>
              <Categorias />
            </RutaProtegida>
          }
        />
        <Route
          path="/libros"
          element={
            <RutaProtegida>
              <ListadoLibros />
            </RutaProtegida>
          }
        />
        <Route
          path="/libros/:id"
          element={
            <RutaProtegida>
              <DetalleLibro />
            </RutaProtegida>
          }
        />
        <Route
          path="/prestamos"
          element={
            <RutaProtegida>
              <MisPrestamos />
            </RutaProtegida>
          }
        />
        <Route
          path="/notificaciones"
          element={
            <RutaProtegida>
              <MisNotificaciones />
            </RutaProtegida>
          }
        />

        {/* ===== ADMIN (requiere login + rol ADMIN) ===== */}
        <Route
          path="/admin"
          element={
            <RutaProtegida adminOnly>
              <AdminDashboard />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/categorias"
          element={
            <RutaProtegida adminOnly>
              <AdminCategorias />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/libros"
          element={
            <RutaProtegida adminOnly>
              <AdminLibros />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <RutaProtegida adminOnly>
              <AdminUsuarios />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/prestamos"
          element={
            <RutaProtegida adminOnly>
              <AdminPrestamos />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/solicitudes"
          element={
            <RutaProtegida adminOnly>
              <AdminSolicitudes />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/carga-masiva"
          element={
            <RutaProtegida adminOnly>
              <AdminCargaMasiva />
            </RutaProtegida>
          }
        />

        {/* ===== FALLBACK ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}