// [MODIFICADO]
import axios from "axios";

export const raw = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
});

const http = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
});

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

let isRefreshing = false;
let queue = [];

function flushQueue(error, token) {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  queue = [];
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;

    if (!original || original._retry) return Promise.reject(error);

    if (status === 401) {
      // si el mismo refresh falló, logout y ya
      if (String(original.url || "").includes("/auth/refresh")) {
        onLogout();
        return Promise.reject(error);
      }

      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
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
        const r = await raw.post("/auth/refresh");
        const newToken = r?.data?.access_token || null;

        if (!newToken) throw new Error("Refresh sin access_token");

        flushQueue(null, newToken);

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      } catch (e) {
        flushQueue(e, null);
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