import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { getReceptionistOrdersAPI } from '../../apis/receptionist/orders'
import { toast } from 'react-toastify'
import OrderCard from '../../components/receptionist/orders/OrderCard'
import OrderDetailPanel from '../../components/receptionist/orders/OrderDetailPanel'

const TABS = [
  { key: 'PLACED',    label: 'Incoming' },
  { key: 'KITCHEN',   label: 'Kitchen' },
  { key: 'ON_HOLD',   label: 'On Hold' },
  { key: 'COMPLETED', label: 'Ready' },
  { key: 'SERVED',    label: 'Served' },
]

const STATUS_MAP = {
  PLACED:    ['PLACED'],
  KITCHEN:   ['PENDING', 'PREPARING'],
  ON_HOLD:   ['ON_HOLD'],
  COMPLETED: ['COMPLETED'],
  SERVED:    ['SERVED'],
}

const TYPE_FILTERS = [
  { key: 'ALL',             label: 'All' },
  { key: 'QR',             label: 'QR' },
  { key: 'ONLINE_PICKUP',  label: 'Pickup' },
  { key: 'ONLINE_DELIVERY', label: 'Delivery' },
]

const OrderManagementPage = () => {
  const { setHeaderInfo } = useOutletContext()

  const [activeTab, setActiveTab]             = useState('PLACED')
  const [typeFilter, setTypeFilter]           = useState('ALL')
  const [orders, setOrders]                   = useState([])
  const [isLoading, setIsLoading]             = useState(false)
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
  }, [activeTab])

  const fetchOrders = async () => {
    setIsLoading(true)
    const statuses = STATUS_MAP[activeTab]
    const results  = await Promise.all(statuses.map((s) => getReceptionistOrdersAPI(s)))
    const combined = results.flatMap((r) => r.data || [])
    combined.sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))
    setOrders(combined)
    setIsLoading(false)
  }

  const filtered = typeFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.orderType === typeFilter)

  return (
    <div className="flex h-[calc(100vh-80px)] gap-4 p-0">

      {/* LEFT PANEL */}
      <div className="flex w-80 shrink-0 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

        {/* Panel header + tabs */}
        <div className="px-5 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-800">Orders</h3>
            {!isLoading && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-500">
                {filtered.length}
              </span>
            )}
          </div>

          {/* Tabs — underline style */}
          <div className="-mx-5 flex border-b border-gray-100 px-5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 pb-3 pt-1 text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'border-b-2 border-orange-500 text-orange-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter chips */}
        <div className="flex gap-2 px-4 pt-3">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                typeFilter === f.key
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-gray-50 text-gray-400 hover:text-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Order cards */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4 pt-3">
          {isLoading ? (
            <p className="py-12 text-center text-sm text-gray-400 animate-pulse">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="rounded-2xl bg-gray-100 p-4 text-gray-400">
                <ClipboardList size={24} />
              </div>
              <p className="text-sm font-semibold text-gray-400">No orders here</p>
              <p className="text-xs text-gray-300">Check a different tab or filter</p>
            </div>
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

      {/* RIGHT PANEL */}
      <div className="flex-1 overflow-y-auto">
        {selectedOrderId ? (
          <OrderDetailPanel
            orderId={selectedOrderId}
            activeTab={activeTab}
            onTabChange={(targetTab) => {
              if (targetTab) {
                setActiveTab(targetTab) // triggers useEffect → fetchOrders() for new tab
              } else {
                setSelectedOrderId(null) // cancel: clear panel, stay on current tab
                fetchOrders()
              }
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-3xl border border-gray-100 bg-white">
            <div className="rounded-2xl bg-orange-50 p-5 text-orange-300">
              <ClipboardList size={32} />
            </div>
            <p className="text-sm font-bold text-gray-400">Select an order to view details</p>
            <p className="text-xs text-gray-300">Click any order from the list on the left</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default OrderManagementPage
