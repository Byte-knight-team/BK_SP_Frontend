import { MapPin } from 'lucide-react'

export default function FleetTrackerBanner({ activeDeliveries }) {
  return (
    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-white rounded-xl shadow-sm">
          <MapPin className="w-5 h-5 text-brand" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">Fleet Tracker</p>
          <p className="text-sm text-gray-500">
            Monitor {activeDeliveries} active deliveries
          </p>
        </div>
      </div>
      <button className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
        Open Map View
      </button>
    </div>
  )
}
