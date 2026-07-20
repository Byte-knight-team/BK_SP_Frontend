import { useState, useRef } from 'react'
import { User, MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const STATUS_STYLES = {
  'Ready for Pickup': 'bg-green-50 text-green-600',
  'Cooking...': 'bg-amber-50 text-amber-600',
}

import { Clock } from 'lucide-react'

function DispatchOrderCard({ order, onAssign }) {
  return (
    <div className="min-w-[280px] flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Badge & Distance (mimicking the time) */}
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-[#fff7e6] px-3 py-1 text-xs font-bold text-[#d48806]">
          {order.status}
        </span>
      </div>

      {/* Customer Name & Zone */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{order.customerName}</h3>
        <p className="text-sm text-gray-500 font-medium mt-1">Zone: {order.zone}</p>
      </div>

      {/* Customer Initial and Order ID in gray box */}
      <div className="mb-4 flex items-center gap-3 rounded-lg bg-gray-50 p-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f97316] text-xs font-bold text-white">
          {order.customerName?.charAt(0)?.toUpperCase() || 'O'}
        </div>
        <span className="text-sm font-medium text-gray-500">{order.id}</span>
      </div>

      {/* Italic note with orange border */}
      <div className="mb-5 flex items-center gap-2 border-l-[2px] border-[#f97316] pl-3">
        <span className="text-sm italic text-gray-500">"Pending assignment"</span>
      </div>

      {/* Assign Button */}
      <button
        onClick={() => onAssign(order)}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#f97316] hover:bg-[#ea580c] py-2.5 text-sm font-bold text-white shadow-sm transition-colors"
      >
        <span>+</span> Assign Driver
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
