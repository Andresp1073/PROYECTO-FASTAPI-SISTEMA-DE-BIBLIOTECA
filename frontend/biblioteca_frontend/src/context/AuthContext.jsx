import { createContext, useContext, useEffect, useMemo, useState } from "react";
import http, {
  setAccessTokenMemory,
  clearAccessTokenMemory,
} from "../api/http.js";

const AuthContext = createContext(null);

function normalizeRole(me) {
  const raw = me?.rol ?? me?.role ?? null;
  if (!raw) return null;
  if (typeof raw !== "string") return null;
  return raw.trim().toUpperCase();
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const setAccessToken = (token) => {
    // ✅ importante: primero en memoria (inmediato)
    setAccessTokenMemory(token);
    // luego state
    setAccessTokenState(token);
  };

  const clearAuth = () => {
    clearAccessTokenMemory();
    setAccessTokenState(null);
    setUser(null);
  };

  const loadMe = async () => {
    const { data } = await http.get("/auth/me");

    const rol = normalizeRole(data);

    const normalized = {
      ...data,
      rol: rol || data?.rol || data?.role || null,
    };

    setUser(normalized);
    return normalized;
  };

  const isAuthenticated = !!accessToken;
  const isAdmin = user?.rol?.toUpperCase?.() === "ADMIN";

  // Boot: si hay cookie refresh válida => sacar access token y cargar /auth/me
  useEffect(() => {
    const boot = async () => {
      try {
        const res = await http.post("/auth/refresh");

        const token =
          res?.data?.access_token || res?.data?.accessToken || null;

        if (!token) {
          clearAuth();
          return;
        }

        setAccessToken(token);

        try {
          await loadMe();
        } catch {
          // si falla /auth/me dejamos user null
          setUser(null);
        }
      } catch {
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
      setAccessToken,
      user,
      setUser,
      loadMe,
      fetchMe: loadMe, // alias
      isAuthenticated,
      isAdmin,
      booting,
      clearAuth,
    }),
    [accessToken, user, isAuthenticated, isAdmin, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}