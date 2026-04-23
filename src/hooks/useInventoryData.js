import { useState, useEffect } from 'react'
import { InventoryService } from '../services/api/InventoryService'

export function useInventoryData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const [realItems, summaryData] = await Promise.all([
        InventoryService.getAllItems(1),
        InventoryService.getSummary(1),
      ])

      setData({
        branch: summaryData.branch,
        totalInventoryValue: summaryData.totalInventoryValue,
        pendingChefDrafts: summaryData.pendingChefDrafts,
        lowStockAlerts: summaryData.lowStockAlerts,
        chefRequests: summaryData.chefRequests,
        stockItems: realItems,
      })
    } catch (err) {
      console.error('Failed to fetch inventory dashboard data:', err)
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  return { data, loading, error, refetch: fetchInventory }
}
