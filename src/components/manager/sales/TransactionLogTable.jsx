import React, { useState, useMemo, useRef } from 'react'
import { Search, Filter, ArrowUpRight, CreditCard, Banknote, Globe, ChevronLeft, ChevronRight } from 'lucide-react'
import Badge from '../ui/Badge'

export default function TransactionLogTable({ transactions = [] }) {
  const tableRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  const PAGE_SIZE = 8

  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter(trx => 
      trx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trx.customer.toLowerCase().includes(searchQuery.toLowerCase())
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

  const emptyRowsCount = currentPage > 0 ? PAGE_SIZE - displayedTransactions.length : 0

  const handleViewMore = () => {
    setCurrentPage(1)
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const getPaymentIcon = (mode) => {
    switch(mode.toLowerCase()) {
      case 'credit card': return <CreditCard className="w-4 h-4" />
      case 'cash': return <Banknote className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  return (
    <div className="card" ref={tableRef}>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-light rounded-xl">
            <ArrowUpRight className="w-5 h-5 text-brand" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Transaction Log</h2>
          <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {transactions.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-56">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <th className="text-left pb-3 font-semibold w-[20%]">Order ID</th>
            <th className="text-left pb-3 font-semibold w-[20%]">Date & Time</th>
            <th className="text-left pb-3 font-semibold w-[20%]">Customer</th>
            <th className="text-center pb-3 font-semibold w-[15%]">Mode</th>
            <th className="text-right pb-3 font-semibold w-[15%]">Amount</th>
            <th className="text-center pb-3 font-semibold w-[10%]">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 animate-table-fade">
          {displayedTransactions.map((trx) => (
            <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="py-4">
                <span className="text-sm font-bold text-gray-900">{trx.id}</span>
              </td>
              <td className="py-4">
                <span className="text-sm text-gray-500">{trx.date}</span>
              </td>
              <td className="py-4 font-semibold text-gray-800">
                {trx.customer}
              </td>
              <td className="py-4 text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                  {getPaymentIcon(trx.mode)}
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
              <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
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
              className="text-sm text-brand font-bold hover:underline inline-flex items-center gap-1 transition-all"
            >
              View more
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
              disabled={currentPage * PAGE_SIZE >= filteredTransactions.length}
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
