import { useState, useEffect } from 'react'
import { X, Building2, Phone, Mail, MapPin, Tag } from 'lucide-react'
import { toast } from 'react-toastify'
import { ProcurementService } from '../../../apis/manager/ProcurementService'

export default function VendorModal({ isOpen, onClose, vendorToEdit, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    category: '',
  })

  useEffect(() => {
    if (vendorToEdit) {
      setFormData({
        name: vendorToEdit.name || '',
        contactPerson: vendorToEdit.contactPerson || '',
        phone: vendorToEdit.phone || '',
        email: vendorToEdit.email || '',
        address: vendorToEdit.address || '',
        category: vendorToEdit.category || '',
      })
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        category: '',
      })
    }
  }, [vendorToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (vendorToEdit) {
        await ProcurementService.updateVendor(vendorToEdit.id, formData)
        toast.success('Vendor updated successfully')
      } else {
        await ProcurementService.createVendor(formData)
        toast.success('Vendor created successfully')
      }
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error(error.message || 'Failed to save vendor')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {vendorToEdit ? 'Edit Vendor' : 'Add New Vendor'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {vendorToEdit ? 'Update vendor details.' : 'Register a new supplier.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" /> Vendor Name *
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
              placeholder="e.g. Fresh Farms Co."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" /> Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" /> Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
              placeholder="contact@freshfarms.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" /> Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
              placeholder="123 Farm Lane, Rural County"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" /> Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
            >
              <option value="">Select Category...</option>
              <option value="Produce">Produce (Veg & Fruits)</option>
              <option value="Meat & Poultry">Meat & Poultry</option>
              <option value="Dairy">Dairy</option>
              <option value="Dry Goods">Dry Goods</option>
              <option value="Beverages">Beverages</option>
              <option value="Packaging">Packaging</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
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
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Saving...' : vendorToEdit ? 'Save Changes' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
