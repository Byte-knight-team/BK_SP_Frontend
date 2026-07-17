import { useMemo } from 'react'
import { Clock, Search } from 'lucide-react'
import clsx from 'clsx'

const STATUS_STYLES = {
  ASSIGNED: {
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-600',
  },
  ACCEPTED: {
    dot: 'bg-teal-500',
    badge: 'bg-teal-50 text-teal-600',
  },
  OUT_FOR_DELIVERY: {
    dot: 'bg-brand',
    badge: 'bg-brand-light text-brand',
  },
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500' }
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

export default function ActiveOrdersTable({ drivers = [] }) {
  // Filter only drivers that currently have an active task
  const activeOrders = useMemo(() => {
    return drivers
      .filter((d) => d.currentTask)
      .map((d) => ({
        orderId: d.currentTask.orderId,
        driverName: d.name,
        status: d.status,
        assignedTime: d.currentTask.assignedTime,
      }))
  }, [drivers])

  return (
    <div className="card mb-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900">Active Deliveries</h2>
        <span className="bg-blue-500 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm">
          {activeOrders.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-400 uppercase">
              <th className="w-1/4 pb-3 text-left font-semibold">Order ID</th>
              <th className="w-1/4 pb-3 text-left font-semibold">Driver</th>
              <th className="w-1/4 pb-3 text-left font-semibold">Delivery Status</th>
              <th className="w-1/4 pb-3 text-right font-semibold">Assigned At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {activeOrders.map((order, index) => (
              <tr
                key={`${order.orderId}-${index}`}
                className="transition-colors hover:bg-gray-50/50"
              >
                <td className="py-4 font-bold text-gray-900">{order.orderId}</td>
                <td className="py-4 text-sm font-semibold text-gray-700">
                  {order.driverName}
                </td>
                <td className="py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-sm font-medium text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {order.assignedTime}
                  </div>
                </td>
              </tr>
            ))}

            {activeOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-gray-200" />
                    <p>No active deliveries right now.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
