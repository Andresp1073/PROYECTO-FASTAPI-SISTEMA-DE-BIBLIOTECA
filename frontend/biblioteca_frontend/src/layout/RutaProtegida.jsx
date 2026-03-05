import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RutaProtegida({ requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // 1) Mientras cargas /auth/me o estás restaurando sesión en memoria
  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex align-items-center gap-3">
          <div className="spinner-border" role="status" aria-label="Cargando" />
          <div>Cargando...</div>
        </div>
      </div>
    );
  }

  // 2) Si no hay sesión -> login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3) Si piden rol ADMIN y el usuario no lo es -> home
  if (requiredRole) {
    const rol = user?.rol;
    if (!rol) {
      // Usuario autenticado pero aún no llegó /auth/me (o falló). Evita crashear.
      return (
        <div className="container py-5">
          <div className="alert alert-warning mb-0">
            No se pudo cargar el rol del usuario. Intenta recargar.
          </div>
        </div>
      );
    }

    if (rol !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  // 4) Render normal
  return <Outlet />;
}