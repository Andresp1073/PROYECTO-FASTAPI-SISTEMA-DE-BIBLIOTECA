// [MODIFICADO]
import http from "./http.js";

export async function getMisPrestamos() {
  // Endpoint real del backend (Swagger)
  const { data } = await http.get("/prestamos/mios");
  return data;
}