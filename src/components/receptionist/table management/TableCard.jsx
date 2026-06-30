import { Users, Armchair, Clock, CookingPot } from 'lucide-react'

const STATUS_CONFIG = {
  AVAILABLE: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    dot: 'bg-green-500',
    label: 'Available',
  },
  OCCUPIED: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-500',
    label: 'Occupied',
  },
}

const TableCard = ({ table, onClick }) => {
  const config = STATUS_CONFIG[table.status?.toUpperCase()] || {
    bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700',
    dot: 'bg-gray-400', label: 'Unknown',
  }

  const formatTime = (dt) => {
    if (!dt) return null
    return new Date(dt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  return (
    <div
      onClick={() => onClick(table)}
      className={`cursor-pointer rounded-3xl border-2 ${config.border} ${config.bg} p-5 transition-all hover:shadow-md space-y-4`}
    >
      {/* Table number + status badge */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Table</p>
          <h3 className={`text-3xl font-black ${config.text}`}>{table.tableNumber}</h3>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-tight ${config.text} bg-white/70`}>
          <span className={`h-2 w-2 rounded-full ${config.dot}`} />
          {config.label}
        </span>
      </div>

      {/* Guest count / capacity */}
      <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3">
        <Armchair size={16} className="text-gray-400" />
        <span className="text-sm font-black text-gray-700">
          {table.currentGuestCount}
          <span className="font-medium text-gray-400"> / {table.capacity}</span>
        </span>
        <span className="ml-1 text-xs text-gray-400">guests</span>
        {table.status === 'OCCUPIED' && table.statusUpdatedAt && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-400">
            <Clock size={10} /> {formatTime(table.statusUpdatedAt)}
          </span>
        )}
      </div>

      {/* Active orders */}
      <div>
        {table.activeOrders && table.activeOrders.length > 0 ? (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-500">
              <CookingPot size={12} />
              Active Orders
            </div>
            <div className="flex flex-col gap-2">
              {table.activeOrders.map((order, idx) => {
                const isPaid = order.paymentStatus === 'PAID'
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-1.5 border border-orange-100 shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-orange-600">{order.orderNumber}</span>
                      {order.contactName && (
                        <span className="text-[10px] text-gray-400">{order.contactName}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${isPaid ? 'bg-green-500' : 'bg-orange-400'}`} />
                      <span className={`text-[10px] font-black uppercase ${isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                        {isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs italic text-gray-300">No active orders</p>
        )}
      </div>
    </div>
  )
}

export default TableCard
