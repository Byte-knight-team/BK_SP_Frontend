import { useState } from 'react'
import { X, CalendarCheck, Search, AlertTriangle, Users, Check, ClipboardList } from 'lucide-react'
import { toast } from 'react-toastify'
import { checkAvailabilityAPI, createReservationAPI } from '../../../apis/receptionist/reservations'
import DatePicker from './DatePicker'
import TimePicker from './TimePicker'

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : ''

// how long ago the table was seated, e.g. "23 min ago", "1 hr 5 min ago"
const agoText = (iso) => {
  if (!iso) return 'a while ago'
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h} hr ${m} min ago` : `${h} hr ago`
}

const ReservationBookingPanel = ({ tables = [], onClose, onSuccess }) => {
  // Guest count is capped at the branch's total chairs — can't book more guests than we can seat.
  const totalChairs = tables.reduce((sum, t) => sum + (t.capacity || 0), 0)
  const maxGuests = Math.max(1, totalChairs)

  const [check, setCheck] = useState({ date: '', startTime: '18:00', endTime: '20:00', guestCount: 2 })
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState(null) // { possible, reason, tables: [...] }

  const [selectedIds, setSelectedIds] = useState([]) // one booking can span multiple tables
  const [reserve, setReserve] = useState({ customerName: '', customerPhone: '', notes: '' })
  const [booking, setBooking] = useState(false)
  const [bookError, setBookError] = useState(null)

  // the checked slot, reused when booking so the booking matches exactly what was checked
  const [checkedSlot, setCheckedSlot] = useState(null) // { reservationTime, endTime, guestCount }

  const onReserveChange = (e) => setReserve((p) => ({ ...p, [e.target.name]: e.target.value }))

  const buildSlot = () => ({
    reservationTime: `${check.date}T${check.startTime}:00`,
    endTime: `${check.date}T${check.endTime}:00`,
    guestCount: Number(check.guestCount),
  })

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!check.date) {
      toast.error('Please pick a date')
      return
    }
    if (check.endTime <= check.startTime) {
      toast.error('End time must be after start time')
      return
    }
    const g = Number(check.guestCount)
    if (!Number.isInteger(g) || g < 1) {
      toast.error('Enter a valid guest count')
      return
    }
    if (g > maxGuests) {
      toast.error(`This branch seats at most ${maxGuests} guests`)
      return
    }
    // Must be a future slot — can't reserve a time that's already passed.
    const startAt = new Date(`${check.date}T${check.startTime}:00`)
    if (isNaN(startAt.getTime()) || startAt.getTime() <= Date.now()) {
      toast.error('Reservation time must be in the future')
      return
    }
    setSelectedIds([])
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

  const toggleTable = (tableId) =>
    setSelectedIds((prev) =>
      prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]
    )

  const handleBook = async (e) => {
    e.preventDefault()
    if (!checkedSlot || selectedIds.length === 0) return
    setBookError(null)
    setBooking(true)
    const { data, error } = await createReservationAPI({
      tableIds: selectedIds,
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
    setSelectedIds([])
    setResult(null)
    setCheckedSlot(null)
  }

  const inputCls =
    'w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/20'

  // Guest-count validation for the input
  const guestNum = Number(check.guestCount)
  const guestError =
    check.guestCount === '' || check.guestCount == null
      ? null
      : (!Number.isInteger(guestNum) || guestNum < 1)
        ? 'Enter a whole number of guests'
        : guestNum > maxGuests
          ? `This branch seats at most ${maxGuests} guests`
          : null

  // Derived from the check result. Only a time overlap (BLOCKED) removes a table; gap tables stay selectable.
  const blockedTables = result ? result.tables.filter((t) => t.status === 'BLOCKED') : []
  const selectableTables = result ? result.tables.filter((t) => t.status !== 'BLOCKED') : []
  const selectedSeats = result
    ? result.tables.filter((t) => selectedIds.includes(t.tableId)).reduce((s, t) => s + (t.capacity || 0), 0)
    : 0
  const needed = checkedSlot ? checkedSlot.guestCount : 0
  const guestsLeft = Math.max(0, needed - selectedSeats)
  const covered = selectedSeats >= needed && needed > 0
  const canBook = covered && reserve.customerName.trim() && reserve.customerPhone.trim()

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
            <p className="text-xs text-gray-400">Check the slot, then pick tables</p>
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
            <DatePicker value={check.date} onChange={(v) => setCheck((p) => ({ ...p, date: v }))} />
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
            <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-gray-400">
              Guests <span className="text-gray-300">(max {maxGuests})</span>
            </label>
            <input
              type="number"
              min={1}
              max={maxGuests}
              value={check.guestCount}
              onChange={(e) => setCheck((p) => ({ ...p, guestCount: e.target.value }))}
              placeholder="No. of guests"
              className={`w-32 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 ${
                guestError ? 'ring-2 ring-red-300/40' : 'focus:ring-orange-500/20'
              }`}
            />
            {guestError && (
              <p className="mt-1 text-[11px] font-semibold text-red-500">{guestError}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={checking || !!guestError}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-colors hover:bg-orange-600 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Search size={16} /> {checking ? 'Checking...' : 'Check Availability'}
          </button>
        </form>

        {/* Validation failure (past time / end ≤ start): backend returns no tables + a reason */}
        {result && result.tables.length === 0 && (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-bold text-red-600">Can't book this slot</p>
              <p className="mt-0.5 text-xs text-red-500">{result.reason || 'Please adjust the date or time.'}</p>
            </div>
          </div>
        )}

        {result && result.tables.length > 0 && (
          <div className="mt-5 space-y-5">
            {/* ② BLOCKED — tables whose time overlaps an existing reservation (can't be picked) */}
            {blockedTables.length > 0 ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-red-600">
                  <AlertTriangle size={15} /> Time conflicts (unavailable)
                </div>
                <div className="space-y-1.5">
                  {blockedTables.map((t) => (
                    <div key={t.tableId} className="text-[11px] text-red-500">
                      <span className="font-bold">Table {t.tableNumber}</span>{' '}
                      — reserved {fmtTime(t.conflictStart)}–{fmtTime(t.conflictEnd)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl border border-green-100 bg-green-50 p-3 text-xs font-bold text-green-600">
                <Check size={15} /> No time conflicts for this slot
              </div>
            )}

            {/* Gap warnings in the result area too (also shown on each table card). Never blocks. */}
            {selectableTables.some((t) => t.gapConflict) && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700">
                  <AlertTriangle size={15} /> Gap warnings (still bookable)
                </div>
                <div className="space-y-1.5">
                  {selectableTables.filter((t) => t.gapConflict).map((t) => (
                    <div key={t.tableId} className="text-[11px] text-amber-600">
                      <span className="font-bold">Table {t.tableNumber}</span>{' '}
                      — near a reservation {fmtTime(t.conflictStart)}–{fmtTime(t.conflictEnd)}. Maintain at least one hour gap between two reservations to avoid conflicts.
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ③ GUEST DETAILS + TABLE PICKER (only if something is bookable) */}
            {selectableTables.length === 0 ? (
              <p className="text-xs font-semibold text-gray-400">
                No tables are free for this slot — every table's time overlaps a booking.
              </p>
            ) : (
              <form onSubmit={handleBook} className="space-y-4 border-t border-gray-100 pt-5">
                <div className="space-y-3">
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Guest details</p>
                  <input name="customerName" value={reserve.customerName} onChange={onReserveChange}
                    placeholder="Customer name" required className={inputCls} />
                  <input name="customerPhone" value={reserve.customerPhone} onChange={onReserveChange}
                    placeholder="Phone number" required className={inputCls} />
                  <textarea name="notes" value={reserve.notes} onChange={onReserveChange}
                    placeholder="Notes (optional)" rows={2} className={`${inputCls} resize-none`} />
                </div>

                {/* Guests-left counter */}
                <div className={`flex items-center justify-between rounded-2xl px-4 py-2.5 text-xs font-bold ${
                  covered ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <Users size={14} /> {selectedSeats} / {needed} seats selected
                  </span>
                  <span>{covered ? 'All seated ✓' : `${guestsLeft} guest${guestsLeft === 1 ? '' : 's'} left`}</span>
                </div>

                {/* Selectable table cards */}
                <div>
                  <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-gray-400">
                    Pick table(s)
                  </p>
                  <div className="space-y-2">
                    {selectableTables.map((t) => {
                      const isSelected = selectedIds.includes(t.tableId)
                      const isOccupied = t.status === 'OCCUPIED'
                      return (
                        <button
                          key={t.tableId}
                          type="button"
                          onClick={() => toggleTable(t.tableId)}
                          className={`w-full rounded-2xl border p-3 text-left transition-all ${
                            isSelected
                              ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200'
                              : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-800">
                              Table {t.tableNumber} <span className="font-medium text-gray-400">· seats {t.capacity}</span>
                            </span>
                            {isSelected ? (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white">
                                <Check size={13} />
                              </span>
                            ) : isOccupied ? (
                              <span className="flex items-center gap-1 text-[11px] font-black uppercase text-amber-500">
                                <span className="h-2 w-2 rounded-full bg-amber-400" /> Occupied
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] font-black uppercase text-green-600">
                                <span className="h-2 w-2 rounded-full bg-green-500" /> Free
                              </span>
                            )}
                          </div>
                          {isOccupied && (
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-600">
                              <Users size={10} /> Occupied {agoText(t.occupiedSince)}
                              {t.occupiedReservationEnd &&
                                ` · for reservation ${fmtTime(t.occupiedReservationStart)}–${fmtTime(t.occupiedReservationEnd)}`}
                            </p>
                          )}
                          {isOccupied && (
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-amber-500">
                              <ClipboardList size={10} /> Pending orders (still to serve): {t.pendingOrderCount ?? 0}
                            </p>
                          )}
                          {t.gapConflict && (
                            <p className="mt-1 flex items-start gap-1 text-[11px] font-semibold text-amber-600">
                              <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                              Maintain at least one hour gap between two reservations to avoid conflicts
                            </p>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {bookError && (
                  <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-3">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-500" />
                    <p className="text-xs font-semibold text-red-600">{bookError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={booking || !canBook}
                  className="w-full rounded-2xl bg-green-500 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition-colors hover:bg-green-600 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {booking ? 'Booking...' : covered ? 'Book Table(s)' : `Select ${guestsLeft} more seat${guestsLeft === 1 ? '' : 's'}`}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReservationBookingPanel
