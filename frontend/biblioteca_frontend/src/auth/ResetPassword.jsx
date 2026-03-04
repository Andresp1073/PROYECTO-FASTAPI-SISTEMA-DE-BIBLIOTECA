// [MODIFICADO]
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword as apiResetPassword } from "../api/auth.js";
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
    "No se pudo restablecer la contraseña."
  );
}

export default function ResetPassword() {
  const [params] = useSearchParams();
  const tokenFromUrl = params.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    setToken(tokenFromUrl);
  }, [tokenFromUrl]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!token.trim()) {
      setError("Falta el token. Abre el enlace que llegó al correo.");
      return;
    }

    if (!newPassword.trim()) {
      setError("La nueva contraseña es obligatoria.");
      return;
    }

    if (newPassword !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      // IMPORTANTE:
      // Ajustamos a { token, new_password } (común en backends FastAPI)
      await apiResetPassword({ token, new_password: newPassword });

      setOk("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
      setNewPassword("");
      setConfirm("");
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
            <i className="bi bi-shield-lock me-2"></i>
            Reset Password
          </h1>

          <Alerta mensaje={error} />
          <Alerta type="success" mensaje={ok} />

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Token</label>
              <input
                type="text"
                className="form-control"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="token del email"
              />
              <div className="form-text text-secondary">
                Normalmente viene en la URL: <code>?token=...</code>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Nueva contraseña</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirmar contraseña</label>
              <input
                type="password"
                className="form-control"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
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
                  Guardando...
                </>
              ) : (
                "Restablecer contraseña"
              )}
            </button>
          </form>

          <div className="mt-3 text-center">
            <Link to="/login" className="link-secondary">
              Ir a Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}