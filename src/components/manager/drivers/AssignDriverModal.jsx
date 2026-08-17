import { useState } from 'react'
import { z } from 'zod'
import Modal from '../ui/Modal'

export default function AssignDriverModal({
  isOpen,
  onClose,
  order,
  availableDrivers,
  onConfirm,
}) {
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrors({})
    
    const assignSchema = z.object({
      driverId: z.string().min(1, 'Please select a driver'),
    })

    const result = assignSchema.safeParse({ driverId: selectedDriverId })

    if (!result.success) {
      setErrors({ driverId: result.error.issues[0].message })
      return
    }

    onConfirm(order?.orderId, Number(selectedDriverId))
    setSelectedDriverId('')
  }

  const handleClose = () => {
    setSelectedDriverId('')
    setErrors({})
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Driver"
      subtitle={`Select a driver for order ${order?.id || ''}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Order summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">{order?.id}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {order?.customerName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{order?.zone}</p>
            </div>
          </div>
        </div>

        {/* Driver selector */}
        <div>
          <label htmlFor="driver-select" className="modal-label">
            Available Driver
          </label>
          <select
            id="driver-select"
            className="modal-select"
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a driver
            </option>
            {availableDrivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
          {errors.driverId && <p className="text-red-500 text-xs mt-1">{errors.driverId}</p>}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            id="assign-driver-cancel-btn"
            type="button"
            onClick={handleClose}
            className="px-8 py-2.5 rounded-full border border-brand text-brand text-sm font-semibold hover:bg-brand-light transition-colors"
          >
            Cancel
          </button>
          <button
            id="assign-driver-confirm-btn"
            type="submit"
            className="px-8 py-2.5 rounded-full bg-brand text-white text-sm font-semibold hover:bg-brand-hover transition-colors"
          >
            Assign Driver
          </button>
        </div>
      </form>
    </Modal>
  )
}
