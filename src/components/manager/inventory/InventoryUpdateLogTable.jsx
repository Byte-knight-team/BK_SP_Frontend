import { useState, useMemo, useRef } from 'react'
import {
  Search,
  SlidersHorizontal,
  PlusCircle,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'
import { History } from 'lucide-react'
import LogDetailModal from './LogDetailModal'

/**
 * Configuration for update type badges to match the Status badges in the stock table.
 */
const TYPE_CONFIG = {
  RESTOCK: {
    label: 'RESTOCK',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
  WASTAGE: {
    label: 'WASTAGE',
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
  CORRECTION: {
    label: 'CORRECTION',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
}

/**
 * stylized badge component for update types.
 */
function TypeBadge({ type }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.RESTOCK
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide',
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}

/**
 * Inventory Update Log Table component.
 * Designed to be visually identical to the Current Stock table.
 */
export default function InventoryUpdateLogTable({ logs = [] }) {
  const safeLogs = logs || []
  const tableRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All Types')
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedLog, setSelectedLog] = useState(null)

  const PAGE_SIZE = 8

  const types = ['All Types', 'RESTOCK', 'WASTAGE', 'CORRECTION']

  const filteredLogs = useMemo(() => {
    return safeLogs.filter((log) => {
      const matchesSearch = (log.itemName || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesType =
        selectedType === 'All Types' || log.updateType === selectedType
      return matchesSearch && matchesType
    })
  }, [logs, searchQuery, selectedType])

  const displayedLogs = useMemo(() => {
    if (currentPage === 0) {
      return filteredLogs.slice(0, 5) 
    }
    const start = (currentPage - 1) * PAGE_SIZE
    const end = currentPage * PAGE_SIZE
    return filteredLogs.slice(start, end)
  }, [filteredLogs, currentPage])

  const emptyRowsCount = currentPage > 0 ? PAGE_SIZE - displayedLogs.length : 0

  const handleViewMore = () => {
    setCurrentPage(1)
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div className="card" ref={tableRef}>
      {/* Header row - Matches CurrentStockTable */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-bold text-gray-900">Inventory Update Log</h2>
          <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {logs.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-56">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer pr-4"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type === 'All Types' ? type : TYPE_CONFIG[type]?.label || type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table - Matches CurrentStockTable structure */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-400 uppercase bg-gray-50/50">
              <th className="px-6 py-4 text-left font-semibold w-[25%]">Item Name</th>
              <th className="px-6 py-4 text-left font-semibold w-[20%]">Updated At</th>
              <th className="px-6 py-4 text-center font-semibold w-[15%]">Update Type</th>
              <th className="px-6 py-4 text-left font-semibold w-[40%]">Update Note</th>
            </tr>
          </thead>
          <tbody
          key={currentPage}
          className="divide-y divide-gray-50 animate-table-fade"
        >
          {displayedLogs.map((log, idx) => (
            <tr
              key={`${log.itemName}-${idx}`}
              className="hover:bg-gray-50/50 transition-colors cursor-pointer"
              onClick={() => setSelectedLog(log)}
            >
              {/* Item Name + ID (Matches screenshot style) */}
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-gray-900">
                  {log.itemName}
                </p>
                <p className="text-xs text-gray-400">Activity Log</p>
              </td>

              {/* Updated At */}
              <td className="px-6 py-4 text-sm text-gray-700">
                {log.updatedAt}
              </td>

              {/* Update Type Badge */}
              <td className="px-6 py-4 text-center">
                <TypeBadge type={log.updateType} />
              </td>

              {/* Note */}
              <td className="px-6 py-4 text-sm text-gray-700">
                <p className="line-clamp-1 italic">
                  {log.notes || 'No notes provided'}
                </p>
              </td>
            </tr>
          ))}

          {/* Static Height Padding rows */}
          {emptyRowsCount > 0 &&
            Array.from({ length: emptyRowsCount }).map((_, idx) => (
              <tr key={`empty-${idx}`} className="h-[73px]">
                <td colSpan={4}>&nbsp;</td>
              </tr>
            ))}

          {displayedLogs.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="py-12 text-center text-sm text-gray-400"
              >
                No history matches your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {/* Pagination Footer - Matches CurrentStockTable style */}
      <div className="flex items-center justify-center border-t border-gray-100 p-5">
        {currentPage === 0 ? (
          filteredLogs.length > 5 && (
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
              disabled={currentPage * PAGE_SIZE >= filteredLogs.length}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Log Detail Popup Modal */}
      <LogDetailModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  )
}
