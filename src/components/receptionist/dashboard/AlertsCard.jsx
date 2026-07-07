import { useEffect, useState } from 'react'
import { Bell, BellOff, AlertTriangle, Zap, Info } from 'lucide-react'
import { getKitchenAlertsAPI } from '../../../apis/receptionist/alerts'

const TYPE_CONFIG = {
  CRITICAL: {
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-600 border border-red-100',
    icon: <AlertTriangle size={13} className="text-red-500 shrink-0" />,
  },
  WARNING: {
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-50 text-yellow-600 border border-yellow-100',
    icon: <Zap size={13} className="text-yellow-500 shrink-0" />,
  },
  INFO: {
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-600 border border-blue-100',
    icon: <Info size={13} className="text-blue-500 shrink-0" />,
  },
}

const AlertsCard = ({ refreshKey }) => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true)
      const { data } = await getKitchenAlertsAPI()
      if (data) setAlerts(data)
      setLoading(false)
    }
    fetchAlerts()
  }, [refreshKey])

  const active = alerts.filter(a => !a.resolved)
  const resolved = alerts.filter(a => a.resolved)

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-xl bg-red-50 p-2">
            <Bell size={18} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Kitchen Alerts</h2>
            <p className="text-xs text-gray-400">{active.length} active</p>
          </div>
        </div>
        {active.length > 0 && (
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-black text-white">
            {active.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-6 text-gray-300">
          <BellOff size={32} strokeWidth={1.2} />
          <p className="text-xs font-medium">No active alerts</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[180px] pr-1">
          {active.map(alert => {
            const config = TYPE_CONFIG[alert.type] || TYPE_CONFIG.INFO
            return (
              <div key={alert.id} className="flex items-start gap-2 rounded-xl bg-gray-50 p-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full animate-pulse ${config.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 leading-snug">{alert.message}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    {config.icon}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${config.badge}`}>
                      {alert.type}
                    </span>
                    <span className="text-[10px] text-gray-400">{alert.timeAgo} ago</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {resolved.length > 0 && (
        <p className="mt-3 text-[10px] font-semibold text-gray-400">
          {resolved.length} resolved today
        </p>
      )}
    </div>
  )
}

export default AlertsCard
