import { useState, useEffect, useCallback } from 'react'
import { ManagerDashboardService } from '../apis/manager/ManagerDashboardService'
import { useAuth } from '../context/AuthContext'
import useWebSocket from './useWebSocket'

export function useDashboardData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, hydrated } = useAuth()
  const branchId = user?.branchId

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!hydrated) return
    
    try {
      if (!silent) setLoading(true)
      setError(null)
      const summary = await ManagerDashboardService.getSummary(branchId)
      setData(summary)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [branchId, hydrated])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Subscribe to the manager-notifications topic and silently refetch dashboard
  // data whenever any event fires (new order, completed delivery, chef request etc.)
  const topic = branchId ? `/topic/branch/${branchId}/manager-notifications` : null
  useWebSocket(branchId, topic, () => {
    fetchDashboardData(true)
  })

  return { data, loading, error, refetch: fetchDashboardData }
}
