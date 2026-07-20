import DashboardLineChart from '../../common/DashboardLineChart'
import { getPeakHoursAPI } from '../../../apis/kitchen/dashboard'
import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import { toast } from "react-toastify";

// Single orange line — orders approved (sent to kitchen) per time slot
const PEAK_SERIES = [{ dataKey: 'ordersCount', name: 'Orders', color: '#f97316' }]

const PeakHoursChart = () => {
  const [graphData, setGraphData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchGraphData = async () => {
      //enable loading
      setLoading(true)
      //api call
      const { data, error } = await getPeakHoursAPI() //object destructuring
      //handle error
      if (error) {
        toast.error('Error fetching stats details:', error)
        return
      }
      //handle success
      if (data) {
        setGraphData(data)
      }
      //disable loading
      setLoading(false)
    }

    fetchGraphData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        {/* Header skeleton (matches the icon-box header below) */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-100" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-2.5 w-32 animate-pulse rounded bg-gray-50" />
          </div>
        </div>

        {/* Chart area placeholder */}
        <div className="min-h-0 flex-1 animate-pulse rounded-2xl bg-gray-50" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center justify-center rounded-xl bg-orange-50 p-2">
          <TrendingUp size={18} className="text-orange-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-800">Peak Hours</h2>
          <p className="text-xs text-gray-400">Orders per slot · past 7 days</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <DashboardLineChart
          data={graphData}
          xKey="time" // time-slot labels on the X-axis
          series={PEAK_SERIES} // single orders line
          showLegend={false} // only one line
          showXAxis={true} // time slots are short enough to show on a line chart
        />
      </div>
    </div>
  )
}

export default PeakHoursChart
