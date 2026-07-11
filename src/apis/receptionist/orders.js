import { authFetch, buildApiUrl } from '../apiHelper'

const BASE = '/api/v1/receptionist/orders'

export const getReceptionistOrdersAPI = async (status) => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}?status=${status}`))
    const result = await response.json()
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const getReceptionistOrderDetailAPI = async (orderId) => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/${orderId}`))
    const result = await response.json()
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}


export const sendToKitchenAPI = async (orderId) => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/${orderId}/send-to-kitchen`), {
      method: 'PUT',
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const holdReceptionistOrderAPI = async (orderId, holdReason) => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/${orderId}/hold`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holdReason }),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const cancelReceptionistOrderAPI = async (orderId, cancelReason) => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/${orderId}/cancel`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancelReason }),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const collectPaymentAPI = async (orderId, cashReceived) => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/${orderId}/collect-payment`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cashReceived }),
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const serveOrderAPI = async (orderId) => {
  try {
    const response = await authFetch(buildApiUrl(`${BASE}/${orderId}/serve`), {
      method: 'PUT',
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const serveOrderItemAPI = async (itemId) => {
  try {
    const response = await authFetch(buildApiUrl(`/api/v1/receptionist/orders/order-items/${itemId}/serve`), {
      method: 'PUT',
    })
    const result = await response.json()
    if (!response.ok) return { data: null, error: result.message || 'Failed' }
    return { data: result.data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}
