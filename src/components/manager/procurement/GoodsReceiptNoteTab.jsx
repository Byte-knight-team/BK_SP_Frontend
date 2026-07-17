import { useState } from 'react'
import { Search, PackageCheck, Eye } from 'lucide-react'
import GrnDetailsModal from './GrnDetailsModal'


export default function GoodsReceiptNoteTab({ grns, loading, refetch }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGrn, setSelectedGrn] = useState(null)

  const filteredGrns = (grns || []).filter((grn) => 
    (`GRN-${grn.id}` || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (grn.poNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (grn.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && !grns) return <div className="p-8 text-center text-gray-500">Loading GRNs...</div>

  return (
    <div className="card">
      <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Goods Receipt Notes (GRN)</h2>
        
        <div className="flex w-full sm:w-64 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search GRN, PO or Vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-400 uppercase bg-gray-50/50">
              <th className="px-6 py-4 font-semibold">GRN Number</th>
              <th className="px-6 py-4 font-semibold">PO Number</th>
              <th className="px-6 py-4 font-semibold">Vendor</th>
              <th className="px-6 py-4 font-semibold text-right">Received Date</th>
              <th className="px-6 py-4 font-semibold text-center">Items Received</th>
              <th className="px-6 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredGrns.length > 0 ? (
              filteredGrns.map((grn) => (
                <tr 
                  key={grn.id} 
                  className="transition-colors hover:bg-gray-50/50 cursor-pointer"
                  onClick={() => setSelectedGrn(grn)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="w-4 h-4 text-brand" />
                      <span className="font-bold text-gray-900">GRN-{grn.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-700">{grn.poNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{grn.vendorName}</td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {grn.receivedAt ? new Date(grn.receivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {grn.items?.length || 0} items
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedGrn(grn); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors inline-flex"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                  No GRNs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <GrnDetailsModal 
        isOpen={!!selectedGrn} 
        onClose={() => setSelectedGrn(null)} 
        grn={selectedGrn} 
      />
    </div>
  )
}
