import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Users,
  Package,
  Truck,
} from 'lucide-react'

export const managerNav = [
  { label: 'Dashboard', path: '/manager', icon: LayoutDashboard, exact: true },
  { label: 'Sales Summary', path: '/manager/orders', icon: ClipboardList },
  { label: 'Reports & Analytics', path: '/manager/reports', icon: BarChart3 },
  { label: 'Staff', path: '/manager/staff', icon: Users },
  { label: 'Inventory Management', path: '/manager/inventory', icon: Package },
  { label: 'Driver Management', path: '/manager/drivers', icon: Truck },
]
