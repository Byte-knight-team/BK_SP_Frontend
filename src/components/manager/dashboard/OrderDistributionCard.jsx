import { PieChart } from 'lucide-react'

export default function OrderDistributionCard({ total, dineIn, online }) {
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-light rounded-xl">
            <PieChart className="w-6 h-6 text-brand" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              Order Distribution
            </p>
            <p className="text-sm text-gray-400">Dine-in vs Online</p>
          </div>
        </div>
        <span className="text-3xl font-extrabold text-gray-900">{total}</span>
      </div>
      <div className="flex gap-8 mt-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-brand inline-block" />
          <span className="text-sm text-gray-500">Dine-in / QR</span>
          <span className="text-base font-bold text-gray-800">{dineIn}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-800 inline-block" />
          <span className="text-sm text-gray-500">Online Delivery</span>
          <span className="text-base font-bold text-gray-800">{online}</span>
        </div>
      </div>
    </div>
  )
}
