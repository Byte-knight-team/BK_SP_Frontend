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