import { useState, useEffect, useCallback } from 'react'
import { ManagerDashboardService } from '../apis/manager/ManagerDashboardService'
import { useAuth } from '../context/AuthContext'

export function useDashboardData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, hydrated } = useAuth()
  const branchId = user?.branchId

  const fetchDashboardData = useCallback(async () => {
    if (!hydrated) return
    
    try {
      setLoading(true)
      setError(null)
      const summary = await ManagerDashboardService.getSummary(branchId)
      setData(summary)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [branchId, hydrated])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return { data, loading, error, refetch: fetchDashboardData }
}
