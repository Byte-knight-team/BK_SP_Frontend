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
      <div className="flex flex-col gap-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-50" />
        </div>

        {/* Bar Chart Skeleton */}
        <div className="flex h-[200px] items-end justify-between gap-3 px-2">
          {/* create 7 bars with random heights */}
          {[60, 40, 85, 50, 70, 30, 90].map((height, i) => (
            <div
              key={i}
              style={{ height: `${height}%` }}
              className="w-full animate-pulse rounded-t-lg bg-gray-100/80"
            />
          ))}
        </div>

        {/* X-Axis labels skeleton */}
        <div className="flex justify-between px-1">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-2 w-8 animate-pulse rounded bg-gray-50" />
          ))}
        </div>
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
