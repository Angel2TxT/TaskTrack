import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearSession, getToken, saveSession } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .me()
      .then(setUser)
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async signIn(payload) {
        const result = await api.login(payload);
        saveSession(result.token);
        setUser(result.user);
      },
      async signUp(payload) {
        const result = await api.register(payload);
        saveSession(result.token);
        setUser(result.user);
      },
      signOut() {
        clearSession();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
