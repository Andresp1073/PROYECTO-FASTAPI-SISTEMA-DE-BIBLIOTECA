// [MODIFICADO]
import { useEffect, useState } from "react";
import { getCategorias, crearCategoria } from "../api/categorias.js";
import http from "../api/http.js";
import Alerta from "../components/Alerta.jsx";
import Spinner from "../components/Spinner.jsx";

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

export default function AdminCategorias() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [editandoId, setEditandoId] = useState(null);

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const cargar = async () => {
    setError("");
    setOk("");
    setCargando(true);
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

  const limpiarFormulario = () => {
    setNombre("");
    setDescripcion("");
    setEditandoId(null);
  };

  const crear = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    try {
      await crearCategoria({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() ? descripcion.trim() : null,
      });

      setOk("Categoría creada.");
      limpiarFormulario();
      await cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  const actualizar = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (!editandoId) return;

    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    try {
      await http.put(`/categorias/${editandoId}`, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() ? descripcion.trim() : null,
      });

      setOk("Categoría actualizada.");
      limpiarFormulario();
      await cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  const eliminar = async (id) => {
    setError("");
    setOk("");

    if (!window.confirm("¿Eliminar categoría?")) return;

    try {
      await http.delete(`/categorias/${id}`);
      setOk("Categoría eliminada.");
      await cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  const cargarEdicion = (cat) => {
    setEditandoId(cat.id);
    setNombre(cat.nombre ?? "");
    setDescripcion(cat.descripcion ?? "");
  };

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-4">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <h1 className="h5 mb-3">
            <i className="bi bi-tags me-2"></i>
            {editandoId ? "Editar categoría" : "Nueva categoría"}
          </h1>

          <Alerta mensaje={error} />
          <Alerta type="success" mensaje={ok} />

          <form onSubmit={editandoId ? actualizar : crear}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Programación"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción (opcional)</label>
              <input
                className="form-control"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Libros sobre desarrollo backend"
              />
            </div>

            <button className="btn btn-light w-100" type="submit">
              {editandoId ? "Actualizar" : "Crear"}
            </button>

            {editandoId && (
              <button
                type="button"
                className="btn btn-outline-light w-100 mt-2"
                onClick={limpiarFormulario}
              >
                Cancelar
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="col-12 col-lg-8">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <h2 className="h5 mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Lista de categorías
            </h2>

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
            <Spinner texto="Cargando..." />
          ) : items.length === 0 ? (
            <div className="text-secondary">No hay categorías.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>ID</th>
                    <th style={{ width: 220 }}>Nombre</th>
                    <th>Descripción</th>
                    <th style={{ width: 130 }}></th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((cat) => (
                    <tr key={cat.id}>
                      <td className="text-secondary">{cat.id}</td>
                      <td className="fw-semibold">{cat.nombre}</td>
                      <td className="text-secondary">
                        {cat.descripcion ? cat.descripcion : "—"}
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-light me-2"
                          onClick={() => cargarEdicion(cat)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => eliminar(cat.id)}
                          title="Eliminar"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}