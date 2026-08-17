import { useState, useEffect } from 'react'
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

/**
 * AddInventoryItemModal Component
 *
 * Provides a UI for managers to add new items to the branch's inventory.
 * Contains a controlled form to capture item details (name, category, price, threshold)
 * and handles the API submission state, showing a success screen upon completion.
 *
 * @param {boolean} isOpen - Controls whether the modal is visible.
 * @param {function} onClose - Callback function to close the modal.
 * @param {function} onSave - Async callback to process the form submission.
 */
export default function AddInventoryItemModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingCategories = [],
}) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [customCategory, setCustomCategory] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const allCategories = Array.from(new Set([...CATEGORIES, ...existingCategories]))

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({ ...INITIAL_FORM, ...initialData })
      } else {
        setForm(INITIAL_FORM)
      }
      setCustomCategory('')
      setIsSuccess(false)
      setIsSaving(false)
    }
  }, [isOpen, initialData])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    const finalCategory = form.category === 'Other' ? customCategory.trim() : form.category

    const success = await onSave({
      name: form.name,
      category: finalCategory,
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
    setCustomCategory('')
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
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">Other (Add New)</option>
              </select>
              {form.category === 'Other' && (
                <input
                  type="text"
                  className="modal-input mt-3"
                  placeholder="Type new category..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                />
              )}
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
            <p className="text-brand mt-2 text-xs">
              System will alert when stock falls below this level.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              id="add-item-cancel-btn"
              type="button"
              onClick={handleClose}
              className="border-brand text-brand hover:bg-brand-light rounded-full border px-8 py-2.5 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              id="add-item-save-btn"
              type="submit"
              disabled={isSaving}
              className="bg-brand hover:bg-brand-hover rounded-full px-8 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      ) : (
        <div className="animate-scaleIn flex flex-col items-center py-6 text-center">
          <img
            src="/assets/success_mark.png"
            alt="Success"
            className="mb-6 h-24 w-24"
          />

          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            New Inventory Item Added!
          </h2>

          <p className="mb-8 max-w-75 text-sm leading-relaxed text-gray-500">
            "The Item Is Now Available In Your Catalog. You Can Continue Adding
            More Products Or View The Updated List Now."
          </p>

          <button
            onClick={handleClose}
            className="bg-brand hover:bg-brand-hover shadow-brand/20 rounded-full px-12 py-3 font-bold text-white shadow-lg transition-colors"
          >
            Finish
          </button>
        </div>
      )}
    </Modal>
  )
}
