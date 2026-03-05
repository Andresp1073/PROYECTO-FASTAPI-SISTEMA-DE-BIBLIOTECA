// [MODIFICADO]
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Spinner.jsx";

/**
 * Props:
 * - children
 * - adminOnly?: boolean
 */
export default function RutaProtegida({ children, adminOnly = false }) {
  const { authReady, isAuthenticated, isAdmin } = useAuth();

  // ✅ Esperar a que el auth termine de inicializar (refresh)
  if (!authReady) {
    return <Spinner texto="Verificando sesión..." />;
  }

  // ✅ Si no hay sesión -> login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Si es ruta admin y no es admin -> home
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}