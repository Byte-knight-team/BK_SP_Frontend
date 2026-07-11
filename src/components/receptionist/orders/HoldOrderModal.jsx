import { useState } from 'react'
import { AlertCircle, X } from 'lucide-react'

const HoldOrderModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleClose = () => {
    setReason('')
    onClose()
  }

  const handleConfirm = () => {
    if (!reason.trim()) return
    onConfirm(reason)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-4xl border border-gray-100 bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
            <AlertCircle size={22} />
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Hold Order</h3>
        <p className="text-sm text-gray-400 mb-6">Provide a reason for holding this order.</p>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Customer requested a delay..."
          className="w-full rounded-2xl bg-gray-50 p-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 resize-none mb-6"
        />
        <div className="flex gap-4">
          <button onClick={handleClose} className="flex-1 py-3 text-sm font-bold text-gray-400">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={isLoading || !reason.trim()}
            className="flex-1 rounded-2xl bg-orange-500 py-3 text-sm font-bold text-white disabled:bg-gray-300 disabled:cursor-not-allowed">
            {isLoading ? 'Holding...' : 'Hold Order'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HoldOrderModal
