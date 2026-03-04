import http from "./http.js";

export async function getLibros() {
  const { data } = await http.get("/libros");
  return data;
}

export async function getLibro(id) {
  const { data } = await http.get(`/libros/${id}`);
  return data;
}