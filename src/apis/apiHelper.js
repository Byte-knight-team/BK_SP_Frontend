//function to get the stored JWT token
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// wrapper for authenticated fetch calls
export const authFetch = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  // if 401, token expired → redirect to login
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/staff/login";
    throw new Error("Session expired");
  } 
  return response;
};
