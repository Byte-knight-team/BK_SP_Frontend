import { authFetch } from "../apiHelper";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function handleApiResponse(response) {
  let body = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    return {
      data: null,
      error:
        body?.message ||
        body?.error ||
        body?.details ||
        "Something went wrong.",
    };
  }

  return {
    data: body?.data ?? body,
    error: "",
  };
}

export async function getAllCustomersAPI() {
  try {
    const response = await authFetch(`${API_BASE_URL}/api/admin/customers`);
    return await handleApiResponse(response);
  } catch {
    return {
      data: null,
      error: "Could not load customers.",
    };
  }
}

export async function getCustomerByIdAPI(customerId) {
  try {
    const response = await authFetch(
      `${API_BASE_URL}/api/admin/customers/${customerId}`
    );

    return await handleApiResponse(response);
  } catch {
    return {
      data: null,
      error: "Could not load customer details.",
    };
  }
}

export async function activateCustomerAPI(customerId) {
  try {
    const response = await authFetch(
      `${API_BASE_URL}/api/admin/customers/${customerId}/activate`,
      {
        method: "PATCH",
      }
    );

    return await handleApiResponse(response);
  } catch {
    return {
      data: null,
      error: "Could not activate customer.",
    };
  }
}

export async function deactivateCustomerAPI(customerId) {
  try {
    const response = await authFetch(
      `${API_BASE_URL}/api/admin/customers/${customerId}/deactivate`,
      {
        method: "PATCH",
      }
    );

    return await handleApiResponse(response);
  } catch {
    return {
      data: null,
      error: "Could not deactivate customer.",
    };
  }
}