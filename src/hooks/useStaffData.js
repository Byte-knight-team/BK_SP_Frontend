import { useState, useEffect, useCallback } from 'react'
import { ManagerStaffService } from '../apis/manager/ManagerStaffService'
import { useAuth } from '../context/AuthContext'
import useWebSocket from './useWebSocket'

export function useStaffData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, hydrated } = useAuth()
  const branchId = user?.branchId

  const fetchStaffData = useCallback(async () => {
    if (!hydrated) return

    try {
      setLoading(true)
      setError(null)
      const result = await ManagerStaffService.getStaffSummary(branchId)
      setData(result)
    } catch (err) {
      console.error('Failed to fetch staff data:', err)
      setError(err.message || 'Failed to load staff data')
    } finally {
      setLoading(false)
    }
  }, [branchId, hydrated])

  useEffect(() => {
    fetchStaffData()
  }, [fetchStaffData])

  // Subscribe to the manager-notifications topic and silently refetch staff data
  // whenever an event fires (e.g. a staff member's availability status changes)
  const topic = branchId ? `/topic/branch/${branchId}/manager-notifications` : null
  useWebSocket(branchId, topic, () => {
    fetchStaffData()
  })

  return { data, loading, error, refetch: fetchStaffData }
}
