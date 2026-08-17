import { useState, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { History, ChefHat, CalendarCheck } from 'lucide-react'
import { getCookingHistoryAPI, getCookingStatsAPI } from '../../apis/line-chef/items'
import DatePicker from '../../components/line-chef/DatePicker'

const PAGE_SIZE = 10

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'READY', label: 'Ready' },
  { key: 'SERVED', label: 'Served' },
]

const statusStyle = {
  READY: 'bg-green-50 text-green-600 border border-green-100',
  SERVED: 'bg-blue-50 text-blue-600 border border-blue-100',
}

export default function LineChefHistoryPage() {
  const { setHeaderInfo } = useOutletContext()

  const [items, setItems] = useState([])
  const [stats, setStats] = useState({ cookedToday: 0, cookedTotal: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('') // '' = all dates, else 'YYYY-MM-DD'

  const [page, setPage] = useState(0) // zero-based, matches the backend
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    setHeaderInfo({
      title: 'Cooking History',
      description: 'Everything you have cooked, with when you started and finished.',
      Icon: History,
    })
  }, [setHeaderInfo])

  // KPI cards are independent of filters/pagination — fetched once on mount.
  useEffect(() => {
    getCookingStatsAPI().then(({ data }) => { if (data) setStats(data) })
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    getCookingHistoryAPI({ page, size: PAGE_SIZE, date: dateFilter || undefined, status: filter }).then(({ data }) => {
      setItems(data?.content || [])
      setTotalPages(data?.totalPages || 1)
      setTotalElements(data?.totalElements || 0)
      setLoading(false)
    })
  }, [page, dateFilter, filter])

  useEffect(() => { load() }, [load])

  // Changing any filter jumps back to the first page
  const onFilter = (key) => { setPage(0); setFilter(key) }
  const onDate = (v) => { setPage(0); setDateFilter(v) }

  return (
    <div className="p-6">
      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Cooked Today</p>
            <p className="mt-1 text-3xl font-black text-gray-800">{stats.cookedToday}</p>
          </div>
          <div className="flex items-center justify-center rounded-2xl bg-orange-100 p-3 text-orange-600">
            <ChefHat size={24} />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Cooked All-Time</p>
            <p className="mt-1 text-3xl font-black text-gray-800">{stats.cookedTotal}</p>
          </div>
          <div className="flex items-center justify-center rounded-2xl bg-orange-100 p-3 text-orange-600">
            <CalendarCheck size={24} />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-52">
          <DatePicker value={dateFilter} onChange={onDate} disablePast={false} placeholder="All dates" bordered />
        </div>
        {dateFilter && (
          <button
            onClick={() => onDate('')}
            className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-500 shadow-sm hover:bg-gray-50"
          >
            Clear date
          </button>
        )}

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilter(f.key)}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                filter === f.key
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-sm font-bold text-gray-400">
          {totalElements} item{totalElements !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <p className="animate-pulse py-12 text-center text-sm font-bold text-orange-400">
            Loading history...
          </p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <History size={40} strokeWidth={1.2} className="mb-2" />
            <p className="text-sm font-bold">No cooking history matches these filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Meal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Order</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">Start Time</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">End Time</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => (
                  <tr key={item.itemId} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{item.cookedDate}</td>
                    <td className="px-4 py-3 font-bold text-gray-800">
                      {item.itemName} <span className="font-semibold text-gray-400">×{item.quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.orderNumber}</td>
                    <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">{item.startTime}</td>
                    <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">{item.endTime}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-4 py-1.5 text-[11px] font-black tracking-tighter uppercase ${statusStyle[item.status] || 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
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
    </div>
  )
}
