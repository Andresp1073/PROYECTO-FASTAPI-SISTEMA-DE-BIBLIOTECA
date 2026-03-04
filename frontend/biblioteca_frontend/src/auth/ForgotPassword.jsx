// [MODIFICADO]
import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword as apiForgotPassword } from "../api/auth.js";
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
    "No se pudo procesar la solicitud."
  );
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!email.trim()) {
      setError("El email es obligatorio.");
      return;
    }

    setCargando(true);
    try {
      await apiForgotPassword({ email });

      // Mensaje genérico por seguridad (no revelar si existe o no)
      setOk(
        "Si el correo existe, te llegará un email con instrucciones para restablecer tu contraseña."
      );
      setEmail("");
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-9 col-lg-6">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <h1 className="h4 mb-3">
            <i className="bi bi-key me-2"></i>
            Forgot Password
          </h1>

          <Alerta mensaje={error} />
          <Alerta type="success" mensaje={ok} />

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
              <div className="form-text text-secondary">
                Te enviaremos un enlace para restablecer tu contraseña.
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
                  Enviando...
                </>
              ) : (
                "Enviar enlace"
              )}
            </button>
          </form>

          <div className="mt-3 text-center">
            <Link to="/login" className="link-secondary">
              Volver a Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}