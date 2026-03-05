// [MODIFICADO]
import http, { raw } from "./http.js";

export async function login(payload) {
  const { data } = await http.post("/auth/login", payload);
  return data;
}

export async function register(payload) {
  const { data } = await http.post("/auth/register", payload);
  return data;
}

export async function refresh() {
  const { data } = await raw.post("/auth/refresh");
  return data;
}

export async function logout() {
  const { data } = await http.post("/auth/logout");
  return data;
}

export async function verifyEmail(payload) {
  const { data } = await http.post("/auth/verify-email", payload);
  return data;
}

export async function forgotPassword(payload) {
  const { data } = await http.post("/auth/request-reset-password", payload);
  return data;
}

export async function resetPassword(payload) {
  const { data } = await http.post("/auth/reset-password", payload);
  return data;
}