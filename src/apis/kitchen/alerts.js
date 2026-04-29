import { authFetch } from "../apiHelper";

// 1. Create a new alert
export const createAlertAPI = async (message, type) => {
  try {
    const response = await authFetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, type }),
    });
    const result = await response.json();
    if (!response.ok) return { data: null, error: result.message };
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// 2. Get all active (unresolved) alerts
export const getActiveAlertsAPI = async () => {
  try {
    const response = await authFetch(`${BASE_URL}/active`);
    const result = await response.json();
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// 3. Mark an alert as solved
export const resolveAlertAPI = async (id) => {
  try {
    const response = await authFetch(`${BASE_URL}/${id}/resolve`, {
      method: "PATCH",
    });
    const result = await response.json();
    if (!response.ok) return { data: null, error: result.message };
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};