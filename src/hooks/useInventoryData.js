import { useState, useEffect } from 'react'

const MOCK_INVENTORY = {
  branch: 'Colombo Main',
  totalInventoryValue: 5450,
  pendingChefDrafts: 3,
  lowStockAlerts: 12,
  stockItems: [
    {
      id: 3,
      name: 'Pasta',
      category: 'Spices',
      unitPrice: 12.5,
      unit: 'kg',
      stockLevel: 12,
      status: 'warning',
    },
    {
      id: 4,
      name: 'Fresh Vegetables',
      category: 'Beverages',
      unitPrice: 15.5,
      unit: 'kg',
      stockLevel: 25,
      status: 'warning',
    },
    {
      id: 2,
      name: 'Pizza Dough',
      category: 'Dairy',
      unitPrice: 20.5,
      unit: 'Balls',
      stockLevel: 30,
      status: 'good',
    },
    {
      id: 1,
      name: 'Beef Patty',
      category: 'Vegetables',
      unitPrice: 22.5,
      unit: 'Pcs',
      stockLevel: 45,
      status: 'good',
    },
  ],
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
      avatarColor: '#22C55E',
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
    const timer = setTimeout(() => {
      setData(MOCK_INVENTORY)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return { data, loading, error }
}
