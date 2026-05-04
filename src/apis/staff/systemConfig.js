// src/apis/staff/systemConfig.js

// Import the shared authenticated fetch helper.
// This helper should automatically attach the JWT token from localStorage.
import { authFetch, API_BASE_URL } from "../apiHelper";

// Base URL for all System Configuration backend endpoints.
// Keep this consistent with your other API files.
const CONFIG_BASE_URL = `${API_BASE_URL}/api/admin/config`;

/**
 * Safely handle backend responses.
 * 
 * Why this helper exists:
 * - Some backend endpoints return JSON.
 * - Some may return empty responses.
 * - If the backend sends an error, we throw a readable message.
 */
async function handleResponse(response) {
  // Read response as text first, because empty responses can break response.json().
  const text = await response.text();

  // Try to convert response text into JSON if there is content.
  const data = text ? JSON.parse(text) : null;

  // If backend response is not OK, throw an error message.
  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || "Something went wrong while processing the request."
    );
  }

  return data;
}

/**
 * Get global system configuration.
 * 
 * Backend:
 * GET /api/admin/config/global
 */
export async function getGlobalConfigAPI() {
  const response = await authFetch(`${CONFIG_BASE_URL}/global`, {
    method: "GET",
  });

  return handleResponse(response);
}

/**
 * Update global system configuration.
 * 
 * Backend:
 * PUT /api/admin/config/global
 * 
 * Note:
 * Even if the UI does not show orderCancelWindowMinutes,
 * we should preserve and send it if backend still expects it.
 */
export async function updateGlobalConfigAPI(configData) {
  const response = await authFetch(`${CONFIG_BASE_URL}/global`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(configData),
  });

  return handleResponse(response);
}

/**
 * Get branch-specific configuration.
 * 
 * Backend:
 * GET /api/admin/config/branches/{branchId}
 */
export async function getBranchConfigAPI(branchId) {
  const response = await authFetch(`${CONFIG_BASE_URL}/branches/${branchId}`, {
    method: "GET",
  });

  return handleResponse(response);
}

/**
 * Update branch-specific configuration.
 * 
 * Backend:
 * PUT /api/admin/config/branches/{branchId}
 */
export async function updateBranchConfigAPI(branchId, configData) {
  const response = await authFetch(`${CONFIG_BASE_URL}/branches/${branchId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(configData),
  });

  return handleResponse(response);
}

/**
 * Get branch operating hours.
 * 
 * Backend:
 * GET /api/admin/config/branches/{branchId}/operating-hours
 */
export async function getBranchOperatingHoursAPI(branchId) {
  const response = await authFetch(
    `${CONFIG_BASE_URL}/branches/${branchId}/operating-hours`,
    {
      method: "GET",
    }
  );

  return handleResponse(response);
}

/**
 * Update branch operating hours.
 * 
 * Backend:
 * PUT /api/admin/config/branches/{branchId}/operating-hours
 */
export async function updateBranchOperatingHoursAPI(branchId, hoursData) {
  const response = await authFetch(
    `${CONFIG_BASE_URL}/branches/${branchId}/operating-hours`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hoursData),
    }
  );

  return handleResponse(response);
}

/**
 * Get effective merged branch configuration.
 * 
 * Backend:
 * GET /api/admin/config/branches/{branchId}/effective
 */
export async function getEffectiveBranchConfigAPI(branchId) {
  const response = await authFetch(
    `${CONFIG_BASE_URL}/branches/${branchId}/effective`,
    {
      method: "GET",
    }
  );

  return handleResponse(response);
}