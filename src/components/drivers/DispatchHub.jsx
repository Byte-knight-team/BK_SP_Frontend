import { User, MapPin, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

const STATUS_STYLES = {
  'Ready for Pickup': 'bg-green-50 text-green-600',
  'Cooking...': 'bg-amber-50 text-amber-600',
}

function DispatchOrderCard({ order, onAssign }) {
  return (
    <div className="border border-gray-100 rounded-2xl p-5 min-w-[280px] flex-1">
      {/* Order ID + Status */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm font-bold text-gray-900">{order.id}</span>
        <span
          className={clsx(
            'text-xs font-semibold px-2.5 py-0.5 rounded-full',
            STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-500',
          )}
        >
          {order.status}
        </span>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1.5">
        <User className="w-3.5 h-3.5 text-gray-400" />
        {order.customerName}
      </div>

      {/* Zone */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <MapPin className="w-3.5 h-3.5" />
        Zone: {order.zone} ({order.distance})
      </div>

      {/* Assign button */}
      <button
        onClick={() => onAssign(order)}
        className="inline-flex items-center gap-1.5 bg-brand text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-brand-hover transition-colors w-full justify-center"
      >
        Assign Driver <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default function DispatchHub({ orders, onAssignDriver }) {
  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xl font-bold text-gray-900">Dispatch Hub</h2>
        <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {orders.length}
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <button className="text-sm text-brand font-medium hover:underline inline-flex items-center gap-1">
          View more <span>→</span>
        </button>
      </div>
    </div>
  )
}
