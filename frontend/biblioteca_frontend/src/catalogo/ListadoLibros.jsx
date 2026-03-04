import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner.jsx";
import Alerta from "../components/Alerta.jsx";
import { getLibros } from "../api/libros.js";
import { getCategorias } from "../api/categorias.js";

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

function normalizarListado(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function ListadoLibros() {
  const [libros, setLibros] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const cargar = async () => {
    setError("");
    setCargando(true);
    try {
      const [l, c] = await Promise.all([getLibros(), getCategorias()]);
      setLibros(normalizarListado(l));
      setCategorias(normalizarListado(c));
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
    const text = q.trim().toLowerCase();

    return libros.filter((b) => {
      const titulo = String(b.titulo ?? b.title ?? "").toLowerCase();
      const autor = String(b.autor ?? b.author ?? "").toLowerCase();

      const matchText =
        !text || titulo.includes(text) || autor.includes(text);

      const catLibro = String(
        b.categoria_id ?? b.categoriaId ?? b.categoria?.id ?? ""
      );

      const matchCategoria = !categoriaId || catLibro === String(categoriaId);

      return matchText && matchCategoria;
    });
  }, [libros, q, categoriaId]);

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <h1 className="h4 mb-0">
              <i className="bi bi-book me-2"></i>
              Libros
            </h1>

            <button
              className="btn btn-sm btn-outline-light"
              onClick={cargar}
              disabled={cargando}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Recargar
            </button>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-12 col-md-7">
              <label className="form-label">Buscar (título o autor)</label>
              <input
                className="form-control"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ej: Dune, García Márquez..."
              />
            </div>

            <div className="col-12 col-md-5">
              <label className="form-label">Categoría</label>
              <select
                className="form-select"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">Todas</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 small text-secondary">
            {filtrados.length} libro(s) encontrados
          </div>
        </div>
      </div>

      <div className="col-12">
        <Alerta mensaje={error} />

        {cargando ? (
          <div className="p-4 border rounded-3 bg-body-tertiary">
            <Spinner texto="Cargando libros..." />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-4 border rounded-3 bg-body-tertiary text-secondary">
            No hay libros para mostrar con esos filtros.
          </div>
        ) : (
          <div className="row g-3">
            {filtrados.map((b) => (
              <div key={b.id} className="col-12 col-md-6 col-lg-4">
                <div className="p-3 border rounded-3 bg-body-tertiary h-100 d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div>
                      <div className="fw-semibold">
                        {b.titulo ?? b.title ?? "Sin título"}
                      </div>
                      <div className="text-secondary small">
                        {b.autor ?? b.author ?? "Autor desconocido"}
                      </div>
                    </div>
                    <span className="badge text-bg-secondary">ID {b.id}</span>
                  </div>

                  {b.descripcion && (
                    <div className="text-secondary small mt-2">
                      {String(b.descripcion).slice(0, 120)}
                      {String(b.descripcion).length > 120 ? "..." : ""}
                    </div>
                  )}

                  <div className="mt-auto pt-3">
                    <Link
                      to={`/libros/${b.id}`}
                      className="btn btn-sm btn-light w-100"
                    >
                      Ver detalle
                      <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}