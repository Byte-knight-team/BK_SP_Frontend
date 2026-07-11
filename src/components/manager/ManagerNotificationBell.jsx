import { useState, useRef, useEffect } from 'react'
import { Bell, Check, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useManagerNotifications } from '../../hooks/useManagerNotifications'

export default function ManagerNotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const { notifications, markAsRead, markAllAsRead } = useManagerNotifications()
  const unreadCount = notifications.length

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleView = (notification) => {
    // Navigate based on type
    setIsOpen(false)

    // 2. Navigate based on type
    if (notification.type === 'CHEF_REQUEST') {
      navigate('/manager/inventory') // Assuming chef requests are handled in inventory
    } else if (notification.type === 'NEW_DELIVERY') {
      navigate('/manager/drivers') // Assuming deliveries are dispatched here
    }
  }

  const formatTime = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden flex flex-col max-h-112">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto">
            {unreadCount === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No new notifications
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-orange-50/50 transition-colors group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-orange-600 mb-1">
                          {notification.type === 'CHEF_REQUEST' ? 'Kitchen Request' : 'New Delivery'}
                        </p>
                        <p className="text-sm text-gray-800 wrap-break-word line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        type="button"
                        onClick={() => handleView(notification)}
                        className="flex items-center gap-1.5 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        Mark Read
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
