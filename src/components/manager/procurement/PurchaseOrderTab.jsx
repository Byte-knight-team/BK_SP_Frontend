import { useState } from 'react'
import { Search, FileText, Ban, Eye } from 'lucide-react'

import { toast } from 'react-toastify'
import { ProcurementService } from '../../../apis/manager/ProcurementService'
import PoDetailsModal from './PoDetailsModal'

export default function PurchaseOrderTab({ purchaseOrders, loading, refetch }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedPo, setSelectedPo] = useState(null)

  const filteredPos = (purchaseOrders || []).filter((po) => {
    const matchesSearch = 
      (po.poNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (po.vendorName || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleCancelPo = async (e, poId) => {
    e.stopPropagation() // prevent opening modal
    if (window.confirm('Are you sure you want to cancel this Purchase Order? This cannot be undone.')) {
      try {
        await ProcurementService.cancelPurchaseOrder(poId)
        toast.success('Purchase Order cancelled successfully')
        refetch()
      } catch (err) {
        toast.error(err.message || 'Failed to cancel PO')
      }
    }
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case 'SUBMITTED': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'PARTIALLY_RECEIVED': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'RECEIVED': return 'bg-green-50 text-green-700 border-green-200'
      case 'CANCELLED': return 'bg-gray-100 text-gray-600 border-gray-300'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (loading && !purchaseOrders) return <div className="p-8 text-center text-gray-500">Loading purchase orders...</div>

  return (
    <div className="card">
      <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Purchase Orders</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium text-gray-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="PARTIALLY_RECEIVED">Partially Received</option>
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="flex w-full sm:w-64 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search PO number or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-100 text-xs tracking-wider text-gray-400 uppercase bg-gray-50/50">
              <th className="px-6 py-4 font-semibold">PO Number</th>
              <th className="px-6 py-4 font-semibold">Vendor</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Value (Rs)</th>
              <th className="px-6 py-4 font-semibold text-right">Expected Date</th>
              <th className="px-6 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPos.length > 0 ? (
              filteredPos.map((po) => (
                <tr 
                  key={po.id} 
                  className="transition-colors hover:bg-gray-50/50 cursor-pointer"
                  onClick={() => setSelectedPo(po)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-gray-900">{po.poNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">{po.vendorName}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getStatusStyle(po.status)}`}>
                      {(po.status || 'UNKNOWN').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {po.totalValue?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedPo(po); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {po.status === 'SUBMITTED' && (
                        <button
                          onClick={(e) => handleCancelPo(e, po.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Cancel PO"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                  No purchase orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PoDetailsModal 
        isOpen={!!selectedPo} 
        onClose={() => setSelectedPo(null)} 
        po={selectedPo} 
      />
    </div>
  )
}
