import { useState, useEffect } from 'react'
import { X, AlertTriangle, Info, Zap, CheckCircle, Clock } from 'lucide-react'
import { getKitchenAlertsAPI } from '../../../apis/receptionist/alerts'

const TYPE_CONFIG = {
  CRITICAL: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    icon: <Zap size={14} className="text-red-600" />,
  },
  WARNING: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    icon: <AlertTriangle size={14} className="text-orange-500" />,
  },
  INFO: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    icon: <Info size={14} className="text-blue-500" />,
  },
}

// Filter tabs shown at the top of the modal. Each tab's active-pill color matches the
// severity it represents so the receptionist can scan by colour.
const FILTERS = [
  { key: 'ALL', label: 'All active', activeClass: 'bg-gray-800 text-white' },
  { key: 'CRITICAL', label: 'Critical', activeClass: 'bg-red-500 text-white' },
  { key: 'WARNING', label: 'Warning', activeClass: 'bg-orange-500 text-white' },
  { key: 'INFO', label: 'Info', activeClass: 'bg-blue-500 text-white' },
  { key: 'RESOLVED', label: 'Resolved', activeClass: 'bg-green-500 text-white' },
]

const KitchenAlertsModal = ({ isOpen, onClose, refreshKey }) => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    if (!isOpen) return
    setFilter('ALL') // reset to the default tab each time the modal opens
    setLoading(true)
    getKitchenAlertsAPI().then(({ data }) => {
      setAlerts(data || [])
      setLoading(false)
    })
  }, [isOpen, refreshKey])

  if (!isOpen) return null

  const active = alerts.filter((a) => !a.resolved)
  const resolved = alerts.filter((a) => a.resolved)

  // Counts used for the tab badges
  const counts = {
    ALL: active.length,
    CRITICAL: active.filter((a) => a.type === 'CRITICAL').length,
    WARNING: active.filter((a) => a.type === 'WARNING').length,
    INFO: active.filter((a) => a.type === 'INFO').length,
    RESOLVED: resolved.length,
  }

  // Which list to render for the selected tab
  const visible =
    filter === 'RESOLVED'
      ? resolved
      : filter === 'ALL'
        ? active
        : active.filter((a) => a.type === filter)

  const isResolvedView = filter === 'RESOLVED'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-4xl border border-gray-100 bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Kitchen Alerts</h2>
              <p className="text-sm text-gray-400">
                {active.length} unresolved · {resolved.length} resolved
              </p>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-xl p-2 transition-colors hover:bg-gray-100">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                filter === f.key ? f.activeClass : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                  filter === f.key ? 'bg-white/25 text-white' : 'bg-white text-gray-400'
                }`}
              >
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-500" />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <CheckCircle size={32} className="text-green-400" />
              <p className="text-sm font-bold text-gray-400">
                {isResolvedView
                  ? 'No resolved alerts yet'
                  : filter === 'ALL'
                    ? 'No active alerts — kitchen is running smooth'
                    : `No ${filter.toLowerCase()} alerts`}
              </p>
            </div>
          ) : isResolvedView ? (
            // Resolved alerts — muted, struck-through
            visible.map((alert) => (
              <div
                key={alert.id}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-4 opacity-70"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={14} className="shrink-0 text-green-500" />
                    <p className="text-sm text-gray-500 line-through">{alert.message}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-green-700">
                    Resolved
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
                  <Clock size={10} /> {alert.timeAgo}
                </div>
              </div>
            ))
          ) : (
            // Active alerts — coloured by severity
            visible.map((alert) => {
              const cfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.INFO
              return (
                <div key={alert.id} className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      {cfg.icon}
                      <p className="text-sm font-bold text-gray-800">{alert.message}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${cfg.badge}`}>
                      {alert.type}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock size={10} /> {alert.timeAgo}
                  </div>
                </div>
              )
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full cursor-pointer rounded-2xl border border-gray-200 py-2.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default KitchenAlertsModal
