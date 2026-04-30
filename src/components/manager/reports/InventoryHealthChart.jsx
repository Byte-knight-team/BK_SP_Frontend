import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Package } from 'lucide-react'

/**
 * Bar chart showing inventory valuation by category.
 */
export default function InventoryHealthChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card flex min-h-[300px] flex-col items-center justify-center text-center">
        <p className="text-gray-400">No inventory data available</p>
      </div>
    )
  }

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899']

  return (
    <div className="card col-span-1 lg:col-span-3">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
          <Package className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Inventory Value by Category</h3>
          <p className="text-xs font-medium text-gray-400">Total asset value per inventory category</p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis 
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 500, fill: '#9ca3af' }}
              tickFormatter={(val) => `Rs. ${val.toLocaleString()}`}
            />
            <YAxis 
              dataKey="category" 
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 600, fill: '#4b5563' }}
              width={100}
            />
            <Tooltip 
              cursor={{ fill: '#fff7ed' }}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
              }}
              formatter={(val) => [`Rs. ${val.toLocaleString()}`, 'Valuation']}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
              barSize={30}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
