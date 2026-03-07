import axios from "axios";

// Token en memoria (NO localStorage)
let accessTokenMemory = null;

export function setAccessTokenMemory(token) {
  accessTokenMemory = token;
}

export function clearAccessTokenMemory() {
  accessTokenMemory = null;
}

export function getAccessTokenMemory() {
  return accessTokenMemory;
}

const http = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // ✅ refreshtoken cookie HttpOnly
});

http.interceptors.request.use((config) => {
  const token = getAccessTokenMemory();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshPromise = null;

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err?.response?.status !== 401) return Promise.reject(err);

    // evitar loops
    if (original?._retry) return Promise.reject(err);
    original._retry = true;

    // si el 401 viene del refresh, no reintentar
    if (original?.url?.includes("/auth/refresh")) {
      return Promise.reject(err);
    }

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = http.post("/auth/refresh");
      }

      const refreshRes = await refreshPromise;

      isRefreshing = false;
      refreshPromise = null;

      const newToken =
        refreshRes?.data?.access_token || refreshRes?.data?.accessToken || null;

      if (!newToken) return Promise.reject(err);

      // ✅ guardar token en memoria para siguientes requests
      setAccessTokenMemory(newToken);

      // reintentar request original con nuevo token
      original.headers.Authorization = `Bearer ${newToken}`;
      return http(original);
    } catch (e) {
      isRefreshing = false;
      refreshPromise = null;
      return Promise.reject(e);
    }
  }
);

export default http;