import { authFetch } from "../apiHelper";

/*
  Audit Logs API helper

  Important:
  We use the full backend base URL here because the audit page was showing
  0 records even though Postman returned data.

  Backend:
  GET http://localhost:8080/api/admin/audit-logs
  GET http://localhost:8080/api/admin/audit-logs/{id}
*/

const API_BASE_URL = "http://localhost:8080";
const AUDIT_LOGS_BASE_URL = `${API_BASE_URL}/api/admin/audit-logs`;

/*
  Dropdown options for Audit Logs filters.
*/
export const AUDIT_MODULE_OPTIONS = ["AUTH", "STAFF", "RBAC", "BRANCH", "CONFIG"];

export const AUDIT_STATUS_OPTIONS = ["SUCCESS", "FAILURE"];

export const AUDIT_EVENT_TYPE_OPTIONS = [
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "PASSWORD_CHANGED",
  "STAFF_CREATED",
  "STAFF_UPDATED",
  "STAFF_ACTIVATED",
  "STAFF_DEACTIVATED",
  "BRANCH_CREATED",
  "BRANCH_UPDATED",
  "BRANCH_ACTIVATED",
  "BRANCH_DEACTIVATED",
  "GLOBAL_CONFIG_UPDATED",
  "BRANCH_CONFIG_UPDATED",
];

/*
  Converts filter object into query string.

  Example:
  {
    module: "AUTH",
    status: "SUCCESS",
    page: 0,
    size: 20
  }

  becomes:
  ?module=AUTH&status=SUCCESS&page=0&size=20
*/
const buildQueryString = (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    // Do not send empty filters to the backend
    if (value === undefined || value === null || value === "") {
      return;
    }

    queryParams.append(key, String(value));
  });

  const queryString = queryParams.toString();

  return queryString ? `?${queryString}` : "";
};

/*
  Reads backend response safely.

  This version also catches the problem where the frontend receives HTML
  instead of JSON. That usually means the frontend called the wrong URL.
*/
const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    throw new Error(
      `Expected JSON but received another response. Check API URL. Response starts with: ${text.slice(
        0,
        80
      )}`
    );
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      data?.error ||
      "Audit log request failed. Please try again.";

    throw new Error(errorMessage);
  }

  return data;
};

/*
  Get paginated audit logs.

  Backend response shape:
  {
    content: [...],
    totalElements: 165,
    totalPages: 9,
    number: 0,
    first: true,
    last: false
  }
*/
export const getAuditLogsAPI = async (params = {}) => {
  const queryString = buildQueryString(params);

  const response = await authFetch(`${AUDIT_LOGS_BASE_URL}${queryString}`, {
    method: "GET",
  });

  return parseResponse(response);
};

/*
  Get one audit log by ID.

  Example:
  GET http://localhost:8080/api/admin/audit-logs/1
*/
export const getAuditLogByIdAPI = async (id) => {
  if (!id) {
    throw new Error("Audit log ID is required.");
  }

  const response = await authFetch(`${AUDIT_LOGS_BASE_URL}/${id}`, {
    method: "GET",
  });

  return parseResponse(response);
};