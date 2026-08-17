import { useState, useEffect, useCallback } from 'react'
import { ManagerDriverService } from '../apis/manager/ManagerDriverService'
import { useAuth } from '../context/AuthContext'
import useWebSocket from './useWebSocket'

export function useDriversData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, hydrated } = useAuth()
  const branchId = user?.branchId

  const fetchDriversData = useCallback(async (silent = false) => {
    if (!hydrated) return
    
    try {
      if (!silent) setLoading(true)
      setError(null)
      const summary = await ManagerDriverService.getSummary(branchId)
      setData(summary)
    } catch (err) {
      console.error('Failed to fetch drivers data:', err)
      setError(err.message || 'Failed to load drivers data')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [branchId, hydrated])

  useEffect(() => {
    fetchDriversData()
  }, [fetchDriversData])

  // Subscribe to the manager-notifications topic and silently refetch drivers data
  // whenever an event fires (e.g. a delivery order is completed by the kitchen)
  const topic = branchId ? `/topic/branch/${branchId}/manager-notifications` : null
  useWebSocket(branchId, topic, () => {
    fetchDriversData(true)
  })

  return { data, loading, error, refetch: fetchDriversData }
}
