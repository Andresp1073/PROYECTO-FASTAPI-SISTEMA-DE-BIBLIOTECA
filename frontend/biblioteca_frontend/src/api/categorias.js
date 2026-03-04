// [MODIFICADO]
import http from "./http.js";

export async function getCategorias() {
  const { data } = await http.get("/categorias");
  return data;
}

export async function crearCategoria(payload) {
  // payload: { nombre: string, descripcion?: string|null }
  const { data } = await http.post("/categorias", payload);
  return data;
}