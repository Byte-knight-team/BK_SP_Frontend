import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { getRevenueByTypeAPI } from '../../../apis/receptionist/dashboard'

const RevenueLineChart = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: rows } = await getRevenueByTypeAPI()
      if (rows) setData(rows)
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-xl bg-orange-50 p-2">
            <TrendingUp size={18} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Revenue by Order Type</h2>
            <p className="text-xs text-gray-400">Last 7 days — cash collected</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 animate-pulse flex-col gap-3">
          <div className="h-4 w-20 rounded bg-gray-100" />
          <div className="h-full rounded-xl bg-gray-50" />
        </div>
      ) : (
        <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `Rs ${v}`}
              width={60}
            />
            <Tooltip
              formatter={(value) => [`Rs ${Number(value).toFixed(2)}`, undefined]}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                fontSize: '12px',
                fontWeight: 600,
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '8px' }}
            />
            <Line
              type="monotone"
              dataKey="qrRevenue"
              name="QR"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#f97316' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="pickupRevenue"
              name="Pickup"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default RevenueLineChart
