// src/layout/RutaProtegida.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";

export default function RutaProtegida({ children, adminOnly = false }) {
  const location = useLocation();
  const { isAuthenticated, user, booting } = useAuth();

  // ✅ Nunca devolver null (pantalla vacía)
  if (booting) {
    return (
      <div className="container py-5">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <Spinner texto="Cargando sesión..." />
        </div>
      </div>
    );
  }

  // No logueado -> login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Logueado pero user aún no cargó (raro, pero posible)
  if (!user) {
    return (
      <div className="container py-5">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <Spinner texto="Cargando usuario..." />
        </div>
      </div>
    );
  }

  // AdminOnly
  if (adminOnly && user?.rol !== "ADMIN") {
    return <Navigate to="/libros" replace />;
  }

  return children;
}