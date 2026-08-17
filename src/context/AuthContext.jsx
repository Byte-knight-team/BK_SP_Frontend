import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginStaff } from "../services/authService";
import {
  clearAuthStorage,
  getAuthToken,
  getCurrentUserFromToken,
  getSavedAuthUser,
  isTokenExpired,
  saveAuthToken,
  saveAuthUser,
} from "../utils/authToken";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  /*
    Restore auth state from JWT + lightweight saved user profile.

    JWT is still used for authentication/expiry.
    authUser is only used for UI display fields such as username/fullName.
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
    const savedUser = getSavedAuthUser();

    const restoredUser = {
      ...decodedUser,
      ...savedUser,
    };

    setToken(savedToken);
    setUser(restoredUser);
    setHydrated(true);
  }, []);

  /*
    Login stores JWT token and lightweight user profile from login response.

    This avoids depending on JWT subject for username, because in this system
    JWT subject is usually the email.
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

      id: data.id ?? data.userId ?? decodedUser?.id,
      username: data.username ?? decodedUser?.username,
      email: data.email ?? decodedUser?.email,
      fullName: data.fullName ?? data.name ?? decodedUser?.fullName,

      roleName: data.roleName ?? data.role ?? decodedUser?.roleName,

      branchId: data.branchId ?? decodedUser?.branchId,
      branchName: data.branchName ?? decodedUser?.branchName,

      passwordChanged:
        data.passwordChanged !== undefined
          ? data.passwordChanged
          : decodedUser?.passwordChanged,
    };

    saveAuthUser(mergedUser);

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