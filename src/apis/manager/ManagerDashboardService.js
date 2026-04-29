import { authFetch } from '../apiHelper'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const ManagerDashboardService = {
  /**
   * Fetches the dashboard summary metrics for a specific branch.
   */
  getSummary: async (branchId) => {
    const url = branchId 
      ? `${BASE_URL}/api/dashboard/manager/summary?branchId=${branchId}&_t=${Date.now()}`
      : `${BASE_URL}/api/dashboard/manager/summary?_t=${Date.now()}`
      
    const response = await authFetch(url)
    const result = await response.json()
    return result.data || result
  },
}
