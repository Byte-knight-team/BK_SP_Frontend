import ProgressBar from '../ui/ProgressBar'
import { ChefHat, Truck } from 'lucide-react'

function StaffGroup({ icon, label, sublabel, current, total }) {
  return (
    <div className="flex-1 border border-gray-100 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="p-2 bg-brand-light rounded-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{label}</p>
          <p className="text-xs text-gray-400">{sublabel}</p>
        </div>
        <span className="text-lg font-bold text-gray-800">
          {current}/{total}
        </span>
      </div>
      <ProgressBar value={current} max={total} />
    </div>
  )
}

export default function StaffAvailability({ kitchen, fleet }) {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">Staff Availability</h2>
          <span className="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-medium">
            Real time
          </span>
        </div>
        <button className="btn-primary">Manage Schedule</button>
      </div>
      <div className="flex gap-5">
        <StaffGroup
          icon={<ChefHat className="w-5 h-5 text-brand" />}
          label="Kitchen"
          sublabel="Chefs & Assistants"
          current={kitchen.active}
          total={kitchen.total}
        />
        <StaffGroup
          icon={<Truck className="w-5 h-5 text-brand" />}
          label="Fleet"
          sublabel="Drivers on duty"
          current={fleet.active}
          total={fleet.total}
        />
      </div>
    </div>
  )
}
