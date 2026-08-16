import { PieChart } from 'lucide-react'

export default function OrderDistributionCard({ total, dineIn, online }) {
  return (
    <div className="card flex flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-500">
            Order Distribution
          </p>
          <div className="flex items-end gap-3">
            <h3 className="text-2xl font-bold whitespace-nowrap text-gray-900">
              {total}
            </h3>
            <span className="mb-1 text-sm font-semibold text-gray-400">
              Total Orders
            </span>
          </div>
        </div>
        <div className="bg-brand-light shrink-0 rounded-xl p-4">
          <PieChart className="text-brand h-6 w-6" />
        </div>
      </div>

      <div className="flex gap-8 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <span className="bg-brand inline-block h-3 w-3 rounded-full" />
          <span className="text-sm text-gray-500">Dine-in / QR</span>
          <span className="text-base font-bold text-gray-800">{dineIn}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-gray-800" />
          <span className="text-sm text-gray-500">Online Delivery</span>
          <span className="text-base font-bold text-gray-800">{online}</span>
        </div>
      </div>
    </div>
  )
}
