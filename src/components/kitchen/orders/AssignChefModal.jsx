import { useState, useEffect } from 'react'
import { UserPlus, X } from 'lucide-react'
import { getAvailableChefsAPI } from '../../../apis/kitchen/orders'
import { toast } from "react-toastify";

const AssignChefModal = ({ isOpen, onClose, onAssign, mealName }) => {
  // State to store the ID of the chef currently selected in the dropdown
  const [selectedChefId, setSelectedChefId] = useState('');

  const [isFetchingChefs, setIsFetchingChefs] = useState(false);

  const [isAssigning, setIsAssigning] = useState(false);

  // State to store the list of chefs fetched from the database
  const [availableChefs, setAvailableChefs] = useState([]);

  // Triggered whenever the modal opens to ensure we have the latest list of chefs
  useEffect(() => {
    if (isOpen) {
      const fetchChefs = async () => {
        setIsFetchingChefs(true)
        const { data, error } = await getAvailableChefsAPI()
        if (data) {
          setAvailableChefs(data) // Store fetched chefs in state
        } else {
          toast.error("Failed to load chefs");
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
          Assign Line Chef
        </h3>
        <p className="mb-6 text-left text-sm text-gray-400">
          Select a line chef for{' '}
          <span className="font-bold text-gray-900">"{mealName}"</span>
        </p>

        {/* Line Chef Selection Dropdown */}
        <select
          className="mb-8 w-full rounded-2xl border-none bg-gray-50 p-4 text-sm font-bold text-gray-700 outline-none"
          value={selectedChefId}
          onChange={(e) => setSelectedChefId(e.target.value)}
        >
          {isFetchingChefs ? (
            <option value="">Loading line chefs...</option>
          ) : availableChefs.length > 0 ? (
            <option value="">Select a line chef</option>
          ) : (
            <option value="">No line chefs available</option>
          )}

          {availableChefs.map((chef) => (
            <option key={chef.staffId} value={chef.staffId}>
              {chef.chefName} — {chef.activeItemCount > 0 ? `${chef.activeItemCount} active item${chef.activeItemCount > 1 ? 's' : ''}` : 'Available'}
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
          <span className={`flex-1 ${(isAssigning || !selectedChefId) ? 'cursor-not-allowed' : ''}`}>
            <button
              // Trigger the assignment (save to backend) and close the modal simultaneously
              onClick={handleAssign}
              disabled={isAssigning || !selectedChefId} //button disables when loading or no chef is selected
              className="w-full rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {isAssigning ? 'Assigning...' : 'Assign'}
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}

export default AssignChefModal
