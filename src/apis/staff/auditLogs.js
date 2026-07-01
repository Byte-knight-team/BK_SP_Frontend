import { authFetch, API_BASE_URL } from "../apiHelper";

/*
  Audit Logs API helper
*/

const AUDIT_LOGS_BASE_URL = `${API_BASE_URL}/api/admin/audit-logs`;

/*
  Safely read JSON response from backend.
*/
const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();

    throw new Error(
      `Expected JSON but received another response. Check API URL. Response starts with: ${text.slice(
        0,
        80
      )}`
    );
  }

  const data = await response.json();

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
  Add a query parameter only when it has a real value.
  This avoids sending empty values like module=ALL or status=.
*/
const appendQueryParam = (queryParams, key, value) => {
  if (value === undefined || value === null) {
    return;
  }

  const cleanValue = String(value).trim();

  if (!cleanValue || cleanValue === "ALL") {
    return;
  }

  queryParams.append(key, cleanValue);
};

/*
  Get paginated audit logs.

  Backend supported filters:
  - module
  - eventType
  - status
  - branchId
  - actorUserId
  - from
  - to
  - page
  - size
*/
export const getAuditLogsAPI = async ({
  page = 0,
  size = 20,
  module = "",
  eventType = "",
  status = "",
  branchId = "",
  actorUserId = "",
  from = "",
  to = "",
} = {}) => {
  const queryParams = new URLSearchParams();

  appendQueryParam(queryParams, "module", module);
  appendQueryParam(queryParams, "eventType", eventType);
  appendQueryParam(queryParams, "status", status);
  appendQueryParam(queryParams, "branchId", branchId);
  appendQueryParam(queryParams, "actorUserId", actorUserId);
  appendQueryParam(queryParams, "from", from);
  appendQueryParam(queryParams, "to", to);

  queryParams.append("page", String(page));
  queryParams.append("size", String(size));

  const response = await authFetch(
    `${AUDIT_LOGS_BASE_URL}?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );

  return parseResponse(response);
};

/*
  Get one audit log by ID.
  Used by the Audit Log Details modal.
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