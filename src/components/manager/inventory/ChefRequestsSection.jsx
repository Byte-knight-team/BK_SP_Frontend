import React, { useState } from 'react'
import { Eye } from 'lucide-react'
import ResolveChefRequestModal from './ResolveChefRequestModal'

function ChefRequestCard({ request, onViewRequest }) {
  // Generate initials for the avatar
  const initials = request.chefName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="border border-gray-200 shadow-sm rounded-2xl p-5 min-w-[280px] flex-1 hover:shadow-md transition-shadow relative overflow-hidden bg-white">
      {/* Request Type Badge */}
      <div className="absolute top-0 right-0 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-bl-xl border-b border-l border-gray-200">
        {request.requestType === 'REFILL_STOCK' ? 'Refill Stock' : 
         request.requestType === 'ADD_NEW_ITEM' ? 'New Item' : request.requestType || 'Request'}
      </div>

      {/* Chef info header */}
      <div className="flex items-center gap-3 mb-4 mt-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: request.avatarColor }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {request.chefName}
          </p>
        </div>
        <span className="text-xs text-gray-400">{request.time}</span>
      </div>

      {/* Item details */}
      <div className="mb-3">
        <p className="text-sm font-bold text-gray-900">{request.item}</p>
        <p className="text-base font-bold text-brand">{request.quantity}</p>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-400 italic mb-4">"{request.note}"</p>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-2">
        <button 
          onClick={() => onViewRequest(request)}
          className="w-full inline-flex justify-center items-center gap-1.5 bg-brand/10 text-brand text-sm font-bold px-4 py-2 rounded-xl hover:bg-brand hover:text-white transition-all"
        >
          <Eye className="w-4 h-4" />
          View Request
        </button>
      </div>
    </div>
  )
}

export default function ChefRequestsSection({ requests = [] }) {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const safeRequests = requests || []
  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xl font-bold text-gray-900">Chef Requests</h2>
        <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {safeRequests.length}
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {safeRequests.map((request) => (
          <ChefRequestCard 
            key={request.id} 
            request={request} 
            onViewRequest={setSelectedRequest}
          />
        ))}
      </div>

      {/* View more */}
      {safeRequests.length > 3 && (
        <div className="mt-5 text-center">
          <button className="text-sm text-brand font-medium hover:underline inline-flex items-center gap-1">
            View more
          </button>
        </div>
      )}

      {/* Resolution Modal */}
      <ResolveChefRequestModal 
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  )
}
