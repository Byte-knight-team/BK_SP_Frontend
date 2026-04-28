import { User, MapPin, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

const STATUS_STYLES = {
  'Ready for Pickup': 'bg-green-50 text-green-600',
  'Cooking...': 'bg-amber-50 text-amber-600',
}

function DispatchOrderCard({ order, onAssign }) {
  return (
    <div className="min-w-[280px] flex-1 rounded-2xl border border-gray-100 p-5">
      {/* Order ID + Status */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-sm font-bold text-gray-900">{order.id}</span>
        <span
          className={clsx(
            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
            STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-500',
          )}
        >
          {order.status}
        </span>
      </div>

      {/* Customer */}
      <div className="mb-1.5 flex items-center gap-2 text-sm text-gray-600">
        <User className="h-3.5 w-3.5 text-gray-400" />
        {order.customerName}
      </div>

      {/* Zone */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
        <MapPin className="h-3.5 w-3.5" />
        {order.zone}
      </div>

      {/* Assign button */}
      <button
        onClick={() => onAssign(order)}
        className="bg-brand hover:bg-brand-hover inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
      >
        Assign Driver <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export default function DispatchHub({ orders, onAssignDriver }) {
  return (
    <div className="card">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900">Dispatch Hub</h2>
        <span className="bg-brand rounded-full px-2.5 py-1 text-xs font-bold text-white">
          {orders.length}
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <DispatchOrderCard
            key={order.id}
            order={order}
            onAssign={onAssignDriver}
          />
        ))}
      </div>

      {/* View more */}
      <div className="mt-5 text-center">
        <button className="text-brand inline-flex items-center gap-1 text-sm font-medium hover:underline">
          View more
        </button>
      </div>
    </div>
  )
}
