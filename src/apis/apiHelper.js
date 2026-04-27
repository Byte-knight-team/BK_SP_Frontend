import { clearAuthStorage, getAuthToken } from "../utils/authToken";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const buildApiUrl = (path) => {
  if (!path) {
    return API_BASE_URL;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

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

  If backend returns 403 because the user's branch is inactive,
  clear auth storage and send user back to staff login.
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

  if (response.status === 403) {
    const errorData = await response
      .clone()
      .json()
      .catch(() => null);

    if (
      errorData?.code === "BRANCH_INACTIVE" ||
      errorData?.code === "STAFF_BRANCH_NOT_ASSIGNED"
    ) {
      clearAuthStorage();

      const message =
        errorData?.message ||
        "Your branch access is no longer available. Please contact the system administrator.";

      window.location.href = `/staff/login?error=${encodeURIComponent(message)}`;
      throw new Error(message);
    }
  }

  return response;
};

export const customerApiFetch = async (path, options = {}) => {
  return fetch(buildApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

export const customerAuthFetch = async (path, options = {}) => {
  const token = localStorage.getItem("customer_jwt");

  return fetch(buildApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
};