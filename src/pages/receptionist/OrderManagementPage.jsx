import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { getReceptionistOrdersAPI } from '../../apis/receptionist/orders'
import { toast } from 'react-toastify'
import OrderCard from '../../components/receptionist/orders/OrderCard'
import OrderDetailPanel from '../../components/receptionist/orders/OrderDetailPanel'

const TABS = [
  { key: 'PLACED',    label: 'Incoming' },
  { key: 'KITCHEN',   label: 'In Kitchen' },
  { key: 'ON_HOLD',   label: 'On Hold' },
  { key: 'COMPLETED', label: 'Ready' },
  { key: 'SERVED',    label: 'Served Today' },
]

// "In Kitchen" tab covers two statuses
const STATUS_MAP = {
  PLACED:    ['PLACED'],
  KITCHEN:   ['PENDING', 'PREPARING'],
  ON_HOLD:   ['ON_HOLD'],
  COMPLETED: ['COMPLETED'],
  SERVED:    ['SERVED'],
}

const TYPE_FILTERS = ['ALL', 'QR', 'ONLINE_PICKUP']

const OrderManagementPage = () => {
  const { setHeaderInfo } = useOutletContext()

  const [activeTab, setActiveTab]         = useState('PLACED')
  const [typeFilter, setTypeFilter]       = useState('ALL')
  const [orders, setOrders]               = useState([])
  const [isLoading, setIsLoading]         = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  useEffect(() => {
    setHeaderInfo({
      title: 'Order Management',
      description: 'Track live orders, manage payments, and update order statuses.',
      Icon: ClipboardList,
    })
  }, [setHeaderInfo])

  useEffect(() => {
    fetchOrders()
    setSelectedOrderId(null)
  }, [activeTab])

  const fetchOrders = async () => {
    setIsLoading(true)
    const statuses = STATUS_MAP[activeTab]

    // Fetch all statuses for the tab (KITCHEN tab needs two fetches)
    const results = await Promise.all(
      statuses.map((s) => getReceptionistOrdersAPI(s))
    )

    const combined = results.flatMap((r) => r.data || [])
    // Sort by placedAt descending
    combined.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))

    setOrders(combined)
    setIsLoading(false)
  }

  // Apply type filter chip
  const filtered = typeFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.orderType === typeFilter)

  return (
    <div className="flex h-[calc(100vh-80px)] gap-4 bg-gray-50 p-6">

      {/* LEFT PANEL — order list */}
      <div className="flex w-80 shrink-0 flex-col gap-3">

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 rounded-2xl border border-gray-100 bg-white p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-xl px-2 py-2 text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Type filter chips */}
        <div className="flex gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                typeFilter === f
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {f === 'ONLINE_PICKUP' ? 'Pickup' : f === 'QR' ? 'QR' : 'All'}
            </button>
          ))}
        </div>

        {/* Order cards */}
        <div className="flex flex-col gap-2 overflow-y-auto">
          {isLoading ? (
            <p className="py-10 text-center text-sm text-gray-400 animate-pulse">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No orders found.</p>
          ) : (
            filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selectedOrderId === order.id}
                onClick={() => setSelectedOrderId(order.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL — order detail */}
      <div className="flex-1 overflow-y-auto">
        {selectedOrderId ? (
          <OrderDetailPanel
            orderId={selectedOrderId}
            activeTab={activeTab}
            onActionDone={() => {
              fetchOrders()
              setSelectedOrderId(null)
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-3xl border border-gray-100 bg-white">
            <p className="text-sm italic text-gray-400">Select an order to view details.</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default OrderManagementPage
