import { Monitor, ShoppingBag, Clock } from 'lucide-react'

const STATUS_BORDER = {
  PLACED:    'border-l-orange-400',
  PENDING:   'border-l-blue-400',
  PREPARING: 'border-l-blue-500',
  COMPLETED: 'border-l-green-400',
  ON_HOLD:   'border-l-red-400',
  SERVED:    'border-l-gray-300',
}

const OrderCard = ({ order, isSelected, onClick }) => {
  const isQR      = order.orderType === 'QR'
  const isCashDue = order.paymentStatus === 'PENDING'
  const border    = STATUS_BORDER[order.status] || 'border-l-gray-300'
  // Only show the time portion (e.g. "12:21 AM") since we always show today's orders
  const timeDisplay = order.placedAt?.includes(',')
    ? order.placedAt.split(', ')[1]
    : order.placedAt

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-l-4 bg-white p-4 shadow-sm transition-all hover:shadow-md ${border} ${
        isSelected
          ? 'ring-2 ring-orange-400 ring-offset-1 shadow-md'
          : 'border border-gray-100'
      }`}
    >
      {/* Top row: icon + order number + type badge */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
          {isQR ? <Monitor size={16} /> : <ShoppingBag size={16} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-bold text-gray-900">{order.orderNumber}</span>
            <span className={`shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-black uppercase tracking-tight ${
              isQR ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {isQR ? <Monitor size={10} /> : <ShoppingBag size={10} />}
              {isQR ? 'QR' : 'Pickup'}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {isQR && order.tableNumber ? `Table #${order.tableNumber}` : 'Pickup'}
          </p>
        </div>
      </div>

      {/* Bottom row: time + cash badge + amount — flex-wrap prevents overflow on narrow cards */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-1">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={10} />
          {timeDisplay}
        </span>
        <div className="flex items-center gap-2">
          {isCashDue && (
            <span className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-xs font-black text-red-500">
              CASH DUE
            </span>
          )}
          <span className="text-sm font-black text-orange-500">
            Rs. {order.finalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </button>
  )
}

export default OrderCard
