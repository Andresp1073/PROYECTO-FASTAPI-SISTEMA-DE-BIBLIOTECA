// [MODIFICADO]
import { Routes, Route, Navigate } from "react-router-dom";
import Navegacion from "./layout/Navegacion.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Páginas base (las más seguras)
import Home from "./catalogo/Home.jsx";
import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";
import ListadoLibros from "./catalogo/ListadoLibros.jsx";

export default function App() {
  return (
    <>
      <Navegacion />

      <ErrorBoundary>
        <main className="container py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/libros" element={<ListadoLibros />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </ErrorBoundary>
    </>
  );
}