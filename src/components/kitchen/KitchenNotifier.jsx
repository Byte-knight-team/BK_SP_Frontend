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

  // Ingredient stock just dropped into LOW or CRITICAL — fires on any kitchen page.
  const inventoryAlertTopic = branchId ? `/topic/branch/${branchId}/inventory-alert` : null
  const handleInventoryAlert = useCallback((msg) => {
    if (!msg?.itemName) return
    const qty = `${msg.quantity} ${msg.unit || ''}`.trim()
    if (msg.level === 'CRITICAL') {
      toast.error(`${msg.itemName} stock is CRITICAL: ${qty} left.`, { autoClose: 8000 })
    } else {
      toast.warning(`${msg.itemName} stock is LOW: ${qty} left.`, { autoClose: 6000 })
    }
  }, [])
  useWebSocket(branchId, inventoryAlertTopic, handleInventoryAlert)

  // Menu update approval notification sent to the chef
  const menuUpdateApprovalTopic = user?.id ? `/topic/chef/${user.id}/menu-update-approval` : null
  const handleMenuUpdateApproval = useCallback((msg) => {
    if (msg?.message) {
      toast.success(msg.message, { autoClose: 6000, theme: 'colored' })
    }
  }, [])
  // useWebSocket from the hooks will handle this. Wait, the hook `useWebSocket` expects `branchId` as first arg. 
  // Let me look at `useWebSocket`. It takes `branchId` to prevent connecting if `branchId` is null, but maybe I can just pass `user?.id` or `true` since it just needs a truthy value for the first parameter. Wait, let me check `useWebSocket.js`. 
  // Let's pass branchId to be safe, so it only connects when the branchId is known.
  useWebSocket(branchId, menuUpdateApprovalTopic, handleMenuUpdateApproval)

  return null
}
