import { useState, useEffect } from 'react'
import { InventoryService } from '../services/api/InventoryService'

const MOCK_INVENTORY = {
  branch: 'Colombo Main',
  totalInventoryValue: 5450,
  pendingChefDrafts: 3,
  lowStockAlerts: 12,
  stockItems: [],
  chefRequests: [
    {
      id: 1,
      chefName: 'Chef Adikaram',
      role: 'EXECUTIVE CHEF',
      time: '14:20',
      item: 'Pizza Flour',
      quantity: '20.0 kg',
      note: 'Running low for dinner prep. Urgent stock needed.',
      avatarColor: '#F97316',
    },
    {
      id: 2,
      chefName: 'Chef Adikaram',
      role: 'EXECUTIVE CHEF',
      time: '14:20',
      item: 'Pizza Flour',
      quantity: '20.0 kg',
      note: 'Running low for dinner prep. Urgent stock needed.',
      avatarColor: '#F97316',
    },
    {
      id: 3,
      chefName: 'Chef Adikaram',
      role: 'EXECUTIVE CHEF',
      time: '14:20',
      item: 'Pizza Flour',
      quantity: '20.0 kg',
      note: 'Running low for dinner prep. Urgent stock needed.',
      avatarColor: '#F97316',
    },
  ],
}

export function useInventoryData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    async function fetchInventory() {
      try {
        setLoading(true)

        // Fetch the real data from localhost:8080!
        const realItems = await InventoryService.getAllItems(1)
        // Mix the real stock items with the fake summary data
        setData({
          ...MOCK_INVENTORY,
          stockItems: realItems,
        })
      } catch (err) {
        console.error('Failed to fetch inventory:', err)
        setError(err.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchInventory()
  }, [])
  return { data, loading, error }
}
