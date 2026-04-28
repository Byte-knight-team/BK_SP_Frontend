import { User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getChefsAPI } from '../../../apis/kitchen/chefs'

const ChefDetailsTable = () => {
  const [chefs, setChefs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchChefs = async () => {
      //enable loading
      setLoading(true)
      //api call
      const { data, error } = await getChefsAPI()
      //handle error
      if (error) {
        console.error('Error fetching chefs:', error)
        return
      }
      //handle success
      if (data) {
        setChefs(data)
      }
      //disable loading
      setLoading(false)
    }

    fetchChefs()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full border-collapse text-left">
        {/* --- Table Header --- */}
        <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
          <tr>
            <th className="px-6 py-4 text-left">Chef Name</th>
            <th className="px-6 py-4 text-center">Chef ID</th>
            <th className="px-6 py-4 text-center">Clock In Time</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-center">Meals Today</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* --- Table Body --- */}
        <tbody className="divide-y divide-gray-50">
          {chefs.map((chef, index) => (
            <tr key={index} className="transition-colors hover:bg-gray-50/50">
              {/* Chef Name & Avatar */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{chef.fullName}</p>
                  </div>
                </div>
              </td>

              {/* Chef ID */}
              <td className="px-6 py-4 text-center font-bold text-gray-700">
                {`#CH ${chef.staffId}`}
              </td>

              {/* Clock In Time */}
              <td className="px-6 py-4 text-center font-bold text-gray-700">
                {chef.clockInTime}
              </td>

              {/* Status Badge */}
              <td className="px-6 py-4 text-center">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    chef.workStatus === 'AVAILABLE'
                      ? 'bg-green-600'
                      : chef.workStatus === 'COOKING'
                        ? 'bg-orange-600'
                        : chef.workStatus === 'ON_BREAK'
                          ? 'bg-blue-600'
                          : 'bg-gray-500' //for unavlible chefs
                  }`}
                ></span>
                {/* Format the text to look nice (e.g., "AVAILABLE" -> "Available") */}
                {chef.workStatus === 'ON_BREAK' ? 'On Break' :
                  chef.workStatus.charAt(0) + chef.workStatus.slice(1).toLowerCase()}
              </td>

              {/* Meals Today */}
              <td className="px-6 py-4 text-center font-bold text-gray-700">
                {chef.totalMealsToday}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ChefDetailsTable
