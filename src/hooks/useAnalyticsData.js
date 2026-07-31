import { useState, useEffect, useCallback } from 'react'
import { ManagerAnalyticsService } from '../apis/manager/ManagerAnalyticsService'
import { useAuth } from '../context/AuthContext'
import useWebSocket from './useWebSocket'

/**
 * Custom hook to manage Manager Analytics data fetching and state.
 */
export function useAnalyticsData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Default date range: last 30 days
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 30)
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }
  })

  const { user, hydrated } = useAuth()
  const branchId = user?.branchId
  const userId = user?.id

  const fetchAnalyticsData = useCallback(async () => {
    if (!hydrated || !branchId || !userId) return
    
    try {
      setLoading(true)
      setError(null)
      const summary = await ManagerAnalyticsService.getSummary(
        branchId, 
        userId, 
        dateRange.startDate, 
        dateRange.endDate
      )
      setData(summary)
    } catch (err) {
      console.error('Failed to fetch analytics data:', err)
      setError(err.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }, [branchId, userId, hydrated, dateRange])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // Subscribe to the manager-notifications topic and silently refetch analytics data
  // whenever an event fires (e.g. an order is completed, updating revenue analytics)
  const topic = branchId ? `/topic/branch/${branchId}/manager-notifications` : null
  useWebSocket(branchId, topic, () => {
    fetchAnalyticsData()
  })

  return { 
    data, 
    loading, 
    error, 
    dateRange, 
    setDateRange, 
    refetch: fetchAnalyticsData 
  }
}
