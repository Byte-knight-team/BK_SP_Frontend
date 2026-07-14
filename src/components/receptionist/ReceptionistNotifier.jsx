import { useCallback } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { BellRing } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'

/**
 * Global receptionist notifications.
 *
 * Mounted once for the whole /receptionist area (in App.jsx), so these toasts fire on ANY page.
 * IMPORTANT: all topics share ONE WebSocket connection (an array passed to useWebSocket) — opening a
 * separate connection per topic can exhaust the browser's connection budget and make other pages'
 * live updates (table grid, reservation queues) silently stop refreshing.
 */
export default function ReceptionistNotifier() {
  const { user } = useAuth()
  const branchId = user?.branchId
  const navigate = useNavigate()

  const topics = branchId
    ? [
        `/topic/branch/${branchId}/new-order`,
        `/topic/branch/${branchId}/kitchen-item-update`,
        `/topic/branch/${branchId}/order-status-update`,
        `/topic/branch/${branchId}/alerts`,
        `/topic/branch/${branchId}/reservation-reminder`,
        `/topic/branch/${branchId}/new-reservation`,
        `/topic/branch/${branchId}/reservation-activity`,
      ]
    : null

  const handleMessage = useCallback((msg, topic) => {
    // #1 New order placed by a customer.
    if (topic.endsWith('/new-order')) {
      const label =
        msg?.orderType === 'ONLINE_PICKUP' ? 'Pickup'
          : msg?.orderType === 'ONLINE_DELIVERY' ? 'Delivery'
            : msg?.orderType === 'QR' ? 'QR' : 'New'
      toast.success(`New ${label} order ${msg?.orderNumber || ''} placed.`, {
        autoClose: 6000,
        icon: <BellRing size={20} />,
        onClick: () => navigate('/receptionist/orders', { state: { tab: 'PLACED' } }),
        style: { cursor: 'pointer' },
      })
      return
    }

    // #2 Ready to serve — kitchen finished an item / the whole order.
    if (topic.endsWith('/kitchen-item-update')) {
      if (!msg?.orderId) return
      if (msg.newStatus === 'READY') {
        toast.info(`Item ready in Order ${msg.orderNumber} — check the Ready tab.`, { autoClose: 5000 })
      }
      if (msg.orderStatus === 'COMPLETED') {
        toast.success(`Order ${msg.orderNumber} is ready — kitchen completed all items.`, { autoClose: 6000 })
      }
      return
    }

    // #3 Kitchen put an order on hold.
    if (topic.endsWith('/order-status-update')) {
      if (msg?.newStatus === 'ON_HOLD') {
        toast.warning(`Kitchen put Order ${msg.orderNumber} on hold. Check the Hold tab.`, { autoClose: 8000 })
      }
      return
    }

    // #4 Kitchen alerts.
    if (topic.endsWith('/alerts')) {
      if (!msg?.message) return
      if (msg.type === 'RESOLVED') toast.success(`Kitchen resolved an issue: ${msg.message}`, { autoClose: 6000 })
      else if (msg.type === 'CRITICAL') toast.error(`Kitchen reported a critical issue: ${msg.message}`, { autoClose: 10000 })
      else if (msg.type === 'WARNING') toast.warning(`Kitchen reported a warning: ${msg.message}`, { autoClose: 8000 })
      else toast.info(`Kitchen update: ${msg.message}`, { autoClose: 6000 })
      return
    }

    // #5 guest late · #6 time's up · #7 1hr/30min/15min reminders.
    if (topic.endsWith('/reservation-reminder')) {
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
      return
    }

    // #8 New reservation request from a customer — jump to the Requested queue.
    if (topic.endsWith('/new-reservation')) {
      toast.info('New reservation request received — review it in Table Management.', {
        autoClose: 8000,
        icon: <BellRing size={20} />,
        onClick: () => navigate('/receptionist/tables'),
        style: { cursor: 'pointer' },
      })
      return
    }

    // #9 A CUSTOMER acted on a reservation (paid / cancelled).
    if (topic.endsWith('/reservation-activity')) {
      const who = msg?.customerName || 'A customer'
      const num = msg?.reservationId ? `#${msg.reservationId}` : ''
      if (msg?.action === 'PAID') {
        toast.success(`${who} paid for reservation ${num} — it's confirmed.`, { autoClose: 7000 })
      } else if (msg?.action === 'CANCELLED') {
        toast.warning(`${who} cancelled reservation ${num}.`, { autoClose: 7000 })
      }
      return
    }
  }, [navigate])

  useWebSocket(branchId, topics, handleMessage)

  return null
}
