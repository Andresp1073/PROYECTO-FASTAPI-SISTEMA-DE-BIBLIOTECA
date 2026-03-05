// [MODIFICADO]
import http from "./http.js";

export async function getUsers() {
  const { data } = await http.get("/users/");
  return data;
}

export async function getUserById(id) {
  const { data } = await http.get(`/users/${id}`);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await http.put(`/users/${id}`, payload);
  return data;
}

// Según tu swagger: POST /users/{user_id}/reset-password
export async function adminResetPassword(userId, payload) {
  const { data } = await http.post(`/users/${userId}/reset-password`, payload);
  return data;
}