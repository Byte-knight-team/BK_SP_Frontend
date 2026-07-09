import { X, Play, Check } from 'lucide-react'
import { useState } from 'react'

const ActionConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  mealName,
  chefName,
}) => {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  // Change colors and icons based on whether it is "Start" or "Complete"
  const isStart = type === 'START' //isStart is true if the type is "START"
  const themeColor = isStart ? 'green' : 'blue'
  const Icon = isStart ? Play : Check

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl bg-${themeColor}-50 p-2 text-${themeColor}-600`}
            >
              <Icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {isStart ? 'Start Preparation?' : 'Mark as Completed?'}
            </h3>
          </div>
          {/* X icon button to close the modal */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* content area */}
        <div className="mt-6 space-y-4">
          <p className="text-sm leading-relaxed text-gray-500">
            {isStart
              ? 'Are you sure you want to start preparing this meal?'
              : 'Is this meal ready to be served to the customer?'}
          </p>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Meal Item
            </p>
            <p className="text-sm font-bold text-gray-800">{mealName}</p>

            <p className="mt-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Assigned Chef
            </p>
            <p className={`text-sm font-bold text-${themeColor}-600`}>
              {chefName}
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-100 py-4 text-sm font-bold text-gray-400 transition-all hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 rounded-2xl bg-${themeColor}-500 py-4 text-sm font-bold text-white shadow-lg hover:bg-${themeColor}-600 transition-all disabled:bg-gray-300`}
          >
            {loading
              ? 'Processing...'
              : isStart
                ? 'Start Cooking'
                : 'Complete Meal'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActionConfirmationModal
