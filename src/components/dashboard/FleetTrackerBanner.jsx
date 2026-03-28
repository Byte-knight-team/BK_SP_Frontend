import { MapPin } from 'lucide-react'

export default function FleetTrackerBanner({ activeDeliveries }) {
  return (
    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-7 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div className="p-4 bg-white rounded-full shadow-sm">
          <MapPin className="w-8 h-8 text-brand" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">Fleet Tracker</p>
          <p className="text-base text-gray-500">
            Monitor {activeDeliveries} active deliveries
          </p>
        </div>
      </div>
      <button className="bg-brand hover:bg-brand-hover text-white text-base font-semibold px-10 py-3.5 rounded-xl transition-colors">
        Open Map View
      </button>
    </div>
  )
}
