import { useState, useMemo, useEffect, useRef } from 'react'
import Modal from '../ui/Modal'
import {
  Plus,
  Trash2,
  Pencil,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react'

// ─── Constants ──────────────────────────────────────────────────────
// Reusable category and unit lists (shared with AddInventoryItemModal)
const CATEGORIES = ['Spices', 'Beverages', 'Dairy', 'Vegetables', 'Grains', 'Meat']
const UNITS = ['kg', 'g', 'Liters', 'Pcs', 'Balls']

/**
 * Configuration for each update type card.
 * Defines the icon, labels, colors, and button text for each mode.
 */
const UPDATE_TYPES = {
  restock: {
    key: 'restock',
    icon: Plus,
    label: 'Restock (Add)',
    subtitle: 'Received new supplies',
    selectedBorder: 'border-green-500',
    selectedBg: 'bg-green-50',
    selectedText: 'text-green-600',
    buttonBg: 'bg-green-600 hover:bg-green-700',
    buttonLabel: 'Confirm Restock',
  },
  remove: {
    key: 'remove',
    icon: Trash2,
    label: 'Wastage (Remove)',
    subtitle: 'Spoiled or damaged items',
    selectedBorder: 'border-red-500',
    selectedBg: 'bg-red-50',
    selectedText: 'text-red-500',
    buttonBg: 'bg-red-600 hover:bg-red-700',
    buttonLabel: 'Confirm Removal',
  },
  correction: {
    key: 'correction',
    icon: Pencil,
    label: 'Correction (Set)',
    subtitle: 'Update Item Information',
    selectedBorder: 'border-brand',
    selectedBg: 'bg-brand-light',
    selectedText: 'text-brand',
    buttonBg: 'bg-brand hover:bg-brand-hover',
    buttonLabel: 'Confirm Correction',
  },
}

// ─── Status Badge (reused from CurrentStockTable pattern) ───────────
const STATUS_CONFIG = {
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    className: 'bg-amber-50 text-amber-600',
  },
  good: {
    label: 'Good',
    icon: CheckCircle,
    className: 'bg-green-50 text-green-600',
  },
}

// ─── Internal Sub-Components ────────────────────────────────────────

/**
 * Displays the selected item's name, category, current stock level,
 * and status badge at the top of the modal.
 */
function ItemInfoHeader({ item }) {
  const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.good
  const StatusIcon = statusConfig.icon

  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      {/* Left: Item name + category */}
      <div>
        <p className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-1">
          Item Name
        </p>
        <p className="text-2xl font-bold text-brand">{item.name}</p>
        <p className="text-xs font-bold tracking-wider text-gray-500 uppercase mt-3 mb-1">
          Category
        </p>
        <p className="text-base font-semibold text-gray-800">
          {item.category || 'Uncategorized'}
        </p>
      </div>

      {/* Right: Current stock level card */}
      <div className="border border-gray-200 rounded-xl px-5 py-3 min-w-[160px] text-center">
        <p className="text-sm text-gray-500 font-medium mb-1">
          Current Stock Level
        </p>
        <div className="flex items-center justify-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig.className}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </span>
          <span className="text-3xl font-extrabold text-gray-900">
            {item.stockLevel ?? 0}
          </span>
          <span className="text-sm text-gray-400 font-medium">
            {item.unit || 'kg'}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Three clickable cards for selecting the update type.
 * The selected card gets a colored border, background, and checkmark icon.
 */
function UpdateTypeSelector({ selectedType, onSelect }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-bold text-gray-800 mb-3">
        1. Select Update Type
      </p>
      <div className="grid grid-cols-3 gap-3">
        {Object.values(UPDATE_TYPES).map((type) => {
          const isSelected = selectedType === type.key
          const Icon = type.icon

          return (
            <button
              key={type.key}
              type="button"
              onClick={() => onSelect(type.key)}
              className={`relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? `${type.selectedBorder} ${type.selectedBg}`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {/* Checkmark icon in top-right corner when selected */}
              {isSelected && (
                <CheckCircle
                  className={`absolute top-2 right-2 w-4 h-4 ${type.selectedText}`}
                />
              )}

              {/* Card icon */}
              <Icon
                className={`w-5 h-5 mb-1.5 ${
                  isSelected ? type.selectedText : 'text-gray-400'
                }`}
              />

              {/* Card label */}
              <p
                className={`text-xs font-bold ${
                  isSelected ? type.selectedText : 'text-gray-700'
                }`}
              >
                {type.label}
              </p>

              {/* Card subtitle */}
              <p
                className={`text-[10px] mt-0.5 ${
                  isSelected ? type.selectedText : 'text-gray-400'
                }`}
              >
                {type.subtitle}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Placeholder shown when no update type is selected yet.
 * Prompts the manager to choose an action before proceeding.
 */
function EmptyStatePlaceholder() {
  return (
    <div className="border border-gray-200 rounded-xl p-10 text-center mb-6">
      <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-1">
        Select an Update Type
      </p>
      <p className="text-xs text-gray-400">
        Choose an update type to continue..
      </p>
    </div>
  )
}

/**
 * Restock form: Manager adds new stock to the inventory.
 * Shows fields for quantity, unit price, notes,
 * and auto-calculated "New Quantity" and "Total Cost".
 */
function RestockForm({ form, onChange, currentStock, unit }) {
  // Auto-calculate the projected new quantity after restocking
  const newQuantity = useMemo(() => {
    const current = parseFloat(currentStock) || 0
    const added = parseFloat(form.quantity) || 0
    return (current + added).toFixed(2)
  }, [currentStock, form.quantity])

  // Auto-calculate the total cost of the restock (quantity × unit price)
  const totalCost = useMemo(() => {
    const qty = parseFloat(form.quantity) || 0
    const price = parseFloat(form.unitPrice) || 0
    return (qty * price).toFixed(2)
  }, [form.quantity, form.unitPrice])

  return (
    <div className="space-y-4">
      {/* Added Quantity + Unit Price side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="restock-quantity" className="modal-label">
            Added Quantity
          </label>
          <input
            id="restock-quantity"
            type="number"
            step="0.01"
            min="0"
            className="modal-input"
            placeholder="0.00"
            value={form.quantity}
            onChange={onChange('quantity')}
            required
          />
        </div>
        <div>
          <label htmlFor="restock-price" className="modal-label">
            Unit Price(Rs.)
          </label>
          <input
            id="restock-price"
            type="number"
            step="0.01"
            min="0"
            className="modal-input"
            placeholder="0.00"
            value={form.unitPrice}
            onChange={onChange('unitPrice')}
          />
        </div>
      </div>

      {/* Update Notes textarea */}
      <div>
        <label htmlFor="restock-notes" className="modal-label">
          Update Notes
        </label>
        <textarea
          id="restock-notes"
          className="modal-input min-h-[100px] resize-none"
          placeholder="Add optional notes about this update.."
          value={form.notes}
          onChange={onChange('notes')}
        />
      </div>

      {/* Read-only calculated fields: New Quantity + Total Cost */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold tracking-wider text-brand uppercase mb-2">
            New Quantity
          </label>
          <input
            type="text"
            className="modal-input bg-gray-50 cursor-not-allowed"
            value={`${newQuantity}`}
            readOnly
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-wider text-brand uppercase mb-2">
            Total Cost
          </label>
          <input
            type="text"
            className="modal-input bg-gray-50 cursor-not-allowed"
            value={`${totalCost}`}
            readOnly
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Remove form: Manager removes damaged/spoiled stock.
 * Shows fields for quantity to remove, auto-calculated "New Quantity",
 * and a mandatory reason for the removal.
 */
function RemoveForm({ form, onChange, currentStock, unit }) {
  // Auto-calculate the projected new quantity after removal
  const newQuantity = useMemo(() => {
    const current = parseFloat(currentStock) || 0
    const removed = parseFloat(form.quantity) || 0
    const result = current - removed
    return Math.max(0, result).toFixed(2) // Prevent negative stock
  }, [currentStock, form.quantity])

  return (
    <div className="space-y-4">
      {/* Quantity to Remove + New Quantity side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="remove-quantity" className="modal-label">
            Quantity to Remove
          </label>
          <input
            id="remove-quantity"
            type="number"
            step="0.01"
            min="0"
            max={currentStock}
            className="modal-input"
            placeholder="0.00"
            value={form.quantity}
            onChange={onChange('quantity')}
            required
          />
        </div>
        <div>
          <label className="modal-label">New Quantity</label>
          <input
            type="text"
            className="modal-input bg-gray-50 cursor-not-allowed"
            value={`${newQuantity}`}
            readOnly
          />
        </div>
      </div>

      {/* Reason for Removal textarea (required) */}
      <div>
        <label htmlFor="remove-reason" className="modal-label">
          Reason for Removal
        </label>
        <textarea
          id="remove-reason"
          className="modal-input min-h-[120px] resize-none"
          placeholder="Briefly explain the reason for removal.."
          value={form.reason}
          onChange={onChange('reason')}
          required
        />
      </div>
    </div>
  )
}

/**
 * Correction form: Manager edits incorrect item details.
 * All fields are pre-filled with the current item data and fully editable.
 * This allows the manager to fix mistakes made during the initial "Add Item".
 */
function CorrectionForm({ form, onChange }) {
  return (
    <div className="space-y-4">
      {/* Item Name */}
      <div>
        <label htmlFor="correct-name" className="modal-label">
          Item Name
        </label>
        <input
          id="correct-name"
          type="text"
          className="modal-input"
          placeholder="e.g., Premium Pizza Flour"
          value={form.name}
          onChange={onChange('name')}
          required
        />
      </div>

      {/* Category + Unit side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="correct-category" className="modal-label">
            Category
          </label>
          <select
            id="correct-category"
            className="modal-select"
            value={form.category}
            onChange={onChange('category')}
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
          <label htmlFor="correct-unit" className="modal-label">
            Unit
          </label>
          <select
            id="correct-unit"
            className="modal-select"
            value={form.unit}
            onChange={onChange('unit')}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quantity + Unit Price side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="correct-quantity" className="modal-label">
            Quantity
          </label>
          <input
            id="correct-quantity"
            type="number"
            step="0.01"
            min="0"
            className="modal-input"
            placeholder="0.00"
            value={form.quantity}
            onChange={onChange('quantity')}
          />
        </div>
        <div>
          <label htmlFor="correct-price" className="modal-label">
            Unit Price (Rs.)
          </label>
          <input
            id="correct-price"
            type="number"
            step="0.01"
            min="0"
            className="modal-input"
            placeholder="0.00"
            value={form.unitPrice}
            onChange={onChange('unitPrice')}
          />
        </div>
      </div>

      {/* Reorder Level */}
      <div>
        <label htmlFor="correct-reorder" className="modal-label">
          Reorder Level
        </label>
        <input
          id="correct-reorder"
          type="number"
          step="0.01"
          min="0"
          className="modal-input"
          placeholder="e.g., 5.00"
          value={form.reorderLevel}
          onChange={onChange('reorderLevel')}
        />
        <p className="text-xs text-brand mt-2">
          System will alert when stock falls below this level.
        </p>
      </div>

      {/* Correction Notes textarea */}
      <div>
        <label htmlFor="correct-notes" className="modal-label">
          Correction Notes
        </label>
        <textarea
          id="correct-notes"
          className="modal-input min-h-[80px] resize-none"
          placeholder="Add optional notes about this correction.."
          value={form.notes}
          onChange={onChange('notes')}
        />
      </div>
    </div>
  )
}

// ─── Initial Form States ────────────────────────────────────────────
const RESTOCK_INITIAL = { quantity: '', unitPrice: '', notes: '' }
const REMOVE_INITIAL = { quantity: '', reason: '' }

// ─── Main Modal Component ───────────────────────────────────────────

/**
 * UpdateInventoryItemModal — The main modal for updating inventory items.
 *
 * Props:
 *   - isOpen: boolean — controls modal visibility
 *   - onClose: () => void — called when the modal is dismissed
 *   - item: object — the inventory item being updated (from CurrentStockTable row)
 *   - onUpdate: (updateType, itemId, formData) => Promise<boolean> — called on confirm
 */
export default function UpdateInventoryItemModal({
  isOpen,
  onClose,
  item,
  onUpdate,
}) {
  // Track which update type is currently selected (null = none)
  const [updateType, setUpdateType] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Separate form state for each update type
  const [restockForm, setRestockForm] = useState(RESTOCK_INITIAL)
  const [removeForm, setRemoveForm] = useState(REMOVE_INITIAL)
  const [correctionForm, setCorrectionForm] = useState({
    name: '',
    category: '',
    unit: 'kg',
    quantity: '',
    unitPrice: '',
    reorderLevel: '',
    notes: '',
  })
  
  const scrollRef = useRef(null)
  const [showScrollArrow, setShowScrollArrow] = useState(false)

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      setShowScrollArrow(scrollHeight > clientHeight && scrollHeight - scrollTop - clientHeight > 10)
    }
  }

  // Re-check scroll state when form changes
  useEffect(() => {
    setTimeout(handleScroll, 50)
  }, [updateType])

  /**
   * When the modal opens with a new item, reset all form states
   * and pre-fill the correction form with the item's current data.
   */
  useEffect(() => {
    if (isOpen && item) {
      setUpdateType(null)
      setRestockForm(RESTOCK_INITIAL)
      setRemoveForm(REMOVE_INITIAL)
      setCorrectionForm({
        name: item.name || '',
        category: item.category || '',
        unit: item.unit || 'kg',
        quantity: item.stockLevel ?? '',
        unitPrice: item.unitPrice ?? '',
        reorderLevel: item.reorderLevel ?? '',
        notes: '',
      })
    }
  }, [isOpen, item])

  // Reset everything when the modal closes
  const handleClose = () => {
    setUpdateType(null)
    setRestockForm(RESTOCK_INITIAL)
    setRemoveForm(REMOVE_INITIAL)
    onClose()
  }

  // Generic field change handler factory
  const createChangeHandler = (setter) => (field) => (e) => {
    setter((prev) => ({ ...prev, [field]: e.target.value }))
  }

  /**
   * Handle the confirm button click.
   * Delegates to the parent's onUpdate callback with the appropriate data.
   */
  const handleConfirm = async (e) => {
    e.preventDefault()
    if (!updateType || !item) return

    setIsSaving(true)

    let formData = {}
    if (updateType === 'restock') {
      formData = {
        quantity: parseFloat(restockForm.quantity) || 0,
        unitPrice: parseFloat(restockForm.unitPrice) || 0,
        notes: restockForm.notes,
      }
    } else if (updateType === 'remove') {
      formData = {
        quantity: parseFloat(removeForm.quantity) || 0,
        reason: removeForm.reason,
      }
    } else if (updateType === 'correction') {
      formData = {
        name: correctionForm.name,
        category: correctionForm.category,
        unit: correctionForm.unit,
        quantity: parseFloat(correctionForm.quantity) || 0,
        unitPrice: parseFloat(correctionForm.unitPrice) || 0,
        reorderLevel: parseFloat(correctionForm.reorderLevel) || 0,
        notes: correctionForm.notes,
      }
    }

    try {
      const success = await onUpdate(updateType, item.id, formData)
      if (success) {
        handleClose()
      }
    } catch (err) {
      console.error('Update failed:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Get the config for the currently selected update type (for button styling)
  const activeType = updateType ? UPDATE_TYPES[updateType] : null

  // Guard: don't render anything if there's no item
  if (!item) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Current Inventory Item"
      subtitle="Update the current Selected Inventory Item"
    >
      <form onSubmit={handleConfirm}>
        {/* ── Item Info Header ── */}
        <ItemInfoHeader item={item} />

        {/* ── Divider ── */}
        <div className="border-t border-gray-100 my-4" />

        {/* ── Update Type Selector ── */}
        <UpdateTypeSelector
          selectedType={updateType}
          onSelect={setUpdateType}
        />

        {/* ── Dynamic Form Area (keyed for smooth transition on type change) ── */}
        <div className="relative">
          <div 
            key={updateType || 'empty'} 
            className="animate-table-fade h-[360px] overflow-y-auto custom-scrollbar pr-2"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {!updateType && <EmptyStatePlaceholder />}

            {updateType === 'restock' && (
              <RestockForm
                form={restockForm}
                onChange={createChangeHandler(setRestockForm)}
                currentStock={item.stockLevel}
                unit={item.unit}
              />
            )}

            {updateType === 'remove' && (
              <RemoveForm
                form={removeForm}
                onChange={createChangeHandler(setRemoveForm)}
                currentStock={item.stockLevel}
                unit={item.unit}
              />
            )}

            {updateType === 'correction' && (
              <CorrectionForm
                form={correctionForm}
                onChange={createChangeHandler(setCorrectionForm)}
              />
            )}
          </div>
          
          {/* Scroll Indicator */}
          {showScrollArrow && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center bg-gradient-to-t from-white via-white/80 to-transparent pt-10 pb-2 pointer-events-none rounded-b-xl">
              <ChevronDown className="w-5 h-5 text-brand animate-bounce" />
            </div>
          )}
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            id="update-item-cancel-btn"
            type="button"
            onClick={handleClose}
            className="px-8 py-2.5 rounded-full border border-red-500 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>

          {/* Only show the confirm button when an update type is selected */}
          {activeType && (
            <button
              id="update-item-confirm-btn"
              type="submit"
              disabled={isSaving}
              className={`px-8 py-2.5 rounded-full text-white text-sm font-semibold transition-colors disabled:opacity-50 ${activeType.buttonBg}`}
            >
              {isSaving ? 'Saving...' : activeType.buttonLabel}
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
