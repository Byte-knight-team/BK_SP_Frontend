import React, { useState } from 'react'
import { X, Check, XCircle } from 'lucide-react'
import { useInventoryData } from '../../../hooks/useInventoryData'

export default function ResolveChefRequestModal({ request, onClose, resolveChefRequest }) {
  const [decision, setDecision] = useState(null) // 'ACCEPTED' or 'REJECTED'
  const [managerNote, setManagerNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // const { resolveChefRequest } = useInventoryData() - Moved to props to ensure state synchronization

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Resolve Chef Request
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review and decide on {request.chefName}'s request.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="mb-1 text-gray-500">Item</p>
                <p className="font-semibold text-gray-900">{request.item}</p>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Quantity</p>
                <p className="text-brand font-semibold">{request.quantity}</p>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Type</p>
                <p className="font-semibold text-gray-900">
                  {request.requestType === 'REFILL_STOCK'
                    ? 'Refill Stock'
                    : request.requestType === 'ADD_NEW_ITEM'
                      ? 'Add New Item'
                      : request.requestType}
                </p>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Time</p>
                <p className="font-semibold text-gray-900">{request.time}</p>
              </div>
              <div className="col-span-2">
                <p className="mb-1 text-gray-500">Chef's Note</p>
                <p className="rounded border border-gray-200 bg-white p-2 text-gray-700 italic">
                  "{request.note || 'No note provided'}"
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-gray-900">
                Decision
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('ACCEPTED')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 font-semibold transition-colors ${
                    decision === 'ACCEPTED'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <Check className="h-5 w-5" />
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REJECTED')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 font-semibold transition-colors ${
                    decision === 'REJECTED'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <XCircle className="h-5 w-5" />
                  Reject
                </button>
              </div>
            </div>

            {decision && (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Manager Note (Optional)
                </label>
                <textarea
                  value={managerNote}
                  onChange={(e) => setManagerNote(e.target.value)}
                  placeholder={`Add a note for the kitchen regarding this ${decision.toLowerCase()} request...`}
                  className="focus:ring-brand/20 focus:border-brand w-full resize-none rounded-xl border border-gray-200 px-4 py-3 transition-all focus:ring-2 focus:outline-none"
                  rows="3"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !decision}
              className="bg-brand hover:bg-brand-dark w-full rounded-xl py-3.5 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Decision'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
