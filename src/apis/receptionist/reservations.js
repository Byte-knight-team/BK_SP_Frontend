import { authFetch, buildApiUrl } from '../apiHelper'

const API_BASE = buildApiUrl('/api/v1/receptionist/reservations')

export const createReservationAPI = async (data) => {
  try {
    const response = await authFetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to create reservation' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const getReservationsAPI = async () => {
  try {
    const response = await authFetch(API_BASE)
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to fetch reservations' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const getTableReservationAPI = async (tableId) => {
  try {
    const response = await authFetch(`${API_BASE}/table/${tableId}`)
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to fetch reservation' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const cancelReservationAPI = async (reservationId, reason) => {
  try {
    const response = await authFetch(`${API_BASE}/${reservationId}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    const result = await response.json()
    if (!response.ok) return { error: result.message || 'Failed to cancel reservation' }
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}
