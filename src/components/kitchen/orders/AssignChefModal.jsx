import { useState, useEffect } from 'react'
import { UserPlus, X } from 'lucide-react'
import { getAvailableChefsAPI } from '../../../apis/kitchen/orders'

const AssignChefModal = ({ isOpen, onClose, onAssign, mealName }) => {
  // State to store the ID of the chef currently selected in the dropdown
  const [selectedChefId, setSelectedChefId] = useState('')

  const [isFetchingChefs, setIsFetchingChefs] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)


  // State to store the list of chefs fetched from the database
  const [availableChefs, setAvailableChefs] = useState([])

  // Triggered whenever the modal opens to ensure we have the latest list of chefs
  useEffect(() => {
    if (isOpen) {
      const fetchChefs = async () => {
        setIsFetchingChefs(true)
        const { data, error } = await getAvailableChefsAPI()
        if (data) {
          setAvailableChefs(data) // Store fetched chefs in state
        } else {
          console.error('Failed to load chefs', error)
        }
        setIsFetchingChefs(false)
      }
      fetchChefs()
    }
  }, [isOpen]) // Only runs when 'isOpen' changes (modal opens/closes)

  // Function called when the "Assign" button is clicked
  const handleAssign = async () => {
    if (selectedChefId) {
      setIsAssigning(true)
      // Passes the selected ID back to the parent component (SelectedOrder)
      await onAssign(selectedChefId)
      setIsAssigning(false)
    }
  }

  // If the modal is not active, don't render anything (Performance optimization)
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-4xl border border-gray-100 bg-white p-8 shadow-2xl">
        {/* Header Section: Icon and Close button */}
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
            <UserPlus size={24} />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="mb-2 text-left text-xl font-bold text-gray-900">
          Assign Chef
        </h3>
        <p className="mb-6 text-left text-sm text-gray-400">
          Select a chef for{' '}
          <span className="font-bold text-gray-900">"{mealName}"</span>
        </p>

        {/* Chef Selection Dropdown */}
        <select
          className="mb-8 w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none"
          value={selectedChefId} // value = chef.staffId in each option tag
          onChange={(e) => setSelectedChefId(e.target.value)} //that value set as the selectedChefId state
        >
          {/* default option */}
          {isFetchingChefs ? ( // Check if currently fetching
            <option value="">Loading chefs...</option>
          ) : availableChefs.length > 0 ? (
            <option value="">Select a chef</option>
          ) : (
            <option value="">No chefs available</option>
          )}

          {/* map all available chefs. Loop through the chefs array to create dropdown options */}
          {availableChefs.map((chef) => (
            <option key={chef.staffId} value={chef.staffId}>
              {chef.chefName} - ({chef.workStatus})
            </option>
          ))}
        </select>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-sm font-bold text-gray-400"
          >
            Cancel
          </button>
          <button
            // Trigger the assignment (save to backend) and close the modal simultaneously
            onClick={handleAssign}
            disabled={isAssigning || !selectedChefId} //button disables when loading or no chef is selected
            className="flex-1 rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-orange-600 disabled:bg-gray-300"
          >
            {isAssigning ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssignChefModal
