import { useState, useEffect, useCallback } from 'react'
import { ManagerDriverService } from '../apis/manager/ManagerDriverService'
import { useAuth } from '../context/AuthContext'

export function useDriversData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, hydrated } = useAuth()
  const branchId = user?.branchId

  const fetchDriversData = useCallback(async () => {
    if (!hydrated) return
    
    try {
      setLoading(true)
      setError(null)
      const summary = await ManagerDriverService.getSummary(branchId)
      setData(summary)
    } catch (err) {
      console.error('Failed to fetch drivers data:', err)
      setError(err.message || 'Failed to load drivers data')
    } finally {
      setLoading(false)
    }
  }, [branchId, hydrated])

  useEffect(() => {
    fetchDriversData()
  }, [fetchDriversData])

  return { data, loading, error, refetch: fetchDriversData }
}
