import { ChefHat, Truck } from 'lucide-react'

function StaffGroup({ icon, label, sublabel, total }) {
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
            {total}
          </span>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Staff</p>
        </div>
      </div>
    </div>
  )
}

export default function StaffAvailability({ kitchen, fleet }) {
  return (
    <div className="card">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            Branch Staff
          </h2>
        </div>
        <button className="flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-hover transition-colors">
          View Staff Details
        </button>
      </div>
      <div className="flex gap-5">
        <StaffGroup
          icon={<ChefHat className="text-brand h-6 w-6" />}
          label="Kitchen"
          sublabel="Chefs & Assistants"
          total={kitchen.total}
        />
        <StaffGroup
          icon={<Truck className="text-brand h-6 w-6" />}
          label="Fleet"
          sublabel="Delivery Drivers"
          total={fleet.total}
        />
      </div>
    </div>
  )
}
