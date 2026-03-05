// [MODIFICADO]
import axios from "axios";

export const raw = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
});

// Cliente principal (con interceptores)
const http = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
});

// Inyección del token desde AuthContext (setter)
let getAccessToken = () => null;
let onLogout = () => {};

export function configureAuth({ tokenGetter, logoutHandler }) {
  if (typeof tokenGetter === "function") getAccessToken = tokenGetter;
  if (typeof logoutHandler === "function") onLogout = logoutHandler;
}

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Control anti-loop
let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;

    // No repetir si no hay config o ya reintentamos
    if (!original || original._retry) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;

    // Si es 401, intentamos refresh
    if (status === 401) {
      original._retry = true;

      // Si el request era refresh, no reintentar
      if (String(original.url || "").includes("/auth/refresh")) {
        onLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Encolar hasta que refresh termine
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              original.headers = original.headers || {};
              original.headers.Authorization = `Bearer ${token}`;
              resolve(http(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        // ✅ Refresh SIN interceptores
        const r = await raw.post("/auth/refresh");
        const newToken = r?.data?.access_token || r?.data?.accessToken || null;

        if (!newToken) throw new Error("Refresh no devolvió access_token");

        resolveQueue(null, newToken);

        // Reintenta original
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;

        return http(original);
      } catch (e) {
        resolveQueue(e, null);
        onLogout();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default http;