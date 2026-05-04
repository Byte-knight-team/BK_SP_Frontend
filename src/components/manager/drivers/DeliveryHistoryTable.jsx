import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const FILTER_OPTIONS = ['All Status', 'DELIVERED', 'CANCELLED']

const STATUS_STYLES = {
  DELIVERED: {
    dot: 'bg-green-500',
    badge: 'bg-green-50 text-green-600',
  },
  CANCELLED: {
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-600',
  },
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.CANCELLED
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        style.badge,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', style.dot)} />
      {status === 'DELIVERED' ? 'Served' : 'Cancelled'}
    </span>
  )
}

const PAGE_SIZE = 10

export default function DeliveryHistoryTable({ history = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(0)

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.driverName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === 'All Status' || item.deliveryStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [history, searchQuery, statusFilter])

  const displayedHistory = useMemo(() => {
    if (currentPage === 0) {
      return filteredHistory.slice(0, 5)
    }
    const start = (currentPage - 1) * PAGE_SIZE
    const end = currentPage * PAGE_SIZE
    return filteredHistory.slice(start, end)
  }, [filteredHistory, currentPage])

  const handleViewMore = () => {
    setCurrentPage(1)
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Delivery History</h2>
          <span className="bg-brand rounded-full px-2.5 py-1 text-xs font-bold text-white">
            {filteredHistory.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex w-56 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 border border-gray-100 focus-within:border-brand focus-within:bg-white transition-all">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order or driver..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(0)
              }}
              className="w-full bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 bg-white hover:border-brand transition-all">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(0)
                }}
                className="cursor-pointer appearance-none bg-transparent pr-4 text-sm font-medium text-gray-700 outline-none"
              >
                {FILTER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-400 uppercase">
              <th className="w-1/4 pb-3 text-left font-semibold">Order ID</th>
              <th className="w-1/4 pb-3 text-left font-semibold">Status</th>
              <th className="w-1/4 pb-3 text-left font-semibold">Driver</th>
              <th className="w-1/4 pb-3 text-right font-semibold">Completed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayedHistory.map((item, index) => (
              <tr
                key={`${item.orderId}-${index}`}
                className="transition-colors hover:bg-gray-50/50"
              >
                <td className="py-4 font-medium text-gray-800">{item.orderId}</td>
                <td className="py-4">
                  <StatusBadge status={item.deliveryStatus} />
                </td>
                <td className="py-4 text-sm text-gray-600 font-medium">
                  {item.driverName}
                </td>
                <td className="py-4 text-right text-sm font-medium text-gray-500">
                  {item.completedAt}
                </td>
              </tr>
            ))}

            {displayedHistory.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-gray-200" />
                    <p>No delivery history found.</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Fill empty rows to keep height stable */}
            {(() => {
              const targetRows = currentPage === 0 ? 5 : PAGE_SIZE
              const emptyRows = targetRows - displayedHistory.length
              if (emptyRows > 0 && displayedHistory.length > 0) {
                return (
                  <tr style={{ height: `${emptyRows * 56}px` }}>
                    <td colSpan={4}></td>
                  </tr>
                )
              }
              return null
            })()}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-6 flex items-center justify-center border-t border-gray-50 pt-5">
        {currentPage === 0 ? (
          filteredHistory.length > 5 && (
            <button
              onClick={handleViewMore}
              className="text-sm text-brand font-bold hover:underline inline-flex items-center gap-1 transition-all"
            >
              View all
            </button>
          )
        ) : (
          <div className="flex items-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-md">
              Page {currentPage} of {Math.ceil(filteredHistory.length / PAGE_SIZE)}
            </span>

            <button
              disabled={currentPage * PAGE_SIZE >= filteredHistory.length}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
