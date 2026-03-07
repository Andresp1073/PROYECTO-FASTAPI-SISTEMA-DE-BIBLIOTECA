// src/admin/AdminPrestamos.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPrestamos, devolverPrestamo, crearPrestamoAdmin, buscarUsuarios, getLibrosDisponibles } from "../api/prestamos.js";
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
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // Modal para nuevo préstamo
  const [showNuevo, setShowNuevo] = useState(false);
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [busquedaLibro, setBusquedaLibro] = useState("");
  const [librosDisponibles, setLibrosDisponibles] = useState([]);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [creandoPrestamo, setCreandoPrestamo] = useState(false);

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
      await devolverPrestamo(prestamoId);
      setOk("Préstamo devuelto ✅");
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
      cargar();
    }
  };

  // Buscar usuarios por documento
  const buscarUsuariosFn = async () => {
    if (!busquedaUsuario.trim()) return;
    try {
      const res = await buscarUsuarios({ documento: busquedaUsuario.trim() });
      setUsuariosEncontrados(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Buscar libros disponibles
  const buscarLibrosFn = async () => {
    try {
      const params = busquedaLibro.trim() ? { q: busquedaLibro.trim() } : {};
      console.log("Buscando libros con params:", params);
      const res = await getLibrosDisponibles(params);
      console.log("Libros obtenidos:", res);
      setLibrosDisponibles(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Crear préstamo
  const crearNuevoPrestamo = async () => {
    console.log("Usuario seleccionado:", usuarioSeleccionado);
    console.log("Libro seleccionado:", libroSeleccionado);
    if (!usuarioSeleccionado || !libroSeleccionado) {
      setError("Selecciona un usuario y un libro");
      return;
    }
    console.log("Creando préstamo:", { user_id: usuarioSeleccionado.id, libro_id: libroSeleccionado.id });
    setError("");
    setCreandoPrestamo(true);
    try {
      const result = await crearPrestamoAdmin({
        user_id: usuarioSeleccionado.id,
        libro_id: libroSeleccionado.id
      });
      console.log("Préstamo creado:", result);
      setOk("Préstamo creado ✅");
      setShowNuevo(false);
      resetNuevoPrestamo();
      cargar();
    } catch (err) {
      console.error("Error creando préstamo:", err);
      setError(parseFastApiError(err));
    } finally {
      setCreandoPrestamo(false);
    }
  };

  const resetNuevoPrestamo = () => {
    setBusquedaUsuario("");
    setUsuariosEncontrados([]);
    setUsuarioSeleccionado(null);
    setBusquedaLibro("");
    setLibrosDisponibles([]);
    setLibroSeleccionado(null);
  };

  const abrirNuevo = () => {
    resetNuevoPrestamo();
    setShowNuevo(true);
    buscarLibrosFn();
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-light btn-sm" onClick={() => navigate("/admin")}>
            <i className="bi bi-arrow-left" />
          </button>
          <h3 className="m-0">
            <i className="bi bi-clipboard-check me-2" />
            Prestamos (Admin)
          </h3>
        </div>

        <button className="btn btn-outline-light" onClick={cargar} disabled={cargando}>
          <i className="bi bi-arrow-clockwise me-2" />
          Recargar
        </button>

        <button className="btn btn-primary" onClick={abrirNuevo}>
          <i className="bi bi-plus-circle me-2" />
          Nuevo Préstamo
        </button>
      </div>

      <Alerta mensaje={error} />
      <Alerta type="success" mensaje={ok} />

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
      </form>

      <div className="p-4 border rounded bg-body-tertiary">
        {cargando ? (
          <Spinner texto="Cargando prestamos..." />
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
      </div>

      {/* Modal Nuevo Préstamo */}
      {showNuevo && (
        <div className="modal d-block" style={{zIndex: 1056}} tabIndex="-1">
          <div className="modal-backdrop show" style={{zIndex: 1055}} onClick={() => setShowNuevo(false)} />
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{zIndex: 1057}}>
            <div className="modal-content bg-dark text-light border">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle me-2" />
                  Nuevo Préstamo (Presencial)
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowNuevo(false)} />
              </div>

              <div className="modal-body">
                <Alerta mensaje={error} />

                {/* Buscar Usuario */}
                <div className="mb-4">
                  <h6 className="border-bottom pb-2 mb-3">
                    <i className="bi bi-person me-2" />
                    1. Buscar Usuario (por documento)
                  </h6>
                  
                  {!usuarioSeleccionado ? (
                    <div>
                      <div className="d-flex gap-2 mb-2">
                        <input
                          className="form-control"
                          placeholder="Ingrese número de documento"
                          value={busquedaUsuario}
                          onChange={(e) => setBusquedaUsuario(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && buscarUsuariosFn()}
                        />
                        <button className="btn btn-outline-light" onClick={buscarUsuariosFn}>
                          <i className="bi bi-search" />
                        </button>
                      </div>

                      {usuariosEncontrados.length > 0 && (
                        <div className="list-group" style={{maxHeight: 150, overflowY: "auto"}}>
                          {usuariosEncontrados.map((u) => (
                            <button
                              key={u.id}
                              className="list-group-item list-group-item-action bg-secondary text-light border-secondary"
                              onClick={() => {
                                setUsuarioSeleccionado(u);
                                setUsuariosEncontrados([]);
                              }}
                            >
                              <div className="fw-semibold">{u.nombre}</div>
                              <div className="small text-secondary">
                                {u.email} {u.documento && `| Doc: ${u.documento}`}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-secondary p-3 rounded d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">{usuarioSeleccionado.nombre}</div>
                        <div className="small text-secondary">
                          {usuarioSeleccionado.email}
                          {usuarioSeleccionado.documento && ` | Documento: ${usuarioSeleccionado.documento}`}
                        </div>
                      </div>
                      <button className="btn btn-sm btn-outline-light" onClick={() => setUsuarioSeleccionado(null)}>
                        <i className="bi bi-x-lg" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Buscar Libro */}
                <div>
                  <h6 className="border-bottom pb-2 mb-3">
                    <i className="bi bi-book me-2" />
                    2. Seleccionar Libro Disponible
                  </h6>

                  <div className="d-flex gap-2 mb-2">
                    <input
                      className="form-control"
                      placeholder="Buscar por título o autor"
                      value={busquedaLibro}
                      onChange={(e) => setBusquedaLibro(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && buscarLibrosFn()}
                    />
                    <button className="btn btn-outline-light" onClick={buscarLibrosFn}>
                      <i className="bi bi-search" />
                    </button>
                  </div>

                  <div style={{maxHeight: 200, overflowY: "auto"}}>
                    {librosDisponibles.length === 0 ? (
                      <div className="text-secondary text-center py-3">
                        {busquedaLibro ? "No se encontraron libros" : "Cargando libros disponibles..."}
                      </div>
                    ) : (
                      <div className="table-responsive" style={{maxHeight: 180}}>
                        <table className="table table-sm table-dark">
                          <thead>
                            <tr>
                              <th>Título</th>
                              <th>Autor</th>
                              <th>Categoría</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {librosDisponibles.map((libro) => (
                              <tr key={libro.id} className={libroSeleccionado?.id === libro.id ? "table-active" : ""}>
                                <td>{libro.titulo}</td>
                                <td>{libro.autor}</td>
                                <td>{libro.categoria?.nombre || "—"}</td>
                                <td>
                                  <button
                                    className={`btn btn-sm ${libroSeleccionado?.id === libro.id ? "btn-success" : "btn-outline-light"}`}
                                    onClick={() => setLibroSeleccionado(libro)}
                                  >
                                    {libroSeleccionado?.id === libro.id ? "Seleccionado" : "Seleccionar"}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-light" onClick={() => setShowNuevo(false)}>
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={crearNuevoPrestamo}
                  disabled={!usuarioSeleccionado || !libroSeleccionado || creandoPrestamo}
                >
                  {creandoPrestamo ? "Creando..." : "Crear Préstamo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}