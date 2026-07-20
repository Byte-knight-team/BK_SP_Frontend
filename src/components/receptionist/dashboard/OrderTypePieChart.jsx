import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PieChart as PieChartIcon } from 'lucide-react'
import { getOrderCountsByTypeAPI } from '../../../apis/receptionist/dashboard'

const COLORS = ['#f97316', '#3b82f6', '#8b5cf6']

const OrderTypePieChart = () => {
  const [counts, setCounts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data } = await getOrderCountsByTypeAPI()
      if (data) setCounts(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  const chartData = counts
    ? [
        { name: 'QR', value: counts.qrCount },
        { name: 'Pickup', value: counts.pickupCount },
        { name: 'Delivery', value: counts.deliveryCount },
      ]
    : []

  const total = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center justify-center rounded-xl bg-purple-50 p-2">
          <PieChartIcon size={18} className="text-purple-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-800">Order Type Breakdown</h2>
          <p className="text-xs text-gray-400">Last 7 days, completed orders</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-36 w-36 animate-pulse rounded-full bg-gray-100" />
        </div>
      ) : total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 text-gray-300">
          <PieChartIcon size={36} strokeWidth={1.2} />
          <p className="text-xs font-medium">No completed orders yet</p>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={85}
              outerRadius={130}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, name]}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                fontSize: '12px',
                fontWeight: 600,
              }}
            />
            <Legend
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
            />
          </PieChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default OrderTypePieChart
