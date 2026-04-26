import { useState, useMemo } from 'react'
import { Star, Clock, Search, SlidersHorizontal } from 'lucide-react'
import clsx from 'clsx'

const FILTER_OPTIONS = [
  'All',
  'Available',
  'Delivering',
  'Returning',
  'Offline',
]

const STATUS_STYLES = {
  Available: {
    dot: 'bg-green-500',
    badge: 'bg-green-50 text-green-600',
  },
  Delivering: {
    dot: 'bg-brand',
    badge: 'bg-brand-light text-brand',
  },
  Returning: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-600',
  },
  Offline: {
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-500',
  },
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Offline
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
        style.badge,
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', style.dot)} />
      {status}
    </span>
  )
}

export default function DriverStatusBoard({ drivers }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchesFilter = activeFilter === 'All' || d.status === activeFilter
      const matchesSearch = d.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [drivers, activeFilter, searchQuery])

  return (
    <div className="card">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            Driver Status Board
          </h2>
          <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {drivers.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-56">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 outline-none appearance-none cursor-pointer pr-4"
              >
                {FILTER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
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
            <th className="text-left pb-3 font-semibold">Driver</th>
            <th className="text-left pb-3 font-semibold">Status</th>
            <th className="text-right pb-3 font-semibold">Current Task</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filteredDrivers.map((driver) => (
            <tr
              key={driver.id}
              className="hover:bg-gray-50/50 transition-colors"
            >
              {/* Driver info */}
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={driver.avatar}
                    alt={driver.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {driver.name}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {driver.rating}
                    </div>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="py-4">
                <StatusBadge status={driver.status} />
              </td>

              {/* Current task */}
              <td className="py-4 text-right">
                {driver.currentTask ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {driver.currentTask.orderId}
                    </p>
                    <div className="flex items-center gap-1 justify-end text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {driver.currentTask.eta}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">
                    No active order
                  </span>
                )}
              </td>
            </tr>
          ))}

          {filteredDrivers.length === 0 && (
            <tr>
              <td
                colSpan={3}
                className="py-8 text-center text-sm text-gray-400"
              >
                No drivers match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* View more */}
      <div className="mt-4 text-center">
        <button className="text-sm text-brand font-medium hover:underline inline-flex items-center gap-1">
          View more <span>→</span>
        </button>
      </div>
    </div>
  )
}
