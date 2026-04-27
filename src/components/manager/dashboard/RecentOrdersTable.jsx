import { useState, useMemo, useRef } from 'react'
import Badge from '../ui/Badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function RecentOrdersTable({ orders = [] }) {
  const [currentPage, setCurrentPage] = useState(0)
  const tableRef = useRef(null)
  const PAGE_SIZE = 10

  const displayedOrders = useMemo(() => {
    if (currentPage === 0) {
      return (orders || []).slice(0, 5)
    }
    const start = (currentPage - 1) * PAGE_SIZE
    const end = currentPage * PAGE_SIZE
    return (orders || []).slice(start, end)
  }, [orders, currentPage])

  const handleViewMore = () => {
    setCurrentPage(1)
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div className="card" ref={tableRef}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {orders.length}
        </span>
      </div>
      <table className="w-full text-base">
        <thead>
          <tr className="border-b border-gray-100 text-sm tracking-wider text-gray-400 uppercase">
            <th className="pb-3 text-left font-medium">Order ID</th>
            <th className="pb-3 text-left font-medium">Type</th>
            <th className="pb-3 text-left font-medium">Status</th>
            <th className="pb-3 text-center font-medium">Order Amount</th>
            <th className="pb-3 text-right font-medium">Placed On</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {displayedOrders.map((order) => (
            <tr key={order.id} className="transition-colors hover:bg-gray-50">
              <td className="py-4 font-medium text-gray-800">{order.id}</td>
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
              <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                No recent orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Footer */}
      <div className="mt-6 flex items-center justify-center border-t border-gray-50 pt-5">
        {currentPage === 0 ? (
          orders.length > 5 && (
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
              Page {currentPage}
            </span>

            <button
              disabled={currentPage * PAGE_SIZE >= orders.length}
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
