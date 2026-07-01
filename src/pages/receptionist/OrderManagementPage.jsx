import { useEffect, useState, useRef, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ClipboardList, AlertTriangle } from 'lucide-react'
import { getReceptionistOrdersAPI } from '../../apis/receptionist/orders'
import { toast } from 'react-toastify'
import OrderCard from '../../components/receptionist/orders/OrderCard'
import OrderDetailPanel from '../../components/receptionist/orders/OrderDetailPanel'
import KitchenAlertsModal from '../../components/receptionist/orders/KitchenAlertsModal'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'

const TABS = [
  { key: 'PLACED',     label: 'New' },
  { key: 'KITCHEN',    label: 'Kitchen' },
  { key: 'ON_HOLD',    label: 'Hold' },
  { key: 'COMPLETED',  label: 'Ready' },
  { key: 'SERVED',     label: 'Served' },
  { key: 'CANCELLED',  label: 'Cancelled' },
]

const STATUS_MAP = {
  PLACED:     ['PLACED'],
  KITCHEN:    ['PENDING', 'PREPARING'],
  ON_HOLD:    ['ON_HOLD'],
  COMPLETED:  ['COMPLETED'],
  SERVED:     ['SERVED'],
  CANCELLED:  ['CANCELLED'],
}

const TYPE_FILTERS = [
  { key: 'ALL',             label: 'All' },
  { key: 'QR',             label: 'QR' },
  { key: 'ONLINE_PICKUP',  label: 'Pickup' },
  { key: 'ONLINE_DELIVERY', label: 'Delivery' },
]

const OrderManagementPage = () => {
  const { setHeaderInfo } = useOutletContext()
  const { user } = useAuth()

  const [activeTab, setActiveTab]             = useState('PLACED')
  const [typeFilter, setTypeFilter]           = useState('ALL')
  const [orders, setOrders]                   = useState([])
  const [isLoading, setIsLoading]             = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [detailRefreshKey, setDetailRefreshKey] = useState(0)
  const [listRefreshKey, setListRefreshKey] = useState(0)
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false)

  // Refs so the stable WebSocket callback can read latest values
  const activeTabRef = useRef(activeTab)
  useEffect(() => { activeTabRef.current = activeTab }, [activeTab])
  const selectedOrderIdRef = useRef(selectedOrderId)
  useEffect(() => { selectedOrderIdRef.current = selectedOrderId }, [selectedOrderId])

  useEffect(() => {
    setHeaderInfo({
      title: 'Order Management',
      description: 'Track live orders, manage payments, and update order statuses.',
      Icon: ClipboardList,
    })
  }, [setHeaderInfo])

  useEffect(() => {
    fetchOrders()
  }, [activeTab, listRefreshKey])

  const fetchOrders = async () => {
    setIsLoading(true)
    const statuses = STATUS_MAP[activeTab]
    const results  = await Promise.all(statuses.map((s) => getReceptionistOrdersAPI(s)))
    const combined = results.flatMap((r) => r.data || [])

    // New tab: sort by when the customer placed the order (oldest first = longest waiting).
    // Kitchen/Hold/Ready: sort by when the order moved into that status (oldest first = FIFO queue).
    // Served/Cancelled: newest status change first — most recent is most relevant to look up.
    if (activeTab === 'PLACED') {
      combined.sort((a, b) => new Date(a.placedAt) - new Date(b.placedAt))
    } else if (['KITCHEN', 'ON_HOLD', 'COMPLETED'].includes(activeTab)) {
      combined.sort((a, b) => new Date(a.statusUpdatedAt) - new Date(b.statusUpdatedAt))
    } else {
      combined.sort((a, b) => new Date(b.statusUpdatedAt) - new Date(a.statusUpdatedAt))
    }

    setOrders(combined)
    setIsLoading(false)
  }

  // WebSocket: kitchen item updates (line chef starts/completes items)
  const branchId = user?.branchId
  const kitchenItemTopic = branchId ? `/topic/branch/${branchId}/kitchen-item-update` : null

  const handleKitchenItemUpdate = useCallback((msg) => {
    if (!msg?.orderId) return

    // QR item ready: auto-switch selected order to Ready tab, or notify if viewing a different order
    if (msg.newStatus === 'READY' && msg.orderType === 'QR') {
      if (activeTabRef.current === 'COMPLETED') {
        setListRefreshKey((prev) => prev + 1)
      } else if (selectedOrderIdRef.current && Number(msg.orderId) === selectedOrderIdRef.current) {
        setActiveTab('COMPLETED')
      } else {
        toast.info(`Item ready in Order ${msg.orderNumber} — check the Ready tab.`, { autoClose: 5000 })
      }
    }

    // Notify receptionist whenever all items in any order are completed
    if (msg.orderStatus === 'COMPLETED') {
      toast.success(`Order ${msg.orderNumber} is ready — kitchen has completed all items.`, { autoClose: 6000 })
    }

    // Tab switch + detail refresh only for the currently selected order
    if (selectedOrderIdRef.current && Number(msg.orderId) === selectedOrderIdRef.current) {
      setDetailRefreshKey((prev) => prev + 1)
      if (msg.orderStatus === 'COMPLETED' && activeTabRef.current === 'KITCHEN') {
        setActiveTab('COMPLETED')
      }
    }
  }, [])

  useWebSocket(branchId, kitchenItemTopic, handleKitchenItemUpdate)

  // Cross-role: kitchen held an order → switch Kitchen → Hold
  const orderStatusTopic = branchId ? `/topic/branch/${branchId}/order-status-update` : null

  const handleOrderStatusUpdate = useCallback((msg) => {
    if (!msg?.orderId) return

    // Notify receptionist whenever any order is put on hold by the kitchen
    if (msg.newStatus === 'ON_HOLD') {
      toast.warning(`Kitchen put Order ${msg.orderNumber} on hold. Please check the Hold tab.`, { autoClose: 8000 })
    }

    // Tab switch + detail refresh only for the currently selected order
    if (selectedOrderIdRef.current && Number(msg.orderId) === selectedOrderIdRef.current) {
      setDetailRefreshKey((prev) => prev + 1)
      if (msg.newStatus === 'ON_HOLD' && activeTabRef.current === 'KITCHEN') {
        setActiveTab('ON_HOLD')
      }
    }
  }, [])

  useWebSocket(branchId, orderStatusTopic, handleOrderStatusUpdate)

  const filtered = typeFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.orderType === typeFilter)

  return (
    <div className="flex h-[calc(100vh-80px)] gap-4 p-0">

      {/* LEFT PANEL */}
      <div className="flex w-96 shrink-0 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

        {/* Panel header + tabs */}
        <div className="px-5 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-800">Orders</h3>
            <div className="flex items-center gap-2">
              {!isLoading && (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-500">
                  {filtered.length}
                </span>
              )}
              <button
                onClick={() => setIsAlertsModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
              >
                <AlertTriangle size={13} />
                Kitchen Alerts
              </button>
            </div>
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
            <p className="animate-pulse py-8 text-center text-sm font-bold text-orange-400">
              Loading {TABS.find(t => t.key === activeTab)?.label} Orders...
            </p>
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
              setActiveTab(targetTab)
            }}
            refreshKey={detailRefreshKey}
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

      <KitchenAlertsModal isOpen={isAlertsModalOpen} onClose={() => setIsAlertsModalOpen(false)} />
    </div>
  )
}

export default OrderManagementPage
