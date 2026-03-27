import { MapPin } from 'lucide-react'

export default function FleetTrackerBanner({ activeDeliveries }) {
  return (
    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3.5 bg-white rounded-full shadow-sm">
          <MapPin className="w-6 h-6 text-brand" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">Fleet Tracker</p>
          <p className="text-sm text-gray-500">
            Monitor {activeDeliveries} active deliveries
          </p>
        </div>
      </div>
      <button className="bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3 rounded-xl transition-colors">
        Open Map View
      </button>
    </div>
  )
}
