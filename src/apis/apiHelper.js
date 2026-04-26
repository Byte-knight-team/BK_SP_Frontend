import { clearAuthStorage, getAuthToken } from "../utils/authToken";

/*
  Build Authorization headers using only the JWT token.
*/
export const getAuthHeaders = () => {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/*
  Wrapper for authenticated fetch calls.

  If backend returns 401, clear auth storage and send user back to staff login.
*/
export const authFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    clearAuthStorage();
    window.location.href = "/staff/login";
    throw new Error("Session expired");
  }

  return response;
};