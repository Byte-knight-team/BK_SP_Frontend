import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Users,
  Package,
  Truck,
  ShoppingCart,
} from 'lucide-react'

export const managerNav = [
  { label: 'Dashboard', path: '/manager', icon: LayoutDashboard, exact: true },
  { label: 'Sales Summary', path: '/manager/sales', icon: ClipboardList },
  { label: 'Reports & Analytics', path: '/manager/reports', icon: BarChart3 },
  { label: 'Staff', path: '/manager/staff', icon: Users },
  { label: 'Inventory Management', path: '/manager/inventory', icon: Package },
  { label: 'Procurement & Vendors', path: '/manager/procurement', icon: ShoppingCart },
  { label: 'Delivery Management', path: '/manager/drivers', icon: Truck },
]
