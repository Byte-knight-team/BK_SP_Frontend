import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PackagePlus, X } from 'lucide-react'
import { inventoryRequestSchema } from '../../../schemas/inventoryRequestSchema'
import { FormInput } from '../../common/formComponents/FormInput'
import { FormTextarea } from '../../common/formComponents/FormTextarea'
import { Modal } from '../../common/Modal'

const InventoryRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  requestType,
  initialItemName,
  initialUnit,
}) => {
  const isRefill = requestType === 'REFILL_STOCK'

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(inventoryRequestSchema),
    defaultValues: {
      itemName: '',
      unit: '',
      requestedQuantity: '',
      chefNote: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        itemName: initialItemName || '',
        unit: initialUnit || '',
        requestedQuantity: '',
        chefNote: '',
      })
    }
  }, [isOpen, initialItemName, initialUnit, reset])

  if (!isOpen) return null

  const onFormSubmit = (data) => {
    const requestData = {
      ...data,
      requestedQuantity: parseFloat(data.requestedQuantity),
      requestType: requestType,
      itemName: isRefill ? initialItemName : data.itemName,
      unit: isRefill ? initialUnit : data.unit,
    }
    onSubmit(requestData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isRefill ? `Request Refill: ${initialItemName}` : 'Request New Item'
      }
      description={
        isRefill
          ? `Specify the quantity needed in ${initialUnit}.`
          : 'Enter the details for the new item request.'
      }
      icon={PackagePlus}
      maxWidth="max-w-2xl"
    >
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className="flex flex-col gap-4"
      >
        {!isRefill && (
          <div className="flex flex-col gap-4">
            <FormInput
              name="itemName"
              control={control}
              label="Item Name"
              placeholder="e.g. Garlic"
            />
            <FormInput
              name="unit"
              control={control}
              label="Unit"
              placeholder="e.g. kg, Liters, Pcs"
            />
          </div>
        )}
        <FormInput
          name="requestedQuantity"
          control={control}
          type="number"
          step="0.01"
          label={`Requested Quantity ${isRefill ? `(${initialUnit})` : ''}`}
          placeholder="0.00"
        />
        <FormTextarea
          name="chefNote"
          control={control}
          label="Additional Note (Optional)"
          placeholder="Why do you need this?"
          rows={3}
        />

        <div className="mt-4 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl py-4 text-sm font-bold text-gray-400 transition-all hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-orange-500 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 active:scale-95"
          >
            Send Request
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default InventoryRequestModal
