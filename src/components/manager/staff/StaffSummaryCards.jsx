import { ChefHat, Truck, UserRound } from 'lucide-react'

function SummaryCard({ icon, iconBg, label, value, subtitle }) {
  return (
    <div className="card flex items-start justify-between text-left w-full">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-extrabold mt-2 text-gray-900">
          {value}
        </p>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
    </div>
  )
}

export default function StaffSummaryCards({ kitchenCount = 0, deliveryCount = 0, receptionistCount = 0 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <SummaryCard
        icon={<ChefHat className="w-6 h-6 text-orange-500" />}
        iconBg="bg-orange-50"
        label="Kitchen team"
        value={`${kitchenCount} Staff`}
        subtitle="Active Kitchen Staff"
      />
      <SummaryCard
        icon={<Truck className="w-6 h-6 text-blue-600" />}
        iconBg="bg-blue-50"
        label="Delivery Fleet"
        value={`${deliveryCount} Riders`}
        subtitle="Active Delivery Fleet"
      />
      <SummaryCard
        icon={<UserRound className="w-6 h-6 text-brand" />}
        iconBg="bg-brand-light"
        label="Receptionists"
        value={`${receptionistCount} Staff`}
        subtitle="Active Receptionists"
      />
    </div>
  )
}
