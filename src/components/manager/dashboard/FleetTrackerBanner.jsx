import { MapPin } from 'lucide-react'

export default function FleetTrackerBanner({ activeDeliveries }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50 p-7">
      <div className="flex items-center gap-5">
        <div className="rounded-full bg-white p-4 shadow-sm">
          <MapPin className="text-brand h-8 w-8" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">Fleet Tracker</p>
          <p className="text-base text-gray-500">
            Monitor {activeDeliveries} orders out for delivery
          </p>
        </div>
      </div>
      <button className="bg-brand hover:bg-brand-hover rounded-xl px-10 py-3.5 text-base font-semibold text-white transition-colors">
        Open Map View
      </button>
    </div>
  )
}
