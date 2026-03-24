import ProgressBar from '../ui/ProgressBar'
import { ChefHat, Truck } from 'lucide-react'

function StaffGroup({ icon, label, sublabel, current, total }) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="p-1.5 bg-orange-50 rounded-lg">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-400">{sublabel}</p>
        </div>
        <span className="ml-auto text-sm font-bold text-gray-800">
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">Staff Availability</h2>
          <span className="text-xs text-green-500 font-medium">Real-time</span>
        </div>
        <button className="btn-primary">Manage Schedule</button>
      </div>
      <div className="flex gap-6">
        <StaffGroup
          icon={<ChefHat className="w-4 h-4 text-brand" />}
          label="Kitchen"
          sublabel="Chefs & Assistants"
          current={kitchen.active}
          total={kitchen.total}
        />
        <StaffGroup
          icon={<Truck className="w-4 h-4 text-brand" />}
          label="Fleet"
          sublabel="Drivers on duty"
          current={fleet.active}
          total={fleet.total}
        />
      </div>
    </div>
  )
}
