import { X, PackageOpen } from 'lucide-react'
import { format } from 'date-fns'

export default function PoDetailsModal({ isOpen, onClose, po }) {
  if (!isOpen || !po) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">PO Details: {po.poNumber}</h2>
            <p className="text-sm text-gray-500 mt-1">Vendor: <span className="font-semibold text-gray-700">{po.vendorName}</span></p>
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
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className="font-semibold">{po.status}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Total Value</p>
              <p className="font-semibold">Rs. {po.totalValue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Expected Delivery</p>
              <p className="font-semibold">{po.expectedDeliveryDate ? format(new Date(po.expectedDeliveryDate), 'MMM d, yyyy') : 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Created By</p>
              <p className="font-semibold">{po.createdByName}</p>
            </div>
          </div>

          {po.notes && (
            <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm border border-amber-100">
              <span className="font-semibold">Notes: </span>{po.notes}
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <PackageOpen className="w-5 h-5 text-gray-400" /> Line Items
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3 text-center">Ordered</th>
                    <th className="px-4 py-3 text-center">Received</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {po.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.itemNameSnapshot}</p>
                        {item.linkedToCatalog && <p className="text-[10px] text-brand font-medium">In Catalog</p>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-gray-900">{item.orderedQuantity}</span> <span className="text-gray-500 text-xs">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-semibold ${item.totalReceivedQuantity >= item.orderedQuantity ? 'text-green-600' : item.totalReceivedQuantity > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                          {item.totalReceivedQuantity}
                        </span> <span className="text-gray-500 text-xs">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        Rs. {item.agreedUnitPrice?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        Rs. {(item.orderedQuantity * (item.agreedUnitPrice || 0)).toFixed(2)}
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
