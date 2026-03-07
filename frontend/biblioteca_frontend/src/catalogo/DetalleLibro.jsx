// src/catalogo/DetalleLibro.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLibro } from "../api/libros.js";
import { getCategorias } from "../api/categorias.js";
import { solicitarPrestamo, getMisSolicitudes } from "../api/solicitudes.js";
import Alerta from "../components/Alerta.jsx";
import Spinner from "../components/Spinner.jsx";

const API_BASE = "http://localhost:8000";

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

  return data?.detail || data?.message || "Ocurrió un error.";
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

export default function DetalleLibro() {
  const { id } = useParams();

  const [libro, setLibro] = useState(null);
  const [categorias, setCategorias] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [solicitando, setSolicitando] = useState(false);

  const catNombrePorId = useMemo(() => {
    const m = new Map();
    categorias.forEach((c) => m.set(String(c.id), c.nombre));
    return m;
  }, [categorias]);

  const cargar = async () => {
    setError("");
    setCargando(true);

    try {
      const [libroData, catsData] = await Promise.all([
        getLibro(id),
        getCategorias(),
      ]);

      setCategorias(normalizarListado(catsData));
      setLibro(libroData);
    } catch (err) {
      setError(parseFastApiError(err));
      setLibro(null);
    } finally {
      setCargando(false);
    }
  };

  const handleSolicitar = async () => {
    setError("");
    setOk("");
    setSolicitando(true);
    try {
      await solicitarPrestamo(libro.id);
      setOk("Solicitud enviada. Te notificaremos cuando sea aprobada.");
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setSolicitando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [id]);

  const categoriaNombre = (() => {
    if (!libro) return "—";
    if (libro.categoria?.nombre) return libro.categoria.nombre;

    const cid =
      libro.categoria_id ??
      libro.categoriaId ??
      libro.categoria?.id ??
      null;

    if (cid === null || cid === undefined) return "—";
    return catNombrePorId.get(String(cid)) || `ID ${cid}`;
  })();

  const estado = libro?.estado ?? "—";
  const badgeClass =
    estado === "DISPONIBLE"
      ? "text-bg-success"
      : estado === "PRESTADO"
      ? "text-bg-warning"
      : "text-bg-secondary";

  const coverSrc = resolveCoverUrl(libro?.cover_url);

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-9">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3 flex-wrap">
          <h1 className="h4 mb-0">
            <i className="bi bi-book me-2"></i>
            Detalle del Libro
          </h1>

          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-light"
              onClick={cargar}
              disabled={cargando}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Recargar
            </button>

            <Link to="/libros" className="btn btn-sm btn-light">
              <i className="bi bi-arrow-left me-1"></i>
              Volver
            </Link>
          </div>
        </div>

        <Alerta mensaje={error} />

        {cargando ? (
          <div className="p-4 border rounded-3 bg-body-tertiary">
            <Spinner texto="Cargando libro..." />
          </div>
        ) : !libro ? (
          <div className="p-4 border rounded-3 bg-body-tertiary text-secondary">
            No se encontró el libro.
          </div>
        ) : (
          <div className="p-4 border rounded-3 bg-body-tertiary">
            <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
              <div>
                <div className="text-secondary small mb-1">
                  ID {libro.id}
                </div>

                <div className="h5 mb-1 fw-semibold">
                  {libro.titulo ?? "Sin título"}
                </div>

                <div className="text-secondary">
                  Autor:{" "}
                  <span className="text-body">
                    {libro.autor ?? "—"}
                  </span>
                </div>
              </div>

              <span className={`badge ${badgeClass} align-self-start`}>
                {estado}
              </span>
              
              {estado === "DISPONIBLE" && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={handleSolicitar}
                  disabled={solicitando}
                >
                  {solicitando ? "Enviando..." : "Solicitar Préstamo"}
                </button>
              )}
            </div>

            <Alerta mensaje={ok} type="success" />

            {coverSrc ? (
              <div className="mt-4">
                <div className="text-secondary small mb-2">
                  Portada
                </div>

                <div
                  className="border rounded-3 overflow-hidden"
                  style={{ width: 160, height: 220 }}
                >
                  <img
                    src={coverSrc}
                    alt={`Portada de ${libro.titulo}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 text-secondary">
                No hay portada disponible.
              </div>
            )}

            <hr className="my-4" />

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="text-secondary small">
                  Categoría
                </div>
                <div className="fw-semibold">
                  {categoriaNombre}
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="text-secondary small">ISBN</div>
                <div className="fw-semibold">
                  {libro.isbn ?? "—"}
                </div>
              </div>

              <div className="col-12">
                <div className="text-secondary small">
                  Resumen
                </div>
                <div className="mt-1">
                  {libro.resumen ? (
                    <div className="text-body">
                      {libro.resumen}
                    </div>
                  ) : (
                    <div className="text-secondary">—</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}