import { ChefHat, X } from 'lucide-react'

const SendToKitchenModal = ({ isOpen, onClose, onConfirm, orderNumber, isOnHold, isLoading }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-4xl border border-gray-100 bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
            <ChefHat size={22} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {isOnHold ? 'Send Back to Kitchen?' : 'Send to Kitchen?'}
        </h3>
        <p className="text-sm text-gray-400 mb-8">
          {orderNumber} will be sent to the kitchen for preparation.
        </p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-400">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isLoading}
            className="flex-1 rounded-2xl bg-orange-500 py-3 text-sm font-bold text-white disabled:bg-gray-300 disabled:cursor-not-allowed">
            {isLoading ? 'Sending...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SendToKitchenModal
