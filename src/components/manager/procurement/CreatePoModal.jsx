import { useState, useEffect } from 'react'
import { X, Search, Plus, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { ProcurementService } from '../../../apis/manager/ProcurementService'
import { InventoryService } from '../../../apis/manager/InventoryService'
import { useAuth } from '../../../context/AuthContext'

export default function CreatePoModal({ isOpen, onClose, vendors, onSuccess }) {
  const { user } = useAuth()
  const branchId = user?.branchId

  const [loading, setLoading] = useState(false)
  const [inventoryItems, setInventoryItems] = useState([])
  
  const [formData, setFormData] = useState({
    vendorId: '',
    expectedDeliveryDate: '',
    notes: '',
  })
  
  const [lineItems, setLineItems] = useState([
    { id: Date.now(), inventoryItemId: '', itemName: '', orderedQuantity: '', unit: 'kg', agreedUnitPrice: '' }
  ])

  // Fetch inventory items on mount to populate the item dropdown
  useEffect(() => {
    if (isOpen && branchId) {
      InventoryService.getAllItems(branchId)
        .then((data) => setInventoryItems(data))
        .catch((err) => console.error('Failed to load inventory items', err))
    }
  }, [isOpen, branchId])

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setFormData({ vendorId: '', expectedDeliveryDate: '', notes: '' })
      setLineItems([{ id: Date.now(), inventoryItemId: '', itemName: '', orderedQuantity: '', unit: 'kg', agreedUnitPrice: '' }])
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now(), inventoryItemId: '', itemName: '', orderedQuantity: '', unit: 'kg', agreedUnitPrice: '' }
    ])
  }

  const handleRemoveLineItem = (id) => {
    if (lineItems.length === 1) return
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const handleLineItemChange = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        
        // Auto-fill item name and unit if user selects an existing inventory item
        if (field === 'inventoryItemId' && value !== '') {
          const selectedInv = inventoryItems.find(inv => inv.id.toString() === value)
          if (selectedInv) {
            updated.itemName = selectedInv.name
            updated.unit = selectedInv.unit || 'kg'
          }
        }
        return updated
      }
      return item
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.vendorId) return toast.error('Please select a vendor')
    if (lineItems.some(item => !item.itemName || !item.orderedQuantity || !item.unit)) {
      return toast.error('Please fill all required fields for line items (Name, Qty, Unit)')
    }

    setLoading(true)
    try {
      const payload = {
        vendorId: parseInt(formData.vendorId),
        expectedDeliveryDate: formData.expectedDeliveryDate || null,
        notes: formData.notes || '',
        items: lineItems.map(item => ({
          inventoryItemId: item.inventoryItemId ? parseInt(item.inventoryItemId) : null,
          itemName: item.itemName,
          orderedQuantity: parseFloat(item.orderedQuantity),
          unit: item.unit,
          agreedUnitPrice: item.agreedUnitPrice ? parseFloat(item.agreedUnitPrice) : null
        }))
      }

      await ProcurementService.createPurchaseOrder(payload)
      toast.success('Purchase Order created successfully')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error(error.message || 'Failed to create PO')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Purchase Order</h2>
            <p className="text-sm text-gray-500 mt-1">Draft a new order to send to a vendor.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-po-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Vendor *</label>
                <select
                  required
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                >
                  <option value="">Select a vendor...</option>
                  {vendors?.filter(v => v.active).map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" /> Expected Delivery
                </label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" /> Internal Notes
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                  placeholder="e.g. Call vendor to confirm delivery time"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Line Items</h3>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="flex items-center gap-1.5 text-sm font-semibold text-brand bg-brand/10 hover:bg-brand/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl items-start sm:items-center relative">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
                      
                      {/* Catalog Item (Optional) */}
                      <div className="sm:col-span-3">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Catalog Link</label>
                        <select
                          value={item.inventoryItemId}
                          onChange={(e) => handleLineItemChange(item.id, 'inventoryItemId', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none"
                        >
                          <option value="">Not in catalog</option>
                          {inventoryItems.map(inv => (
                            <option key={inv.id} value={inv.id}>{inv.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Item Name */}
                      <div className="sm:col-span-3">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Item Name *</label>
                        <input
                          required
                          type="text"
                          value={item.itemName}
                          onChange={(e) => handleLineItemChange(item.id, 'itemName', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none"
                          placeholder="e.g. Tomatoes"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Qty *</label>
                        <input
                          required
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={item.orderedQuantity}
                          onChange={(e) => handleLineItemChange(item.id, 'orderedQuantity', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none"
                          placeholder="10"
                        />
                      </div>

                      {/* Unit */}
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Unit *</label>
                        <input
                          required
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleLineItemChange(item.id, 'unit', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none"
                          placeholder="kg"
                        />
                      </div>

                      {/* Unit Price (Optional) */}
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Unit Price (Rs)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.agreedUnitPrice}
                          onChange={(e) => handleLineItemChange(item.id, 'agreedUnitPrice', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg disabled:opacity-30 self-end sm:self-center"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
            form="create-po-form"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? 'Creating...' : <><CheckCircle2 className="w-4 h-4" /> Create PO</>}
          </button>
        </div>
      </div>
    </div>
  )
}
