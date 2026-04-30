import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Megaphone } from 'lucide-react'
import { getActiveAlertsAPI, resolveAlertAPI } from '../../../apis/kitchen/alerts'
import { toast } from 'react-toastify'
import AlertModal from './AlertModal'

const ActiveAlertsCard = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchAlerts = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    const { data } = await getActiveAlertsAPI()
    if (data) setAlerts(data)
    if (showLoading) setLoading(false)
  }


  useEffect(() => {
    fetchAlerts(true)
  }, [])


  const handleResolve = async (id) => {
    const { error } = await resolveAlertAPI(id)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Issue marked as Resolved!')
      fetchAlerts(false) // Background refresh
    }
  }

  // SKELETON
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 w-full animate-pulse rounded-2xl border border-gray-100 bg-gray-50/50" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* ... Header ... */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-800">
          Operational Alerts
        </h2>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-orange-600 px-4 py-1.5 text-[10px] font-bold text-white shadow-lg transition-all hover:bg-orange-700 active:scale-95"
        >
          <Megaphone size={14} /> BROADCAST
        </button>
      </div>

      <div className="custom-scrollbar max-h-[300px] space-y-3 overflow-y-auto pr-2 pb-4">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-300">
            <CheckCircle
              size={40}
              strokeWidth={1}
              className="mb-2 opacity-20"
            />
            <p className="text-sm font-medium">All systems normal</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="group relative m-1 flex items-start gap-3 rounded-2xl border border-gray-50 bg-gray-50/50 p-4 transition-all hover:bg-white hover:shadow-md"
            >
              <div
                className={`mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full ${
                  alert.type === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-400'
                }`}
              />

              <div className="flex-1">
                <p className="text-[13px] leading-relaxed font-medium text-gray-700">
                  {alert.message}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-gray-400">
                  <Clock size={12} />
                  {alert.timeAgo} ago
                </div>
              </div>

              <button
                onClick={() => handleResolve(alert.id)}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-green-600 active:scale-95"
              >
                <CheckCircle size={12} /> FIXED
              </button>
            </div>
          ))
        )}
      </div>
      {/* MODAL */}
      <AlertModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAlertSent={() => fetchAlerts(false)} 
      />
    </div>
  )
}

export default ActiveAlertsCard
