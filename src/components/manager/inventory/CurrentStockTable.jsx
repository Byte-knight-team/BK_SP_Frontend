import { useState, useMemo, useRef } from 'react'
import {
  Search,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'
import { Package } from 'lucide-react'

const STATUS_CONFIG = {
  warning: {
    label: 'WARNING',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  good: {
    label: 'GOOD',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.good
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

function CategoryBadge({ category }) {
  return (
    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
      {category}
    </span>
  )
}

export default function CurrentStockTable({ items = [], onUpdateItem }) {
  const safeItems = items || []
  const tableRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [currentPage, setCurrentPage] = useState(0)

  const PAGE_SIZE = 8

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(safeItems.map((item) => item.category))]
    return ['All Categories', ...cats]
  }, [safeItems])

  // Filter items
  const filteredItems = useMemo(() => {
    return safeItems.filter((item) => {
      const matchesSearch = (item.name || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === 'All Categories' ||
        item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [items, searchQuery, selectedCategory])

  // Pagination Logic
  const displayedItems = useMemo(() => {
    if (currentPage === 0) {
      return filteredItems.slice(0, 5) // Initial view: 5 items
    }
    // Paged view: 8 items per page
    const start = (currentPage - 1) * PAGE_SIZE
    const end = currentPage * PAGE_SIZE
    return filteredItems.slice(start, end)
  }, [filteredItems, currentPage])

  // Calculate padding rows to maintain static height
  const emptyRowsCount = currentPage > 0 ? PAGE_SIZE - displayedItems.length : 0

  const handleViewMore = () => {
    setCurrentPage(1)
    // Small timeout to allow the UI to update before scrolling
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div className="card" ref={tableRef}>
      {/* Header row */}
      <div className="p-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-gray-100">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Current Stock</h2>
          <span className="bg-brand rounded-full px-2.5 py-1 text-xs font-bold text-white">
            {items.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex w-56 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
            />
          </div>

          {/* Category filter */}
          <div className="relative">
            <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="cursor-pointer appearance-none bg-transparent pr-4 text-sm font-medium text-gray-700 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-400 uppercase bg-gray-50/50">
              <th className="px-6 py-4 font-semibold w-[25%] text-left">Item Name</th>
              <th className="px-6 py-4 font-semibold w-[15%] text-center">Category</th>
              <th className="px-6 py-4 font-semibold w-[20%] text-left">
                Avg. Unit Price
              </th>
              <th className="px-6 py-4 font-semibold w-[15%] text-center">
                Stock Level
              </th>
              <th className="px-6 py-4 font-semibold w-[15%] text-center">Status</th>
              <th className="px-6 py-4 font-semibold w-[10%] min-w-[120px] text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
          key={currentPage}
          className="animate-table-fade divide-y divide-gray-50"
        >
          {displayedItems.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-gray-50/50">
              {/* Item name + ID */}
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-gray-900">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400">ID: {item.id}</p>
              </td>

              {/* Category */}
              <td className="px-6 py-4 text-center">
                <CategoryBadge category={item.category || 'Uncategorized'} />
              </td>

              {/* Unit Price */}
              <td className="px-6 py-4 text-sm text-gray-700">
                Rs. {(item.unitPrice || 0).toFixed(2)} / {item.unit || 'Unit'}
              </td>

              {/* Stock Level */}
              <td className="px-6 py-4 text-center">
                <span className="text-sm font-bold text-gray-900">
                  {item.stockLevel}
                </span>
                <span className="ml-1 text-xs text-gray-400">{item.unit}</span>
              </td>

              {/* Status */}
              <td className="px-6 py-4 text-center">
                <StatusBadge status={item.status} />
              </td>

              {/* Action */}
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onUpdateItem?.(item)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors inline-flex"
                  title="Update Stock"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}

          {/* Static Height Padding: Render empty rows to prevent table from compacting */}
          {emptyRowsCount > 0 &&
            Array.from({ length: emptyRowsCount }).map((_, idx) => (
              <tr key={`empty-${idx}`} className="h-[73px]">
                <td colSpan={6}>&nbsp;</td>
              </tr>
            ))}

          {displayedItems.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="py-12 text-center text-sm text-gray-400"
              >
                No items match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-center border-t border-gray-100 p-5">
        {currentPage === 0 ? (
          filteredItems.length > 5 && (
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
              disabled={currentPage * PAGE_SIZE >= filteredItems.length}
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
