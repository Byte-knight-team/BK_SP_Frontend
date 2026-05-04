import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

/**
 * Custom Tooltip component for the chart.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white/90 p-4 shadow-xl backdrop-blur-sm">
        <p className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
          {label}
        </p>
        <div className="space-y-1">
          <p className="text-sm font-bold text-gray-900">
            Revenue:{' '}
            <span className="text-brand">
              Rs. {payload[0].value.toLocaleString()}
            </span>
          </p>
          <p className="text-xs font-medium text-gray-500">
            Orders: {payload[0].payload.orderCount}
          </p>
        </div>
      </div>
    )
  }
  return null
}

/**
 * Responsive area chart showing revenue trends.
 */
export default function RevenueTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card flex min-h-[400px] flex-col items-center justify-center text-center">
        <p className="text-gray-400">No trend data available for this period</p>
      </div>
    )
  }

  // Format data for Recharts (backend returns revenue and orderCount)
  const chartData = data.map((item) => ({
    name: item.label,
    revenue: item.revenue,
    orderCount: item.orderCount,
  }))

  return (
    <div className="card col-span-1 lg:col-span-2">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-light flex h-10 w-10 items-center justify-center rounded-xl">
            <TrendingUp className="text-brand h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Revenue Performance
            </h3>
            <p className="text-xs font-medium text-gray-400">
              Daily financial growth trends
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="bg-brand h-2 w-2 rounded-full" />
            <span className="text-xs font-bold text-gray-500">Revenue</span>
          </div>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            style={{ outline: 'none' }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 500, fill: '#9ca3af' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 500, fill: '#9ca3af' }}
              tickFormatter={(value) => `Rs. ${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f97316"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
