import { useState, useEffect } from 'react'
import { InventoryService } from '../apis/manager/InventoryService'
import { useAuth } from '../context/AuthContext'

export function useInventoryData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { user, hydrated } = useAuth()
  const branchId = user?.branchId

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const [items, summary, logs] = await Promise.all([
        InventoryService.getAllItems(branchId),
        InventoryService.getSummary(branchId),
        InventoryService.getInventoryLogs(branchId),
      ])

      setData({
        stockItems: items,
        chefRequests: summary.chefRequests || [],
        logs: logs || [],
        summary: summary,
      })
      setError(null)
    } catch (err) {
      console.error('Failed to fetch inventory dashboard data:', err)
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hydrated) {
      if (user && branchId) {
        fetchInventory()
      } else {
        setError('Authentication required or Branch ID missing.')
        setLoading(false)
      }
    }
  }, [hydrated, user, branchId])

  const resolveChefRequest = async (requestId, status, managerNote) => {
    try {
      await InventoryService.resolveChefRequest(requestId, { status, managerNote })
      
      // Optimistically update the UI by removing the resolved request
      setData(prev => {
        if (!prev) return prev;
        
        const updatedRequests = prev.chefRequests.filter(r => r.id !== requestId);
        return {
          ...prev,
          chefRequests: updatedRequests,
          summary: {
            ...prev.summary,
            pendingChefDrafts: updatedRequests.length
          }
        }
      });

      // Still call fetchInventory to keep everything perfectly in sync with backend
      await fetchInventory() 
      return { success: true }
    } catch (err) {
      console.error('Failed to resolve chef request:', err)
      return { success: false, error: err.message }
    }
  }

  return { data, loading, error, refetch: fetchInventory, resolveChefRequest }
}
