import { useState, useEffect } from 'react'

// In production, replace this with real API calls
const MOCK_DATA = {
  revenue: 2000,
  activeOrders: 22,
  pendingDeliveries: 10,
  lowStockAlerts: 5,
  salesTarget: { current: 100, goal: 5000 },
  orderDistribution: { total: 68, dineIn: 40, online: 28 },
  recentOrders: [
    { id: 124, type: 'online', status: 'active', timer: '15:22' },
    { id: 123, type: 'dine-in', status: 'active', timer: '20:14' },
    { id: 122, type: 'dine-in', status: 'done', timer: '20:14' },
  ],
  staff: {
    kitchen: { active: 4, total: 20 },
    fleet: { active: 9, total: 20 },
  },
  fleetActiveDeliveries: 9,
}

export function useDashboardData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Swap this fetch() for your real API endpoint
    const timer = setTimeout(() => {
      setData(MOCK_DATA)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  return { data, loading, error }
}
