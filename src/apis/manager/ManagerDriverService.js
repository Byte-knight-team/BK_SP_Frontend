import { authFetch } from '../apiHelper'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const ManagerDriverService = {
  /**
   * Fetches the driver summary metrics, dispatch orders, and status board.
   */
  getSummary: async (branchId) => {
    const url = branchId 
      ? `${BASE_URL}/api/drivers/manager/summary?branchId=${branchId}&_t=${Date.now()}`
      : `${BASE_URL}/api/drivers/manager/summary?_t=${Date.now()}`
      
    const response = await authFetch(url)
    const result = await response.json()
    return result.data || result
  },

  /**
   * Assigns a driver to a specific order.
   */
  assignDriver: async (orderId, driverId) => {
    const url = `${BASE_URL}/api/drivers/manager/assign?orderId=${orderId}&driverId=${driverId}`
    const response = await authFetch(url, {
      method: 'POST'
    })
    const result = await response.json()
    return result
  }
}
