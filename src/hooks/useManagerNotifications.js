import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { ManagerNotificationService } from '../apis/manager/ManagerNotificationService'
import useWebSocket from './useWebSocket'
import { toast } from 'react-toastify'

export function useManagerNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { user, hydrated } = useAuth()
  const branchId = user?.branchId

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await ManagerNotificationService.getUnreadNotifications(branchId)
      setNotifications(data || [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch manager notifications:', err)
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hydrated) {
      if (user && branchId) {
        fetchNotifications()
      } else {
        setLoading(false)
      }
    }
  }, [hydrated, user, branchId])

  // Subscribe to the WebSocket topic for this branch
  const topic = branchId ? `/topic/branch/${branchId}/manager-notifications` : null
  
  useWebSocket(branchId, topic, (payload) => {
    // When a ping comes in from the backend, fetch the latest unread notifications
    // We can also trigger a toast so the manager immediately notices it
    if (payload?.message === 'NEW_NOTIFICATION') {
       toast.success("New notification received!", { id: 'manager-notification-ping' })
       fetchNotifications()
    }
  })

  const markAsRead = async (notificationId) => {
    try {
      await ManagerNotificationService.markAsRead(notificationId)
      // Optimistically remove from list
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      return { success: true }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      toast.error("Failed to mark as read")
      return { success: false }
    }
  }

  const markAllAsRead = async () => {
    try {
      // Execute all markAsRead promises in parallel
      await Promise.all(notifications.map(n => ManagerNotificationService.markAsRead(n.id)))
      setNotifications([])
      return { success: true }
    } catch (err) {
      console.error('Failed to mark all as read:', err)
      toast.error("Failed to clear notifications")
      return { success: false }
    }
  }

  return { 
    notifications, 
    loading, 
    error, 
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}
