import { useState, useEffect } from 'react'
import { Armchair, Clock, CookingPot, Lock, CalendarClock } from 'lucide-react'

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

  // "just now" → "1 min ago" → … climbing minute by minute (re-computed on each 30s tick).
  const agoText = (dt) => {
    if (!dt) return ''
    const mins = Math.max(0, Math.floor((now - new Date(dt).getTime()) / 60000))
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins} min ago`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m ? `${h}h ${m}m ago` : `${h}h ago`
  }

  // Re-render every 30s so "live" filtering and the overdue blink update without a manual refresh.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  const reservations = table.todayReservations || []
  const sorted = [...reservations].sort(
    (a, b) => new Date(a.reservationTime) - new Date(b.reservationTime)
  )
  const isOccupied = table.status?.toUpperCase() === 'OCCUPIED'
  const isReserved = table.status?.toUpperCase() === 'RESERVED'
  // Only reservations whose window hasn't finished yet, soonest first.
  const liveReservations = sorted.filter((r) => new Date(r.endTime).getTime() >= now)
  // A reserved table is held for its soonest live reservation ("this slot"); the rest are upcoming.
  const activeReservation = isReserved ? liveReservations[0] || null : null
  const upcomingReservations = isReserved ? liveReservations.slice(1) : liveReservations

  // Occupied-from-a-reservation: show its window; blink the border RED once the end time passes.
  const seated = isOccupied ? table.seatedReservation : null
  const seatedOverdue = seated && seated.endTime && now >= new Date(seated.endTime).getTime()

  // Reserved but the guest isn't seated and the slot has already started → they're late: blink PURPLE.
  const reservedLate =
    isReserved && activeReservation && now >= new Date(activeReservation.reservationTime).getTime()

  return (
    <div
      onClick={() => onClick(table)}
      className={`cursor-pointer rounded-3xl border-2 ${config.bg} p-5 transition-all hover:shadow-md space-y-4 ${
        seatedOverdue
          ? 'border-red-400 ring-4 ring-red-300/60 animate-pulse'
          : reservedLate
            ? 'border-purple-400 ring-4 ring-purple-300/60 animate-pulse'
            : config.border
      }`}
    >
      {/* Left: table number + upcoming reservations. Right: status badge + the locked "this slot". */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Table</p>
          <h3 className={`text-3xl font-black ${config.text}`}>{table.tableNumber}</h3>

          {upcomingReservations.length > 0 && (
            <div className="mt-2 flex flex-col gap-0.5 rounded-xl border border-purple-100 bg-purple-50/70 px-2.5 py-1.5">
              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-purple-400">
                <Clock size={9} /> Upcoming
              </span>
              {upcomingReservations.map((r) => (
                <span key={r.reservationId} className="text-[10px] font-bold text-purple-600">
                  {formatTime(r.reservationTime)} – {formatTime(r.endTime)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-tight ${config.text} bg-white/70`}>
            {isReserved
              ? <Lock size={10} />
              : <span className={`h-2 w-2 rounded-full ${config.dot}`} />}
            {config.label}
          </span>

          {isReserved && activeReservation && (
            <div className="flex flex-col items-end gap-0.5 rounded-xl border border-purple-200 bg-purple-100/70 px-2.5 py-1.5 ring-1 ring-purple-200">
              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-purple-600">
                <Lock size={9} /> {reservedLate ? 'Guest Late' : 'Reserved For'}
              </span>
              <span className="text-[10px] font-black text-purple-800">
                {formatTime(activeReservation.reservationTime)} – {formatTime(activeReservation.endTime)}
              </span>
            </div>
          )}

          {seated && (
            <div className={`flex flex-col items-end gap-0.5 rounded-xl border px-2.5 py-1.5 ${
              seatedOverdue ? 'border-red-300 bg-red-100/70 ring-1 ring-red-200' : 'border-amber-200 bg-amber-50'
            }`}>
              <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${
                seatedOverdue ? 'text-red-600' : 'text-amber-600'
              }`}>
                <CalendarClock size={9} /> {seatedOverdue ? "Time's up" : 'For Reservation'}
              </span>
              <span className={`text-[10px] font-black ${seatedOverdue ? 'text-red-700' : 'text-amber-700'}`}>
                {formatTime(seated.reservationTime)} – {formatTime(seated.endTime)}
              </span>
            </div>
          )}
        </div>
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
          <span className="ml-auto flex flex-col items-end leading-tight text-gray-400">
            <span className="flex items-center gap-1 text-[10px]">
              <Clock size={10} /> {formatTime(table.statusUpdatedAt)}
            </span>
            <span className="text-[9px] text-gray-400">{agoText(table.statusUpdatedAt)}</span>
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
                      ) : order.orderStatus === 'PREPARING' ? (
                        <span className="text-[10px] font-black uppercase text-amber-500">Preparing</span>
                      ) : (
                        <span className="text-[10px] font-black uppercase text-blue-400">Pending</span>
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
