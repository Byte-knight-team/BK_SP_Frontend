import { authFetch } from '../apiHelper'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const InventoryService = {
  // 1. Fetches all inventory items for a specific branch.
  getAllItems: async (branchId) => {
    const response = await authFetch(
      `${BASE_URL}/inventory/items?branchId=${branchId}&_t=${Date.now()}`,
    )
    const result = await response.json()
    // Assuming the backend returns the array in result.data or result
    return result.data || result
  },

  /**
   * 2. Fetches the aggregated dashboard metrics.
   */
  getSummary: async (branchId) => {
    const response = await authFetch(
      `${BASE_URL}/inventory/summary?branchId=${branchId}&_t=${Date.now()}`,
    )
    const result = await response.json()
    return result.data || result
  },

  // 3. Adds a new inventory item.
  addItem: async (itemData) => {
    const response = await authFetch(`${BASE_URL}/inventory/items`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    })
    const result = await response.json()
    return result.data || result
  },

  // 4. Restock: Add quantity to an existing item
  restockItem: async (itemId, restockData) => {
    const response = await authFetch(
      `${BASE_URL}/inventory/items/${itemId}/restock`,
      {
        method: 'PATCH',
        body: JSON.stringify(restockData),
      },
    )
    const result = await response.json()
    return result.data || result
  },

  // 5. Remove: Subtract quantity from an existing item (wastage/damage)
  removeStock: async (itemId, removeData) => {
    const response = await authFetch(
      `${BASE_URL}/inventory/items/${itemId}/remove`,
      {
        method: 'PATCH',
        body: JSON.stringify(removeData),
      },
    )
    const result = await response.json()
    return result.data || result
  },

  // 6. Correction: Overwrite item details (fix incorrect data)
  correctItem: async (itemId, correctionData) => {
    const response = await authFetch(
      `${BASE_URL}/inventory/items/${itemId}/correct`,
      {
        method: 'PUT',
        body: JSON.stringify(correctionData),
      },
    )
    const result = await response.json()
    return result.data || result
  },

  // 7. Get history of inventory updates
  getInventoryLogs: async (branchId) => {
    const response = await authFetch(`${BASE_URL}/inventory/logs?branchId=${branchId}&_t=${Date.now()}`, {
      method: 'GET',
    })
    const result = await response.json()
    return result.data || result
  },

  // 8. Resolve Chef Request
  resolveChefRequest: async (requestId, resolutionData) => {
    const response = await authFetch(
      `${BASE_URL}/inventory/chef-requests/${requestId}/resolve`,
      {
        method: 'PATCH',
        body: JSON.stringify(resolutionData),
      },
    )
    const result = await response.json()
    return result.data || result
  },
}
