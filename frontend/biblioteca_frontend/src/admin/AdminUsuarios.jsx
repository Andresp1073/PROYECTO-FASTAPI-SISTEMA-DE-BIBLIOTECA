// src/admin/AdminUsuarios.jsx
import { useEffect, useMemo, useState } from "react";
import { getUsers, updateUser, resetUserPassword } from "../api/users.js";
import Alerta from "../components/Alerta.jsx";
import Spinner from "../components/Spinner.jsx";

function parseFastApiError(err) {
  const data = err?.response?.data;
  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((e) => `${Array.isArray(e.loc) ? e.loc.join(".") : "body"}: ${e.msg}`)
      .join(" | ");
  }
  return (
    data?.detail ||
    data?.message ||
    `Error ${err?.response?.status || ""}`.trim() ||
    "Ocurrió un error."
  );
}

function normalizarListado(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function AdminUsuarios() {
  const [cargando, setCargando] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [q, setQ] = useState("");

  const [edit, setEdit] = useState(null); // { id, nombre, email, rol, is_active, is_email_verified }
  const [resetTarget, setResetTarget] = useState(null); // user object
  const [newPass, setNewPass] = useState("");

  const cargar = async () => {
    setCargando(true);
    setError("");
    setOk("");
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

  const filtrados = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;

    return items.filter((u) => {
      const nombre = String(u.nombre ?? u.name ?? "").toLowerCase();
      const email = String(u.email ?? "").toLowerCase();
      const rol = String(u.rol ?? u.role ?? "").toLowerCase();
      return nombre.includes(term) || email.includes(term) || rol.includes(term);
    });
  }, [items, q]);

  const abrirEditar = (u) => {
    setError("");
    setOk("");
    setEdit({
      id: u.id,
      nombre: u.nombre ?? u.name ?? "",
      email: u.email ?? "",
      rol: u.rol ?? u.role ?? "USER",
      is_active: Boolean(u.is_active ?? u.active ?? true),
      is_email_verified: Boolean(u.is_email_verified ?? u.email_verified ?? false),
    });
  };

  const cerrarEditar = () => setEdit(null);

  const guardarEdicion = async () => {
    setError("");
    setOk("");

    try {
      const payload = {
        nombre: String(edit.nombre).trim(),
        email: String(edit.email).trim(),
        rol: edit.rol,
        is_active: Boolean(edit.is_active),
        is_email_verified: Boolean(edit.is_email_verified),
      };

      if (!payload.nombre) return setError("El nombre es obligatorio.");
      if (!payload.email) return setError("El email es obligatorio.");

      await updateUser(edit.id, payload);

      setOk("Usuario actualizado ✅");
      cerrarEditar();
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  const abrirReset = (u) => {
    setError("");
    setOk("");
    setResetTarget(u);
    setNewPass("");
  };

  const cerrarReset = () => {
    setResetTarget(null);
    setNewPass("");
  };

  const doReset = async () => {
    setError("");
    setOk("");

    if (!newPass.trim()) {
      setError("La nueva contraseña es obligatoria.");
      return;
    }

    try {
      // 👇 Ajuste flexible: intenta con { new_password } (común) y si falla el backend
      // te mostrará el detalle exacto (422) y lo adaptamos.
      await resetUserPassword(resetTarget.id, { new_password: newPass.trim() });

      setOk("Contraseña reseteada ✅");
      cerrarReset();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h3 className="m-0">
          <i className="bi bi-people me-2" />
          Admin Usuarios
        </h3>

        <div className="d-flex gap-2">
          <input
            className="form-control"
            style={{ maxWidth: 340 }}
            placeholder="Buscar por nombre/email/rol…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <button className="btn btn-outline-light" onClick={cargar} disabled={cargando}>
            <i className="bi bi-arrow-clockwise me-2" />
            Recargar
          </button>
        </div>
      </div>

      <Alerta mensaje={error} />
      <Alerta type="success" mensaje={ok} />

      <div className="p-4 border rounded-3 bg-body-tertiary">
        {cargando ? (
          <Spinner texto="Cargando..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th style={{ width: 120 }}>Rol</th>
                  <th style={{ width: 120 }}>Activo</th>
                  <th style={{ width: 160 }}>Email verificado</th>
                  <th style={{ width: 220 }} className="text-end"></th>
                </tr>
              </thead>

              <tbody>
                {filtrados.map((u) => {
                  const nombre = u.nombre ?? u.name ?? "—";
                  const rol = u.rol ?? u.role ?? "—";
                  const activo = Boolean(u.is_active ?? u.active ?? false);
                  const verificado = Boolean(u.is_email_verified ?? u.email_verified ?? false);

                  return (
                    <tr key={u.id}>
                      <td className="text-secondary">{u.id}</td>
                      <td className="fw-semibold">{nombre}</td>
                      <td className="text-secondary">{u.email ?? "—"}</td>
                      <td>
                        <span className={`badge ${rol === "ADMIN" ? "text-bg-danger" : "text-bg-secondary"}`}>
                          {rol}
                        </span>
                      </td>
                      <td>
                        {activo ? (
                          <span className="badge text-bg-success">Sí</span>
                        ) : (
                          <span className="badge text-bg-secondary">No</span>
                        )}
                      </td>
                      <td>
                        {verificado ? (
                          <span className="badge text-bg-success">Sí</span>
                        ) : (
                          <span className="badge text-bg-secondary">No</span>
                        )}
                      </td>

                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-info me-2" onClick={() => abrirEditar(u)}>
                          <i className="bi bi-pencil me-1" />
                          Editar
                        </button>
                        <button className="btn btn-sm btn-outline-warning" onClick={() => abrirReset(u)}>
                          <i className="bi bi-key me-1" />
                          Reset pass
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-secondary py-4">
                      Sin usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-secondary mt-2 small">
          Endpoints: <code>GET /users/</code> — <code>GET /users/{`{user_id}`}</code> —{" "}
          <code>PUT /users/{`{user_id}`}</code> — <code>POST /users/{`{user_id}`}/reset-password</code>
        </div>
      </div>

      {/* Modal Editar */}
      {edit && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content bg-dark text-light border">
              <div className="modal-header">
                <h5 className="modal-title">Editar usuario #{edit.id}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={cerrarEditar} />
              </div>

              <div className="modal-body">
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Nombre</label>
                    <input
                      className="form-control"
                      value={edit.nombre}
                      onChange={(e) => setEdit((p) => ({ ...p, nombre: e.target.value }))}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      value={edit.email}
                      onChange={(e) => setEdit((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Rol</label>
                    <select
                      className="form-select"
                      value={edit.rol}
                      onChange={(e) => setEdit((p) => ({ ...p, rol: e.target.value }))}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Activo</label>
                    <select
                      className="form-select"
                      value={edit.is_active ? "1" : "0"}
                      onChange={(e) => setEdit((p) => ({ ...p, is_active: e.target.value === "1" }))}
                    >
                      <option value="1">Sí</option>
                      <option value="0">No</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Email verificado</label>
                    <select
                      className="form-select"
                      value={edit.is_email_verified ? "1" : "0"}
                      onChange={(e) => setEdit((p) => ({ ...p, is_email_verified: e.target.value === "1" }))}
                    >
                      <option value="1">Sí</option>
                      <option value="0">No</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-light" onClick={cerrarEditar}>
                  Cancelar
                </button>
                <button className="btn btn-light" onClick={guardarEdicion}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={cerrarEditar} />
        </div>
      )}

      {/* Modal Reset Password */}
      {resetTarget && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content bg-dark text-light border">
              <div className="modal-header">
                <h5 className="modal-title">
                  Reset password — Usuario #{resetTarget.id}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={cerrarReset} />
              </div>

              <div className="modal-body">
                <div className="text-secondary small mb-2">
                  Email: <span className="text-light">{resetTarget.email ?? "—"}</span>
                </div>

                <label className="form-label">Nueva contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Escribe una contraseña segura"
                />

                <div className="text-secondary small mt-2">
                  Endpoint: <code>POST /users/{`{user_id}`}/reset-password</code>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-light" onClick={cerrarReset}>
                  Cancelar
                </button>
                <button className="btn btn-warning" onClick={doReset}>
                  Resetear
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={cerrarReset} />
        </div>
      )}
    </div>
  );
}