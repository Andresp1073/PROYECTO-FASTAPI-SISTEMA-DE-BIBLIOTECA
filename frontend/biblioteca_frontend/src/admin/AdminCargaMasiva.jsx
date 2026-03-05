// [MODIFICADO]
import { useState } from "react";
import Alerta from "../components/Alerta.jsx";
import Spinner from "../components/Spinner.jsx";
import { bulkLibrosCSV } from "../api/bulk.js";

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

export default function AdminCargaMasiva() {
  const [file, setFile] = useState(null);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [resultado, setResultado] = useState(null);

  const subir = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    setResultado(null);

    if (!file) {
      setError("Selecciona un archivo CSV primero.");
      return;
    }

    const nombre = file.name.toLowerCase();
    if (!nombre.endsWith(".csv")) {
      setError("El archivo debe ser .csv");
      return;
    }

    setCargando(true);
    try {
      const data = await bulkLibrosCSV(file);
      setResultado(data);
      setOk("Carga masiva realizada.");
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <div className="p-4 border rounded-3 bg-body-tertiary">
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
            <h1 className="h5 mb-0">
              <i className="bi bi-cloud-upload me-2"></i>
              Carga masiva (CSV)
            </h1>
          </div>

          <Alerta mensaje={error} />
          <Alerta type="success" mensaje={ok} />

          <form onSubmit={subir}>
            <div className="mb-3">
              <label className="form-label">Archivo CSV</label>
              <input
                type="file"
                className="form-control"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="form-text text-secondary">
                Se envía a <code>POST /bulk/libros</code> como{" "}
                <code>multipart/form-data</code> (campo <code>file</code>).
              </div>
            </div>

            <button className="btn btn-light w-100" disabled={cargando}>
              {cargando ? "Subiendo..." : "Subir CSV"}
            </button>
          </form>

          {cargando && (
            <div className="mt-3">
              <Spinner texto="Procesando CSV..." />
            </div>
          )}

          {resultado && (
            <div className="mt-4">
              <h2 className="h6 mb-2">Resultado</h2>

              <div className="p-3 border rounded-3 bg-dark">
                <pre className="mb-0 text-light small" style={{ whiteSpace: "pre-wrap" }}>
{JSON.stringify(resultado, null, 2)}
                </pre>
              </div>

              <div className="small text-secondary mt-2">
                Si el backend devuelve campos como <code>insertados</code>,{" "}
                <code>errores</code> o <code>detalle</code>, aquí se verán.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}