import { useState, useEffect } from 'react'
import { X, LogOut, ChevronUp, ChevronDown, LayoutGrid, ClipboardList, Loader2, Lock, Phone, Clock, CalendarClock, XCircle } from 'lucide-react'
import { occupyTableAPI, updateGuestCountAPI, clearTableAPI } from '../../../apis/receptionist/tables'
import { seatReservationAPI, cancelReservationAPI } from '../../../apis/receptionist/reservations'
import { toast } from 'react-toastify'

const TableActionModal = ({ isOpen, onClose, table, onUpdate }) => {
  const [guestCount, setGuestCount] = useState(1)
  const [loadingAction, setLoadingAction] = useState(null) // which action is running: OCCUPY | UPDATE_GUESTS | CLEAR | SEAT
  const [reservations, setReservations] = useState([])
  const [cancelTargetId, setCancelTargetId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    if (table) {
      setGuestCount(table.currentGuestCount > 0 ? table.currentGuestCount : 1)
      setReservations(table.todayReservations || [])
    }
    setCancelTargetId(null)
    setCancelReason('')
  }, [table, isOpen])

  if (!isOpen || !table) return null

  const isReserved = table.status === 'RESERVED'
  const isAvailable = table.status === 'AVAILABLE'
  const isOccupied = table.status === 'OCCUPIED'

  const formatTime = (dt) => {
    if (!dt) return ''
    return new Date(dt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  // Reservations ordered by time. The table auto-locks within 15 min of the soonest one,
  // so THAT reservation is the slot the table is currently reserved for (the "active" slot);
  // everything after it is just upcoming later today.
  const sortedReservations = [...reservations].sort(
    (a, b) => new Date(a.reservationTime) - new Date(b.reservationTime)
  )
  const now = Date.now()
  // Only reservations whose window hasn't finished yet, soonest first. The soonest live one is
  // the slot the table is currently held for; anything after it is upcoming.
  const liveReservations = sortedReservations.filter((r) => new Date(r.endTime).getTime() >= now)
  const activeReservation = liveReservations[0] || null
  const upcomingReservations = liveReservations.slice(1)

  // A table can only be cleared once every active order is served AND paid.
  // (Held orders aren't in activeOrders — they're excluded, same as the backend rule.)
  const canClear = (table.activeOrders || []).every(
    (o) => o.orderStatus === 'SERVED' && o.paymentStatus === 'PAID'
  )

  const hasOrders = isOccupied && (table.activeOrders?.length || 0) > 0
  const hasReservations = liveReservations.length > 0
  const showBoth = hasOrders && hasReservations

  const handleAction = async (actionType) => {
    setLoadingAction(actionType)
    let response
    if (actionType === 'OCCUPY') response = await occupyTableAPI(table.id, guestCount)
    if (actionType === 'UPDATE_GUESTS') response = await updateGuestCountAPI(table.id, guestCount)
    if (actionType === 'CLEAR') response = await clearTableAPI(table.id)
    setLoadingAction(null)
    if (response?.error) {
      toast.error(response.error)
    } else {
      toast.success('Table status updated!')
      onUpdate()
      onClose()
    }
  }

  const handleSeatReservation = async () => {
    if (!activeReservation) return
    setLoadingAction('SEAT')
    const { error } = await seatReservationAPI(activeReservation.reservationId, guestCount)
    setLoadingAction(null)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Reservation seated!')
      onUpdate()
      onClose()
    }
  }

  const handleCancelReservation = async (reservationId) => {
    if (!cancelReason.trim()) {
      toast.error('Please enter a reason')
      return
    }
    setCancelLoading(true)
    const { error } = await cancelReservationAPI(reservationId, cancelReason.trim())
    setCancelLoading(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Reservation cancelled')
    // Drop it locally; onUpdate refreshes the grid (backend frees the table if it was the locked slot).
    setReservations((prev) => prev.filter((r) => r.reservationId !== reservationId))
    setCancelTargetId(null)
    setCancelReason('')
    onUpdate()
  }

  const getTitle = () => {
    if (isReserved) return `Reserved — Table ${table.tableNumber}`
    if (isAvailable) return `Seating Table ${table.tableNumber}`
    if (isOccupied) return `Manage Table ${table.tableNumber}`
    return `Table ${table.tableNumber}`
  }

  // ---- Reusable content blocks -------------------------------------------

  const reservationCard = (r, highlight = false) => (
    <div
      key={r.reservationId}
      className={`space-y-2 rounded-xl border p-4 ${
        highlight ? 'border-purple-300 bg-purple-50 ring-2 ring-purple-200' : 'border-purple-100 bg-purple-50'
      }`}
    >
      <p className="text-sm font-bold text-purple-800">{r.customerName}</p>
      <div className="flex items-center gap-1.5 text-[11px] text-purple-600">
        <Phone size={11} /> {r.customerPhone}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-purple-600">
        <Clock size={11} /> {formatTime(r.reservationTime)} – {formatTime(r.endTime)}
      </div>

      {cancelTargetId === r.reservationId ? (
        <div className="space-y-2 pt-1">
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation..."
            rows={2}
            className="w-full resize-none rounded-xl bg-white px-3 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-red-300/30"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setCancelTargetId(null); setCancelReason('') }}
              className="flex-1 rounded-xl border border-gray-200 bg-white py-2 text-xs font-bold text-gray-500 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => handleCancelReservation(r.reservationId)}
              disabled={cancelLoading}
              className="flex-1 rounded-xl bg-red-500 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {cancelLoading ? <Loader2 className="mx-auto animate-spin" size={14} /> : 'Confirm Cancel'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setCancelTargetId(r.reservationId); setCancelReason('') }}
          className="flex items-center gap-1.5 pt-0.5 text-[11px] font-black uppercase tracking-wide text-red-500 hover:text-red-700"
        >
          <XCircle size={12} /> Cancel Reservation
        </button>
      )}
    </div>
  )

  const ordersBlock = hasOrders && (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-500">
        <ClipboardList size={12} /> Active Orders
      </p>
      <div className="flex flex-col gap-2">
        {table.activeOrders.map((o, idx) => {
          const isPaid = o.paymentStatus === 'PAID'
          const isServed = o.orderStatus === 'SERVED'
          const readyCount = o.readyItemCount || 0
          return (
            <div key={idx} className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2.5 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-orange-600">{o.orderNumber}</span>
                {readyCount > 0 ? (
                  <span className="flex items-center gap-1 font-black uppercase text-green-600">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    {readyCount === 1 ? 'Ready to serve' : `${readyCount} ready to serve`}
                  </span>
                ) : isServed ? (
                  <span className="font-black uppercase text-gray-400">Served</span>
                ) : o.orderStatus === 'PREPARING' ? (
                  <span className="font-black uppercase text-amber-500">Preparing</span>
                ) : (
                  <span className="font-black uppercase text-blue-400">Pending</span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${isPaid ? 'bg-green-500' : 'bg-amber-400'}`} />
                <span className={`font-bold ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                  {isPaid ? 'Paid' : `Rs. ${Number(o.finalAmount || 0).toFixed(2)} due`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // Generic "today's reservations" list — used for OCCUPIED tables that also have bookings later today.
  const reservationsBlock = hasReservations && (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-500">
        <CalendarClock size={12} /> Today's Reservations
      </p>
      <div className="flex flex-col gap-2">{liveReservations.map((r) => reservationCard(r))}</div>
    </div>
  )

  // ---- Render ------------------------------------------------------------

  // Reserved tables get their own split: the slot the table is locked for vs. the rest of today.
  const useWideModal = showBoth || (isReserved && upcomingReservations.length > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className={`w-full rounded-4xl bg-white p-8 shadow-2xl ${useWideModal ? 'max-w-2xl' : 'max-w-sm'}`}>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className={`rounded-2xl p-3 ${isReserved ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
            {isReserved ? <Lock size={24} /> : <LayoutGrid size={24} />}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-900">{getTitle()}</h3>
        <div className="mb-5 mt-4 h-px w-full bg-gray-100" />

        {/* Reserved table: left = upcoming today, right = the slot this table is reserved for */}
        {isReserved ? (
          upcomingReservations.length > 0 ? (
            <div className="mb-5 grid grid-cols-2 gap-5">
              <div className="space-y-3">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <CalendarClock size={12} /> Upcoming Today
                </p>
                <div className="flex flex-col gap-2">{upcomingReservations.map((r) => reservationCard(r))}</div>
              </div>
              <div className="space-y-3">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-500">
                  <Lock size={12} /> Reserved For This Slot
                </p>
                {activeReservation && reservationCard(activeReservation, true)}
              </div>
            </div>
          ) : (
            <div className="mb-5 space-y-3">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-500">
                <Lock size={12} /> Reserved For This Slot
              </p>
              {activeReservation && reservationCard(activeReservation, true)}
            </div>
          )
        ) : showBoth ? (
          <div className="mb-5 grid grid-cols-2 gap-5">
            <div>{ordersBlock}</div>
            <div>{reservationsBlock}</div>
          </div>
        ) : (
          (hasOrders || hasReservations) && (
            <div className="mb-5">
              {ordersBlock}
              {reservationsBlock}
            </div>
          )
        )}

        {/* Guest count — available, reserved, or occupied */}
        {(isAvailable || isReserved || isOccupied) && (
          <div className="mb-5">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Number of Guests</label>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Max {table.capacity}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
              <button
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="rounded-xl bg-white p-2 shadow-sm active:scale-90"
              >
                <ChevronDown size={20} />
              </button>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-800">{guestCount}</span>
                <span className="text-sm font-bold text-gray-400">/ {table.capacity}</span>
              </div>
              <button
                onClick={() => setGuestCount(Math.min(table.capacity, guestCount + 1))}
                disabled={guestCount >= table.capacity}
                className="rounded-xl bg-white p-2 shadow-sm active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <ChevronUp size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {isAvailable && (
            <button
              onClick={() => handleAction('OCCUPY')}
              disabled={!!loadingAction}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-50"
            >
              {loadingAction === 'OCCUPY' ? <Loader2 className="animate-spin" size={18} /> : 'CONFIRM SEATING'}
            </button>
          )}
          {isReserved && (
            <>
              <button
                onClick={handleSeatReservation}
                disabled={!!loadingAction || !activeReservation}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 py-4 text-sm font-bold text-white shadow-lg shadow-green-500/30 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingAction === 'SEAT' ? <Loader2 className="animate-spin" size={18} /> : 'SEAT THIS RESERVATION'}
              </button>
              {activeReservation && (
                <p className="text-center text-[11px] font-semibold text-gray-400">
                  Seating {activeReservation.customerName} · {formatTime(activeReservation.reservationTime)} – {formatTime(activeReservation.endTime)}
                </p>
              )}
            </>
          )}
          {isOccupied && (
            <>
              <button
                onClick={() => handleAction('UPDATE_GUESTS')}
                disabled={!!loadingAction}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50"
              >
                {loadingAction === 'UPDATE_GUESTS' ? <Loader2 className="animate-spin" size={18} /> : 'UPDATE GUEST COUNT'}
              </button>
              <button
                onClick={() => handleAction('CLEAR')}
                disabled={!!loadingAction || !canClear}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 py-4 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
              >
                {loadingAction === 'CLEAR' ? <Loader2 className="animate-spin" size={18} /> : <><LogOut size={18} /> CLEAR TABLE</>}
              </button>
              {!canClear && (
                <p className="text-center text-[11px] font-semibold text-gray-400">
                  Serve and collect payment for all orders before clearing.
                </p>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}

export default TableActionModal
