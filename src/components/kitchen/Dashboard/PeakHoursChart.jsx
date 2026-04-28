import { BarChart } from '../BarChart'
import { getPeakHoursAPI } from '../../../apis/kitchen/dashboard'
import { useState, useEffect } from 'react'

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
        console.error('Error fetching stats details:', error)
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

  // Transform the data so it matches the label the user wants
  const formattedData = graphData.map((item) => ({
    ...item,
    'Orders Count': item.ordersCount,
  }))

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">Peak Hours</h2>
        <span className="text-sm font-medium text-gray-400">Past 7 Days</span>
      </div>

      <div className="mt-2 w-full">
        <BarChart
          data={formattedData}
          index="time"
          categories={['Orders Count']}
          colors={['orange']}
          showLegend={false}
          showXAxis={false}
          className="h-[300px]"
        />
      </div>
    </>
  )
}

export default PeakHoursChart
