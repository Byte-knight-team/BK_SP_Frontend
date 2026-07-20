import { useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

const CollectPaymentModal = ({ isOpen, onClose, onConfirm, orderNumber, finalAmount, isLoading }) => {
  const [cashReceived, setCashReceived] = useState('')

  if (!isOpen) return null

  const handleClose = () => {
    setCashReceived('')
    onClose()
  }

  const cash = parseFloat(cashReceived) || 0
  const isEnough = cashReceived !== '' && cash >= finalAmount
  const change = isEnough ? (cash - finalAmount).toFixed(2) : null
  const shortBy = cashReceived !== '' && cash > 0 && cash < finalAmount ? (finalAmount - cash).toFixed(2) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-4xl border border-gray-100 bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-green-100 p-3 text-green-600">
            <CheckCircle size={22} />
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Collect Cash Payment</h3>
        <p className="text-sm text-gray-400 mb-6">{orderNumber}</p>

        <div className="rounded-2xl bg-gray-50 p-4 mb-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">Total Due</span>
          <span className="text-lg font-black text-gray-900">Rs. {finalAmount.toFixed(2)}</span>
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1.5 block">Cash Received (Rs.)</label>
          <input
            type="number"
            value={cashReceived}
            onChange={(e) => setCashReceived(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-2xl bg-gray-50 p-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {isEnough && (
          <div className="rounded-2xl bg-green-50 border border-green-100 p-4 mb-6 flex justify-between items-center">
            <span className="text-sm font-semibold text-green-700">Change to Return</span>
            <span className="text-lg font-black text-green-700">Rs. {change}</span>
          </div>
        )}
        {shortBy && (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-4 mb-6 flex justify-between items-center">
            <span className="text-sm font-semibold text-red-500">Short By</span>
            <span className="text-lg font-black text-red-500">Rs. {shortBy}</span>
          </div>
        )}

        <div className="flex gap-4 mt-2">
          <button onClick={handleClose} className="flex-1 py-3 text-sm font-bold text-gray-400">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(cash)}
            disabled={isLoading || !isEnough}
            className="flex-1 rounded-2xl bg-green-500 py-3 text-sm font-bold text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Confirming...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CollectPaymentModal
