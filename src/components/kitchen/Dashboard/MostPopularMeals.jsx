import KitchenStatBar from '../KitchenStatBar'
import { useState, useEffect } from 'react'
import { UtensilsCrossed } from 'lucide-react'
import { getDashboardPopularMealsAPI } from '../../../apis/kitchen/dashboard'
import { toast } from "react-toastify";

const BAR_COLORS = ['#4CAF50', '#4F83FF', '#E64919', '#A855F7', '#FF9800']

const formatPopularMealsDetails = (apiData) => {
  //convert the data from the API to the format required by the component
  return apiData.map((meal, index) => ({
    mealName: meal.mealName,
    percentage: meal.percentage,
    color: BAR_COLORS[index], //indexes = 0,1,2,3,4
    count: meal.count,
  }))
}

const MostPopularMeals = () => {
  const [popularMealsDetails, setPopularMealsDetails] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPopularMealsDetails = async () => {
      //enable loading
      setLoading(true)
      //api call
      const { data, error } = await getDashboardPopularMealsAPI()
      //handle error
      if (error) {
        toast.error('Error fetching popular meals:', error)
        return
      }
      //handle success
      if (data) {
        const formattedData = formatPopularMealsDetails(data)
        setPopularMealsDetails(formattedData)
      }
      //disable loading
      setLoading(false)
    }

    fetchPopularMealsDetails()
  }, [])

  // When loading show five skeleton components
  if (loading) {
    return (
      <div className="mt-6 flex flex-col gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-50">
              <div className="h-full w-[70%] animate-pulse bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center justify-center rounded-xl bg-amber-50 p-2">
          <UtensilsCrossed size={18} className="text-amber-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-800">Most Popular Meals</h2>
          <p className="text-xs text-gray-400">Popular meals · past 7 days</p>
        </div>
      </div>

      {/*
        if Items available -> map
        else -> show no data available message
      */}
      {popularMealsDetails.length > 0 ? (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1 min-h-0">
          {popularMealsDetails.map((meal, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-100 bg-white p-3 [&>*]:mb-0"
            >
              <KitchenStatBar
                mealName={meal.mealName}
                percentage={meal.percentage}
                color={meal.color}
                count={meal.count}
              />
            </div>
          ))}
        </div>
      ) : (
        //if backend pass empty dto array
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-6 text-gray-300">
          <UtensilsCrossed size={32} strokeWidth={1.2} />
          <p className="text-xs font-medium">No popular meals in the last 7 days</p>
        </div>
      )}
    </div>
  )
}

export default MostPopularMeals
