import StatCard from '../ui/StatCard'
import { DollarSign, ListOrdered, Truck, AlertTriangle } from 'lucide-react'

export default function StatsGrid({ data }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <StatCard
        icon={<DollarSign className="text-brand h-8 w-8" />}
        iconBg="bg-brand-light"
        label="Today's Revenue So Far"
        value={`Rs. ${Number(data.revenue).toLocaleString()}`}
      />
      <StatCard
        icon={<ListOrdered className="text-brand h-8 w-8" />}
        iconBg="bg-brand-light"
        label="Active Orders"
        value={data.activeOrders}
        subtitle="Pending & Cooking"
      />
      <StatCard
        icon={<Truck className="text-brand h-8 w-8" />}
        iconBg="bg-brand-light"
        label="Pending Deliveries"
        value={data.pendingDeliveries}
        subtitle="Orders Ready to Assign & Out for Delivery"
      />
      <StatCard
        icon={<AlertTriangle className="text-brand h-8 w-8" />}
        iconBg="bg-brand-light"
        label="Low Stock Alerts"
        value={data.lowStockAlerts}
        subtitle="Items below threshold"
      />
    </div>
  )
}
