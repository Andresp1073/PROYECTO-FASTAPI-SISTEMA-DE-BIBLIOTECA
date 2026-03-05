import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navegacion from "./layout/Navegacion.jsx";
import RutaProtegida from "./layout/RutaProtegida.jsx";

// Auth
import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";
import VerifyEmail from "./auth/VerifyEmail.jsx";
import ForgotPassword from "./auth/ForgotPassword.jsx";
import ResetPassword from "./auth/ResetPassword.jsx";

// User
import Home from "./catalogo/Home.jsx";
import Categorias from "./catalogo/Categorias.jsx";
import ListadoLibros from "./catalogo/ListadoLibros.jsx";
import DetalleLibro from "./catalogo/DetalleLibro.jsx";

// Prestamos
import MisPrestamos from "./prestamos/MisPrestamos.jsx";

// Admin
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

      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* USER PROTEGIDO */}
        <Route element={<RutaProtegida />}>
          <Route path="/" element={<Home />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/libros" element={<ListadoLibros />} />
          <Route path="/libros/:id" element={<DetalleLibro />} />
          <Route path="/prestamos/mis-prestamos" element={<MisPrestamos />} />
        </Route>

        {/* ADMIN PROTEGIDO */}
        <Route element={<RutaProtegida requiredRole="ADMIN" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/categorias" element={<AdminCategorias />} />
          <Route path="/admin/libros" element={<AdminLibros />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          <Route path="/admin/prestamos" element={<AdminPrestamos />} />
          <Route path="/admin/carga-masiva" element={<AdminCargaMasiva />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}