import http from "./http.js";

// GET /categorias
export const getCategorias = async () => {
  const res = await http.get("/categorias");
  return res.data;
};

// POST /categorias
export const crearCategoria = async (payload) => {
  const res = await http.post("/categorias", payload);
  return res.data;
};

// PUT /categorias/{id}
export const actualizarCategoria = async (id, payload) => {
  const res = await http.put(`/categorias/${id}`, payload);
  return res.data;
};

// DELETE /categorias/{id}
export const eliminarCategoria = async (id) => {
  const res = await http.delete(`/categorias/${id}`);
  return res.data;
};