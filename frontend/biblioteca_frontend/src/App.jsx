// [MODIFICADO]
import { Routes, Route, Navigate } from "react-router-dom";
import Navegacion from "./layout/Navegacion.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import RutaProtegida from "./layout/RutaProtegida.jsx";

// Public
import Home from "./catalogo/Home.jsx";
import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";
import VerifyEmail from "./auth/VerifyEmail.jsx";
import ForgotPassword from "./auth/ForgotPassword.jsx";
import ResetPassword from "./auth/ResetPassword.jsx";

// Catalogo
import Categorias from "./catalogo/Categorias.jsx";
import ListadoLibros from "./catalogo/ListadoLibros.jsx";
import DetalleLibro from "./catalogo/DetalleLibro.jsx";

// Prestamos
import MisPrestamos from "./prestamos/MisPrestamos.jsx";

export default function App() {
  return (
    <>
      <Navegacion />

      <ErrorBoundary>
        <main className="container py-4">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protegidas (usuario) */}
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

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </ErrorBoundary>
    </>
  );
}