// src/apis/staff/roles.js

// Import shared authenticated fetch helper.
// authFetch automatically attaches Authorization: Bearer <token>.
import { authFetch } from "../apiHelper";

// All RBAC endpoints should now use /api/admin.
const ADMIN_API_BASE_URL = "http://localhost:8080/api/admin";

/**
 * Handles backend responses safely.
 *
 * Supports:
 * 1. Direct array response
 * 2. Direct object response
 * 3. Wrapped response like { success, message, data }
 */
async function handleResponse(response, fallbackErrorMessage) {
  const contentType = response.headers.get("content-type") || "";

  let responseData = null;

  // Read JSON response if backend sends JSON.
  if (contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  // If backend returns an error status, show a readable message.
  if (!response.ok) {
    const errorMessage =
      responseData?.message ||
      responseData?.error ||
      responseData ||
      fallbackErrorMessage;

    throw new Error(errorMessage);
  }

  // If backend response is wrapped with "data", return only data.
  // Otherwise return the direct response.
  return responseData?.data ?? responseData;
}

/**
 * GET /api/admin/roles
 *
 * Loads all roles.
 */
export async function getRolesAPI() {
  const response = await authFetch(`${ADMIN_API_BASE_URL}/roles`, {
    method: "GET",
  });

  return handleResponse(response, "Failed to load roles.");
}

/**
 * GET /api/admin/roles/{id}
 *
 * Loads one role by ID.
 */
export async function getRoleByIdAPI(id) {
  const response = await authFetch(`${ADMIN_API_BASE_URL}/roles/${id}`, {
    method: "GET",
  });

  return handleResponse(response, "Failed to load role details.");
}

/**
 * GET /api/admin/roles/{id}/permissions
 *
 * Loads permissions assigned to one role.
 */
export async function getRolePermissionsAPI(id) {
  const response = await authFetch(
    `${ADMIN_API_BASE_URL}/roles/${id}/permissions`,
    {
      method: "GET",
    }
  );

  return handleResponse(response, "Failed to load role permissions.");
}

/**
 * GET /api/admin/privileges
 *
 * Loads all privileges in the system.
 *
 * This was previously /api/privileges,
 * but now we are changing it to /api/admin/privileges.
 */
export async function getPrivilegesAPI() {
  const response = await authFetch(`${ADMIN_API_BASE_URL}/privileges`, {
    method: "GET",
  });

  return handleResponse(response, "Failed to load privileges.");
}

/**
 * PUT /api/admin/roles/{id}/permissions
 *
 * Replaces permissions assigned to a role.
 *
 * Backend expects:
 * {
 *   permissionNames: [
 *     "CREATE_STAFF",
 *     "VIEW_BRANCH"
 *   ]
 * }
 */
export async function updateRolePermissionsAPI(id, permissionNames) {
  const response = await authFetch(
    `${ADMIN_API_BASE_URL}/roles/${id}/permissions`,
    {
      method: "PUT",

      // Tell backend that request body is JSON.
      headers: {
        "Content-Type": "application/json",
      },

      // Send selected privilege names to backend.
      body: JSON.stringify({
        permissionNames,
      }),
    }
  );

  return handleResponse(response, "Failed to update role permissions.");
}

/**
 * Converts role permission response into a clean string array.
 *
 * Current backend response:
 * [
 *   "CREATE_STAFF",
 *   "VIEW_BRANCH"
 * ]
 */
export function normalizePermissionNames(permissionResponse) {
  if (!permissionResponse) {
    return [];
  }

  // Current case: backend returns direct array.
  if (Array.isArray(permissionResponse)) {
    return permissionResponse
      .map((item) => {
        // If item is already a string, return it.
        if (typeof item === "string") {
          return item;
        }

        // Future-safe support if backend later returns objects.
        return item.name || item.privilegeName || item.permissionName || "";
      })
      .filter(Boolean);
  }

  // Future-safe support for { permissions: [...] }.
  if (Array.isArray(permissionResponse.permissions)) {
    return normalizePermissionNames(permissionResponse.permissions);
  }

  // Future-safe support for { permissionNames: [...] }.
  if (Array.isArray(permissionResponse.permissionNames)) {
    return normalizePermissionNames(permissionResponse.permissionNames);
  }

  return [];
}

/**
 * Converts privileges response into frontend-friendly objects.
 *
 * Current backend response:
 * [
 *   {
 *     id: 1,
 *     name: "CREATE_STAFF",
 *     description: null
 *   }
 * ]
 */
export function normalizePrivileges(privilegeResponse) {
  if (!privilegeResponse) {
    return [];
  }

  // Support direct array or wrapped object response.
  const privilegesArray = Array.isArray(privilegeResponse)
    ? privilegeResponse
    : privilegeResponse.privileges || privilegeResponse.permissionNames || [];

  return privilegesArray
    .map((item, index) => {
      // If backend returns privilege as a string.
      if (typeof item === "string") {
        return {
          id: item,
          name: item,
          description: "",
          module: "GENERAL",
        };
      }

      // If backend returns privilege as an object.
      return {
        id: item.id ?? item.name ?? item.privilegeName ?? index,
        name: item.name || item.privilegeName || item.permissionName || "",
        description: item.description || "",
        module: item.module || item.category || "GENERAL",
      };
    })
    .filter((privilege) => privilege.name);
}