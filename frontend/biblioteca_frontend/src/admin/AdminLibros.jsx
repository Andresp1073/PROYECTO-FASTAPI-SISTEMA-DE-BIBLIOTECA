// src/admin/AdminLibros.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLibros, crearLibro, actualizarLibro, eliminarLibro } from "../api/libros.js";
import { getCategorias } from "../api/categorias.js";
import { uploadCover } from "../api/uploads.js";
import { useTheme } from "../context/ThemeContext.jsx";
import Alerta from "../components/Alerta.jsx";
import Spinner from "../components/Spinner.jsx";

const API_BASE = "http://localhost:8000";

function parseFastApiError(err) {
  const data = err?.response?.data;
  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((e) => `${Array.isArray(e.loc) ? e.loc.join(".") : "body"}: ${e.msg}`)
      .join(" | ");
  }
  return data?.detail || data?.message || `Error ${err?.response?.status || ""}`.trim() || "Ocurrió un error.";
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

export default function AdminLibros() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [cargando, setCargando] = useState(true);
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [q, setQ] = useState("");

  // Crear
  const [form, setForm] = useState({
    titulo: "",
    autor: "",
    isbn: "",
    categoria_id: "",
    resumen: "",
    cover_url: "",
    estado: "DISPONIBLE",
  });
  const [uploadingCover, setUploadingCover] = useState(false);

  // Editar
  const [edit, setEdit] = useState(null);
  const [uploadingEditCover, setUploadingEditCover] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const catNombrePorId = useMemo(() => {
    const m = new Map();
    cats.forEach((c) => m.set(String(c.id), c.nombre));
    return m;
  }, [cats]);

  const cargar = async () => {
    setCargando(true);
    setError("");
    setOk("");
    try {
      const [librosData, catsData] = await Promise.all([getLibros(), getCategorias()]);
      setItems(normalizarListado(librosData));
      setCats(normalizarListado(catsData));
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
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((b) => {
      const t = String(b.titulo ?? "").toLowerCase();
      const a = String(b.autor ?? "").toLowerCase();
      const i = String(b.isbn ?? "").toLowerCase();
      return t.includes(term) || a.includes(term) || i.includes(term);
    });
  }, [items, q]);

  const onChangeForm = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  // ===== Upload portada (Crear) =====
  const subirCoverCrear = async (file) => {
    setError("");
    setOk("");
    try {
      setUploadingCover(true);
      const data = await uploadCover(file);
      const url = data?.url || data?.path || data?.cover_url || data?.ruta || "";
      if (!url) {
        setError("El backend no devolvió la URL de la portada (url/path/cover_url).");
        return;
      }
      setForm((prev) => ({ ...prev, cover_url: url }));
      setOk("Portada subida ✅");
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setUploadingCover(false);
    }
  };

  // ===== Upload portada (Editar) =====
  const subirCoverEditar = async (file) => {
    setError("");
    setOk("");
    try {
      setUploadingEditCover(true);
      const data = await uploadCover(file);
      const url = data?.url || data?.path || data?.cover_url || data?.ruta || "";
      if (!url) {
        setError("El backend no devolvió la URL de la portada (url/path/cover_url).");
        return;
      }
      setEdit((prev) => ({ ...prev, cover_url: url }));
      setOk("Portada subida ✅");
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setUploadingEditCover(false);
    }
  };

  const onCrear = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    try {
      const payload = {
        titulo: form.titulo.trim(),
        autor: form.autor.trim(),
        isbn: form.isbn.trim(),
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
        resumen: form.resumen?.trim() || null,
        cover_url: form.cover_url?.trim() || null,
        estado: form.estado || "DISPONIBLE",
      };

      if (!payload.titulo) return setError("El título es obligatorio.");
      if (!payload.autor) return setError("El autor es obligatorio.");
      if (!payload.isbn) return setError("El ISBN es obligatorio.");
      if (!payload.categoria_id) return setError("La categoría es obligatoria.");

      await crearLibro(payload);

      setForm({
        titulo: "",
        autor: "",
        isbn: "",
        categoria_id: "",
        resumen: "",
        cover_url: "",
        estado: "DISPONIBLE",
      });

      setOk("Libro creado ✅");
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  const abrirEditar = (b) => {
    setError("");
    setOk("");
    setEdit({
      id: b.id,
      titulo: b.titulo ?? "",
      autor: b.autor ?? "",
      isbn: b.isbn ?? "",
      categoria_id: b.categoria_id ?? b.categoria?.id ?? "",
      resumen: b.resumen ?? "",
      cover_url: b.cover_url ?? "",
      estado: b.estado ?? "DISPONIBLE",
    });
  };

  const cerrarEditar = () => {
    setEdit(null);
    setSavingEdit(false);
    setUploadingEditCover(false);
  };

  const guardarEdicion = async () => {
    setError("");
    setOk("");
    setSavingEdit(true);

    try {
      const payload = {
        titulo: String(edit.titulo).trim(),
        autor: String(edit.autor).trim(),
        isbn: String(edit.isbn).trim(),
        categoria_id: edit.categoria_id ? Number(edit.categoria_id) : null,
        resumen: edit.resumen?.trim() || null,
        cover_url: edit.cover_url?.trim() || null,
        estado: edit.estado || "DISPONIBLE",
      };

      if (!payload.titulo) return setError("El título es obligatorio.");
      if (!payload.autor) return setError("El autor es obligatorio.");
      if (!payload.isbn) return setError("El ISBN es obligatorio.");
      if (!payload.categoria_id) return setError("La categoría es obligatoria.");

      await actualizarLibro(edit.id, payload);

      setOk("Libro actualizado ✅");
      cerrarEditar();
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setSavingEdit(false);
    }
  };

  const borrar = async (id) => {
    setError("");
    setOk("");
    const okConfirm = window.confirm(`¿Eliminar el libro #${id}?`);
    if (!okConfirm) return;

    try {
      await eliminarLibro(id);
      setOk("Libro eliminado ✅");
      cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  const catName = (b) => {
    const cid = b.categoria_id ?? b.categoria?.id;
    if (cid == null) return "—";
    return catNombrePorId.get(String(cid)) || `ID ${cid}`;
  };

  const previewCrear = resolveCoverUrl(form.cover_url);
  const previewEditar = resolveCoverUrl(edit?.cover_url);

  return (
    <div className="container py-4">
<div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <button className={`btn ${theme === "dark" ? "btn-outline-light" : "btn-outline-dark"} btn-sm`} onClick={() => navigate("/admin")}>
            <i className="bi bi-arrow-left" />
          </button>
          <h3 className="m-0">
            <i className="bi bi-book me-2" />
            Admin Libros
          </h3>
        </div>

        <div className="d-flex gap-2">
          <input
            className="form-control"
            style={{ maxWidth: 320 }}
            placeholder="Buscar por título/autor/ISBN…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn btn-outline-secondary" onClick={cargar} disabled={cargando}>
            <i className="bi bi-arrow-clockwise me-2" />
            Recargar
          </button>
        </div>
      </div>

      <Alerta mensaje={error} />
      <Alerta type="success" mensaje={ok} />

      <div className="row g-3">
        {/* Crear */}
        <div className="col-12 col-xl-4">
          <div className="p-4 border rounded-3 bg-body-tertiary">
            <div className="h5 mb-3">Crear libro</div>

            <form onSubmit={onCrear}>
              <label className="form-label">Título</label>
              <input className="form-control" value={form.titulo} onChange={(e) => onChangeForm("titulo", e.target.value)} />

              <label className="form-label mt-2">Autor</label>
              <input className="form-control" value={form.autor} onChange={(e) => onChangeForm("autor", e.target.value)} />

              <label className="form-label mt-2">ISBN</label>
              <input className="form-control" value={form.isbn} onChange={(e) => onChangeForm("isbn", e.target.value)} />

              <label className="form-label mt-2">Categoría</label>
              <select className="form-select" value={form.categoria_id} onChange={(e) => onChangeForm("categoria_id", e.target.value)}>
                <option value="">Selecciona...</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <label className="form-label mt-2">Estado</label>
              <select className="form-select" value={form.estado} onChange={(e) => onChangeForm("estado", e.target.value)}>
                <option value="DISPONIBLE">DISPONIBLE</option>
                <option value="PRESTADO">PRESTADO</option>
              </select>

              <label className="form-label mt-2">Portada (subir imagen)</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                disabled={uploadingCover}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) subirCoverCrear(file);
                }}
              />

              {uploadingCover && (
                <div className="small text-secondary mt-2">
                  <i className="bi bi-cloud-upload me-2" />
                  Subiendo portada...
                </div>
              )}

              {form.cover_url && (
                <div className="mt-2">
                  <img
                    src={previewCrear}
                    alt="Portada"
                    className="border rounded"
                    style={{ width: 80, height: 110, objectFit: "cover" }}
                  />
                </div>
              )}

              <label className="form-label mt-2">Resumen (opcional)</label>
              <textarea className="form-control" rows="3" value={form.resumen} onChange={(e) => onChangeForm("resumen", e.target.value)} />

              <button className="btn btn-light mt-3 w-100" type="submit" disabled={uploadingCover}>
                <i className="bi bi-plus-circle me-2" />
                Crear
              </button>
            </form>
          </div>
        </div>

        {/* Listado */}
        <div className="col-12 col-xl-8">
          <div className="p-4 border rounded-3 bg-body-tertiary">
            <div className="h5 mb-3">Listado</div>

            {cargando ? (
              <Spinner texto="Cargando..." />
            ) : (
              <div className="table-responsive">
                <table className={`table ${theme === "dark" ? "table-dark" : "table-striped"} table-hover align-middle`}>
                  <thead>
                    <tr>
                      <th style={{ width: 70 }}>ID</th>
                      <th style={{ width: 90 }}>Cover</th>
                      <th>Título</th>
                      <th style={{ width: 180 }}>Autor</th>
                      <th style={{ width: 160 }}>ISBN</th>
                      <th style={{ width: 180 }}>Categoría</th>
                      <th style={{ width: 120 }}>Estado</th>
                      <th style={{ width: 200 }} className="text-end"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((b) => {
                      const cover = resolveCoverUrl(b.cover_url);
                      return (
                        <tr key={b.id}>
                          <td className="text-secondary">{b.id}</td>
                          <td>
                            {cover ? (
                              <img src={cover} alt="cover" className="border rounded" style={{ width: 46, height: 62, objectFit: "cover" }} />
                            ) : (
                              <span className="text-secondary small">—</span>
                            )}
                          </td>
                          <td className="fw-semibold">{b.titulo}</td>
                          <td className="text-secondary">{b.autor}</td>
                          <td className="text-secondary">{b.isbn}</td>
                          <td className="text-secondary">{catName(b)}</td>
                          <td>
                            <span className={`badge ${b.estado === "DISPONIBLE" ? "text-bg-success" : "text-bg-warning"}`}>
                              {b.estado || "—"}
                            </span>
                          </td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-outline-info me-2" onClick={() => abrirEditar(b)}>
                              <i className="bi bi-pencil me-1" />
                              Editar
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => borrar(b.id)}>
                              <i className="bi bi-trash me-1" />
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filtrados.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center text-secondary py-4">
                          Sin libros
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MODAL EDITAR (FIX z-index) ===== */}
      {edit && (
        <>
          {/* Backdrop primero (debajo del modal) */}
          <div
            className="modal-backdrop show"
            style={{ zIndex: 1040 }}
            onClick={cerrarEditar}
          />

          {/* Modal encima */}
          <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            style={{ zIndex: 1050 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content bg-dark text-light border">
                <div className="modal-header">
                  <h5 className="modal-title">Editar libro #{edit.id}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={cerrarEditar} />
                </div>

                <div className="modal-body">
                  <div className="row g-2">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Título</label>
                      <input
                        className="form-control"
                        value={edit.titulo}
                        onChange={(e) => setEdit((p) => ({ ...p, titulo: e.target.value }))}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label">Autor</label>
                      <input
                        className="form-control"
                        value={edit.autor}
                        onChange={(e) => setEdit((p) => ({ ...p, autor: e.target.value }))}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">ISBN</label>
                      <input
                        className="form-control"
                        value={edit.isbn}
                        onChange={(e) => setEdit((p) => ({ ...p, isbn: e.target.value }))}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Categoría</label>
                      <select
                        className="form-select"
                        value={edit.categoria_id}
                        onChange={(e) => setEdit((p) => ({ ...p, categoria_id: e.target.value }))}
                      >
                        <option value="">Selecciona...</option>
                        {cats.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label">Estado</label>
                      <select
                        className="form-select"
                        value={edit.estado}
                        onChange={(e) => setEdit((p) => ({ ...p, estado: e.target.value }))}
                      >
                        <option value="DISPONIBLE">DISPONIBLE</option>
                        <option value="PRESTADO">PRESTADO</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Portada (subir imagen)</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        disabled={uploadingEditCover}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) subirCoverEditar(file);
                        }}
                      />

                      {uploadingEditCover && (
                        <div className="small text-secondary mt-2">
                          <i className="bi bi-cloud-upload me-2" />
                          Subiendo portada...
                        </div>
                      )}

                      {edit.cover_url && (
                        <div className="mt-2">
                          <img
                            src={previewEditar}
                            alt="Portada"
                            className="border rounded"
                            style={{ width: 80, height: 110, objectFit: "cover" }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label">Resumen (opcional)</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={edit.resumen}
                        onChange={(e) => setEdit((p) => ({ ...p, resumen: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className={`btn ${theme === "dark" ? "btn-outline-light" : "btn-outline-secondary"}`} onClick={cerrarEditar} disabled={savingEdit || uploadingEditCover}>
                    Cancelar
                  </button>
                  <button className="btn btn-light" onClick={guardarEdicion} disabled={savingEdit || uploadingEditCover}>
                    {savingEdit ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}