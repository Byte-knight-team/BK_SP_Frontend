import { ChefHat, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function StaffGroup({ icon, label, sublabel, active, total }) {
  return (
    <div className="flex-1 rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-3">
        <span className="bg-brand-light rounded-lg p-2.5">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-gray-900">{label}</p>
          <p className="text-sm text-gray-400">{sublabel}</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-extrabold text-gray-900">
            {active}
          </span>
          <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
            Active Staff
          </p>
        </div>
      </div>
    </div>
  )
}

export default function StaffAvailability({ kitchen, fleet }) {
  const navigate = useNavigate()

  return (
    <div className="card">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Branch Staff</h2>
        </div>
        <button
          onClick={() => navigate('/manager/staff')}
          className="bg-brand hover:bg-brand-hover flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
        >
          View Staff Details
        </button>
      </div>
      <div className="flex gap-5">
        <StaffGroup
          icon={<ChefHat className="text-brand h-6 w-6" />}
          label="Kitchen"
          sublabel="Main Chefs & Line Chefs"
          active={kitchen.active}
          total={kitchen.total}
        />
        <StaffGroup
          icon={<Truck className="text-brand h-6 w-6" />}
          label="Fleet"
          sublabel="Delivery Drivers"
          active={fleet.active}
          total={fleet.total}
        />
      </div>
    </div>
  )
}
