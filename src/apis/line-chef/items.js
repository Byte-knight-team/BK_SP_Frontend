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
