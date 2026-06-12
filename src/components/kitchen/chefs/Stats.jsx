import { useState, useEffect, useCallback } from 'react'
import StatCard from '../StatCard'
import { Users } from 'lucide-react'
import { getChefsStatsAPI } from '../../../apis/kitchen/chefs'

const formatStatCardDetails = (apiData) => {
  return [
    {
      title: 'Total Chefs',
      value: apiData.totalChefs || 0,
      icon: <Users color="#E64919" size={28} />,
      iconBgColor: 'bg-orange-50',
    },
    {
      title: 'On-duty Chefs',
      value: apiData.onDutyChefs || 0,
      icon: <Users color="#A855F7" size={40} />,
      iconBgColor: 'bg-purple-50',
    },
    {
      title: 'Off-duty Chefs',
      value: apiData.offDutyChefs || 0,
      icon: <Users color="#4CAF50" size={40} />,
      iconBgColor: 'bg-green-50',
    },
    {
      title: 'Available Chefs',
      value: apiData.availableChefs || 0,
      icon: <Users color="#4F83FF" size={40} />,
      iconBgColor: 'bg-blue-50',
    },
  ]
}

const Stats = ({ refreshTrigger }) => {
  const [statsDetails, setStatsDetails] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchStatsDetails = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    const { data, error } = await getChefsStatsAPI()

    if (error) {
      console.error('Error fetching stats details:', error)
    } else if (data) {
      const formattedData = formatStatCardDetails(data)
      setStatsDetails(formattedData)
    }
    if (showLoading) setLoading(false)
  }, [])

  // Initial Load
  useEffect(() => {
    fetchStatsDetails(true)
  }, [fetchStatsDetails])

  // Silent Refresh when actions happen(if changed the refreshTrigger) in the table. refreshTrigger > 0 means there is new data.
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchStatsDetails(false) // Pass false so no skeleton shows
    }
  }, [refreshTrigger, fetchStatsDetails])

  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex h-32 animate-pulse flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6"
          >
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="h-8 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      {statsDetails.map((card, index) => (
        <StatCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          iconBgColor={card.iconBgColor}
        />
      ))}
    </>
  )
}

export default Stats
