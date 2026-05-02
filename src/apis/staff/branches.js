import { authFetch, API_BASE_URL } from "../apiHelper";

const BASE_URL = `${API_BASE_URL}/api/admin/branches`;

// helper to safely read JSON response
const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

// helper to keep API return format consistent
const handleResponse = async (response, fallbackErrorMessage) => {
  const result = await readJson(response);

  if (!response.ok) {
    return {
      data: null,
      error: result?.message || fallbackErrorMessage,
    };
  }

  return {
    data: result?.data || result,
    error: null,
  };
};

// GET /api/admin/branches
// get all branches
export const getAllBranchesAPI = async () => {
  try {
    const response = await authFetch(BASE_URL);

    return await handleResponse(
      response,
      "Failed to fetch branches"
    );
  } catch (error) {
    console.error("Error fetching branches:", error);

    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};

// POST /api/admin/branches
// create a new branch
export const createBranchAPI = async (branchData) => {
  try {
    const response = await authFetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify(branchData),
    });

    return await handleResponse(
      response,
      "Failed to create branch"
    );
  } catch (error) {
    console.error("Error creating branch:", error);

    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};

// GET /api/admin/branches/{id}
// get one branch by id
export const getBranchByIdAPI = async (id) => {
  try {
    const response = await authFetch(`${BASE_URL}/${id}`);

    return await handleResponse(
      response,
      "Failed to fetch branch details"
    );
  } catch (error) {
    console.error("Error fetching branch details:", error);

    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};

// PUT /api/admin/branches/{id}
// update branch details
export const updateBranchAPI = async (id, branchData) => {
  try {
    const response = await authFetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(branchData),
    });

    return await handleResponse(
      response,
      "Failed to update branch"
    );
  } catch (error) {
    console.error("Error updating branch:", error);

    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};

// PATCH /api/admin/branches/{id}/activate
// activate branch
export const activateBranchAPI = async (id) => {
  try {
    const response = await authFetch(`${BASE_URL}/${id}/activate`, {
      method: "PATCH",
    });

    return await handleResponse(
      response,
      "Failed to activate branch"
    );
  } catch (error) {
    console.error("Error activating branch:", error);

    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};

// PATCH /api/admin/branches/{id}/deactivate
// deactivate branch
export const deactivateBranchAPI = async (id) => {
  try {
    const response = await authFetch(`${BASE_URL}/${id}/deactivate`, {
      method: "PATCH",
    });

    return await handleResponse(
      response,
      "Failed to deactivate branch"
    );
  } catch (error) {
    console.error("Error deactivating branch:", error);

    return {
      data: null,
      error: error.message || "Something went wrong",
    };
  }
};