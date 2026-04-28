import { ChefHat, Truck, UserRound } from 'lucide-react'

export default function StaffSummaryCards({ kitchenCount = 0, deliveryCount = 0, receptionistCount = 0 }) {
  const cards = [
    {
      title: 'Kitchen team',
      count: kitchenCount,
      label: 'Active Kitchen Staff',
      icon: ChefHat,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500'
    },
    {
      title: 'Delivery Fleet',
      count: deliveryCount,
      label: 'Active Delivery Fleet',
      icon: Truck,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500'
    },
    {
      title: 'Receptionists',
      count: receptionistCount,
      label: 'Active Receptionists',
      icon: UserRound,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {cards.map((card) => (
        <div key={card.title} className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
            <div className="text-4xl font-bold text-gray-900">{card.count}</div>
            <p className="text-gray-400 text-xs font-medium">{card.label}</p>
          </div>
          <div className={`p-4 ${card.iconBg} rounded-2xl`}>
            <card.icon className={`w-8 h-8 ${card.iconColor}`} />
          </div>
        </div>
      ))}
    </div>
  )
}
