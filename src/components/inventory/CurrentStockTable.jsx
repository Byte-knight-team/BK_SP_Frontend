import { useState, useMemo, useRef } from 'react'
import {
  Search,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

const STATUS_CONFIG = {
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    className: 'bg-amber-50 text-amber-600',
  },
  good: {
    label: 'Good',
    icon: CheckCircle,
    className: 'bg-green-50 text-green-600',
  },
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.good
  const Icon = config.icon
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
        config.className,
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}

function CategoryBadge({ category }) {
  return (
    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
      {category}
    </span>
  )
}

export default function CurrentStockTable({ items }) {
  const tableRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [currentPage, setCurrentPage] = useState(0)

  const PAGE_SIZE = 8

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(items.map((item) => item.category))]
    return ['All Categories', ...cats]
  }, [items])

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Current Stock</h2>
          <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {items.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
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

          {/* Category filter */}
          <div className="relative">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer pr-4"
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
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
            <th className="text-left pb-3 font-semibold">Item Name</th>
            <th className="text-left pb-3 font-semibold">Category</th>
            <th className="text-left pb-3 font-semibold">Unit Price</th>
            <th className="text-left pb-3 font-semibold">Stock Level</th>
            <th className="text-left pb-3 font-semibold">Status</th>
            <th className="text-right pb-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {displayedItems.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
              {/* Item name + ID */}
              <td className="py-4">
                <p className="text-sm font-semibold text-gray-900">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400">ID: {item.id}</p>
              </td>

              {/* Category */}
              <td className="py-4">
                <CategoryBadge category={item.category || 'Uncategorized'} />
              </td>

              {/* Unit Price */}
              <td className="py-4 text-sm text-gray-700">
                Rs. {(item.unitPrice || 0).toFixed(2)} / {item.unit || 'Unit'}
              </td>

              {/* Stock Level */}
              <td className="py-4">
                <span className="text-sm font-bold text-gray-900">
                  {item.stockLevel}
                </span>
                <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
              </td>

              {/* Status */}
              <td className="py-4">
                <StatusBadge status={item.status} />
              </td>

              {/* Action */}
              <td className="py-4 text-right">
                <button className="inline-flex items-center gap-1.5 bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-hover transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Update Stock
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
                className="py-8 text-center text-sm text-gray-400"
              >
                No items match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Footer */}
      <div className="mt-6 flex items-center justify-center border-t border-gray-50 pt-5">
        {currentPage === 0 ? (
          filteredItems.length > 5 && (
            <button
              onClick={handleViewMore}
              className="text-sm text-brand font-bold hover:underline inline-flex items-center gap-1 transition-all"
            >
              View more <span>→</span>
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
              disabled={currentPage * PAGE_SIZE >= filteredItems.length}
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
