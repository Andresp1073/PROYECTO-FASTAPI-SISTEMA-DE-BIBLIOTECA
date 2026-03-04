import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { setAuthAccessors } from "../api/http.js";

export default function AuthBridge() {
  const { accessToken, setAccessToken, clearAuth } = useAuth();

  useEffect(() => {
    // Conecta Axios con el estado en memoria (React Context)
    setAuthAccessors({
      getAccessToken: () => accessToken,
      setAccessToken,
      clearAuth,
    });
  }, [accessToken, setAccessToken, clearAuth]);

  return null;
}