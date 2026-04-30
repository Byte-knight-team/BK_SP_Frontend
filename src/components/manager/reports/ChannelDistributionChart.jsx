import React from 'react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'

/**
 * Donut chart showing distribution across different order channels.
 */
export default function ChannelDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card flex min-h-[400px] flex-col items-center justify-center text-center">
        <p className="text-gray-400">No distribution data available</p>
      </div>
    )
  }

  // Define colors based on brand system
  const COLORS = ['#f97316', '#111827', '#6b7280', '#9ca3af']

  return (
    <div className="card">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light">
          <PieIcon className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Order Channels</h3>
          <p className="text-xs font-medium text-gray-400">Distribution by order type</p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="count"
              nameKey="channel"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="h-2.5 w-2.5 rounded-full" 
                style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
              />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {item.channel}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {item.count} orders
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
