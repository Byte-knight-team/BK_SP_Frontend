import { authFetch } from "../apiHelper";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const InventoryService = {
  // 1. Fetches all inventory items for a specific branch.
  getAllItems: async (branchId) => {
    const response = await authFetch(`${BASE_URL}/inventory/items?branchId=${branchId}`);
    const result = await response.json();
    // Assuming the backend returns the array in result.data or result
    return result.data || result;
  },

  /**
   * 2. Fetches the aggregated dashboard metrics.
   */
  getSummary: async (branchId) => {
    const response = await authFetch(`${BASE_URL}/inventory/summary?branchId=${branchId}`);
    const result = await response.json();
    return result.data || result;
  },

  // 3. Adds a new inventory item.
  addItem: async (itemData) => {
    const response = await authFetch(`${BASE_URL}/inventory/items`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    const result = await response.json();
    return result.data || result;
  },
};
