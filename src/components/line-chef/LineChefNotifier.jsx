import { useCallback } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'

/**
 * Global line-chef notifications.
 *
 * Mounted once for the whole line-chef area (in App.jsx), so these toasts fire on ANY line-chef
 * page — not just the dashboard. Topics are keyed by the line chef's own user id, not the branch.
 * The dashboard keeps its own item refresh on these events; this component only owns the toasts.
 */
export default function LineChefNotifier() {
  const { user } = useAuth()
  const userId = user?.id

  // A chief chef assigned a new item to this line chef.
  const newItemTopic = userId ? `/topic/line-chef/${userId}/new-item` : null
  const handleAssigned = useCallback((msg) => {
    toast.info(`New item assigned: ${msg?.itemName} (Order ${msg?.orderNumber})`, { autoClose: 6000 })
  }, [])
  useWebSocket(userId, newItemTopic, handleAssigned)

  // One of this chef's items was reassigned to someone else.
  const removedTopic = userId ? `/topic/line-chef/${userId}/item-removed` : null
  const handleRemoved = useCallback((msg) => {
    toast.warning(`${msg?.itemName} (Order ${msg?.orderNumber}) was reassigned to ${msg?.newChefName}.`, { autoClose: 8000 })
  }, [])
  useWebSocket(userId, removedTopic, handleRemoved)

  return null
}
