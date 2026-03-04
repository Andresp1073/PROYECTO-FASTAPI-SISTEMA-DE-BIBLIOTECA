// [MODIFICADO]

import http from "./http.js";

export async function getPrestamos() {
  const { data } = await http.get("/prestamos/");
  return data;
}

export async function devolverPrestamo(id) {

  const { data } = await http.post("/prestamos/devolver", {
    prestamo_id: id
  });

  return data;
}

export async function getMisPrestamos() {

  const { data } = await http.get("/prestamos/mios");

  return data;
}