import { authFetch } from '../apiHelper'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const PROCUREMENT_URL = `${BASE_URL}/api/manager/procurement`

export const ProcurementService = {
  // ── VENDORS ───────────────────────────────────────────────────────────────

  getVendors: async (branchId) => {
    const response = await authFetch(`${PROCUREMENT_URL}/vendors?branchId=${branchId}&_t=${Date.now()}`)
    const result = await response.json()
    return result.data || result
  },

  createVendor: async (vendorData) => {
    const response = await authFetch(`${PROCUREMENT_URL}/vendors`, {
      method: 'POST',
      body: JSON.stringify(vendorData),
    })
    const result = await response.json()
    return result.data || result
  },

  updateVendor: async (id, vendorData) => {
    const response = await authFetch(`${PROCUREMENT_URL}/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vendorData),
    })
    const result = await response.json()
    return result.data || result
  },

  deactivateVendor: async (id) => {
    const response = await authFetch(`${PROCUREMENT_URL}/vendors/${id}`, {
      method: 'DELETE',
    })
    const result = await response.json()
    return result.data || result
  },

  // ── PURCHASE ORDERS ───────────────────────────────────────────────────────

  getPurchaseOrders: async (branchId, status = '') => {
    let url = `${PROCUREMENT_URL}/purchase-orders?branchId=${branchId}&_t=${Date.now()}`
    if (status) {
      url += `&status=${status}`
    }
    const response = await authFetch(url)
    const result = await response.json()
    return result.data || result
  },

  getPurchaseOrderById: async (id) => {
    const response = await authFetch(`${PROCUREMENT_URL}/purchase-orders/${id}?_t=${Date.now()}`)
    const result = await response.json()
    return result.data || result
  },

  getPurchaseOrderLogs: async (branchId) => {
    const response = await authFetch(`${PROCUREMENT_URL}/branches/${branchId}/po-logs?_t=${Date.now()}`)
    const result = await response.json()
    return result.data || result
  },

  getPendingChefRequests: async (branchId) => {
    const response = await authFetch(`${PROCUREMENT_URL}/pending-chef-requests?branchId=${branchId}&_t=${Date.now()}`)
    const result = await response.json()
    return result.data || result
  },

  createPurchaseOrder: async (poData) => {
    const response = await authFetch(`${PROCUREMENT_URL}/purchase-orders`, {
      method: 'POST',
      body: JSON.stringify(poData),
    })
    const result = await response.json()
    return result.data || result
  },

  cancelPurchaseOrder: async (id) => {
    const response = await authFetch(`${PROCUREMENT_URL}/purchase-orders/${id}/cancel`, {
      method: 'PUT',
    })
    const result = await response.json()
    return result.data || result
  },

  // ── GOODS RECEIPT NOTES ───────────────────────────────────────────────────

  getGrnHistory: async (branchId) => {
    const response = await authFetch(`${PROCUREMENT_URL}/grn?branchId=${branchId}&_t=${Date.now()}`)
    const result = await response.json()
    return result.data || result
  },

  getGrnById: async (id) => {
    const response = await authFetch(`${PROCUREMENT_URL}/grn/${id}?_t=${Date.now()}`)
    const result = await response.json()
    return result.data || result
  },

  createGrn: async (grnData) => {
    const response = await authFetch(`${PROCUREMENT_URL}/grn`, {
      method: 'POST',
      body: JSON.stringify(grnData),
    })
    const result = await response.json()
    return result.data || result
  },

  // ── SUMMARY ───────────────────────────────────────────────────────────────

  getSummary: async (branchId) => {
    const response = await authFetch(`${PROCUREMENT_URL}/summary?branchId=${branchId}&_t=${Date.now()}`)
    const result = await response.json()
    return result.data || result
  },
}
