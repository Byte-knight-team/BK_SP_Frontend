import { Users, Navigation, Timer, AlertTriangle } from 'lucide-react'

function SummaryCard({ icon, iconBg, label, children, subtitle }) {
  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <div className="mt-2">{children}</div>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
    </div>
  )
}

export default function DriversSummaryCards({
  pendingDispatch,
  available,
  activeDeliveries,
  deliveryAlerts = 0,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Pending Dispatch */}
      <SummaryCard
        icon={<Timer className="w-6 h-6 text-brand" />}
        iconBg="bg-brand-light"
        label="Pending Dispatch"
        subtitle="Orders waiting to be assigned"
      >
        <p className="text-3xl font-extrabold text-gray-900">
          {pendingDispatch || 0}
        </p>
      </SummaryCard>

      {/* 2. Available Drivers */}
      <SummaryCard
        icon={<Users className="w-6 h-6 text-green-600" />}
        iconBg="bg-green-50"
        label="Available Drivers"
        subtitle="Drivers ready for orders"
      >
        <p className="text-3xl font-extrabold text-gray-900">{available || 0}</p>
      </SummaryCard>

      {/* 3. Active Deliveries */}
      <SummaryCard
        icon={<Navigation className="w-6 h-6 text-blue-600" />}
        iconBg="bg-blue-50"
        label="Active Deliveries"
        subtitle="Orders currently in progress"
      >
        <p className="text-3xl font-extrabold text-gray-900">
          {activeDeliveries || 0}
        </p>
      </SummaryCard>

      {/* 4. Delivery Alerts */}
      <SummaryCard
        icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
        iconBg="bg-red-50"
        label="Delivery Alerts"
        subtitle="Issues requiring attention"
      >
        <p className="text-3xl font-extrabold text-red-600">
          {deliveryAlerts}
        </p>
      </SummaryCard>
    </div>
  )
}
