import { useState, useMemo, useRef } from 'react'
import Badge from '../ui/Badge'
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'

const STATUS_OPTIONS = [
  'All Status',
  'PLACED',
  'APPROVED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'SERVED',
  'COMPLETED',
  'CANCELLED',
  'ON_HOLD'
]

export default function RecentOrdersTable({ orders = [] }) {
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const tableRef = useRef(null)
  const PAGE_SIZE = 10

  // Filter and Search Logic
  const filteredOrders = useMemo(() => {
    return (orders || []).filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All Status' || 
                           order.status.toUpperCase() === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const displayedOrders = useMemo(() => {
    if (currentPage === 0) {
      return filteredOrders.slice(0, 5)
    }
    const start = (currentPage - 1) * PAGE_SIZE
    const end = currentPage * PAGE_SIZE
    return filteredOrders.slice(start, end)
  }, [filteredOrders, currentPage])

  const handleViewMore = () => {
    setCurrentPage(1)
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div className="card" ref={tableRef}>
      {/* Header section with Search and Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          <span className="bg-brand rounded-full px-2.5 py-1 text-xs font-bold text-white">
            {filteredOrders.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex w-64 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 border border-gray-100 focus-within:border-brand focus-within:bg-white transition-all">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or Type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(0) // Reset to mini-view on search
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
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-base table-fixed">
          <thead>
            <tr className="border-b border-gray-100 text-sm tracking-wider text-gray-400 uppercase">
              <th className="w-[20%] pb-3 text-left font-medium">Order ID</th>
              <th className="w-[20%] pb-3 text-left font-medium">Type</th>
              <th className="w-[20%] pb-3 text-left font-medium">Status</th>
              <th className="w-[20%] pb-3 text-center font-medium">Order Amount</th>
              <th className="w-[20%] pb-3 text-right font-medium">Placed On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 min-h-[450px]">
            {displayedOrders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-gray-50">
                <td className="py-4 font-medium text-gray-800 truncate">{order.id}</td>
                <td className="py-4 text-sm tracking-wide text-gray-500 uppercase">
                  {order.type}
                </td>
                <td className="py-4">
                  <Badge status={order.status.toLowerCase()} />
                </td>
                <td className="py-4 text-center font-medium text-gray-900">
                  Rs.{Number(order.amount).toLocaleString()}
                </td>
                <td className="py-4 text-right text-sm font-medium text-gray-900">
                  {order.timer}
                </td>
              </tr>
            ))}
            {displayedOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-gray-200" />
                    <p>No orders match your search criteria.</p>
                  </div>
                </td>
              </tr>
            )}
            {/* Fill empty space to keep table height static during pagination/filtering */}
            {(() => {
              const targetRows = currentPage === 0 ? 5 : PAGE_SIZE
              const emptyRows = targetRows - displayedOrders.length
              if (emptyRows > 0 && displayedOrders.length > 0) {
                return (
                  <tr style={{ height: `${emptyRows * 60}px` }}>
                    <td colSpan={5}></td>
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
          filteredOrders.length > 5 && (
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
              Page {currentPage} of {Math.ceil(filteredOrders.length / PAGE_SIZE)}
            </span>

            <button
              disabled={currentPage * PAGE_SIZE >= filteredOrders.length}
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
