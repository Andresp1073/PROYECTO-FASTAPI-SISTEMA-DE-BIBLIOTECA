// [MODIFICADO]
import { useEffect, useState } from "react";
import { devolverPrestamo, getPrestamos } from "../api/prestamos.js";
import Spinner from "../components/Spinner.jsx";
import Alerta from "../components/Alerta.jsx";

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

function fmtFecha(v) {
  if (!v) return "-";
  const s = String(v);
  return s.replace("T", " ").split(".")[0];
}

export default function AdminPrestamos() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const cargar = async () => {
    setError("");
    setOk("");
    setCargando(true);

    try {
      const data = await getPrestamos();
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

  const devolver = async (prestamoId) => {
    setError("");
    setOk("");

    if (!window.confirm("¿Marcar este préstamo como devuelto?")) return;

    try {
      await devolverPrestamo(prestamoId);
      setOk("Préstamo marcado como devuelto.");
      await cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  return (
    <div className="p-4 border rounded-3 bg-body-tertiary">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h1 className="h5 mb-0">
          <i className="bi bi-journal-check me-2"></i>
          Admin Préstamos
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

      <Alerta mensaje={error} />
      <Alerta type="success" mensaje={ok} />

      {cargando ? (
        <Spinner texto="Cargando préstamos..." />
      ) : items.length === 0 ? (
        <div className="text-secondary">No hay préstamos.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th>Usuario</th>
                <th>Libro</th>
                <th style={{ width: 200 }}>Fecha préstamo</th>
                <th style={{ width: 200 }}>Fecha devolución</th>
                <th style={{ width: 120 }}>Estado</th>
                <th style={{ width: 130 }}></th>
              </tr>
            </thead>

            <tbody>
              {items.map((p) => {
                // ✅ Tu backend real
                const fechaPrestamo = fmtFecha(
                  p.prestado_en ?? p.fecha_prestamo ?? p.created_at
                );
                const fechaDevolucion = fmtFecha(
                  p.devuelto_en ?? p.fecha_devolucion ?? p.returned_at
                );

                const estadoRaw = String(p.estado ?? "").toUpperCase();
                const devuelto = Boolean(p.devuelto_en) || estadoRaw === "DEVUELTO";

                const usuarioTexto = p.user_id ?? p.usuario_id ?? "-";
                const libroTexto = p.libro_id ?? p.book_id ?? "-";

                return (
                  <tr key={p.id}>
                    <td className="text-secondary">{p.id}</td>

                    <td>
                      <div className="fw-semibold">{usuarioTexto}</div>
                    </td>

                    <td>
                      <div className="fw-semibold">{libroTexto}</div>
                    </td>

                    <td className="text-secondary">{fechaPrestamo}</td>
                    <td className="text-secondary">{fechaDevolucion}</td>

                    <td>
                      {devuelto ? (
                        <span className="badge text-bg-success">Devuelto</span>
                      ) : (
                        <span className="badge text-bg-warning">Prestado</span>
                      )}
                    </td>

                    <td className="text-end">
                      {!devuelto && (
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => devolver(p.id)}
                        >
                          <i className="bi bi-box-arrow-in-left me-1"></i>
                          Devolver
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="small text-secondary mt-3">
        Endpoints: <code>GET /prestamos/</code> •{" "}
        <code>POST /prestamos/devolver</code> (body:{" "}
        <code>{`{ prestamo_id: id }`}</code>)
      </div>
    </div>
  );
}