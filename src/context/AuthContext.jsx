import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginStaff } from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";
const USER_KEY = "authUser";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (savedToken) {
        setToken(savedToken);
      }

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Failed to restore auth state:", error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  const login = async (credentials) => {
    const data = await loginStaff(credentials);

    const { token: accessToken, tokenType, ...userData } = data;

    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        ...userData,
        tokenType: tokenType || "Bearer",
      })
    );

    setToken(accessToken);
    setUser({
      ...userData,
      tokenType: tokenType || "Bearer",
    });

    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      hydrated,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setUser,
    }),
    [user, token, hydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}