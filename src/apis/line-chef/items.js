import { authFetch, buildApiUrl } from '../apiHelper'

export const getMyItemsAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl('/api/v1/line-chef/my-items'))
    const result = await response.json()
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const startItemAPI = async (itemId) => {
  try {
    const response = await authFetch(
      buildApiUrl(`/api/v1/line-chef/order-items/${itemId}/start`),
      { method: 'PUT' }
    )
    const result = await response.json()
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const completeItemAPI = async (itemId) => {
  try {
    const response = await authFetch(
      buildApiUrl(`/api/v1/line-chef/order-items/${itemId}/complete`),
      { method: 'PUT' }
    )
    const result = await response.json()
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const getCookingHistoryAPI = async ({ page = 0, size = 10, date, status } = {}) => {
  try {
    const params = new URLSearchParams({ page, size })
    if (date) params.set('date', date)
    if (status && status !== 'ALL') params.set('status', status)
    const response = await authFetch(buildApiUrl(`/api/v1/line-chef/history?${params.toString()}`))
    const result = await response.json()
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const getCookingStatsAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl('/api/v1/line-chef/history/stats'))
    const result = await response.json()
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}
