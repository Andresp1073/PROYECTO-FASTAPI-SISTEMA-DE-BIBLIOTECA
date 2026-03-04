// [MODIFICADO]
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMisPrestamos } from "../api/prestamos.js";
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

function normalizarListado(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function fmtFecha(value) {
  if (!value) return "—";
  // Si viene ISO string, mostramos solo fecha/hora corta
  const s = String(value);
  if (s.includes("T")) return s.replace("T", " ").slice(0, 19);
  return s;
}

export default function MisPrestamos() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    setError("");
    setCargando(true);
    try {
      const data = await getMisPrestamos();
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

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-10">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3 flex-wrap">
          <h1 className="h4 mb-0">
            <i className="bi bi-journal-check me-2"></i>
            Mis Préstamos
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
              <i className="bi bi-book me-1"></i>
              Ver libros
            </Link>
          </div>
        </div>

        <Alerta mensaje={error} />

        {cargando ? (
          <div className="p-4 border rounded-3 bg-body-tertiary">
            <Spinner texto="Cargando préstamos..." />
          </div>
        ) : items.length === 0 ? (
          <div className="p-4 border rounded-3 bg-body-tertiary text-secondary">
            No tienes préstamos registrados.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>ID</th>
                  <th>Libro</th>
                  <th style={{ width: 180 }}>Prestado</th>
                  <th style={{ width: 180 }}>Devuelto</th>
                  <th style={{ width: 140 }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const libroTitulo =
                    p.libro?.titulo ??
                    p.libro?.title ??
                    p.libro_titulo ??
                    p.titulo_libro ??
                    `Libro #${p.libro_id ?? "—"}`;

                  const prestado = fmtFecha(p.created_at ?? p.fecha_prestamo);
                  const devuelto = fmtFecha(p.fecha_devolucion ?? p.devuelto_at);

                  const estaDevuelto = Boolean(p.fecha_devolucion || p.devuelto_at);
                  const estado = estaDevuelto ? "Devuelto" : "Activo";

                  return (
                    <tr key={p.id}>
                      <td className="text-secondary">{p.id}</td>
                      <td className="fw-semibold">
                        {libroTitulo}
                        <div className="small text-secondary">
                          Libro ID: {p.libro_id ?? p.libro?.id ?? "—"}
                        </div>
                      </td>
                      <td className="text-secondary">{prestado}</td>
                      <td className="text-secondary">{devuelto}</td>
                      <td>
                        {estaDevuelto ? (
                          <span className="badge text-bg-secondary">{estado}</span>
                        ) : (
                          <span className="badge text-bg-success">{estado}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 small text-secondary">
          Endpoint: <code>GET /prestamos/mis-prestamos</code>
        </div>
      </div>
    </div>
  );
}