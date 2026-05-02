import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginStaff } from "../services/authService";
import {
  clearAuthStorage,
  getAuthToken,
  getCurrentUserFromToken,
  isTokenExpired,
  saveAuthToken,
} from "../utils/authToken";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  /*
    Restore auth state from JWT only.No longer restore user details from localStorage.authUser.
    Only the JWT token is stored.
  */
  useEffect(() => {
    const savedToken = getAuthToken();

    if (!savedToken || isTokenExpired(savedToken)) {
      clearAuthStorage();
      setToken(null);
      setUser(null);
      setHydrated(true);
      return;
    }

    const decodedUser = getCurrentUserFromToken(savedToken);

    setToken(savedToken);
    setUser(decodedUser);
    setHydrated(true);
  }, []);

  /*
    Login stores only JWT token.
  */
  const login = async (credentials) => {
    const data = await loginStaff(credentials);
    const accessToken = data.token;

    if (!accessToken) {
      throw new Error("Login succeeded but token was not returned.");
    }

    saveAuthToken(accessToken);

    const decodedUser = getCurrentUserFromToken(accessToken);

    const mergedUser = {
      ...decodedUser,

      /*
        Keep this only in React memory.
        Do not store it in localStorage.
      */
      passwordChanged:
        data.passwordChanged !== undefined
          ? data.passwordChanged
          : decodedUser?.passwordChanged,
    };

    setToken(accessToken);
    setUser(mergedUser);

    return {
      ...data,
      roleName: mergedUser.roleName,
    };
  };

  const logout = () => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      hydrated,
      isAuthenticated: Boolean(token && user),
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