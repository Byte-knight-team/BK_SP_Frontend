import { authFetch } from '../apiHelper'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * Service for fetching Manager Reports and Analytics data.
 */
export const ManagerAnalyticsService = {
  /**
   * Fetches a comprehensive analytics summary for a specific branch and time period.
   * 
   * @param {number} branchId - The ID of the branch.
   * @param {number} userId - The ID of the current manager user.
   * @param {string} [startDate] - Optional start date (ISO YYYY-MM-DD).
   * @param {string} [endDate] - Optional end date (ISO YYYY-MM-DD).
   * @returns {Promise<Object>} The aggregated analytics summary.
   */
  getSummary: async (branchId, userId, startDate, endDate) => {
    let url = `${BASE_URL}/api/manager/analytics/summary?branchId=${branchId}&userId=${userId}&_t=${Date.now()}`
    
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    
    const response = await authFetch(url)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch analytics: ${response.status}`)
    }
    
    const result = await response.json()
    // Based on common pattern in this project, data is often wrapped in a 'data' field or returned directly
    return result.data || result
  }
}
