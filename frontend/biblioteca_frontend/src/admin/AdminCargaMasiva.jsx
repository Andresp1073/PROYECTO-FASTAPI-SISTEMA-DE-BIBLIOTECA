// src/admin/AdminCargaMasiva.jsx
import { useMemo, useState } from "react";
import { bulkLibrosCsv } from "../api/bulk.js";
import Alerta from "../components/Alerta.jsx";
import Spinner from "../components/Spinner.jsx";

function parseFastApiError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((e) => `${Array.isArray(e.loc) ? e.loc.join(".") : "body"}: ${e.msg}`)
      .join(" | ");
  }

  const raw =
    (typeof data?.detail === "string" ? data.detail : "") ||
    (typeof data?.message === "string" ? data.message : "") ||
    (typeof data === "string" ? data : "") ||
    "";

  const hayDuplicado =
    raw.toLowerCase().includes("integrityerror") ||
    raw.toLowerCase().includes("duplicate") ||
    raw.toLowerCase().includes("unique") ||
    raw.toLowerCase().includes("isbn");

  if ((status === 500 || status === 409) && hayDuplicado) {
    return `ISBN duplicado (registro ya existe). Corrige el CSV (ISBN debe ser único) y vuelve a intentar.`;
  }

  return raw || `Error ${status || ""}`.trim() || "Ocurrió un error.";
}

// === CSV helpers (sin librerías) ===

// separa por ; o , según vea en el header
function detectDelimiter(headerLine) {
  const comma = (headerLine.match(/,/g) || []).length;
  const semi = (headerLine.match(/;/g) || []).length;
  return semi > comma ? ";" : ",";
}

// separa una línea en campos simple (soporta comillas básicas)
function splitCsvLine(line, delimiter) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // doble comilla escapada ""
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === delimiter && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function normalizeKey(k) {
  return String(k || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

// intentos comunes para columna ISBN
const ISBN_KEYS = new Set(["isbn", "isbn13", "isbn_13", "codigo_isbn", "codigoisbn"]);

async function readFileText(file) {
  return await file.text();
}

/**
 * Analiza CSV localmente y devuelve:
 * - totalRows (sin header)
 * - duplicadosPorIsbn: [{ isbn, rows: [2,5,...] }] (número de fila en CSV, contando header como 1)
 * - filasSinIsbn: [rowNumber]
 */
async function analizarCsv(file) {
  const text = await readFileText(file);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      totalRows: 0,
      duplicadosPorIsbn: [],
      filasSinIsbn: [],
    };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter).map(normalizeKey);

  // detectar índice ISBN
  let isbnIdx = -1;
  for (let i = 0; i < headers.length; i++) {
    if (ISBN_KEYS.has(headers[i])) {
      isbnIdx = i;
      break;
    }
  }

  const map = new Map(); // isbn -> [rowNumbers]
  const filasSinIsbn = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1; // header = 1
    const cols = splitCsvLine(lines[i], delimiter);

    const isbn = isbnIdx >= 0 ? String(cols[isbnIdx] || "").trim() : "";

    if (!isbn) {
      filasSinIsbn.push(rowNumber);
      continue;
    }

    const key = isbn.toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(rowNumber);
  }

  const duplicadosPorIsbn = [];
  for (const [isbnKey, rows] of map.entries()) {
    if (rows.length > 1) {
      duplicadosPorIsbn.push({ isbn: isbnKey, rows });
    }
  }

  duplicadosPorIsbn.sort((a, b) => b.rows.length - a.rows.length);

  return {
    totalRows: lines.length - 1,
    duplicadosPorIsbn,
    filasSinIsbn,
  };
}

// === Render helpers para respuesta del backend ===

function extraerReporteBackend(res) {
  // Intentamos soportar varias formas posibles de respuesta del backend
  // Ejemplos típicos:
  // { inserted: 10, failed: 2, failures:[{row:3, reason:"..."}, ...] }
  // { importados: 10, no_importados: [{row:3, error:"..."}] }
  // { ok: [...], errors: [...] }
  if (!res || typeof res !== "object") return null;

  const inserted =
    res.importados ??
    res.insertados ??
    res.inserted ??
    res.created ??
    (Array.isArray(res.ok) ? res.ok.length : undefined) ??
    (Array.isArray(res.imported) ? res.imported.length : undefined);

  const failures =
    res.no_importados ??
    res.fallidos ??
    res.failed ??
    res.failures ??
    res.errors ??
    res.errores ??
    [];

  const failedCount =
    res.cantidad_no_importados ??
    res.no_importados_count ??
    res.failed_count ??
    res.fallidos_count ??
    (Array.isArray(failures) ? failures.length : undefined);

  const total =
    res.total ??
    res.total_rows ??
    (typeof inserted === "number" && typeof failedCount === "number"
      ? inserted + failedCount
      : undefined);

  // normalizar lista de fallos a { row, isbn, reason }
  const normalizedFailures = Array.isArray(failures)
    ? failures.map((f) => ({
        row: f.row ?? f.fila ?? f.line ?? f.linea ?? f.index ?? null,
        isbn: f.isbn ?? f.codigo ?? f.value ?? f.valor ?? null,
        reason: f.reason ?? f.error ?? f.message ?? f.detalle ?? f.detail ?? "Error",
      }))
    : [];

  const okList = res.ok ?? res.importados_detalle ?? res.inserted_items ?? res.items ?? null;

  return {
    total,
    inserted: typeof inserted === "number" ? inserted : undefined,
    failed: typeof failedCount === "number" ? failedCount : normalizedFailures.length,
    failures: normalizedFailures,
    okList: Array.isArray(okList) ? okList : null,
    raw: res,
  };
}

export default function AdminCargaMasiva() {
  const [file, setFile] = useState(null);
  const [analisis, setAnalisis] = useState(null);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [resultado, setResultado] = useState(null);
  const [reporte, setReporte] = useState(null);

  const resumenLocal = useMemo(() => {
    if (!analisis) return null;
    const total = analisis.totalRows;
    const dupCount = analisis.duplicadosPorIsbn.length;
    const sinIsbn = analisis.filasSinIsbn.length;

    return { total, dupCount, sinIsbn };
  }, [analisis]);

  const onFileChange = async (f) => {
    setFile(f);
    setAnalisis(null);
    setResultado(null);
    setReporte(null);
    setError("");
    setOk("");

    if (!f) return;

    try {
      const a = await analizarCsv(f);
      setAnalisis(a);
    } catch (e) {
      setError("No se pudo leer el CSV localmente. Verifica el archivo.");
    }
  };

  const subir = async () => {
    setError("");
    setOk("");
    setResultado(null);
    setReporte(null);

    if (!file) {
      setError("Selecciona un archivo CSV.");
      return;
    }

    setCargando(true);
    try {
      const data = await bulkLibrosCsv(file, "file");
      setResultado(data);

      const rep = extraerReporteBackend(data);
      setReporte(rep);

      setOk("Carga masiva completada ✅");
    } catch (err) {
      setError(parseFastApiError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <h3 className="m-0">
          <i className="bi bi-upload me-2" />
          Admin Carga Masiva (CSV)
        </h3>
      </div>

      <Alerta mensaje={error} />
      <Alerta type="success" mensaje={ok} />

      <div className="p-4 border rounded-3 bg-body-tertiary">
        <label className="form-label">Archivo CSV</label>
        <input
          type="file"
          className="form-control"
          accept=".csv,text/csv"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          disabled={cargando}
        />

        {/* Resumen local */}
        {resumenLocal && (
          <div className="mt-3">
            <div className="h6 mb-2">Validación local (antes de subir)</div>

            <div className="row g-2">
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded bg-dark">
                  <div className="text-secondary small">Filas (sin header)</div>
                  <div className="fs-5 fw-semibold">{resumenLocal.total}</div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-3 border rounded bg-dark">
                  <div className="text-secondary small">ISBN duplicados en el CSV</div>
                  <div className="fs-5 fw-semibold">{resumenLocal.dupCount}</div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-3 border rounded bg-dark">
                  <div className="text-secondary small">Filas sin ISBN</div>
                  <div className="fs-5 fw-semibold">{resumenLocal.sinIsbn}</div>
                </div>
              </div>
            </div>

            {analisis.duplicadosPorIsbn.length > 0 && (
              <div className="mt-3">
                <div className="text-warning fw-semibold mb-2">
                  <i className="bi bi-exclamation-triangle me-2" />
                  Duplicados internos detectados (esto causará fallos)
                </div>

                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle">
                    <thead>
                      <tr>
                        <th>ISBN</th>
                        <th>Filas</th>
                        <th style={{ width: 160 }}>Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analisis.duplicadosPorIsbn.slice(0, 20).map((d) => (
                        <tr key={d.isbn}>
                          <td className="fw-semibold">{d.isbn}</td>
                          <td className="text-secondary">{d.rows.join(", ")}</td>
                          <td className="text-warning">Repetido en CSV</td>
                        </tr>
                      ))}
                      {analisis.duplicadosPorIsbn.length > 20 && (
                        <tr>
                          <td colSpan="3" className="text-secondary">
                            Mostrando 20 de {analisis.duplicadosPorIsbn.length}…
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {analisis.filasSinIsbn.length > 0 && (
              <div className="mt-2 text-secondary small">
                Filas sin ISBN (primeras 30): {analisis.filasSinIsbn.slice(0, 30).join(", ")}
                {analisis.filasSinIsbn.length > 30 ? "…" : ""}
              </div>
            )}
          </div>
        )}

        <button className="btn btn-light mt-3" onClick={subir} disabled={cargando}>
          <i className="bi bi-cloud-arrow-up me-2" />
          Subir y procesar
        </button>

        {cargando && (
          <div className="mt-3">
            <Spinner texto="Procesando CSV..." />
          </div>
        )}

        {/* Reporte backend bonito */}
        {reporte && (
          <div className="mt-4">
            <div className="h5 mb-2">Reporte del backend</div>

            <div className="row g-2">
              <div className="col-12 col-md-4">
                <div className="p-3 border rounded bg-dark">
                  <div className="text-secondary small">Total</div>
                  <div className="fs-5 fw-semibold">{reporte.total ?? "—"}</div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-3 border rounded bg-dark">
                  <div className="text-secondary small">Importados</div>
                  <div className="fs-5 fw-semibold">{reporte.inserted ?? "—"}</div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="p-3 border rounded bg-dark">
                  <div className="text-secondary small">No importados</div>
                  <div className="fs-5 fw-semibold">{reporte.failed ?? "—"}</div>
                </div>
              </div>
            </div>

            {reporte.failures?.length > 0 && (
              <div className="mt-3">
                <div className="text-warning fw-semibold mb-2">
                  <i className="bi bi-x-octagon me-2" />
                  Filas no importadas
                </div>

                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle">
                    <thead>
                      <tr>
                        <th style={{ width: 90 }}>Fila</th>
                        <th style={{ width: 200 }}>ISBN</th>
                        <th>Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.failures.map((f, idx) => (
                        <tr key={`${idx}-${f.row ?? "x"}`}>
                          <td className="text-secondary">{f.row ?? "—"}</td>
                          <td className="text-secondary">{f.isbn ?? "—"}</td>
                          <td className="text-warning">{String(f.reason || "Error")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Siempre mostramos raw por si tu backend devuelve otra forma */}
            <details className="mt-3">
              <summary className="text-secondary">Ver respuesta completa del backend</summary>
              <pre className="bg-dark text-light p-3 rounded border mt-2 mb-0" style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(reporte.raw, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Si no hay reporte, igual mostramos respuesta raw */}
        {!reporte && resultado && (
          <details className="mt-4">
            <summary className="text-secondary">Ver respuesta del backend</summary>
            <pre className="bg-dark text-light p-3 rounded border mt-2 mb-0" style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(resultado, null, 2)}
            </pre>
          </details>
        )}

        <div className="text-secondary small mt-3">
          Endpoint: <code>POST /bulk/libros</code>
          <div className="mt-1">
            Nota: si el backend devuelve solo 500 sin reporte, el frontend no puede saber exactamente qué filas fallaron
            en el servidor. Por eso hacemos validación local (duplicados/filas sin ISBN) antes de subir.
          </div>
        </div>
      </div>
    </div>
  );
}