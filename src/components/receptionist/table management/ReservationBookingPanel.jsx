import { useState } from 'react'
import { X, CalendarCheck, Search, AlertTriangle, Users, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import { checkAvailabilityAPI, createReservationAPI } from '../../../apis/receptionist/reservations'
import PremiumSelect from './PremiumSelect'
import PremiumDatePicker from './PremiumDatePicker'
import TimePicker from './TimePicker'

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : ''

const ReservationBookingPanel = ({ tables = [], onClose, onSuccess }) => {
  const maxGuests = tables.length ? Math.max(...tables.map((t) => t.capacity || 0)) : 11

  const [check, setCheck] = useState({ date: '', startTime: '18:00', endTime: '20:00', guestCount: 2 })
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState(null) // { possible, reason, earliestAllowed, tables }

  const [selectedTableId, setSelectedTableId] = useState(null)
  const [reserve, setReserve] = useState({ customerName: '', customerPhone: '', notes: '' })
  const [booking, setBooking] = useState(false)
  const [bookError, setBookError] = useState(null)

  // the checked slot times, reused when booking so the booking matches what was checked
  const [checkedSlot, setCheckedSlot] = useState(null) // { reservationTime, endTime, guestCount }

  const onReserveChange = (e) => setReserve((p) => ({ ...p, [e.target.name]: e.target.value }))

  const buildSlot = () => ({
    reservationTime: `${check.date}T${check.startTime}:00`,
    endTime: `${check.date}T${check.endTime}:00`,
    guestCount: Number(check.guestCount),
  })

  const handleCheck = async (e) => {
    e.preventDefault()
    if (check.endTime <= check.startTime) {
      toast.error('End time must be after start time')
      return
    }
    setSelectedTableId(null)
    setBookError(null)
    const slot = buildSlot()
    setChecking(true)
    const { data, error } = await checkAvailabilityAPI(slot)
    setChecking(false)
    if (error) {
      toast.error(error)
      return
    }
    setResult(data)
    setCheckedSlot(slot)
  }

  const handleBook = async (e) => {
    e.preventDefault()
    if (!selectedTableId || !checkedSlot) return
    setBookError(null)
    setBooking(true)
    const { data, error } = await createReservationAPI({
      tableId: Number(selectedTableId),
      customerName: reserve.customerName,
      customerPhone: reserve.customerPhone,
      notes: reserve.notes,
      reservationTime: checkedSlot.reservationTime,
      endTime: checkedSlot.endTime,
      guestCount: checkedSlot.guestCount,
    })
    setBooking(false)
    if (error) {
      setBookError(error) // inline, under the form — not a toast
      return
    }
    toast.success(`Reservation confirmed for ${data.customerName}`)
    onSuccess?.()
    // reset the booking part, keep the panel open
    setReserve({ customerName: '', customerPhone: '', notes: '' })
    setSelectedTableId(null)
    setResult(null)
    setCheckedSlot(null)
  }

  const inputCls =
    'w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/20'

  return (
    <div className="flex h-[calc(100vh-120px)] w-[380px] shrink-0 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100">
            <CalendarCheck size={20} className="text-orange-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">Book a Table</h2>
            <p className="text-xs text-gray-400">Check availability, then reserve</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-gray-100">
          <X size={18} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* ① CHECK FORM */}
        <form onSubmit={handleCheck} className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-gray-400">Date</label>
            <PremiumDatePicker value={check.date} onChange={(v) => setCheck((p) => ({ ...p, date: v }))} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-gray-400">Start time</label>
            <TimePicker value={check.startTime} onChange={(v) => setCheck((p) => ({ ...p, startTime: v }))} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-gray-400">End time</label>
            <TimePicker value={check.endTime} onChange={(v) => setCheck((p) => ({ ...p, endTime: v }))} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-gray-400">Guests</label>
            <div className="w-32">
              <PremiumSelect
                compact
                value={check.guestCount}
                onChange={(n) => setCheck((p) => ({ ...p, guestCount: n }))}
                options={Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => ({
                  value: n,
                  label: `${n} ${n === 1 ? 'guest' : 'guests'}`,
                }))}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={checking}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-colors hover:bg-orange-600 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Search size={16} /> {checking ? 'Checking...' : 'Check Availability'}
          </button>
        </form>

        {/* ② RESULT (inline, never a toast) */}
        {result && (
          <div className="mt-5">
            {!result.possible ? (
              <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-4">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-bold text-red-600">Not available</p>
                  <p className="mt-0.5 text-xs text-red-500">{result.reason}</p>
                  {result.earliestAllowed && (
                    <p className="mt-1 text-xs text-red-400">
                      Earliest bookable: {fmtTime(result.earliestAllowed)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Matching tables
                </p>
                <div className="space-y-2">
                  {result.tables.map((t) => {
                    const isReserved = t.status === 'RESERVED'
                    const isSelected = selectedTableId === t.tableId
                    return (
                      <button
                        key={t.tableId}
                        type="button"
                        disabled={isReserved}
                        onClick={() => setSelectedTableId(t.tableId)}
                        className={`w-full rounded-2xl border p-3 text-left transition-all ${
                          isReserved
                            ? 'border-red-100 bg-red-50/60 cursor-not-allowed'
                            : isSelected
                              ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200'
                              : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-800">
                            Table {t.tableNumber} <span className="font-medium text-gray-400">· seats {t.capacity}</span>
                          </span>
                          {t.status === 'FREE' && (
                            <span className="flex items-center gap-1 text-[11px] font-black uppercase text-green-600">
                              <span className="h-2 w-2 rounded-full bg-green-500" /> Free
                            </span>
                          )}
                          {t.status === 'OCCUPIED' && (
                            <span className="flex items-center gap-1 text-[11px] font-black uppercase text-amber-500">
                              <span className="h-2 w-2 rounded-full bg-amber-400" /> Occupied
                            </span>
                          )}
                          {isReserved && (
                            <span className="flex items-center gap-1 text-[11px] font-black uppercase text-red-500">
                              <span className="h-2 w-2 rounded-full bg-red-500" /> Reserved
                            </span>
                          )}
                        </div>
                        {isReserved && (
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
                            <Clock size={10} /> Clashes with {fmtTime(t.conflictStart)}–{fmtTime(t.conflictEnd)}
                          </p>
                        )}
                        {t.status === 'OCCUPIED' && (
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
                            <Users size={10} /> Seated since {fmtTime(t.occupiedSince)} · {t.activeOrderCount} active order{t.activeOrderCount === 1 ? '' : 's'} — confirm they'll be done
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ③ RESERVE FORM (only after a table is picked) */}
        {selectedTableId && (
          <form onSubmit={handleBook} className="mt-5 space-y-3 border-t border-gray-100 pt-5">
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Guest details</p>
            <input
              name="customerName"
              value={reserve.customerName}
              onChange={onReserveChange}
              placeholder="Customer name"
              required
              className={inputCls}
            />
            <input
              name="customerPhone"
              value={reserve.customerPhone}
              onChange={onReserveChange}
              placeholder="Phone number"
              required
              className={inputCls}
            />
            <textarea
              name="notes"
              value={reserve.notes}
              onChange={onReserveChange}
              placeholder="Notes (optional)"
              rows={2}
              className={`${inputCls} resize-none`}
            />

            {bookError && (
              <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-3">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-500" />
                <p className="text-xs font-semibold text-red-600">{bookError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={booking}
              className="w-full rounded-2xl bg-green-500 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition-colors hover:bg-green-600 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {booking ? 'Booking...' : 'Book Table'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ReservationBookingPanel
