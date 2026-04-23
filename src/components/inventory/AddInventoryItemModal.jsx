import { useState } from 'react'
import Modal from '../ui/Modal'

const CATEGORIES = [
  'Spices',
  'Beverages',
  'Dairy',
  'Vegetables',
  'Grains',
  'Meat',
]

const UNITS = ['kg', 'g', 'Liters', 'Pcs', 'Balls']

const INITIAL_FORM = {
  name: '',
  category: '',
  unit: 'kg',
  initialQuantity: '',
  unitPrice: '',
  lowStockThreshold: '',
}

export default function AddInventoryItemModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    const success = await onSave({
      name: form.name,
      category: form.category,
      quantity: parseFloat(form.initialQuantity) || 0,
      unit: form.unit,
      reorderLevel: parseFloat(form.lowStockThreshold) || 0,
      unitPrice: parseFloat(form.unitPrice) || 0,
    })

    setIsSaving(false)
    if (success) {
      setIsSuccess(true)
    }
  }

  const handleClose = () => {
    setForm(INITIAL_FORM)
    setIsSuccess(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={!isSuccess ? 'Add New Inventory Item' : ''}
    >
      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Name */}
          <div>
            <label htmlFor="item-name" className="modal-label">
              Item Name
            </label>
            <input
              id="item-name"
              type="text"
              className="modal-input"
              placeholder="e.g., Premium Pizza Flour"
              value={form.name}
              onChange={handleChange('name')}
              required
            />
          </div>

          {/* Category + Unit (side by side) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="item-category" className="modal-label">
                Category
              </label>
              <select
                id="item-category"
                className="modal-select"
                value={form.category}
                onChange={handleChange('category')}
                required
              >
                <option value="" disabled>
                  Select Category
                </option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="item-unit" className="modal-label">
                Unit
              </label>
              <select
                id="item-unit"
                className="modal-select"
                value={form.unit}
                onChange={handleChange('unit')}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Initial Quantity + Unit Price (side by side) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="item-quantity" className="modal-label">
                Initial Quantity
              </label>
              <input
                id="item-quantity"
                type="number"
                step="0.01"
                min="0"
                className="modal-input"
                placeholder="0.00"
                value={form.initialQuantity}
                onChange={handleChange('initialQuantity')}
              />
            </div>

            <div>
              <label htmlFor="item-price" className="modal-label">
                Unit Price (Rs.)
              </label>
              <input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                className="modal-input"
                placeholder="0.00"
                value={form.unitPrice}
                onChange={handleChange('unitPrice')}
              />
            </div>
          </div>

          {/* Low Stock Threshold */}
          <div>
            <label htmlFor="item-threshold" className="modal-label">
              Low Stock Threshold
            </label>
            <input
              id="item-threshold"
              type="number"
              step="0.01"
              min="0"
              className="modal-input"
              placeholder="e.g., 5.00"
              value={form.lowStockThreshold}
              onChange={handleChange('lowStockThreshold')}
            />
            <p className="text-xs text-brand mt-2">
              System will alert when stock falls below this level.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              id="add-item-cancel-btn"
              type="button"
              onClick={handleClose}
              className="px-8 py-2.5 rounded-full border border-brand text-brand text-sm font-semibold hover:bg-brand-light transition-colors"
            >
              Cancel
            </button>
            <button
              id="add-item-save-btn"
              type="submit"
              disabled={isSaving}
              className="px-8 py-2.5 rounded-full bg-brand text-white text-sm font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center text-center py-6 animate-scaleIn">
          <img
            src="/assets/success_mark.png"
            alt="Success"
            className="w-24 h-24 mb-6"
          />

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            New Inventory Item Added!
          </h2>

          <p className="text-gray-500 text-sm mb-8 max-w-[300px] leading-relaxed">
            "The Item Is Now Available In Your Catalog. You Can Continue Adding
            More Products Or View The Updated List Now."
          </p>

          <button
            onClick={handleClose}
            className="px-12 py-3 rounded-full bg-brand text-white font-bold hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20"
          >
            Finish
          </button>
        </div>
      )}
    </Modal>
  )
}
