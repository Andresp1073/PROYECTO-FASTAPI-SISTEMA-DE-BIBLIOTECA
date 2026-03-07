// src/auth/Login.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Alerta from "../components/Alerta.jsx";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, parseFastApiError } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      // ✅ login devuelve el user ya cargado
      const { me } = await login({ email, password });

      // Siempre redirigir al “home” luego de iniciar sesión
      // (evita volver a la ruta donde se cerró sesión).
      if (me?.rol === "ADMIN") navigate("/admin", { replace: true });
      else navigate("/", { replace: true });
    } catch (err) {
      const msg =
        typeof err?.message === "string" && err.message && err.message !== "Error"
          ? err.message
          : parseFastApiError(err);
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">
          <i className="bi bi-box-arrow-in-right me-2" />
          Biblioteca Académica
        </h1>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={toggleTheme}
          title={theme === "light" ? "Modo oscuro" : "Modo claro"}
        >
          <i className={`bi ${theme === "light" ? "bi-moon-fill" : "bi-sun-fill"}`} />
        </button>
      </div>

      <Alerta mensaje={error} />

      <form onSubmit={onSubmit} className="p-4 border rounded-3 bg-body">
        <h5 className="mb-4 text-center">Iniciar Sesión</h5>
        
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label className="form-label mt-3">Contraseña</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button className="btn btn-primary w-100 mt-4" disabled={cargando}>
          {cargando ? "Ingresando..." : "Entrar"}
        </button>

        <div className="d-flex justify-content-between mt-3 small">
          <Link to="/register" className="text-decoration-none">
            Crear cuenta
          </Link>
          <Link to="/forgot-password" className="text-decoration-none">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </form>
    </div>
  );
}