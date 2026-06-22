import { clearAuthStorage, getAuthToken } from "../utils/authToken";

export const buildApiUrl = (path) => {
  if (!path) {
    return API_BASE_URL;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

/*
  API_BASE_URL

  Backend base URL is loaded from frontend .env
*/
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/*
  Build Authorization headers using only the JWT token.

  We no longer store full authUser details in localStorage.
  Only JWT token is used.
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

  Purpose:
  - Adds JWT Authorization header automatically.
  - Handles expired/invalid session.
  - Handles inactive branch/user access problems.
*/
export const authFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  /*
    401 = not authenticated / token expired / invalid token.

    In this case:
    - clear token
    - redirect to staff login
  */
  if (response.status === 401) {
    clearAuthStorage();
    window.location.href = "/staff/login";
    throw new Error("Session expired");
  }

  /*
    403 = authenticated but not allowed.

    We only force logout for specific backend codes:
    - branch inactive
    - staff branch missing
    - user inactive
    - user not found

    Other 403 cases should stay on the page so the UI can show "No Access".
  */
  if (response.status === 403) {
    const errorData = await response
      .clone()
      .json()
      .catch(() => null);

    if (
      errorData?.code === "BRANCH_INACTIVE" ||
      errorData?.code === "STAFF_BRANCH_NOT_ASSIGNED" ||
      errorData?.code === "USER_INACTIVE" ||
      errorData?.code === "USER_NOT_FOUND"
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

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("customer_jwt");
    localStorage.removeItem("customer_user");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (response.status === 403) {
    const errorData = await response
      .clone()
      .json()
      .catch(() => null);

    if (errorData?.code === "USER_INACTIVE" || errorData?.code === "USER_NOT_FOUND") {
      localStorage.removeItem("customer_jwt");
      localStorage.removeItem("customer_user");

      const message =
        errorData?.message ||
        "Your account is no longer available. Please contact support.";

      window.location.href = `/login?error=${encodeURIComponent(message)}`;
      throw new Error(message);
    }
  }

  return response;
};