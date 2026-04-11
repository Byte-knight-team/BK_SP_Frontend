import { Users, Navigation, Timer } from 'lucide-react'

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
  driversOnline,
  available,
  busy,
  pendingDispatch,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <SummaryCard
        icon={<Users className="w-6 h-6 text-brand" />}
        iconBg="bg-brand-light"
        label="Drivers Online"
        subtitle="Total drivers online"
      >
        <p className="text-3xl font-extrabold text-gray-900">{driversOnline}</p>
      </SummaryCard>

      <SummaryCard
        icon={<Navigation className="w-6 h-6 text-brand" />}
        iconBg="bg-brand-light"
        label="Available / Busy"
        subtitle="Total available & busy drivers"
      >
        <p className="text-3xl font-extrabold">
          <span className="text-green-600">{available}</span>
          <span className="text-gray-400">/</span>
          <span className="text-brand">{busy}</span>
        </p>
      </SummaryCard>

      <SummaryCard
        icon={<Timer className="w-6 h-6 text-brand" />}
        iconBg="bg-brand-light"
        label="Pending Dispatch"
        subtitle="Total pending orders to dispatch"
      >
        <p className="text-3xl font-extrabold text-gray-900">
          {pendingDispatch}
        </p>
      </SummaryCard>
    </div>
  )
}
