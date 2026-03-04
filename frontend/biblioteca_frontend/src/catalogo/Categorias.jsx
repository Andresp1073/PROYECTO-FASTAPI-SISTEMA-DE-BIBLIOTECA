import { useEffect, useState } from "react";
import { crearCategoria, getCategorias } from "../api/categorias.js";
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

  return (
    data?.detail ||
    data?.message ||
    `Error ${err?.response?.status || ""}`.trim() ||
    "Ocurrió un error."
  );
}

export default function Categorias() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const cargar = async () => {
    setError("");
    setOk("");
    setCargando(true);
    try {
      const data = await getCategorias();
      // Puede venir como array directo o como {items: []} según backend
      const list = Array.isArray(data) ? data : data?.items || [];
      setItems(list);
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

    if (!nombre.trim()) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    setGuardando(true);
    try {
      await crearCategoria({ nombre });
      setOk("Categoría creada.");
      setNombre("");
      await cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-5">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <h1 className="h4 mb-3">
            <i className="bi bi-tags me-2"></i>
            Categorías
          </h1>

          <Alerta mensaje={error} />
          <Alerta type="success" mensaje={ok} />

          <form onSubmit={onCrear}>
            <div className="mb-3">
              <label className="form-label">Nueva categoría</label>
              <input
                type="text"
                className="form-control"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Ciencia ficción"
              />
            </div>

            <button
              type="submit"
              className="btn btn-light w-100"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Guardando...
                </>
              ) : (
                "Crear categoría"
              )}
            </button>
          </form>

          <div className="mt-3 small text-secondary">
            Conectado a: <code>GET /categorias</code> y <code>POST /categorias</code>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-7">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="h5 mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Listado
            </h2>
            <button className="btn btn-sm btn-outline-light" onClick={cargar} disabled={cargando}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Recargar
            </button>
          </div>

          {cargando ? (
            <Spinner texto="Cargando categorías..." />
          ) : items.length === 0 ? (
            <div className="text-secondary">No hay categorías todavía.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>ID</th>
                    <th>Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id ?? c.nombre}>
                      <td className="text-secondary">{c.id ?? "-"}</td>
                      <td className="fw-semibold">{c.nombre ?? c.name ?? "-"}</td>
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