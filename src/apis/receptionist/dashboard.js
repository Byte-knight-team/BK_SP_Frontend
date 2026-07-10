import { authFetch, buildApiUrl } from '../apiHelper'

export const getDashboardStatsAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl('/api/v1/receptionist/dashboard/stats'))
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to fetch stats' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const getRevenueByTypeAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl('/api/v1/receptionist/dashboard/revenue-by-type'))
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to fetch revenue' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const getOrderCountsByTypeAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl('/api/v1/receptionist/dashboard/order-counts-by-type'))
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to fetch order counts' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}
