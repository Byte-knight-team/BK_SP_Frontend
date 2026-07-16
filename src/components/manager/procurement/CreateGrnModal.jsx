import { useState, useEffect, useMemo } from 'react'
import { X, Search, CheckCircle2, AlertTriangle, FileText, PackageCheck } from 'lucide-react'
import { toast } from 'react-toastify'
import { ProcurementService } from '../../../apis/manager/ProcurementService'

export default function CreateGrnModal({ isOpen, onClose, purchaseOrders, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [selectedPoId, setSelectedPoId] = useState('')
  
  const [formData, setFormData] = useState({
    invoiceReference: '',
    notes: '',
  })
  
  const [lineItems, setLineItems] = useState([])

  // Only POs that can be received
  const eligiblePos = useMemo(() => {
    return (purchaseOrders || []).filter(po => 
      po.status === 'SUBMITTED' || po.status === 'PARTIALLY_RECEIVED'
    )
  }, [purchaseOrders])

  // When a PO is selected, populate the line items
  useEffect(() => {
    if (selectedPoId) {
      const po = eligiblePos.find(p => p.id.toString() === selectedPoId)
      if (po) {
        // Map PO items to GRN line item structure
        const initialLines = po.items.map(item => {
          const remaining = Math.max(0, item.orderedQuantity - item.totalReceivedQuantity)
          return {
            purchaseOrderItemId: item.id,
            itemName: item.itemNameSnapshot,
            unit: item.unit,
            orderedQuantity: item.orderedQuantity,
            previouslyReceived: item.totalReceivedQuantity,
            remainingToReceive: remaining,
            // default to receiving exactly the remaining amount
            receivedQuantity: remaining,
            condition: 'GOOD',
            discrepancyNote: ''
          }
        })
        setLineItems(initialLines)
      }
    } else {
      setLineItems([])
    }
  }, [selectedPoId, eligiblePos])

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setSelectedPoId('')
      setFormData({ invoiceReference: '', notes: '' })
      setLineItems([])
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleLineItemChange = (poItemId, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.purchaseOrderItemId === poItemId) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedPoId) return toast.error('Please select a Purchase Order')
    
    // Validate quantities (can't be negative)
    if (lineItems.some(item => parseFloat(item.receivedQuantity) < 0)) {
      return toast.error('Received quantities cannot be negative')
    }

    setLoading(true)
    try {
      const payload = {
        purchaseOrderId: parseInt(selectedPoId),
        invoiceReference: formData.invoiceReference || null,
        notes: formData.notes || '',
        items: lineItems
          // Only send items where they actually entered a received quantity > 0 OR they are marking it damaged/rejected
          .filter(item => parseFloat(item.receivedQuantity) > 0 || item.condition !== 'GOOD')
          .map(item => ({
            purchaseOrderItemId: item.purchaseOrderItemId,
            receivedQuantity: parseFloat(item.receivedQuantity) || 0,
            condition: item.condition,
            discrepancyNote: item.discrepancyNote || null
          }))
      }

      if (payload.items.length === 0) {
        setLoading(false)
        return toast.error('You must receive at least one item (or mark as damaged)')
      }

      await ProcurementService.createGrn(payload)
      toast.success('Goods Receipt Note recorded successfully')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error(error.message || 'Failed to record GRN')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Record Goods Receipt Note (GRN)</h2>
            <p className="text-sm text-gray-500 mt-1">Record items received from a vendor against an existing PO.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-grn-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Select Purchase Order *</label>
                <select
                  required
                  value={selectedPoId}
                  onChange={(e) => setSelectedPoId(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                >
                  <option value="">Select a PO...</option>
                  {eligiblePos.map(po => (
                    <option key={po.id} value={po.id}>{po.poNumber} - {po.vendorName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Invoice Reference</label>
                <input
                  type="text"
                  value={formData.invoiceReference}
                  onChange={(e) => setFormData({ ...formData, invoiceReference: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                  placeholder="e.g. INV-10024"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" /> Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                  placeholder="Delivery remarks..."
                />
              </div>
            </div>

            {selectedPoId && lineItems.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <div className="mb-4 p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 flex gap-3 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p>
                    Verify the received quantities carefully. Items marked as <strong>GOOD</strong> will automatically restock the inventory. 
                    Damaged or rejected items will NOT update inventory. Discrepancy notes will be auto-generated if received qty differs from ordered qty.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 w-[25%]">Item Name</th>
                        <th className="px-4 py-3 text-center w-[15%]">Ordered / Prev</th>
                        <th className="px-4 py-3 w-[15%]">Received Qty</th>
                        <th className="px-4 py-3 w-[20%]">Condition</th>
                        <th className="px-4 py-3 w-[25%]">Manual Note (Opt)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {lineItems.map((item) => (
                        <tr key={item.purchaseOrderItemId} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.itemName}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold">{item.orderedQuantity}</span> <span className="text-gray-400 text-xs">{item.unit}</span>
                            {item.previouslyReceived > 0 && (
                              <div className="text-[10px] text-green-600 font-bold mt-0.5">({item.previouslyReceived} received earlier)</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <input
                                required
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.receivedQuantity}
                                onChange={(e) => handleLineItemChange(item.purchaseOrderItemId, 'receivedQuantity', e.target.value)}
                                className="w-20 px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-brand"
                              />
                              <span className="text-gray-500 text-xs">{item.unit}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={item.condition}
                              onChange={(e) => handleLineItemChange(item.purchaseOrderItemId, 'condition', e.target.value)}
                              className={`w-full px-2 py-1.5 text-sm border rounded-lg outline-none font-semibold ${
                                item.condition === 'GOOD' ? 'bg-green-50 border-green-200 text-green-700' :
                                item.condition === 'DAMAGED' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                'bg-red-50 border-red-200 text-red-700'
                              }`}
                            >
                              <option value="GOOD">Good (Restock)</option>
                              <option value="DAMAGED">Damaged (Skip)</option>
                              <option value="REJECTED">Rejected (Skip)</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={item.discrepancyNote}
                              onChange={(e) => handleLineItemChange(item.purchaseOrderItemId, 'discrepancyNote', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none"
                              placeholder="Optional note..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 shrink-0 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-grn-form"
            disabled={loading || !selectedPoId}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? 'Processing...' : <><PackageCheck className="w-4 h-4" /> Record GRN</>}
          </button>
        </div>
      </div>
    </div>
  )
}
