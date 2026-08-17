import { useState, useEffect, useCallback, Fragment } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CalendarCheck, CalendarDays } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  getAllReservationsAPI,
  cancelReservationAPI,
  seatReservationAPI,
  rejectReservationAPI,
} from '../../apis/receptionist/reservations'
import { getBranchTablesAPI } from '../../apis/receptionist/tables'
import Dropdown from '../../components/common/Dropdown'
import DatePicker from '../../components/receptionist/table management/DatePicker'
import ConfirmSeatingModal from '../../components/receptionist/table management/ConfirmSeatingModal'

const PAGE_SIZE = 10

const fmtTime = (dt) =>
  dt ? new Date(dt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : ''
const fmtDate = (dt) =>
  dt ? new Date(dt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''
const fmtDateTime = (dt) =>
  dt ? new Date(dt).toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + fmtTime(dt) : ''
const fmtMoney = (n) => (n == null ? null : `Rs ${Number(n).toLocaleString()}`)

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PAID', label: 'Paid' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'EXPIRED', label: 'Expired' },
]
const STATUS_STYLES = {
  REQUESTED: 'bg-amber-50 text-amber-600',
  CONFIRMED: 'bg-blue-50 text-blue-600',
  PAID: 'bg-green-50 text-green-600',
  COMPLETED: 'bg-purple-50 text-purple-600',
  CANCELLED: 'bg-gray-100 text-gray-400',
  REJECTED: 'bg-red-50 text-red-500',
  EXPIRED: 'bg-orange-50 text-orange-500',
}

export default function ReservationsPage() {
  const { setHeaderInfo } = useOutletContext()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('') // '' = all dates, else 'YYYY-MM-DD'
  const [tableFilter, setTableFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [tableOptions, setTableOptions] = useState([{ value: 'ALL', label: 'All tables' }])

  const [page, setPage] = useState(0) // zero-based, matches the backend
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // Inline reason rows
  const [cancelTargetId, setCancelTargetId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)

  const [seatingId, setSeatingId] = useState(null)
  const [seatTarget, setSeatTarget] = useState(null)

  useEffect(() => {
    setHeaderInfo({
      title: 'Reservations',
      description: 'Review requests, confirm or reject, seat paid guests, and cancel bookings.',
      Icon: CalendarCheck,
    })
  }, [setHeaderInfo])

  // Table filter options come from the branch's tables (not the current page of reservations)
  useEffect(() => {
    getBranchTablesAPI().then(({ data }) => {
      const nums = [...new Set((data || []).map((t) => t.tableNumber))].sort((a, b) => a - b)
      setTableOptions([{ value: 'ALL', label: 'All tables' }, ...nums.map((n) => ({ value: n, label: `Table ${n}` }))])
    })
  }, [])

  // Fetch the current page from the server whenever filters or page change.
  // silent = true refreshes the rows in place without the loading spinner (used after an action).
  const load = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    getAllReservationsAPI({
      page,
      size: PAGE_SIZE,
      date: dateFilter || undefined,
      tableNumber: tableFilter !== 'ALL' ? tableFilter : undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
    }).then(({ data, error }) => {
      if (error) toast.error(error)
      setRows(data?.content || [])
      setTotalPages(data?.totalPages || 1)
      setTotalElements(data?.totalElements || 0)
      setLoading(false)
    })
  }, [page, dateFilter, tableFilter, statusFilter])

  // Spinner only on mount / filter / page changes
  useEffect(() => { load() }, [load])

  // Changing any filter jumps back to the first page
  const onDate = (v) => { setPage(0); setDateFilter(v) }
  const onTable = (v) => { setPage(0); setTableFilter(v) }
  const onStatus = (v) => { setPage(0); setStatusFilter(v) }

  const handleCancel = async (id) => {
    if (!cancelReason.trim()) return toast.error('Please enter a reason')
    setCancelLoading(true)
    const { error } = await cancelReservationAPI(id, cancelReason.trim())
    setCancelLoading(false)
    if (error) return toast.error(error)
    toast.success('Reservation cancelled')
    setCancelTargetId(null)
    setCancelReason('')
    load(true)
  }

  const handleReject = async (id) => {
    if (!rejectReason.trim()) return toast.error('Please enter a reason')
    setRejectLoading(true)
    const { error } = await rejectReservationAPI(id, rejectReason.trim())
    setRejectLoading(false)
    if (error) return toast.error(error)
    toast.success('Request rejected')
    setRejectTargetId(null)
    setRejectReason('')
    load(true)
  }

  // Seat = the PAID party arrived: occupy the booking's tables, mark it completed.
  const handleSeat = async (id) => {
    setSeatingId(id)
    const { error } = await seatReservationAPI(id)
    setSeatingId(null)
    if (error) return toast.error(error)
    toast.success('Reservation seated')
    setSeatTarget(null)
    setRows((prev) => prev.filter((r) => r.id !== id))
    load(true)
  }

  const th = 'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400'
  const btn = 'rounded-lg border px-3 py-1.5 text-xs font-bold disabled:opacity-50'

  return (
    <div className="p-4">
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="w-52">
          <DatePicker value={dateFilter} onChange={onDate} disablePast={false} placeholder="All dates" bordered />
        </div>
        {dateFilter && (
          <button
            onClick={() => onDate('')}
            className="rounded-2xl border border-gray-200 bg-white px-3 py-3 text-xs font-bold text-gray-500 shadow-sm hover:bg-gray-50"
          >
            Clear date
          </button>
        )}
        <div className="w-40">
          <Dropdown value={tableFilter} onChange={onTable} options={tableOptions} bordered />
        </div>
        <div className="w-44">
          <Dropdown value={statusFilter} onChange={onStatus} options={STATUS_OPTIONS} bordered />
        </div>
        <span className="ml-auto text-sm font-bold text-gray-400">
          {totalElements} reservation{totalElements !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
          <CalendarDays size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-bold text-gray-400">No reservations match these filters</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full min-w-[1080px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`${th} text-left`}>Res. No</th>
                  <th className={`${th} text-left`}>Customer</th>
                  <th className={`${th} text-center`}>Tables</th>
                  <th className={`${th} text-center`}>Guests</th>
                  <th className={`${th} text-left`}>Date</th>
                  <th className={`${th} text-center`}>Start</th>
                  <th className={`${th} text-center`}>End</th>
                  <th className={`${th} text-left`}>Note</th>
                  <th className={`${th} text-left`}>Payment</th>
                  <th className={`${th} text-center`}>Status</th>
                  <th className={`${th} text-center`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((r) => (
                  <Fragment key={r.id}>
                    <tr className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-bold text-gray-500">#{r.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">{r.customerName}</p>
                        <p className="text-[11px] text-gray-400">{r.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-center gap-1">
                          {(r.tableNumbers || []).length === 0 ? (
                            <span className="text-xs text-gray-300">-</span>
                          ) : (
                            (r.tableNumbers || []).map((n) => (
                              <span key={n} className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-black text-purple-700">
                                {n}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-700">{r.guestCount ?? '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtDate(r.reservationTime)}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{fmtTime(r.reservationTime)}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{fmtTime(r.endTime)}</td>
                      <td className="max-w-[160px] break-words px-4 py-3 text-gray-500">{r.notes || '-'}</td>
                      <td className="px-4 py-3">
                        {r.totalCharge != null ? (
                          <>
                            <p className="font-bold text-gray-700">{fmtMoney(r.totalCharge)}</p>
                            {r.amountPaid != null && (
                              <p className="text-[11px] text-green-600">Paid {fmtDateTime(r.paidAt)}</p>
                            )}
                            {r.refundAmount != null && (
                              <p className="text-[11px] text-red-500">Refunded {fmtMoney(r.refundAmount)}</p>
                            )}
                            {r.amountPaid == null && r.refundAmount == null && r.status === 'CONFIRMED' && (
                              <p className="text-[11px] text-amber-500">Unpaid</p>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-400'}`}>
                          {r.status}
                        </span>
                        {r.cancelReason && (
                          <p className="mx-auto mt-1 max-w-[140px] break-words text-[11px] text-gray-400">
                            {r.cancelReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.status === 'REQUESTED' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setRejectTargetId(r.id); setRejectReason(''); setCancelTargetId(null) }}
                              className={`${btn} border-red-100 text-red-500 hover:bg-red-50`}
                            >
                              Reject
                            </button>
                          </div>
                        ) : r.status === 'PAID' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSeatTarget(r)}
                              disabled={seatingId === r.id}
                              className={`${btn} border-green-200 text-green-600 hover:bg-green-50`}
                            >
                              {seatingId === r.id ? 'Seating…' : 'Seat'}
                            </button>
                            <button
                              onClick={() => { setCancelTargetId(r.id); setCancelReason(''); setRejectTargetId(null) }}
                              className={`${btn} border-red-100 text-red-500 hover:bg-red-50`}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : r.status === 'CONFIRMED' ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-[11px] font-semibold text-gray-400">Awaiting payment</span>
                            <button
                              onClick={() => { setCancelTargetId(r.id); setCancelReason(''); setRejectTargetId(null) }}
                              className={`${btn} border-red-100 text-red-500 hover:bg-red-50`}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">-</span>
                        )}
                      </td>
                    </tr>

                    {/* Inline cancel-reason row */}
                    {cancelTargetId === r.id && (
                      <tr className="bg-red-50/40">
                        <td colSpan={11} className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              placeholder="Reason for cancellation..."
                              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-red-300/30"
                            />
                            <button
                              onClick={() => { setCancelTargetId(null); setCancelReason('') }}
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

                    {/* Inline reject-reason row */}
                    {rejectTargetId === r.id && (
                      <tr className="bg-red-50/40">
                        <td colSpan={11} className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Reason for rejecting this request..."
                              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-red-300/30"
                            />
                            <button
                              onClick={() => { setRejectTargetId(null); setRejectReason('') }}
                              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50"
                            >
                              Back
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              disabled={rejectLoading}
                              className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
                            >
                              {rejectLoading ? 'Rejecting...' : 'Confirm Reject'}
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalElements)} of {totalElements}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-xs font-bold text-gray-500">Page {page + 1} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmSeatingModal
        isOpen={!!seatTarget}
        onClose={() => setSeatTarget(null)}
        onConfirm={() => handleSeat(seatTarget.id)}
        reservation={seatTarget}
        isLoading={seatTarget != null && seatingId === seatTarget.id}
      />
    </div>
  )
}
