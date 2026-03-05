// src/api/prestamos.js
import http from "./http.js";

/**
 * USER: GET /prestamos/mios
 */
export const getMisPrestamos = async () => {
  const res = await http.get("/prestamos/mios");
  return res.data;
};

/**
 * ADMIN: GET /prestamos/
 */
export const getPrestamos = async () => {
  const res = await http.get("/prestamos/");
  return res.data;
};

/**
 * POST /prestamos/  (Prestar)
 * payload: según tu backend (ej: { libro_id } o { user_id, libro_id })
 */
export const crearPrestamo = async (payload) => {
  const res = await http.post("/prestamos/", payload);
  return res.data;
};

/**
 * POST /prestamos/devolver  (Devolver)
 *
 * ✅ COMPATIBLE con tu componente actual:
 * - Si llamas devolverPrestamo(123) -> manda { prestamo_id: 123 }
 * - Si llamas devolverPrestamo({ prestamo_id: 123 }) -> manda tal cual
 * - Si llamas devolverPrestamo({ id: 123 }) -> lo convertimos a { prestamo_id: 123 }
 */
export const devolverPrestamo = async (arg) => {
  let payload;

  if (typeof arg === "number" || typeof arg === "string") {
    payload = { prestamo_id: Number(arg) };
  } else if (arg && typeof arg === "object") {
    if (arg.prestamo_id != null) payload = { prestamo_id: Number(arg.prestamo_id) };
    else if (arg.id != null) payload = { prestamo_id: Number(arg.id) };
    else payload = arg; // fallback (por si tu backend espera otra forma)
  } else {
    payload = {};
  }

  const res = await http.post("/prestamos/devolver", payload);
  return res.data;
};