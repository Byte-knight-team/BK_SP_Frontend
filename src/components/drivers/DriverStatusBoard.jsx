import { useState, useMemo } from 'react'
import { Users, Star, Clock } from 'lucide-react'
import clsx from 'clsx'

const FILTER_TABS = ['All', 'Available', 'Delivering', 'Returning', 'Offline']

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

  const filteredDrivers = useMemo(() => {
    if (activeFilter === 'All') return drivers
    return drivers.filter((d) => d.status === activeFilter)
  }, [drivers, activeFilter])

  return (
    <div className="card flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Users className="w-5 h-5 text-gray-700" />
        <h2 className="text-xl font-bold text-gray-900">Driver Status Board</h2>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={clsx(
              'text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors',
              activeFilter === tab
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-y-auto max-h-[360px]">
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
                <td className="py-3">
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
                <td className="py-3">
                  <StatusBadge status={driver.status} />
                </td>

                {/* Current task */}
                <td className="py-3 text-right">
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
                  No drivers match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
