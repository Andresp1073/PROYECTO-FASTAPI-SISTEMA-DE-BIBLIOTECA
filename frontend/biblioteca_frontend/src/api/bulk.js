// src/api/bulk.js
import http from "./http.js";

/**
 * POST /bulk/libros
 * Enviamos multipart/form-data con un archivo CSV.
 * Por defecto usa el campo "file".
 */
export const bulkLibrosCsv = async (file, fieldName = "file") => {
  const fd = new FormData();
  fd.append(fieldName, file);

  const res = await http.post("/bulk/libros", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};