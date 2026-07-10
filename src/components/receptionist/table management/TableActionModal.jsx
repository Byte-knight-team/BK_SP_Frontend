import { useState, useEffect } from 'react'
import { X, LogOut, ChevronUp, ChevronDown, LayoutGrid, ClipboardList, Loader2, Lock, CalendarDays, Phone, Clock, XCircle } from 'lucide-react'
import { occupyTableAPI, clearTableAPI } from '../../../apis/receptionist/tables'
import { getTableReservationAPI, cancelReservationAPI } from '../../../apis/receptionist/reservations'
import { toast } from 'react-toastify'

const TableActionModal = ({ isOpen, onClose, table, onUpdate }) => {
  const [guestCount, setGuestCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [reservation, setReservation] = useState(null)
  const [showCancelSection, setShowCancelSection] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    if (table) {
      setGuestCount(table.currentGuestCount > 0 ? table.currentGuestCount : 1)
    }
    setShowCancelSection(false)
    setCancelReason('')
    setReservation(null)
  }, [table, isOpen])

  useEffect(() => {
    if (!isOpen || !table) return
    getTableReservationAPI(table.id).then(({ data }) => {
      setReservation(data || null)
    })
  }, [isOpen, table])

  if (!isOpen || !table) return null

  const isReserved = table.status === 'RESERVED'
  const isAvailable = table.status === 'AVAILABLE'
  const isOccupied = table.status === 'OCCUPIED'

  const formatTime = (dt) => {
    if (!dt) return ''
    return new Date(dt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const handleAction = async (actionType) => {
    setLoading(true)
    let response
    if (actionType === 'OCCUPY') response = await occupyTableAPI(table.id, guestCount)
    if (actionType === 'CLEAR') response = await clearTableAPI(table.id)
    setLoading(false)
    if (response?.error) {
      toast.error(response.error)
    } else {
      toast.success('Table status updated!')
      onUpdate()
      onClose()
    }
  }

  const handleCancelReservation = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please enter a reason')
      return
    }
    setCancelLoading(true)
    const { error } = await cancelReservationAPI(reservation.id, cancelReason.trim())
    setCancelLoading(false)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Reservation cancelled')
      setReservation(null)
      setShowCancelSection(false)
      setCancelReason('')
      onUpdate()
    }
  }

  const getTitle = () => {
    if (isReserved) return `Reserved — Table ${table.tableNumber}`
    if (isAvailable) return `Seating Table ${table.tableNumber}`
    if (isOccupied) return `Manage Table ${table.tableNumber}`
    return `Table ${table.tableNumber}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-4xl bg-white p-8 shadow-2xl">

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

        {/* Reservation section — shown whenever this table has any upcoming reservation */}
        {reservation && !showCancelSection && (
          <div className="mb-5 rounded-2xl border border-purple-100 bg-purple-50 p-4 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">Reservation</p>
            <p className="text-sm font-bold text-purple-800">{reservation.customerName}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-600">
              <Phone size={11} /> {reservation.customerPhone}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-600">
              <Clock size={11} />
              {formatTime(reservation.reservationTime)} – {formatTime(reservation.endTime)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-600">
              <CalendarDays size={11} />
              {new Date(reservation.reservationTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <button
              onClick={() => setShowCancelSection(true)}
              className="mt-1 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-red-500 hover:text-red-700"
            >
              <XCircle size={12} /> Cancel Reservation
            </button>
          </div>
        )}

        {/* Cancel reason input */}
        {showCancelSection && (
          <div className="mb-5 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Cancel Reservation</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              rows={3}
              className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-red-300/30 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelSection(false)}
                className="flex-1 rounded-2xl border border-gray-200 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleCancelReservation}
                disabled={cancelLoading}
                className="flex-1 rounded-2xl bg-red-500 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {cancelLoading ? <Loader2 className="mx-auto animate-spin" size={14} /> : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Guest count — available, reserved, or occupied */}
        {!showCancelSection && (isAvailable || isReserved || isOccupied) && (
          <div className="mb-5">
            <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-gray-400">Number of Guests</label>
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
              <button
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                className="rounded-xl bg-white p-2 shadow-sm active:scale-90"
              >
                <ChevronDown size={20} />
              </button>
              <span className="text-3xl font-black text-gray-800">{guestCount}</span>
              <button
                onClick={() => setGuestCount(Math.min(table.capacity, guestCount + 1))}
                className="rounded-xl bg-white p-2 shadow-sm active:scale-90"
              >
                <ChevronUp size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Active orders — occupied only */}
        {isOccupied && table.activeOrders && table.activeOrders.length > 0 && (
          <div className="mb-5 rounded-2xl bg-orange-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
              <ClipboardList size={14} /> Active Orders
            </div>
            <div className="flex flex-col gap-1.5">
              {table.activeOrders.map((o, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-white px-3 py-1.5 text-[11px]">
                  <span className="font-black text-orange-600">{o.orderNumber}</span>
                  {o.contactName && <span className="text-gray-400">{o.contactName}</span>}
                  <div className="flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${o.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-orange-400'}`} />
                    <span className={`font-bold ${o.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-500'}`}>
                      {o.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!showCancelSection && (
          <div className="space-y-3">
            {(isAvailable || isReserved) && (
              <button
                onClick={() => handleAction('OCCUPY')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'CONFIRM SEATING'}
              </button>
            )}
            {isOccupied && (
              <>
                <button
                  onClick={() => handleAction('OCCUPY')}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'UPDATE GUEST COUNT'}
                </button>
                <button
                  onClick={() => handleAction('CLEAR')}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 py-4 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <><LogOut size={18} /> CLEAR TABLE</>}
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default TableActionModal
