import { AlertTriangle, X } from 'lucide-react'

// InsufficientStockModal — shown when the backend rejects startMeal due to low stock
// shortages = ["Chicken: need 400.000 kg, have 150.000 kg", ...]
const InsufficientStockModal = ({ isOpen, onClose, onHold, shortages = [] }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-4xl shadow-2xl p-6 border border-gray-100">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-red-100 text-red-600 rounded-2xl">
            <AlertTriangle size={20} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">Insufficient Stock</h3>
        <p className="text-gray-400 text-xs mb-4">
          Cannot start this meal — the following ingredients are running low:
        </p>

        {/* Shortage list */}
        <div className="flex flex-col gap-2 mb-6">
          {shortages.map((shortage, index) => (
            <div
              key={index}
              className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-semibold text-red-600"
            >
              {shortage}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
          >
            Cancel
          </button>
          {/* Let the chef put the whole order on hold since they can't cook it */}
          <button
            onClick={onHold}
            className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-2xl transition-all shadow-lg"
          >
            Put Order on Hold
          </button>
        </div>

      </div>
    </div>
  )
}

export default InsufficientStockModal
