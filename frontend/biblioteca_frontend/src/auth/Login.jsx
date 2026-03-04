// [MODIFICADO]
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as apiLogin } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import Alerta from "../components/Alerta.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email y contraseña son obligatorios.");
      return;
    }

    setCargando(true);
    try {
      const data = await apiLogin({ email, password });

      const token = data?.access_token;
      if (!token) {
        setError("Login exitoso, pero no llegó access_token.");
        return;
      }

      // Guardar solo en memoria (Context)
      setAccessToken(token);

      // Ir al home
      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Credenciales inválidas o error de servidor.";
      setError(String(msg));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-5">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <h1 className="h4 mb-3">
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Login
          </h1>

          <Alerta mensaje={error} />

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-light w-100"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Iniciando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="d-flex justify-content-between mt-3">
            <Link to="/forgot-password" className="link-secondary">
              ¿Olvidaste tu contraseña?
            </Link>
            <Link to="/register" className="link-secondary">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}