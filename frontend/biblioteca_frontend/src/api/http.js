import axios from "axios";

// Accessors en memoria (inyectados desde React mediante AuthBridge)
let authAccessors = {
  getAccessToken: () => null,
  setAccessToken: () => {},
  clearAuth: () => {},
};

export function setAuthAccessors(accessors) {
  authAccessors = accessors;
}

const http = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true, // importante: manda cookie HttpOnly del refresh
});

// Evitar múltiples refresh en paralelo
let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  refreshQueue = [];
}

// REQUEST: agrega Bearer token desde memoria
http.interceptors.request.use(
  (config) => {
    const token = authAccessors.getAccessToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE: si 401 -> refresh -> reintentar
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si no hay respuesta o no es 401, rechaza normal
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Evitar loop infinito
    if (originalRequest._retry) {
      // Ya reintentó y volvió a fallar -> logout
      authAccessors.clearAuth?.();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Si ya se está refrescando, encola la request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(http(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/auth/refresh",
        {},
        { withCredentials: true }
      );

      const newAccessToken = res.data?.access_token;

      if (!newAccessToken) {
        throw new Error("Refresh OK pero no llegó access_token");
      }

      // Guardar token en memoria (context)
      authAccessors.setAccessToken?.(newAccessToken);

      processQueue(null, newAccessToken);

      // Reintentar la request original
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return http(originalRequest);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      authAccessors.clearAuth?.();
      window.location.href = "/login";
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default http;