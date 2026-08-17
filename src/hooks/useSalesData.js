import { useState, useEffect, useCallback } from 'react'
import { ManagerSalesService } from '../apis/manager/ManagerSalesService'
import { useAuth } from '../context/AuthContext'
import useWebSocket from './useWebSocket'

export function useSalesData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, hydrated } = useAuth()
  const branchId = user?.branchId

  const fetchSalesData = useCallback(async (silent = false) => {
    if (!hydrated) return
    
    try {
      if (!silent) setLoading(true)
      setError(null)
      const summary = await ManagerSalesService.getSalesSummary(branchId)
      setData(summary)
    } catch (err) {
      console.error('Failed to fetch sales summary:', err)
      setError(err.message || 'Failed to load sales data')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [branchId, hydrated])

  useEffect(() => {
    fetchSalesData()
  }, [fetchSalesData])

  // Subscribe to the manager-notifications topic and silently refetch sales data
  // whenever an event fires (e.g. a delivery order is completed, updating revenue)
  const topic = branchId ? `/topic/branch/${branchId}/manager-notifications` : null
  useWebSocket(branchId, topic, () => {
    fetchSalesData(true)
  })

  return { data, loading, error, refetch: fetchSalesData, user }
}
