import { useState, useEffect } from 'react'
import { X, CalendarCheck, Users, Check, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { checkAvailabilityAPI, confirmReservationAPI } from '../../../apis/receptionist/reservations'

const fmtTime = (dt) =>
  dt ? new Date(dt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : ''

// Chip colour by availability status. BLOCKED is a real time overlap → not selectable.
const chipClass = (status, selected) => {
  if (selected) return 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/30'
  if (status === 'BLOCKED') return 'border-gray-100 bg-gray-50 text-gray-300 line-through cursor-not-allowed'
  if (status === 'OCCUPIED') return 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 cursor-pointer'
  return 'border-green-200 bg-green-50 text-green-700 hover:border-green-300 cursor-pointer' // FREE
}

/**
 * Confirm a REQUESTED reservation: run availability for the request's slot, let the receptionist
 * pick tables (must cover the guest count), add an optional note, then CONFIRM.
 */
const ConfirmReservationModal = ({ isOpen, onClose, reservation, onConfirmed }) => {
  const [tables, setTables] = useState([])
  const [selected, setSelected] = useState([]) // list of tableNumbers
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reason, setReason] = useState(null) // set when no slot is bookable

  useEffect(() => {
    if (!isOpen || !reservation) return
    setSelected([])
    setNote('')
    setReason(null)
    setLoading(true)
    checkAvailabilityAPI({
      reservationTime: reservation.reservationTime,
      endTime: reservation.endTime,
      guestCount: reservation.guestCount,
    }).then(({ data, error }) => {
      if (error) {
        toast.error(error)
        setTables([])
      } else {
        setTables(data?.tables || [])
        setReason(data?.possible ? null : data?.reason)
      }
      setLoading(false)
    })
  }, [isOpen, reservation])

  if (!isOpen || !reservation) return null

  const toggle = (t) => {
    if (t.status === 'BLOCKED') return
    setSelected((prev) =>
      prev.includes(t.tableNumber) ? prev.filter((n) => n !== t.tableNumber) : [...prev, t.tableNumber]
    )
  }

  const seatsCovered = tables
    .filter((t) => selected.includes(t.tableNumber))
    .reduce((s, t) => s + (t.capacity || 0), 0)
  const guests = reservation.guestCount || 0
  const enough = seatsCovered >= guests

  const handleConfirm = async () => {
    if (selected.length === 0) return toast.warning('Select at least one table')
    if (!enough) return toast.warning("Selected tables can't seat all guests")
    setSubmitting(true)
    const { error } = await confirmReservationAPI(reservation.id, {
      tableNumbers: selected,
      note: note.trim() || null,
    })
    setSubmitting(false)
    if (error) return toast.error(error)
    toast.success('Reservation confirmed — customer can now pay')
    onConfirmed?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-4xl border border-gray-100 bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-purple-100 p-3 text-purple-600">
              <CalendarCheck size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Reservation</h2>
              <p className="text-sm text-gray-400">
                {reservation.customerName} · {fmtTime(reservation.reservationTime)}–{fmtTime(reservation.endTime)} ·{' '}
                {guests} guests
              </p>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-purple-500" size={28} />
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
              Assign tables (need {guests} seats)
            </p>

            {/* Table picker */}
            <div className="mb-4 flex flex-wrap gap-2">
              {tables.map((t) => (
                <button
                  key={t.tableId}
                  onClick={() => toggle(t)}
                  disabled={t.status === 'BLOCKED'}
                  title={
                    t.status === 'BLOCKED'
                      ? `Booked ${fmtTime(t.conflictStart)}–${fmtTime(t.conflictEnd)}`
                      : t.status === 'OCCUPIED'
                        ? 'Occupied now (free by this slot)'
                        : 'Free'
                  }
                  className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-sm font-bold transition-all ${chipClass(
                    t.status,
                    selected.includes(t.tableNumber)
                  )}`}
                >
                  T{t.tableNumber}
                  <span className="text-[10px] font-semibold opacity-70">({t.capacity})</span>
                  {selected.includes(t.tableNumber) && <Check size={13} />}
                </button>
              ))}
            </div>

            {reason && (
              <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-500">{reason}</p>
            )}

            {/* Seats covered */}
            <div className="mb-4 flex items-center gap-2 text-sm">
              <Users size={15} className={enough ? 'text-green-500' : 'text-gray-400'} />
              <span className={`font-bold ${enough ? 'text-green-600' : 'text-gray-500'}`}>
                {seatsCovered} / {guests} seats selected
              </span>
              {!enough && selected.length > 0 && (
                <span className="text-xs text-gray-400">— need more seats</span>
              )}
            </div>

            {/* Optional note */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Note to the customer (optional)…"
              className="mb-5 w-full resize-none rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-purple-500/20"
            />

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 cursor-pointer rounded-2xl border border-gray-200 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting || selected.length === 0 || !enough}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
              >
                {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Confirm'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ConfirmReservationModal
