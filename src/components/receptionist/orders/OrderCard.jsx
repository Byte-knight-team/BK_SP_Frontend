import { Clock, Monitor, ShoppingBag } from 'lucide-react'

const STATUS_STYLES = {
  PLACED:    'bg-blue-50 text-blue-500 border border-blue-100',
  PENDING:   'bg-orange-50 text-orange-500 border border-orange-100',
  PREPARING: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
  COMPLETED: 'bg-green-50 text-green-600 border border-green-100',
  ON_HOLD:   'bg-red-50 text-red-500 border border-red-100',
  SERVED:    'bg-gray-100 text-gray-500 border border-gray-200',
}

const OrderCard = ({ order, isSelected, onClick }) => {
  const isQR = order.orderType === 'QR'
  const isCashDue = order.paymentStatus === 'PENDING'

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
        isSelected
          ? 'border-orange-300 bg-orange-50 shadow-md'
          : 'border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm'
      }`}
    >
      {/* Top row: order number + type badge */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-gray-900">{order.orderNumber}</span>
        <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-tight ${
          isQR
            ? 'bg-purple-50 text-purple-600 border border-purple-100'
            : 'bg-blue-50 text-blue-600 border border-blue-100'
        }`}>
          {isQR ? <Monitor size={10} /> : <ShoppingBag size={10} />}
          {isQR ? 'QR' : 'Pickup'}
        </div>
      </div>

      {/* Customer + table/pickup */}
      <p className="text-xs font-semibold text-gray-700 truncate">{order.customerName}</p>
      <p className="text-xs text-gray-400">
        {isQR ? `Table ${order.tableNumber}` : 'Online Pickup'}
      </p>

      {/* Bottom row: time + payment + item count */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <Clock size={11} />
          <span>{order.placedAt}</span>
        </div>
        <div className="flex items-center gap-2">
          {isCashDue && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-black text-red-500 border border-red-100">
              CASH DUE
            </span>
          )}
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight ${
            STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-400'
          }`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="mt-2 text-right text-sm font-black text-orange-600">
        Rs. {order.finalAmount.toFixed(2)}
      </div>
    </div>
  )
}

export default OrderCard
