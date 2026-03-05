// [MODIFICADO]
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { logout as apiLogout } from "../api/auth.js";
import { configureAuth, raw } from "../api/http.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // por ahora no inferimos rol (se retoma luego con solución backend-friendly)
  const user = null;
  const isAuthenticated = Boolean(accessToken);
  const isAdmin = false;

  const clearAuth = () => setAccessToken(null);

  const logout = async () => {
    try {
      await apiLogout();
    } catch (_) {
      // ignore
    } finally {
      clearAuth();
    }
  };

  useEffect(() => {
    configureAuth({
      tokenGetter: () => accessToken,
      logoutHandler: () => clearAuth(),
    });
  }, [accessToken]);

  // init: intentar refresh una vez, pero 401 es normal si no hay cookie
  useEffect(() => {
    const init = async () => {
      try {
        const r = await raw.post("/auth/refresh");
        const token = r?.data?.access_token || null;
        if (token) setAccessToken(token);
      } catch (err) {
        // ✅ Si es 401, NO es error grave: solo no hay sesión previa
        // No hacemos nada.
      } finally {
        setAuthReady(true);
      }
    };

    init();
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      setAccessToken,
      user,
      isAuthenticated,
      isAdmin,
      authReady,
      clearAuth,
      logout,
    }),
    [accessToken, authReady, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      accessToken: null,
      setAccessToken: () => {},
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      authReady: true,
      clearAuth: () => {},
      logout: async () => {},
    };
  }
  return ctx;
}