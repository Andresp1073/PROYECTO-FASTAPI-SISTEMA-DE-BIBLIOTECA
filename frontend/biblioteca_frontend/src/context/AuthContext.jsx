// [MODIFICADO]
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { logout as apiLogout } from "../api/auth.js";
import { configureAuth, raw } from "../api/http.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null); // { id, nombre, email, rol }
  const [authReady, setAuthReady] = useState(false);

  const isAuthenticated = Boolean(accessToken);
  const isAdmin = user?.rol === "ADMIN";

  const clearAuth = () => {
    setAccessToken(null);
    setUser(null);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (_) {
      // ignore
    } finally {
      clearAuth();
      // si estás en una ruta protegida, luego te mandará a /login
    }
  };

  // ✅ Conectar axios -> contexto
  useEffect(() => {
    configureAuth({
      tokenGetter: () => accessToken,
      logoutHandler: () => {
        // logout sin await (evita loops)
        clearAuth();
      },
    });
  }, [accessToken]);

  // ✅ Init: intentar refresh una sola vez (sin interceptores)
  useEffect(() => {
    const init = async () => {
      try {
        const r = await raw.post("/auth/refresh");
        const token = r?.data?.access_token || r?.data?.accessToken || null;
        if (token) setAccessToken(token);

        const u = r?.data?.user || r?.data?.usuario || null;
        if (u) setUser(u);
      } catch (_) {
        clearAuth();
      } finally {
        setAuthReady(true);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      setAccessToken,
      user,
      setUser,
      isAuthenticated,
      isAdmin,
      authReady,
      clearAuth,
      logout,
    }),
    [accessToken, user, authReady, isAuthenticated, isAdmin]
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
      setUser: () => {},
      isAuthenticated: false,
      isAdmin: false,
      authReady: true,
      clearAuth: () => {},
      logout: async () => {},
    };
  }
  return ctx;
}