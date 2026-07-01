import { authFetch, buildApiUrl } from '../apiHelper'

const API_BASE = buildApiUrl('/api/v1/receptionist/alerts')

export const getKitchenAlertsAPI = async () => {
  try {
    const response = await authFetch(API_BASE)
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to fetch alerts' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}
