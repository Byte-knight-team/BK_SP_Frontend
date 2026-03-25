import {
  LayoutDashboard,
  Users,
  BarChart2,
  Package,
  DollarSign,
  AlertTriangle,
  Truck,
} from 'lucide-react'

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Staff', path: '/staff', icon: Users },
  { label: 'Reports & Analytics', path: '/reports', icon: BarChart2 },
  { label: 'Inventory Management', path: '/inventory', icon: Package },
  { label: 'Sales Summary', path: '/sales', icon: DollarSign },
  { label: 'Stock Alerts', path: '/stock-alerts', icon: AlertTriangle },
  { label: 'Drivers', path: '/drivers', icon: Truck },
]
