// src/apis/staff/branches.js

import { authFetch, API_BASE_URL } from "../apiHelper";

const BASE_URL = `${API_BASE_URL}/api/admin/branches`;

/**
 * Safely reads a JSON response.
 *
 * Some endpoints may return an empty response body, so directly calling
 * response.json() could throw an error.
 */
const readJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Keeps the return structure consistent for all Branch API methods.
 *
 * Successful response:
 * {
 *   data: ...,
 *   error: null
 * }
 *
 * Failed response:
 * {
 *   data: null,
 *   error: "Readable error message"
 * }
 */
const handleResponse = async (
  response,
  fallbackErrorMessage
) => {
  const result = await readJson(response);

  if (!response.ok) {
    return {
      data: null,
      error:
        result?.message ||
        result?.error ||
        fallbackErrorMessage,
    };
  }

  return {
    data: result?.data ?? result,
    error: null,
  };
};

/**
 * Get all branches.
 *
 * Backend:
 * GET /api/admin/branches
 */
export const getAllBranchesAPI = async () => {
  try {
    const response = await authFetch(BASE_URL, {
      method: "GET",
    });

    return await handleResponse(
      response,
      "Failed to fetch branches"
    );
  } catch (error) {
    console.error(
      "Error fetching branches:",
      error
    );

    return {
      data: null,
      error:
        error?.message ||
        "Something went wrong while fetching branches",
    };
  }
};

/**
 * Create a new branch.
 *
 * The payload can contain:
 * {
 *   name,
 *   address,
 *   contactNumber,
 *   email,
 *   latitude,
 *   longitude
 * }
 *
 * Backend:
 * POST /api/admin/branches
 */
export const createBranchAPI = async (
  branchData
) => {
  try {
    const response = await authFetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(branchData),
    });

    return await handleResponse(
      response,
      "Failed to create branch"
    );
  } catch (error) {
    console.error(
      "Error creating branch:",
      error
    );

    return {
      data: null,
      error:
        error?.message ||
        "Something went wrong while creating the branch",
    };
  }
};

/**
 * Get one branch by ID.
 *
 * Backend:
 * GET /api/admin/branches/{id}
 */
export const getBranchByIdAPI = async (id) => {
  try {
    const response = await authFetch(
      `${BASE_URL}/${id}`,
      {
        method: "GET",
      }
    );

    return await handleResponse(
      response,
      "Failed to fetch branch details"
    );
  } catch (error) {
    console.error(
      "Error fetching branch details:",
      error
    );

    return {
      data: null,
      error:
        error?.message ||
        "Something went wrong while fetching branch details",
    };
  }
};

/**
 * Update an existing branch.
 *
 * The payload can contain:
 * {
 *   name,
 *   address,
 *   contactNumber,
 *   email,
 *   latitude,
 *   longitude
 * }
 *
 * Backend:
 * PUT /api/admin/branches/{id}
 */
export const updateBranchAPI = async (
  id,
  branchData
) => {
  try {
    const response = await authFetch(
      `${BASE_URL}/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(branchData),
      }
    );

    return await handleResponse(
      response,
      "Failed to update branch"
    );
  } catch (error) {
    console.error(
      "Error updating branch:",
      error
    );

    return {
      data: null,
      error:
        error?.message ||
        "Something went wrong while updating the branch",
    };
  }
};

/**
 * Activate a branch.
 *
 * Backend:
 * PATCH /api/admin/branches/{id}/activate
 */
export const activateBranchAPI = async (
  id
) => {
  try {
    const response = await authFetch(
      `${BASE_URL}/${id}/activate`,
      {
        method: "PATCH",
      }
    );

    return await handleResponse(
      response,
      "Failed to activate branch"
    );
  } catch (error) {
    console.error(
      "Error activating branch:",
      error
    );

    return {
      data: null,
      error:
        error?.message ||
        "Something went wrong while activating the branch",
    };
  }
};

/**
 * Deactivate a branch.
 *
 * The backend will reject this operation when the branch is currently
 * selected as the system delivery branch.
 *
 * Backend:
 * PATCH /api/admin/branches/{id}/deactivate
 */
export const deactivateBranchAPI = async (
  id
) => {
  try {
    const response = await authFetch(
      `${BASE_URL}/${id}/deactivate`,
      {
        method: "PATCH",
      }
    );

    return await handleResponse(
      response,
      "Failed to deactivate branch"
    );
  } catch (error) {
    console.error(
      "Error deactivating branch:",
      error
    );

    return {
      data: null,
      error:
        error?.message ||
        "Something went wrong while deactivating the branch",
    };
  }
};