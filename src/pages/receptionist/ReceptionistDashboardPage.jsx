import { useEffect, useState, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { LayoutDashboard, Bell, BellOff, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import useWebSocket from '../../hooks/useWebSocket'
import { toast } from 'react-toastify'

// Map alert type to styles
const ALERT_STYLES = {
  CRITICAL: {
    border: 'border-red-400',
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700',
    icon: <AlertTriangle size={16} className="text-red-500 shrink-0" />,
    toast: 'error',
  },
  WARNING: {
    border: 'border-yellow-400',
    bg: 'bg-yellow-50',
    badge: 'bg-yellow-100 text-yellow-700',
    icon: <Zap size={16} className="text-yellow-500 shrink-0" />,
    toast: 'warning',
  },
  INFO: {
    border: 'border-blue-400',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
    icon: <Info size={16} className="text-blue-500 shrink-0" />,
    toast: 'info',
  },
}

function AlertItem({ alert, onDismiss }) {
  const style = ALERT_STYLES[alert.type] || ALERT_STYLES.INFO

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border-l-4 p-3 ${style.border} ${style.bg} animate-fade-in`}
    >
      {style.icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 leading-snug">{alert.message}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.badge}`}>
            {alert.type}
          </span>
          <span className="text-xs text-gray-400">{alert.timeAgo} ago</span>
        </div>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="ml-1 shrink-0 rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-gray-600"
        title="Dismiss"
      >
        <CheckCircle size={16} />
      </button>
    </div>
  )
}

const ReceptionistDashboardPage = () => {
  const { setHeaderInfo } = useOutletContext()
  const { user } = useAuth()

  // Live alerts list — populated by WebSocket pushes
  const [liveAlerts, setLiveAlerts] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    setHeaderInfo({
      title: 'Receptionist Dashboard',
      description: 'Live alerts and guest metrics — updates in real-time.',
      Icon: LayoutDashboard,
    })
  }, [setHeaderInfo])

  // Called every time a new alert arrives from the kitchen
  const handleNewAlert = useCallback((alert) => {
    // Add to the top of the live list (newest first)
    setLiveAlerts((prev) => [alert, ...prev])

    // Also show a toast notification so it's visible regardless of scroll position
    const toastType = ALERT_STYLES[alert.type]?.toast || 'info'
    toast[toastType](`🍳 Kitchen: ${alert.message}`, {
      autoClose: 6000,
    })
  }, [])

  // Connect to WebSocket using the branch ID from the JWT
  const branchId = user?.branchId
  useWebSocket(branchId, handleNewAlert)

  // Track connection status separately via the branchId availability
  useEffect(() => {
    setIsConnected(!!branchId)
  }, [branchId])

  const dismissAlert = (alertId) => {
    setLiveAlerts((prev) => prev.filter((a) => a.id !== alertId))
  }

  const clearAll = () => setLiveAlerts([])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 p-4">

      {/* Live Alerts Panel */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-orange-500" />
            <h2 className="text-base font-bold text-gray-800">Kitchen Alerts</h2>
            {liveAlerts.length > 0 && (
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                {liveAlerts.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Connection badge */}
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                }`}
              />
              <span className="text-xs text-gray-400">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            {liveAlerts.length > 0 && (
              <button
                onClick={clearAll}
                className="rounded-lg px-3 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Alerts list */}
        {liveAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-300">
            <BellOff size={36} strokeWidth={1.2} />
            <p className="text-sm font-medium">No alerts yet</p>
            <p className="text-xs">Kitchen alerts will appear here in real-time</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
            {liveAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} onDismiss={dismissAlert} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReceptionistDashboardPage
