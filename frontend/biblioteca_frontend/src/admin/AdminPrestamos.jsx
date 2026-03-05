// src/admin/AdminPrestamos.jsx
import { useEffect, useMemo, useState } from "react";
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
  return (
    data?.detail ||
    data?.message ||
    `Error ${err?.response?.status || ""}`.trim() ||
    "Error inesperado"
  );
}

function normalizarListado(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function fmt(value) {
  if (!value) return "—";
  const s = String(value);
  return s.includes("T") ? s.replace("T", " ").slice(0, 19) : s;
}

export default function AdminPrestamos() {
  const [cargando, setCargando] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // ✅ Por defecto: Prestados
  const [tab, setTab] = useState("PRESTADO"); // PRESTADO | DEVUELTO | TODOS

  // filtros query (opcionales)
  const [userId, setUserId] = useState("");
  const [libroId, setLibroId] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (tab !== "TODOS") p.estado = tab; // backend: estado en query
    if (userId.trim()) p.user_id = Number(userId);
    if (libroId.trim()) p.libro_id = Number(libroId);
    return p;
  }, [tab, userId, libroId]);

  const cargar = async () => {
    setCargando(true);
    setError("");
    setOk("");
    try {
      // ✅ GET /prestamos?estado=...
      const data = await getPrestamos(params);
      setItems(normalizarListado(data));
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const aplicarFiltros = (e) => {
    e?.preventDefault?.();
    cargar();
  };

  const limpiarFiltros = () => {
    setUserId("");
    setLibroId("");
    // no cambiamos tab
    setTimeout(() => cargar(), 0);
  };

  const devolver = async (prestamoId) => {
    setError("");
    setOk("");
    try {
      // ✅ PUT /prestamos/{prestamo_id}/devolver
      await devolverPrestamo(prestamoId);
      setOk("Préstamo devuelto ✅");
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
      cargar();
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h3 className="m-0">
          <i className="bi bi-clipboard-check me-2" />
          Préstamos (Admin)
        </h3>

        <button className="btn btn-outline-light" onClick={cargar} disabled={cargando}>
          <i className="bi bi-arrow-clockwise me-2" />
          Recargar
        </button>
      </div>

      <Alerta mensaje={error} />
      <Alerta type="success" mensaje={ok} />

      {/* Tabs */}
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <button
          className={`btn btn-sm ${tab === "PRESTADO" ? "btn-light" : "btn-outline-light"}`}
          onClick={() => setTab("PRESTADO")}
        >
          <i className="bi bi-journal-arrow-up me-1" />
          Prestados
        </button>

        <button
          className={`btn btn-sm ${tab === "DEVUELTO" ? "btn-light" : "btn-outline-light"}`}
          onClick={() => setTab("DEVUELTO")}
        >
          <i className="bi bi-check2-circle me-1" />
          Devueltos
        </button>

        <button
          className={`btn btn-sm ${tab === "TODOS" ? "btn-light" : "btn-outline-light"}`}
          onClick={() => setTab("TODOS")}
        >
          <i className="bi bi-list-ul me-1" />
          Todos
        </button>
      </div>

      {/* Filtros */}
      <form onSubmit={aplicarFiltros} className="p-3 border rounded bg-body-tertiary mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-3">
            <label className="form-label">user_id (opcional)</label>
            <input
              className="form-control"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Ej: 3"
              inputMode="numeric"
            />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">libro_id (opcional)</label>
            <input
              className="form-control"
              value={libroId}
              onChange={(e) => setLibroId(e.target.value)}
              placeholder="Ej: 10"
              inputMode="numeric"
            />
          </div>

          <div className="col-12 col-md-6 d-flex gap-2">
            <button className="btn btn-light" type="submit" disabled={cargando}>
              <i className="bi bi-funnel me-2" />
              Aplicar
            </button>
            <button className="btn btn-outline-light" type="button" onClick={limpiarFiltros} disabled={cargando}>
              <i className="bi bi-x-circle me-2" />
              Limpiar
            </button>
          </div>
        </div>

        <div className="text-secondary small mt-2">
          Endpoint: <code>GET /prestamos</code> (query: <code>estado</code>, <code>user_id</code>, <code>libro_id</code>)
        </div>
      </form>

      {/* Tabla */}
      <div className="p-4 border rounded bg-body-tertiary">
        {cargando ? (
          <Spinner texto="Cargando préstamos..." />
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>ID</th>
                  <th>Usuario</th>
                  <th>Libro</th>
                  <th style={{ width: 190 }}>Prestado</th>
                  <th style={{ width: 190 }}>Devuelto</th>
                  <th style={{ width: 140 }}>Estado</th>
                  <th style={{ width: 150 }} className="text-end"></th>
                </tr>
              </thead>

              <tbody>
                {items.map((p) => {
                  const estadoRaw = String(p.estado ?? "").toUpperCase();
                  const estaDevuelto =
                    estadoRaw === "DEVUELTO" ||
                    Boolean(p.devuelto_en || p.fecha_devolucion || p.devuelto_at);

                  const estado = estadoRaw || (estaDevuelto ? "DEVUELTO" : "PRESTADO");

                  const usuarioLabel =
                    p.usuario?.email ||
                    p.user?.email ||
                    p.usuario?.nombre ||
                    p.user?.nombre ||
                    p.user_email ||
                    `ID ${p.user_id ?? p.usuario_id ?? "—"}`;

                  const libroLabel =
                    p.libro?.titulo ||
                    p.book?.titulo ||
                    p.libro_titulo ||
                    p.titulo_libro ||
                    `ID ${p.libro_id ?? "—"}`;

                  const prestado = fmt(p.prestado_en ?? p.created_at ?? p.fecha_prestamo);
                  const devuelto = fmt(p.devuelto_en ?? p.fecha_devolucion ?? p.devuelto_at);

                  return (
                    <tr key={p.id}>
                      <td className="text-secondary">{p.id}</td>
                      <td className="fw-semibold">{usuarioLabel}</td>
                      <td>
                        <div className="fw-semibold">{libroLabel}</div>
                        <div className="small text-secondary">
                          Libro ID: {p.libro_id ?? p.libro?.id ?? "—"} | User ID:{" "}
                          {p.user_id ?? p.usuario?.id ?? "—"}
                        </div>
                      </td>
                      <td className="text-secondary">{prestado}</td>
                      <td className="text-secondary">{devuelto}</td>
                      <td>
                        <span className={`badge ${estado === "DEVUELTO" ? "text-bg-secondary" : "text-bg-warning"}`}>
                          {estado}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => devolver(p.id)}
                          disabled={estado === "DEVUELTO"}
                        >
                          <i className="bi bi-box-arrow-in-left me-2" />
                          Devolver
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {items.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-secondary py-4">
                      Sin registros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-secondary mt-2 small">
          Devolver: <code>PUT /prestamos/{`{prestamo_id}`}/devolver</code>
        </div>
      </div>
    </div>
  );
}