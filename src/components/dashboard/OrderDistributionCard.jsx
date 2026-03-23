export default function OrderDistributionCard({ total, dineIn, online }) {
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Order Distribution
          </p>
          <p className="text-xs text-gray-400">Dine-in vs Online</p>
        </div>
        <span className="text-xl font-bold text-gray-900">{total}</span>
      </div>
      <div className="flex gap-6 mt-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand inline-block" />
          <span className="text-xs text-gray-500">Dine-in / QR</span>
          <span className="text-sm font-semibold text-gray-800">{dineIn}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-800 inline-block" />
          <span className="text-xs text-gray-500">Online Delivery</span>
          <span className="text-sm font-semibold text-gray-800">{online}</span>
        </div>
      </div>
    </div>
  )
}
