// src/catalogo/Categorias.jsx - Solo lectura para usuarios normales
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategorias } from "../api/categorias.js";
import { getLibros } from "../api/libros.js";
import Spinner from "../components/Spinner.jsx";
import Alerta from "../components/Alerta.jsx";

function normalizarListado(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoLibros, setCargandoLibros] = useState(false);
  const [error, setError] = useState("");
  
  const [filtro, setFiltro] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const data = await getCategorias();
      setCategorias(normalizarListado(data));
    } catch (err) {
      const data = err?.response?.data;
      if (Array.isArray(data?.detail)) {
        setError(data.detail.map((e) => `${e.msg}`).join(" | "));
      } else {
        setError(data?.detail || data?.message || "Error al cargar categorías");
      }
    } finally {
      setCargando(false);
    }
  };

  const cargarLibrosPorCategoria = async (categoriaId, categoriaNombre) => {
    setCargandoLibros(true);
    setCategoriaSeleccionada({ id: categoriaId, nombre: categoriaNombre });
    setLibros([]);
    try {
      const data = await getLibros({ categoria_id: categoriaId });
      setLibros(normalizarListado(data));
    } catch (err) {
      setError("Error al cargar libros de la categoría");
    } finally {
      setCargandoLibros(false);
    }
  };

  const volverCategorias = () => {
    setCategoriaSeleccionada(null);
    setLibros([]);
  };

  useEffect(() => {
    cargar();
  }, []);

  const categoriasFiltradas = useMemo(() => {
    const term = filtro.trim().toLowerCase();
    if (!term) return categorias;
    return categorias.filter(c => 
      c.nombre?.toLowerCase().includes(term) ||
      c.descripcion?.toLowerCase().includes(term)
    );
  }, [categorias, filtro]);

  const sorted = [...categoriasFiltradas].sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));

  // Vista de libros por categoría
  if (categoriaSeleccionada) {
    return (
      <div className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <h3 className="m-0">
            <i className="bi bi-book me-2" />
            Libros en: {categoriaSeleccionada.nombre}
          </h3>
          <button className="btn btn-outline-light" onClick={volverCategorias}>
            <i className="bi bi-arrow-left me-2" />
            Volver a Categorías
          </button>
        </div>

        <Alerta mensaje={error} />

        <div className="p-4 border rounded-3 bg-body-tertiary">
          {cargandoLibros ? (
            <Spinner texto="Cargando libros..." />
          ) : libros.length === 0 ? (
            <div className="text-center text-secondary py-4">
              No hay libros en esta categoría
            </div>
          ) : (
            <div className="row g-3">
              {libros.map((libro) => (
                <div key={libro.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="p-3 border rounded-3 bg-dark h-100 d-flex flex-column">
                    {libro.cover_url && (
                      <div className="mb-2">
                        <img 
                          src={libro.cover_url.startsWith("http") ? libro.cover_url : `http://localhost:8000${libro.cover_url}`}
                          alt={libro.titulo}
                          className="rounded"
                          style={{ width: "100%", height: 150, objectFit: "cover" }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    <div className="fw-semibold">{libro.titulo}</div>
                    <div className="text-secondary small">{libro.autor}</div>
                    <div className="mt-auto pt-2">
                      <Link to={`/libros/${libro.id}`} className="btn btn-sm btn-light w-100">
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista de categorías
  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h3 className="m-0">
          <i className="bi bi-tags me-2" />
          Categorías
        </h3>

        <button className="btn btn-outline-light" onClick={cargar} disabled={cargando}>
          <i className="bi bi-arrow-clockwise me-2" />
          Recargar
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar categorías..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <Alerta mensaje={error} />

      <div className="p-4 border rounded-3 bg-body-tertiary">
        {cargando ? (
          <Spinner texto="Cargando..." />
        ) : (
          <div className="row g-3">
            {sorted.length === 0 ? (
              <div className="col-12 text-center text-secondary py-4">
                {filtro ? "No se encontraron categorías" : "Sin categorías"}
              </div>
            ) : (
              sorted.map((c) => (
                <div key={c.id} className="col-12 col-md-6 col-lg-4">
                  <div 
                    className="p-3 border rounded-3 bg-dark h-100 cursor-pointer categoria-card"
                    onClick={() => cargarLibrosPorCategoria(c.id, c.nombre)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-tag me-2 text-primary" />
                      <span className="fw-semibold">{c.nombre}</span>
                    </div>
                    {c.descripcion && (
                      <div className="text-secondary small mt-2">
                        {c.descripcion}
                      </div>
                    )}
                    <div className="mt-2 text-primary small">
                      <i className="bi bi-arrow-right me-1" />
                      Ver libros
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
