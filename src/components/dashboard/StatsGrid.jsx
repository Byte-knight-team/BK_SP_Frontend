import StatCard from '../ui/StatCard'
import { DollarSign, ListOrdered, Truck, AlertTriangle } from 'lucide-react'

export default function StatsGrid({ data }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <StatCard
        icon={<DollarSign className="w-6 h-6 text-brand" />}
        iconBg="bg-brand-light"
        label="Today's Revenue"
        value={`$ ${data.revenue.toLocaleString()}`}
        badge={{ text: '+12%', className: 'bg-green-50 text-green-600' }}
      />
      <StatCard
        icon={<ListOrdered className="w-6 h-6 text-brand" />}
        iconBg="bg-brand-light"
        label="Active Orders"
        value={data.activeOrders}
        badge={{ text: 'Busy', className: 'bg-red-50 text-red-600' }}
        subtitle="Pending & Cooking"
      />
      <StatCard
        icon={<Truck className="w-6 h-6 text-brand" />}
        iconBg="bg-brand-light"
        label="Pending Deliveries"
        value={data.pendingDeliveries}
        subtitle="Waiting assignment"
      />
      <StatCard
        icon={<AlertTriangle className="w-6 h-6 text-brand" />}
        iconBg="bg-brand-light"
        label="Low Stock Alerts"
        value={data.lowStockAlerts}
        subtitle="Items below threshold"
      />
    </div>
  )
}
