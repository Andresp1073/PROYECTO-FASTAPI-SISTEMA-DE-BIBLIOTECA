// [MODIFICADO]
import http from "./http.js";

/**
 * AUTH
 * Refresh token via cookie HttpOnly (backend).
 * Access token se entrega por response y se guarda en memoria (AuthContext).
 */

export async function login(payload) {
  // { email, password }
  const { data } = await http.post("/auth/login", payload);
  return data;
}

export async function register(payload) {
  // { nombre, email, password }
  const { data } = await http.post("/auth/register", payload);
  return data;
}

export async function refresh() {
  const { data } = await http.post("/auth/refresh", {});
  return data;
}

export async function logout() {
  const { data } = await http.post("/auth/logout", {});
  return data;
}

export async function verifyEmail(payload) {
  // Backend en tu caso NO acepta GET (405), así que usamos POST
  // payload: { token }
  const { data } = await http.post("/auth/verify-email", payload);
  return data;
}

// [MODIFICADO]

export async function forgotPassword(payload) {
  // Endpoint real del backend
  const { data } = await http.post("/auth/request-reset-password", payload);
  return data;
}

export async function resetPassword(payload) {
  // { token, new_password } (según backend)
  const { data } = await http.post("/auth/reset-password", payload);
  return data;
}