import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import DashboardLineChart from '../../common/DashboardLineChart'
import { getRevenueByTypeAPI } from '../../../apis/receptionist/dashboard'

// Revenue lines (order types). Data + formatting are receptionist-specific;
// the drawing is delegated to the shared DashboardLineChart.
const REVENUE_SERIES = [
  { dataKey: 'qrRevenue', name: 'QR', color: '#f97316' },
  { dataKey: 'pickupRevenue', name: 'Pickup', color: '#3b82f6' },
]

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
            <p className="text-xs text-gray-400">Last 7 days, cash collected</p>
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
          <DashboardLineChart
            data={data}
            xKey="day"
            series={REVENUE_SERIES}
            yTickFormatter={(v) => `Rs ${v}`}
            tooltipFormatter={(v) => `Rs ${Number(v).toFixed(2)}`}
            yWidth={60}
          />
        </div>
      )}
    </div>
  )
}

export default RevenueLineChart
