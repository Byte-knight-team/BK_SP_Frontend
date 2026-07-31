import React from 'react'
import { DollarSign, ShoppingBag, Clock, Package } from 'lucide-react'

export default function AnalyticsStats({ data }) {
  if (!data) return null

  const formatCurrency = (val) => `Rs. ${(val || 0).toLocaleString()}`

  const stats = [
    {
      title: 'Net Revenue',
      value: formatCurrency(data.netRevenue),
      subtitle: 'Total earnings in period',
      icon: DollarSign,
      color: 'text-brand',
      bgColor: 'bg-brand-light',
    },
    {
      title: 'Order Volume',
      value: data.orderCount?.toLocaleString() || '0',
      subtitle: 'Completed orders',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Avg. Prep Time',
      value: `${data.avgPrepTimeMinutes?.toFixed(1) || '0.0'}m`,
      subtitle: 'Kitchen efficiency',
      icon: Clock,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(data.totalInventoryValue),
      subtitle: 'Current stock worth',
      icon: Package,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((card, idx) => {
        const Icon = card.icon
        return (
          <div key={idx} className="card flex items-center justify-between p-6">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">
                {card.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              <p className="mt-1 text-xs text-gray-400">{card.subtitle}</p>
            </div>
            <div className={`rounded-xl p-4 ${card.bgColor}`}>
              <Icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
