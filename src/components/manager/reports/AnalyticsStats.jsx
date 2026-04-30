import React from 'react'
import StatCard from '../ui/StatCard'
import { DollarSign, ShoppingBag, Clock, Package } from 'lucide-react'

/**
 * Grid of summary statistic cards for the reports page.
 */
export default function AnalyticsStats({ data }) {
  if (!data) return null

  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

  const stats = [
    {
      label: 'Net Revenue',
      value: formatCurrency(data.netRevenue),
      icon: <DollarSign className="h-6 w-6 text-brand" />,
      iconBg: 'bg-brand-light',
      subtitle: 'Total earnings in period'
    },
    {
      label: 'Order Volume',
      value: data.orderCount?.toLocaleString() || '0',
      icon: <ShoppingBag className="h-6 w-6 text-blue-600" />,
      iconBg: 'bg-blue-50',
      subtitle: 'Completed orders'
    },
    {
      label: 'Avg. Prep Time',
      value: `${data.avgPrepTimeMinutes?.toFixed(1) || '0.0'}m`,
      icon: <Clock className="h-6 w-6 text-emerald-600" />,
      iconBg: 'bg-emerald-50',
      subtitle: 'Kitchen efficiency'
    },
    {
      label: 'Inventory Value',
      value: formatCurrency(data.totalInventoryValue),
      icon: <Package className="h-6 w-6 text-amber-600" />,
      iconBg: 'bg-amber-50',
      subtitle: 'Current stock worth'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => (
        <StatCard 
          key={idx}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          iconBg={stat.iconBg}
          subtitle={stat.subtitle}
        />
      ))}
    </div>
  )
}
