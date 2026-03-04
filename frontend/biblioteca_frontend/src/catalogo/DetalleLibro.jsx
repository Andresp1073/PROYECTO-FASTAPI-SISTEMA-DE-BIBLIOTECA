import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLibro } from "../api/libros.js";
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

export default function DetalleLibro() {
  const { id } = useParams();

  const [libro, setLibro] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    setError("");
    setCargando(true);
    try {
      const data = await getLibro(id);
      setLibro(data);
    } catch (err) {
      setError(parseFastApiError(err));
      setLibro(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-9">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3 flex-wrap">
          <h1 className="h4 mb-0">
            <i className="bi bi-book me-2"></i>
            Detalle del Libro
          </h1>

          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-light" onClick={cargar} disabled={cargando}>
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
                <div className="text-secondary small mb-1">ID {libro.id}</div>
                <div className="h5 mb-1 fw-semibold">
                  {libro.titulo ?? libro.title ?? "Sin título"}
                </div>
                <div className="text-secondary">
                  Autor: <span className="text-body">{libro.autor ?? libro.author ?? "—"}</span>
                </div>
              </div>

              <span className="badge text-bg-secondary align-self-start">
                {libro.disponible === false ? "No disponible" : "Disponible"}
              </span>
            </div>

            <hr className="my-4" />

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="text-secondary small">Categoría</div>
                <div className="fw-semibold">
                  {libro.categoria?.nombre ??
                    libro.categoria_nombre ??
                    libro.categoriaNombre ??
                    libro.categoria_id ??
                    "—"}
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="text-secondary small">Año / ISBN</div>
                <div className="fw-semibold">
                  {libro.anio ?? libro.year ?? "—"}{" "}
                  <span className="text-secondary fw-normal">
                    {libro.isbn ? `• ISBN: ${libro.isbn}` : ""}
                  </span>
                </div>
              </div>

              <div className="col-12">
                <div className="text-secondary small">Descripción</div>
                <div className="mt-1">
                  {libro.descripcion ? (
                    <div className="text-body">{libro.descripcion}</div>
                  ) : (
                    <div className="text-secondary">—</div>
                  )}
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div className="small text-secondary">
              Endpoint: <code>GET /libros/{`{id}`}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}