import { useState } from 'react'
import { Plus, Package, Clock, User } from 'lucide-react'

export default function PendingPOsTab({
  pendingChefRequests,
  loading,
  onSelectChefRequest,
}) {
  if (loading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center">
        <div className="border-brand h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <p className="mt-4 text-gray-500">Loading pending chef requests...</p>
      </div>
    )
  }

  if (!pendingChefRequests || pendingChefRequests.length === 0) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
        <Package className="mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-1 text-lg font-medium text-gray-900">
          No Pending POs
        </h3>
        <p className="text-gray-500">
          There are no approved chef requests waiting for a Purchase Order.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex flex-col items-center justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row">
        <h2 className="text-xl font-bold text-gray-900">Pending POs</h2>
      </div>

      <div className="p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingChefRequests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="grow border-b border-gray-100 p-4">
                <div className="mb-3 flex items-start justify-between">
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                    Approved Request
                  </span>
                  <span className="flex items-center text-xs text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    {request.time}
                  </span>
                </div>

                <h3 className="mb-1 text-lg font-semibold text-gray-900">
                  {request.item}
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  Quantity: {request.quantity}
                </p>

                <div className="flex items-center rounded-lg bg-gray-50 p-2 text-sm text-gray-500">
                  <div
                    className="mr-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{
                      backgroundColor: request.avatarColor || '#F97316',
                    }}
                  >
                    {request.chefName?.charAt(0) || 'C'}
                  </div>
                  <span className="flex-1 truncate">{request.chefName}</span>
                </div>

                {request.note && (
                  <div className="border-brand mt-3 border-l-2 pl-2 text-sm text-gray-600 italic">
                    "{request.note}"
                  </div>
                )}
              </div>

              <div className="mt-auto bg-gray-50 p-3">
                <button
                  onClick={() => onSelectChefRequest(request)}
                  className="bg-brand hover:bg-brand-dark flex w-full items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create PO
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
