import { useCallback } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'

/**
 * Global kitchen notifications.
 *
 * Mounted once for the whole /kitchen area (in App.jsx), so these toasts fire on ANY kitchen page —
 * not just the Orders page. The Orders page keeps its own data-refresh on these events; this
 * component only owns the toasts (so they aren't duplicated).
 */
export default function KitchenNotifier() {
  const { user } = useAuth()
  const branchId = user?.branchId

  // Receptionist sent a new order to the kitchen.
  const kitchenOrderTopic = branchId ? `/topic/branch/${branchId}/kitchen-orders` : null
  const handleNewOrder = useCallback((msg) => {
    toast.success(`New order received: ${msg?.orderNumber || ''}`, { autoClose: 5000 })
  }, [])
  useWebSocket(branchId, kitchenOrderTopic, handleNewOrder)

  // Line-chef item updates — started cooking / ready / whole order completed.
  const itemTopic = branchId ? `/topic/branch/${branchId}/kitchen-item-update` : null
  const handleItem = useCallback((msg) => {
    if (!msg?.itemName) return
    if (msg.orderStatus === 'COMPLETED') {
      toast.success(`Order ${msg.orderNumber}: all items completed!`, { autoClose: 5000 })
    } else if (msg.newStatus === 'PREPARING') {
      toast.info(`${msg.itemName} started cooking (Order ${msg.orderNumber})`, { autoClose: 3000 })
    } else if (msg.newStatus === 'READY') {
      toast.success(`${msg.itemName} is ready (Order ${msg.orderNumber})`, { autoClose: 3000 })
    }
  }, [])
  useWebSocket(branchId, itemTopic, handleItem)

  return null
}
