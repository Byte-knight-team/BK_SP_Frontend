import api from './axiosConfig'

export const InventoryService = {
  // 1.Fetches all inventory items for a specific branch.
  getAllItems: async (branchId) => {
    const response = await api.get(`/inventory/items?branchId=${branchId}`)
    // Axios automatically converts JSON, so we just return .data
    return response.data
  },

  /**
   * 2.Fetches the aggregated dashboard metrics (total value, low stock, pending requests).
   * @param {number} branchId - The ID of the branch
   * @returns Promise containing the InventorySummaryDTO
   */
  getSummary: async (branchId) => {
    const response = await api.get(`/inventory/summary?branchId=${branchId}`)
    return response.data
  },
}
