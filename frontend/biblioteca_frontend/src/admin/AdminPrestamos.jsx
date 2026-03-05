// [MODIFICADO]
import { useEffect, useState } from "react";
import { getPrestamos, devolverPrestamo } from "../api/prestamos.js";
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

export default function AdminPrestamos() {
  const [cargando, setCargando] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const data = await getPrestamos();
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

  const devolver = async (id) => {
    setError("");
    setOk("");
    try {
      await devolverPrestamo(id);
      setOk("Préstamo devuelto ✅");
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
      // si backend dice "ya devuelto" igual recargamos para reflejar estado correcto
      cargar();
    }
  };

  const fmt = (s) => (s ? String(s).replace("T", " ").slice(0, 19) : "-");

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="m-0">
          <i className="bi bi-clipboard-check me-2" />
          Admin Préstamos
        </h3>
        <button className="btn btn-outline-light" onClick={cargar}>
          <i className="bi bi-arrow-clockwise me-2" />
          Recargar
        </button>
      </div>

      <Alerta mensaje={error} />
      <Alerta type="success" mensaje={ok} />

      <div className="p-4 border rounded bg-body-tertiary">
        {cargando ? (
          <Spinner texto="Cargando..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Libro</th>
                  <th>Prestado en</th>
                  <th>Devuelto en</th>
                  <th>Estado</th>
                  <th width="140"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.user_id}</td>
                    <td>{p.libro_id}</td>
                    <td>{fmt(p.prestado_en)}</td>
                    <td>{fmt(p.devuelto_en)}</td>
                    <td>
                      <span className={`badge ${p.estado === "DEVUELTO" ? "text-bg-secondary" : "text-bg-warning"}`}>
                        {p.estado || "PRESTADO"}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => devolver(p.id)}
                        disabled={p.estado === "DEVUELTO"}
                      >
                        <i className="bi bi-box-arrow-in-left me-2" />
                        Devolver
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-secondary py-4">
                      Sin préstamos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-secondary mt-2 small">
          Endpoints: <code>GET /prestamos/</code> — <code>POST /prestamos/devolver</code>
        </div>
      </div>
    </div>
  );
}