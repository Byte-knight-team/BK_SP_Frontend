import { ChefHat, Truck, UserRound, Flame } from 'lucide-react'

export default function StaffSummaryCards({ 
  chefCount = 0, 
  lineChefCount = 0, 
  deliveryCount = 0, 
  receptionistCount = 0 
}) {
  const cards = [
    {
      title: 'Main Chefs',
      value: `${chefCount} Staff`,
      icon: ChefHat,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Line Chefs',
      value: `${lineChefCount} Staff`,
      icon: Flame,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
    },
    {
      title: 'Delivery Fleet',
      value: `${deliveryCount} Riders`,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Receptionists',
      value: `${receptionistCount} Staff`,
      icon: UserRound,
      color: 'text-brand',
      bgColor: 'bg-brand-light',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div key={idx} className="card flex items-center justify-between p-6">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-500">
                {card.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            </div>
            <div className={`rounded-xl p-4 ${card.bgColor}`}>
              <Icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
