import { Plus } from 'lucide-react'

export default function ProcurementHeader({ onNewVendor, onNewPo }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Procurement</h1>
        <p className="text-gray-500 mt-1">Manage vendors, purchase orders, and goods receipts</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onNewVendor} className="btn-secondary flex items-center gap-2 bg-white">
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
        <button onClick={onNewPo} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create PO
        </button>
      </div>
    </div>
  )
}
