import { useState, useEffect } from 'react'
import { UtensilsCrossed, X } from 'lucide-react'
import { toast } from 'react-toastify'

// AddMenuItemModal — lets a chef submit a new menu item (lands in PENDING status)
// categories prop is derived from existing items in the parent (since CHEF can't hit /api/v1/categories)
const AddMenuItemModal = ({ isOpen, onClose, onSubmit, categories = [] }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    subCategory: '',
    price: '',
    preparationTime: '',
    imageUrl: '',
  })
  const [loading, setLoading] = useState(false)

  // Reset form fields every time the modal opens
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
    }
  }, [isOpen])

  // Don't render anything if modal is closed
  if (!isOpen) return null

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    // Basic required field validation
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

    // Build the payload that matches CreateMenuItemRequest on the backend
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
    await onSubmit(payload)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-4xl shadow-2xl p-8 border border-gray-100 max-h-[90vh] overflow-y-auto">

        {/* Header: icon + close button */}
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
            <UtensilsCrossed size={24} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-1">Add Menu Item</h3>
        <p className="text-gray-400 text-sm mb-6">
          Your item will be submitted for admin approval before going live.
        </p>

        {/* Form fields */}
        <div className="flex flex-col gap-3 mb-8">

          {/* Item name — required */}
          <input
            type="text"
            name="name"
            placeholder="Item Name *"
            value={form.name}
            onChange={handleChange}
            className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
          />

          {/* Description — optional */}
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
          />

          {/* Category dropdown — derived from existing menu items */}
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="">Select Category *</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Sub-category — optional free text */}
          <input
            type="text"
            name="subCategory"
            placeholder="Sub-category (optional, e.g. Starters)"
            value={form.subCategory}
            onChange={handleChange}
            className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
          />

          {/* Price and prep time side by side */}
          <div className="flex gap-3">
            <input
              type="number"
              name="price"
              placeholder="Price (Rs.) *"
              value={form.price}
              onChange={handleChange}
              min="0"
              className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <input
              type="number"
              name="preparationTime"
              placeholder="Prep time (min) *"
              value={form.preparationTime}
              onChange={handleChange}
              min="1"
              className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Image URL — optional, Cloudinary/S3 upload to be added later */}
          <input
            type="text"
            name="imageUrl"
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChange={handleChange}
            className="w-full p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-4 text-sm font-bold text-white rounded-2xl transition-all shadow-lg ${
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
