import { useState, useEffect, useCallback } from 'react'
import { ManagerSalesService } from '../apis/manager/ManagerSalesService'
import { useAuth } from '../context/AuthContext'

export function useSalesData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, hydrated } = useAuth()
  const branchId = user?.branchId

  const fetchSalesData = useCallback(async () => {
    if (!hydrated) return
    
    try {
      setLoading(true)
      setError(null)
      const summary = await ManagerSalesService.getSalesSummary(branchId)
      setData(summary)
    } catch (err) {
      console.error('Failed to fetch sales summary:', err)
      setError(err.message || 'Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }, [branchId, hydrated])

  useEffect(() => {
    fetchSalesData()
  }, [fetchSalesData])

  return { data, loading, error, refetch: fetchSalesData, user }
}
