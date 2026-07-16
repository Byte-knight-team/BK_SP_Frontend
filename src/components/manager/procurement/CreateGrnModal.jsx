import { useState, useEffect, useMemo } from 'react'
import { X, Search, CheckCircle2, AlertTriangle, FileText, PackageCheck, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ProcurementService } from '../../../apis/manager/ProcurementService'

export default function CreateGrnModal({ isOpen, onClose, purchaseOrders, onSuccess }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedPoId, setSelectedPoId] = useState('')
  const [unlinkedItemsWarning, setUnlinkedItemsWarning] = useState(null)
  
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
            discrepancyNote: '',
            linkedToCatalog: item.linkedToCatalog,
            agreedUnitPrice: item.agreedUnitPrice
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
      setUnlinkedItemsWarning(null)
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
      
      const unlinkedItemsSubmitted = payload.items.filter(submittedItem => {
        const fullItem = lineItems.find(l => l.purchaseOrderItemId === submittedItem.purchaseOrderItemId)
        return fullItem && !fullItem.linkedToCatalog && submittedItem.receivedQuantity > 0 && submittedItem.condition === 'GOOD'
      })

      if (unlinkedItemsSubmitted.length > 0) {
        setUnlinkedItemsWarning(unlinkedItemsSubmitted.map(i => {
          const fullItem = lineItems.find(l => l.purchaseOrderItemId === i.purchaseOrderItemId)
          return { 
            name: fullItem.itemName, 
            unit: fullItem.unit,
            initialQuantity: i.receivedQuantity,
            unitPrice: fullItem.agreedUnitPrice || ''
          }
        }))
      } else {
        onSuccess?.()
        onClose()
      }
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

        {unlinkedItemsWarning ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Unlinked Items Received</h3>
            <p className="text-gray-600 max-w-md">
              You just received items that do not currently exist in your inventory catalog. 
              The system cannot automatically restock these items until they are added to the catalog.
            </p>
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm font-medium w-full max-w-md text-left">
              Unlinked Items:
              <ul className="list-disc ml-5 mt-1">
                {unlinkedItemsWarning.map((u, i) => (
                  <li key={i}>{u.name} ({u.unit})</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => {
                  onSuccess?.()
                  onClose()
                }}
                className="px-6 py-2.5 font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
              >
                Close (Add Later)
              </button>
              <button
                onClick={() => {
                  onSuccess?.()
                  onClose()
                  navigate('/manager/inventory', {
                    state: {
                      openAddModal: true,
                      autoFillData: unlinkedItemsWarning[0]
                    }
                  })
                }}
                className="btn-primary flex items-center gap-2 px-6"
              >
                Add Item to Inventory <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
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
                        <option key={po.id} value={po.id}>{po.poNumber} ({po.vendorName})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" /> Invoice Reference
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceReference}
                      onChange={(e) => setFormData({ ...formData, invoiceReference: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                      placeholder="e.g. INV-10023"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">GRN Notes</label>
                    <textarea
                      rows="1"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                      placeholder="Optional notes..."
                    />
                  </div>
                </div>

                {/* Line Items */}
                {selectedPoId && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="p-4 w-1/4">Item</th>
                            <th className="p-4 w-1/6">Ordered</th>
                            <th className="p-4 w-1/6">Remaining</th>
                            <th className="p-4 w-[15%]">Receiving Now</th>
                            <th className="p-4 w-[15%]">Condition</th>
                            <th className="p-4 w-1/5">Note (if diff/damaged)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {lineItems.map(item => (
                            <tr key={item.purchaseOrderItemId} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-4">
                                <span className="font-semibold text-gray-900 block">{item.itemName}</span>
                                <span className="text-xs text-gray-500">
                                  {item.previouslyReceived > 0 ? `${item.previouslyReceived} already received` : 'None received yet'}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="font-medium text-gray-700">{item.orderedQuantity} {item.unit}</span>
                              </td>
                              <td className="p-4">
                                <span className={`font-bold ${item.remainingToReceive > 0 ? 'text-brand' : 'text-green-600'}`}>
                                  {item.remainingToReceive} {item.unit}
                                </span>
                              </td>
                              <td className="p-4">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max={item.remainingToReceive * 2} // allow some over-delivery if needed
                                  value={item.receivedQuantity}
                                  onChange={(e) => handleLineItemChange(item.purchaseOrderItemId, 'receivedQuantity', e.target.value)}
                                  className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                />
                              </td>
                              <td className="p-4">
                                <select
                                  value={item.condition}
                                  onChange={(e) => handleLineItemChange(item.purchaseOrderItemId, 'condition', e.target.value)}
                                  className={`w-full px-2 py-1.5 text-sm rounded-lg outline-none border ${
                                    item.condition === 'GOOD' ? 'border-green-200 bg-green-50 text-green-700' :
                                    item.condition === 'DAMAGED' ? 'border-red-200 bg-red-50 text-red-700' :
                                    'border-amber-200 bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  <option value="GOOD">Good</option>
                                  <option value="DAMAGED">Damaged</option>
                                  <option value="EXPIRED">Expired</option>
                                  <option value="WRONG_ITEM">Wrong Item</option>
                                </select>
                              </td>
                              <td className="p-4">
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
          </>
        )}
      </div>
    </div>
  )
}
