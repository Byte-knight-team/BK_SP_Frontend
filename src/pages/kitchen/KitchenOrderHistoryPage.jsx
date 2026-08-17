import { useState, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { History, ChefHat } from 'lucide-react'
import { getOrderHistoryAPI } from '../../apis/kitchen/orders'
import DatePicker from '../../components/kitchen/DatePicker'
import Dropdown from '../../components/common/Dropdown'

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PREPARING', label: 'Preparing' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'SERVED', label: 'Served' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const STATUS_STYLES = {
  PENDING: 'bg-blue-50 text-blue-600',
  PREPARING: 'bg-amber-50 text-amber-600',
  ON_HOLD: 'bg-gray-100 text-gray-500',
  COMPLETED: 'bg-green-50 text-green-600',
  SERVED: 'bg-purple-50 text-purple-600',
  CANCELLED: 'bg-red-50 text-red-500',
}

const ITEM_STATUS_STYLES = {
  PENDING: 'text-orange-500',
  PREPARING: 'text-blue-500',
  READY: 'text-green-600',
  SERVED: 'text-gray-400',
  ON_HOLD: 'text-gray-400',
}

export default function KitchenOrderHistoryPage() {
  const { setHeaderInfo } = useOutletContext()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    setHeaderInfo({
      title: 'Order History',
      description: 'Every order the kitchen has handled, with prep time and who cooked what.',
      Icon: History,
    })
  }, [setHeaderInfo])

  const load = useCallback(() => {
    setLoading(true)
    getOrderHistoryAPI({ page, size: PAGE_SIZE, date: dateFilter || undefined, status: statusFilter }).then(({ data }) => {
      setOrders(data?.content || [])
      setTotalPages(data?.totalPages || 1)
      setTotalElements(data?.totalElements || 0)
      setLoading(false)
    })
  }, [page, dateFilter, statusFilter])

  useEffect(() => { load() }, [load])

  const onDate = (v) => { setPage(0); setDateFilter(v) }
  const onStatus = (v) => { setPage(0); setStatusFilter(v) }

  const th = 'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400'

  return (
    <div className="p-6">
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
        <div className="w-48">
          <Dropdown value={statusFilter} onChange={onStatus} options={STATUS_OPTIONS} bordered />
        </div>

        <span className="ml-auto text-sm font-bold text-gray-400">
          {totalElements} order{totalElements !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <p className="animate-pulse py-12 text-center text-sm font-bold text-orange-400">
            Loading order history...
          </p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <History size={40} strokeWidth={1.2} className="mb-2" />
            <p className="text-sm font-bold">No orders match these filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`${th} text-left`}>Order</th>
                  <th className={`${th} text-left`}>Date</th>
                  <th className={`${th} text-left`}>Items</th>
                  <th className={`${th} text-center`}>Prep Time</th>
                  <th className={`${th} text-center`}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50/60 align-top">
                    <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{order.orderDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-gray-700">{item.itemName}</span>
                            <span className="font-semibold text-gray-400">×{item.quantity}</span>
                            <span className="text-gray-300">·</span>
                            <ChefHat size={11} className="text-gray-400" />
                            <span className="text-gray-500">{item.assignedLineChefName}</span>
                            <span className={`ml-auto text-[10px] font-black uppercase ${ITEM_STATUS_STYLES[item.status] || 'text-gray-400'}`}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 whitespace-nowrap">{order.prepTime}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-4 py-1.5 text-[11px] font-black tracking-tighter uppercase ${STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-500'}`}>
                        {order.status}
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
