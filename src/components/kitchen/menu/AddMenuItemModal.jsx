import { useState, useEffect } from 'react'
import { UtensilsCrossed, X } from 'lucide-react'
import { toast } from 'react-toastify'
import IngredientPicker from './IngredientPicker'
import CloudinaryImageUpload from './CloudinaryImageUpload'
import Dropdown from '../../common/Dropdown'

// AddMenuItemModal — lets a chef submit a new menu item (lands in PENDING status)
// After the item is created, the parent saves the ingredient list using the returned item ID
const AddMenuItemModal = ({ isOpen, onClose, onSubmit, categories = [], inventoryItems = [] }) => {
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

  // Reset form and ingredients every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        name: '',
        description: '',
        categoryId: '',
        subCategory: '',
        price: '',
        preparationTime: '',
        imageUrl: '',
      })
      setIngredients([])
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.categoryId || !form.price || !form.preparationTime || !form.subCategory) {
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

    // Build payload matching CreateMenuItemRequest on the backend
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
    // Pass both the item payload and the ingredient list to the parent
    // Parent will create the item first, then save ingredients using the returned ID
    await onSubmit(payload, ingredients)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-4xl shadow-2xl p-6 border border-gray-100 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-orange-100 text-orange-600 rounded-2xl">
            <UtensilsCrossed size={20} />
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-0.5">Add Menu Item</h3>
        <p className="text-gray-400 text-xs mb-4">
          Your item will be submitted for admin approval before going live.
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
          <Dropdown
            value={form.categoryId}
            onChange={(val) => setForm((prev) => ({ ...prev, categoryId: val }))}
            options={categories.map((cat) => ({ value: String(cat.id), label: cat.name }))}
            placeholder="Select Category *"
          />
          <input
            type="text"
            name="subCategory"
            placeholder="Sub-category (e.g. Starters) *"
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
          <CloudinaryImageUpload
            value={form.imageUrl}
            onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))}
          />

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" />

          {/* Ingredient picker — optional, chef can add recipe ingredients */}
          <IngredientPicker
            ingredients={ingredients}
            inventoryItems={inventoryItems}
            onChange={setIngredients}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer py-3 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
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
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddMenuItemModal
