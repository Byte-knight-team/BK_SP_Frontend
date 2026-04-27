import React, { useState, useMemo } from 'react'
import { Search, Filter, ArrowUpRight, CreditCard, Banknote, Globe } from 'lucide-react'
import Badge from '../ui/Badge'

const PAGE_SIZE = 8

export default function TransactionLogTable({ transactions = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter(trx => 
      trx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trx.customer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [transactions, searchQuery])

  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const getPaymentIcon = (mode) => {
    switch(mode.toLowerCase()) {
      case 'credit card': return <CreditCard className="w-4 h-4" />
      case 'cash': return <Banknote className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 rounded-xl">
            <ArrowUpRight className="w-5 h-5 text-orange-500" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Transaction Log</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 w-64 border border-transparent focus-within:border-brand focus-within:bg-white transition-all shadow-inner">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Order ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-600 outline-none w-full"
            />
          </div>
          <button className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
            <Filter className="w-5 h-5" />
          </button>
          <button className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand/20 hover:bg-brand-hover transition-all">
            View All Transactions
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-400 font-bold uppercase tracking-[0.1em] border-b border-gray-50">
              <th className="px-8 py-5 text-left">Order ID</th>
              <th className="px-8 py-5 text-left">Date & Time</th>
              <th className="px-8 py-5 text-left">Customer</th>
              <th className="px-8 py-5 text-left">Mode</th>
              <th className="px-8 py-5 text-right">Amount</th>
              <th className="px-8 py-5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedTransactions.map((trx) => (
              <tr key={trx.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <span className="text-sm font-bold text-gray-900 group-hover:text-brand transition-colors">
                    {trx.id}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm text-gray-500 font-medium">{trx.date}</span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm text-gray-800 font-semibold">{trx.customer}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-100">
                    {getPaymentIcon(trx.mode)}
                    {trx.mode}
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <span className="text-sm font-black text-gray-900">
                    Rs. {trx.amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-8 py-5 text-center">
                  <Badge status={trx.status.toLowerCase()} />
                </td>
              </tr>
            ))}
            {paginatedTransactions.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                  No transactions found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-50 flex items-center justify-between px-8">
          <p className="text-sm text-gray-400 font-medium">
            Showing <span className="text-gray-900 font-bold">{(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredTransactions.length)}</span> of <span className="text-gray-900 font-bold">{filteredTransactions.length}</span> results
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-2 bg-gray-50 text-sm font-bold text-gray-600 rounded-xl disabled:opacity-30 hover:bg-gray-100 transition-all border border-gray-100"
            >
              Previous
            </button>
            <div className="flex items-center gap-1.5">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-2 bg-gray-50 text-sm font-bold text-gray-600 rounded-xl disabled:opacity-30 hover:bg-gray-100 transition-all border border-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
