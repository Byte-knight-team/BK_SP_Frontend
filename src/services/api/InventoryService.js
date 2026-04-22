import api from './axiosConfig'

export const InventoryService = {
  // Fetches all inventory items for a specific branch.
  getAllItems: async (branchId) => {
    const response = await api.get(`/inventory/items?branchId=${branchId}`)
    // Axios automatically converts JSON, so we just return .data
    return response.data
  },
}
