// [MODIFICADO]
import { useEffect, useState } from "react";
import Spinner from "../components/Spinner.jsx";
import Alerta from "../components/Alerta.jsx";
import { actualizarUser, getUsers, resetPasswordUser } from "../api/users.js";

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

  return data?.detail || data?.message || "Error inesperado";
}

function normalizarListado(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function AdminUsuarios() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [editandoId, setEditandoId] = useState(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("USER");
  const [isActive, setIsActive] = useState(true);

  const [newPassword, setNewPassword] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const cargar = async () => {
    setError("");
    setOk("");
    setCargando(true);
    try {
      const data = await getUsers();
      setItems(normalizarListado(data));
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const limpiar = () => {
    setEditandoId(null);
    setNombre("");
    setEmail("");
    setRol("USER");
    setIsActive(true);
    setNewPassword("");
  };

  const cargarEdicion = (u) => {
    setError("");
    setOk("");
    setEditandoId(u.id);
    setNombre(u.nombre ?? "");
    setEmail(u.email ?? "");
    setRol(u.rol ?? "USER");
    setIsActive(Boolean(u.is_active));
    setNewPassword("");
  };

  const onActualizar = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!editandoId) return;

    const payload = {
      nombre: nombre.trim(),
      email: email.trim(),
      rol,
      is_active: isActive,
    };

    setGuardando(true);
    try {
      await actualizarUser(editandoId, payload);
      setOk("Usuario actualizado.");
      limpiar();
      await cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setGuardando(false);
    }
  };

  const onResetPassword = async () => {
    setError("");
    setOk("");

    if (!editandoId) return;

    const pwd = newPassword.trim();
    if (!pwd) {
      setError("Escribe la nueva contraseña.");
      return;
    }

    setGuardando(true);
    try {
      // ✅ Swagger: { new_password: "..." }
      await resetPasswordUser(editandoId, pwd);

      setOk("Contraseña reseteada.");
      setNewPassword("");
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-4">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <h1 className="h5 mb-3">
            <i className="bi bi-people me-2"></i>
            Editar usuario
          </h1>

          <Alerta mensaje={error} />
          <Alerta type="success" mensaje={ok} />

          {!editandoId ? (
            <div className="text-secondary">
              Selecciona un usuario en la tabla para editarlo.
              <div className="small mt-2">
                Nota: tu backend no tiene <code>POST /users</code>, así que aquí
                no se crean usuarios. Se registran por <code>/auth/register</code>.
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={onActualizar}>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    className="form-control"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Rol</label>
                  <select
                    className="form-select"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    id="isActiveChk"
                  />
                  <label className="form-check-label" htmlFor="isActiveChk">
                    Usuario activo
                  </label>
                </div>

                <button className="btn btn-light w-100" disabled={guardando}>
                  {guardando ? "Guardando..." : "Actualizar"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-light w-100 mt-2"
                  onClick={limpiar}
                  disabled={guardando}
                >
                  Cancelar
                </button>
              </form>

              <hr className="my-4" />

              <div className="fw-semibold mb-2">
                <i className="bi bi-key me-2"></i>
                Reset password (admin)
              </div>

              <div className="mb-2">
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                />
              </div>

              <button
                type="button"
                className="btn btn-outline-warning w-100"
                onClick={onResetPassword}
                disabled={guardando}
              >
                {guardando ? "Procesando..." : "Resetear contraseña"}
              </button>

              <div className="small text-secondary mt-2">
                Body requerido: <code>{`{ "new_password": "..." }`}</code>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="col-12 col-lg-8">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <h2 className="h5 mb-0">Listado de usuarios</h2>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={cargar}
              disabled={cargando}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Recargar
            </button>
          </div>

          {cargando ? (
            <Spinner texto="Cargando usuarios..." />
          ) : items.length === 0 ? (
            <div className="text-secondary">No hay usuarios.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th style={{ width: 120 }}>Rol</th>
                    <th style={{ width: 120 }}>Activo</th>
                    <th style={{ width: 110 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((u) => (
                    <tr key={u.id}>
                      <td className="text-secondary">{u.id}</td>
                      <td className="fw-semibold">{u.nombre ?? "—"}</td>
                      <td className="text-secondary">{u.email ?? "—"}</td>
                      <td>
                        <span className="badge text-bg-secondary">
                          {u.rol ?? "—"}
                        </span>
                      </td>
                      <td className="text-secondary">{u.is_active ? "Sí" : "No"}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-light"
                          onClick={() => cargarEdicion(u)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-3 small text-secondary">
            Endpoints: <code>GET /users/</code>, <code>PUT /users/{`{id}`}</code>,{" "}
            <code>POST /users/{`{id}`}/reset-password</code>
          </div>
        </div>
      </div>
    </div>
  );
}