import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, todoApi } from "../api/api.js";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // null = loading, false = guest
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user: u } = await authApi.me();
      setUser(u);
      todoApi._bearer = null; // force token refresh on next todo call
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (creds) => {
    const { user: u } = await authApi.login(creds);
    setUser(u);
    todoApi._bearer = null;
    return u;
  };

  const register = async (creds) => {
    const { user: u } = await authApi.register(creds);
    setUser(u);
    todoApi._bearer = null;
    return u;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(false);
    todoApi._bearer = null;
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
