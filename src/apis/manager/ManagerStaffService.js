import { authFetch } from '../apiHelper'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const ManagerStaffService = {
  /**
   * Fetches the staff summary for a specific branch.
   */
  getStaffSummary: async (branchId) => {
    const url = branchId 
      ? `${BASE_URL}/api/v1/manager/staff/summary?branchId=${branchId}&_t=${Date.now()}`
      : `${BASE_URL}/api/v1/manager/staff/summary?_t=${Date.now()}`
      
    const response = await authFetch(url)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to fetch staff data')
    }
    
    return await response.json()
  }
}
