import { X, PackageCheck } from 'lucide-react'


export default function GrnDetailsModal({ isOpen, onClose, grn }) {
  if (!isOpen || !grn) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">GRN Details: {grn.grnNumber}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Received on: <span className="font-semibold text-gray-700">{new Date(grn.receivedDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Purchase Order</p>
              <p className="font-semibold text-brand">{grn.poNumber}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Invoice Ref</p>
              <p className="font-semibold">{grn.invoiceReference || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Vendor</p>
              <p className="font-semibold">{grn.vendorName}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Received By</p>
              <p className="font-semibold">{grn.receivedByName}</p>
            </div>
          </div>

          {grn.notes && (
            <div className="bg-gray-50 p-4 rounded-xl text-sm border border-gray-200">
              <span className="font-semibold">Notes: </span>{grn.notes}
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-gray-400" /> Received Items
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3 text-center">Received Qty</th>
                    <th className="px-4 py-3 text-center">Condition</th>
                    <th className="px-4 py-3">Discrepancy Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {grn.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {item.itemName}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-gray-900">{item.receivedQuantity}</span> <span className="text-gray-500 text-xs">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          item.condition === 'GOOD' ? 'bg-green-50 text-green-700 border-green-200' :
                          item.condition === 'DAMAGED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs italic">
                        {item.discrepancyNote || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
