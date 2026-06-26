import { useState, useEffect } from 'react'
import { X, UtensilsCrossed, Tag, Clock, FlaskConical, Pencil, Trash2, Plus, Check } from 'lucide-react'
import { saveMenuItemIngredientsAPI } from '../../../apis/kitchen/menu'
import { toast } from 'react-toastify'

// Status badge color map
const STATUS_STYLES = {
  ACTIVE:   'bg-green-50 text-green-600 border border-green-100',
  PENDING:  'bg-orange-50 text-orange-500 border border-orange-100',
  REJECTED: 'bg-red-50 text-red-500 border border-red-100',
  INACTIVE: 'bg-gray-100 text-gray-400 border border-gray-200',
}

/*
  MenuItemDetailModal
  -------------------
  Shows full details of a menu item and lets the chef manage its recipe ingredients.

  Props:
    isOpen         — controls visibility
    onClose        — called when modal is closed
    item           — the menu item object to display
    ingredients    — initial ingredient list fetched from backend
    inventoryItems — all inventory items (for the "add ingredient" dropdown)
    onSaved        — optional callback fired after a successful save (to refresh parent)
*/
const MenuItemDetailModal = ({ isOpen, onClose, item, ingredients = [], inventoryItems = [], onSaved }) => {

  // Local editable copy of the ingredient list.
  // All add / update / delete operations modify this list.
  // Nothing is sent to the backend until "Save Recipe" is clicked.
  const [editableIngredients, setEditableIngredients] = useState([])

  // Tracks which ingredient row is in edit mode (by inventoryItemId)
  const [editingId, setEditingId] = useState(null)
  const [editingQty, setEditingQty] = useState('')

  // "Add ingredient" row state
  const [selectedItemId, setSelectedItemId] = useState('')
  const [addQty, setAddQty] = useState('')

  const [isSaving, setIsSaving] = useState(false)

  // Re-sync editable list whenever the modal opens or the parent passes new ingredients
  useEffect(() => {
    setEditableIngredients(ingredients)
    setEditingId(null)
    setSelectedItemId('')
    setAddQty('')
  }, [ingredients, isOpen])

  if (!isOpen || !item) return null

  const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.INACTIVE

  // ── Inline edit: start editing a row ──────────────────────────────────
  const startEdit = (ing) => {
    setEditingId(ing.inventoryItemId)
    setEditingQty(String(ing.quantityRequired))
  }

  // Confirm inline edit — validates qty and updates local state
  const confirmEdit = () => {
    const qty = parseFloat(editingQty)
    if (!qty || qty <= 0) {
      // Invalid qty — cancel edit without applying
      setEditingId(null)
      return
    }
    setEditableIngredients((prev) =>
      prev.map((ing) =>
        ing.inventoryItemId === editingId
          ? { ...ing, quantityRequired: qty }
          : ing
      )
    )
    setEditingId(null)
  }

  // ── Delete: remove ingredient from local list ─────────────────────────
  const deleteIngredient = (inventoryItemId) => {
    setEditableIngredients((prev) =>
      prev.filter((ing) => ing.inventoryItemId !== inventoryItemId)
    )
    // If the row being deleted is currently in edit mode, cancel the edit
    if (editingId === inventoryItemId) setEditingId(null)
  }

  // ── Add: append a new ingredient to local list ────────────────────────
  const handleAdd = () => {
    if (!selectedItemId || !addQty || parseFloat(addQty) <= 0) return

    const invItem = inventoryItems.find((i) => String(i.id) === String(selectedItemId))
    if (!invItem) return

    // Prevent adding the same inventory item twice
    const alreadyAdded = editableIngredients.some(
      (ing) => String(ing.inventoryItemId) === String(selectedItemId)
    )
    if (alreadyAdded) {
      toast.warning('This ingredient is already in the recipe.')
      return
    }

    setEditableIngredients((prev) => [
      ...prev,
      {
        inventoryItemId: invItem.id,
        inventoryItemName: invItem.name,
        unit: invItem.unit,
        quantityRequired: parseFloat(addQty),
      },
    ])

    // Reset add-row inputs
    setSelectedItemId('')
    setAddQty('')
  }

  // ── Save: send full updated list to backend (full-replace) ────────────
  const handleSave = async () => {
    setIsSaving(true)
    const { error } = await saveMenuItemIngredientsAPI(item.id, editableIngredients)
    if (error) {
      toast.error('Failed to save recipe. Please try again.')
    } else {
      toast.success('Recipe saved successfully!')
      onSaved?.()
      onClose()
    }
    setIsSaving(false)
  }

  // Only show inventory items that haven't been added to the recipe yet
  const availableInventoryItems = inventoryItems.filter(
    (inv) => !editableIngredients.some((ing) => String(ing.inventoryItemId) === String(inv.id))
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-4xl border border-gray-100 bg-white shadow-2xl p-8">

        {/* ── Header row ─────────────────────────────────────────────── */}
        <div className="mb-6 flex items-start justify-between">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
            <UtensilsCrossed size={22} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* ── Title + status badge ────────────────────────────────────── */}
        <div className="mb-1 flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{item.name}</h2>
          <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black tracking-tighter uppercase ${statusStyle}`}>
            {item.status}
          </span>
        </div>

        {/* ── Category ───────────────────────────────────────────────── */}
        <div className="mb-4 flex items-center gap-1 text-xs text-gray-400">
          <Tag size={11} />
          <span>{item.categoryName}</span>
          {item.subCategory && <span>· {item.subCategory}</span>}
        </div>

        {/* ── Scrollable section: item info + ingredient table ───────── */}
        {/* The add-row and footer buttons live OUTSIDE this div so they   */}
        {/* are never clipped by the scrollbar.                            */}
        <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-4">

          {/* Item image */}
          <div className="h-36 w-full rounded-2xl overflow-hidden bg-gray-100">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300 text-sm">
                No Image
              </div>
            )}
          </div>

          {/* Price + prep time */}
          <div className="flex gap-3">
            <div className="flex-1 rounded-2xl bg-gray-50 p-3">
              <p className="text-xs text-gray-400 mb-1">Price</p>
              <p className="text-base font-black text-orange-600">Rs. {parseFloat(item.price).toFixed(2)}</p>
            </div>
            <div className="flex-1 rounded-2xl bg-gray-50 p-3">
              <p className="text-xs text-gray-400 mb-1">Prep Time</p>
              <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                <Clock size={14} className="text-orange-500" />
                <span>{item.preparationTime} min</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="rounded-2xl bg-gray-50 p-3">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* ── Recipe Ingredients section header ──────────────────────── */}
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-orange-100 p-1.5 text-orange-600">
              <FlaskConical size={13} />
            </div>
            <p className="text-sm font-bold text-gray-800">Recipe Ingredients</p>
            {editableIngredients.length > 0 && (
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-500">
                {editableIngredients.length} items
              </span>
            )}
          </div>

          {/* Ingredient table */}
          {editableIngredients.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-4 text-center text-sm text-gray-400">
              No ingredients linked yet. Add one below.
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-400">
                    <th className="px-3 py-2.5 text-left font-semibold">Ingredient</th>
                    <th className="px-3 py-2.5 text-center font-semibold">Qty</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Unit</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {editableIngredients.map((ing) => (
                    <tr key={ing.inventoryItemId} className="hover:bg-gray-50/60">

                      {/* Ingredient name */}
                      <td className="px-3 py-2.5 font-medium text-gray-800">
                        {ing.inventoryItemName}
                      </td>

                      {/* Quantity — switches to an input when this row is in edit mode */}
                      <td className="px-3 py-2.5 text-center">
                        {editingId === ing.inventoryItemId ? (
                          <input
                            type="number"
                            value={editingQty}
                            onChange={(e) => setEditingQty(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && confirmEdit()}
                            autoFocus
                            min="0.001"
                            step="0.001"
                            className="w-16 rounded-lg border border-orange-300 bg-orange-50 px-2 py-1 text-center text-xs font-bold text-orange-700 outline-none focus:ring-2 focus:ring-orange-500/20"
                          />
                        ) : (
                          <span className="font-bold text-gray-700">{ing.quantityRequired}</span>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="px-3 py-2.5 text-right text-gray-400">{ing.unit}</td>

                      {/* Edit / confirm + delete — styled as small icon buttons */}
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {editingId === ing.inventoryItemId ? (
                            // Confirm qty edit
                            <button onClick={confirmEdit} title="Confirm"
                              className="flex items-center justify-center rounded-lg bg-green-50 p-1.5 text-green-500 hover:bg-green-100 hover:text-green-700 transition-colors">
                              <Check size={13} />
                            </button>
                          ) : (
                            // Open qty edit
                            <button onClick={() => startEdit(ing)} title="Edit quantity"
                              className="flex items-center justify-center rounded-lg bg-orange-50 p-1.5 text-orange-400 hover:bg-orange-100 hover:text-orange-600 transition-colors">
                              <Pencil size={13} />
                            </button>
                          )}
                          {/* Remove ingredient from local list */}
                          <button onClick={() => deleteIngredient(ing.inventoryItemId)} title="Remove"
                            className="flex items-center justify-center rounded-lg bg-red-50 p-1.5 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* ── Add ingredient row — fixed below scroll, never clipped ──── */}
        <div className="flex gap-2 mb-4">
          {/* Only show inventory items not already in the recipe */}
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="flex-1 min-w-0 rounded-xl bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="">Select ingredient</option>
            {availableInventoryItems.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.name} ({inv.unit})
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Qty"
            value={addQty}
            onChange={(e) => setAddQty(e.target.value)}
            min="0.001"
            step="0.001"
            className="w-16 shrink-0 rounded-xl bg-gray-50 px-2 py-2.5 text-center text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
          />

          {/* Appends to local list — not saved until "Save Recipe" is clicked */}
          <button onClick={handleAdd}
            className="shrink-0 flex items-center gap-1 rounded-xl bg-orange-500 px-3 py-2.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors">
            <Plus size={13} /> Add
          </button>
        </div>

        {/* ── Footer: save + close ────────────────────────────────────── */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 rounded-2xl bg-gray-100 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors">
            Close
          </button>
          {/* Sends the full updated ingredient list to the backend */}
          <button onClick={handleSave} disabled={isSaving}
            className="flex-1 rounded-2xl bg-orange-500 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-gray-300 transition-colors">
            {isSaving ? 'Saving...' : 'Save Recipe'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default MenuItemDetailModal
