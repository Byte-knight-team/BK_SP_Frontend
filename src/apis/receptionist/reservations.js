import { authFetch, buildApiUrl } from '../apiHelper'

const API_BASE = buildApiUrl('/api/v1/receptionist/reservations')

// Reservations are created by customers only. The receptionist reviews the resulting
// REQUESTED bookings and confirms, rejects, seats or cancels them from here.
export const checkAvailabilityAPI = async (data) => {
  try {
    const response = await authFetch(`${API_BASE}/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to check availability' }
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

// Paged + filtered. params: { page, size, date, tableNumber, status } — all optional.
// Returns { data: { content, page, size, totalElements, totalPages }, error }
export const getAllReservationsAPI = async (params = {}) => {
  try {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v)
    })
    const query = qs.toString()
    const response = await authFetch(`${API_BASE}/all${query ? `?${query}` : ''}`)
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to fetch reservations' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// Table Management "Requested" queue — REQUESTED bookings, first-come-first-serve.
export const getRequestedReservationsAPI = async () => {
  try {
    const response = await authFetch(`${API_BASE}/requested`)
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to fetch requests' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// Table Management "Upcoming" queue — CONFIRMED + PAID bookings, soonest first.
export const getUpcomingQueueAPI = async () => {
  try {
    const response = await authFetch(`${API_BASE}/upcoming`)
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to fetch upcoming reservations' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

// Receptionist approves a REQUESTED reservation: assign tables + optional note → CONFIRMED.
export const confirmReservationAPI = async (reservationId, { tableNumbers, note }) => {
  try {
    const response = await authFetch(`${API_BASE}/${reservationId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableNumbers, note }),
    })
    const result = await response.json()
    if (!response.ok) return { error: result.message || 'Failed to confirm reservation' }
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Receptionist rejects a REQUESTED reservation with a reason.
export const rejectReservationAPI = async (reservationId, reason) => {
  try {
    const response = await authFetch(`${API_BASE}/${reservationId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    const result = await response.json()
    if (!response.ok) return { error: result.message || 'Failed to reject reservation' }
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

export const seatReservationAPI = async (reservationId, guestCount) => {
  try {
    const response = await authFetch(`${API_BASE}/${reservationId}/seat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestCount }),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed to seat reservation' }
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
