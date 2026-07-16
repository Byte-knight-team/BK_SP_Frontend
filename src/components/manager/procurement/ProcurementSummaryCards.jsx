import { Package, FileText, Truck, DollarSign } from 'lucide-react'

export default function ProcurementSummaryCards({
  totalVendors = 0,
  pendingPos = 0,
  monthlySpend = 0,
  monthlyGrns = 0,
}) {
  const cards = [
    {
      title: 'Active Vendors',
      value: totalVendors,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending POs',
      value: pendingPos,
      icon: FileText,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'GRNs This Month',
      value: monthlyGrns,
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Monthly Spend',
      value: `$${Number(monthlySpend).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div key={idx} className="card p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${card.bgColor}`}>
              <Icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
