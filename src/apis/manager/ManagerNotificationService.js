import { authFetch } from '../apiHelper'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const ManagerNotificationService = {
  /**
   * Fetches unread notifications for a manager's branch.
   */
  getUnreadNotifications: async (branchId) => {
    if (!branchId) return []
    const url = `${BASE_URL}/api/manager/notifications?branchId=${branchId}&_t=${Date.now()}`
    
    const response = await authFetch(url)
    const result = await response.json()
    return result.data || result
  },

  /**
   * Marks a specific notification as read.
   */
  markAsRead: async (notificationId) => {
    const url = `${BASE_URL}/api/manager/notifications/${notificationId}/read`
    
    const response = await authFetch(url, {
      method: 'PUT'
    })
    
    // Some APIs return empty responses for PUT, just ensure status is OK
    if (!response.ok) {
      throw new Error('Failed to mark notification as read')
    }
    return true
  }
}
