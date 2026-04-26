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
      const [realItems, summaryData] = await Promise.all([
        InventoryService.getAllItems(branchId),
        InventoryService.getSummary(branchId),
      ])

      setData({
        branch: summaryData.branch,
        totalInventoryValue: summaryData.totalInventoryValue,
        pendingChefDrafts: summaryData.pendingChefDrafts,
        lowStockAlerts: summaryData.lowStockAlerts,
        chefRequests: summaryData.chefRequests,
        stockItems: realItems,
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

  return { data, loading, error, refetch: fetchInventory }
}
