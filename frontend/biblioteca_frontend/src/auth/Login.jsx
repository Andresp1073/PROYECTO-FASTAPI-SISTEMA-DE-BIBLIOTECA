import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as apiLogin } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import Alerta from "../components/Alerta.jsx";

function parseFastApiError(err) {
  const data = err?.response?.data;

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((e) => {
        const loc = Array.isArray(e.loc) ? e.loc.join(".") : "";
        return `${loc}: ${e.msg}`;
      })
      .join(" | ");
  }

  return data?.detail || data?.message || "Error inesperado";
}

export default function Login() {
  const navigate = useNavigate();
  const { setAccessToken, loadMe, clearAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);

    try {
      // 1) login -> token
      const data = await apiLogin({ email, password });

      const token = data?.access_token || data?.accessToken || data?.token || null;
      if (!token) {
        throw new Error("El backend no devolvió access_token");
      }

      // 2) guardar token en memoria
      setAccessToken(token);

      // 3) cargar /auth/me para rol + datos
      try {
        await loadMe();
      } catch {
        // si falla /auth/me, igual dejamos entrar pero sin rol (no verá admin)
      }

      setOk("Sesión iniciada");
      navigate("/", { replace: true });
    } catch (err) {
      clearAuth();
      setError(parseFastApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 520 }}>
      <div className="p-4 border rounded bg-body-tertiary">
        <h3 className="mb-3">
          <i className="bi bi-box-arrow-in-right me-2" />
          Login
        </h3>

        <Alerta mensaje={error} />
        <Alerta type="success" mensaje={ok} />

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-light w-100" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="d-flex justify-content-between mt-3">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
            <Link to="/register">Crear cuenta</Link>
          </div>
        </form>
      </div>
    </div>
  );
}