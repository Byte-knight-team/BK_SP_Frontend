import { useState } from 'react'
import { Plus, Package, Clock, User } from 'lucide-react'

export default function PendingPOsTab({ pendingChefRequests, loading, onSelectChefRequest }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        <p className="text-gray-500 mt-4">Loading pending chef requests...</p>
      </div>
    )
  }

  if (!pendingChefRequests || pendingChefRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 p-8">
        <Package className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Pending POs</h3>
        <p className="text-gray-500">There are no approved chef requests waiting for a Purchase Order.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Pending POs</h2>
      </div>

      <div className="p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingChefRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Approved Request
                  </span>
                  <span className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {request.time}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{request.item}</h3>
                <p className="text-sm text-gray-600 mb-4">Quantity: {request.quantity}</p>

                <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2"
                    style={{ backgroundColor: request.avatarColor || '#F97316' }}
                  >
                    {request.chefName?.charAt(0) || 'C'}
                  </div>
                  <span className="truncate flex-1">{request.chefName}</span>
                </div>

                {request.note && (
                  <div className="mt-3 text-sm text-gray-600 italic border-l-2 border-brand pl-2">
                    "{request.note}"
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-gray-50 mt-auto">
                <button
                  onClick={() => onSelectChefRequest(request)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
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
