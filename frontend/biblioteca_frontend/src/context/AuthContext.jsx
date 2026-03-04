// [MODIFICADO]
import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);

  const clearAuth = () => {
    setAccessToken(null);
  };

  const redirectToLogin = () => {
    window.location.href = "/login";
  };

  const value = useMemo(
    () => ({
      accessToken,
      setAccessToken,
      clearAuth,
      redirectToLogin,
      isAuthenticated: Boolean(accessToken),
    }),
    [accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}