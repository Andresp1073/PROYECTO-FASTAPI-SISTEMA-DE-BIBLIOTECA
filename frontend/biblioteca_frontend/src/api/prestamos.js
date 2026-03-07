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
 * Normally: { libro_id: number }
 */
export const crearPrestamo = async (payload) => {
  const res = await http.post("/prestamos", payload);
  return res.data;
};

/**
 * CREAR PRESTAMO (Admin)
 * POST /prestamos/admin
 * Normally: { user_id: number, libro_id: number }
 */
export const crearPrestamoAdmin = async (payload) => {
  const res = await http.post("/prestamos/admin", payload);
  return res.data;
};

/**
 * BUSCAR USUARIOS (Admin)
 * GET /users/buscar?documento=xxx or ?q=xxx
 */
export const buscarUsuarios = async (params) => {
  const res = await http.get("/users/buscar", { params });
  return res.data;
};

/**
 * GET LIBROS (con filtro de estado)
 * GET /libros?estado=DISPONIBLE
 */
export const getLibrosDisponibles = async (params = {}) => {
  const res = await http.get("/libros", { params: { ...params, estado: "DISPONIBLE" }, paramsSerializer: p => {
    return new URLSearchParams(p).toString();
  }});
  return res.data;
};
