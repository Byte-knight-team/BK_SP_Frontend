import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../ui/Modal'
import { nameSchema, quantitySchema, priceSchema } from '../../../utils/validators'

const CATEGORIES = [
  'Spices',
  'Beverages',
  'Dairy',
  'Vegetables',
  'Grains',
  'Meat',
]

const UNITS = ['kg', 'g', 'Liters', 'Pcs', 'Balls']

const schema = z.object({
  name: nameSchema,
  category: z.string().min(1, 'Category is required'),
  customCategory: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  initialQuantity: quantitySchema,
  unitPrice: priceSchema,
  lowStockThreshold: quantitySchema,
}).superRefine((data, ctx) => {
  if (data.category === 'Other' && (!data.customCategory || data.customCategory.trim() === '')) {
    ctx.addIssue({
      path: ['customCategory'],
      message: 'Custom category is required',
      code: z.ZodIssueCode.custom,
    });
  }
});

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
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      category: '',
      customCategory: '',
      unit: 'kg',
      initialQuantity: '',
      unitPrice: '',
      lowStockThreshold: '',
    },
  })

  const [isSuccess, setIsSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const allCategories = Array.from(new Set([...CATEGORIES, ...existingCategories]))
  const categoryValue = watch('category')

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({ ...initialData, customCategory: '' })
      } else {
        reset({
          name: '',
          category: '',
          customCategory: '',
          unit: 'kg',
          initialQuantity: '',
          unitPrice: '',
          lowStockThreshold: '',
        })
      }
      setIsSuccess(false)
      setIsSaving(false)
    }
  }, [isOpen, initialData, reset])

  const onSubmit = async (data) => {
    setIsSaving(true)

    const finalCategory = data.category === 'Other' ? data.customCategory.trim() : data.category

    const success = await onSave({
      name: data.name,
      category: finalCategory,
      quantity: data.initialQuantity,
      unit: data.unit,
      reorderLevel: data.lowStockThreshold,
      unitPrice: data.unitPrice,
    })

    setIsSaving(false)
    if (success) {
      setIsSuccess(true)
    }
  }

  const handleClose = () => {
    reset()
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
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
                {...register('category')}
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
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
              
              {categoryValue === 'Other' && (
                <div>
                  <input
                    type="text"
                    className="modal-input mt-3"
                    placeholder="Type new category..."
                    {...register('customCategory')}
                  />
                  {errors.customCategory && <p className="mt-1 text-sm text-red-500">{errors.customCategory.message}</p>}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="item-unit" className="modal-label">
                Unit
              </label>
              <select
                id="item-unit"
                className="modal-select"
                {...register('unit')}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              {errors.unit && <p className="mt-1 text-sm text-red-500">{errors.unit.message}</p>}
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
                {...register('initialQuantity')}
              />
              {errors.initialQuantity && <p className="mt-1 text-sm text-red-500">{errors.initialQuantity.message}</p>}
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
                {...register('unitPrice')}
              />
              {errors.unitPrice && <p className="mt-1 text-sm text-red-500">{errors.unitPrice.message}</p>}
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
              {...register('lowStockThreshold')}
            />
            {errors.lowStockThreshold && <p className="mt-1 text-sm text-red-500">{errors.lowStockThreshold.message}</p>}
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
