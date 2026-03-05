// src/api/users.js
import http from "./http.js";

// GET /users/
export const getUsers = async () => {
  const res = await http.get("/users/");
  return res.data;
};

// GET /users/{user_id}
export const getUserById = async (userId) => {
  const res = await http.get(`/users/${userId}`);
  return res.data;
};

// PUT /users/{user_id}
export const updateUser = async (userId, payload) => {
  const res = await http.put(`/users/${userId}`, payload);
  return res.data;
};

// POST /users/{user_id}/reset-password
// payload: según tu backend (ej: { new_password: "..." } o { password: "..." })
// Si tu backend no requiere body, manda {}.
export const resetUserPassword = async (userId, payload = {}) => {
  const res = await http.post(`/users/${userId}/reset-password`, payload);
  return res.data;
};