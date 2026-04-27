import React, { useState } from 'react'
import { X, Check, XCircle } from 'lucide-react'
import { useInventoryData } from '../../../hooks/useInventoryData'

export default function ResolveChefRequestModal({ request, onClose }) {
  const [decision, setDecision] = useState(null) // 'ACCEPTED' or 'REJECTED'
  const [managerNote, setManagerNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const { resolveChefRequest } = useInventoryData()

  if (!request) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!decision) {
      setError('Please select to Accept or Reject the request.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await resolveChefRequest(request.id, decision, managerNote)
    
    setIsSubmitting(false)
    if (result.success) {
      onClose()
    } else {
      setError(result.error || 'Failed to resolve request.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Resolve Chef Request</h2>
            <p className="text-sm text-gray-500 mt-1">
              Review and decide on {request.chefName}'s request.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Item</p>
                <p className="font-semibold text-gray-900">{request.item}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Quantity</p>
                <p className="font-semibold text-brand">{request.quantity}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Type</p>
                <p className="font-semibold text-gray-900">
                  {request.requestType === 'REFILL_STOCK' ? 'Refill Stock' : 
                   request.requestType === 'ADD_NEW_ITEM' ? 'Add New Item' : request.requestType}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Time</p>
                <p className="font-semibold text-gray-900">{request.time}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Chef's Note</p>
                <p className="italic text-gray-700 bg-white p-2 rounded border border-gray-200">
                  "{request.note || 'No note provided'}"
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Decision
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('ACCEPTED')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold transition-colors ${
                    decision === 'ACCEPTED'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Check className="w-5 h-5" />
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REJECTED')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold transition-colors ${
                    decision === 'REJECTED'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>

            {decision && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Manager Note (Optional)
                </label>
                <textarea
                  value={managerNote}
                  onChange={(e) => setManagerNote(e.target.value)}
                  placeholder={`Add a note for the kitchen regarding this ${decision.toLowerCase()} request...`}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
                  rows="3"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !decision}
              className="w-full py-3.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Decision'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
