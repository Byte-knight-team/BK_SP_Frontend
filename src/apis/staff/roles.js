// src/apis/staff/roles.js

// Import shared authenticated fetch helper.
// authFetch automatically attaches Authorization: Bearer <token>.
import { authFetch } from "../apiHelper";

// All RBAC endpoints use /api/admin.
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

  // If backend returns an error status, show a readable message in the UI.
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
 *
 * Backend returns:
 * - id
 * - name
 * - description
 * - permissionCount
 * - activeUserCount
 * - baseSalary
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
 * POST /api/admin/roles
 *
 * Creates a new custom role.
 *
 * Important:
 * - Only SUPER_ADMIN should call this.
 * - This only creates the role.
 * - Permissions are assigned later using the existing checkbox area.
 *
 * Example body:
 * {
 *   "name": "WAITER",
 *   "description": "Handles table service and customer assistance",
 *   "baseSalary": 45000
 * }
 */
export async function createRoleAPI(roleData) {
  const response = await authFetch(`${ADMIN_API_BASE_URL}/roles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roleData),
  });

  return handleResponse(response, "Failed to create role.");
}

/**
 * PUT /api/admin/roles/{id}
 *
 * Updates role details.
 *
 * For salary feature, we mainly use:
 * {
 *   "baseSalary": 60000
 * }
 *
 * Important:
 * Updating role baseSalary does NOT automatically update old staff salaries.
 * It is used as the default salary for newly created staff.
 */
export async function updateRoleAPI(id, roleData) {
  const response = await authFetch(`${ADMIN_API_BASE_URL}/roles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roleData),
  });

  return handleResponse(response, "Failed to update role.");
}

/**
 * DELETE /api/admin/roles/{id}
 *
 * Deletes a custom role.
 *
 * Important:
 * - Backend should block core roles.
 * - Backend should block roles already assigned to users.
 * - Frontend also blocks obvious cases before sending the request.
 */
export async function deleteRoleAPI(id) {
  const response = await authFetch(`${ADMIN_API_BASE_URL}/roles/${id}`, {
    method: "DELETE",
  });

  return handleResponse(response, "Failed to delete role.");
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
 * Your current backend accepts a direct Set<String>,
 * so this sends a direct JSON array:
 *
 * [
 *   "VIEW_ORDERS",
 *   "MANAGE_ORDERS"
 * ]
 */
export async function updateRolePermissionsAPI(id, permissionNames) {
  const response = await authFetch(
    `${ADMIN_API_BASE_URL}/roles/${id}/permissions`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(permissionNames),
    }
  );

  return handleResponse(response, "Failed to update role permissions.");
}

/**
 * Converts role permission response into a clean string array.
 */
export function normalizePermissionNames(permissionResponse) {
  if (!permissionResponse) {
    return [];
  }

  if (Array.isArray(permissionResponse)) {
    return permissionResponse
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return item.name || item.privilegeName || item.permissionName || "";
      })
      .filter(Boolean);
  }

  if (Array.isArray(permissionResponse.permissions)) {
    return normalizePermissionNames(permissionResponse.permissions);
  }

  if (Array.isArray(permissionResponse.permissionNames)) {
    return normalizePermissionNames(permissionResponse.permissionNames);
  }

  return [];
}

/**
 * Converts privileges response into frontend-friendly objects.
 */
export function normalizePrivileges(privilegeResponse) {
  if (!privilegeResponse) {
    return [];
  }

  const privilegesArray = Array.isArray(privilegeResponse)
    ? privilegeResponse
    : privilegeResponse.privileges || privilegeResponse.permissionNames || [];

  return privilegesArray
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          id: item,
          name: item,
          description: "",
          module: "GENERAL",
        };
      }

      return {
        id: item.id ?? item.name ?? item.privilegeName ?? index,
        name: item.name || item.privilegeName || item.permissionName || "",
        description: item.description || "",
        module: item.module || item.category || "GENERAL",
      };
    })
    .filter((privilege) => privilege.name);
}