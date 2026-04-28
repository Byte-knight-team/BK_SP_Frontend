import { useState, useMemo } from 'react'
import { Clock, Search, SlidersHorizontal } from 'lucide-react'
import clsx from 'clsx'

const FILTER_OPTIONS = [
  'All',
  'Available',
  'ASSIGNED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'Offline',
]

const STATUS_STYLES = {
  Available: {
    dot: 'bg-green-500',
    badge: 'bg-green-50 text-green-600',
  },
  ASSIGNED: {
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-600',
  },
  OUT_FOR_DELIVERY: {
    dot: 'bg-brand',
    badge: 'bg-brand-light text-brand',
  },
  DELIVERED: {
    dot: 'bg-purple-500',
    badge: 'bg-purple-50 text-purple-600',
  },
  Offline: {
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-500',
  },
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Offline
  
  // Format the status string (e.g., OUT_FOR_DELIVERY -> OUT FOR DELIVERY)
  const displayStatus = status.replace(/_/g, ' ')

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        style.badge,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', style.dot)} />
      {displayStatus}
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
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            Driver Status Board
          </h2>
          <span className="bg-brand rounded-full px-2.5 py-1 text-xs font-bold text-white">
            {drivers.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex w-56 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="cursor-pointer appearance-none bg-transparent pr-4 text-sm font-medium text-gray-700 outline-none"
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
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-400 uppercase">
            <th className="w-1/4 pb-3 text-left font-semibold">Driver</th>
            <th className="w-1/4 pb-3 text-left font-semibold">Status</th>
            <th className="w-1/4 pb-3 text-center font-semibold">Assigned Time</th>
            <th className="w-1/4 pb-3 text-right font-semibold">Current Task</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filteredDrivers.map((driver) => (
            <tr
              key={driver.id}
              className="transition-colors hover:bg-gray-50/50"
            >
              {/* Driver info */}
              <td className="py-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {driver.name}
                  </p>
                </div>
              </td>

              {/* Status */}
              <td className="py-4">
                <StatusBadge status={driver.status} />
              </td>

              {/* Assigned Time */}
              <td className="py-4 text-center">
                {driver.currentTask ? (
                  <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {driver.currentTask.assignedTime}
                  </div>
                ) : (
                  <span className="text-xs text-gray-300 italic">No active assignments</span>
                )}
              </td>

              {/* Current task */}
              <td className="py-4 text-right">
                {driver.currentTask ? (
                  <p className="text-sm font-bold text-brand">
                    {driver.currentTask.orderId}
                  </p>
                ) : (
                  <span className="text-xs text-gray-300 italic">No active assignments</span>
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
        <button className="text-brand inline-flex items-center gap-1 text-sm font-medium hover:underline">
          View more
        </button>
      </div>
    </div>
  )
}
