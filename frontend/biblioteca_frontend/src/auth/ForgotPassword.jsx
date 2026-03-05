// [MODIFICADO]
import { useState } from "react";
import { requestResetPassword } from "../api/auth.js";

export default function ForgotPassword() {

  const [email,setEmail] = useState("");
  const [mensaje,setMensaje] = useState("");
  const [error,setError] = useState("");
  const [cargando,setCargando] = useState(false);

  const enviar = async(e)=>{
    e.preventDefault();

    setError("");
    setMensaje("");
    setCargando(true);

    try{

      await requestResetPassword({email});

      setMensaje("Si el correo existe, recibirás un email para resetear tu contraseña.");

    }catch(err){

      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Error al enviar solicitud";

      setError(msg);

    }finally{
      setCargando(false);
    }

  }

  return(
    <div className="container py-4">

      <div className="row justify-content-center">

        <div className="col-md-6 col-lg-5">

          <div className="p-4 border rounded bg-body-tertiary">

            <h4 className="mb-3">
              Recuperar contraseña
            </h4>

            {mensaje && (
              <div className="alert alert-success">
                {mensaje}
              </div>
            )}

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={enviar}>

              <div className="mb-3">
                <label className="form-label">
                  Email
                </label>

                <input
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                className="btn btn-light w-100"
                disabled={cargando}
              >
                {cargando ? "Enviando..." : "Enviar enlace"}
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}