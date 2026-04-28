import { User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getChefsAPI } from '../../../apis/kitchen/chefs'
import ChefActionModal from './ChefActionModal'

const ChefDetailsTable = () => {
  const [chefs, setChefs] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('') // 'CHECK_IN', 'CHECK_OUT', or 'UPDATE_STATUS'
  const [selectedChef, setSelectedChef] = useState(null)

  // Helper function to open the modal
  const handleOpenModal = (type, chef) => {
    setModalType(type)
    setSelectedChef(chef)
    setIsModalOpen(true)
  }

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
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-4">
        {/* Animated Spinner Ring */}
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-orange-500"></div>

        {/* Subtle Loading Text */}
        <p className="animate-pulse text-sm font-bold tracking-widest text-gray-400 uppercase">
          Fetching Chefs...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full border-collapse text-left">
        {/* --- Table Header --- */}
        <thead className="bg-gray-50 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
          <tr>
            <th className="px-6 py-4 text-center">Chef Name</th>
            <th className="px-6 py-4 text-center">Chef ID</th>
            <th className="px-6 py-4 text-center">Clock In Time</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-center">Meals Today</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>

        {/* --- Table Body --- */}
        <tbody className="divide-y divide-gray-50">
          {chefs.map((chef, index) => (
            <tr key={index} className="transition-colors hover:bg-gray-50/50">
              {/* Chef Name & Avatar */}
              <td className="px-6 py-4 pl-20 text-left">
                <div className="flex items-center justify-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {chef.fullName}
                    </p>
                  </div>
                </div>
              </td>

              {/* Chef ID */}
              <td className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                {`#CH ${chef.staffId}`}
              </td>

              {/* Clock In Time */}
              <td className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                {chef.clockInTime}
              </td>

              {/* Status Badge */}
              <td className="px-6 py-4 text-center text-sm">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black tracking-tighter uppercase shadow-sm ${
                    chef.workStatus === 'AVAILABLE'
                      ? 'border-green-100 bg-green-50 text-green-600'
                      : chef.workStatus === 'COOKING'
                        ? 'border-orange-100 bg-orange-50 text-orange-600'
                        : chef.workStatus === 'ON_BREAK'
                          ? 'border-blue-100 bg-blue-50 text-blue-600'
                          : 'border-gray-100 bg-gray-50 text-gray-400' // Handles OFF_DUTY
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      chef.workStatus === 'AVAILABLE'
                        ? 'bg-green-600'
                        : chef.workStatus === 'COOKING'
                          ? 'bg-orange-600'
                          : chef.workStatus === 'ON_BREAK'
                            ? 'bg-blue-600'
                            : 'bg-gray-400'
                    }`}
                  ></span>
                  {/* Format the text to look nice */}
                  {chef.workStatus === 'ON_BREAK'
                    ? 'On Break'
                    : chef.workStatus === 'OFF_DUTY'
                      ? 'Off Duty'
                      : chef.workStatus.charAt(0) +
                        chef.workStatus
                          .slice(1)
                          .toLowerCase()
                          .replace('_', ' ')}
                </div>
              </td>

              {/* Meals Today */}
              <td className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                {chef.totalMealsToday}
              </td>

              {/* Action Buttons */}
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2">
                  {/* Only show Check In if they are Off Duty */}
                  {chef.workStatus === 'OFF_DUTY' ? (
                    <button
                      onClick={() => handleOpenModal('CHECK_IN', chef)}
                      className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-[10px] font-bold text-green-600 transition-all hover:bg-green-100"
                    >
                      CHECK IN
                    </button>
                  ) : (
                    /*Show these two if they are working */
                    <>
                      <button
                        onClick={() => handleOpenModal('UPDATE_STATUS', chef)}
                        className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10px] font-bold text-orange-600 transition-all hover:bg-orange-100"
                      >
                        UPDATE STATUS
                      </button>

                      <button
                        onClick={() => handleOpenModal('CHECK_OUT', chef)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-600 transition-all hover:bg-red-100"
                      >
                        CHECK OUT
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <ChefActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        chefName={selectedChef?.fullName}
        currentStatus={selectedChef?.workStatus}
        onConfirm={(data) => {
          console.log(
            'Confirming action:',
            modalType,
            'for',
            selectedChef.staffId,
            'with data:',
            data,
          )
          setIsModalOpen(false)
          // We will add the API calls here next!
        }}
      />
    </div>
  )
}

export default ChefDetailsTable
