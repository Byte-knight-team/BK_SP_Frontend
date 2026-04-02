import { Package, Plus, ChevronDown } from 'lucide-react'

export default function InventoryHeader({ branch }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-brand-light rounded-xl">
          <Package className="w-7 h-7 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-sm text-gray-400">Track levels and update stock</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Branch selector */}
        <button className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
          Branch: {branch}
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Add New Item */}
        <button className="flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-hover transition-colors">
          <Plus className="w-4 h-4" />
          Add New Item
        </button>
      </div>
    </div>
  )
}
