import { Package } from 'lucide-react'

export default function InventoryPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-light rounded-xl">
            <Package className="w-7 h-7 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Inventory Management
            </h1>
            <p className="text-sm text-gray-400">
              Track levels and update stock
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder */}
      <div className="card flex items-center justify-center h-64 text-gray-400 text-lg">
        Inventory content coming soon…
      </div>
    </div>
  )
}
