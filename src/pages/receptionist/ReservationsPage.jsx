import { useState, useEffect, useMemo, Fragment } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CalendarCheck, CalendarDays } from 'lucide-react'
import { toast } from 'react-toastify'
import { getAllReservationsAPI, cancelReservationAPI } from '../../apis/receptionist/reservations'
import PremiumSelect from '../../components/receptionist/table management/PremiumSelect'

const pad = (n) => String(n).padStart(2, '0')
const fmtTime = (dt) =>
  dt ? new Date(dt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : ''
const fmtDate = (dt) =>
  dt ? new Date(dt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''
const dateKey = (dt) => {
  const d = new Date(dt)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]
const STATUS_STYLES = {
  PENDING: 'bg-blue-50 text-blue-600',
  COMPLETED: 'bg-green-50 text-green-600',
  CANCELLED: 'bg-gray-100 text-gray-400',
}

export default function ReservationsPage() {
  const { setHeaderInfo } = useOutletContext()

  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('ALL')
  const [tableFilter, setTableFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [cancelTargetId, setCancelTargetId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    setHeaderInfo({
      title: 'Reservations',
      description: 'Browse, filter and cancel table reservations.',
      Icon: CalendarCheck,
    })
  }, [setHeaderInfo])

  useEffect(() => {
    setLoading(true)
    getAllReservationsAPI().then(({ data }) => {
      setReservations(data || [])
      setLoading(false)
    })
  }, [])

  const dateOptions = useMemo(() => {
    const map = new Map()
    reservations.forEach((r) => {
      const k = dateKey(r.reservationTime)
      if (!map.has(k)) map.set(k, fmtDate(r.reservationTime))
    })
    const entries = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    return [{ value: 'ALL', label: 'All dates' }, ...entries.map(([value, label]) => ({ value, label }))]
  }, [reservations])

  const tableOptions = useMemo(() => {
    const set = new Set(reservations.map((r) => r.tableNumber))
    const nums = [...set].sort((a, b) => a - b)
    return [{ value: 'ALL', label: 'All tables' }, ...nums.map((t) => ({ value: t, label: `Table ${t}` }))]
  }, [reservations])

  // filter, then order by reservation time — latest first
  const rows = useMemo(() => {
    return reservations
      .filter(
        (r) =>
          (dateFilter === 'ALL' || dateKey(r.reservationTime) === dateFilter) &&
          (tableFilter === 'ALL' || r.tableNumber === tableFilter) &&
          (statusFilter === 'ALL' || r.status === statusFilter)
      )
      .sort((a, b) => new Date(b.reservationTime) - new Date(a.reservationTime))
  }, [reservations, dateFilter, tableFilter, statusFilter])

  const handleCancel = async (id) => {
    if (!cancelReason.trim()) {
      toast.error('Please enter a reason')
      return
    }
    setCancelLoading(true)
    const { error } = await cancelReservationAPI(id, cancelReason.trim())
    setCancelLoading(false)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Reservation cancelled')
    setReservations((prev) => prev.map((x) => (x.id === id ? { ...x, status: 'CANCELLED' } : x)))
    setCancelTargetId(null)
    setCancelReason('')
  }

  const th = 'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400'

  return (
    <div className="p-4">
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="w-52">
          <PremiumSelect value={dateFilter} onChange={setDateFilter} options={dateOptions} />
        </div>
        <div className="w-40">
          <PremiumSelect value={tableFilter} onChange={setTableFilter} options={tableOptions} />
        </div>
        <div className="w-40">
          <PremiumSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
        </div>
        <span className="ml-auto text-sm font-bold text-gray-400">
          {rows.length} reservation{rows.length !== 1 ? 's' : ''}
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
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className={`${th} text-left`}>Res. No</th>
                <th className={`${th} text-left`}>Customer</th>
                <th className={`${th} text-center`}>Table</th>
                <th className={`${th} text-left`}>Date</th>
                <th className={`${th} text-center`}>Start</th>
                <th className={`${th} text-center`}>End</th>
                <th className={`${th} text-left`}>Note</th>
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
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-black text-purple-700">
                        {r.tableNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fmtDate(r.reservationTime)}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{fmtTime(r.reservationTime)}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{fmtTime(r.endTime)}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-gray-500">{r.notes || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-400'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.status === 'PENDING' ? (
                        <button
                          onClick={() => { setCancelTargetId(r.id); setCancelReason('') }}
                          className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>

                  {cancelTargetId === r.id && (
                    <tr className="bg-red-50/40">
                      <td colSpan={9} className="px-4 py-3">
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
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
