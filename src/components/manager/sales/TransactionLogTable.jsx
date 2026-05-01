import React, { useState, useMemo, useRef } from 'react'
import {
  Search,
  Filter,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Badge from '../ui/Badge'

export default function TransactionLogTable({ transactions = [] }) {
  const tableRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  const PAGE_SIZE = 8

  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter(
      (trx) =>
        trx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trx.customer.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [transactions, searchQuery])

  // Pagination Logic
  const displayedTransactions = useMemo(() => {
    if (currentPage === 0) {
      return filteredTransactions.slice(0, 5) // Initial view: 5 items
    }
    const start = (currentPage - 1) * PAGE_SIZE
    const end = currentPage * PAGE_SIZE
    return filteredTransactions.slice(start, end)
  }, [filteredTransactions, currentPage])

  const emptyRowsCount =
    currentPage > 0 ? PAGE_SIZE - displayedTransactions.length : 0

  const handleViewMore = () => {
    setCurrentPage(1)
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }



  return (
    <div className="card" ref={tableRef}>
      {/* Header row */}
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="bg-brand-light rounded-xl p-2.5">
            <ArrowUpRight className="text-brand h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Transaction Log</h2>
          <span className="bg-brand rounded-full px-2.5 py-1 text-xs font-bold text-white">
            {transactions.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex w-56 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-400 uppercase">
            <th className="w-[20%] pb-3 text-left font-semibold">Order ID</th>
            <th className="w-[20%] pb-3 text-left font-semibold">
              Date & Time
            </th>
            <th className="w-[20%] pb-3 text-left font-semibold">Customer</th>
            <th className="w-[15%] pb-3 text-center font-semibold">
              Payment Status
            </th>
            <th className="w-[15%] pb-3 text-right font-semibold">Amount</th>
            <th className="w-[10%] pb-3 text-center font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="animate-table-fade divide-y divide-gray-50">
          {displayedTransactions.map((trx) => (
            <tr key={trx.id} className="transition-colors hover:bg-gray-50/50">
              <td className="py-4">
                <span className="text-sm font-bold text-gray-900">
                  {trx.id}
                </span>
              </td>
              <td className="py-4">
                <span className="text-sm text-gray-500">{trx.date}</span>
              </td>
              <td className="py-4 font-semibold text-gray-800">
                {trx.customer}
              </td>
              <td className="py-4 text-center">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {trx.mode}
                </div>
              </td>
              <td className="py-4 text-right font-bold text-gray-900">
                Rs. {trx.amount.toFixed(2)}
              </td>
              <td className="py-4 text-center">
                <Badge status={trx.status.toLowerCase()} />
              </td>
            </tr>
          ))}

          {emptyRowsCount > 0 &&
            Array.from({ length: emptyRowsCount }).map((_, idx) => (
              <tr key={`empty-${idx}`} className="h-[61px]">
                <td colSpan={6}>&nbsp;</td>
              </tr>
            ))}

          {displayedTransactions.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="py-12 text-center text-sm text-gray-400"
              >
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Footer */}
      <div className="mt-6 flex items-center justify-center border-t border-gray-50 pt-5">
        {currentPage === 0 ? (
          filteredTransactions.length > 5 && (
            <button
              onClick={handleViewMore}
              className="text-brand inline-flex items-center gap-1 text-sm font-bold transition-all hover:underline"
            >
              View more
            </button>
          )
        ) : (
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
              Page {currentPage}
            </span>

            <button
              disabled={currentPage * PAGE_SIZE >= filteredTransactions.length}
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
