import { useState, useEffect } from 'react'
import { ProcurementService } from '../apis/manager/ProcurementService'
import { useAuth } from '../context/AuthContext'
import useWebSocket from './useWebSocket'

export function useProcurementData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { user, hydrated } = useAuth()
  const branchId = user?.branchId

  const fetchProcurement = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const [vendors, purchaseOrders, grns, summary, pendingChefRequests, poLogs] = await Promise.all([
        ProcurementService.getVendors(branchId),
        ProcurementService.getPurchaseOrders(branchId),
        ProcurementService.getGrnHistory(branchId),
        ProcurementService.getSummary(branchId),
        ProcurementService.getPendingChefRequests(branchId),
        ProcurementService.getPurchaseOrderLogs(branchId),
      ])

      setData({
        vendors: Array.isArray(vendors) ? vendors : [],
        purchaseOrders: Array.isArray(purchaseOrders) ? purchaseOrders : [],
        grns: Array.isArray(grns) ? grns : [],
        summary: summary && typeof summary === 'object' && !Array.isArray(summary) ? summary : {},
        pendingChefRequests: Array.isArray(pendingChefRequests) ? pendingChefRequests : [],
        poLogs: Array.isArray(poLogs) ? poLogs : [],
      })
      setError(null)
    } catch (err) {
      console.error('Failed to fetch procurement dashboard data:', err)
      setError(err.message || 'Failed to fetch data')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    if (hydrated) {
      if (user && branchId) {
        fetchProcurement()
      } else {
        setError('Authentication required or Branch ID missing.')
        setLoading(false)
      }
    }
  }, [hydrated, user, branchId])

  // Optional: Subscribe to websocket events if needed for real-time updates on procurement
  const topic = branchId ? `/topic/branch/${branchId}/manager-notifications` : null
  useWebSocket(branchId, topic, () => {
    fetchProcurement(true)
  })

  return { data, loading, error, refetch: fetchProcurement }
}
