// [MODIFICADO]
import { useState } from "react";
import { Link } from "react-router-dom";
import { register as apiRegister } from "../api/auth.js";
import Alerta from "../components/Alerta.jsx";

function parseFastApiError(err) {
  const data = err?.response?.data;

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((e) => {
        const loc = Array.isArray(e.loc) ? e.loc.join(".") : "body";
        return `${loc}: ${e.msg}`;
      })
      .join(" | ");
  }

  return (
    data?.detail ||
    data?.message ||
    `Error ${err?.response?.status || ""}`.trim() ||
    "No se pudo registrar."
  );
}

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setError("Nombre, email y contraseña son obligatorios.");
      return;
    }

    setCargando(true);
    try {
      await apiRegister({ nombre, email, password });

      setOk(
        "Registro exitoso. Revisa tu correo para verificar tu cuenta (Verify Email)."
      );
      setNombre("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-5">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <h1 className="h4 mb-3">
            <i className="bi bi-person-plus me-2"></i>
            Register
          </h1>

          <Alerta mensaje={error} />
          <Alerta type="success" mensaje={ok} />

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                autoComplete="name"
              />
            </div>

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
                autoComplete="new-password"
              />
              <div className="form-text text-secondary">
                Usa una contraseña segura.
              </div>
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
                  Registrando...
                </>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>

          <div className="mt-3 text-center">
            <span className="text-secondary">¿Ya tienes cuenta?</span>{" "}
            <Link to="/login" className="link-secondary">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}