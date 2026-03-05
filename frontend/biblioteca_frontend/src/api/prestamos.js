// src/api/prestamos.js
import http from "./http.js";

/**
 * ADMIN
 * GET /prestamos
 * Query params opcionales: estado, user_id, libro_id
 * Ej:
 *  getPrestamos({ estado: "PRESTADO" })
 *  getPrestamos({ estado: "DEVUELTO", user_id: 3 })
 */
export const getPrestamos = async (params = {}) => {
  const res = await http.get("/prestamos", { params });
  return res.data;
};

/**
 * USER
 * GET /prestamos/mis-prestamos
 */
export const getMisPrestamos = async () => {
  const res = await http.get("/prestamos/mis-prestamos");
  return res.data;
};

/**
 * DEVOLVER
 * PUT /prestamos/{prestamo_id}/devolver
 */
export const devolverPrestamo = async (prestamoId) => {
  const res = await http.put(`/prestamos/${prestamoId}/devolver`);
  return res.data;
};

/**
 * CREAR PRESTAMO (Usuario normal)
 * POST /prestamos
 * Normalmente: { libro_id: number }
 */
export const crearPrestamo = async (payload) => {
  const res = await http.post("/prestamos", payload);
  return res.data;
};

/**
 * CREAR PRESTAMO (Admin)
 * POST /prestamos/admin
 * Normalmente: { user_id: number, libro_id: number }
 */
export const crearPrestamoAdmin = async (payload) => {
  const res = await http.post("/prestamos/admin", payload);
  return res.data;
};