// [MODIFICADO]
import http from "./http.js";

export async function login(payload) {
  const { data } = await http.post("/auth/login", payload);
  return data; // { access_token }
}

export async function register(payload) {
  const { data } = await http.post("/auth/register", payload);
  return data;
}

export async function refresh() {
  const { data } = await http.post("/auth/refresh");
  return data; // { access_token }
}

export async function logout() {
  const { data } = await http.post("/auth/logout");
  return data;
}

export async function me() {
  const { data } = await http.get("/auth/me");
  return data;
}

export async function verifyEmail(payload) {
  // Swagger dice POST /auth/verify-email
  const { data } = await http.post("/auth/verify-email", payload);
  return data;
}

export async function requestResetPassword(payload) {
  const { data } = await http.post("/auth/request-reset-password", payload);
  return data;
}

export async function resetPassword(payload) {
  const { data } = await http.post("/auth/reset-password", payload);
  return data;
}