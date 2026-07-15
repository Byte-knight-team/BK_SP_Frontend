import { useState, useEffect } from 'react'
import { AlertTriangle, Users, Check, ClipboardList, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  checkAvailabilityAPI,
  confirmReservationAPI,
  rejectReservationAPI,
} from '../../../apis/receptionist/reservations'

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

/**
 * Inline availability + table-picker for confirming (or rejecting) a REQUESTED reservation.
 * Reuses the old booking panel's availability UI — WITHOUT any inputs (the slot/guests come from
 * the reservation). Auto-runs availability on open; Confirm assigns tables, Reject needs a reason.
 * Renders inside the expanded row under the Requested table.
 */
const ReservationAvailabilityPanel = ({ reservation, onDone }) => {
  const [checking, setChecking] = useState(true)
  const [result, setResult] = useState(null) // { possible, reason, tables: [...] }
  const [selectedIds, setSelectedIds] = useState([]) // one booking can span multiple tables
  const [submitting, setSubmitting] = useState(false)

  // Reject flow (reason input)
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)

  useEffect(() => {
    if (!reservation) return
    setChecking(true)
    setResult(null)
    setSelectedIds([])
    setRejecting(false)
    setRejectReason('')
    checkAvailabilityAPI({
      reservationTime: reservation.reservationTime,
      endTime: reservation.endTime,
      guestCount: reservation.guestCount,
    }).then(({ data, error }) => {
      if (error) toast.error(error)
      else setResult(data)
      setChecking(false)
    })
  }, [reservation])

  const toggleTable = (tableId) =>
    setSelectedIds((prev) => (prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]))

  const blockedTables = result ? result.tables.filter((t) => t.status === 'BLOCKED') : []
  const selectableTables = result ? result.tables.filter((t) => t.status !== 'BLOCKED') : []
  const selectedTables = result ? result.tables.filter((t) => selectedIds.includes(t.tableId)) : []
  const selectedSeats = selectedTables.reduce((s, t) => s + (t.capacity || 0), 0)
  const needed = reservation?.guestCount || 0
  const guestsLeft = Math.max(0, needed - selectedSeats)
  const covered = selectedSeats >= needed && needed > 0

  const handleConfirm = async () => {
    if (selectedIds.length === 0 || !covered) return
    setSubmitting(true)
    const { error } = await confirmReservationAPI(reservation.id, {
      tableNumbers: selectedTables.map((t) => t.tableNumber),
      note: null,
    })
    setSubmitting(false)
    if (error) return toast.error(error)
    toast.success('Reservation confirmed, customer can now pay')
    onDone?.()
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return toast.error('Please enter a reason')
    setRejectLoading(true)
    const { error } = await rejectReservationAPI(reservation.id, rejectReason.trim())
    setRejectLoading(false)
    if (error) return toast.error(error)
    toast.success('Request rejected')
    onDone?.()
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
      {checking ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-orange-500" size={26} />
        </div>
      ) : result && result.tables.length === 0 ? (
        // Slot can't be checked (past time / bad range) — backend returns no tables + a reason.
        <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-4">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-bold text-red-600">Can't check this slot</p>
            <p className="mt-0.5 text-xs text-red-500">{result.reason || 'Please review the reservation time.'}</p>
          </div>
        </div>
      ) : result ? (
        <div className="space-y-4">
          {/* Blocked (time overlap) vs. all-clear */}
          {blockedTables.length > 0 ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-red-600">
                <AlertTriangle size={15} /> Time conflicts (unavailable)
              </div>
              <div className="space-y-1.5">
                {blockedTables.map((t) => (
                  <div key={t.tableId} className="text-[11px] text-red-500">
                    <span className="font-bold">Table {t.tableNumber}</span>: reserved{' '}
                    {fmtTime(t.conflictStart)}–{fmtTime(t.conflictEnd)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-green-100 bg-green-50 p-3 text-xs font-bold text-green-600">
              <Check size={15} /> No time conflicts for this slot
            </div>
          )}

          {/* Gap warnings (never block) */}
          {selectableTables.some((t) => t.gapConflict) && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700">
                <AlertTriangle size={15} /> Gap warnings (still bookable)
              </div>
              <div className="space-y-1.5">
                {selectableTables.filter((t) => t.gapConflict).map((t) => (
                  <div key={t.tableId} className="text-[11px] text-amber-600">
                    <span className="font-bold">Table {t.tableNumber}</span>: near a reservation{' '}
                    {fmtTime(t.conflictStart)}–{fmtTime(t.conflictEnd)}. Keep at least an hour gap between bookings.
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectableTables.length === 0 ? (
            <p className="text-xs font-semibold text-gray-400">
              No tables are free for this slot: every table's time overlaps a booking. You can reject this request below.
            </p>
          ) : (
            <>
              {/* Seats-covered counter */}
              <div
                className={`flex items-center justify-between rounded-2xl px-4 py-2.5 text-xs font-bold ${
                  covered ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Users size={14} /> {selectedSeats} / {needed} seats selected
                </span>
                <span>{covered ? 'All seated ✓' : `${guestsLeft} guest${guestsLeft === 1 ? '' : 's'} left`}</span>
              </div>

              {/* Table picker */}
              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-gray-400">Pick table(s)</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {selectableTables.map((t) => {
                    const isSelected = selectedIds.includes(t.tableId)
                    const isOccupied = t.status === 'OCCUPIED'
                    return (
                      <button
                        key={t.tableId}
                        type="button"
                        onClick={() => toggleTable(t.tableId)}
                        className={`w-full cursor-pointer rounded-2xl border p-3 text-left transition-all ${
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
                              ` · reservation ${fmtTime(t.occupiedReservationStart)}–${fmtTime(t.occupiedReservationEnd)}`}
                          </p>
                        )}
                        {isOccupied && (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-amber-500">
                            <ClipboardList size={10} /> Pending orders (still to serve): {t.pendingOrderCount ?? 0}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Action row: Confirm + Reject (or the reject reason input) */}
          {rejecting ? (
            <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50/60 p-2">
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejecting this request..."
                className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-red-300/30"
              />
              <button
                onClick={() => { setRejecting(false); setRejectReason('') }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleReject}
                disabled={rejectLoading}
                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleConfirm}
                disabled={submitting || selectableTables.length === 0 || !covered}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-green-500 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : covered ? (
                  'Confirm Reservation'
                ) : (
                  `Select ${guestsLeft} more seat${guestsLeft === 1 ? '' : 's'}`
                )}
              </button>
              <button
                onClick={() => setRejecting(true)}
                className="cursor-pointer rounded-2xl border border-red-200 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default ReservationAvailabilityPanel
