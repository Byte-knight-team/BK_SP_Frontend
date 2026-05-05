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

  //Check if the response is JSON
  if (!contentType.includes("application/json")) {
    const text = await response.text();

    //throw an error if the response is not JSON
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
  Get latest paginated audit logs.
*/
export const getAuditLogsAPI = async ({ page = 0, size = 20 } = {}) => {
  const queryParams = new URLSearchParams({
    page: String(page),
    size: String(size), 
  });

  const response = await authFetch(
    `${AUDIT_LOGS_BASE_URL}?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );

  return parseResponse(response);
};