import { useState, useMemo, useRef } from 'react'
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Trash2,
  Pencil,
  History,
  Clock
} from 'lucide-react'
import clsx from 'clsx'

/**
 * Configuration for the update types, including labels and styling.
 */
const TYPE_CONFIG = {
  RESTOCK: {
    label: 'Restock',
    icon: PlusCircle,
    className: 'bg-green-50 text-green-600 border-green-100',
  },
  WASTAGE: {
    label: 'Wastage',
    icon: Trash2,
    className: 'bg-red-50 text-red-600 border-red-100',
  },
  CORRECTION: {
    label: 'Correction',
    icon: Pencil,
    className: 'bg-amber-50 text-amber-600 border-amber-100',
  },
}

/**
 * Renders a stylized badge based on the update type.
 */
function TypeBadge({ type }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.RESTOCK
  const Icon = config.icon
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border',
        config.className,
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

/**
 * Component to display the history of inventory updates in a table format.
 */
export default function InventoryUpdateLogTable({ logs = [] }) {
  const safeLogs = logs || []
  const tableRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All Types')
  const [currentPage, setCurrentPage] = useState(0)

  const PAGE_SIZE = 8

  // Derive unique types for filtering
  const types = ['All Types', 'RESTOCK', 'WASTAGE', 'CORRECTION']

  // Filter logs based on search query and selected type
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

  // Pagination Logic: Displays 5 items on the initial dashboard view, 
  // and 8 per page in the expanded view.
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
      {/* Header row with search and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-gray-200">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Inventory Update Log</h2>
            <p className="text-xs text-gray-500 font-medium">History of recent stock movements</p>
          </div>
          <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">
            {logs.length} Total
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-56 border border-transparent focus-within:border-gray-200 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
            />
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent text-sm font-semibold text-gray-700 outline-none appearance-none cursor-pointer pr-4"
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

      {/* Table Structure */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="text-left pb-3 font-bold w-[25%]">Item Name</th>
              <th className="text-left pb-3 font-bold w-[20%] pl-4">Updated At</th>
              <th className="text-center pb-3 font-bold w-[15%]">Update Type</th>
              <th className="text-left pb-3 font-bold w-[40%] pl-6">Update Note</th>
            </tr>
          </thead>
          <tbody
            key={currentPage}
            className="divide-y divide-gray-50 animate-table-fade"
          >
            {displayedLogs.map((log, idx) => (
              <tr key={`${log.itemName}-${idx}`} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-brand transition-colors">
                    {log.itemName}
                  </p>
                </td>

                <td className="py-4 pl-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-medium">{log.updatedAt}</span>
                  </div>
                </td>

                <td className="py-4 text-center">
                  <TypeBadge type={log.updateType} />
                </td>

                <td className="py-4 pl-6">
                  <p className="text-sm text-gray-600 line-clamp-1 italic font-medium">
                    "{log.notes || 'No notes provided'}"
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
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2 opacity-40 text-gray-400">
                    <History className="w-8 h-8" />
                    <p className="text-sm font-bold">No update logs found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination controls */}
      <div className="mt-6 flex items-center justify-center border-t border-gray-50 pt-5">
        {currentPage === 0 ? (
          filteredLogs.length > 5 && (
            <button
              onClick={handleViewMore}
              className="px-6 py-2 rounded-full border-2 border-gray-100 text-sm text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center gap-2 group"
            >
              View All History
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )
        ) : (
          <div className="flex items-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
              Page {currentPage} of {Math.ceil(filteredLogs.length / PAGE_SIZE)}
            </span>

            <button
              disabled={currentPage * PAGE_SIZE >= filteredLogs.length}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
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
