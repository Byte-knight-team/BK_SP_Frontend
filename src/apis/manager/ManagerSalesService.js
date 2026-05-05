import { authFetch } from '../apiHelper'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const ManagerSalesService = {
  /**
   * Fetches the sales summary metrics and transaction log for a branch.
   */
  getSalesSummary: async (branchId) => {
    const url = branchId 
      ? `${BASE_URL}/api/sales/manager/summary?branchId=${branchId}&_t=${Date.now()}`
      : `${BASE_URL}/api/sales/manager/summary?_t=${Date.now()}`
      
    const response = await authFetch(url)
    const result = await response.json()
    return result.data || result
  },
}
