import { authFetch } from "../apiHelper";

const BASE_URL = "http://localhost:8080/api/admin/staff";

// Get all staff
export const getAllStaffAPI = async () => {
  try {
    const response = await authFetch(BASE_URL);
    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: result?.message || "Failed to fetch staff",
      };
    }

    return {
      data: result?.data || result,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching staff:", error);
    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};

// Create staff
export const createStaffAPI = async (staffData) => {
  try {
    const response = await authFetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify(staffData),
    });

    const result = await response.json();
    const body = result?.data || result;

    if (!response.ok) {
      return {
        data: null,
        error:
          result?.message ||
          body?.message ||
          "Failed to create staff",
      };
    }

    /*
      Defensive fallback:
      If backend accidentally returns 200 OK with only a message
      and no created staff ID, treat it as an error.
    */
    if (body?.message && !body?.id && !body?.userId) {
      return {
        data: null,
        error: body.message,
      };
    }

    return {
      data: body,
      error: null,
    };
  } catch (error) {
    console.error("Error creating staff:", error);
    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};

// Activate staff
export const activateStaffAPI = async (id) => {
  try {
    const response = await authFetch(`${BASE_URL}/${id}/activate`, {
      method: "PATCH",
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: result?.message || "Failed to activate staff",
      };
    }

    return {
      data: result?.data || result,
      error: null,
    };
  } catch (error) {
    console.error("Error activating staff:", error);
    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};

// Deactivate staff
export const deactivateStaffAPI = async (id) => {
  try {
    const response = await authFetch(`${BASE_URL}/${id}/deactivate`, {
      method: "PATCH",
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: result?.message || "Failed to deactivate staff",
      };
    }

    return {
      data: result?.data || result,
      error: null,
    };
  } catch (error) {
    console.error("Error deactivating staff:", error);
    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};

// Resend invite
export const resendStaffInviteAPI = async (id) => {
  try {
    const response = await authFetch(`${BASE_URL}/${id}/resend-invite`, {
      method: "POST",
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: result?.message || "Failed to resend invite",
      };
    }

    return {
      data: result?.data || result,
      error: null,
    };
  } catch (error) {
    console.error("Error resending invite:", error);
    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};

// Get one staff member by user ID
export const getStaffByIdAPI = async (id) => {
  try {
    const response = await authFetch(`${BASE_URL}/${id}`);
    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: result?.message || "Failed to fetch staff member",
      };
    }

    return {
      data: result?.data || result,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching staff member:", error);
    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};

// Update one staff member by user ID
export const updateStaffAPI = async (id, staffData) => {
  try {
    const response = await authFetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(staffData),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: result?.message || "Failed to update staff member",
      };
    }

    return {
      data: result?.data || result,
      error: null,
    };
  } catch (error) {
    console.error("Error updating staff member:", error);
    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};