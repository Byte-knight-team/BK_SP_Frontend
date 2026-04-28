import { useState, useRef } from 'react'
import { User, MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const STATUS_STYLES = {
  'Ready for Pickup': 'bg-green-50 text-green-600',
  'Cooking...': 'bg-amber-50 text-amber-600',
}

function DispatchOrderCard({ order, onAssign }) {
  return (
    <div className="min-w-[280px] flex-1 rounded-2xl border border-gray-100 p-5">
      {/* Order ID + Status */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-sm font-bold text-gray-900">{order.id}</span>
        <span
          className={clsx(
            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
            STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-500',
          )}
        >
          {order.status}
        </span>
      </div>

      {/* Customer */}
      <div className="mb-1.5 flex items-center gap-2 text-sm text-gray-600">
        <User className="h-3.5 w-3.5 text-gray-400" />
        {order.customerName}
      </div>

      {/* Zone */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
        <MapPin className="h-3.5 w-3.5" />
        {order.zone}
      </div>

      {/* Assign button */}
      <button
        onClick={() => onAssign(order)}
        className="bg-brand hover:bg-brand-hover inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
      >
        Assign Driver <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export default function DispatchHub({ orders = [], onAssignDriver }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const containerRef = useRef(null)
  
  const INITIAL_COUNT = 6
  const PAGE_SIZE = 9

  const displayedOrders = !isExpanded 
    ? orders.slice(0, INITIAL_COUNT)
    : orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleViewMore = () => {
    setIsExpanded(true)
    setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="card scroll-mt-6" ref={containerRef}>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Dispatch Hub</h2>
          <span className="bg-brand rounded-full px-2.5 py-1 text-xs font-bold text-white">
            {orders.length}
          </span>
        </div>
        {isExpanded && (
          <button 
            onClick={() => setIsExpanded(false)}
            className="text-xs font-bold text-gray-400 hover:text-brand transition-colors"
          >
            Collapse View
          </button>
        )}
      </div>

      {/* Cards grid */}
      <div className={clsx(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        isExpanded && "min-h-[400px]" // Prevent collapse/jump during pagination
      )}>
        {displayedOrders.map((order) => (
          <DispatchOrderCard
            key={order.id}
            order={order}
            onAssign={onAssignDriver}
          />
        ))}
      </div>

      {/* View more / Pagination */}
      {!isExpanded && orders.length > INITIAL_COUNT && (
        <div className="mt-5 text-center">
          <button 
            onClick={handleViewMore}
            className="text-brand inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            View more
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="mt-8 flex items-center justify-center gap-4 border-t border-gray-50 pt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          
          <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-md">
            Page {currentPage} of {Math.max(1, Math.ceil(orders.length / PAGE_SIZE))}
          </span>

          <button
            disabled={currentPage * PAGE_SIZE >= orders.length}
            onClick={() => handlePageChange(currentPage + 1)}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
