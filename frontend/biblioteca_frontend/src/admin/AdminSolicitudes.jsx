import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSolicitudesPendientes, aprobarSolicitud, rechazarSolicitud } from "../api/solicitudes.js";
import { useTheme } from "../context/ThemeContext.jsx";
import Alerta from "../components/Alerta.jsx";
import Spinner from "../components/Spinner.jsx";

function parseFastApiError(err) {
  const data = err?.response?.data;
  if (Array.isArray(data?.detail)) {
    return data.detail.map((e) => `${e.msg}`).join(" | ");
  }
  return data?.detail || data?.message || "Ocurrió un error.";}

function normalizarListado(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];}

function fmtFecha(value) {
  if (!value) return "—";
  const s = String(value);
  if (s.includes("T")) return s.replace("T", " ").slice(0, 19);
  return s;}

export default function AdminSolicitudes() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [procesando, setProcesando] = useState(null);
  const [rechazoModal, setRechazoModal] = useState(null);
  const [notaRechazo, setNotaRechazo] = useState("");

  const cargar = async () => {
    setError("");
    setCargando(true);
    try {
      const data = await getSolicitudesPendientes();
      setItems(normalizarListado(data));
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setCargando(false);
    }
  };

  const handleAprobar = async (solicitudId) => {
    setError("");
    setOk("");
    setProcesando(solicitudId);
    try {
      await aprobarSolicitud(solicitudId);
      setOk("Solicitud aprobada ✅");
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async () => {
    if (!rechazoModal) return;
    setError("");
    setOk("");
    setProcesando(rechazoModal);
    try {
      await rechazarSolicitud(rechazoModal, notaRechazo);
      setOk("Solicitud rechazada ✅");
      setRechazoModal(null);
      setNotaRechazo("");
      cargar();
    } catch (err) {
      console.error("Error rechazando:", err);
      setError(parseFastApiError(err));
    } finally {
      setProcesando(null);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-dark btn-sm" onClick={() => navigate("/admin")}>
            <i className="bi bi-arrow-left" />
          </button>
          <h3 className="m-0">
            <i className="bi bi-journal-plus me-2" />
            Solicitudes de Préstamo
          </h3>
        </div>

        <button className="btn btn-outline-dark" onClick={cargar} disabled={cargando}>
          <i className="bi bi-arrow-clockwise me-2" />
          Recargar
        </button>
      </div>

      <Alerta mensaje={error} />
      <Alerta type="success" mensaje={ok} />

      <div className="p-4 border rounded-3 bg-body-tertiary">
        {cargando ? (
          <Spinner texto="Cargando solicitudes..." />
        ) : items.length === 0 ? (
          <div className="text-center text-secondary py-4">
            <i className="bi bi-check-circle fs-1 d-block mb-2"></i>
            No hay solicitudes pendientes
          </div>
        ) : (
          <div className="table-responsive">
            <table className={`table ${theme === "dark" ? "table-dark" : "table-striped"} table-hover align-middle`}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Documento</th>
                  <th>Libro</th>
                  <th>Fecha Solicitud</th>
                  <th className="text-end">Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="fw-semibold">{s.usuario_nombre}</div>
                      <div className="small text-secondary">{s.usuario_email}</div>
                    </td>
                    <td className="text-secondary">
                      {s.usuario_documento || "—"}
                    </td>
                    <td>
                      <div className="fw-semibold">{s.libro_titulo}</div>
                      <div className="small text-secondary">ID: {s.libro_id}</div>
                    </td>
                    <td className="text-secondary">{fmtFecha(s.created_at)}</td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleAprobar(s.id)}
                          disabled={procesando === s.id}
                        >
                          {procesando === s.id ? "..." : "Aprobar"}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setRechazoModal(s.id)}
                          disabled={procesando === s.id}
                        >
                          {procesando === s.id ? "..." : "Rechazar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de rechazo */}
      {rechazoModal && (
        <div className="modal d-block" style={{zIndex: 1056}} tabIndex="-1" role="dialog">
          <div className="modal-backdrop show" style={{zIndex: 1055}} onClick={() => setRechazoModal(null)} />
          <div className="modal-dialog modal-dialog-centered" style={{zIndex: 1057}} role="document">
            <div className="modal-content bg-dark text-light border">
              <div className="modal-header">
                <h5 className="modal-title">Rechazar Solicitud</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setRechazoModal(null)} />
              </div>
              <div className="modal-body">
                <label className="form-label">Motivo del rechazo (opcional)</label>
                <textarea
                  className="form-control"
                  value={notaRechazo}
                  onChange={(e) => setNotaRechazo(e.target.value)}
                  placeholder="Ej: Libro en mantenimiento"
                  rows="3"
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-dark" onClick={() => setRechazoModal(null)}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={handleRechazar}>
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
