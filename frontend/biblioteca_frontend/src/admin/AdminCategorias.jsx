// [MODIFICADO]
import { useEffect, useState } from "react";
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
  return data?.detail || data?.message || "Error inesperado";
}

export default function AdminCategorias() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [editando, setEditando] = useState(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const data = await getCategorias();
      setItems(Array.isArray(data) ? data : data?.items || []);
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
    setEditando(null);
    setNombre("");
    setDescripcion("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!nombre.trim()) {
      setError("nombre: Field required");
      return;
    }

    try {
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() ? descripcion.trim() : null,
      };

      if (editando) {
        await actualizarCategoria(editando, payload);
        setOk("Categoría actualizada");
      } else {
        await crearCategoria(payload);
        setOk("Categoría creada");
      }

      limpiar();
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  const onEditar = (cat) => {
    setEditando(cat.id);
    setNombre(cat.nombre || "");
    setDescripcion(cat.descripcion || "");
    setError("");
    setOk("");
  };

  const onEliminar = async (id) => {
    if (!confirm("¿Eliminar categoría?")) return;
    setError("");
    setOk("");
    try {
      await eliminarCategoria(id);
      setOk("Categoría eliminada");
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">
          <i className="bi bi-tags me-2" />
          Admin Categorías
        </h3>
        <button className="btn btn-outline-light" onClick={cargar}>
          <i className="bi bi-arrow-clockwise me-2" />
          Recargar
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="p-4 border rounded bg-body-tertiary">
            <h5 className="mb-3">{editando ? "Editar categoría" : "Nueva categoría"}</h5>

            <Alerta mensaje={error} />
            <Alerta type="success" mensaje={ok} />

            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label">Nombre *</label>
                <input className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Descripción (opcional)</label>
                <input
                  className="form-control"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              <button className="btn btn-warning w-100">
                {editando ? "Actualizar" : "Crear"}
              </button>

              {editando && (
                <button type="button" className="btn btn-outline-light w-100 mt-2" onClick={limpiar}>
                  Cancelar
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="p-4 border rounded bg-body-tertiary">
            {cargando ? (
              <Spinner texto="Cargando..." />
            ) : (
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th width="140"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.id}</td>
                      <td className="fw-semibold">{cat.nombre}</td>
                      <td>{cat.descripcion || "-"}</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-light me-2" onClick={() => onEditar(cat)}>
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(cat.id)}>
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center text-secondary py-4">
                        Sin categorías
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}