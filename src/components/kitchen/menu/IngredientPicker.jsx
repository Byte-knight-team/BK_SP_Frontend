import { useState } from 'react'
import { Plus, Trash2, FlaskConical } from 'lucide-react'
import Dropdown from '../../common/Dropdown'

// IngredientPicker — lets the chef build a recipe by linking inventory items with quantities
// Props:
//   ingredients     — current list: [{ inventoryItemId, inventoryItemName, unit, quantityRequired }]
//   inventoryItems  — all available inventory items from the backend
//   onChange        — called with the updated ingredients list whenever it changes
const IngredientPicker = ({ ingredients = [], inventoryItems = [], onChange }) => {
  const [selectedItemId, setSelectedItemId] = useState('')
  const [quantity, setQuantity] = useState('')

  const handleAdd = () => {
    if (!selectedItemId || !quantity || parseFloat(quantity) <= 0) return

    // Find the full inventory item object so we can store name + unit for display
    const inventoryItem = inventoryItems.find((i) => String(i.id) === String(selectedItemId))
    if (!inventoryItem) return

    // Prevent adding the same inventory item twice
    const alreadyAdded = ingredients.some((ing) => String(ing.inventoryItemId) === String(selectedItemId))
    if (alreadyAdded) return

    const newIngredient = {
      inventoryItemId: inventoryItem.id,
      inventoryItemName: inventoryItem.name,
      unit: inventoryItem.unit,
      quantityRequired: parseFloat(quantity),
    }

    onChange([...ingredients, newIngredient])

    // Reset input fields after adding
    setSelectedItemId('')
    setQuantity('')
  }

  const handleRemove = (inventoryItemId) => {
    onChange(ingredients.filter((ing) => ing.inventoryItemId !== inventoryItemId))
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Section label */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
        <FlaskConical size={13} />
        Recipe Ingredients
      </div>

      {/* Current ingredient list */}
      {ingredients.length > 0 && (
        <div className="flex flex-col gap-2">
          {ingredients.map((ing) => (
            <div
              key={ing.inventoryItemId}
              className="flex items-center justify-between rounded-xl bg-orange-50 border border-orange-100 px-3 py-2"
            >
              <div className="text-xs font-bold text-gray-700">
                {ing.inventoryItemName}
                <span className="ml-2 font-normal text-gray-400">
                  {ing.quantityRequired} {ing.unit}
                </span>
              </div>
              <button
                onClick={() => handleRemove(ing.inventoryItemId)}
                className="cursor-pointer text-red-400 hover:text-red-600 transition"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new ingredient row */}
      <div className="flex gap-2">
        {/* Inventory item dropdown */}
        <div className="min-w-0 flex-1">
          <Dropdown
            value={selectedItemId}
            onChange={setSelectedItemId}
            options={inventoryItems.map((item) => ({ value: String(item.id), label: `${item.name} (${item.unit})` }))}
            placeholder="Select ingredient"
            compact
          />
        </div>

        {/* Quantity input */}
        <input
          type="number"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="0.001"
          step="0.001"
          className="w-20 px-3 py-2.5 bg-gray-50 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
        />

        {/* Add button */}
        <button
          onClick={handleAdd}
          className="flex cursor-pointer items-center gap-1 rounded-xl bg-orange-500 px-3 py-2.5 text-xs font-bold text-white hover:bg-orange-600 transition"
        >
          <Plus size={13} />
          Add
        </button>
      </div>

    </div>
  )
}

export default IngredientPicker
