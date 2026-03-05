import http from "./http.js";

// GET /libros
export const getLibros = async () => {
  const res = await http.get("/libros");
  return res.data;
};

// GET /libros/{id}
export const getLibro = async (id) => {
  const res = await http.get(`/libros/${id}`);
  return res.data;
};

// POST /libros
export const crearLibro = async (payload) => {
  const res = await http.post("/libros", payload);
  return res.data;
};

// PUT /libros/{id}
export const actualizarLibro = async (id, payload) => {
  const res = await http.put(`/libros/${id}`, payload);
  return res.data;
};

// DELETE /libros/{id}
export const eliminarLibro = async (id) => {
  const res = await http.delete(`/libros/${id}`);
  return res.data;
};