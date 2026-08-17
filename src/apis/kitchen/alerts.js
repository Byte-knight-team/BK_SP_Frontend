import { authFetch, buildApiUrl } from "../apiHelper";

// 1. Create a new alert (Broadcast)
export const createAlertAPI = async (message, type) => {
  try {
    const response = await authFetch(buildApiUrl("/api/v1/kitchen/alerts"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, type }),
    });
    const result = await response.json();
    if (!response.ok) return { data: null, error: result.message };
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// 2. Get all active (unresolved) alerts
export const getActiveAlertsAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl("/api/v1/kitchen/alerts"));
    const result = await response.json();
    if (!response.ok) return { data: null, error: result.message };
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// 3. Mark an alert as solved (Resolve)
export const resolveAlertAPI = async (id) => {
  try {
    const response = await authFetch(buildApiUrl(`/api/v1/kitchen/alerts/${id}/resolve`), {
      method: "PUT",
    });
    const result = await response.json();
    if (!response.ok) return { data: null, error: result.message };
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};
