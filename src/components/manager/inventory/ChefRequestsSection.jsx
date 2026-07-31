import React, { useState, useRef } from 'react'
import { Eye, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import ResolveChefRequestModal from './ResolveChefRequestModal'

const INITIAL_VISIBLE = 3

function ChefRequestCard({ request, onViewRequest }) {
  // Map RequestType to readable badge text
  const badgeText = request.requestType === 'REFILL_STOCK' ? 'Refill Stock' : 
                    request.requestType === 'ADD_NEW_ITEM' ? 'New Item' : request.requestType || 'Request'

  // Generate initials for the avatar
  const initials = request.chefName
    ?.split(' ')
    ?.map((n) => n[0])
    ?.join('')
    ?.slice(0, 2)
    ?.toUpperCase() || 'C'

  return (
    <div className="min-w-[280px] flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Badge & Time */}
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-[#fff7e6] px-3 py-1 text-xs font-bold text-[#d48806]">
          {badgeText}
        </span>
        <div className="flex items-center gap-1 text-xs font-medium text-gray-400">
          <Clock className="h-3.5 w-3.5" />
          <span>{request.time || '00:00'}</span>
        </div>
      </div>

      {/* Item Name & Quantity */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{request.item}</h3>
        <p className="text-sm text-gray-500 font-medium mt-1">Quantity: {request.quantity}</p>
      </div>

      {/* Chef Initial and Name in gray box */}
      <div className="mb-4 flex items-center gap-3 rounded-lg bg-gray-50 p-2">
        <div 
          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: request.avatarColor || '#f97316' }}
        >
          {initials}
        </div>
        <span className="text-sm font-medium text-gray-500">{request.chefName}</span>
      </div>

      {/* Italic note with orange border */}
      <div className="mb-5 flex items-center gap-2 border-l-[2px] border-[#f97316] pl-3">
        <span className="text-sm italic text-gray-500 line-clamp-2">"{request.note || 'No special note'}"</span>
      </div>

      {/* View Request Button */}
      <button
        onClick={() => onViewRequest(request)}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#f97316] hover:bg-[#ea580c] py-2.5 text-sm font-bold text-white shadow-sm transition-colors"
      >
        <span>+</span> View Request
      </button>
    </div>
  )
}

export default function ChefRequestsSection({ requests = [], scrollRef, resolveChefRequest }) {
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const safeRequests = requests || []

  const hasMore = safeRequests.length > INITIAL_VISIBLE
  const visibleRequests = expanded ? safeRequests : safeRequests.slice(0, INITIAL_VISIBLE)

  return (
    <div className="card" ref={scrollRef}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xl font-bold text-gray-900">Chef Requests</h2>
        <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {safeRequests.length} Pending
        </span>
      </div>

      {/* Empty state */}
      {safeRequests.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">
          No pending chef requests at the moment.
        </p>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleRequests.map((request) => (
          <ChefRequestCard 
            key={request.id} 
            request={request} 
            onViewRequest={setSelectedRequest}
          />
        ))}
      </div>

      {/* View more / View less toggle */}
      {hasMore && (
        <div className="mt-5 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-sm text-brand font-semibold hover:underline transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                View {safeRequests.length - INITIAL_VISIBLE} More Request{safeRequests.length - INITIAL_VISIBLE !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Resolution Modal */}
      <ResolveChefRequestModal 
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        resolveChefRequest={resolveChefRequest}
      />
    </div>
  )
}
