import { useState, useEffect, useCallback, Fragment } from 'react'
import { Inbox, CalendarClock, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  getRequestedReservationsAPI,
  getUpcomingQueueAPI,
  seatReservationAPI,
  cancelReservationAPI,
  rejectReservationAPI,
} from '../../../apis/receptionist/reservations'
import ReservationAvailabilityPanel from './ReservationAvailabilityPanel'
import useWebSocket from '../../../hooks/useWebSocket'

const fmtTime = (dt) =>
  dt ? new Date(dt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : ''
const fmtDate = (dt) => (dt ? new Date(dt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '')

const th = 'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400'

/**
 * The two reservation queues shown UNDER the table cards on Table Management.
 * A toggle switches between:
 *   - Requested (FCFS): each row → Check Availability (expands the availability panel) or Reject.
 *   - Upcoming (CONFIRMED/PAID, soonest first): each row → Confirm Seating (when PAID) or Cancel.
 * Every action fires a toast; the queues refresh live on reservation-update.
 */
const ReservationQueues = ({ branchId, onTablesChanged }) => {
  const [tab, setTab] = useState('REQUESTED')
  const [requested, setRequested] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)

  // Requested-row expander: { id, mode: 'AVAIL' | 'REJECT' }
  const [expanded, setExpanded] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)

  // Upcoming-row cancel expander
  const [cancelId, setCancelId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [seatingId, setSeatingId] = useState(null)

  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    Promise.all([getRequestedReservationsAPI(), getUpcomingQueueAPI()]).then(([r1, r2]) => {
      setRequested(r1.data || [])
      setUpcoming(r2.data || [])
      setLoading(false)
    })
  }, [])

  useEffect(() => { load() }, [load])

  // Live refresh when any reservation changes (new request, pay, expire, cancel…)
  const topic = branchId ? `/topic/branch/${branchId}/reservation-update` : null
  const onWs = useCallback(() => load(true), [load])
  useWebSocket(branchId, topic, onWs)

  // Collapse expanders + refresh both queues + let the parent refresh the table grid.
  const afterChange = () => {
    setExpanded(null)
    setRejectReason('')
    setCancelId(null)
    setCancelReason('')
    load(true)
    onTablesChanged?.()
  }

  const handleReject = async (id) => {
    if (!rejectReason.trim()) return toast.error('Please enter a reason')
    setRejectLoading(true)
    const { error } = await rejectReservationAPI(id, rejectReason.trim())
    setRejectLoading(false)
    if (error) return toast.error(error)
    toast.success('Request rejected')
    afterChange()
  }

  const handleSeat = async (id) => {
    setSeatingId(id)
    const { error } = await seatReservationAPI(id)
    setSeatingId(null)
    if (error) return toast.error(error)
    toast.success('Reservation seated')
    afterChange()
  }

  const handleCancel = async (id) => {
    if (!cancelReason.trim()) return toast.error('Please enter a reason')
    setCancelLoading(true)
    const { error } = await cancelReservationAPI(id, cancelReason.trim())
    setCancelLoading(false)
    if (error) return toast.error(error)
    toast.success('Reservation cancelled')
    afterChange()
  }

  const toggleAvail = (id) =>
    setExpanded((prev) => (prev && prev.id === id && prev.mode === 'AVAIL' ? null : { id, mode: 'AVAIL' }))
  const openReject = (id) => { setExpanded({ id, mode: 'REJECT' }); setRejectReason('') }

  const TabBtn = ({ value, label, count, Icon }) => (
    <button
      onClick={() => setTab(value)}
      className={`flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
        tab === value ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
      }`}
    >
      <Icon size={16} />
      {label}
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
          tab === value ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-400'
        }`}
      >
        {count}
      </span>
    </button>
  )

  return (
    <div className="mt-8">
      {/* Toggle */}
      <div className="mb-3 flex items-center gap-2">
        <TabBtn value="REQUESTED" label="Requested" count={requested.length} Icon={Inbox} />
        <TabBtn value="UPCOMING" label="Upcoming" count={upcoming.length} Icon={CalendarClock} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-purple-500" size={26} />
          </div>
        ) : tab === 'REQUESTED' ? (
          requested.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-gray-300">
              <Inbox size={36} strokeWidth={1.2} />
              <p className="text-sm font-bold">No new reservation requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={`${th} text-left`}>Res. No</th>
                    <th className={`${th} text-left`}>Customer</th>
                    <th className={`${th} text-left`}>Contact</th>
                    <th className={`${th} text-left`}>Date</th>
                    <th className={`${th} text-center`}>Time</th>
                    <th className={`${th} text-center`}>Guests</th>
                    <th className={`${th} text-left`}>Note</th>
                    <th className={`${th} text-center`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requested.map((r) => (
                    <Fragment key={r.id}>
                      <tr className="hover:bg-gray-50/60">
                        <td className="px-4 py-3 font-bold text-gray-500">#{r.id}</td>
                        <td className="px-4 py-3 font-bold text-gray-800">{r.customerName}</td>
                        <td className="px-4 py-3 text-gray-500">{r.customerPhone || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{fmtDate(r.reservationTime)}</td>
                        <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">
                          {fmtTime(r.reservationTime)}–{fmtTime(r.endTime)}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-gray-700">{r.guestCount ?? '—'}</td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-gray-500">{r.notes || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => toggleAvail(r.id)}
                              className="rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-50"
                            >
                              Check Availability
                            </button>
                            <button
                              onClick={() => openReject(r.id)}
                              className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expanded && expanded.id === r.id && expanded.mode === 'AVAIL' && (
                        <tr className="bg-gray-50/40">
                          <td colSpan={8} className="px-4 py-3">
                            <ReservationAvailabilityPanel reservation={r} onDone={afterChange} />
                          </td>
                        </tr>
                      )}

                      {expanded && expanded.id === r.id && expanded.mode === 'REJECT' && (
                        <tr className="bg-red-50/40">
                          <td colSpan={8} className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <input
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason for rejecting this request..."
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-red-300/30"
                              />
                              <button
                                onClick={() => { setExpanded(null); setRejectReason('') }}
                                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50"
                              >
                                Back
                              </button>
                              <button
                                onClick={() => handleReject(r.id)}
                                disabled={rejectLoading}
                                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
                              >
                                {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : upcoming.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-gray-300">
            <CalendarClock size={36} strokeWidth={1.2} />
            <p className="text-sm font-bold">No upcoming reservations</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`${th} text-left`}>Res. No</th>
                  <th className={`${th} text-left`}>Customer</th>
                  <th className={`${th} text-left`}>Phone</th>
                  <th className={`${th} text-left`}>Date</th>
                  <th className={`${th} text-center`}>Time</th>
                  <th className={`${th} text-center`}>Tables</th>
                  <th className={`${th} text-center`}>Payment</th>
                  <th className={`${th} text-center`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {upcoming.map((r) => {
                  const paid = r.status === 'PAID'
                  return (
                    <Fragment key={r.id}>
                      <tr className="hover:bg-gray-50/60">
                        <td className="px-4 py-3 font-bold text-gray-500">#{r.id}</td>
                        <td className="px-4 py-3 font-bold text-gray-800">{r.customerName}</td>
                        <td className="px-4 py-3 text-gray-500">{r.customerPhone || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{fmtDate(r.reservationTime)}</td>
                        <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">
                          {fmtTime(r.reservationTime)}–{fmtTime(r.endTime)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-center gap-1">
                            {(r.tableNumbers || []).map((n) => (
                              <span key={n} className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-black text-purple-700">
                                {n}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                              paid ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSeat(r.id)}
                              disabled={!paid || seatingId === r.id}
                              title={paid ? 'Seat the arrived party' : 'Awaiting payment'}
                              className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-bold text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {seatingId === r.id ? 'Seating…' : 'Confirm Seating'}
                            </button>
                            <button
                              onClick={() => { setCancelId(r.id); setCancelReason('') }}
                              className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>

                      {cancelId === r.id && (
                        <tr className="bg-red-50/40">
                          <td colSpan={8} className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <input
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Reason for cancellation..."
                                className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-red-300/30"
                              />
                              <button
                                onClick={() => { setCancelId(null); setCancelReason('') }}
                                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50"
                              >
                                Back
                              </button>
                              <button
                                onClick={() => handleCancel(r.id)}
                                disabled={cancelLoading}
                                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
                              >
                                {cancelLoading ? 'Cancelling...' : 'Confirm Cancel'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReservationQueues
