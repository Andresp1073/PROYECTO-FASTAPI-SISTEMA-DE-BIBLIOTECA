// [MODIFICADO]
import http from "./http.js";

export async function getUsers() {
  const { data } = await http.get("/users/");
  return data;
}

export async function actualizarUser(id, payload) {
  const { data } = await http.put(`/users/${id}`, payload);
  return data;
}

// Reset password: Swagger exige { new_password: "..." }
export async function resetPasswordUser(id, newPassword) {
  const { data } = await http.post(`/users/${id}/reset-password`, {
    new_password: newPassword,
  });
  return data;
}