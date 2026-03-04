// [MODIFICADO]
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner.jsx";
import Alerta from "../components/Alerta.jsx";
import { getLibros } from "../api/libros.js";
import { getCategorias } from "../api/categorias.js";

const API_BASE = "http://127.0.0.1:8000";

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

function resolveCoverUrl(coverUrl) {
  if (!coverUrl) return "";
  const s = String(coverUrl).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("/")) return `${API_BASE}${s}`;
  return `${API_BASE}/${s}`;
}

function LibroCover({ coverUrl, titulo }) {
  const [fallo, setFallo] = useState(false);
  const src = resolveCoverUrl(coverUrl);

  // Si no hay src o falló, mostramos "?"
  if (!src || fallo) {
    return (
      <div
        className="d-flex align-items-center justify-content-center bg-dark border rounded-3"
        style={{ width: "100%", height: 220 }}
        aria-label="Sin portada"
        title="Sin portada"
      >
        <div style={{ fontSize: 64, lineHeight: 1 }} className="text-secondary">
          ?
        </div>
      </div>
    );
  }

  return (
    <div
      className="border rounded-3 overflow-hidden bg-dark"
      style={{ width: "100%", height: 220 }}
    >
      <img
        src={src}
        alt={`Portada de ${titulo || "libro"}`}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={() => setFallo(true)}
      />
    </div>
  );
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

      const matchText = !text || titulo.includes(text) || autor.includes(text);

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
                placeholder="Ej: Clean Code, García Márquez..."
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
            {filtrados.map((b) => {
              const titulo = b.titulo ?? b.title ?? "Sin título";

              return (
                <div key={b.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="p-3 border rounded-3 bg-body-tertiary h-100 d-flex flex-column">
                    <LibroCover coverUrl={b.cover_url} titulo={titulo} />

                    <div className="mt-3 text-center">
                      <div className="fw-semibold">{titulo}</div>
                      <div className="text-secondary small">
                        {b.autor ?? b.author ?? "—"}
                      </div>
                    </div>

                    <div className="mt-auto pt-3">
                      <Link
                        to={`/libros/${b.id}`}
                        className="btn btn-sm btn-light w-100"
                      >
                        Ver detalles
                        <i className="bi bi-arrow-right ms-2"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}