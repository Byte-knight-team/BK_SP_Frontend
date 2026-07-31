import { Truck } from 'lucide-react'

export default function DriversHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="p-3 bg-brand-light rounded-xl">
        <Truck className="w-7 h-7 text-brand" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Delivery Management
        </h1>
        <p className="text-sm text-gray-400">
          Monitor availability, dispatch orders, & track deliveries
        </p>
      </div>
    </div>
  )
}
