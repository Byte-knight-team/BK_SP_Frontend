import { useState, useMemo, useRef } from 'react'
import Badge from '../ui/Badge'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react'

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
  'ON_HOLD',
]

/**
 * RecentOrdersTable Component
 *
 * This component displays a list of recent orders with filtering, searching,
 * and pagination capabilities. It is designed to be used in the Manager Dashboard.
 */
export default function RecentOrdersTable({ orders = [] }) {
  // State for current page index (0 is mini-view, 1+ is full view with pagination)
  const [currentPage, setCurrentPage] = useState(0)

  // State for search input value
  const [searchQuery, setSearchQuery] = useState('')

  // State for current status filter selection
  const [statusFilter, setStatusFilter] = useState('All Status')

  // Reference to the main card container for scrolling purposes
  const tableRef = useRef(null)

  // Constant defining how many items to show per page in full view
  const PAGE_SIZE = 10

  /**
   * Filter and Search Logic
   *
   * Uses useMemo to re-filter the orders array only when dependencies change.
   * Filters by order ID, order type, and status badge value.
   */
  const filteredOrders = useMemo(() => {
    return (orders || []).filter((order) => {
      // Check if search query matches either ID or Type
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.type.toLowerCase().includes(searchQuery.toLowerCase())

      // Check if current filter matches order status
      const matchesStatus =
        statusFilter === 'All Status' ||
        order.status.toUpperCase() === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  /**
   * Pagination View Selection
   *
   * Decides which subset of filtered orders to display.
   * If currentPage is 0, shows only the top 5 (mini-view).
   * Otherwise, calculates the start/end indices based on page size.
   */
  const displayedOrders = useMemo(() => {
    if (currentPage === 0) {
      return filteredOrders.slice(0, 5)
    }
    const start = (currentPage - 1) * PAGE_SIZE
    const end = currentPage * PAGE_SIZE
    return filteredOrders.slice(start, end)
  }, [filteredOrders, currentPage])

  /**
   * handleViewMore
   *
   * Switches from mini-view (5 items) to paginated view (10 items/page)
   * and scrolls the user back to the top of the table.
   */
  const handleViewMore = () => {
    setCurrentPage(1)
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div className="card" ref={tableRef}>
      {/* Header section: Contains title, count badge, search bar, and status filter */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          <span className="bg-brand rounded-full px-2.5 py-1 text-xs font-bold text-white">
            {filteredOrders.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar: Filters list in real-time as user types */}
          <div className="focus-within:border-brand flex w-64 items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 transition-all focus-within:bg-white">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or Type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(0) // Reset to mini-view on search to prioritize results
              }}
              className="w-full bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
            />
          </div>

          {/* Status Filter: Dropdown to filter orders by their workflow status */}
          <div className="relative">
            <div className="hover:border-brand flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-all">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(0) // Reset pagination on filter change
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

      {/* Main Table Display */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-base">
          <thead>
            <tr className="border-b border-gray-100 text-sm tracking-wider text-gray-400 uppercase">
              <th className="w-[20%] pb-3 text-left font-medium">Order ID</th>
              <th className="w-[20%] pb-3 text-left font-medium">Type</th>
              <th className="w-[20%] pb-3 text-left font-medium">Status</th>
              <th className="w-[20%] pb-3 text-center font-medium">
                Order Amount
              </th>
              <th className="w-[20%] pb-3 text-right font-medium">Placed On</th>
            </tr>
          </thead>
          <tbody className="min-h-[450px] divide-y divide-gray-50">
            {displayedOrders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-gray-50">
                <td className="truncate py-4 font-medium text-gray-800">
                  {order.id}
                </td>
                <td className="py-4 text-sm tracking-wide text-gray-500 uppercase">
                  {order.type}
                </td>
                <td className="py-4">
                  {/* Status Badge component for visual status representation */}
                  <Badge status={order.status.toLowerCase()} />
                </td>
                <td className="py-4 text-center font-medium text-gray-900">
                  Rs.{Number(order.amount).toLocaleString()}
                </td>
                <td className="py-4 text-right text-sm font-medium text-gray-900">
                  {/* Relative time provided by backend */}
                  {order.timer}
                </td>
              </tr>
            ))}

            {/* Empty State: Shown when no orders match the search/filter criteria */}
            {displayedOrders.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-gray-200" />
                    <p>No orders match your search criteria.</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Layout Stability: Fill empty space to keep table height static during pagination */}
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

      {/* Pagination Footer: Toggles between "View All" and page navigation controls */}
      <div className="mt-6 flex items-center justify-center border-t border-gray-50 pt-5">
        {currentPage === 0 ? (
          // Mini-view footer
          filteredOrders.length > 5 && (
            <button
              onClick={handleViewMore}
              className="text-brand inline-flex items-center gap-1 text-sm font-bold transition-all hover:underline"
            >
              View all
            </button>
          )
        ) : (
          // Full-view pagination controls
          <div className="flex items-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
              Page {currentPage} of{' '}
              {Math.ceil(filteredOrders.length / PAGE_SIZE)}
            </span>

            <button
              disabled={currentPage * PAGE_SIZE >= filteredOrders.length}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
