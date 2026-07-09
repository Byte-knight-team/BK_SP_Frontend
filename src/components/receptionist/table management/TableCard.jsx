import { Armchair, Clock, CookingPot, Lock } from 'lucide-react'

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
  RESERVED: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    label: 'Reserved',
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

  const todayRes = table.todayReservation

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
          {table.status?.toUpperCase() === 'RESERVED'
            ? <Lock size={10} />
            : <span className={`h-2 w-2 rounded-full ${config.dot}`} />}
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

      {/* Today's reservation badge */}
      {todayRes && (
        <div className="flex items-center gap-2 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-2.5">
          <Lock size={12} className="shrink-0 text-purple-500" />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">Reserved today</p>
            <p className="truncate text-[11px] font-bold text-purple-700">
              {formatTime(todayRes.reservationTime)} – {formatTime(todayRes.endTime)}
            </p>
            <p className="truncate text-[10px] text-purple-500">{todayRes.customerName}</p>
          </div>
        </div>
      )}

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
                const isServed = order.orderStatus === 'SERVED'
                const readyCount = order.readyItemCount || 0
                return (
                  <div
                    key={idx}
                    className="rounded-xl bg-white px-3 py-2 border border-orange-100 shadow-sm"
                  >
                    {/* order number + serve state */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black text-orange-600">{order.orderNumber}</span>
                      {readyCount > 0 ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-green-600">
                          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          {readyCount === 1 ? 'Ready to serve' : `${readyCount} items ready to serve`}
                        </span>
                      ) : isServed ? (
                        <span className="text-[10px] font-black uppercase text-gray-400">Served</span>
                      ) : (
                        <span className="text-[10px] font-black uppercase text-amber-500">Preparing</span>
                      )}
                    </div>
                    {/* payment state */}
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${isPaid ? 'bg-green-500' : 'bg-amber-400'}`} />
                      <span className={`text-[10px] font-bold ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                        {isPaid ? 'Paid' : `Rs. ${Number(order.finalAmount || 0).toFixed(2)} due`}
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
