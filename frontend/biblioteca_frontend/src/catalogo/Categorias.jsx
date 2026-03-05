// src/admin/AdminCategorias.jsx
import { useEffect, useMemo, useState } from "react";
import {
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../api/categorias.js";
import Alerta from "../components/Alerta.jsx";
import Spinner from "../components/Spinner.jsx";

function parseFastApiError(err) {
  const data = err?.response?.data;
  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((e) => `${Array.isArray(e.loc) ? e.loc.join(".") : "body"}: ${e.msg}`)
      .join(" | ");
  }
  return data?.detail || data?.message || `Error ${err?.response?.status || ""}`.trim() || "Ocurrió un error.";
}

function normalizarListado(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function AdminCategorias() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [nombre, setNombre] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
  }, [items]);

  const cargar = async () => {
    setCargando(true);
    setError("");
    setOk("");
    try {
      const data = await getCategorias();
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

  const onCrear = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    try {
      const payload = { nombre: nombre.trim() };
      if (!payload.nombre) {
        setError("El nombre es obligatorio.");
        return;
      }
      await crearCategoria(payload);
      setNombre("");
      setOk("Categoría creada ✅");
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  const abrirEditar = (c) => {
    setError("");
    setOk("");
    setEditId(c.id);
    setEditNombre(c.nombre ?? "");
  };

  const cancelarEditar = () => {
    setEditId(null);
    setEditNombre("");
  };

  const onGuardarEdicion = async () => {
    setError("");
    setOk("");
    try {
      const payload = { nombre: editNombre.trim() };
      if (!payload.nombre) {
        setError("El nombre es obligatorio.");
        return;
      }
      await actualizarCategoria(editId, payload);
      setOk("Categoría actualizada ✅");
      cancelarEditar();
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  const onEliminar = async () => {
    setError("");
    setOk("");
    try {
      await eliminarCategoria(confirmDeleteId);
      setOk("Categoría eliminada ✅");
      setConfirmDeleteId(null);
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h3 className="m-0">
          <i className="bi bi-tags me-2" />
          Admin Categorías
        </h3>

        <button className="btn btn-outline-light" onClick={cargar} disabled={cargando}>
          <i className="bi bi-arrow-clockwise me-2" />
          Recargar
        </button>
      </div>

      <Alerta mensaje={error} />
      <Alerta type="success" mensaje={ok} />

      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <div className="p-4 border rounded-3 bg-body-tertiary">
            <div className="h5 mb-3">Crear categoría</div>
            <form onSubmit={onCrear}>
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Ciencia Ficción"
              />
              <button className="btn btn-light mt-3 w-100" type="submit">
                <i className="bi bi-plus-circle me-2" />
                Crear
              </button>
            </form>

            <div className="text-secondary small mt-3">
              Endpoints: <code>GET /categorias</code> — <code>POST /categorias</code> —{" "}
              <code>PUT /categorias/{`{id}`}</code> — <code>DELETE /categorias/{`{id}`}</code>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="p-4 border rounded-3 bg-body-tertiary">
            <div className="h5 mb-3">Listado</div>

            {cargando ? (
              <Spinner texto="Cargando..." />
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle">
                  <thead>
                    <tr>
                      <th style={{ width: 90 }}>ID</th>
                      <th>Nombre</th>
                      <th style={{ width: 200 }} className="text-end"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((c) => (
                      <tr key={c.id}>
                        <td className="text-secondary">{c.id}</td>
                        <td className="fw-semibold">{c.nombre}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-info me-2" onClick={() => abrirEditar(c)}>
                            <i className="bi bi-pencil me-1" />
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setConfirmDeleteId(c.id)}
                          >
                            <i className="bi bi-trash me-1" />
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}

                    {sorted.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center text-secondary py-4">
                          Sin categorías
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Editar */}
      {editId != null && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content bg-dark text-light border">
              <div className="modal-header">
                <h5 className="modal-title">Editar categoría #{editId}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={cancelarEditar} />
              </div>
              <div className="modal-body">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-light" onClick={cancelarEditar}>
                  Cancelar
                </button>
                <button className="btn btn-light" onClick={onGuardarEdicion}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={cancelarEditar} />
        </div>
      )}

      {/* Modal Eliminar */}
      {confirmDeleteId != null && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content bg-dark text-light border">
              <div className="modal-header">
                <h5 className="modal-title">Eliminar categoría</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setConfirmDeleteId(null)}
                />
              </div>
              <div className="modal-body">
                ¿Seguro que deseas eliminar la categoría #{confirmDeleteId}?
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-light" onClick={() => setConfirmDeleteId(null)}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={onEliminar}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" onClick={() => setConfirmDeleteId(null)} />
        </div>
      )}
    </div>
  );
}