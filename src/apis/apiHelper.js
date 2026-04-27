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