import { useState, useEffect } from 'react'
import { InventoryService } from '../services/api/InventoryService'

export function useInventoryData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchInventory() {
      try {
        setLoading(true)

        // 1. Fetch BOTH the inventory items AND the summary metrics simultaneously!
        // We hardcode branchId = 1 for now until we build the multi-branch epic.
        const [realItems, summaryData] = await Promise.all([
          InventoryService.getAllItems(1),
          InventoryService.getSummary(1)
        ])

        // 2. Combine the summary metrics with the items array into one single state object
        setData({
          branch: summaryData.branch,
          totalInventoryValue: summaryData.totalInventoryValue,
          pendingChefDrafts: summaryData.pendingChefDrafts,
          lowStockAlerts: summaryData.lowStockAlerts,
          chefRequests: summaryData.chefRequests,
          stockItems: realItems, // Inject the items array from the first API call
        })

      } catch (err) {
        console.error('Failed to fetch inventory dashboard data:', err)
        setError(err.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [])

  return { data, loading, error }
}
