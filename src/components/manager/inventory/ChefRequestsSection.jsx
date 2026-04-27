import { Check, X } from 'lucide-react'

function ChefRequestCard({ request }) {
  // Generate initials for the avatar
  const initials = request.chefName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)

  return (
    <div className="border border-gray-200 shadow-sm rounded-2xl p-5 min-w-[280px] flex-1 hover:shadow-md transition-shadow">
      {/* Chef info header */}
      <div className="flex items-center gap-3 mb-4">
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
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
          <Check className="w-3.5 h-3.5" />
          Approve
        </button>
        <button className="inline-flex items-center gap-1.5 bg-red-50 text-red-500 text-xs font-semibold px-3.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
          <X className="w-3.5 h-3.5" />
          Reject
        </button>
      </div>
    </div>
  )
}

export default function ChefRequestsSection({ requests = [] }) {
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
          <ChefRequestCard key={request.id} request={request} />
        ))}
      </div>

      {/* View more */}
      <div className="mt-5 text-center">
        <button className="text-sm text-brand font-medium hover:underline inline-flex items-center gap-1">
          View more
        </button>
      </div>
    </div>
  )
}
