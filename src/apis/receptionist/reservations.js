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
