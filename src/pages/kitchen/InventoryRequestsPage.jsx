import { useEffect, useState, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { PackageCheck, Inbox } from 'lucide-react'
import { toast } from 'react-toastify'
import { getMyInventoryRequestsAPI } from '../../apis/kitchen/inventory'
import { getMyEditRequestsAPI } from '../../apis/kitchen/menu'
import DatePicker from '../../components/kitchen/DatePicker'

const PAGE_SIZE = 10

// Status badge styles — shared by both tables, both use the same
// PENDING/APPROVED/REJECTED status set
const STATUS_STYLES = {
  PENDING: 'bg-orange-50 text-orange-600',
  APPROVED: 'bg-green-50 text-green-600',
  REJECTED: 'bg-red-50 text-red-500',
}

// Request-type → friendly label (inventory requests only)
const TYPE_LABEL = {
  REFILL_STOCK: 'Refill',
  ADD_NEW_ITEM: 'New Item',
}

// Filter tabs (status), shared by both tables
const FILTERS = [
  { key: 'ALL', label: 'All', activeClass: 'bg-gray-800 text-white' },
  { key: 'PENDING', label: 'Pending', activeClass: 'bg-orange-500 text-white' },
  { key: 'APPROVED', label: 'Approved', activeClass: 'bg-green-500 text-white' },
  { key: 'REJECTED', label: 'Rejected', activeClass: 'bg-red-500 text-white' },
]

// Top-level toggle between the two request types tracked on this page
const SECTIONS = [
  { key: 'INVENTORY', label: 'Inventory Requests' },
  { key: 'MENU_EDITS', label: 'Menu Edit Requests' },
]

// Shared header-cell style (matches ReservationsPage)
const th = 'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400'

const fmtDate = (dt) =>
  dt ? new Date(dt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : ''

const InventoryRequestsPage = () => {
  const { setHeaderInfo } = useOutletContext()

  // Which table is showing
  const [section, setSection] = useState('INVENTORY')

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('')

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    setHeaderInfo({
      title: 'My Requests',
      description: 'Track your inventory requests and menu item edit requests.',
      Icon: PackageCheck,
    })
  }, [setHeaderInfo])

  const load = useCallback(() => {
    setLoading(true)
    const fetchApi = section === 'INVENTORY' ? getMyInventoryRequestsAPI : getMyEditRequestsAPI
    fetchApi({ page, size: PAGE_SIZE, date: dateFilter || undefined, status: filter }).then(({ data, error }) => {
      if (error) {
        toast.error(section === 'INVENTORY' ? 'Failed to load inventory requests.' : 'Failed to load menu edit requests.')
        setRequests([])
        setTotalPages(1)
        setTotalElements(0)
      } else {
        setRequests(data?.content || [])
        setTotalPages(data?.totalPages || 1)
        setTotalElements(data?.totalElements || 0)
      }
      setLoading(false)
    })
  }, [section, page, dateFilter, filter])

  useEffect(() => { load() }, [load])

  // Switching sections resets filters/paging so the new list starts clean
  const switchSection = (key) => {
    setSection(key)
    setFilter('ALL')
    setDateFilter('')
    setPage(0)
  }

  const onFilter = (key) => { setPage(0); setFilter(key) }
  const onDate = (v) => { setPage(0); setDateFilter(v) }

  return (
    <div className="p-4">
      {/* Section toggle */}
      <div className="mb-4 flex gap-2 rounded-2xl border border-gray-100 bg-white p-1 shadow-sm w-fit">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => switchSection(s.key)}
            className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              section === s.key ? 'bg-orange-500 text-white shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="w-48">
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

        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilter(f.key)}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
              filter === f.key ? f.activeClass : 'border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}

        <span className="ml-auto text-sm font-bold text-gray-400">
          {totalElements} request{totalElements !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
          <Inbox size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-bold text-gray-400">
            {filter === 'ALL' && !dateFilter ? "You haven't sent any requests yet" : 'No requests match these filters'}
          </p>
        </div>
      ) : section === 'INVENTORY' ? (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className={`${th} text-left`}>Item</th>
                <th className={`${th} text-center`}>Type</th>
                <th className={`${th} text-center`}>Quantity</th>
                <th className={`${th} text-left`}>Your Note</th>
                <th className={`${th} text-left`}>Manager Note</th>
                <th className={`${th} text-center`}>Status</th>
                <th className={`${th} text-left`}>Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-bold text-gray-800">{r.item}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                      {TYPE_LABEL[r.requestType] || r.requestType || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-700 whitespace-nowrap">{r.quantity}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-gray-500">{r.note || '-'}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-gray-500">{r.managerNote || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-400'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className={`${th} text-left`}>Menu Item</th>
                <th className={`${th} text-left`}>Your Note</th>
                <th className={`${th} text-left`}>Admin Note</th>
                <th className={`${th} text-center`}>Status</th>
                <th className={`${th} text-left`}>Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-bold text-gray-800">{r.menuItemName}</td>
                  <td className="max-w-[260px] truncate px-4 py-3 text-gray-500">{r.chefNote || '-'}</td>
                  <td className="max-w-[260px] truncate px-4 py-3 text-gray-500">{r.adminNote || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-400'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">{fmtDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

export default InventoryRequestsPage
