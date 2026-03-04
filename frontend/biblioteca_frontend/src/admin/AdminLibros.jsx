// [MODIFICADO]
import { useEffect, useMemo, useState } from "react";
import http from "../api/http.js";
import { getCategorias } from "../api/categorias.js";
import { getLibros } from "../api/libros.js";
import { uploadCover } from "../api/uploads.js";
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

export default function AdminLibros() {
  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [resumen, setResumen] = useState("");

  const [categoriaId, setCategoriaId] = useState("");
  const [estado, setEstado] = useState("DISPONIBLE");

  // Cover
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [subiendoCover, setSubiendoCover] = useState(false);

  const [editandoId, setEditandoId] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const categoriaNombrePorId = useMemo(() => {
    const map = new Map();
    categorias.forEach((c) => map.set(String(c.id), c.nombre));
    return map;
  }, [categorias]);

  const cargar = async () => {
    setError("");
    setOk("");
    setCargando(true);
    try {
      const [libros, cats] = await Promise.all([getLibros(), getCategorias()]);
      setItems(normalizarListado(libros));
      setCategorias(normalizarListado(cats));
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // Preview local al seleccionar archivo
  useEffect(() => {
    if (!coverFile) {
      setCoverPreview("");
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const limpiar = () => {
    setTitulo("");
    setAutor("");
    setIsbn("");
    setResumen("");
    setCategoriaId("");
    setEstado("DISPONIBLE");

    setCoverUrl("");
    setCoverFile(null);
    setCoverPreview("");

    setEditandoId(null);
  };

  const validar = () => {
    if (!titulo.trim()) return "El título es obligatorio.";
    if (!autor.trim()) return "El autor es obligatorio.";
    if (!categoriaId) return "Selecciona una categoría.";
    return "";
  };

  const construirPayload = () => {
    return {
      titulo: titulo.trim(),
      autor: autor.trim(),
      isbn: isbn.trim() ? isbn.trim() : null,
      resumen: resumen.trim() ? resumen.trim() : null,
      cover_url: coverUrl.trim() ? coverUrl.trim() : null,
      categoria_id: Number(categoriaId),
      estado: estado || "DISPONIBLE",
    };
  };

  const onSubirCover = async () => {
    setError("");
    setOk("");

    if (!coverFile) {
      setError("Selecciona una imagen primero.");
      return;
    }

    setSubiendoCover(true);
    try {
      const url = await uploadCover(coverFile);

      if (!url) {
        setError("El backend no devolvió una URL de portada.");
        return;
      }

      setCoverUrl(url);
      setOk("Portada subida correctamente.");
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setSubiendoCover(false);
    }
  };

  const crear = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    const v = validar();
    if (v) {
      setError(v);
      return;
    }

    try {
      await http.post("/libros/", construirPayload());
      setOk("Libro creado.");
      limpiar();
      await cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  const actualizar = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    const v = validar();
    if (v) {
      setError(v);
      return;
    }

    try {
      await http.put(`/libros/${editandoId}`, construirPayload());
      setOk("Libro actualizado.");
      limpiar();
      await cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  const eliminar = async (id) => {
    setError("");
    setOk("");
    if (!window.confirm("¿Eliminar libro?")) return;

    try {
      await http.delete(`/libros/${id}`);
      setOk("Libro eliminado.");
      await cargar();
    } catch (err) {
      setError(parseFastApiError(err));
    }
  };

  const editar = (lib) => {
    setEditandoId(lib.id);

    setTitulo(lib.titulo ?? "");
    setAutor(lib.autor ?? "");
    setIsbn(lib.isbn ?? "");
    setResumen(lib.resumen ?? "");

    setCoverUrl(lib.cover_url ?? "");
    setCoverFile(null);
    setCoverPreview("");

    setCategoriaId(
      lib.categoria_id !== undefined && lib.categoria_id !== null
        ? String(lib.categoria_id)
        : ""
    );
    setEstado(lib.estado ?? "DISPONIBLE");
  };

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-4">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <h1 className="h5 mb-3">
            <i className="bi bi-book-half me-2"></i>
            {editandoId ? "Editar libro" : "Nuevo libro"}
          </h1>

          <Alerta mensaje={error} />
          <Alerta type="success" mensaje={ok} />

          <form onSubmit={editandoId ? actualizar : crear}>
            <div className="mb-3">
              <label className="form-label">Título</label>
              <input
                className="form-control"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Clean Code"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Autor</label>
              <input
                className="form-control"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="Ej: Robert C. Martin"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Categoría</label>
              <select
                className="form-select"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">Seleccione</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">ISBN (opcional)</label>
              <input
                className="form-control"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Ej: 9780132350884"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Resumen (opcional)</label>
              <textarea
                className="form-control"
                rows={3}
                value={resumen}
                onChange={(e) => setResumen(e.target.value)}
                placeholder="Ej: Buenas prácticas de código limpio"
              />
            </div>

            {/* COVER UPLOAD */}
            <div className="mb-3">
              <label className="form-label">Portada (subir imagen)</label>

              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />

              {(coverPreview || coverUrl) && (
                <div className="mt-2 d-flex align-items-center gap-3 flex-wrap">
                  <div
                    className="border rounded-3 overflow-hidden"
                    style={{ width: 84, height: 120 }}
                  >
                    <img
                      src={coverPreview || coverUrl}
                      alt="Preview portada"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>

                  <div className="small text-secondary">
                    <div className="fw-semibold text-body">Preview</div>
                    <div style={{ wordBreak: "break-all" }}>
                      {coverUrl ? (
                        <>
                          URL guardada:
                          <div>
                            <code>{coverUrl}</code>
                          </div>
                        </>
                      ) : (
                        "Aún no has subido la imagen."
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-2 d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light"
                  onClick={onSubirCover}
                  disabled={subiendoCover || !coverFile}
                >
                  {subiendoCover ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-1"></i>
                      Subir portada
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setCoverFile(null);
                    setCoverPreview("");
                    setCoverUrl("");
                  }}
                >
                  Limpiar portada
                </button>
              </div>

              <div className="form-text text-secondary">
                Se sube a <code>POST /uploads/covers</code> (ADMIN).
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="DISPONIBLE">DISPONIBLE</option>
                <option value="PRESTADO">PRESTADO</option>
                <option value="NO_DISPONIBLE">NO_DISPONIBLE</option>
              </select>
            </div>

            <button className="btn btn-light w-100" type="submit">
              {editandoId ? "Actualizar" : "Crear"}
            </button>

            {editandoId && (
              <button
                type="button"
                className="btn btn-outline-light w-100 mt-2"
                onClick={limpiar}
              >
                Cancelar
              </button>
            )}
          </form>

          <div className="mt-3 small text-secondary">
            Crear libro: <code>POST /libros/</code> • Subir portada:{" "}
            <code>POST /uploads/covers</code>
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-8">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <h2 className="h5 mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Lista de libros
            </h2>

            <button
              className="btn btn-sm btn-outline-light"
              onClick={cargar}
              disabled={cargando}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Recargar
            </button>
          </div>

          {cargando ? (
            <Spinner texto="Cargando libros..." />
          ) : items.length === 0 ? (
            <div className="text-secondary">No hay libros.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>ID</th>
                    <th>Título</th>
                    <th>Autor</th>
                    <th style={{ width: 160 }}>Categoría</th>
                    <th style={{ width: 140 }}>Estado</th>
                    <th style={{ width: 130 }}></th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((lib) => {
                    const cid =
                      lib.categoria_id !== undefined && lib.categoria_id !== null
                        ? String(lib.categoria_id)
                        : "";
                    const categoriaNombre = cid
                      ? categoriaNombrePorId.get(cid) || "-"
                      : "-";

                    return (
                      <tr key={lib.id}>
                        <td className="text-secondary">{lib.id}</td>
                        <td className="fw-semibold">{lib.titulo ?? "—"}</td>
                        <td className="text-secondary">{lib.autor ?? "—"}</td>
                        <td className="text-secondary">{categoriaNombre}</td>
                        <td>
                          <span className="badge text-bg-secondary">
                            {lib.estado ?? "—"}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-light me-2"
                            onClick={() => editar(lib)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => eliminar(lib.id)}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}