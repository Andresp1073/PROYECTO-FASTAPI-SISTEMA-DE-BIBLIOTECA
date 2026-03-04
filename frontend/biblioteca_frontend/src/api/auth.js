import http from "./http.js";

/**
 * AUTH
 * Nota: refresh token se maneja por cookie HttpOnly (backend).
 * El access_token se entrega en response y se guarda en memoria (AuthContext).
 */

export async function login(payload) {
  // payload: { email, password } (según tu backend)
  const { data } = await http.post("/auth/login", payload);
  return data;
}

export async function register(payload) {
  // payload: { name?, email, password, ... } (según tu backend)
  const { data } = await http.post("/auth/register", payload);
  return data;
}

export async function refresh() {
  // No requiere payload; cookie HttpOnly via withCredentials
  const { data } = await http.post("/auth/refresh", {});
  return data;
}

export async function logout() {
  // Invalida refresh cookie en backend
  const { data } = await http.post("/auth/logout", {});
  return data;
}

export async function verifyEmail(queryParams) {
  // Backend: GET /auth/verify-email?token=...
  // queryParams: { token: "..." } o cualquier query necesaria
  const { data } = await http.get("/auth/verify-email", { params: queryParams });
  return data;
}

export async function forgotPassword(payload) {
  // payload: { email }
  const { data } = await http.post("/auth/forgot-password", payload);
  return data;
}

export async function resetPassword(payload) {
  // payload: { token, new_password } (según tu backend)
  const { data } = await http.post("/auth/reset-password", payload);
  return data;
}