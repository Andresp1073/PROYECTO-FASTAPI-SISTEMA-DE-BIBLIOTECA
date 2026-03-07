import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMisNotificaciones, marcarNotificacionLeida, marcarTodasLeidas } from "../api/solicitudes.js";
import Alerta from "../components/Alerta.jsx";
import Spinner from "../components/Spinner.jsx";

function parseFastApiError(err) {
  const data = err?.response?.data;
  if (Array.isArray(data?.detail)) {
    return data.detail.map((e) => `${e.msg}`).join(" | ");
  }
  return data?.detail || data?.message || "Ocurrió un error.";
}

function normalizarListado(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function fmtFecha(value) {
  if (!value) return "—";
  const s = String(value);
  if (s.includes("T")) return s.replace("T", " ").slice(0, 19);
  return s;
}

function getIconoTipo(tipo) {
  switch (tipo) {
    case "SOLICITUD_PRESTAMO":
      return "bi bi-journal-plus";
    case "SOLICITUD_APROBADA":
      return "bi bi-check-circle text-success";
    case "SOLICITUD_RECHAZADA":
      return "bi bi-x-circle text-danger";
    case "PRESTAMO_VENCIDO":
      return "bi bi-exclamation-triangle text-warning";
    default:
      return "bi bi-bell";
  }
}

export default function MisNotificaciones() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    setError("");
    setCargando(true);
    try {
      const data = await getMisNotificaciones();
      setItems(normalizarListado(data));
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setCargando(false);
    }
  };

  const handleMarcarLeida = async (notificacionId) => {
    try {
      await marcarNotificacionLeida(notificacionId);
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await marcarTodasLeidas();
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const noLeidas = items.filter((n) => !n.leida).length;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h3 className="m-0">
          <i className="bi bi-bell me-2" />
          Mis Notificaciones
          {noLeidas > 0 && (
            <span className="badge bg-danger ms-2">{noLeidas}</span>
          )}
        </h3>

        <div className="d-flex gap-2">
          {noLeidas > 0 && (
            <button className="btn btn-outline-light btn-sm" onClick={handleMarcarTodasLeidas}>
              <i className="bi bi-check-all me-1" />
              Marcar todas como leídas
            </button>
          )}
          <button className="btn btn-outline-light btn-sm" onClick={cargar} disabled={cargando}>
            <i className="bi bi-arrow-clockwise me-1" />
            Recargar
          </button>
        </div>
      </div>

      <Alerta mensaje={error} />

      <div className="p-4 border rounded-3 bg-body-tertiary">
        {cargando ? (
          <Spinner texto="Cargando notificaciones..." />
        ) : items.length === 0 ? (
          <div className="text-secondary text-center py-4">
            <i className="bi bi-bell-slash fs-1 d-block mb-2"></i>
            No tienes notificaciones
          </div>
        ) : (
          <div className="list-group">
            {items.map((n) => (
              <div
                key={n.id}
                className={`list-group-item list-group-item-action d-flex gap-3 py-3 ${!n.leida ? "bg-dark" : "bg-body"}`}
                style={{ cursor: "pointer" }}
                onClick={() => !n.leida && handleMarcarLeida(n.id)}
              >
                <i className={`${getIconoTipo(n.tipo)} fs-4`}></i>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <strong className={!n.leida ? "text-white" : ""}>{n.titulo}</strong>
                    <small className="text-secondary">{fmtFecha(n.created_at)}</small>
                  </div>
                  <div className="text-secondary small">{n.mensaje}</div>
                  {n.leida && <div className="text-muted small mt-1"><i className="bi bi-check me-1"></i>Leída</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
