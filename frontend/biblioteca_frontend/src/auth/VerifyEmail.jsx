// [MODIFICADO]
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail as apiVerifyEmail } from "../api/auth.js";
import Alerta from "../components/Alerta.jsx";
import Spinner from "../components/Spinner.jsx";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    const run = async () => {
      setError("");
      setOk("");

      if (!token) {
        setError("Falta el token en la URL.");
        setCargando(false);
        return;
      }

      try {
        await apiVerifyEmail({ token });
        setOk("Correo verificado correctamente. Ya puedes iniciar sesión.");
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "No se pudo verificar el correo. El enlace puede estar vencido.";
        setError(String(msg));
      } finally {
        setCargando(false);
      }
    };

    run();
  }, [token]);

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-9 col-lg-7">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <h1 className="h4 mb-3">
            <i className="bi bi-envelope-check me-2"></i>
            Verificar Email
          </h1>

          {cargando ? (
            <Spinner texto="Verificando..." />
          ) : (
            <>
              <Alerta mensaje={error} />
              <Alerta type="success" mensaje={ok} />

              <div className="mt-3 d-flex gap-2 flex-wrap">
                <Link to="/login" className="btn btn-light">
                  Ir a Login
                </Link>
                <Link to="/" className="btn btn-outline-light">
                  Volver al Home
                </Link>
              </div>

              <div className="mt-3 small text-secondary">
                Este frontend lee <code>?token=...</code> y llama al backend con{" "}
                <code>POST /auth/verify-email</code>.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}