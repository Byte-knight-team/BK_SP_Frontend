import { useState, useEffect } from 'react'

// In production, replace this with real API calls
const MOCK_DRIVERS_DATA = {
  driversOnline: 27,
  available: 10,
  busy: 4,
  pendingDispatch: 3,
  dispatchOrders: [
    {
      id: 'ORD-9901',
      status: 'Ready for Pickup',
      customerName: 'Alice Freeman',
      zone: 'Downtown',
      distance: '2.4km',
    },
    {
      id: 'ORD-9902',
      status: 'Cooking...',
      customerName: 'James Whitmore',
      zone: 'Midtown',
      distance: '3.1km',
    },
    {
      id: 'ORD-9903',
      status: 'Ready for Pickup',
      customerName: 'Sarah Nguyen',
      zone: 'Uptown',
      distance: '1.8km',
    },
    {
      id: 'ORD-9904',
      status: 'Cooking...',
      customerName: 'David Patel',
      zone: 'Eastside',
      distance: '4.2km',
    },
    {
      id: 'ORD-9905',
      status: 'Ready for Pickup',
      customerName: 'Emma Clarke',
      zone: 'Westside',
      distance: '2.9km',
    },
  ],
  drivers: [
    {
      id: 1,
      name: 'Mike Chen',
      avatar: 'https://i.pravatar.cc/40?img=11',
      rating: 4.9,
      status: 'Available',
      currentTask: null,
    },
    {
      id: 2,
      name: 'Sara Ahmed',
      avatar: 'https://i.pravatar.cc/40?img=5',
      rating: 4.7,
      status: 'Delivering',
      currentTask: { orderId: 'ORD-9901', eta: '8m' },
    },
    {
      id: 3,
      name: 'Carlos Rivera',
      avatar: 'https://i.pravatar.cc/40?img=12',
      rating: 4.8,
      status: 'Delivering',
      currentTask: { orderId: 'ORD-9899', eta: '14m' },
    },
    {
      id: 4,
      name: 'Priya Sharma',
      avatar: 'https://i.pravatar.cc/40?img=16',
      rating: 4.6,
      status: 'Returning',
      currentTask: null,
    },
    {
      id: 5,
      name: 'Liam Foster',
      avatar: 'https://i.pravatar.cc/40?img=15',
      rating: 4.5,
      status: 'Available',
      currentTask: null,
    },
    {
      id: 6,
      name: 'Aisha Malik',
      avatar: 'https://i.pravatar.cc/40?img=9',
      rating: 4.9,
      status: 'Delivering',
      currentTask: { orderId: 'ORD-9903', eta: '6m' },
    },
    {
      id: 7,
      name: 'Tom Nguyen',
      avatar: 'https://i.pravatar.cc/40?img=52',
      rating: 4.3,
      status: 'Offline',
      currentTask: null,
    },
    {
      id: 8,
      name: 'Jessica Park',
      avatar: 'https://i.pravatar.cc/40?img=47',
      rating: 4.8,
      status: 'Available',
      currentTask: null,
    },
  ],
}

export function useDriversData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Swap this setTimeout for your real API fetch() call
    const timer = setTimeout(() => {
      setData(MOCK_DRIVERS_DATA)
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  return { data, loading, error }
}
