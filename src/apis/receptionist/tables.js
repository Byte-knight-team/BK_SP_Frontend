import { authFetch, buildApiUrl } from '../apiHelper'

const BASE = '/api/v1/receptionist/tables'

export const getBranchTablesAPI = async () => {
  try {
    const response = await authFetch(buildApiUrl(BASE))
    const result = await response.json()
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const occupyTableAPI = async (tableId, guestCount) => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/${tableId}/occupy`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestCount }),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to occupy table' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const clearTableAPI = async (tableId) => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/${tableId}/clear`), {
      method: 'PUT',
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to clear table' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}
