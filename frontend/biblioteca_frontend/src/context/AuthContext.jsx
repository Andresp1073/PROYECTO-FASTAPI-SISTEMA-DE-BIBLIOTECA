// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import http, { setAccessTokenMemory, clearAccessTokenMemory } from "../api/http.js";

const AuthContext = createContext(null);

function parseFastApiError(err) {
  const data = err?.response?.data;

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((e) => {
        const loc = Array.isArray(e.loc) ? e.loc.join(".") : "body";
        return `${loc}: ${e.msg}`;
      })
      .join(" | ");
  }

  return (
    data?.detail ||
    data?.message ||
    `Error ${err?.response?.status || ""}`.trim() ||
    "Ocurrió un error."
  );
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const isAuthenticated = Boolean(accessToken);

  const setToken = (token) => {
    setAccessToken(token || null);
    if (token) setAccessTokenMemory(token);
    else clearAccessTokenMemory();
  };

  const clearAuth = () => {
    setToken(null);
    setUser(null);
  };

  const loadMe = async () => {
    const res = await http.get("/auth/me");
    setUser(res.data);
    return res.data;
  };

  const refresh = async () => {
    const res = await http.post("/auth/refresh");
    const token = res.data?.access_token;
    if (!token) throw new Error("Refresh no devolvió access_token.");
    setToken(token);
    return token;
  };

  const login = async ({ email, password }) => {
    if (!email || !password) throw new Error("Email y password son obligatorios.");

    const res = await http.post("/auth/login", { email, password });
    const token = res.data?.access_token;
    if (!token) throw new Error("El backend no devolvió access_token.");

    setToken(token);
    const me = await loadMe();

    return { ...res.data, me };
  };

  const logout = async () => {
    try {
      await http.post("/auth/logout");
    } catch (_) {
      // ignore
    } finally {
      clearAuth();
    }
  };

  // Boot: intenta sesión con refresh cookie
  useEffect(() => {
    const boot = async () => {
      try {
        await refresh();
        await loadMe();
      } catch (_) {
        clearAuth();
      } finally {
        setBooting(false);
      }
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      user,
      booting,
      isAuthenticated,
      login,
      logout,
      refresh,
      loadMe,
      parseFastApiError,
    }),
    [accessToken, user, booting, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}