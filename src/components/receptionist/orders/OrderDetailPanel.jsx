import { useState, useEffect } from 'react'
import { Monitor, ShoppingBag, Truck } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  getReceptionistOrderDetailAPI,
  sendToKitchenAPI,
  holdReceptionistOrderAPI,
  cancelReceptionistOrderAPI,
  collectPaymentAPI,
  serveOrderAPI,
  serveOrderItemAPI,
} from '../../../apis/receptionist/orders'
import SendToKitchenModal from './SendToKitchenModal'
import HoldOrderModal from './HoldOrderModal'
import CancelOrderModal from './CancelOrderModal'
import CollectPaymentModal from './CollectPaymentModal'

const ITEM_STATUS_STYLES = {
  PENDING:   'bg-orange-50 text-orange-500 border border-orange-100',
  PREPARING: 'bg-blue-50 text-blue-500 border border-blue-100',
  READY:     'bg-green-50 text-green-600 border border-green-100',
  SERVED:    'bg-gray-100 text-gray-400 border border-gray-200',
  ON_HOLD:   'bg-red-50 text-red-500 border border-red-100',
}

const OrderDetailPanel = ({ orderId, activeTab, onTabChange }) => {
  const [order, setOrder]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [isActing, setIsActing] = useState(false)

  const [isKitchenOpen, setIsKitchenOpen] = useState(false)
  const [isHoldOpen, setIsHoldOpen]       = useState(false)
  const [isCancelOpen, setIsCancelOpen]   = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)


  useEffect(() => {
    if (orderId) {
      fetchDetail()
    }
  }, [orderId])

  const fetchDetail = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    const { data, error } = await getReceptionistOrderDetailAPI(orderId)
    if (error) toast.error('Failed to load order details.')
    else setOrder(data)
    if (showLoading) setLoading(false)
  }

  const handleSendToKitchen = async () => {
    setIsActing(true)
    const { error } = await sendToKitchenAPI(orderId)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Order sent to kitchen!')
      setIsKitchenOpen(false)
      fetchDetail(false)        // silently refresh right panel (status: PENDING)
      onTabChange('KITCHEN')    // switch left panel to Kitchen tab
    }
    setIsActing(false)
  }

  const handleHold = async (reason) => {
    setIsActing(true)
    const { error } = await holdReceptionistOrderAPI(orderId, reason)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Order put on hold.')
      setIsHoldOpen(false)
      fetchDetail(false)        // silently refresh right panel (status: ON_HOLD)
      onTabChange('ON_HOLD')    // switch left panel to On Hold tab
    }
    setIsActing(false)
  }

  const handleCancel = async (reason) => {
    setIsActing(true)
    const { error } = await cancelReceptionistOrderAPI(orderId, reason)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Order cancelled.')
      setIsCancelOpen(false)
      onTabChange('CANCELLED')  // switch to Cancelled tab and silently show the order
    }
    setIsActing(false)
  }

  const handleCollectPayment = async () => {
    setIsActing(true)
    const { error } = await collectPaymentAPI(orderId)
    if (error) toast.error(error)
    else { toast.success('Payment collected!'); setIsPaymentOpen(false); fetchDetail(false) }
    setIsActing(false)
  }

  const handleServeOrder = async () => {
    setIsActing(true)
    const { error } = await serveOrderAPI(orderId)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Order handed over!')
      fetchDetail(false)        // silently refresh right panel (status: SERVED)
      onTabChange('SERVED')     // switch left panel to Served tab
    }
    setIsActing(false)
  }

  const handleServeItem = async (itemId) => {
    const { error } = await serveOrderItemAPI(itemId)
    if (error) {
      toast.error(error)
      return
    }
    toast.success('Item served!')
    const { data } = await getReceptionistOrderDetailAPI(orderId)
    if (data) {
      setOrder(data)
      // Auto-switch to Served tab only if all items are now served and we're on the Ready tab
      if (data.status === 'SERVED' && activeTab === 'COMPLETED') {
        onTabChange('SERVED')
      }
    }
  }

  if (loading) return (
    <div className="flex h-full items-center justify-center rounded-3xl border border-gray-100 bg-white">
      <p className="animate-pulse text-sm font-bold text-orange-400">Loading order details...</p>
    </div>
  )

  if (!order) return null

  const isQR          = order.orderType === 'QR'
  const isDelivery    = order.orderType === 'ONLINE_DELIVERY'
  const isCashDue     = order.paymentStatus === 'PENDING'
  const isCancelled   = order.status === 'CANCELLED'

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 space-y-3">

      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-gray-900">{order.orderNumber}</h2>
            <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tight ${
              isQR       ? 'bg-purple-50 text-purple-600 border border-purple-100'
              : isDelivery ? 'bg-teal-50 text-teal-600 border border-teal-100'
              :              'bg-blue-50 text-blue-600 border border-blue-100'
            }`}>
              {isQR ? <Monitor size={10} /> : isDelivery ? <Truck size={10} /> : <ShoppingBag size={10} />}
              {isQR ? 'QR Dine-in' : isDelivery ? 'Home Delivery' : 'Online Pickup'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-400">{order.placedAt}</p>
        </div>

        {isCashDue && !isDelivery && !isCancelled && (
          <button
            onClick={() => setIsPaymentOpen(true)}
            className="rounded-2xl bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-green-600"
          >
            Collect Cash — Rs. {order.finalAmount.toFixed(2)}
          </button>
        )}
      </div>

      {/* CUSTOMER + LOCATION */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-gray-50 p-3 space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Customer</p>
          <p className="text-sm font-bold text-gray-800">
            {order.contactName || order.customerName || 'Guest'}
          </p>
          <p className="text-xs text-gray-500">{order.contactPhone || order.customerPhone}</p>
          <p className="text-xs text-gray-500 truncate">{order.contactEmail || order.customerEmail}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3 space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
            {isQR ? 'Table' : isDelivery ? 'Delivery' : 'Pickup Info'}
          </p>
          {isQR ? (
            <>
              <p className="text-2xl font-black text-orange-500">#{order.tableNumber}</p>
              <p className="text-xs text-gray-400">Dine-in table</p>
            </>
          ) : isDelivery ? (
            <>
              <div className="flex items-center gap-1.5 text-teal-600">
                <Truck size={14} />
                <p className="text-sm font-bold">Home Delivery</p>
              </div>
              <p className="text-xs text-gray-400">Manager will assign a driver after completion</p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-800">{order.contactName || order.customerName}</p>
              <p className="text-xs text-gray-400">Customer will collect in person</p>
            </>
          )}
        </div>
      </div>

      {/* ITEMS */}
      <div>
        <p className="mb-2 text-sm font-bold text-gray-800">Items Ordered</p>
        <div className="rounded-2xl border border-gray-100 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Item</th>
                <th className="px-3 py-2 text-center font-semibold">Qty</th>
                <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
                {!isCancelled && order.status !== 'SERVED' && <th className="px-3 py-2 text-right font-semibold">Status</th>}
                {isQR && !isCancelled && order.status !== 'SERVED' && order.status !== 'PLACED' && (
                  <th className="px-3 py-2 text-center font-semibold">Serve</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60">
                  <td className="px-3 py-2 font-medium text-gray-800">{item.itemName}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{item.quantity}</td>
                  <td className="px-3 py-2 text-right font-bold text-gray-700">
                    Rs. {item.subtotal.toFixed(2)}
                  </td>
                  {!isCancelled && order.status !== 'SERVED' && (
                    <td className="px-3 py-2 text-right">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        ITEM_STATUS_STYLES[item.status] || 'bg-gray-100 text-gray-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  )}
                  {isQR && !isCancelled && order.status !== 'SERVED' && order.status !== 'PLACED' && (
                    <td className="px-3 py-2 text-center">
                      {item.status === 'READY' ? (
                        <button onClick={() => handleServeItem(item.id)}
                          className="rounded-xl bg-green-500 px-3 py-1 text-xs font-bold text-white hover:bg-green-600">
                          Serve
                        </button>
                      ) : item.status === 'SERVED' ? (
                        <span className="text-xs text-gray-400">Done</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT SUMMARY */}
      <div className="rounded-2xl bg-gray-50 p-3 space-y-1.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Payment Summary</p>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Subtotal</span><span>Rs. {order.totalAmount.toFixed(2)}</span>
        </div>
        {order.taxAmount > 0 && (
          <div className="flex justify-between text-xs text-gray-600">
            <span>Tax</span><span>Rs. {order.taxAmount.toFixed(2)}</span>
          </div>
        )}
        {order.serviceCharge > 0 && (
          <div className="flex justify-between text-xs text-gray-600">
            <span>Service Charge</span><span>Rs. {order.serviceCharge.toFixed(2)}</span>
          </div>
        )}
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-xs text-green-600">
            <span>Discount {order.appliedCouponCode && `(${order.appliedCouponCode})`}</span>
            <span>− Rs. {order.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-1.5 flex justify-between text-sm font-black text-gray-900">
          <span>Total Due</span>
          <span className={isCancelled ? 'text-gray-400' : 'text-orange-600'}>Rs. {order.finalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Payment Status</span>
          <span className={`font-bold ${
            isCancelled   ? 'text-gray-400'
            : isCashDue   ? (isDelivery ? 'text-teal-600' : 'text-red-500')
            : 'text-green-600'
          }`}>
            {isCancelled ? '— Order cancelled'
              : isCashDue ? (isDelivery ? 'Cash on Delivery' : 'CASH — Not Yet Collected')
              : '✓ PAID'}
          </span>
        </div>
      </div>

      {/* KITCHEN NOTES */}
      {order.kitchenNotes && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-orange-500 mb-1">Kitchen Note</p>
          <p className="text-xs text-orange-800">{order.kitchenNotes}</p>
        </div>
      )}

      {/* HOLD REASON */}
      {order.holdReason && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-red-500 mb-1">Hold Reason</p>
          <p className="text-xs text-red-800">{order.holdReason}</p>
        </div>
      )}

      {/* CANCEL REASON */}
      {order.cancelReason && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Cancellation Reason</p>
          <p className="text-xs text-gray-700">{order.cancelReason}</p>
        </div>
      )}


      {/* ACTION BUTTONS — driven by order.status, not activeTab, so switching tabs never shows wrong buttons */}
      <div className="flex gap-3 flex-wrap pt-1">
        {order.status === 'PLACED' && (
          <>
            <button onClick={() => setIsHoldOpen(true)}
              className="rounded-2xl border border-orange-200 px-4 py-2.5 text-sm font-bold text-orange-500 hover:bg-orange-50">
              Hold
            </button>
            <button onClick={() => setIsKitchenOpen(true)}
              className="ml-auto rounded-2xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-600">
              Send to Kitchen →
            </button>
          </>
        )}

        {order.status === 'ON_HOLD' && (
          <>
            <button onClick={() => setIsCancelOpen(true)}
              className="rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50">
              Cancel Order
            </button>
            <button onClick={() => setIsKitchenOpen(true)}
              className="ml-auto rounded-2xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-600">
              Send Back to Kitchen →
            </button>
          </>
        )}

        {order.status === 'COMPLETED' && !isQR && !isDelivery && (
          <button onClick={handleServeOrder} disabled={isActing || isCashDue}
            className={`w-full rounded-2xl py-3 text-sm font-bold text-white transition-all ${
              isCashDue || isActing
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-500 shadow-lg shadow-green-200 hover:bg-green-600 cursor-pointer'
            }`}>
            {isCashDue ? 'Collect Payment First' : 'Hand Over & Complete ✓'}
          </button>
        )}

        {order.status === 'COMPLETED' && isDelivery && (
          <div className="w-full rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-xs font-semibold text-teal-600">
            Ready for delivery — the manager will assign a driver from the delivery dashboard.
          </div>
        )}
      </div>

      {/* MODALS */}
      <SendToKitchenModal
        isOpen={isKitchenOpen}
        onClose={() => setIsKitchenOpen(false)}
        onConfirm={handleSendToKitchen}
        orderNumber={order.orderNumber}
        isOnHold={order.status === 'ON_HOLD'}
        isLoading={isActing}
      />
      <HoldOrderModal
        isOpen={isHoldOpen}
        onClose={() => setIsHoldOpen(false)}
        onConfirm={handleHold}
        isLoading={isActing}
      />
      <CancelOrderModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancel}
        isLoading={isActing}
      />
      <CollectPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onConfirm={handleCollectPayment}
        orderNumber={order.orderNumber}
        finalAmount={order.finalAmount}
        isLoading={isActing}
      />
    </div>
  )
}

export default OrderDetailPanel
