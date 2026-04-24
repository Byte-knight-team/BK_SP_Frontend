import { authFetch } from "../apiHelper";

// Get all inventory items for the table
export const getAllInventoryAPI = async () => {
  try {
    const response = await authFetch("http://localhost:8080/api/v1/kitchen/inventory/all");
    const result = await response.json();

    return { data: result.data, error: null };
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return { data: null, error: error };
  }
};
