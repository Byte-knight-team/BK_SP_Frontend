import StatCard from '../ui/StatCard'
import { DollarSign, ListOrdered, Truck, AlertTriangle } from 'lucide-react'

export default function StatsGrid({ data }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<DollarSign className="text-brand h-6 w-6" />}
        iconBg="bg-brand-light"
        label="Today's Revenue So Far"
        value={`Rs. ${Number(data.revenue).toLocaleString()}`}
        subtitle="Based on completed orders"
      />
      <StatCard
        icon={<ListOrdered className="text-brand h-6 w-6" />}
        iconBg="bg-brand-light"
        label="Active Orders"
        value={data.activeOrders}
        subtitle="Pending & Cooking"
      />
      <StatCard
        icon={<Truck className="text-brand h-6 w-6" />}
        iconBg="bg-brand-light"
        label="Pending Deliveries"
        value={data.pendingDeliveries}
        subtitle="Ready to Assign & Out"
      />
      <StatCard
        icon={<AlertTriangle className="text-brand h-6 w-6" />}
        iconBg="bg-brand-light"
        label="Low Stock Alerts"
        value={data.lowStockAlerts}
        subtitle="Items below threshold"
      />
    </div>
  )
}
