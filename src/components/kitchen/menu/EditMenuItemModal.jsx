import { useState, useEffect } from 'react'
import { Pencil, X } from 'lucide-react'
import { toast } from 'react-toastify'
import IngredientPicker from './IngredientPicker'

// EditMenuItemModal — lets a chef edit their PENDING or REJECTED menu items
// existingIngredients are pre-loaded by the parent when the chef clicks a card
const EditMenuItemModal = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  categories = [],
  inventoryItems = [],
  existingIngredients = [],
}) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    subCategory: '',
    price: '',
    preparationTime: '',
    imageUrl: '',
  })
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(false)

  // Pre-fill form and ingredients whenever the modal opens or selected item changes
  useEffect(() => {
    if (isOpen && item) {
      setForm({
        name: item.name || '',
        description: item.description || '',
        categoryId: item.categoryId ? String(item.categoryId) : '',
        subCategory: item.subCategory || '',
        price: item.price ? String(item.price) : '',
        preparationTime: item.preparationTime ? String(item.preparationTime) : '',
        imageUrl: item.imageUrl || '',
      })
      // Pre-fill ingredient list from what was saved previously
      setIngredients(existingIngredients)
    }
  }, [isOpen, item, existingIngredients])

  if (!isOpen) return null

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.categoryId || !form.price || !form.preparationTime) {
      toast.warning('Please fill in all required fields!')
      return
    }
    if (parseFloat(form.price) <= 0) {
      toast.error('Price must be greater than zero.')
      return
    }
    if (parseInt(form.preparationTime) <= 0) {
      toast.error('Preparation time must be greater than zero.')
      return
    }

    // Build payload matching UpdateMenuItemRequest on the backend
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      categoryId: parseInt(form.categoryId),
      subCategory: form.subCategory.trim() || null,
      price: parseFloat(form.price),
      preparationTime: parseInt(form.preparationTime),
      imageUrl: form.imageUrl.trim() || null,
    }

    setLoading(true)
    // Pass item ID, updated payload, and updated ingredient list to the parent
    await onSubmit(item.id, payload, ingredients)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-4xl shadow-2xl p-6 border border-gray-100 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-orange-100 text-orange-600 rounded-2xl">
            <Pencil size={20} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-0.5">Edit Menu Item</h3>

        {/* Rejection warning banner */}
        {item?.status === 'REJECTED' && (
          <div className="my-2 rounded-2xl bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-500 font-semibold">
            This item was rejected — update and resubmit for approval.
          </div>
        )}

        <p className="text-gray-400 text-xs mb-4">
          Changes will be resubmitted to admin for approval.
        </p>

        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            name="name"
            placeholder="Item Name *"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
          />
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="">Select Category *</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="text"
            name="subCategory"
            placeholder="Sub-category (optional, e.g. Starters)"
            value={form.subCategory}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          <div className="flex gap-2">
            <input
              type="number"
              name="price"
              placeholder="Price (Rs.) *"
              value={form.price}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <input
              type="number"
              name="preparationTime"
              placeholder="Prep time (min) *"
              value={form.preparationTime}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <input
            type="text"
            name="imageUrl"
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
          />

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" />

          {/* Ingredient picker — pre-filled with existing recipe */}
          <IngredientPicker
            ingredients={ingredients}
            inventoryItems={inventoryItems}
            onChange={setIngredients}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-3 text-sm font-bold text-white rounded-2xl transition-all shadow-lg ${
              loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 cursor-pointer'
            }`}
          >
            {loading ? 'Saving...' : 'Save & Resubmit'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default EditMenuItemModal
