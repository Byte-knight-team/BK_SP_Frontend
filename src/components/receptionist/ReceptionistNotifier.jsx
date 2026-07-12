import { useCallback } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { BellRing } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'

/**
 * Global receptionist notifications.
 *
 * Mounted once for the whole /receptionist area (in App.jsx), so these toasts fire on ANY page —
 * not just Orders / Table Management. The individual pages still keep their own data-refresh on
 * these events; this component only owns the toasts (so they aren't duplicated).
 */
export default function ReceptionistNotifier() {
  const { user } = useAuth()
  const branchId = user?.branchId
  const navigate = useNavigate()

  // #1 New order placed by a customer.
  const newOrderTopic = branchId ? `/topic/branch/${branchId}/new-order` : null
  const handleNewOrder = useCallback((msg) => {
    const label =
      msg?.orderType === 'ONLINE_PICKUP' ? 'Pickup'
        : msg?.orderType === 'ONLINE_DELIVERY' ? 'Delivery'
          : msg?.orderType === 'QR' ? 'QR' : 'New'
    
    toast.success(`New ${label} order ${msg?.orderNumber || ''} placed.`, { 
      autoClose: 6000,
      icon: <BellRing size={20} />,
      onClick: () => {
        navigate('/receptionist/orders', { state: { tab: 'PLACED' } })
      },
      style: { cursor: 'pointer' }
    })
  }, [navigate])
  useWebSocket(branchId, newOrderTopic, handleNewOrder)

  // #2 Ready to serve — kitchen finished an item / the whole order.
  const kitchenItemTopic = branchId ? `/topic/branch/${branchId}/kitchen-item-update` : null
  const handleKitchenItem = useCallback((msg) => {
    if (!msg?.orderId) return
    if (msg.newStatus === 'READY') {
      toast.info(`Item ready in Order ${msg.orderNumber} — check the Ready tab.`, { autoClose: 5000 })
    }
    if (msg.orderStatus === 'COMPLETED') {
      toast.success(`Order ${msg.orderNumber} is ready — kitchen completed all items.`, { autoClose: 6000 })
    }
  }, [])
  useWebSocket(branchId, kitchenItemTopic, handleKitchenItem)

  // #3 Kitchen put an order on hold.
  const orderStatusTopic = branchId ? `/topic/branch/${branchId}/order-status-update` : null
  const handleOrderStatus = useCallback((msg) => {
    if (msg?.newStatus === 'ON_HOLD') {
      toast.warning(`Kitchen put Order ${msg.orderNumber} on hold. Check the Hold tab.`, { autoClose: 8000 })
    }
  }, [])
  useWebSocket(branchId, orderStatusTopic, handleOrderStatus)

  // #4 Kitchen alerts.
  const alertTopic = branchId ? `/topic/branch/${branchId}/alerts` : null
  const handleAlert = useCallback((msg) => {
    if (!msg?.message) return
    if (msg.type === 'RESOLVED') toast.success(`Kitchen resolved an issue: ${msg.message}`, { autoClose: 6000 })
    else if (msg.type === 'CRITICAL') toast.error(`Kitchen reported a critical issue: ${msg.message}`, { autoClose: 10000 })
    else if (msg.type === 'WARNING') toast.warning(`Kitchen reported a warning: ${msg.message}`, { autoClose: 8000 })
    else toast.info(`Kitchen update: ${msg.message}`, { autoClose: 6000 })
  }, [])
  useWebSocket(branchId, alertTopic, handleAlert)

  // #5 guest late · #6 time's up · #7 1hr/30min/15min reminders — all on the reservation-reminder topic.
  const reminderTopic = branchId ? `/topic/branch/${branchId}/reservation-reminder` : null
  const handleReminder = useCallback((msg) => {
    const t = msg?.tableNumber
    const time = msg?.reservationTime
    switch (msg?.type) {
      case 'REMINDER_1HR':
        toast.info(`Table ${t} has a reservation at ${time} — 1 hour away.`, { autoClose: 10000 }); break
      case 'REMINDER_30MIN':
        toast.info(`Table ${t} reservation at ${time} is in 30 minutes.`, { autoClose: 10000 }); break
      case 'REMINDER_15MIN':
        toast.warning(`Table ${t} reservation at ${time} is in 15 minutes — table is now locked.`, { autoClose: 15000 }); break
      case 'GUEST_LATE':
        toast.warning(`Table ${t}: reserved guest is late — slot started ${time}, not seated yet.`, { autoClose: 12000 }); break
      case 'TIME_UP':
        toast.error(`Table ${t}: reserved time is up (ended ${time}). Please clear the table.`, { autoClose: 12000 }); break
      default: break
    }
  }, [])
  useWebSocket(branchId, reminderTopic, handleReminder)

  return null
}
